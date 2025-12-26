"""
Tests for Menus API endpoints
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.user import User


@pytest.mark.asyncio
async def test_create_menu(client: AsyncClient, test_user: User, auth_headers: dict):
    """Test creating a new menu"""
    menu_data = {
        "name": "Main Menu",
        "location": "header",
        "items": [
            {
                "id": "item-1",
                "label": "Home",
                "url": "/",
                "target": "_self",
            }
        ],
    }
    
    response = await client.post(
        "/api/v1/menus",
        json=menu_data,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == menu_data["name"]
    assert data["location"] == menu_data["location"]
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_get_menu(client: AsyncClient, test_user: User, auth_headers: dict, db: AsyncSession):
    """Test getting a menu by ID"""
    # Create a test menu
    menu = Menu(
        name="Test Menu",
        location="header",
        items=[{"id": "item-1", "label": "Home", "url": "/"}],
        user_id=test_user.id,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    
    response = await client.get(
        f"/api/v1/menus/{menu.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == menu.id
    assert data["name"] == "Test Menu"


@pytest.mark.asyncio
async def test_list_menus(client: AsyncClient, test_user: User, auth_headers: dict, db: AsyncSession):
    """Test listing menus"""
    # Create test menus
    for location in ["header", "footer", "sidebar"]:
        menu = Menu(
            name=f"{location.title()} Menu",
            location=location,
            items=[],
            user_id=test_user.id,
        )
        db.add(menu)
    await db.commit()
    
    response = await client.get(
        "/api/v1/menus",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_update_menu(client: AsyncClient, test_user: User, auth_headers: dict, db: AsyncSession):
    """Test updating a menu"""
    # Create a test menu
    menu = Menu(
        name="Test Menu",
        location="header",
        items=[],
        user_id=test_user.id,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    
    update_data = {
        "name": "Updated Menu",
        "items": [{"id": "item-1", "label": "Home", "url": "/"}],
    }
    
    response = await client.put(
        f"/api/v1/menus/{menu.id}",
        json=update_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Menu"
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_delete_menu(client: AsyncClient, test_user: User, auth_headers: dict, db: AsyncSession):
    """Test deleting a menu"""
    # Create a test menu
    menu = Menu(
        name="Test Menu",
        location="header",
        items=[],
        user_id=test_user.id,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    
    menu_id = menu.id
    
    response = await client.delete(
        f"/api/v1/menus/{menu_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify menu is deleted
    get_response = await client.get(
        f"/api/v1/menus/{menu_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404

