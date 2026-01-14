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

# Try to import Playwright for headless browser automation
try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("Playwright not available. Install with: pip install playwright && playwright install chromium")

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

    async def _extract_text_from_image(self, image_bytes: bytes, page_num: int, image_format: str = "png") -> Dict[str, Any]:
        """
        Extract text and structured data from a single PDF page image using OpenAI Vision
        
        Args:
            image_bytes: The image file bytes
            page_num: Page number (for logging)
            image_format: The image format for MIME type (png, jpeg, gif, webp). Defaults to "png"
        """
        try:
            # Encode image to base64
            base64_image = self._encode_image_to_base64(image_bytes)
            
            # Prepare prompt for MBTI results extraction
            prompt = """Analysez cette image de résultats de test MBTI de 16Personalities.
Extrayez les informations suivantes au format JSON strict (sans markdown, juste le JSON):

{
  "mbti_type": "INTJ" ou "ENFP" etc. (4 lettres uniquement, peut inclure -T ou -A),
  "personality_name": "ADVENTURER" ou "ARCHITECT" etc. (nom du type de personnalité),
  "variant": "TURBULENT" ou "ASSERTIVE" (si disponible),
  "role": "EXPLORER" ou autre (si disponible),
  "role_description": "Description du rôle si disponible",
  "strategy": "CONSTANT IMPROVEMENT" ou autre (si disponible),
  "strategy_description": "Description de la stratégie si disponible",
  "dimension_preferences": {
    "EI": {"E": 45, "I": 55},
    "SN": {"S": 30, "N": 70},
    "TF": {"T": 65, "F": 35},
    "JP": {"J": 75, "P": 25}
  },
  "traits": {
    "Introverted": "Description si disponible",
    "Observant": "Description si disponible",
    "Feeling": "Description si disponible",
    "Prospecting": "Description si disponible",
    "Turbulent": "Description si disponible (ou Assertive)"
  },
  "description": "Description générale du type de personnalité si disponible",
  "strengths": ["Charming", "Sensitive to Others", ...],
  "strengths_descriptions": {
    "Charming": "Description de la force",
    "Sensitive to Others": "Description de la force",
    ...
  },
  "weaknesses": ["Fiercely Independent", "Unpredictable", ...],
  "weaknesses_descriptions": {
    "Fiercely Independent": "Description de la faiblesse",
    "Unpredictable": "Description de la faiblesse",
    ...
  },
  "research_insight": "Insight de recherche si disponible"
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
                                    "url": f"data:image/{image_format};base64,{base64_image}"
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
            if not response_text:
                raise ValueError("OpenAI API returned empty response. Please try again.")
            
            logger.info(f"OpenAI response for page {page_num}: {response_text[:200]}...")

            # Parse JSON from response (may have markdown code blocks)
            import json
            try:
                # Try to extract JSON from markdown code blocks if present
                if response_text and "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    if json_end > json_start:
                        response_text = response_text[json_start:json_end].strip()
                    else:
                        # Malformed markdown, try to extract anyway
                        response_text = response_text[json_start:].strip()
                elif response_text and "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    if json_end > json_start:
                        response_text = response_text[json_start:json_end].strip()
                    else:
                        # Malformed markdown, try to extract anyway
                        response_text = response_text[json_start:].strip()

                if not response_text:
                    raise ValueError("Could not extract JSON from OpenAI response. Response was empty after parsing.")

                extracted_data = json.loads(response_text)
                if extracted_data is None:
                    raise ValueError("OpenAI API returned null/None data. Please try again.")
                if not isinstance(extracted_data, dict):
                    raise ValueError(f"OpenAI API returned invalid data type. Expected dict, got {type(extracted_data)}")
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
            # Normalize URL - handle different formats
            url = url.strip()
            # Remove trailing slashes and query params for profile ID extraction
            clean_url = url.split('?')[0].rstrip('/')
            
            # Validate URL format - support multiple patterns
            if '16personalities.com' not in url.lower():
                raise ValueError(f"Invalid 16Personalities URL. Must be a 16personalities.com URL. Got: {url}")
            
            # Extract profile ID from URL - handle various formats
            profile_id = None
            if '/profiles/' in url:
                profile_id = url.split('/profiles/')[-1].split('/')[0].split('?')[0]
            elif '/profile/' in url:
                profile_id = url.split('/profile/')[-1].split('/')[0].split('?')[0]
            
            if not profile_id or len(profile_id) < 3:
                raise ValueError(f"Could not extract valid profile ID from URL: {url}")
            
            logger.info(f"Attempting to download PDF for profile ID: {profile_id} from URL: {url}")
            
            # Try to get PDF download URL
            # 16Personalities profile pages typically have a PDF download link
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(60.0, connect=10.0),
                follow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            ) as client:
                # Initialize variables
                html_content = None
                api_data = None
                
                # First, access the profile page to get any session/auth cookies and check if it's accessible
                try:
                    logger.info(f"Accessing profile page: {url}")
                    response = await client.get(url)
                    if response.status_code == 404:
                        raise ValueError(f"Profile not found (404). The profile may be private or the URL is incorrect: {url}")
                    if response.status_code == 403:
                        raise ValueError(f"Access forbidden (403). The profile is private and requires authentication. Please make your profile public or download the PDF manually.")
                    if response.status_code != 200:
                        raise ValueError(f"Failed to access profile URL: HTTP {response.status_code}. The profile may be private or inaccessible.")
                    
                    # Get HTML content, ensure it's a string
                    html_content = response.text if response.text else None
                    if html_content and isinstance(html_content, str):
                        logger.debug(f"Successfully accessed profile page (HTML length: {len(html_content)} chars)")
                        
                        html_lower = html_content.lower()
                        
                        # Check if page indicates the profile is private or requires authentication
                        private_indicators = [
                            'sign in', 'login', 'log in', 'sign up',
                            'private profile', 'this profile is private',
                            'authentication required', 'please log in',
                            'access denied', 'you must be logged in'
                        ]
                        
                        is_private = any(indicator in html_lower for indicator in private_indicators)
                        if is_private:
                            logger.warning("Page content suggests profile may be private or requires authentication")
                            # Don't fail immediately, but note it for later error messages
                        
                        # Check if page is JavaScript-rendered (common for SPAs)
                        is_js_rendered = False
                        if 'loading' in html_lower or '<div id="root">' in html_content or 'react' in html_lower or 'vue' in html_lower or 'next.js' in html_lower:
                            is_js_rendered = True
                            logger.info("Page appears to be JavaScript-rendered (SPA), will try Playwright if available")
                        
                        # Extract any API endpoints or data from the HTML
                        import re
                        json_patterns = [
                            r'window\.__INITIAL_STATE__\s*=\s*({.+?});',
                            r'window\.__PRELOADED_STATE__\s*=\s*({.+?});',
                            r'data-react-props\s*=\s*["\']({.+?})["\']',
                            r'window\.profileData\s*=\s*({.+?});',
                            r'window\.__NEXT_DATA__\s*=\s*({.+?});',
                        ]
                        
                        for pattern in json_patterns:
                            matches = re.findall(pattern, html_content, re.DOTALL)
                            if matches:
                                try:
                                    import json
                                    api_data = json.loads(matches[0])
                                    logger.info(f"Found embedded API data in page")
                                    break
                                except:
                                    pass
                    
                except httpx.TimeoutException:
                    raise ValueError(f"Request timeout while accessing profile URL. Please try again or download the PDF manually.")
                except ValueError:
                    raise  # Re-raise ValueError as-is
                except Exception as e:
                    logger.warning(f"Error accessing profile page: {e}")
                    # Continue anyway, might still be able to try direct PDF URLs
                    html_content = None
                
                # Try common PDF endpoints first (these might work for public profiles)
                # 16Personalities may use different API versions and formats
                pdf_urls_to_try = [
                    # Direct PDF endpoints
                    f"https://www.16personalities.com/profiles/{profile_id}/pdf",
                    f"https://www.16personalities.com/profiles/{profile_id}/download/pdf",
                    f"https://www.16personalities.com/profiles/{profile_id}/export/pdf",
                    f"https://www.16personalities.com/profiles/{profile_id}/download",
                    # API endpoints
                    f"https://www.16personalities.com/api/profiles/{profile_id}/pdf",
                    f"https://www.16personalities.com/api/profiles/{profile_id}/export/pdf",
                    f"https://www.16personalities.com/api/v1/profiles/{profile_id}/pdf",
                    f"https://www.16personalities.com/api/v1/profiles/{profile_id}/export/pdf",
                    f"https://www.16personalities.com/api/v2/profiles/{profile_id}/pdf",
                    # Alternative patterns
                    f"https://www.16personalities.com/api/profile/{profile_id}/pdf",
                    f"https://www.16personalities.com/api/profile/{profile_id}/export/pdf",
                    # With format parameter
                    f"https://www.16personalities.com/api/profiles/{profile_id}?format=pdf",
                    f"https://www.16personalities.com/api/v1/profiles/{profile_id}?format=pdf",
                ]
                
                pdf_bytes = None
                for pdf_url in pdf_urls_to_try:
                    try:
                        logger.debug(f"Trying PDF URL: {pdf_url}")
                        pdf_response = await client.get(pdf_url, follow_redirects=True)
                        content_type = pdf_response.headers.get('content-type', '').lower()
                        
                        # Check status code and content type
                        if pdf_response.status_code == 200:
                            # Check if it's actually a PDF by checking magic bytes
                            if len(pdf_response.content) >= 4 and pdf_response.content[:4] == b'%PDF':
                                pdf_bytes = pdf_response.content
                                logger.info(f"Successfully downloaded PDF from {pdf_url} ({len(pdf_bytes)} bytes)")
                                break
                            elif 'application/pdf' in content_type:
                                # Even if magic bytes don't match, trust content-type for now
                                pdf_bytes = pdf_response.content
                                logger.info(f"Successfully downloaded PDF from {pdf_url} ({len(pdf_bytes)} bytes) based on content-type")
                                break
                        elif pdf_response.status_code == 403:
                            logger.debug(f"Access forbidden for {pdf_url} - profile may be private")
                        elif pdf_response.status_code == 404:
                            logger.debug(f"PDF endpoint not found: {pdf_url}")
                    except Exception as e:
                        logger.debug(f"Failed to download from {pdf_url}: {e}")
                        continue
                
                # If direct PDF download didn't work, try to extract from HTML page or API data
                if not pdf_bytes and html_content:
                    logger.info("Direct PDF download failed, trying to extract from HTML page and embedded data")
                    try:
                        from urllib.parse import urljoin, urlparse, quote
                        
                        # If we found embedded API data, try to extract PDF URL from it
                        if api_data and isinstance(api_data, dict):
                            try:
                                # Common JSON structures
                                pdf_url_from_data = None
                                # Try different nested paths
                                paths_to_check = [
                                    ['pdf_url'],
                                    ['pdfUrl'],
                                    ['download_url'],
                                    ['downloadUrl'],
                                    ['export', 'pdf_url'],
                                    ['profile', 'pdf_url'],
                                    ['data', 'pdf_url'],
                                    ['result', 'pdf_url'],
                                ]
                                for path in paths_to_check:
                                    current = api_data
                                    try:
                                        for key in path:
                                            current = current[key]
                                        if current and isinstance(current, str):
                                            pdf_url_from_data = current
                                            break
                                    except (KeyError, TypeError):
                                        continue
                                
                                if pdf_url_from_data:
                                    logger.info(f"Found PDF URL in embedded data: {pdf_url_from_data}")
                                    try:
                                        pdf_response = await client.get(pdf_url_from_data, follow_redirects=True)
                                        if pdf_response.status_code == 200 and len(pdf_response.content) >= 4 and pdf_response.content[:4] == b'%PDF':
                                            pdf_bytes = pdf_response.content
                                            logger.info(f"Successfully downloaded PDF from embedded data URL ({len(pdf_bytes)} bytes)")
                                    except Exception as e:
                                        logger.debug(f"Failed to download from embedded URL: {e}")
                            except Exception as e:
                                logger.debug(f"Failed to parse embedded API data: {e}")
                        
                        # Only try HTML parsing if html_content is available and not None
                        if html_content and isinstance(html_content, str):
                            import re
                            
                            # More comprehensive patterns to find PDF download links
                            pdf_link_patterns = [
                                # Direct PDF links
                                r'href=["\']([^"\']*\.pdf(?:\?[^"\']*)?)["\']',
                                r'src=["\']([^"\']*\.pdf(?:\?[^"\']*)?)["\']',
                                # Download links containing "pdf"
                                r'href=["\']([^"\']*download[^"\']*pdf[^"\']*)["\']',
                                r'href=["\']([^"\']*pdf[^"\']*download[^"\']*)["\']',
                                # Export links
                                r'href=["\']([^"\']*export[^"\']*pdf[^"\']*)["\']',
                                r'href=["\']([^"\']*pdf[^"\']*export[^"\']*)["\']',
                                # Data attributes
                                r'data-pdf-url=["\']([^"\']*)["\']',
                                r'data-url=["\']([^"\']*pdf[^"\']*)["\']',
                                r'data-href=["\']([^"\']*pdf[^"\']*)["\']',
                                # JSON/API data in scripts
                                r'pdf["\']?\s*:\s*["\']([^"\']*)["\']',
                                r'pdfUrl["\']?\s*:\s*["\']([^"\']*)["\']',
                                r'downloadUrl["\']?\s*:\s*["\']([^"\']*pdf[^"\']*)["\']',
                                # Button/action links
                                r'action=["\']([^"\']*pdf[^"\']*)["\']',
                            ]
                            
                            found_urls = set()
                            for pattern in pdf_link_patterns:
                                matches = re.findall(pattern, html_content, re.IGNORECASE)
                                for match in matches:
                                    # Clean up the URL
                                    match = match.strip().split('?')[0]  # Remove query params for now
                                    
                                    # Build absolute URL
                                    if match.startswith('http'):
                                        pdf_url = match
                                    elif match.startswith('//'):
                                        pdf_url = f"https:{match}"
                                    elif match.startswith('/'):
                                        pdf_url = f"https://www.16personalities.com{match}"
                                    else:
                                        # Relative URL
                                        base_url = f"https://www.16personalities.com/profiles/{profile_id}/"
                                        pdf_url = urljoin(base_url, match)
                                    
                                    if pdf_url and pdf_url not in found_urls:
                                        found_urls.add(pdf_url)
                                        try:
                                            logger.debug(f"Trying extracted PDF URL: {pdf_url}")
                                            pdf_response = await client.get(pdf_url, follow_redirects=True)
                                            if pdf_response.status_code == 200:
                                                content_type = pdf_response.headers.get('content-type', '').lower()
                                                # Check if it's a PDF by magic bytes
                                                if len(pdf_response.content) >= 4 and pdf_response.content[:4] == b'%PDF':
                                                    pdf_bytes = pdf_response.content
                                                    logger.info(f"Successfully downloaded PDF from extracted URL: {pdf_url} ({len(pdf_bytes)} bytes)")
                                                    break
                                                elif 'application/pdf' in content_type:
                                                    pdf_bytes = pdf_response.content
                                                    logger.info(f"Successfully downloaded PDF from extracted URL: {pdf_url} ({len(pdf_bytes)} bytes) based on content-type")
                                                    break
                                        except Exception as e:
                                            logger.debug(f"Failed to download from extracted URL {pdf_url}: {e}")
                                            continue
                                
                    except Exception as e:
                        logger.warning(f"Failed to extract PDF link from HTML: {e}", exc_info=True)
                
                # If direct download and HTML extraction failed, try Playwright (headless browser)
                if not pdf_bytes and PLAYWRIGHT_AVAILABLE:
                    logger.info("Direct download failed, trying Playwright headless browser")
                    try:
                        pdf_bytes = await self._download_pdf_with_playwright(url, profile_id)
                        if pdf_bytes:
                            logger.info(f"Successfully downloaded PDF using Playwright ({len(pdf_bytes)} bytes)")
                    except Exception as e:
                        logger.warning(f"Playwright download failed: {e}", exc_info=True)
                        # Continue to error message below
                
                # Validate we have PDF bytes
                if not pdf_bytes:
                    # If we still don't have a PDF, provide helpful error message with more context
                    error_details = []
                    error_details.append(f"URL tried: {url}")
                    error_details.append(f"Profile ID extracted: {profile_id}")
                    error_details.append("")
                    error_details.append("Possible reasons:")
                    error_details.append("- The profile is private and requires authentication (make it public in 16Personalities settings)")
                    error_details.append("- The profile URL format has changed")
                    error_details.append("- The PDF export feature requires JavaScript/authentication")
                    error_details.append("- The profile doesn't have a PDF export available")
                    error_details.append("- 16Personalities may have changed their PDF download mechanism")
                    
                    if not PLAYWRIGHT_AVAILABLE:
                        error_details.append("- Playwright is not installed (needed for JavaScript-rendered pages)")
                        error_details.append("  To install: pip install playwright && playwright install chromium")
                    
                    error_details.append("")
                    error_details.append("Solution:")
                    error_details.append("1. Go to your 16Personalities profile page")
                    error_details.append("2. Click on 'Download PDF' or 'Export' button")
                    error_details.append("3. Save the PDF file")
                    error_details.append("4. Upload it using the file upload option in ARISE")
                    
                    raise ValueError(
                        "Could not automatically download PDF from the 16Personalities profile URL.\n\n" +
                        "\n".join(error_details)
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
                dimension_prefs = page_data.get("dimension_preferences")
                if dimension_prefs and isinstance(dimension_prefs, dict):
                    for dim, values in dimension_prefs.items():
                        if not isinstance(values, dict):
                            logger.warning(f"Dimension {dim} has invalid structure, skipping")
                            continue
                        
                        if dim not in merged_result["dimension_preferences"]:
                            merged_result["dimension_preferences"][dim] = values
                        else:
                            # Merge values (take average if both exist)
                            merged_values = {}
                            existing_values = merged_result["dimension_preferences"][dim]
                            if not isinstance(existing_values, dict):
                                # If existing value is not a dict, replace it
                                merged_result["dimension_preferences"][dim] = values
                                continue
                            
                            for key in ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']:
                                val1 = values.get(key) if isinstance(values, dict) else None
                                val2 = existing_values.get(key) if isinstance(existing_values, dict) else None
                                
                                # Only include key if at least one value is not None
                                if val1 is not None or val2 is not None:
                                    if val1 is not None and val2 is not None:
                                        # Both values exist - take average
                                        try:
                                            merged_values[key] = (float(val1) + float(val2)) / 2
                                        except (TypeError, ValueError):
                                            # If conversion fails, use the first non-None value
                                            merged_values[key] = val1 if val1 is not None else val2
                                    elif val1 is not None:
                                        merged_values[key] = val1
                                    elif val2 is not None:
                                        merged_values[key] = val2
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

    async def extract_mbti_results_from_image(self, image_bytes: bytes, image_format: str = "png") -> Dict[str, Any]:
        """
        Extract MBTI results directly from an image (screenshot)
        Returns structured data with MBTI type, dimensions, and insights
        
        Args:
            image_bytes: The image file bytes
            image_format: The image format (png, jpeg, jpg, gif, webp). Defaults to "png"
        """
        try:
            if not image_bytes:
                raise ValueError("Image bytes are empty")
            
            logger.info(f"Extracting MBTI results from image (size: {len(image_bytes)} bytes, format: {image_format})")
            
            # Normalize image format for MIME type
            if not image_format:
                image_format = "png"
            format_map = {
                "png": "png",
                "jpg": "jpeg",
                "jpeg": "jpeg",
                "gif": "gif",
                "webp": "webp"
            }
            mime_format = format_map.get(image_format.lower() if image_format else "png", "png")
            
            # Extract data from the image
            extracted_data = await self._extract_text_from_image(image_bytes, 1, mime_format)
            
            # Validate that we got data
            if not extracted_data:
                raise ValueError("Failed to extract any data from image. Please ensure the image contains MBTI results from 16Personalities.")
            
            if not isinstance(extracted_data, dict):
                raise ValueError(f"Invalid data format extracted from image. Expected dict, got {type(extracted_data)}")
            
            # Validate extracted data
            raw_mbti_type = extracted_data.get("mbti_type")
            if not raw_mbti_type:
                raise ValueError("Could not extract MBTI type from image. Please ensure the image contains MBTI results from 16Personalities.")
            
            # Clean MBTI type (remove -T or -A suffix if present, keep it in a separate field)
            mbti_type = str(raw_mbti_type).upper().strip()
            if not mbti_type or mbti_type == "NONE":
                raise ValueError("Invalid MBTI type extracted from image. Please ensure the image contains valid MBTI results from 16Personalities.")
            
            variant = None
            if len(mbti_type) > 4:
                # Check if it ends with -T or -A
                if mbti_type.endswith("-T") or mbti_type.endswith("-A"):
                    variant = mbti_type[-1]  # T or A
                    mbti_type = mbti_type[:-2]  # Remove -T or -A
            
            # Ensure dimension_preferences is properly structured
            dimension_preferences = extracted_data.get("dimension_preferences", {})
            if not isinstance(dimension_preferences, dict):
                logger.warning("dimension_preferences is not a dict, using empty dict")
                dimension_preferences = {}
            
            required_dimensions = ["EI", "SN", "TF", "JP"]
            for dim in required_dimensions:
                if dim not in dimension_preferences:
                    logger.warning(f"Missing dimension {dim} in extracted data, using default values")
                    dimension_preferences[dim] = {}
            
            # Build result structure
            result = {
                "mbti_type": mbti_type,
                "variant": variant or extracted_data.get("variant"),
                "personality_name": extracted_data.get("personality_name"),
                "role": extracted_data.get("role"),
                "role_description": extracted_data.get("role_description"),
                "strategy": extracted_data.get("strategy"),
                "strategy_description": extracted_data.get("strategy_description"),
                "dimension_preferences": dimension_preferences,
                "traits": extracted_data.get("traits", {}),
                "description": extracted_data.get("description"),
                "strengths": extracted_data.get("strengths", []),
                "strengths_descriptions": extracted_data.get("strengths_descriptions", {}),
                "weaknesses": extracted_data.get("weaknesses", []),
                "weaknesses_descriptions": extracted_data.get("weaknesses_descriptions", {}),
                "challenges": extracted_data.get("challenges", []),  # Keep for backward compatibility
                "research_insight": extracted_data.get("research_insight")
            }
            
            logger.info(f"Successfully extracted MBTI results from image: {result['mbti_type']}")
            return result

        except Exception as e:
            logger.error(f"Error extracting MBTI results from image: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to extract MBTI results from image: {str(e)}")

    async def _download_pdf_with_playwright(self, url: str, profile_id: str) -> Optional[bytes]:
        """
        Download PDF from 16Personalities using Playwright headless browser
        This handles JavaScript-rendered pages and can interact with the page to trigger PDF download
        """
        if not PLAYWRIGHT_AVAILABLE:
            logger.warning("Playwright not available, cannot use headless browser")
            return None
        
        try:
            async with async_playwright() as p:
                # Launch browser in headless mode
                logger.info("Launching Playwright browser...")
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu',
                    ]
                )
                
                try:
                    # Create a new page with more realistic browser context
                    context = await browser.new_context(
                        viewport={'width': 1920, 'height': 1080},
                        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        locale='en-US',
                        timezone_id='America/New_York',
                        extra_http_headers={
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        }
                    )
                    page = await context.new_page()
                    
                    # Set up response listener to capture PDF downloads
                    pdf_bytes = None
                    pdf_downloaded = False
                    pdf_urls_found = []
                    
                    async def handle_response(response):
                        nonlocal pdf_bytes, pdf_downloaded
                        content_type = response.headers.get('content-type', '').lower()
                        url_response = response.url
                        
                        # Check if this is a PDF response
                        if 'application/pdf' in content_type or url_response.endswith('.pdf') or '/pdf' in url_response.lower():
                            try:
                                body = await response.body()
                                # Verify it's actually a PDF
                                if len(body) >= 4 and body[:4] == b'%PDF':
                                    pdf_bytes = body
                                    pdf_downloaded = True
                                    logger.info(f"PDF detected in response from {url_response} ({len(pdf_bytes)} bytes)")
                            except Exception as e:
                                logger.debug(f"Error reading PDF from response: {e}")
                        # Also collect any URLs that might be PDF endpoints
                        elif '/pdf' in url_response.lower() or 'download' in url_response.lower():
                            pdf_urls_found.append(url_response)
                    
                    # Listen for responses and requests
                    page.on('response', handle_response)
                    
                    # Also listen for requests to catch PDF URLs
                    async def handle_request(request):
                        url_req = request.url
                        if '/pdf' in url_req.lower() or 'download' in url_req.lower():
                            pdf_urls_found.append(url_req)
                    
                    page.on('request', handle_request)
                    
                    # Navigate to the profile page
                    logger.info(f"Navigating to profile page: {url}")
                    try:
                        await page.goto(url, wait_until='domcontentloaded', timeout=60000)
                        # Wait for network to be mostly idle
                        await page.wait_for_load_state('networkidle', timeout=30000)
                    except Exception as e:
                        logger.warning(f"Navigation timeout or error: {e}, continuing anyway")
                    
                    # Wait for JavaScript to fully load and render
                    await page.wait_for_timeout(5000)
                    
                    # Try to wait for specific elements that might indicate the page is loaded
                    try:
                        # Wait for common page elements
                        await page.wait_for_selector('body', timeout=10000)
                    except:
                        pass
                    
                    # Try multiple strategies to find and download PDF
                    strategies = []
                    
                    # Strategy 1: Find and click PDF download button/link
                    pdf_selectors = [
                        'a[href*="pdf"]',
                        'a[href*="download"]',
                        'button:has-text("PDF")',
                        'button:has-text("Download")',
                        'a:has-text("PDF")',
                        'a:has-text("Download PDF")',
                        'a:has-text("Download")',
                        '[data-testid*="pdf"]',
                        '[data-testid*="download"]',
                        '.pdf-download',
                        '.download-pdf',
                        'button[aria-label*="PDF"]',
                        'button[aria-label*="Download"]',
                        '[class*="pdf"]',
                        '[class*="download"]',
                        'a[download]',
                    ]
                    
                    clicked = False
                    for selector in pdf_selectors:
                        try:
                            # Wait a bit for element to appear
                            element = await page.wait_for_selector(selector, timeout=2000, state='visible')
                            if element:
                                logger.info(f"Found PDF download element with selector: {selector}")
                                # Scroll into view
                                await element.scroll_into_view_if_needed()
                                await page.wait_for_timeout(500)
                                # Try to click
                                await element.click(timeout=5000)
                                clicked = True
                                # Wait for download to start
                                await page.wait_for_timeout(3000)
                                if pdf_downloaded:
                                    break
                        except Exception as e:
                            logger.debug(f"Selector {selector} not found or clickable: {e}")
                            continue
                    
                    # Strategy 2: Extract PDF URL from JavaScript/DOM
                    if not pdf_downloaded:
                        logger.info("Trying to extract PDF URL from JavaScript and DOM")
                        try:
                            pdf_url_js = await page.evaluate("""
                                () => {
                                    // Try to find PDF URL in various ways
                                    const results = [];
                                    
                                    // Check window objects
                                    if (window.profileData && window.profileData.pdfUrl) {
                                        results.push(window.profileData.pdfUrl);
                                    }
                                    if (window.__INITIAL_STATE__) {
                                        const state = window.__INITIAL_STATE__;
                                        if (state.profile && state.profile.pdfUrl) {
                                            results.push(state.profile.pdfUrl);
                                        }
                                        if (state.pdfUrl) {
                                            results.push(state.pdfUrl);
                                        }
                                    }
                                    
                                    // Check all script tags
                                    const scripts = Array.from(document.querySelectorAll('script'));
                                    for (const script of scripts) {
                                        const content = script.textContent || script.innerHTML;
                                        // Look for PDF URLs
                                        const pdfMatches = content.match(/["']([^"']*\/pdf[^"']*)["']/gi);
                                        if (pdfMatches) {
                                            pdfMatches.forEach(m => {
                                                const url = m.replace(/["']/g, '');
                                                if (url.includes('pdf') || url.includes('download')) {
                                                    results.push(url);
                                                }
                                            });
                                        }
                                    }
                                    
                                    // Find all links that might be PDF
                                    const links = Array.from(document.querySelectorAll('a[href]'));
                                    for (const link of links) {
                                        const href = link.getAttribute('href');
                                        if (href && (href.includes('pdf') || href.includes('download'))) {
                                            results.push(href);
                                        }
                                    }
                                    
                                    // Find buttons with data attributes
                                    const buttons = Array.from(document.querySelectorAll('button[data-url], a[data-url]'));
                                    for (const btn of buttons) {
                                        const dataUrl = btn.getAttribute('data-url');
                                        if (dataUrl && (dataUrl.includes('pdf') || dataUrl.includes('download'))) {
                                            results.push(dataUrl);
                                        }
                                    }
                                    
                                    return results.length > 0 ? results[0] : null;
                                }
                            """)
                            
                            if pdf_url_js:
                                logger.info(f"Found PDF URL via JavaScript: {pdf_url_js}")
                                # Make URL absolute if needed
                                if not pdf_url_js.startswith('http'):
                                    if pdf_url_js.startswith('//'):
                                        pdf_url_js = f"https:{pdf_url_js}"
                                    elif pdf_url_js.startswith('/'):
                                        pdf_url_js = f"https://www.16personalities.com{pdf_url_js}"
                                    else:
                                        pdf_url_js = f"https://www.16personalities.com/profiles/{profile_id}/{pdf_url_js}"
                                
                                # Navigate to PDF URL
                                try:
                                    response = await page.goto(pdf_url_js, wait_until='networkidle', timeout=30000)
                                    if response:
                                        body = await response.body()
                                        if len(body) >= 4 and body[:4] == b'%PDF':
                                            pdf_bytes = body
                                            pdf_downloaded = True
                                            logger.info(f"Successfully downloaded PDF from extracted URL ({len(pdf_bytes)} bytes)")
                                except Exception as e:
                                    logger.debug(f"Failed to download from extracted URL: {e}")
                        except Exception as e:
                            logger.debug(f"JavaScript PDF extraction failed: {e}")
                    
                    # Strategy 3: Try to trigger download via JavaScript click simulation
                    if not pdf_downloaded:
                        logger.info("Trying to trigger PDF download via JavaScript click simulation")
                        try:
                            await page.evaluate("""
                                () => {
                                    // Find all potential download elements
                                    const elements = document.querySelectorAll('a[href*="pdf"], a[href*="download"], button[onclick*="pdf"], button[onclick*="download"]');
                                    for (const el of elements) {
                                        try {
                                            el.click();
                                        } catch (e) {
                                            // Try dispatchEvent instead
                                            const event = new MouseEvent('click', {
                                                view: window,
                                                bubbles: true,
                                                cancelable: true
                                            });
                                            el.dispatchEvent(event);
                                        }
                                    }
                                }
                            """)
                            await page.wait_for_timeout(3000)
                        except Exception as e:
                            logger.debug(f"JavaScript click simulation failed: {e}")
                    
                    # Strategy 4: Try direct API endpoints with cookies from the page
                    if not pdf_bytes:
                        logger.info("Trying direct API endpoints via Playwright with page cookies")
                        # Get cookies from the page
                        cookies = await context.cookies()
                        cookie_string = '; '.join([f"{c['name']}={c['value']}" for c in cookies])
                        
                        api_endpoints = [
                            f"https://www.16personalities.com/api/profiles/{profile_id}/pdf",
                            f"https://www.16personalities.com/profiles/{profile_id}/pdf",
                            f"https://www.16personalities.com/api/v1/profiles/{profile_id}/pdf",
                            f"https://www.16personalities.com/profiles/{profile_id}/download/pdf",
                            f"https://www.16personalities.com/profiles/{profile_id}/export/pdf",
                        ]
                        
                        for endpoint in api_endpoints:
                            try:
                                response = await page.goto(endpoint, wait_until='networkidle', timeout=30000)
                                if response and response.status == 200:
                                    body = await response.body()
                                    if len(body) >= 4 and body[:4] == b'%PDF':
                                        pdf_bytes = body
                                        logger.info(f"Successfully downloaded PDF from {endpoint} ({len(pdf_bytes)} bytes)")
                                        break
                            except Exception as e:
                                logger.debug(f"Failed to download from {endpoint}: {e}")
                                continue
                    
                    # Strategy 5: Try URLs found during page load
                    if not pdf_bytes and pdf_urls_found:
                        logger.info(f"Trying {len(pdf_urls_found)} PDF URLs found during page load")
                        for pdf_url in pdf_urls_found[:5]:  # Try first 5 URLs
                            try:
                                response = await page.goto(pdf_url, wait_until='networkidle', timeout=20000)
                                if response and response.status == 200:
                                    body = await response.body()
                                    if len(body) >= 4 and body[:4] == b'%PDF':
                                        pdf_bytes = body
                                        logger.info(f"Successfully downloaded PDF from found URL ({len(pdf_bytes)} bytes)")
                                        break
                            except Exception as e:
                                logger.debug(f"Failed to download from found URL {pdf_url}: {e}")
                                continue
                    
                    # Wait a bit more for any async downloads
                    if not pdf_downloaded:
                        await page.wait_for_timeout(5000)
                    
                    await context.close()
                    
                    if pdf_bytes and len(pdf_bytes) >= 4 and pdf_bytes[:4] == b'%PDF':
                        return pdf_bytes
                    else:
                        logger.warning("Playwright downloaded data but it doesn't appear to be a valid PDF")
                        return None
                        
                finally:
                    await browser.close()
                    
        except Exception as e:
            logger.error(f"Error in Playwright PDF download: {e}", exc_info=True)
            raise

    @staticmethod
    def is_configured() -> bool:
        """Check if the service is properly configured"""
        return (
            OPENAI_AVAILABLE 
            and bool(OPENAI_API_KEY) 
            and PYMUPDF_AVAILABLE 
            and PIL_AVAILABLE
        )
