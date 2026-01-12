# Playwright Setup for PDF Download

This document explains how to set up Playwright for automatic PDF download from JavaScript-rendered pages (like 16Personalities).

## Installation

### 1. Install Python Package

The `playwright` package is already in `requirements.txt`. Install it with:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Browser Binaries

After installing the Python package, you need to install the Chromium browser binaries:

```bash
# Install Playwright browsers
playwright install chromium

# Or install all browsers (larger download)
playwright install
```

### 3. Verify Installation

You can verify Playwright is working by running:

```python
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('https://example.com')
        print("Playwright is working!")
        await browser.close()

# Run: python -c "import asyncio; asyncio.run(test())"
```

## Docker/Railway Deployment

For Docker or Railway deployments, you need to ensure Playwright browsers are installed in the container.

### Option 1: Add to Dockerfile

Add these lines to your Dockerfile:

```dockerfile
# Install Playwright and browsers
RUN pip install playwright
RUN playwright install chromium
RUN playwright install-deps chromium
```

### Option 2: Railway/Nixpacks

Railway should automatically detect and install Playwright if it's in `requirements.txt`. However, you may need to add a `nixpacks.toml` file:

```toml
[phases.setup]
nixPkgs = ['chromium', 'chromedriver']

[phases.install]
cmds = [
  'pip install -r requirements.txt',
  'playwright install chromium',
  'playwright install-deps chromium'
]
```

## How It Works

The `PDFOCRService` now uses Playwright as a fallback when direct HTTP requests fail:

1. **First**: Tries direct HTTP requests to common PDF endpoints
2. **Second**: Tries to extract PDF URLs from HTML/JavaScript
3. **Third**: Uses Playwright headless browser to:
   - Load the page with JavaScript execution
   - Wait for content to load
   - Find and click PDF download buttons
   - Extract PDF URLs from JavaScript variables
   - Intercept PDF responses
   - Download the PDF

## Troubleshooting

### Playwright Not Found

If you see "Playwright not available", ensure:
- `playwright` is installed: `pip install playwright`
- Browser binaries are installed: `playwright install chromium`

### Browser Launch Fails

If browser launch fails in Docker/Railway:
- Ensure system dependencies are installed: `playwright install-deps chromium`
- Check that the container has enough memory (Playwright needs ~500MB)
- Verify `--no-sandbox` flag is used (already in code)

### Timeout Errors

If downloads timeout:
- Increase timeout in `_download_pdf_with_playwright` method
- Check network connectivity
- Verify the profile URL is accessible

### 16Personalities PDF Download Fails

If you get "Failed to download PDF from URL" even though your profile is public:

1. **Verify Profile is Public**:
   - Go to https://www.16personalities.com
   - Log in to your account
   - Go to Settings → Privacy
   - Ensure "Profile Visibility" is set to "Public"
   - Save changes

2. **Check Profile URL Format**:
   - The URL should be: `https://www.16personalities.com/profiles/YOUR_PROFILE_ID`
   - Make sure there are no extra characters or parameters

3. **Manual Download Alternative**:
   - If automatic download fails, you can manually download the PDF:
     - Go to your profile page on 16Personalities
     - Look for a "Download PDF" or "Export" button
     - Click it and save the PDF file
     - Upload the PDF file directly using the file upload option in ARISE

4. **Why It Might Fail**:
   - 16Personalities may require JavaScript to generate the PDF
   - The PDF download may require authentication cookies
   - 16Personalities may have changed their PDF download mechanism
   - The profile may appear public but still require login for PDF export

5. **If Playwright is Not Installed**:
   - The system will try direct HTTP requests first
   - If those fail, it will try Playwright (if available)
   - If Playwright is not installed, you'll need to download the PDF manually

## Performance Notes

- Playwright adds ~2-5 seconds to download time
- Uses ~200-500MB of memory
- Only used as fallback when direct methods fail
- Browser is closed immediately after use

## Security

- Playwright runs in headless mode (no GUI)
- Uses `--no-sandbox` flag for Docker compatibility
- Only accesses the specific URL provided
- No persistent cookies or storage
