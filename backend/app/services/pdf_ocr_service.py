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

logger = logging.getLogger(__name__)

# Try to import required libraries
try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image not available. Install with: pip install pdf2image")

try:
    from PIL import Image
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
        if not PDF2IMAGE_AVAILABLE:
            raise ValueError("pdf2image library is not installed. Install it with: pip install pdf2image")
        if not PIL_AVAILABLE:
            raise ValueError("PIL (Pillow) library is not installed. Install it with: pip install Pillow")

        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self.max_tokens = OPENAI_MAX_TOKENS
        self.temperature = OPENAI_TEMPERATURE

    def _convert_pdf_to_images(self, pdf_bytes: bytes) -> List[bytes]:
        """
        Convert PDF to images (one per page)
        Returns list of image bytes in PNG format
        """
        try:
            # Convert PDF to images
            images = convert_from_bytes(pdf_bytes, dpi=200)  # 200 DPI for good quality
            
            # Convert PIL Images to bytes
            image_bytes_list = []
            for img in images:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Convert to bytes
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG', optimize=True)
                img_bytes = img_byte_arr.getvalue()
                image_bytes_list.append(img_bytes)
            
            logger.info(f"Converted PDF to {len(image_bytes_list)} images")
            return image_bytes_list
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to convert PDF to images: {str(e)}")

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
            and PDF2IMAGE_AVAILABLE 
            and PIL_AVAILABLE
        )
