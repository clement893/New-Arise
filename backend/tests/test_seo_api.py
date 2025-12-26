"""
Tests for SEO API endpoints
"""

import pytest
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_get_seo_settings(client: AsyncClient, test_user: User, auth_headers: dict):
    """Test getting SEO settings"""
    response = await client.get(
        "/api/v1/seo/settings",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "settings" in data


@pytest.mark.asyncio
async def test_update_seo_settings(client: AsyncClient, test_user: User, auth_headers: dict):
    """Test updating SEO settings"""
    settings_data = {
        "title": "Test Site",
        "description": "Test description",
        "keywords": "test, keywords",
        "robots": "index, follow",
        "og_title": "Test OG Title",
        "og_description": "Test OG Description",
    }
    
    response = await client.put(
        "/api/v1/seo/settings",
        json=settings_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "settings" in data
    
    # Verify settings were saved
    get_response = await client.get(
        "/api/v1/seo/settings",
        headers=auth_headers
    )
    assert get_response.status_code == 200
    saved_settings = get_response.json()["settings"]
    assert saved_settings.get("title") == settings_data["title"]

