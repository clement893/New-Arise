# Correction du Healthcheck - Problème de Démarrage

**Date:** 2025-01-25  
**Problème:** Le healthcheck échoue lors du déploiement Railway

---

## Problème Identifié

Le healthcheck Railway échoue avec "service unavailable" après le build Docker. L'application ne démarre pas correctement ou prend trop de temps à démarrer.

---

## Corrections Appliquées

### 1. Correction du Chemin Healthcheck ✅

**Fichiers modifiés:**
- `backend/Dockerfile` - Healthcheck avec trailing slash
- `backend/railway.json` - Healthcheck path avec trailing slash
- `backend/app/api/v1/endpoints/health.py` - Support des deux formats (avec/sans slash)

**Changements:**
- Healthcheck utilise maintenant `/api/v1/health/` (avec trailing slash)
- Endpoint supporte les deux formats pour compatibilité
- Augmentation du `start-period` à 120s (au lieu de 90s)

### 2. Amélioration du Démarrage Uvicorn ✅

**Fichier modifié:**
- `backend/entrypoint.sh`

**Changements:**
- Ajout de `--timeout-keep-alive 30` pour maintenir les connexions
- Ajout de `--limit-concurrency 1000` pour limiter la concurrence
- Ajout de `--backlog 2048` pour gérer plus de requêtes en attente
- Meilleure gestion des erreurs

### 3. Amélioration de l'Endpoint Root ✅

**Fichier modifié:**
- `backend/app/main.py`

**Changements:**
- Ajout de timestamp dans la réponse root
- Documentation de sécurité ajoutée
- Endpoint public pour health checks

### 4. Amélioration des Endpoints Health ✅

**Fichier modifié:**
- `backend/app/api/v1/endpoints/health.py`

**Changements:**
- Support des deux formats (avec/sans trailing slash)
- Suppression de l'exposition d'erreurs dans les health checks
- Documentation de sécurité

---

## Configuration Railway

**Fichier:** `backend/railway.json`

```json
{
  "healthcheckPath": "/api/v1/health/",
  "healthcheckTimeout": 180,
  "healthcheckInterval": 20
}
```

**Changements:**
- Timeout augmenté à 180s (au lieu de 120s)
- Interval augmenté à 20s (au lieu de 15s)
- Path avec trailing slash

---

## Configuration Docker Healthcheck

**Fichier:** `backend/Dockerfile`

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD sh -c 'PORT=${PORT:-8000}; python -c "import urllib.request; import sys; import socket; socket.setdefaulttimeout(5); url=f\"http://localhost:{PORT}/api/v1/health/\"; r=urllib.request.urlopen(url, timeout=5); sys.exit(0 if r.getcode()==200 else 1)"' || exit 1
```

**Changements:**
- `start-period` augmenté à 120s
- Utilisation de `/api/v1/health/` avec trailing slash
- Ajout de `socket.setdefaulttimeout(5)` pour meilleure gestion des timeouts

---

## Endpoints Health Disponibles

1. **`/api/v1/health/`** - Health check simple (toujours OK)
2. **`/api/v1/health/health`** - Health check simple (alias)
3. **`/api/v1/health/ready`** - Readiness check (vérifie DB)
4. **`/api/v1/health/live`** - Liveness check
5. **`/api/v1/health/startup`** - Startup check
6. **`/api/v1/health/detailed`** - Health check détaillé
7. **`/`** - Root endpoint (health check simple)

---

## Tests Recommandés

1. **Test local:**
   ```bash
   # Démarrer le backend
   cd backend
   sh entrypoint.sh
   
   # Tester le healthcheck
   curl http://localhost:8000/api/v1/health/
   curl http://localhost:8000/
   ```

2. **Test Docker:**
   ```bash
   # Build et run
   docker build -t backend-test -f backend/Dockerfile backend/
   docker run -p 8000:8000 backend-test
   
   # Tester le healthcheck
   curl http://localhost:8000/api/v1/health/
   ```

3. **Vérifier les logs:**
   - Vérifier que l'application démarre correctement
   - Vérifier qu'il n'y a pas d'erreurs au démarrage
   - Vérifier que les migrations se terminent avant le healthcheck

---

## Points d'Attention

1. **Migrations:** Les migrations peuvent prendre du temps. Le `start-period` de 120s devrait être suffisant.

2. **Database Connection:** Si la base de données n'est pas disponible, l'application devrait quand même démarrer (le health check simple ne vérifie pas la DB).

3. **Port:** Railway définit automatiquement la variable `PORT`. L'application doit l'utiliser.

4. **Logs:** Vérifier les logs Railway pour voir les erreurs exactes si le problème persiste.

---

## Prochaines Étapes

1. **Déployer** les changements
2. **Surveiller** les logs Railway
3. **Vérifier** que le healthcheck passe
4. **Tester** tous les endpoints health

---

**Les corrections ont été appliquées !** ✅
