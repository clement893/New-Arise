# 🚀 Guide de Démarrage Rapide

## 📋 Prérequis

- **Node.js** 22+ ([télécharger](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Python** 3.11+ ([télécharger](https://www.python.org/downloads/))
- **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
- **Redis** 7+ ([télécharger](https://redis.io/download)) - Requis pour Celery (emails)
- **Git** ([télécharger](https://git-scm.com/))
- **Compte SendGrid** (optionnel pour développement, requis pour production) - [Créer un compte](https://sendgrid.com)

## ⚡ Installation Rapide

### 1. Cloner le projet

```bash
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git
cd MODELE-NEXTJS-FULLSTACK
```

### 2. Installer les dépendances

```bash
# Installer toutes les dépendances (frontend + backend)
pnpm install
```

### 3. Configurer les variables d'environnement

#### Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs
```

**Variables requises :**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/modele_db
SECRET_KEY=votre-secret-key-changez-en-production
REDIS_URL=redis://localhost:6379/0

# SendGrid Email (optionnel pour développement)
SENDGRID_API_KEY=votre-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=MODELE
FRONTEND_URL=http://localhost:3000
```

#### Frontend

```bash
cd apps/web
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

**Variables requises :**
```env
NEXTAUTH_SECRET=votre-secret-key-changez-en-production
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
JWT_SECRET=votre-jwt-secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Initialiser la base de données

```bash
# Créer la base de données PostgreSQL
createdb modele_db

# Appliquer les migrations
cd backend
alembic upgrade head
```

### 5. Démarrer le projet

#### Option A : Développement complet avec Docker (recommandé)

```bash
# Démarrer tous les services (PostgreSQL, Redis, Backend, Frontend, Celery)
docker-compose up
```

Cela démarre :
- ✅ PostgreSQL sur port 5432
- ✅ Redis sur port 6379
- ✅ Frontend sur http://localhost:3000
- ✅ Backend sur http://localhost:8000
- ✅ Celery worker pour les emails
- ✅ Hot reload activé

#### Option B : Développement local (sans Docker)

**Terminal 1 - PostgreSQL & Redis :**
```bash
# Assurez-vous que PostgreSQL et Redis sont démarrés
# PostgreSQL: pg_ctl start (ou service postgresql start)
# Redis: redis-server (ou service redis start)
```

**Terminal 2 - Backend :**
```bash
cd backend
uvicorn app.main:app --reload
```

**Terminal 3 - Celery Worker (pour les emails) :**
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

**Terminal 4 - Frontend :**
```bash
cd apps/web
pnpm dev
```

#### Option C : Script npm (recommandé pour développement)

```bash
# Depuis la racine du projet
npm run dev:full
```

**Note**: Pour les emails, vous devez démarrer Celery séparément :
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

### 6. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs (Swagger)** : http://localhost:8000/docs
- **API Docs (ReDoc)** : http://localhost:8000/redoc

## 🛠️ Commandes Utiles

### Développement

```bash
# Démarrer tout le projet
npm run dev

# Démarrer uniquement le frontend
npm run dev:frontend

# Démarrer uniquement le backend
npm run dev:backend

# Générer les types depuis Pydantic
npm run generate:types

# Vérifier le code
npm run check
```

### Génération de Code

```bash
# Générer un composant React
npm run generate:component

# Générer une page Next.js
npm run generate:page

# Générer une route API
npm run generate:api

# Générer des types TypeScript depuis Pydantic
npm run generate:types
```

### Tests

```bash
# Tests frontend
cd apps/web
pnpm test

# Tests backend
cd backend
pytest

# Tests E2E
cd apps/web
pnpm test:e2e
```

### Build

```bash
# Build complet
npm run build

# Build frontend uniquement
npm run build:web

# Build optimisé
npm run build:optimized
```

### Qualité de Code

```bash
# Linter
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatage
npm run format

# Tous les checks
npm run check
```

## 📁 Structure du Projet

```
MODELE-NEXTJS-FULLSTACK/
├── apps/
│   └── web/                 # Frontend Next.js 16
│       ├── src/
│       │   ├── app/        # Pages et layouts
│       │   ├── components/ # Composants React
│       │   │   ├── ui/     # Bibliothèque UI complète
│       │   │   └── ...
│       │   ├── hooks/     # Hooks réutilisables
│       │   ├── lib/       # Utilitaires
│       │   └── contexts/ # Contextes React
│       └── package.json
├── backend/                # Backend FastAPI
│   ├── app/
│   │   ├── api/           # Endpoints API
│   │   ├── models/        # Modèles SQLAlchemy
│   │   ├── schemas/       # Schemas Pydantic
│   │   ├── core/          # Configuration
│   │   └── main.py
│   ├── alembic/           # Migrations DB
│   └── requirements.txt
├── packages/
│   └── types/              # Types TypeScript partagés
│       └── src/
│           ├── generated.ts # Auto-généré depuis Pydantic
│           └── index.ts
├── scripts/                # Scripts utilitaires
│   ├── generate/           # Générateurs de code
│   └── ...
├── .github/
│   └── workflows/         # CI/CD GitHub Actions
├── package.json           # Configuration monorepo
├── turbo.json            # Configuration Turborepo
└── pnpm-workspace.yaml    # Configuration pnpm
```

## 🎨 Utilisation des Composants UI

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

## 🔐 Authentification

### Configuration Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter les URLs de redirection :
   - `http://localhost:3000/api/auth/callback/google`
   - `https://votre-domaine.com/api/auth/callback/google`

### Utilisation

```tsx
import { signIn, signOut, useSession } from 'next-auth/react';

// Se connecter
signIn('google');

// Se déconnecter
signOut();

// Obtenir la session
const { data: session } = useSession();
```

## 📝 Génération de Types

Les types TypeScript sont automatiquement générés depuis les schemas Pydantic :

```bash
# Générer les types
npm run generate:types

# Ou version fallback (sans Python)
npm run generate:types:fallback
```

Les types sont disponibles dans `packages/types/src/generated.ts` et exportés via `@modele/types`.

## 🐛 Dépannage

### Erreur "Python not found"

```bash
# Utiliser la version fallback
npm run generate:types:fallback
```

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est démarré et que les variables d'environnement sont correctes.

### Erreur de build

```bash
# Nettoyer et rebuilder
npm run clean
npm run build
```

## 📚 Documentation Complémentaire

- [README Principal](./README.md) - Overview and features
- [Development Guide](./DEVELOPMENT.md) - Development tools and workflows
- [SendGrid Email Setup](./docs/SENDGRID_SETUP.md) - Configuration emails transactionnels
- [Email System Architecture](./docs/EMAIL_SYSTEM.md) - Vue d'ensemble système emails
- [Monorepo Structure](./MONOREPO.md) - Monorepo configuration
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Documentation Backend](./backend/README.md)
- [Documentation Frontend](./apps/web/README.md)

## 🤝 Besoin d'Aide ?

- 📖 Consulter la [documentation complète](./README.md)
- 🐛 Ouvrir une [issue GitHub](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues)
- 💬 Poser une question dans les discussions

---

**Bon développement ! 🚀**

