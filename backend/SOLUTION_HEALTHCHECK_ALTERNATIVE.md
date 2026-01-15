# Solution Alternative - Healthcheck Problème

**Date:** 2026-01-15  
**Problème:** Healthcheck échoue, AUCUN log visible

---

## 🔴 Problème Identifié

**Aucun log n'apparaît**, ce qui suggère que :
1. Railway n'exécute pas le `startCommand` de `railway.json`
2. Railway utilise l'ENTRYPOINT du Dockerfile mais il y a un problème
3. Les logs ne sont pas capturés pour une raison inconnue

---

## ✅ Solution Alternative : Commande Directe

Au lieu d'utiliser un script shell complexe, démarrons Uvicorn directement.

### Option 1: Modifier railway.json

```json
{
  "deploy": {
    "startCommand": "python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/api/v1/health/",
    "healthcheckTimeout": 300,
    "healthcheckInterval": 10
  }
}
```

**Avantages:**
- ✅ Pas de script shell intermédiaire
- ✅ Logs directement visibles
- ✅ Plus simple à déboguer

**Inconvénients:**
- ❌ Pas de migrations automatiques
- ❌ Pas de vérifications pré-démarrage

### Option 2: Script Python au lieu de Shell

Créer `start.py`:
```python
#!/usr/bin/env python3
import os
import sys
import subprocess
import asyncio
from pathlib import Path

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

print("=" * 50)
print("Python Entrypoint Started")
print(f"PORT: {os.getenv('PORT', '8000')}")
print("=" * 50)

# Start migrations in background (if needed)
# Then start uvicorn

port = os.getenv('PORT', '8000')
subprocess.run([
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port,
    '--log-level', 'info'
])
```

---

## 🎯 Recommandation

**Essayer Option 1 d'abord** (commande directe dans railway.json) :
- C'est le plus simple
- Élimine tous les problèmes de script shell
- Les logs seront directement visibles

Si cela fonctionne, on pourra ensuite ajouter les migrations en arrière-plan via un script Python séparé.

---

## 📝 Fichiers à Modifier

1. `backend/railway.json` - Changer startCommand
2. Optionnel: Créer `backend/start.py` pour gérer migrations + uvicorn

---

**Action:** Modifier `railway.json` pour utiliser la commande directe.
