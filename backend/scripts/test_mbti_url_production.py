#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to test MBTI URL import functionality on production/staging environment.
This script makes an API call to test the MBTI URL import feature.
"""

import sys
import os
import asyncio
import httpx
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Test configuration
TEST_URL = "https://www.16personalities.com/profiles/aee39b0fb6725"
EXPECTED_TYPE = "ISFP-T"

async def test_mbti_import(api_base_url: str, auth_token: str):
    """
    Test MBTI import from URL
    
    Args:
        api_base_url: Base URL of the API (e.g., https://your-app.railway.app)
        auth_token: Authentication token (Bearer token)
    """
    print("=" * 60)
    print("MBTI URL Import - Production Test")
    print("=" * 60)
    print(f"\nAPI Base URL: {api_base_url}")
    print(f"Test URL: {TEST_URL}")
    print(f"Expected Type: {EXPECTED_TYPE}\n")
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            # Prepare the request
            url = f"{api_base_url}/api/v1/assessments/mbti/upload-pdf"
            headers = {
                "Authorization": f"Bearer {auth_token}"
            }
            
            # Create form data
            data = {
                "profile_url": TEST_URL
            }
            
            print("Sending request to API...")
            print(f"Endpoint: {url}")
            print("This may take 10-30 seconds...\n")
            
            # Make the request
            response = await client.post(url, data=data, headers=headers)
            
            # Check response
            if response.status_code == 200:
                print("✓ Request successful!")
                result = response.json()
                
                print("\n" + "=" * 60)
                print("Results:")
                print("=" * 60)
                print(f"Assessment ID: {result.get('assessment_id')}")
                print(f"MBTI Type: {result.get('mbti_type')}")
                print(f"Message: {result.get('message')}")
                
                if 'scores' in result:
                    print("\nScores:")
                    scores = result['scores']
                    for key, value in scores.items():
                        print(f"  {key}: {value}")
                
                # Verify result
                if result.get('mbti_type') == EXPECTED_TYPE:
                    print("\n✓ MBTI type matches expected value!")
                else:
                    print(f"\n⚠ MBTI type mismatch: expected {EXPECTED_TYPE}, got {result.get('mbti_type')}")
                
                print("\n" + "=" * 60)
                print("✓ Test PASSED")
                print("=" * 60)
                return True
                
            elif response.status_code == 401:
                print("✗ Authentication failed (401)")
                print("Please check your authentication token")
                return False
                
            elif response.status_code == 400:
                print("✗ Bad request (400)")
                error_detail = response.json().get('detail', 'No details provided')
                print(f"Error: {error_detail}")
                
                if "Playwright" in error_detail or "Executable doesn't exist" in error_detail:
                    print("\n⚠ Playwright is not properly installed on the server!")
                    print("The Dockerfile changes may not have been deployed yet.")
                    print("\nPlease:")
                    print("1. Make sure the Dockerfile changes are committed")
                    print("2. Push to your Git repository")
                    print("3. Wait for Railway to rebuild and deploy")
                    print("4. Check Railway deployment logs for 'playwright install chromium'")
                
                return False
                
            else:
                print(f"✗ Request failed with status {response.status_code}")
                try:
                    error = response.json()
                    print(f"Error: {error}")
                except:
                    print(f"Response: {response.text}")
                return False
                
    except httpx.TimeoutException:
        print("✗ Request timeout")
        print("The server is taking too long to respond.")
        print("This might be normal for the first request if Playwright is starting.")
        print("Try again in a few moments.")
        return False
        
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("\n")
    
    # Check for environment variables or command line arguments
    api_base_url = os.getenv('API_BASE_URL')
    auth_token = os.getenv('AUTH_TOKEN')
    
    if not api_base_url:
        print("API Base URL not found.")
        api_base_url = input("Enter API Base URL (e.g., https://your-app.railway.app): ").strip()
    
    if not auth_token:
        print("\nAuthentication token not found.")
        print("You can get a token by:")
        print("1. Logging in to your application")
        print("2. Opening browser dev tools (F12)")
        print("3. Going to Application/Storage > Local Storage")
        print("4. Finding the 'auth-token' or similar key")
        print()
        auth_token = input("Enter authentication token: ").strip()
    
    if not api_base_url or not auth_token:
        print("\n✗ Missing required parameters")
        sys.exit(1)
    
    # Remove trailing slash from URL
    api_base_url = api_base_url.rstrip('/')
    
    # Run the test
    success = asyncio.run(test_mbti_import(api_base_url, auth_token))
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
