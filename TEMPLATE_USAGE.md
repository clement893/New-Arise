# 📚 Guide d'Utilisation du Template

Ce guide explique comment utiliser ce template pour créer votre propre projet full-stack.

---

## 🚀 Démarrage Rapide

### 1. Cloner le Template

```bash
git clone https://github.com/clement893/MODELE-NEXTJS-FULLSTACK.git votre-projet
cd votre-projet
```

### 2. Configuration Initiale

#### Option A : Script Automatique (Recommandé)

```bash
pnpm setup
```

Le script vous guidera à travers :
- Configuration du nom du projet
- Génération des secrets sécurisés
- Configuration de la base de données
- Configuration des ports
- Création des fichiers `.env`

#### Option B : Configuration Manuelle

```bash
# 1. Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp apps/web/.env.example apps/web/.env.local

# 2. Éditer les fichiers .env avec vos valeurs
# 3. Générer les secrets
python -c 'import secrets; print(secrets.token_urlsafe(32))'
```

### 3. Renommer le Projet (Optionnel)

Si vous souhaitez renommer le projet :

```bash
pnpm rename
```

Ce script remplace automatiquement :
- Les noms de projet dans le code
- Les références dans les fichiers de configuration
- Les noms de packages

### 4. Installer les Dépendances

```bash
pnpm install
```

### 5. Initialiser la Base de Données

```bash
# Créer la base de données
createdb votre_base_de_donnees

# Appliquer les migrations
cd backend
alembic upgrade head
cd ..
```

### 6. Démarrer le Projet

```bash
pnpm dev:full
```

---

## 🔧 Personnalisation

### Changer le Nom du Projet

1. Utiliser le script de renommage :
   ```bash
   pnpm rename
   ```

2. Ou manuellement :
   - Mettre à jour `package.json`
   - Mettre à jour `PROJECT_NAME` dans `.env`
   - Remplacer "MODELE" dans le code

### Personnaliser le Thème

Voir [docs/COMPONENTS.md](./docs/COMPONENTS.md) pour la personnalisation du thème.

### Ajouter des Fonctionnalités

- **Composants** : `pnpm generate:component NomComposant`
- **Pages** : `pnpm generate:page nom-page`
- **Routes API** : `pnpm generate:api nom-route`

---

## 📦 Déploiement

### Vercel (Frontend)

1. Connecter votre dépôt GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Railway (Backend)

1. Connecter votre dépôt GitHub à Railway
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Docker

Voir [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) pour les instructions Docker complètes.

---

## 🔐 Sécurité

### Variables d'Environnement Critiques

⚠️ **IMPORTANT** : Ne jamais commiter les fichiers `.env` !

Variables à configurer en production :
- `SECRET_KEY` - Doit être généré et sécurisé (min 32 caractères)
- `NEXTAUTH_SECRET` - Doit être généré et sécurisé
- `DATABASE_URL` - URL de connexion PostgreSQL
- `SENDGRID_API_KEY` - Clé API SendGrid
- `STRIPE_SECRET_KEY` - Clé secrète Stripe

### Génération de Secrets

```bash
# SECRET_KEY
python -c 'import secrets; print(secrets.token_urlsafe(32))'

# NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📚 Documentation Complète

- [Guide de Démarrage](./GETTING_STARTED.md) - Installation détaillée
- [Guide de Développement](./docs/DEVELOPMENT.md) - Outils et workflows
- [Guide des Tests](./docs/TESTING.md) - Tests et couverture
- [Guide de Sécurité](./docs/SECURITY.md) - Bonnes pratiques
- [Configuration SendGrid](./docs/SENDGRID_SETUP.md) - Service email
- [Configuration Stripe](./docs/STRIPE_SETUP.md) - Paiements

---

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues)
- **Discussions** : [GitHub Discussions](https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/discussions)
- **Documentation** : Voir le dossier `docs/`

---

## ✅ Checklist Post-Clonage

- [ ] Exécuter `pnpm setup`
- [ ] Configurer les variables d'environnement
- [ ] Renommer le projet si nécessaire (`pnpm rename`)
- [ ] Installer les dépendances (`pnpm install`)
- [ ] Créer et configurer la base de données
- [ ] Appliquer les migrations
- [ ] Tester le démarrage (`pnpm dev:full`)
- [ ] Configurer SendGrid (optionnel)
- [ ] Configurer Stripe (optionnel)
- [ ] Personnaliser le thème
- [ ] Configurer le déploiement

---

**Bon développement ! 🚀**

