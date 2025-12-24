# 🚀 Quick Start Guide

## ⚡ One-Command Setup

The fastest way to get started:

```bash
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git
cd MODELE-NEXTJS-FULLSTACK
pnpm quick-start
```

This interactive script will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Setup environment files with secure secrets
- ✅ Configure database
- ✅ Run migrations

## 📋 Prerequisites

- **Node.js** 20.x or higher ([download](https://nodejs.org/))
- **pnpm** 9.x or higher (`npm install -g pnpm`)
- **Python** 3.11+ ([download](https://www.python.org/downloads/)) - Optional, for type generation
- **PostgreSQL** 14+ ([download](https://www.postgresql.org/download/)) - Or use Docker
- **Redis** 7+ ([download](https://redis.io/download)) - Optional, for Celery (emails)
- **Git** ([download](https://git-scm.com/))
- **SendGrid Account** (optional for development, required for production) - [Create account](https://sendgrid.com)

## 🛠️ Manual Installation

If you prefer manual setup:

### 1. Clone the repository

```bash
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git
cd MODELE-NEXTJS-FULLSTACK
```

### 2. Install dependencies

```bash
# Install all dependencies (frontend + backend)
pnpm install
```

### 3. Configure environment variables

#### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Required variables:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/modele_db
SECRET_KEY=your-secret-key-change-in-production
REDIS_URL=redis://localhost:6379/0

# SendGrid Email (optional for development)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=MODELE
FRONTEND_URL=http://localhost:3000
```

#### Frontend

```bash
cd apps/web
cp .env.example .env.local
# Edit .env.local with your values
```

**Required variables:**
```env
NEXTAUTH_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Initialize database

```bash
# Create PostgreSQL database
createdb modele_db

# Run migrations
cd backend
alembic upgrade head
```

Or use Docker:

```bash
docker-compose up -d postgres redis
pnpm migrate
```

### 5. Start the project

#### Option A: Full development with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend, Celery)
docker-compose up
```

This starts:
- ✅ PostgreSQL on port 5432
- ✅ Redis on port 6379
- ✅ Frontend on http://localhost:3000
- ✅ Backend on http://localhost:8000
- ✅ Celery worker for emails
- ✅ Hot reload enabled

#### Option B: Local development (without Docker)

**Terminal 1 - PostgreSQL & Redis:**
```bash
# Make sure PostgreSQL and Redis are running
# PostgreSQL: pg_ctl start (or service postgresql start)
# Redis: redis-server (or service redis start)
```

**Terminal 2 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Terminal 3 - Celery Worker (for emails):**
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

**Terminal 4 - Frontend:**
```bash
cd apps/web
pnpm dev
```

#### Option C: npm script (Recommended for development)

```bash
# From project root
pnpm dev:full
```

**Note**: For emails, you need to start Celery separately:
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

### 6. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

## 🛠️ Useful Commands

### Development

```bash
# Start entire project
pnpm dev

# Start frontend only
pnpm dev:frontend

# Start backend only
pnpm dev:backend

# Generate types from Pydantic
pnpm generate:types

# Check code quality
pnpm check
```

### Code Generation

```bash
# Generate a React component
pnpm generate:component

# Generate a Next.js page
pnpm generate:page

# Generate an API route
pnpm generate:api

# Generate TypeScript types from Pydantic
pnpm generate:types
```

### Testing

```bash
# Frontend tests
cd apps/web
pnpm test

# Backend tests
cd backend
pytest

# E2E tests
cd apps/web
pnpm test:e2e
```

### Build

```bash
# Full build
pnpm build

# Frontend only
pnpm build:web

# Optimized build
pnpm build:optimized
```

### Code Quality

```bash
# Linter
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check

# Formatting
pnpm format

# All checks
pnpm check
```

## 📁 Project Structure

```
MODELE-NEXTJS-FULLSTACK/
├── apps/
│   └── web/                 # Frontend Next.js 16
│       ├── src/
│       │   ├── app/        # Pages and layouts
│       │   ├── components/ # React components
│       │   │   ├── ui/     # Complete UI library
│       │   │   └── ...
│       │   ├── hooks/     # Reusable hooks
│       │   ├── lib/       # Utilities
│       │   └── contexts/ # React contexts
│       └── package.json
├── backend/                # Backend FastAPI
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── core/          # Configuration
│   │   └── main.py
│   ├── alembic/           # DB migrations
│   └── requirements.txt
├── packages/
│   └── types/              # Shared TypeScript types
│       └── src/
│           ├── generated.ts # Auto-generated from Pydantic
│           └── index.ts
├── scripts/                # Utility scripts
│   ├── generate/           # Code generators
│   └── ...
├── .github/
│   └── workflows/         # CI/CD GitHub Actions
├── package.json           # Monorepo configuration
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml    # pnpm configuration
```

## 🎨 Using UI Components

```tsx
import { Button, Card, Input, DataTable } from '@/components/ui';

export default function MyPage() {
  return (
    <Card>
      <Input label="Email" type="email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## 🔐 Authentication

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`

### Usage

```tsx
import { signIn, signOut, useSession } from 'next-auth/react';

// Sign in
signIn('google');

// Sign out
signOut();

// Get session
const { data: session } = useSession();
```

## 📝 Type Generation

TypeScript types are automatically generated from Pydantic schemas:

```bash
# Generate types
pnpm generate:types

# Or fallback version (without Python)
pnpm generate:types:fallback
```

Types are available in `packages/types/src/generated.ts` and exported via `@modele/types`.

## 🐛 Troubleshooting

### Error "Python not found"

```bash
# Use fallback version
pnpm generate:types:fallback
```

### Database connection error

Verify that PostgreSQL is running and environment variables are correct.

### Build error

```bash
# Clean and rebuild
pnpm clean
pnpm build
```

## 📚 Additional Documentation

- [Main README](./README.md) - Overview and features
- [Development Guide](./docs/DEVELOPMENT.md) - Development tools and workflows
- [SendGrid Email Setup](./docs/SENDGRID_SETUP.md) - Transactional email configuration
- [Email System Architecture](./docs/EMAIL_SYSTEM.md) - Email system overview
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./apps/web/README.md)

## 🤝 Need Help?

- 📖 Check the [complete documentation](./README.md)
- 🐛 Open a [GitHub issue](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues)
- 💬 Ask a question in discussions

---

**Happy coding! 🚀**
