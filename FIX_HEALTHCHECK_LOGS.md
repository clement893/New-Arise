# Correction Healthcheck - Amélioration des Logs

**Date:** 2025-01-25  
**Problème:** Healthcheck échoue toujours, aucun log visible de l'application

---

## Analyse du Problème

Le healthcheck Railway échoue systématiquement après 3 minutes, mais **aucun log de l'application n'est visible**. Cela suggère que :
1. L'entrypoint.sh ne s'exécute pas
2. L'entrypoint.sh s'exécute mais crash immédiatement
3. Les logs ne sont pas visibles dans Railway (redirection incorrecte)

---

## Solutions Appliquées

### 1. Redirection de Tous les Logs vers stderr ✅

**Fichier:** `backend/entrypoint.sh`

**Changement:** Tous les `echo` redirigent maintenant vers `stderr` (`>&2`) pour être visibles dans les logs Railway.

```bash
# Au début du script
exec 2>&1  # Redirige stderr vers stdout pour Railway

# Tous les echo
echo "Message" >&2
```

**Impact:**
- ✅ Tous les messages sont visibles dans Railway
- ✅ Logs de démarrage visibles
- ✅ Erreurs visibles immédiatement

### 2. Amélioration des Messages de Démarrage ✅

**Fichier:** `backend/entrypoint.sh`

**Changements:**
- Messages de vérification Python/uvicorn
- Test d'import avec affichage des erreurs
- Messages de démarrage Uvicorn plus détaillés

**Exemple:**
```bash
echo "Verifying Python installation..." >&2
echo "✓ Python found: $(which python)" >&2
echo "Verifying uvicorn installation..." >&2
echo "✓ uvicorn is installed" >&2
```

### 3. Test d'Import avec Affichage des Erreurs ✅

**Fichier:** `backend/entrypoint.sh`

**Changement:** Le test d'import affiche maintenant l'erreur complète si l'import échoue.

```bash
IMPORT_OUTPUT=$(python -c "from app.main import app; print('✓ Application imported successfully')" 2>&1)
IMPORT_EXIT=$?
if [ $IMPORT_EXIT -ne 0 ]; then
    echo "❌ ERROR: Failed to import application!" >&2
    echo "Import error output:" >&2
    echo "$IMPORT_OUTPUT" >&2
    exit 1
fi
```

**Impact:**
- ✅ Erreurs d'import visibles immédiatement
- ✅ Diagnostic rapide des problèmes

### 4. CMD dans Dockerfile ✅

**Fichier:** `backend/Dockerfile`

**Changement:** Ajout d'un `CMD` en plus de l'`ENTRYPOINT` pour garantir que Railway utilise le bon script.

```dockerfile
ENTRYPOINT ["./entrypoint.sh"]
CMD ["./entrypoint.sh"]
```

**Impact:**
- ✅ Garantit que entrypoint.sh s'exécute
- ✅ Compatible avec Railway et Docker

---

## Diagnostic

Avec ces corrections, les logs Railway devraient maintenant afficher :

### 1. Messages de Démarrage
```
==========================================
Backend startup configuration:
PORT environment variable: 8000
DATABASE_URL set: yes
Environment: production
Python version: Python 3.11.x
Working directory: /app
==========================================
```

### 2. Vérifications
```
Verifying Python installation...
✓ Python found: /usr/local/bin/python
Verifying uvicorn installation...
✓ uvicorn is installed
```

### 3. Test d'Import
```
Testing application import...
✓ Application imported successfully
✓ Application import test passed
```

### 4. Démarrage Uvicorn
```
==========================================
Starting Uvicorn on 0.0.0.0:8000...
==========================================
Application will be available at http://0.0.0.0:8000
Health check endpoint: http://0.0.0.0:8000/api/v1/health/
Root endpoint: http://0.0.0.0:8000/
==========================================
```

### 5. Logs FastAPI
```
==================================================
FastAPI Application Starting...
==================================================
✓ FastAPI Application Ready - Starting server
  Environment: production
  Port: 8000
  Health endpoint available at: /api/v1/health/
  Root endpoint available at: /
==================================================
```

---

## Si le Problème Persiste

Si les logs n'apparaissent toujours pas, vérifier :

### 1. Railway utilise-t-il le bon startCommand ?
Vérifier dans Railway que `startCommand` est bien `sh entrypoint.sh` (défini dans `railway.json`).

### 2. L'entrypoint.sh est-il exécutable ?
```bash
ls -la backend/entrypoint.sh
# Doit afficher: -rwxr-xr-x
```

### 3. Test Local
```bash
cd backend
sh entrypoint.sh
```

### 4. Vérifier les Variables d'Environnement
- `SECRET_KEY` doit être défini
- `DATABASE_URL` doit être défini
- `PORT` est défini automatiquement par Railway

---

## Fichiers Modifiés

### Backend
- ✅ `backend/entrypoint.sh` - Tous les echo redirigés vers stderr
- ✅ `backend/Dockerfile` - Ajout de CMD
- ✅ `backend/railway.json` - Déjà correct

---

## Résultat Attendu

Après ces corrections :
1. ✅ Tous les logs sont visibles dans Railway
2. ✅ Messages de démarrage clairs
3. ✅ Erreurs visibles immédiatement
4. ✅ Diagnostic rapide des problèmes

---

**Les corrections ont été appliquées !** ✅

Les logs devraient maintenant être visibles dans Railway pour diagnostiquer le problème exact.
