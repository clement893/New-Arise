# 🔍 Commandes de Debug pour Railway

## Problème Actuel

```
Error: No MBTI data could be extracted from the provided source
```

Le code est bien déployé, mais l'extraction échoue à l'exécution.

## 🛠️ Debug sur Railway

### Option 1: Logs en Temps Réel

```bash
# Installer Railway CLI si nécessaire
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet (si pas déjà fait)
railway link

# Voir les logs en temps réel
railway logs --tail 200
```

**Pendant que les logs s'affichent**, tentez un import depuis l'URL pour voir les erreurs exactes.

### Option 2: Accéder au Container

```bash
# Se connecter au container Railway
railway run bash

# Une fois connecté, vérifier:

# 1. Playwright installé?
python3 -c "from app.services.pdf_ocr_service import PLAYWRIGHT_AVAILABLE; print(f'Playwright available: {PLAYWRIGHT_AVAILABLE}')"

# 2. Chromium installé?
ls -la /home/appuser/.cache/ms-playwright/ 2>/dev/null || echo "Directory not found"

# 3. Test Playwright
python3 -c "
from playwright.async_api import async_playwright
import asyncio

async def test():
    try:
        async with async_playwright() as p:
            print('Launching browser...')
            browser = await p.chromium.launch(headless=True)
            print('Browser launched successfully!')
            await browser.close()
            return True
    except Exception as e:
        print(f'Error: {e}')
        return False

asyncio.run(test())
"

# 4. Variables d'environnement
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..." # Montre les 10 premiers caractères
```

### Option 3: Test Direct de l'Extraction

Créez ce fichier temporaire sur Railway: `/tmp/test_extraction.py`

```python
import asyncio
import sys
import os

# Add app to path
sys.path.insert(0, '/app')

async def test_extraction():
    from app.services.pdf_ocr_service import PDFOCRService, PLAYWRIGHT_AVAILABLE
    
    print(f"Playwright available: {PLAYWRIGHT_AVAILABLE}")
    
    if not PLAYWRIGHT_AVAILABLE:
        print("ERROR: Playwright not available!")
        return False
    
    try:
        ocr_service = PDFOCRService()
        print("OCR Service initialized")
        
        url = "https://www.16personalities.com/profiles/aee39b0fb6725"
        print(f"Testing extraction from: {url}")
        
        result = await ocr_service.extract_mbti_from_html_url(url)
        print(f"SUCCESS! Extracted type: {result.get('mbti_type', 'unknown')}")
        print(f"Full result: {result}")
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_extraction())
    sys.exit(0 if success else 1)
```

**Exécuter:**
```bash
python3 /tmp/test_extraction.py
```

## 📋 Checklist de Vérification

### 1. Playwright Installé?

```bash
railway run python3 -c "import playwright; print('OK')"
```

**Attendu:** `OK`  
**Si erreur:** Playwright n'est pas installé dans requirements.txt ou build a échoué

### 2. Chromium Disponible?

```bash
railway run ls -la /home/appuser/.cache/ms-playwright/
```

**Attendu:** Un dossier `chromium_headless_shell-XXXX/`  
**Si vide:** L'installation de Chromium a échoué dans le Dockerfile

### 3. Permissions OK?

```bash
railway run whoami
railway run ls -la /home/appuser/
```

**Attendu:** 
- User: `appuser`
- Home directory existe avec bonnes permissions

### 4. OpenAI API Key Configurée?

```bash
railway variables | grep OPENAI
```

**Attendu:** `OPENAI_API_KEY=sk-...`  
**Si absent:** Configurer la variable d'environnement

### 5. Réseau Fonctionne?

```bash
railway run curl -I https://www.16personalities.com/
```

**Attendu:** `HTTP/2 200`  
**Si erreur:** Problème réseau ou Cloudflare bloque Railway

## 🔧 Solutions Rapides

### Problème: Playwright Not Available

```bash
# Vérifier requirements.txt
railway run cat /app/requirements.txt | grep playwright

# Devrait afficher: playwright>=1.40.0

# Si absent, ajouter et redéployer
```

### Problème: Chromium Not Found

```bash
# Vérifier dans le Dockerfile
git show HEAD:backend/Dockerfile | grep "playwright install"

# Devrait afficher: RUN playwright install chromium

# Forcer rebuild
git commit --allow-empty -m "chore: Force Railway rebuild"
git push
```

### Problème: Permission Denied

```bash
# Vérifier création de appuser
railway run cat /etc/passwd | grep appuser

# Devrait afficher une ligne avec /home/appuser

# Vérifier home directory
railway run ls -la /home/ | grep appuser
```

### Problème: OpenAI API Key Missing

```bash
# Via Railway CLI
railway variables set OPENAI_API_KEY="sk-your-key-here"

# Ou via Dashboard: Variables > Add Variable
```

## 🚨 Erreurs Communes et Solutions

### Erreur 1: "module 'playwright' has no attribute 'async_api'"

**Cause:** Playwright mal installé  
**Solution:**
```bash
railway run pip install --upgrade playwright
railway run playwright install chromium
```

### Erreur 2: "Executable doesn't exist"

**Cause:** Chromium pas installé ou mauvais chemin  
**Solution:** Vérifier PLAYWRIGHT_BROWSERS_PATH et rebuild

### Erreur 3: "Timeout 60000ms exceeded"

**Cause:** Page trop lente ou réseau lent  
**Solution:** Augmenter timeout à 90000ms dans pdf_ocr_service.py

### Erreur 4: "No MBTI data could be extracted"

**Cause:** L'extraction HTML échoue complètement  
**Solution:** Utiliser le script de test ci-dessus pour voir l'erreur exacte

## 📊 Informations à Collecter

Pour un rapport de bug complet, collectez:

```bash
# 1. Version Python
railway run python3 --version

# 2. Playwright installé
railway run pip list | grep playwright

# 3. Structure du cache
railway run find /home/appuser/.cache -type d 2>/dev/null | head -20

# 4. Logs récents (pendant un import)
railway logs --tail 100 > railway_logs.txt

# 5. Variables d'environnement (sans valeurs sensibles)
railway variables > railway_vars.txt

# 6. Test extraction
railway run python3 /tmp/test_extraction.py > test_result.txt 2>&1
```

## 💡 Solution Temporaire

En attendant de résoudre le problème Playwright, utilisez l'**upload PDF**:

1. Allez sur votre profil 16Personalities
2. Téléchargez le PDF
3. Uploadez-le dans ARISE

Cette méthode fonctionne sans Playwright!

## 🎯 Prochaines Étapes

1. **Exécutez les commandes de checklist** ci-dessus
2. **Collectez les informations** (logs, erreurs)
3. **Identifiez l'erreur exacte** (Playwright? Chromium? Extraction?)
4. **Appliquez la solution** correspondante
5. **Testez** à nouveau l'import

---

**Date:** 2026-01-20  
**Erreur:** "No MBTI data could be extracted"  
**Prochaine action:** Exécuter les commandes de diagnostic Railway
