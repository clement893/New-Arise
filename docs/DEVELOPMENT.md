# 🛠️ Guide de Développement

Guide complet pour développer avec le template MODELE-NEXTJS-FULLSTACK.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Structure du projet](#structure-du-projet)
- [Scripts disponibles](#scripts-disponibles)
- [Génération de code](#génération-de-code)
- [Workflow de développement](#workflow-de-développement)
- [Standards de code](#standards-de-code)

---

## 📦 Prérequis

- **Node.js** 20.x ou supérieur
- **pnpm** 9.x ou supérieur
- **Python** 3.11+ (optionnel, pour la génération de types)
- **PostgreSQL** 14+ (ou Docker)
- **Redis** 7+ (optionnel, pour les jobs en arrière-plan)
- **Git**

---

## ⚙️ Configuration de l'environnement

### Variables d'environnement Backend

Copier `backend/.env.example` vers `backend/.env` et configurer :

```env
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/modele_db
SECRET_KEY=votre-secret-key-minimum-32-caracteres
FRONTEND_URL=http://localhost:3000
```

### Variables d'environnement Frontend

Copier `apps/web/.env.example` vers `apps/web/.env.local` et configurer :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-key
```

---

## 📁 Structure du Projet

```
MODELE-NEXTJS-FULLSTACK/
├── apps/
│   └── web/              # Frontend Next.js
│       ├── src/
│       │   ├── app/      # Pages et routes
│       │   ├── components/ # Composants React
│       │   └── lib/      # Utilitaires
│       └── package.json
├── backend/              # Backend FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints API
│   │   ├── models/      # Modèles SQLAlchemy
│   │   ├── schemas/     # Schémas Pydantic
│   │   └── services/    # Logique métier
│   └── requirements.txt
├── packages/
│   └── types/           # Types TypeScript partagés
├── scripts/             # Scripts utilitaires
└── docs/                # Documentation
```

---

## 🚀 Scripts Disponibles

### Développement

```bash
# Démarrer frontend + backend
pnpm dev:full

# Frontend uniquement
pnpm dev:frontend

# Backend uniquement
pnpm dev:backend
```

### Génération de Code

```bash
# Générer un composant
pnpm generate:component ComponentName

# Générer une page
pnpm generate:page page-name

# Générer une route API
pnpm generate:api route-name

# Générer les types TypeScript depuis Pydantic
pnpm generate:types
```

### Tests

```bash
# Tous les tests
pnpm test

# Tests frontend
pnpm test:web

# Tests backend
pnpm test:backend

# Avec couverture
pnpm test:coverage
```

### Qualité de Code

```bash
# Linter
pnpm lint
pnpm lint:fix

# Vérification TypeScript
pnpm type-check

# Formater le code
pnpm format
```

### Base de Données

```bash
# Créer une migration
pnpm migrate create MigrationName

# Appliquer les migrations
pnpm migrate upgrade

# Rollback
pnpm migrate downgrade
```

---

## 🎯 Génération de Code

Le projet inclut des générateurs de code pour accélérer le développement :

### Composant React

```bash
pnpm generate:component Button
```

Génère :
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Button.test.tsx`
- `apps/web/src/components/ui/Button.stories.tsx`

### Page Next.js

```bash
pnpm generate:page dashboard
```

Génère :
- `apps/web/src/app/dashboard/page.tsx`

### Route API

```bash
pnpm generate:api users
```

Génère :
- `backend/app/api/v1/endpoints/users.py`
- `backend/app/schemas/users.py`

---

## 🔄 Workflow de Développement

### 1. Créer une branche

```bash
git checkout -b feat/ma-fonctionnalite
```

### 2. Développer

```bash
# Démarrer le serveur de développement
pnpm dev:full

# Dans un autre terminal, exécuter les tests en watch
pnpm test:web:watch
```

### 3. Tester

```bash
# Exécuter tous les tests
pnpm test

# Vérifier le linting
pnpm lint

# Vérifier les types
pnpm type-check
```

### 4. Commit

```bash
git add .
git commit -m "feat: ajouter ma fonctionnalité"
```

### 5. Push et Pull Request

```bash
git push origin feat/ma-fonctionnalite
```

---

## 📝 Standards de Code

### TypeScript

- Utiliser TypeScript strict
- Éviter `any` (utiliser `unknown` si nécessaire)
- Typer toutes les fonctions et composants

### Python

- Suivre PEP 8
- Utiliser type hints
- Documenter avec docstrings

### Formatage

- Frontend : Prettier
- Backend : Black

### Linting

- Frontend : ESLint
- Backend : Ruff

---

## 🧪 Tests

Voir [Guide des Tests](./TESTING.md) pour plus de détails.

---

## 🔧 Dépannage

Voir [Guide de Dépannage](./TROUBLESHOOTING.md) pour résoudre les problèmes courants.

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

