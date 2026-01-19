# MBTI HTML Parsing Implementation Guide

## Overview

This document describes the implementation of HTML parsing functionality for MBTI assessment results from 16Personalities profile URLs.

## What This Does

When a user provides a 16Personalities profile URL (e.g., `https://www.16personalities.com/profiles/6d65d1ec09592`), the system now:

1. **Fetches the HTML content** from the URL
2. **Parses the HTML** to extract:
   - Text content (personality descriptions, traits, etc.)
   - Structured data (JSON-LD, embedded JavaScript data)
   - Images (profile pictures, charts, graphs)
   - Meta tags
3. **Analyzes the content** using OpenAI to extract MBTI information
4. **Creates the assessment** with the extracted data

## Architecture

### Components

#### 1. Frontend (`apps/web/src/app/[locale]/dashboard/assessments/mbti/upload/page.tsx`)
- Provides three input modes: PDF upload, URL import, Image upload
- Validates the 16Personalities profile URL format
- Calls the backend API with the URL

#### 2. Backend API (`backend/app/api/v1/endpoints/assessments.py`)
- Receives the profile URL
- Attempts HTML parsing first (faster, more direct)
- Falls back to PDF download if HTML parsing fails
- Returns the extracted MBTI assessment data

#### 3. PDF OCR Service (`backend/app/services/pdf_ocr_service.py`)
New methods added:
- `extract_mbti_from_html_url()` - Main entry point for HTML-based extraction
- `_parse_html_for_mbti()` - Parses HTML using BeautifulSoup
- `_analyze_extracted_content_with_openai()` - Uses AI to extract structured data
- `_extract_mbti_with_openai_text()` - Fallback for raw text extraction

## Technical Details

### HTML Parsing Strategy

1. **Fetch HTML**: Uses httpx with browser-like headers to fetch the profile page
2. **Extract Structured Data**:
   - JSON-LD structured data
   - Embedded JavaScript objects (window.__INITIAL_STATE__, etc.)
   - Meta tags with personality information
3. **Extract Text Content**:
   - Removes script, style, and meta tags
   - Focuses on main content areas
   - Preserves meaningful text structure
4. **Extract Images**:
   - Finds relevant images (profile, charts, graphs)
   - Converts relative URLs to absolute URLs
5. **AI Analysis**:
   - Sends extracted content to OpenAI
   - Receives structured MBTI data in JSON format

### Data Extracted

The system extracts the following MBTI information:

```json
{
  "mbti_type": "INTJ-A",
  "personality_name": "ARCHITECT",
  "variant": "ASSERTIVE",
  "role": "ANALYST",
  "strategy": "CONSTANT IMPROVEMENT",
  "dimension_preferences": {
    "EI": {"E": 45, "I": 55},
    "SN": {"S": 30, "N": 70},
    "TF": {"T": 65, "F": 35},
    "JP": {"J": 75, "P": 25}
  },
  "traits": {
    "Mind": "Introverted (55%)",
    "Energy": "Intuitive (70%)",
    "Nature": "Thinking (65%)",
    "Tactics": "Judging (75%)",
    "Identity": "Assertive (60%)"
  },
  "description": "Brief description of the personality type",
  "strengths": ["strength 1", "strength 2", ...],
  "challenges": ["challenge 1", "challenge 2", ...]
}
```

## Workflow

### User Journey

1. User navigates to MBTI assessment page
2. User selects "Import from URL" mode
3. User pastes their 16Personalities profile URL
4. System validates the URL format
5. User clicks "Import from URL"
6. System processes the URL:
   - Fetches HTML content
   - Parses and extracts information
   - Analyzes with AI
   - Creates assessment record
7. User is redirected to results page

### Error Handling

The system includes comprehensive error handling:

- **Invalid URL**: Validates URL format before processing
- **Private Profile**: Detects and reports if profile is private
- **404/403 Errors**: Reports access issues
- **HTML Parsing Failure**: Falls back to PDF download method
- **AI Analysis Failure**: Provides detailed error messages

### Fallback Mechanism

If HTML parsing fails, the system automatically falls back to the original PDF download method:

```
HTML Parsing → (if fails) → PDF Download → (if fails) → Error
```

## Dependencies

### Required Python Packages

- `beautifulsoup4>=4.12.0` - HTML parsing
- `lxml>=5.0.0` - Fast XML/HTML parser
- `httpx>=0.25.0` - Async HTTP client
- `openai>=1.0.0` - AI analysis

### Optional Packages

- `playwright>=1.40.0` - For JavaScript-rendered pages (advanced fallback)

## Configuration

No additional configuration is required. The service uses existing OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o  # Optional, defaults to gpt-4o
```

## Advantages of HTML Parsing

1. **Faster**: No need to download and process PDF files
2. **More Direct**: Extracts data directly from the source
3. **Better Quality**: Can access structured data and full text
4. **More Reliable**: Less dependent on PDF format consistency
5. **Flexible**: Can extract additional information not available in PDFs

## Testing

### Manual Testing

1. Navigate to: `http://localhost:3000/dashboard/assessments/mbti/upload`
2. Select "Import from URL"
3. Enter a valid profile URL: `https://www.16personalities.com/profiles/[your-profile-id]`
4. Click "Import from URL"
5. Verify successful extraction and redirect to results

### Test Cases

- ✅ Valid public profile URL
- ✅ Invalid URL format
- ✅ Private profile (should show error)
- ✅ URL with trailing slashes and query parameters
- ✅ Fallback to PDF download when HTML parsing fails

## Future Enhancements

1. **Cache Results**: Cache parsed HTML data to reduce API calls
2. **Support More Platforms**: Extend to other personality test platforms
3. **Offline Mode**: Store extracted data for offline access
4. **Batch Processing**: Process multiple URLs at once
5. **Image Analysis**: Use computer vision to extract data from charts/graphs

## Troubleshooting

### Common Issues

**Issue**: "Access forbidden (403)"
- **Solution**: The profile is private. User should make their profile public or download PDF manually.

**Issue**: "Invalid MBTI type extracted"
- **Solution**: The page content may be incomplete. Try the PDF upload method instead.

**Issue**: "BeautifulSoup not available"
- **Solution**: Install dependencies: `pip install beautifulsoup4 lxml`

## API Endpoints

### POST `/v1/assessments/mbti/upload-pdf`

**Request**:
```
Content-Type: multipart/form-data
profile_url: https://www.16personalities.com/profiles/[id]
```

**Response**:
```json
{
  "assessment_id": 123,
  "mbti_type": "INTJ-A",
  "scores": {...},
  "message": "MBTI assessment completed successfully"
}
```

## Conclusion

This implementation provides a robust, efficient way to extract MBTI data from 16Personalities profile URLs using HTML parsing and AI analysis. It significantly improves the user experience by making the process faster and more reliable.
