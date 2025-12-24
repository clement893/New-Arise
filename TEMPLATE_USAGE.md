# 📚 Template Usage Guide

Complete guide on how to use this template to build your own full-stack application.

---

## 🎯 Overview

This template is designed to be a starting point for your project. Follow this guide to customize it for your needs.

---

## 🚀 Initial Setup

### 1. Clone and Rename

```bash
# Clone the template
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git your-project-name
cd your-project-name

# Remove existing git history (optional)
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### 2. Run Setup Script

```bash
# Interactive setup (if available)
pnpm setup

# Or use quick-start
pnpm quick-start
```

The setup script will:
- Generate secure secrets
- Create environment files
- Configure project name
- Set up database connection

### 3. Rename the Project (Optional)

If you want to rename the project:

```bash
# Use rename script (if available)
pnpm rename

# Or manually:
# 1. Update package.json name
# 2. Update PROJECT_NAME in .env files
# 3. Replace "MODELE" in code (search and replace)
```

---

## 🔧 Customization

### Branding & Identity

#### 1. Update Project Name

**Files to update:**
- `package.json` - Project name and description
- `apps/web/package.json` - App name
- `backend/.env` - `PROJECT_NAME` variable
- `apps/web/.env.local` - App name references

**Search and replace:**
- "MODELE" → Your project name
- "modele-nextjs-fullstack" → your-project-name

#### 2. Update Metadata

**Frontend (`apps/web/src/app/layout.tsx`):**
```tsx
export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
};
```

**Backend (`backend/app/core/config.py`):**
```python
PROJECT_NAME = "Your App Name"
```

#### 3. Update Favicon and Logo

Replace files in `apps/web/public/`:
- `favicon.ico`
- `logo.svg` (or `logo.png`)
- `apple-touch-icon.png`

### Theme Customization

#### Using Theme Manager UI

1. Start the app: `pnpm dev`
2. Visit `/components/theme`
3. Use the visual theme editor to:
   - Select preset themes
   - Customize colors
   - Adjust fonts
   - Preview changes

#### Programmatic Theme Customization

```tsx
import { useThemeManager } from '@/components/theme/hooks';

function MyComponent() {
  const { updateColor, theme } = useThemeManager();
  
  // Update primary color
  updateColor('primary', '#FF5733');
  
  // Use theme colors
  return <div style={{ color: theme.primary }}>Hello</div>;
}
```

#### Theme Presets

Available presets:
- **Default** - Clean, professional
- **Modern** - Contemporary design
- **Corporate** - Business-focused
- **Vibrant** - Bold colors
- **Minimal** - Simple and clean

### Component Customization

#### Using Components

All components are in `apps/web/src/components/ui/`:

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

#### Creating Custom Components

Use the generator:

```bash
pnpm generate:component MyComponent
```

This creates:
- `MyComponent/MyComponent.tsx`
- `MyComponent/index.ts`
- `MyComponent/MyComponent.stories.tsx` (Storybook)

### Page Customization

#### Creating New Pages

```bash
# Generate a new page
pnpm generate:page my-page

# This creates apps/web/src/app/my-page/page.tsx
```

#### Using Layout Components

```tsx
import { PageContainer, PageHeader, Section } from '@/components/layout';

export default function MyPage() {
  return (
    <PageContainer>
      <PageHeader
        title="My Page"
        description="Page description"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'My Page' }
        ]}
      />
      <Section title="Content">
        {/* Your content */}
      </Section>
    </PageContainer>
  );
}
```

### API Customization

#### Creating API Routes

**Frontend API Routes (Next.js):**
```bash
pnpm generate:api my-route
```

**Backend Endpoints (FastAPI):**
```bash
pnpm generate endpoint MyModel --fields "name:string:true,email:string:true"
```

#### Backend Model Generation

Generate complete CRUD:

```bash
pnpm generate all Product \
  --fields "name:string:true,price:float:true,description:text:false"
```

This creates:
- SQLAlchemy model
- Pydantic schemas
- FastAPI endpoints
- Next.js page with DataTable

---

## 📦 Adding Features

### Authentication

The template includes:
- JWT authentication
- OAuth (Google, GitHub, Microsoft)
- Multi-factor authentication (MFA)

**Enable OAuth:**

1. Configure OAuth provider (see [GETTING_STARTED.md](./GETTING_STARTED.md))
2. Add credentials to `.env.local`
3. Use `SocialAuth` component:

```tsx
import { SocialAuth } from '@/components/auth';

<SocialAuth
  providers={['google', 'github', 'microsoft']}
  onSignIn={(provider) => {
    // Handle sign in
  }}
/>
```

### Database Models

#### Create a New Model

```bash
pnpm generate all Product \
  --fields "name:string:true,price:float:true,stock:integer:true" \
  --relations "category:many-to-one:Category"
```

#### Add Relations

```bash
pnpm generate all Order \
  --fields "total:float:true,status:string:true" \
  --relations "user:many-to-one:User,items:one-to-many:OrderItem"
```

#### Run Migrations

```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Add Product model"

# Apply migration
alembic upgrade head
```

### Email Integration

#### SendGrid Setup

1. Create SendGrid account
2. Get API key
3. Verify sender email
4. Add to `backend/.env`:

```env
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=verified@yourdomain.com
SENDGRID_FROM_NAME=Your App Name
```

#### Using Email Service

```python
from app.services.email_service import send_email

await send_email(
    to="user@example.com",
    subject="Welcome!",
    html_content="<h1>Welcome to our app!</h1>"
)
```

### Payment Integration

#### Stripe Setup

1. Create Stripe account
2. Get API keys
3. Add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

#### Using Stripe

```tsx
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

---

## 🗂️ Project Structure Customization

### Adding New Modules

Create a new module structure:

```
apps/web/src/
├── app/
│   └── your-module/
│       ├── page.tsx
│       └── components/
│           └── YourModuleComponent.tsx
├── components/
│   └── your-module/
│       └── YourModuleComponent.tsx
└── lib/
    └── your-module/
        └── utils.ts
```

### Using Module Templates

The template includes module templates:

```bash
# Copy CRM module template
cp -r templates/modules/crm backend/app/modules/crm

# Copy Billing module template
cp -r templates/modules/billing backend/app/modules/billing
```

See `templates/modules/README.md` for details.

---

## 🧪 Testing Your Customizations

### Run Tests

```bash
# All tests
pnpm test

# Frontend only
pnpm test:web

# Backend only
pnpm test:backend

# E2E tests
pnpm test:e2e
```

### Test Coverage

```bash
pnpm test:coverage
```

Target: 70%+ coverage

---

## 🚀 Preparing for Production

### 1. Environment Variables

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=production-secret-min-32-chars
```

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=production-secret-min-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production
```

### 2. Build for Production

```bash
# Build all packages
pnpm build

# Verify build
pnpm build:web
```

### 3. Security Checklist

- [ ] All secrets are strong (32+ characters)
- [ ] No secrets in code or git
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Security headers enabled
- [ ] Database backups configured
- [ ] Error tracking set up (Sentry)
- [ ] Monitoring configured

### 4. Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📝 Best Practices

### Code Organization

- **Components**: Keep components small and focused (< 200 lines)
- **Hooks**: Extract reusable logic into custom hooks
- **Utils**: Put pure functions in `lib/utils/`
- **Types**: Shared types in `packages/types/`

### Naming Conventions

- **Components**: PascalCase (`Button`, `DataTable`)
- **Files**: Match component name (`Button.tsx`)
- **Hooks**: camelCase with `use` prefix (`useThemeManager`)
- **Utils**: camelCase (`formatDate`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Environment Management

- Never commit `.env` files
- Use `.env.example` as templates
- Document all required variables
- Use different values for dev/staging/prod

---

## 🔍 Finding What You Need

### Component Library

- **Browse**: Visit `/components` in your app
- **Storybook**: Run `pnpm storybook` for interactive docs
- **Code**: See `apps/web/src/components/ui/`

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Code**: See `backend/app/api/`

### Examples

- **SaaS Examples**: Visit `/examples` in your app
- **Code**: See `apps/web/src/app/examples/`

---

## 🆘 Getting Help

### Documentation

- [Getting Started](./GETTING_STARTED.md) - Setup guide
- [Development Guide](./DEVELOPMENT.md) - Dev tools and workflows
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Contributing Guide](./CONTRIBUTING.md) - Contribution guidelines

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Support

- [GitHub Issues](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues)
- [GitHub Discussions](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/discussions)

---

## ✅ Post-Setup Checklist

After customizing your template:

- [ ] Project renamed and branded
- [ ] Environment variables configured
- [ ] Database set up and migrations run
- [ ] Theme customized
- [ ] OAuth configured (if needed)
- [ ] Email service configured (if needed)
- [ ] Payment provider configured (if needed)
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Git repository initialized
- [ ] CI/CD configured (optional)

---

**Happy building! 🚀**

*Remember: This is your template. Customize it to fit your needs!*
