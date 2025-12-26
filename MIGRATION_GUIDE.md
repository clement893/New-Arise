# Migration Guide - Alembic Database Migration

## Running the Migration

To apply the new database schema changes (pages, forms, menus, support tickets), run:

```bash
cd backend
alembic upgrade head
```

## What This Migration Does

The migration `013_add_pages_forms_menus_support_tickets` creates the following tables:

1. **pages** - CMS pages with sections
2. **forms** - Dynamic form definitions
3. **form_submissions** - Form submission data
4. **menus** - Navigation menus
5. **support_tickets** - Customer support tickets
6. **ticket_messages** - Support ticket messages

## Verification

After running the migration, verify the tables were created:

```bash
# Using psql
psql -d your_database -c "\dt pages forms menus support_tickets"

# Or check Alembic version
alembic current
```

## Rollback

If you need to rollback the migration:

```bash
cd backend
alembic downgrade -1
```

## Testing

After migration, test the endpoints:

```bash
# Start the backend server
cd backend
uvicorn app.main:app --reload

# Test endpoints (in another terminal)
curl http://localhost:8000/api/v1/pages
curl http://localhost:8000/api/v1/forms
curl http://localhost:8000/api/v1/menus
curl http://localhost:8000/api/v1/support/tickets
curl http://localhost:8000/api/v1/seo/settings
```

## Notes

- Make sure your database connection is configured in `.env`
- The migration includes all necessary indexes for performance
- Foreign key constraints ensure data integrity
- All timestamps are timezone-aware


