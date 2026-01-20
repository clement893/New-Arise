# Guide de Résolution - Import MBTI depuis URL

## Problème
Lorsque vous essayez d'importer un profil MBTI depuis une URL 16Personalities, vous recevez l'erreur:
```
Error: Failed to extract data from URL. HTML parsing error: Access forbidden (403).
```

## Cause
Le site 16Personalities utilise **Cloudflare** et **JavaScript** pour afficher le contenu. Les requêtes HTTP simples ne fonctionnent pas, même pour les profils publics. Il faut utiliser **Playwright** (un navigateur headless) pour accéder correctement au contenu.

## Solution

### Étape 1: Vérifier si Playwright est installé

Exécutez le script de diagnostic:

```bash
cd backend
python scripts/check_playwright.py
```

Ce script va vérifier:
- ✓ Si Playwright est installé
- ✓ Si le navigateur Chromium est installé
- ✓ Si Playwright peut lancer le navigateur
- ✓ Si Playwright peut accéder à 16Personalities

### Étape 2: Installer Playwright (si nécessaire)

#### Sur votre machine de développement (Windows):

```powershell
# Activer l'environnement virtuel
cd backend
.\.venv\Scripts\Activate.ps1

# Installer Playwright
pip install playwright

# Installer le navigateur Chromium
playwright install chromium

# Installer les dépendances système (si demandé)
playwright install-deps chromium
```

#### Sur le serveur de production (Linux):

```bash
cd backend
source venv/bin/activate

# Installer Playwright
pip install playwright

# Installer le navigateur Chromium
playwright install chromium

# Installer les dépendances système (IMPORTANT pour Linux)
playwright install-deps chromium
```

### Étape 3: Redémarrer le backend

Après l'installation de Playwright, redémarrez votre serveur backend:

```bash
# En développement
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Ou avec le script de démarrage
./start-backend.ps1  # Windows
./start-backend.sh   # Linux
```

### Étape 4: Tester l'import

1. Allez sur votre application web
2. Naviguez vers **Assessments > MBTI > Upload**
3. Essayez d'importer depuis une URL:
   - Exemple: `https://www.16personalities.com/profiles/aee39b0fb6725`

## Vérification que votre profil est public

Si vous recevez toujours une erreur 403, vérifiez que votre profil 16Personalities est bien public:

1. Allez sur [16personalities.com](https://www.16personalities.com)
2. Connectez-vous à votre compte
3. Allez dans **Settings** (Paramètres)
4. Cherchez l'option **Public Profile** (Profil Public)
5. **Activez** cette option
6. Sauvegardez les modifications
7. Réessayez l'import avec l'URL de votre profil

## Comment fonctionne l'extraction

### 1. Playwright charge la page
Le backend utilise Playwright pour charger la page comme un vrai navigateur:
- Exécute tout le JavaScript
- Attend que le contenu soit complètement chargé
- Contourne la protection Cloudflare

### 2. Extraction du HTML complet
Une fois la page chargée, le système extrait:
- Le texte visible de la page
- Les pourcentages de chaque dimension (I/E, N/S, T/F, J/P, A/T)
- Les descriptions des forces et faiblesses
- Le type MBTI (ex: ISFP-T)

### 3. Analyse avec IA
Le système utilise OpenAI pour:
- Structurer les données extraites
- Identifier les scores exacts
- Extraire les descriptions et traits

### 4. Sauvegarde dans la base de données
Les résultats sont sauvegardés dans votre profil et disponibles dans vos rapports.

## Modifications apportées au code

### 1. Meilleure gestion des erreurs
- ✓ Message plus clair quand Playwright n'est pas installé
- ✓ Instructions d'installation incluses dans l'erreur
- ✓ Distinction entre profil privé et problème technique

### 2. Amélioration de l'extraction des pourcentages
- ✓ Regex améliorées pour capturer les scores (ex: "54% Introverted")
- ✓ Pré-extraction avant l'analyse IA
- ✓ Support des différents formats de pourcentages

### 3. Playwright obligatoire
- ✓ Le système n'essaie plus les requêtes HTTP simples (qui échouent)
- ✓ Playwright est maintenant **requis** pour les URLs 16Personalities
- ✓ Message d'erreur clair si Playwright n'est pas disponible

## Fichiers modifiés

1. **`backend/app/services/pdf_ocr_service.py`**
   - Amélioration de `extract_mbti_from_html_url()`
   - Meilleure extraction des pourcentages
   - Gestion d'erreur améliorée

2. **`backend/scripts/check_playwright.py`** (nouveau)
   - Script de diagnostic pour vérifier l'installation de Playwright

3. **`backend/requirements.txt`**
   - Playwright déjà inclus (ligne 75)

## Dépannage

### Erreur: "Executable doesn't exist"
Cela signifie que le navigateur Chromium n'est pas installé.

**Solution:**
```bash
playwright install chromium
```

### Erreur: "Missing system dependencies"
Sur Linux, Playwright nécessite des dépendances système.

**Solution:**
```bash
playwright install-deps chromium
```

### Erreur 403 persistante
Si vous recevez toujours une erreur 403 même après avoir vérifié que votre profil est public:

1. Essayez d'accéder à l'URL dans un navigateur normal (non connecté)
2. Si vous voyez le profil, le problème vient du backend
3. Si vous voyez une erreur 403, le profil est privé ou l'URL est incorrecte

### Le contenu ne se charge pas complètement
Si Playwright arrive à charger la page mais le contenu est vide:

1. Vérifiez que l'URL est correcte
2. Essayez d'augmenter le timeout dans le code (actuellement 30 secondes)
3. Vérifiez les logs du backend pour plus de détails

## Support

Si vous rencontrez toujours des problèmes après avoir suivi ce guide:

1. Exécutez le script de diagnostic: `python backend/scripts/check_playwright.py`
2. Vérifiez les logs du backend
3. Partagez les messages d'erreur complets

## Exemple de profil public

URL de test: `https://www.16personalities.com/profiles/aee39b0fb6725`

Ce profil devrait fonctionner si Playwright est correctement installé. Utilisez-le pour tester votre configuration.

## Résumé des commandes

```bash
# 1. Vérifier l'installation
python backend/scripts/check_playwright.py

# 2. Installer Playwright (si nécessaire)
pip install playwright
playwright install chromium
playwright install-deps chromium  # Linux seulement

# 3. Redémarrer le backend
# (selon votre méthode de démarrage)

# 4. Tester avec une URL
# Via l'interface web: Assessments > MBTI > Upload
```

---

**Dernière mise à jour:** 2026-01-20
**Version:** 1.0
