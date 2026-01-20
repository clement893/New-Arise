# Dépannage - Erreur "No MBTI data could be extracted"

## 🔴 Erreur Actuelle

```
Error: No MBTI data could be extracted from the provided source
```

**Status Code:** 400 (Bad Request)  
**Endpoint:** `/api/v1/assessments/mbti/upload-pdf`  
**URL testée:** `https://www.16personalities.com/profiles/aee39b0fb6725`

## 🔍 Diagnostic

### ✅ Code Vérifié

Toutes les modifications sont **committées** et **dans le repository**:
- ✅ `Dockerfile`: Installation de Playwright/Chromium comme appuser
- ✅ `pdf_ocr_service.py`: Timeout fix (domcontentloaded, 60s)
- ✅ `assessments.py`: Leadership capabilities ajoutées

### ❓ Vérifications Railway

Le problème est probablement que:
1. **Railway n'a pas redéployé** le backend avec les nouveaux changements
2. **Playwright/Chromium n'est pas installé** sur le serveur
3. **Le build Docker a échoué** lors de l'installation de Chromium

## 🛠️ Solutions

### Solution 1: Vérifier le Déploiement Railway

#### Via Railway Dashboard

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet backend
3. Allez dans **Deployments**
4. Vérifiez le dernier déploiement:
   - Est-il marqué comme **"Success"**? ✅
   - Ou **"Failed"**? ❌

#### Via Railway CLI

```bash
railway logs --tail 100
```

Cherchez dans les logs:

**✅ Si tout va bien, vous devriez voir:**
```
#XX RUN playwright install chromium
Downloading Chromium...
✓ Chromium downloaded successfully
```

**❌ Si problème, vous pourriez voir:**
```
ERROR: Could not install Chromium
ERROR: Out of memory
ERROR: Timeout during build
```

### Solution 2: Forcer un Redéploiement

Si Railway n'a pas détecté les changements:

```bash
# 1. Commit vide pour forcer rebuild
git commit --allow-empty -m "chore: Force Railway rebuild for Playwright"
git push origin main
```

Ou via Railway Dashboard:
1. Deployments
2. Cliquez sur le dernier déploiement
3. **⋯ > Redeploy**

### Solution 3: Vérifier les Logs d'Erreur

Les logs devraient montrer exactement pourquoi l'extraction échoue:

```bash
railway logs --tail 200 | grep -i "error\|playwright\|mbti"
```

**Erreurs possibles:**

#### A. Playwright pas disponible
```
ERROR: Playwright not available. Install with: pip install playwright...
```

**Solution:** Le build Docker a échoué. Vérifiez les logs de build.

#### B. Chromium manquant
```
ERROR: BrowserType.launch: Executable doesn't exist at /home/appuser/.cache/...
```

**Solution:** `playwright install chromium` n'a pas fonctionné. Vérifiez:
- Que l'utilisateur `appuser` a les bonnes permissions
- Que le `--create-home` flag est dans le Dockerfile

#### C. Timeout Playwright
```
ERROR: Page.goto: Timeout 60000ms exceeded
```

**Solution:** Augmenter le timeout ou vérifier la connexion réseau du serveur.

#### D. Cloudflare bloque
```
ERROR: Access forbidden (403)
```

**Solution:** Cloudflare peut bloquer Railway. Essayez avec un autre profil URL ou utilisez l'upload PDF.

### Solution 4: Test Manuel sur Railway

Connectez-vous au container Railway et testez:

```bash
# Via Railway CLI
railway run bash

# Puis dans le container
python -c "from app.services.pdf_ocr_service import PLAYWRIGHT_AVAILABLE; print(f'Playwright: {PLAYWRIGHT_AVAILABLE}')"

# Devrait afficher: Playwright: True

# Vérifier Chromium
ls -la /home/appuser/.cache/ms-playwright/

# Devrait lister chromium_headless_shell-1200/
```

### Solution 5: Vérifier les Variables d'Environnement

Railway doit avoir:
- `OPENAI_API_KEY` configurée
- Suffisamment de RAM (au moins 512MB pour Chromium)
- Pas de limite de temps de build trop courte

```bash
# Via Railway CLI
railway variables

# Ou via Dashboard > Variables
```

### Solution 6: Rebuild Complet sans Cache

Si le cache Docker est corrompu:

**Via Railway Dashboard:**
1. Settings
2. **Clear Build Cache**
3. Redéployez

**Via CLI:**
```bash
railway up --reset-cache
```

## 🧪 Test de Diagnostic

Créons un endpoint de test pour vérifier Playwright:

**Ajoutez temporairement à `assessments.py`:**

```python
@router.get("/mbti/test-playwright")
async def test_playwright():
    """Test if Playwright is available and working"""
    try:
        from app.services.pdf_ocr_service import PDFOCRService, PLAYWRIGHT_AVAILABLE
        
        if not PLAYWRIGHT_AVAILABLE:
            return {"status": "error", "message": "Playwright not available"}
        
        # Try to launch browser
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            await browser.close()
            return {"status": "success", "message": "Playwright working!"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

**Testez:**
```bash
curl https://your-app.railway.app/api/v1/assessments/mbti/test-playwright
```

**Résultat attendu:**
```json
{"status": "success", "message": "Playwright working!"}
```

## 📋 Checklist de Dépannage

- [ ] Vérifier que le dernier commit contient les changements Dockerfile
- [ ] Vérifier que Railway a bien redéployé
- [ ] Vérifier les logs de build pour "playwright install chromium"
- [ ] Vérifier que le build s'est terminé avec succès (pas d'OOM, timeout)
- [ ] Vérifier que l'application démarre sans erreur
- [ ] Vérifier les logs runtime lors d'un import
- [ ] Tester avec le endpoint de diagnostic
- [ ] Vérifier les variables d'environnement (OPENAI_API_KEY)
- [ ] Essayer un rebuild complet sans cache

## 💡 Causes Communes

### 1. Railway n'a Pas Redéployé
**Symptôme:** Le code est committé mais l'erreur persiste  
**Solution:** Force push ou redéploiement manuel

### 2. Out of Memory pendant Build
**Symptôme:** Build échoue lors de "playwright install chromium"  
**Solution:** Augmenter les ressources Railway ou passer au plan Hobby

### 3. Timeout de Build
**Symptôme:** Build s'arrête avant la fin de l'installation Chromium  
**Solution:** Augmenter le timeout de build dans les settings Railway

### 4. Permissions Incorrectes
**Symptôme:** "Permission denied" lors du lancement de Chromium  
**Solution:** Vérifier que `--create-home` est dans la création de l'appuser

### 5. Cache Docker Corrompu
**Symptôme:** Erreurs étranges, comportement incohérent  
**Solution:** Clear build cache et rebuild

## 🚀 Solution Rapide

Si vous êtes pressé:

```bash
# 1. Force rebuild
git commit --allow-empty -m "chore: Force Railway rebuild"
git push origin main

# 2. Attendez 10 minutes (le build prend du temps avec Chromium)

# 3. Vérifiez les logs
railway logs --tail 50

# 4. Testez l'import
```

## 📞 Si Rien ne Fonctionne

### Option Alternative: Upload PDF

En attendant que Playwright fonctionne sur Railway, utilisez l'upload PDF:

1. Allez sur 16Personalities avec votre profil
2. Téléchargez le PDF
3. Uploadez le PDF dans ARISE au lieu de l'URL

Cette méthode fonctionne même sans Playwright!

## 📝 Informations à Collecter

Si vous demandez de l'aide, fournissez:

1. **Logs de build Railway** (les 100 dernières lignes)
2. **Logs runtime** lors d'une tentative d'import
3. **Screenshot** du dashboard Railway (déploiements)
4. **Résultat** du endpoint de diagnostic `/mbti/test-playwright`
5. **Variables d'environnement** (sans les valeurs sensibles)

---

**Date:** 2026-01-20  
**Erreur:** "No MBTI data could be extracted"  
**Cause probable:** Playwright pas installé ou non fonctionnel sur Railway  
**Solution:** Vérifier déploiement et rebuild si nécessaire
