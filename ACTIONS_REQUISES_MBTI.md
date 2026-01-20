# ⚡ ACTIONS REQUISES - Fix MBTI Railway

## 🎯 Situation

**Problème:** L'import MBTI depuis URL fonctionne en **local** mais échoue en **production** (Railway)

**Erreur:**
```
BrowserType.launch: Executable doesn't exist at /home/appuser/.cache/ms-playwright/...
```

**Cause:** Les navigateurs Playwright ne sont pas installés dans le container Docker de production.

## ✅ Solution Appliquée

Le `backend/Dockerfile` a été **modifié** pour installer les navigateurs Playwright correctement.

## 🚀 CE QUE VOUS DEVEZ FAIRE MAINTENANT

### Étape 1: Commiter et pousser les changements

```bash
# 1. Vérifiez les changements
git status
# Vous devriez voir: backend/Dockerfile

# 2. Ajoutez les fichiers modifiés
git add backend/Dockerfile
git add DEPLOYER_FIX_MBTI_RAILWAY.md
git add ACTIONS_REQUISES_MBTI.md
git add backend/scripts/test_mbti_url_production.py

# 3. Commitez
git commit -m "fix(backend): Install Playwright browsers in Docker for MBTI URL import

- Install Chromium as appuser in runner stage
- Set PLAYWRIGHT_BROWSERS_PATH environment variable
- Fix 'Executable doesn't exist' error on Railway
- Add deployment guide and test script

Fixes: MBTI URL import failing on production with 403 error
Tested: Playwright works locally, requires redeploy for production"

# 4. Poussez vers votre repository
git push origin main
```

### Étape 2: Déployer sur Railway

Railway détectera automatiquement le push et **redéploiera automatiquement**.

#### Suivez le déploiement:

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet backend
3. Allez dans **Deployments**
4. Vous devriez voir un nouveau déploiement en cours

#### Vérifiez les logs de build:

Cherchez ces lignes dans les logs:
```
#XX RUN playwright install chromium
Downloading Chromium...
Chromium downloaded successfully
```

**⏱️ Durée attendue:** 5-10 minutes (plus long que d'habitude car Chromium doit être téléchargé)

### Étape 3: Vérifier le déploiement

Une fois le déploiement terminé:

#### Option A: Test manuel via l'application web

1. Allez sur votre application en production
2. Connectez-vous
3. Allez dans **Assessments > MBTI > Upload**
4. Testez avec: `https://www.16personalities.com/profiles/aee39b0fb6725`

**Résultat attendu:**
- ✅ Import réussi en 10-30 secondes
- ✅ Type: ISFP-T
- ✅ Scores affichés

#### Option B: Test automatique via script

```bash
# Depuis votre machine locale
cd backend

# Définissez les variables d'environnement
export API_BASE_URL="https://votre-app.railway.app"
export AUTH_TOKEN="votre-token-d-auth"

# Lancez le test
python scripts/test_mbti_url_production.py
```

Le script testera automatiquement l'import et affichera les résultats.

### Étape 4: Vérifier les logs de production

Une fois le test lancé, vérifiez les logs Railway:

```bash
# Via Railway CLI
railway logs --tail

# Ou via le Dashboard Railway
# Deployments > View Logs
```

**Logs attendus lors d'un import:**
```
INFO: Using Playwright headless browser to load JavaScript content...
INFO: Playwright fetched 118470 characters of HTML
INFO: Found score: Introverted: 54%
INFO: Successfully parsed MBTI data: ISFP
```

## ⚠️ Si le déploiement échoue

### Erreur de build

Si le build échoue avec une erreur liée à Playwright:

1. Vérifiez que `requirements.txt` contient bien `playwright>=1.40.0`
2. Vérifiez les logs de build pour voir l'erreur exacte
3. Consultez `DEPLOYER_FIX_MBTI_RAILWAY.md` pour plus de détails

### Build réussi mais erreur persiste

Si le build passe mais l'erreur "Executable doesn't exist" persiste:

1. Vérifiez que Railway utilise bien le nouveau déploiement (pas une ancienne version)
2. Vérifiez dans les logs de démarrage que Playwright est disponible
3. Essayez de déclencher un rebuild complet sans cache:
   - Railway Dashboard > Settings > Clear Build Cache
   - Puis redéployez

### Timeout ou Out of Memory

Si le build timeout ou manque de mémoire:

1. Railway Free Tier peut manquer de ressources pour installer Chromium
2. Solutions:
   - Augmentez temporairement les ressources
   - Ou passez au plan Hobby ($5/mois)

## 📊 Checklist de déploiement

- [ ] Changements committés et poussés
- [ ] Nouveau déploiement détecté par Railway
- [ ] Build terminé avec succès (vérifier "playwright install chromium" dans les logs)
- [ ] Application démarrée correctement
- [ ] Health check vert
- [ ] Test MBTI réussi via l'application ou le script
- [ ] Logs montrent l'extraction Playwright

## 🎉 Succès confirmé

Quand tout fonctionne, vous verrez:

**Dans l'application:**
- ✅ Import depuis URL fonctionne
- ✅ Résultats MBTI complets affichés
- ✅ Plus d'erreur 403 ou "Executable doesn't exist"

**Dans les logs:**
```
INFO: Using Playwright headless browser...
INFO: Playwright fetched XXXXX characters of HTML
INFO: Successfully parsed MBTI data: ISFP
```

## 📞 Besoin d'aide?

Si vous rencontrez des problèmes:

1. **Vérifiez les logs de build Railway** pour voir si Chromium a été téléchargé
2. **Vérifiez les logs de l'application** lors d'un import
3. **Lisez le guide détaillé:** `DEPLOYER_FIX_MBTI_RAILWAY.md`
4. **Testez localement avec Docker:**
   ```bash
   cd backend
   docker build -t test-mbti .
   docker run -p 8000:8000 test-mbti
   # Puis testez l'import
   ```

## 📝 Résumé

| Problème | Solution | Action |
|----------|----------|--------|
| Navigateurs Playwright manquants | Dockerfile modifié | Déployer sur Railway |
| Erreur "Executable doesn't exist" | Installation en tant qu'appuser | Pusher les changements |
| Import fonctionne en local seulement | Production mise à jour | Vérifier après déploiement |

---

**Prochaine étape:** Commiter et pousser les changements (voir Étape 1 ci-dessus)

**Date:** 2026-01-20  
**Status:** ⏳ En attente de déploiement  
**Temps estimé:** 10-15 minutes (commit + build + test)
