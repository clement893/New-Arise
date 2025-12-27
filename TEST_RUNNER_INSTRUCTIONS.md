# Test Runner Instructions

## Running the New API Endpoint Tests

We've added comprehensive tests for several API endpoints. To run them:

### Prerequisites

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Ensure you have pytest and pytest-asyncio installed:
   ```bash
   pip install pytest pytest-asyncio pytest-cov httpx
   ```

### Running Tests

#### Option 1: Use the provided scripts

**On Linux/Mac:**
```bash
cd backend
chmod +x scripts/run_new_tests.sh
./scripts/run_new_tests.sh
```

**On Windows (PowerShell):**
```powershell
cd backend
.\scripts\run_new_tests.ps1
```

#### Option 2: Run manually

```bash
cd backend

# Run all new endpoint tests
pytest tests/api/test_search_endpoints.py tests/api/test_feedback_endpoints.py tests/api/test_comments_endpoints.py tests/api/test_tags_endpoints.py -v

# Run a specific test file
pytest tests/api/test_search_endpoints.py -v

# Run with more verbose output
pytest tests/api/test_search_endpoints.py -v -s
```

### Generating Coverage Reports

#### Option 1: Use the provided script

**On Linux/Mac:**
```bash
cd backend
chmod +x scripts/generate_coverage_report.sh
./scripts/generate_coverage_report.sh
```

**On Windows (PowerShell):**
```powershell
cd backend
.\scripts\generate_coverage_report.ps1
```

#### Option 2: Run manually

```bash
cd backend

# Generate coverage report for all tests
pytest tests/ --cov=app --cov-report=term-missing --cov-report=html --cov-report=json --cov-branch -v

# Generate coverage report for new tests only
pytest tests/api/test_search_endpoints.py tests/api/test_feedback_endpoints.py tests/api/test_comments_endpoints.py tests/api/test_tags_endpoints.py --cov=app --cov-report=html -v
```

### Viewing Coverage Reports

After running coverage, open the HTML report:
- **Location**: `backend/htmlcov/index.html`
- Open in your browser to see detailed coverage breakdown

### Test Files Added

1. **test_search_endpoints.py** - 10+ test cases for Search API
   - Search users and projects
   - Autocomplete functionality
   - Pagination and filtering
   - Error handling

2. **test_feedback_endpoints.py** - 15+ test cases for Feedback API
   - Create, read, update, delete feedback
   - File attachments
   - Admin responses
   - Validation

3. **test_comments_endpoints.py** - 13+ test cases for Comments API
   - Create comments with threading
   - Get comments for entities
   - Update/Delete operations
   - Reactions

4. **test_tags_endpoints.py** - 20+ test cases for Tags & Categories API
   - Tag CRUD operations
   - Category tree structure
   - Popular tags and search
   - Entity tagging

### Troubleshooting

**Issue**: `pytest: command not found`
- **Solution**: Use `python -m pytest` instead of `pytest`

**Issue**: `ModuleNotFoundError: No module named 'pytest'`
- **Solution**: Install pytest: `pip install pytest pytest-asyncio pytest-cov`

**Issue**: Tests fail with database errors
- **Solution**: Ensure test database is properly configured in `conftest.py`

**Issue**: Authentication errors in tests
- **Solution**: Check that `test_user` fixture is properly set up in `conftest.py`

### Expected Test Results

When running the tests, you should see:
- ✅ All tests passing (or gracefully handling missing dependencies)
- Coverage percentages displayed in terminal
- HTML coverage report generated in `htmlcov/` directory

### Next Steps

1. Run the tests to verify they work in your environment
2. Review coverage reports to identify areas needing more tests
3. Add more tests for remaining endpoints
4. Aim for 70%+ coverage as configured in `pytest.ini`

