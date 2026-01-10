"""
PDF OCR Service for MBTI Assessment Results
Extracts MBTI results from PDF files using OpenAI Vision API
"""

import os
import base64
import io
from typing import Dict, Any, List, Optional
from pathlib import Path
import logging
import httpx

logger = logging.getLogger(__name__)

# Try to import required libraries
# Use PyMuPDF (fitz) instead of pdf2image - doesn't require poppler
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logger.warning("PyMuPDF (fitz) not available. Install with: pip install PyMuPDF")

try:
    from PIL import Image
    import io
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL (Pillow) not available. Install with: pip install Pillow")

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available. Install with: pip install openai")

# OpenAI configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")  # Use GPT-4o for vision
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))  # Lower temperature for structured extraction


class PDFOCRService:
    """Service for extracting MBTI results from PDF files using OCR"""

    def __init__(self):
        if not OPENAI_AVAILABLE:
            raise ValueError("OpenAI library is not installed. Install it with: pip install openai")
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        if not PYMUPDF_AVAILABLE:
            raise ValueError("PyMuPDF (fitz) library is not installed. Install it with: pip install PyMuPDF")
        if not PIL_AVAILABLE:
            raise ValueError("PIL (Pillow) library is not installed. Install it with: pip install Pillow")

        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self.max_tokens = OPENAI_MAX_TOKENS
        self.temperature = OPENAI_TEMPERATURE

    def _convert_pdf_to_images(self, pdf_bytes: bytes) -> List[bytes]:
        """
        Convert PDF to images (one per page) using PyMuPDF (fitz)
        Returns list of image bytes in PNG format
        """
        try:
            # Open PDF from bytes using PyMuPDF
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            image_bytes_list = []
            page_count = len(pdf_document)
            logger.info(f"PDF opened successfully, {page_count} pages found")
            
            for page_num in range(page_count):
                page = pdf_document[page_num]
                
                # Render page to image (pixmap) at 200 DPI
                # Matrix(2.78, 2.78) scales 72 DPI to 200 DPI (200/72 ≈ 2.78)
                zoom = 200 / 72  # 200 DPI
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat, alpha=False)  # alpha=False for RGB
                
                # Convert pixmap to PNG bytes directly
                img_bytes = pix.tobytes("png")
                
                # Ensure it's bytes
                if isinstance(img_bytes, bytes):
                    image_bytes_list.append(img_bytes)
                else:
                    image_bytes_list.append(bytes(img_bytes))
            
            pdf_document.close()
            logger.info(f"Converted PDF to {len(image_bytes_list)} images using PyMuPDF")
            return image_bytes_list
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to convert PDF to images: {str(e)}. Make sure the PDF file is valid and PyMuPDF is installed.")

    def _encode_image_to_base64(self, image_bytes: bytes) -> str:
        """Encode image bytes to base64 string for OpenAI API"""
        return base64.b64encode(image_bytes).decode('utf-8')

    async def _extract_text_from_image(self, image_bytes: bytes, page_num: int) -> Dict[str, Any]:
        """
        Extract text and structured data from a single PDF page image using OpenAI Vision
        """
        try:
            # Encode image to base64
            base64_image = self._encode_image_to_base64(image_bytes)
            
            # Prepare prompt for MBTI results extraction
            prompt = """Analysez cette image de résultats de test MBTI de 16Personalities.
Extrayez les informations suivantes au format JSON strict (sans markdown, juste le JSON):

{
  "mbti_type": "INTJ" ou "ENFP" etc. (4 lettres uniquement),
  "dimension_preferences": {
    "EI": {"E": 45, "I": 55},
    "SN": {"S": 30, "N": 70},
    "TF": {"T": 65, "F": 35},
    "JP": {"J": 75, "P": 25}
  },
  "description": "Description du type de personnalité si disponible",
  "strengths": ["Force 1", "Force 2", ...],
  "challenges": ["Défi 1", "Défi 2", ...]
}

Si une information n'est pas disponible, utilisez null ou une valeur par défaut.
Retournez UNIQUEMENT le JSON, sans texte avant ou après."""

            # Call OpenAI Vision API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            # Extract response text
            response_text = response.choices[0].message.content
            logger.info(f"OpenAI response for page {page_num}: {response_text[:200]}...")

            # Parse JSON from response (may have markdown code blocks)
            import json
            try:
                # Try to extract JSON from markdown code blocks if present
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()

                extracted_data = json.loads(response_text)
                return extracted_data
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from OpenAI response: {e}")
                logger.error(f"Response text: {response_text}")
                raise ValueError(f"Failed to parse extracted data as JSON: {str(e)}")

        except Exception as e:
            logger.error(f"Error extracting text from image (page {page_num}): {str(e)}", exc_info=True)
            raise ValueError(f"Failed to extract text from PDF page {page_num}: {str(e)}")

    async def download_pdf_from_url(self, url: str) -> bytes:
        """
        Download PDF from a 16Personalities profile URL
        Note: 16Personalities may require authentication or the profile may need to be public
        """
        try:
            # Validate URL
            if not url.startswith('https://www.16personalities.com/profiles/'):
                raise ValueError(f"Invalid 16Personalities URL. Expected format: https://www.16personalities.com/profiles/...")
            
            # Extract profile ID from URL
            profile_id = url.split('/profiles/')[-1].split('/')[0].split('?')[0]
            if not profile_id:
                raise ValueError("Could not extract profile ID from URL")
            
            logger.info(f"Attempting to download PDF for profile ID: {profile_id}")
            
            # Try to get PDF download URL
            # 16Personalities profile pages typically have a PDF download link
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                # Try common PDF endpoints first (these might work for public profiles)
                pdf_urls_to_try = [
                    f"https://www.16personalities.com/profiles/{profile_id}/pdf",
                    f"https://www.16personalities.com/api/profiles/{profile_id}/pdf",
                    f"https://www.16personalities.com/profiles/{profile_id}/export/pdf",
                    f"https://www.16personalities.com/profiles/{profile_id}/download/pdf",
                ]
                
                pdf_bytes = None
                for pdf_url in pdf_urls_to_try:
                    try:
                        logger.debug(f"Trying PDF URL: {pdf_url}")
                        pdf_response = await client.get(pdf_url, follow_redirects=True)
                        content_type = pdf_response.headers.get('content-type', '').lower()
                        if pdf_response.status_code == 200 and ('application/pdf' in content_type or 'pdf' in content_type or pdf_url.endswith('/pdf')):
                            # Check if it's actually a PDF by checking magic bytes
                            if pdf_response.content[:4] == b'%PDF':
                                pdf_bytes = pdf_response.content
                                logger.info(f"Successfully downloaded PDF from {pdf_url} ({len(pdf_bytes)} bytes)")
                                break
                    except Exception as e:
                        logger.debug(f"Failed to download from {pdf_url}: {e}")
                        continue
                
                # If direct PDF download didn't work, try to extract from HTML page
                if not pdf_bytes:
                    logger.info("Direct PDF download failed, trying to extract from HTML page")
                    try:
                        # Access the profile page
                        response = await client.get(url, headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        })
                        if response.status_code != 200:
                            raise ValueError(f"Failed to access profile URL: HTTP {response.status_code}")
                        
                        # Parse HTML to find PDF download link
                        html_content = response.text
                        import re
                        
                        # Look for PDF download links in the HTML
                        pdf_link_patterns = [
                            r'href=["\']([^"\']*\.pdf[^"\']*)["\']',
                            r'href=["\']([^"\']*download[^"\']*pdf[^"\']*)["\']',
                            r'href=["\']([^"\']*export[^"\']*pdf[^"\']*)["\']',
                            r'data-pdf-url=["\']([^"\']*)["\']',
                            r'pdf["\']:\s*["\']([^"\']*)["\']',
                        ]
                        
                        for pattern in pdf_link_patterns:
                            matches = re.findall(pattern, html_content, re.IGNORECASE)
                            for match in matches:
                                # Build absolute URL
                                if match.startswith('http'):
                                    pdf_url = match
                                elif match.startswith('/'):
                                    pdf_url = f"https://www.16personalities.com{match}"
                                else:
                                    pdf_url = f"https://www.16personalities.com/profiles/{profile_id}/{match}"
                                
                                try:
                                    logger.debug(f"Trying extracted PDF URL: {pdf_url}")
                                    pdf_response = await client.get(pdf_url, follow_redirects=True)
                                    if pdf_response.status_code == 200:
                                        content_type = pdf_response.headers.get('content-type', '').lower()
                                        # Check if it's a PDF by magic bytes
                                        if pdf_response.content[:4] == b'%PDF' or 'application/pdf' in content_type:
                                            pdf_bytes = pdf_response.content
                                            logger.info(f"Successfully downloaded PDF from extracted URL: {pdf_url} ({len(pdf_bytes)} bytes)")
                                            break
                                except Exception as e:
                                    logger.debug(f"Failed to download from extracted URL {pdf_url}: {e}")
                                    continue
                            
                            if pdf_bytes:
                                break
                    except Exception as e:
                        logger.warning(f"Failed to extract PDF link from HTML: {e}")
                
                if not pdf_bytes:
                    # If we still don't have a PDF, provide helpful error message
                    raise ValueError(
                        "Could not automatically download PDF from the 16Personalities profile URL. "
                        "This may be because:\n"
                        "- The profile is private and requires authentication\n"
                        "- The profile URL format has changed\n"
                        "- The PDF export feature is not available for this profile\n\n"
                        "Please download the PDF manually from 16Personalities and upload it using the file upload option instead."
                    )
                
                if len(pdf_bytes) == 0:
                    raise ValueError("Downloaded PDF is empty")
                
                if len(pdf_bytes) > 10 * 1024 * 1024:  # 10MB
                    raise ValueError(f"Downloaded PDF is too large: {len(pdf_bytes) / 1024 / 1024:.2f}MB (max 10MB)")
                
                logger.info(f"Successfully downloaded PDF: {len(pdf_bytes)} bytes")
                return pdf_bytes
                
        except httpx.TimeoutException:
            raise ValueError("Timeout while downloading PDF from URL. Please try again or upload the PDF manually.")
        except httpx.RequestError as e:
            raise ValueError(f"Failed to download PDF from URL: {str(e)}")
        except ValueError:
            raise  # Re-raise ValueError as-is
        except Exception as e:
            logger.error(f"Error downloading PDF from URL: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to download PDF from URL: {str(e)}")

    async def extract_mbti_results(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract MBTI results from PDF file
        Returns structured data with MBTI type, dimensions, and insights
        """
        try:
            # Convert PDF to images
            images = self._convert_pdf_to_images(pdf_bytes)
            
            if not images:
                raise ValueError("No pages found in PDF")

            # Extract data from each page and merge results
            all_extracted_data = []
            for i, image_bytes in enumerate(images):
                logger.info(f"Processing page {i + 1} of {len(images)}")
                extracted_data = await self._extract_text_from_image(image_bytes, i + 1)
                all_extracted_data.append(extracted_data)

            # Merge results from all pages (prefer non-null values)
            merged_result = {
                "mbti_type": None,
                "dimension_preferences": {},
                "description": None,
                "strengths": [],
                "challenges": []
            }

            for page_data in all_extracted_data:
                # Merge MBTI type (take first non-null)
                if not merged_result["mbti_type"] and page_data.get("mbti_type"):
                    merged_result["mbti_type"] = page_data.get("mbti_type")

                # Merge dimension preferences (accumulate or take average)
                if page_data.get("dimension_preferences"):
                    for dim, values in page_data["dimension_preferences"].items():
                        if dim not in merged_result["dimension_preferences"]:
                            merged_result["dimension_preferences"][dim] = values
                        else:
                            # Merge values (take average if both exist)
                            merged_values = {}
                            for key in ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']:
                                if key in values:
                                    if key in merged_result["dimension_preferences"][dim]:
                                        merged_values[key] = (values[key] + merged_result["dimension_preferences"][dim][key]) / 2
                                    else:
                                        merged_values[key] = values[key]
                                elif key in merged_result["dimension_preferences"][dim]:
                                    merged_values[key] = merged_result["dimension_preferences"][dim][key]
                            merged_result["dimension_preferences"][dim] = merged_values

                # Merge description (take first non-null)
                if not merged_result["description"] and page_data.get("description"):
                    merged_result["description"] = page_data.get("description")

                # Merge strengths and challenges (append unique items)
                if page_data.get("strengths"):
                    for strength in page_data["strengths"]:
                        if strength and strength not in merged_result["strengths"]:
                            merged_result["strengths"].append(strength)

                if page_data.get("challenges"):
                    for challenge in page_data["challenges"]:
                        if challenge and challenge not in merged_result["challenges"]:
                            merged_result["challenges"].append(challenge)

            # Validate extracted data
            if not merged_result["mbti_type"]:
                raise ValueError("Could not extract MBTI type from PDF. Please ensure the PDF contains MBTI results from 16Personalities.")

            # Ensure dimension_preferences is properly structured
            required_dimensions = ["EI", "SN", "TF", "JP"]
            for dim in required_dimensions:
                if dim not in merged_result["dimension_preferences"]:
                    logger.warning(f"Missing dimension {dim} in extracted data, using default values")
                    merged_result["dimension_preferences"][dim] = {}

            logger.info(f"Successfully extracted MBTI results: {merged_result['mbti_type']}")
            return merged_result

        except Exception as e:
            logger.error(f"Error extracting MBTI results from PDF: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to extract MBTI results from PDF: {str(e)}")

    @staticmethod
    def is_configured() -> bool:
        """Check if the service is properly configured"""
        return (
            OPENAI_AVAILABLE 
            and bool(OPENAI_API_KEY) 
            and PYMUPDF_AVAILABLE 
            and PIL_AVAILABLE
        )
