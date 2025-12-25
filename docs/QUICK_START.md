# ⚡ Démarrage Rapide en 5 Minutes

Guide ultra-rapide pour démarrer avec le template en moins de 5 minutes.

---

## 🚀 Installation Express

### 1. Cloner et Setup (2 minutes)

```bash
# Cloner le template
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git mon-projet
cd mon-projet

# Configuration automatique
pnpm setup
```

Le script `setup` vous demande :
- ✅ Nom du projet
- ✅ Configuration de la base de données
- ✅ Génération automatique des secrets

### 2. Installer les Dépendances (1 minute)

```bash
pnpm install
```

### 3. Créer la Base de Données (30 secondes)

```bash
# Créer la base de données (remplacer par le nom de votre projet)
createdb mon_projet_db

# Appliquer les migrations
cd backend && alembic upgrade head && cd ..
```

### 4. Démarrer le Projet (30 secondes)

```bash
pnpm dev:full
```

### 5. Vérifier (30 secondes)

```bash
# Dans un autre terminal
pnpm post-install
```

**C'est tout ! 🎉**

Accédez à :
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎯 Prochaines Étapes

1. **Personnaliser le projet**
   ```bash
   pnpm rename
   ```

2. **Ajouter vos fonctionnalités**
   ```bash
   pnpm generate:component MonComposant
   pnpm generate:page ma-page
   ```

3. **Configurer les services** (optionnel)
   - SendGrid pour les emails
   - Stripe pour les paiements

---

## 🆘 Problèmes ?

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### "Database connection failed"
```bash
# Vérifier que PostgreSQL est démarré
psql -U postgres

# Créer la base de données
createdb votre_db
```

### "Port already in use"
```bash
# Changer les ports dans .env
FRONTEND_URL=http://localhost:3001
```

---

## 📚 Documentation Complète

- [Guide de Démarrage Complet](../GETTING_STARTED.md)
- [Guide de Développement](./DEVELOPMENT.md)
- [Guide de Déploiement](../DEPLOYMENT.md)

---

**Temps total : ~5 minutes ⏱️**

