#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to check if Playwright is properly installed and working.
Run this to diagnose issues with 16Personalities profile URL imports.
"""

import sys
import asyncio
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def check_playwright_installation():
    """Check if Playwright module is installed"""
    try:
        import playwright
        # Try to get version, but don't fail if not available
        try:
            from playwright._impl._driver import get_driver_env
            print(f"✓ Playwright module is installed")
        except:
            print(f"✓ Playwright module is installed")
        return True
    except ImportError:
        print("✗ Playwright module is NOT installed")
        print("  Install with: pip install playwright")
        return False

def check_browser_installation():
    """Check if Playwright browsers are installed"""
    try:
        from playwright.async_api import async_playwright
        print("✓ Playwright async API is available")
        return True
    except Exception as e:
        print(f"✗ Playwright async API error: {e}")
        return False

async def test_browser_launch():
    """Test if Chromium browser can be launched"""
    try:
        from playwright.async_api import async_playwright
        
        print("\nTesting browser launch...")
        async with async_playwright() as p:
            print("  Launching Chromium browser...")
            browser = await p.chromium.launch(headless=True)
            print("  ✓ Browser launched successfully")
            
            page = await browser.new_page()
            print("  ✓ New page created")
            
            await page.goto("https://www.example.com", timeout=10000)
            print("  ✓ Successfully navigated to example.com")
            
            title = await page.title()
            print(f"  ✓ Page title: {title}")
            
            await browser.close()
            print("  ✓ Browser closed")
            
        return True
    except Exception as e:
        print(f"  ✗ Browser launch failed: {e}")
        print("\n  If you see 'Executable doesn't exist' error, run:")
        print("    playwright install chromium")
        print("\n  If you see system dependency errors, run:")
        print("    playwright install-deps chromium")
        return False

async def test_16personalities_access():
    """Test accessing 16Personalities profile page"""
    try:
        from playwright.async_api import async_playwright
        
        print("\nTesting 16Personalities access...")
        # Use the example URL from the user
        test_url = "https://www.16personalities.com/profiles/aee39b0fb6725"
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            print(f"  Navigating to: {test_url}")
            response = await page.goto(test_url, wait_until="networkidle", timeout=30000)
            
            if response:
                print(f"  ✓ HTTP Status: {response.status}")
                
                if response.status == 200:
                    print("  ✓ Successfully accessed profile page")
                    
                    # Check if content loaded
                    title = await page.title()
                    print(f"  ✓ Page title: {title}")
                    
                    # Try to find MBTI type
                    content = await page.content()
                    if "ISFP" in content or "personalities" in content.lower():
                        print("  ✓ Profile content detected")
                    else:
                        print("  ⚠ Profile content may not have loaded properly")
                    
                    # Extract some text to verify
                    body_text = await page.evaluate("() => document.body.innerText")
                    if len(body_text) > 1000:
                        print(f"  ✓ Extracted {len(body_text)} characters of text")
                    else:
                        print(f"  ⚠ Only extracted {len(body_text)} characters of text (may be incomplete)")
                        
                elif response.status == 403:
                    print("  ✗ Access Forbidden (403)")
                    print("     This could mean the profile is private or Cloudflare blocked the request")
                elif response.status == 404:
                    print("  ✗ Profile Not Found (404)")
                else:
                    print(f"  ⚠ Unexpected status code: {response.status}")
            else:
                print("  ✗ No response received")
            
            await browser.close()
        
        return True
    except Exception as e:
        print(f"  ✗ Failed to access 16Personalities: {e}")
        return False

async def main():
    """Run all checks"""
    print("=" * 60)
    print("Playwright Installation Check")
    print("=" * 60)
    
    # Check 1: Module installed
    playwright_installed = check_playwright_installation()
    if not playwright_installed:
        print("\n❌ Playwright is not installed. Please install it first.")
        print("\nInstallation steps:")
        print("  1. pip install playwright")
        print("  2. playwright install chromium")
        return
    
    # Check 2: Async API available
    api_available = check_browser_installation()
    if not api_available:
        print("\n❌ Playwright API is not available.")
        return
    
    # Check 3: Browser launch test
    browser_works = await test_browser_launch()
    if not browser_works:
        print("\n❌ Browser launch failed. Please install browser binaries.")
        return
    
    # Check 4: 16Personalities access test
    access_works = await test_16personalities_access()
    
    print("\n" + "=" * 60)
    if playwright_installed and api_available and browser_works and access_works:
        print("✓ All checks passed! Playwright is working correctly.")
        print("\nYou should now be able to import MBTI profiles from URLs.")
    else:
        print("⚠ Some checks failed. Please review the output above.")
        print("\nCommon solutions:")
        print("  1. pip install playwright")
        print("  2. playwright install chromium")
        print("  3. playwright install-deps chromium  (for system dependencies)")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
