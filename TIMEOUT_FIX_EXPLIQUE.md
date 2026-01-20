# Fix Timeout Playwright - Explications

## 🎯 Nouveau Problème Détecté

Après avoir ajouté `--create-home` au Dockerfile, un nouveau problème est apparu:

```
Error: Page.goto: Timeout 30000ms exceeded
```

## 🔍 Cause

Le site 16Personalities a des **requêtes réseau continues** (analytics, tracking, etc.) qui empêchent l'état `networkidle` d'être jamais atteint.

### Qu'est-ce que "networkidle"?

`networkidle` attend que le réseau soit inactif (pas de requêtes pendant 500ms). Mais 16Personalities:
- Fait des requêtes analytics continues
- Charge des publicités
- Envoie des events de tracking
- → Le réseau n'est **jamais** inactif → **Timeout**

## ✅ Solutions Appliquées

### 1. Changement de Stratégie d'Attente

**Avant:**
```python
await page.goto(url, wait_until="networkidle", timeout=30000)
```

**Après:**
```python
await page.goto(url, wait_until="domcontentloaded", timeout=60000)
```

**Pourquoi `domcontentloaded`?**
- ✅ Attend que le DOM HTML soit chargé
- ✅ Ne dépend pas des requêtes réseau
- ✅ Plus rapide et plus fiable
- ✅ Le JavaScript se charge après, mais le contenu est là

### 2. Timeout Augmenté

- **Avant:** 30 secondes
- **Après:** 60 secondes

**Pourquoi?**
- Railway peut être plus lent à démarrer Chromium
- Cloudflare peut faire des vérifications
- Première requête depuis un nouveau container est plus lente

### 3. Attente JavaScript Augmentée

```python
# Attendre que JavaScript rende le contenu
await page.wait_for_timeout(3000)  # Était 2000ms

# Attendre un peu plus après détection du body
await page.wait_for_timeout(2000)  # Nouveau

# Total: ~5 secondes d'attente pour JavaScript
```

### 4. Vérification du Home Directory

**Ajouté au Dockerfile:**
```dockerfile
# Créer le cache directory avec bonnes permissions
RUN mkdir -p /home/appuser/.cache && \
    chmod 755 /home/appuser/.cache

# Vérifier l'installation
RUN playwright --version && \
    ls -la /home/appuser/.cache/ms-playwright/
```

## 📊 Comparaison

| Aspect | Avant | Après |
|--------|-------|-------|
| Wait strategy | `networkidle` | `domcontentloaded` |
| Timeout | 30s | 60s |
| Attente JS | 2s | 5s total |
| Home directory | Implicite | Explicite + perms |
| Vérification | Aucune | Version + ls |

## 🚀 Impact

### Avantages
- ✅ Plus fiable (pas dépendant du réseau)
- ✅ Plus rapide en pratique (domcontentloaded < networkidle)
- ✅ Fonctionne avec sites analytics-heavy
- ✅ Meilleure tolérance aux connexions lentes

### Temps d'Import Attendu

```
Navigation (domcontentloaded): ~2-5s
Attente JavaScript: ~5s
Extraction + Parsing: ~3s
Analyse OpenAI: ~5-10s
-------------------------
Total: ~15-25 secondes
```

Toujours dans les 60 secondes de timeout.

## 🔍 Logs Attendus

**Avec les nouveaux changements:**

```
INFO: Using Playwright headless browser...
INFO: Navigating to URL...
INFO: Waiting for JavaScript to render content...
INFO: Page body detected
INFO: Playwright fetched 118470 characters of HTML
INFO: Found score: Introverted: 54%
INFO: Successfully parsed MBTI data: ISFP
```

**Si ça timeout encore:**

```
ERROR: Error in Playwright fetch: Page.goto: Timeout 60000ms exceeded
```

→ Alors c'est un problème réseau ou Cloudflare bloque complètement.

## 🧪 Test Local

Si vous voulez tester les changements localement:

```bash
cd backend
python scripts/check_playwright.py
```

Le script devrait montrer:
- ✓ Page chargée avec succès
- ✓ Contenu extrait (~9000+ caractères)

## ⚠️ Si le Timeout Persiste

### Option 1: Augmenter encore le timeout

Dans `pdf_ocr_service.py`, ligne ~1220:
```python
await page.goto(url, wait_until="domcontentloaded", timeout=90000)  # 90s
```

### Option 2: Utiliser wait_until="load"

```python
await page.goto(url, wait_until="load", timeout=60000)
```

`load` attend plus de ressources que `domcontentloaded` mais moins que `networkidle`.

### Option 3: Pas d'attente du tout

```python
await page.goto(url, timeout=60000)  # Défaut: 'load'
```

### Option 4: Cloudflare Challenge

Si Cloudflare bloque Railway:
- Ajouter des headers supplémentaires
- Utiliser playwright-stealth
- Ou accepter que certains profils ne peuvent pas être importés automatiquement

## 📝 Notes Techniques

### Pourquoi domcontentloaded suffit?

16Personalities est une SPA (Single Page Application) React/Next.js:
1. **HTML initial** est chargé rapidement
2. **JavaScript** charge et rend le contenu
3. **Données** sont souvent inline dans le HTML ou chargées rapidement

`domcontentloaded` + 5s d'attente est suffisant pour avoir tout le contenu.

### Pourquoi pas networkidle?

`networkidle` aurait du sens pour:
- Sites qui chargent le contenu via AJAX tardif
- Sites où le contenu dépend de requêtes réseau

Mais 16Personalities:
- Contenu dans le HTML initial
- Requêtes analytics continues
- → `networkidle` ne se déclenche jamais

## 🎉 Résultat Attendu

Après le déploiement avec ces changements:
- ✅ Plus de timeout en conditions normales
- ✅ Import en 15-25 secondes
- ✅ Fonctionne même avec connexion lente
- ✅ Tolérant aux sites avec analytics

## 📞 Debug

Si vous voulez voir exactement ce qui se passe, ajoutez dans les logs Railway:

```python
# Dans _fetch_html_with_playwright, avant page.goto
page.on("console", lambda msg: logger.info(f"Browser console: {msg.text}"))
page.on("pageerror", lambda err: logger.error(f"Browser error: {err}"))
```

---

**Date:** 2026-01-20  
**Version:** 2.0 (avec timeout fix)  
**Status:** ✅ Prêt à déployer
