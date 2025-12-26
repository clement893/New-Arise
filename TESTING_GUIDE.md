# Testing Guide

## Running Tests

### Backend Tests

```bash
cd backend
pytest tests/
```

### Run Specific Test Files

```bash
# Test Pages API
pytest tests/test_pages_api.py

# Test Forms API
pytest tests/test_forms_api.py

# Test Menus API
pytest tests/test_menus_api.py

# Test Support Tickets API
pytest tests/test_support_tickets_api.py

# Test SEO API
pytest tests/test_seo_api.py
```

### Run with Coverage

```bash
pytest --cov=app tests/
```

## Test Structure

All tests follow the same pattern:

1. **Setup**: Create test data (users, forms, pages, etc.)
2. **Execute**: Make API requests
3. **Assert**: Verify responses and data

## Example Test

```python
@pytest.mark.asyncio
async def test_create_page(client: AsyncClient, test_user: User, auth_headers: dict):
    """Test creating a new page"""
    page_data = {
        "title": "Test Page",
        "slug": "test-page",
        "content": "Test content",
        "status": "draft",
    }
    
    response = await client.post(
        "/api/v1/pages",
        json=page_data,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == page_data["title"]
```

## Frontend Tests

### TypeScript Check

```bash
cd apps/web
pnpm type-check
```

### Build Test

```bash
cd apps/web
pnpm build
```

## E2E Tests (Optional)

```bash
cd apps/web
pnpm test:e2e
```

## Test Coverage Goals

- **Backend**: 80%+ coverage
- **Frontend**: 80%+ coverage
- **Critical paths**: 100% coverage

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Before deployments


