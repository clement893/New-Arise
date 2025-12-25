"""
Tests for Theme API Endpoints
"""

import pytest
from unittest.mock import AsyncMock, Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.theme import Theme


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def mock_theme():
    """Mock theme object"""
    theme = Mock(spec=Theme)
    theme.id = 1
    theme.name = "test-theme"
    theme.display_name = "Test Theme"
    theme.description = "Test description"
    theme.config = {"mode": "dark", "primary": "#000"}
    theme.is_active = True
    theme.updated_at = "2025-01-27T10:00:00Z"
    return theme


@pytest.fixture
def mock_user():
    """Mock user object"""
    user = Mock()
    user.id = 1
    user.email = "test@example.com"
    user.is_superadmin = True
    return user


class TestGetActiveTheme:
    """Tests for GET /api/v1/themes/active"""
    
    @patch("app.api.v1.endpoints.themes.get_db")
    def test_get_active_theme_success(self, mock_get_db, client, mock_theme):
        """Test getting active theme"""
        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_theme
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/themes/active")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "test-theme"
        assert data["display_name"] == "Test Theme"
    
    @patch("app.api.v1.endpoints.themes.get_db")
    def test_get_active_theme_not_found_returns_default(self, mock_get_db, client):
        """Test getting active theme when none exists returns default"""
        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/themes/active")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "default"
        assert "config" in data


class TestListThemes:
    """Tests for GET /api/v1/themes"""
    
    @patch("app.api.v1.endpoints.themes.require_superadmin")
    @patch("app.api.v1.endpoints.themes.get_current_user")
    @patch("app.api.v1.endpoints.themes.get_db")
    def test_list_themes_success(self, mock_get_db, mock_get_user, mock_require_admin, client, mock_theme, mock_user):
        """Test listing themes"""
        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [mock_theme]
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_get_db.return_value = mock_db
        mock_get_user.return_value = mock_user
        mock_require_admin.return_value = None
        
        response = client.get("/api/v1/themes", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        data = response.json()
        assert "themes" in data
        assert len(data["themes"]) > 0


class TestGetTheme:
    """Tests for GET /api/v1/themes/{theme_id}"""
    
    @patch("app.api.v1.endpoints.themes.require_superadmin")
    @patch("app.api.v1.endpoints.themes.get_current_user")
    @patch("app.api.v1.endpoints.themes.get_db")
    def test_get_theme_success(self, mock_get_db, mock_get_user, mock_require_admin, client, mock_theme, mock_user):
        """Test getting theme by ID"""
        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_theme
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_get_db.return_value = mock_db
        mock_get_user.return_value = mock_user
        mock_require_admin.return_value = None
        
        response = client.get("/api/v1/themes/1", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
    
    @patch("app.api.v1.endpoints.themes.require_superadmin")
    @patch("app.api.v1.endpoints.themes.get_current_user")
    @patch("app.api.v1.endpoints.themes.get_db")
    def test_get_theme_not_found(self, mock_get_db, mock_get_user, mock_require_admin, client, mock_user):
        """Test getting non-existent theme"""
        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_get_db.return_value = mock_db
        mock_get_user.return_value = mock_user
        mock_require_admin.return_value = None
        
        response = client.get("/api/v1/themes/999", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 404

