# 🚀 Next.js Full-Stack Template

A production-ready, comprehensive full-stack template for building modern SaaS applications and websites with **Next.js 16**, **React 19**, **TypeScript**, and **FastAPI**.

> **Perfect for:** SaaS applications, admin dashboards, e-commerce platforms, content management systems, and any full-stack web application.

---

## ✨ What's Included

### 🎯 Core Stack
- ✅ **Next.js 16** with App Router and React Server Components
- ✅ **React 19** - Latest React features and improvements
- ✅ **TypeScript** - Strict mode for maximum type safety
- ✅ **FastAPI** - Modern, fast Python backend framework
- ✅ **PostgreSQL** - Robust relational database
- ✅ **Redis** - Caching and background job queue
- ✅ **Monorepo** - Turborepo for efficient builds and development

### 🎨 UI & Styling
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **40+ UI Components** - Complete component library (DataTable, Kanban, Calendar, Forms, etc.)
- ✅ **Dark Mode** - Built-in theme support with persistence
- ✅ **Theme System** - Customizable color palettes and presets
- ✅ **Responsive Design** - Mobile-first, accessible components
- ✅ **Storybook** - Component documentation and testing

### 🔐 Authentication & Security
- ✅ **JWT Authentication** - Secure token-based auth with httpOnly cookies
- ✅ **OAuth Integration** - Google, GitHub, Microsoft social login
- ✅ **Multi-Factor Authentication (MFA)** - TOTP-based 2FA support
- ✅ **Role-Based Access Control (RBAC)** - Flexible permission system
- ✅ **Security Headers** - CSP, HSTS, X-Frame-Options, and more
- ✅ **Input Sanitization** - XSS protection built-in

### 💼 SaaS Features
- ✅ **Subscription Management** - Stripe integration ready
- ✅ **Team Management** - Multi-user teams and collaboration
- ✅ **User Invitations** - Email-based invitation system
- ✅ **Payment History** - Transaction tracking and management
- ✅ **Customer Portal** - Self-service portal for users

### 🛠️ Developer Experience
- ✅ **Code Generation** - CLI tools for components, pages, API routes
- ✅ **Type Safety** - Auto-generated TypeScript types from Pydantic schemas
- ✅ **Hot Reload** - Fast refresh for both frontend and backend
- ✅ **Testing Suite** - Vitest (unit), Playwright (E2E), pytest (backend)
- ✅ **Code Quality** - ESLint, Prettier, TypeScript strict mode
- ✅ **CI/CD Ready** - GitHub Actions workflows included
- ✅ **Docker Support** - Docker Compose for local development

### 📊 Performance & Monitoring
- ✅ **Code Splitting** - Automatic route-based code splitting
- ✅ **Image Optimization** - Next.js Image component optimized
- ✅ **Bundle Analysis** - Webpack bundle analyzer included
- ✅ **Web Vitals** - Core Web Vitals monitoring
- ✅ **Error Tracking** - Sentry integration ready
- ✅ **Performance Dashboard** - Built-in performance monitoring UI

### 🌍 Internationalization
- ✅ **i18n Support** - next-intl configured (FR/EN included)
- ✅ **Locale Routing** - Automatic locale detection and routing

---

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git your-project-name
cd your-project-name
pnpm quick-start
```

The interactive script will guide you through:
- ✅ Prerequisites verification
- ✅ Dependency installation
- ✅ Environment configuration with secure secrets
- ✅ Database setup
- ✅ Running migrations

### Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git your-project-name
cd your-project-name

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp apps/web/.env.example apps/web/.env.local
# Edit .env files with your values

# 4. Start development servers
pnpm dev
```

> 📖 **For detailed setup instructions**, see [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher ([download](https://nodejs.org/))
- **pnpm** 9.x or higher (`npm install -g pnpm`)
- **Python** 3.11+ ([download](https://www.python.org/downloads/)) - Optional, for type generation
- **PostgreSQL** 14+ ([download](https://www.postgresql.org/download/)) - Or use Docker
- **Redis** 7+ ([download](https://redis.io/download)) - Optional, for background jobs
- **Git** ([download](https://git-scm.com/))

**Optional but recommended:**
- **Docker** & **Docker Compose** - For easier local development
- **SendGrid Account** - For transactional emails
- **Stripe Account** - For payment processing

---

## 📁 Project Structure

```
MODELE-NEXTJS-FULLSTACK/
├── apps/
│   └── web/                      # Next.js frontend application
│       ├── src/
│       │   ├── app/              # Next.js App Router pages
│       │   │   ├── components/   # Component showcase pages
│       │   │   ├── examples/    # SaaS example pages
│       │   │   └── ...
│       │   ├── components/       # React components
│       │   │   ├── ui/          # UI component library
│       │   │   ├── auth/        # Authentication components
│       │   │   ├── layout/      # Layout components
│       │   │   ├── performance/ # Performance components
│       │   │   └── errors/      # Error handling components
│       │   ├── lib/             # Utilities and libraries
│       │   ├── hooks/           # Custom React hooks
│       │   └── contexts/        # React contexts
│       └── public/              # Static assets
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── core/                # Configuration
│   │   └── main.py
│   ├── alembic/                 # Database migrations
│   └── requirements.txt
├── packages/
│   └── types/                    # Shared TypeScript types
│       └── src/
│           ├── generated.ts     # Auto-generated from Pydantic
│           └── index.ts
├── scripts/                     # Automation scripts
│   ├── generate/                # Code generators
│   └── ...
├── templates/                   # Module templates (CRM, Billing, etc.)
├── .github/
│   └── workflows/               # CI/CD GitHub Actions
├── package.json                 # Monorepo configuration
├── turbo.json                   # Turborepo configuration
└── pnpm-workspace.yaml          # pnpm workspace configuration
```

---

## 🎯 Available Scripts

### Development
```bash
pnpm dev              # Start all development servers (frontend + backend)
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only
pnpm storybook        # Start Storybook for component development
```

### Build
```bash
pnpm build            # Build all packages
pnpm build:web        # Build frontend only
pnpm build:optimized  # Optimized production build
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:e2e         # E2E tests with Playwright
pnpm test:coverage    # Coverage report
```

### Code Quality
```bash
pnpm lint             # Lint code
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking
pnpm check            # Run all checks (lint + format + type-check)
```

### Code Generation
```bash
pnpm generate:component ComponentName    # Generate React component
pnpm generate:page page-name              # Generate Next.js page
pnpm generate:api route-name              # Generate API route
pnpm generate:types                       # Generate TypeScript types from Pydantic
```

### Database
```bash
pnpm migrate          # Run database migrations
pnpm seed             # Seed database with sample data
```

### Analysis
```bash
pnpm analyze         # Bundle size analysis
pnpm audit:security  # Security audit
```

---

## 🎨 Using Components

The template includes a comprehensive UI component library. View all components at `/components` or in Storybook:

```bash
pnpm storybook
```

### Example Usage

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

### Available Component Categories

- **Forms**: Input, Select, Textarea, Checkbox, Radio, Switch, RichTextEditor
- **Data Display**: DataTable, Chart, Kanban, Calendar, Badge, Card
- **Navigation**: Tabs, Breadcrumbs, Pagination, CommandPalette
- **Feedback**: Alert, Toast, Modal, Spinner, Progress
- **Layout**: Container, Section, Grid, Stack
- **Authentication**: MFA, SocialAuth
- **Performance**: OfflineSupport, OptimisticUpdates, PerformanceDashboard
- **Errors**: ErrorReporting

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`apps/web/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/your_db

# Security
SECRET_KEY=your-secret-key-change-in-production

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0

# Email (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Important**: Never commit `.env` files. Use `.env.example` files as templates.

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
pnpm test
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e
```

### Coverage Target
- **Components**: 80%+
- **Utilities**: 90%+
- **Hooks**: 85%+

---

## 🚀 Deployment

### Vercel (Frontend - Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically on push

### Railway (Backend - Recommended)

1. Connect GitHub repository to [Railway](https://railway.app)
2. Configure environment variables (especially `FRONTEND_URL` for CORS)
3. Deploy automatically

### Docker

```bash
# Build
docker build -t your-app .

# Run
docker run -p 3000:3000 your-app
```

> 📖 **For detailed deployment instructions**, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📚 Documentation

### Essential Guides

- **[Getting Started](./GETTING_STARTED.md)** - Complete setup and installation guide
- **[Template Usage](./TEMPLATE_USAGE.md)** - How to use this template for your project
- **[Development Guide](./DEVELOPMENT.md)** - Development tools, workflows, and best practices
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the template

### Additional Documentation

- **[Component Documentation](./docs/COMPONENTS.md)** - Complete UI component library reference
- **[Custom Hooks](./docs/HOOKS.md)** - Documentation for custom React hooks
- **[Utilities](./docs/UTILS.md)** - Utility functions reference
- **[Stripe Setup](./docs/STRIPE_SETUP.md)** - Payment integration guide
- **[SendGrid Setup](./docs/SENDGRID_SETUP.md)** - Email service configuration
- **[Security Guide](./docs/SECURITY.md)** - Security best practices
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Component Documentation

```bash
pnpm storybook
```

View interactive component documentation at `http://localhost:6006`

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs` (when backend is running)
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🔒 Security

### Implemented Security Features

- ✅ **httpOnly Cookies** - XSS protection for tokens
- ✅ **JWT Verification** - Server-side token validation
- ✅ **Content Security Policy (CSP)** - XSS and injection protection
- ✅ **Security Headers** - HSTS, X-Frame-Options, etc.
- ✅ **Input Sanitization** - DOMPurify for HTML sanitization
- ✅ **Error Handling** - No sensitive data leakage in errors
- ✅ **CORS Protection** - Configurable origin whitelist

### Security Best Practices

- Use strong, randomly generated secrets (32+ characters)
- Enable HTTPS in production
- Regularly update dependencies (`pnpm audit:security`)
- Monitor security advisories
- Never commit secrets or `.env` files
- Use environment variables for all sensitive data

---

## 📊 Performance

### Optimizations Included

- ✅ **Code Splitting** - Automatic route-based splitting
- ✅ **Lazy Loading** - Component and image lazy loading
- ✅ **Image Optimization** - Next.js Image component
- ✅ **Bundle Optimization** - Tree shaking and minification
- ✅ **React Query Caching** - Intelligent API response caching
- ✅ **Web Vitals Monitoring** - Performance tracking built-in

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

---

## 🌍 Internationalization

i18n is configured with `next-intl`. Supported locales:

- 🇫🇷 French (default)
- 🇬🇧 English

To add more locales, see `apps/web/src/i18n/` configuration.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 🆘 Support & Help

### Getting Help

- 📖 Check the [documentation](./GETTING_STARTED.md)
- 🐛 [Open an issue](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues)
- 💬 [Start a discussion](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/discussions)
- 📚 Review code comments and examples

### Common Issues

- **Build errors**: Check [GETTING_STARTED.md](./GETTING_STARTED.md#troubleshooting)
- **CORS errors**: See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting-cors-issues)
- **Database connection**: Verify environment variables and PostgreSQL is running

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Storybook Documentation](https://storybook.js.org/docs)

---

## 🙏 Acknowledgments

Built with amazing open-source projects:

- Next.js, React, TypeScript
- Tailwind CSS
- FastAPI, SQLAlchemy, Pydantic
- Turborepo, pnpm
- And many more...

---

## 📈 Roadmap

### Planned Features

- [ ] Enhanced i18n support (more locales)
- [ ] Additional payment providers (PayPal, etc.)
- [ ] Real-time features (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] More SaaS templates (CRM, ERP modules)
- [ ] Enhanced testing utilities

---

**Made with ❤️ for building amazing full-stack applications**

*Start building your next project in minutes, not days.*
