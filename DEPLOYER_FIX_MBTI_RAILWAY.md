# Déploiement du Fix MBTI sur Railway

## 🎯 Problème

Sur le serveur de production (Railway), l'import MBTI depuis URL échoue avec:
```
BrowserType.launch: Executable doesn't exist at /home/appuser/.cache/ms-playwright/...
```

**Cause:** Les navigateurs Playwright ne sont pas installés sur le serveur.

## ✅ Solution Appliquée

Le `Dockerfile` a été modifié pour installer les navigateurs Playwright correctement:

### Modifications

1. **Installation des navigateurs en tant qu'appuser**
   - Avant: Installé dans l'étape `deps` (root)
   - Après: Installé dans l'étape `runner` (appuser)
   - Raison: Les navigateurs doivent être dans le home directory du user qui exécute l'app

2. **Variable d'environnement ajoutée**
   ```dockerfile
   ENV PLAYWRIGHT_BROWSERS_PATH=/home/appuser/.cache/ms-playwright
   ```

3. **Installation au bon moment**
   ```dockerfile
   USER appuser
   RUN playwright install chromium --with-deps || playwright install chromium
   ```

## 🚀 Déploiement sur Railway

### Option 1: Déploiement automatique (recommandé)

Si vous avez configuré le déploiement automatique depuis Git:

```bash
# 1. Commitez les changements
git add backend/Dockerfile
git commit -m "fix: Install Playwright browsers for MBTI URL import on Railway"

# 2. Pushez vers Railway
git push origin main
```

Railway détectera automatiquement le changement et redéploiera.

### Option 2: Déploiement manuel via CLI

```bash
# 1. Installez Railway CLI si nécessaire
npm i -g @railway/cli

# 2. Connectez-vous
railway login

# 3. Liez le projet
railway link

# 4. Déployez
railway up
```

### Option 3: Redéploiement via Dashboard Railway

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet
3. Allez dans l'onglet **Deployments**
4. Cliquez sur **Deploy** ou **Redeploy**

## ⏱️ Temps de build

Le premier build après ce changement prendra **plus de temps** (5-10 minutes) car:
- Playwright doit télécharger Chromium (~200 MB)
- Installation des dépendances système
- Build complet de l'image Docker

Les builds suivants seront plus rapides grâce au cache Docker.

## 🔍 Vérification du déploiement

### 1. Vérifiez les logs de build

Dans Railway, regardez les logs de build. Vous devriez voir:

```
#XX [runner X/X] RUN playwright install chromium
#XX 0.XXX Downloading Chromium X.X...
#XX X.XXX Chromium X.X downloaded successfully
```

### 2. Vérifiez les logs de l'application

Une fois déployé, vérifiez les logs au démarrage:

```bash
# Via Railway CLI
railway logs
```

Ou via le Dashboard Railway: **Deployments > View Logs**

### 3. Testez l'import MBTI

1. Allez sur votre application en production
2. Connectez-vous
3. Allez dans **Assessments > MBTI > Upload**
4. Testez avec: `https://www.16personalities.com/profiles/aee39b0fb6725`

**Résultat attendu:**
- ✅ Import réussi en 10-30 secondes
- ✅ Type: ISFP-T avec tous les scores
- ✅ Pas d'erreur 403 ou "Executable doesn't exist"

## 🐛 Si le build échoue

### Erreur: "playwright: command not found"

**Cause:** Playwright n'est pas dans le PATH de l'appuser

**Solution:** Vérifiez que playwright est bien installé dans requirements.txt (déjà le cas)

### Erreur: "Permission denied"

**Cause:** Problème de permissions sur /home/appuser/.cache

**Solution déjà appliquée:** Installation en tant qu'appuser au lieu de root

### Erreur: "Out of memory" ou build timeout

**Cause:** L'installation de Chromium utilise beaucoup de ressources

**Solutions:**
1. Augmentez les ressources du service Railway temporairement
2. Ou utilisez l'image headless plus légère (déjà fait avec chromium_headless_shell)

### Le build passe mais l'erreur persiste

**Vérifications:**

1. **Le cache Playwright existe-t-il?**
   ```bash
   railway run bash
   ls -la /home/appuser/.cache/ms-playwright/
   ```

2. **Playwright est-il installé?**
   ```bash
   railway run python -c "import playwright; print('OK')"
   ```

3. **Les browsers sont-ils installés?**
   ```bash
   railway run playwright install --dry-run chromium
   ```

## 📊 Ressources Railway

### Taille estimée de l'image Docker

- Avant: ~500 MB
- Après: ~700 MB (+200 MB pour Chromium)

### Utilisation CPU pendant l'import

- Playwright + Chromium: ~50-100% CPU pendant 10-30 secondes
- Assurez-vous d'avoir au moins **512 MB RAM** et **0.5 vCPU**

## 🔄 Rollback si nécessaire

Si le nouveau déploiement cause des problèmes:

### Via Railway Dashboard

1. Allez dans **Deployments**
2. Trouvez le déploiement précédent (avant le fix)
3. Cliquez sur **⋯ > Redeploy**

### Via Railway CLI

```bash
railway rollback
```

## 📝 Vérification post-déploiement

- [ ] Build terminé avec succès
- [ ] Application démarrée correctement
- [ ] Health check vert
- [ ] Logs sans erreur Playwright
- [ ] Test d'import MBTI réussi
- [ ] Pas de régression sur autres fonctionnalités

## 🎉 Confirmation du succès

Quand tout fonctionne, vous verrez dans les logs lors d'un import:

```
INFO: Extracting MBTI data from HTML URL: https://...
INFO: Using Playwright headless browser to load JavaScript content...
INFO: Starting Playwright to fetch: https://...
INFO: Playwright fetched 118470 characters of HTML
INFO: Found score: Introverted: 54%
INFO: Successfully parsed MBTI data: ISFP
```

## 💡 Optimisations futures

Si vous voulez optimiser davantage:

1. **Utiliser une image Docker avec Playwright pré-installé**
   ```dockerfile
   FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy
   ```

2. **Cache les navigateurs entre les builds**
   - Railway ne supporte pas encore le cache de volumes pour les builds
   - Mais garde le cache des layers Docker

3. **Utiliser chromium-headless-shell au lieu de chromium complet**
   - Déjà fait dans notre configuration
   - Plus léger et plus rapide

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs de build Railway
2. Vérifiez les logs de l'application
3. Testez localement avec Docker:
   ```bash
   cd backend
   docker build -t test-mbti .
   docker run -p 8000:8000 test-mbti
   ```

---

**Date:** 2026-01-20  
**Fichiers modifiés:** `backend/Dockerfile`  
**Status:** ✅ Prêt à déployer
