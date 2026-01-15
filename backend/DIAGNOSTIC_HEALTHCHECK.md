# Diagnostic Healthcheck - Problème Persistant

**Date:** 2026-01-15  
**Problème:** Healthcheck échoue toujours, AUCUN log visible du serveur

---

## 🔴 Symptômes

1. ✅ Build Docker réussit (12 secondes)
2. ❌ Healthcheck échoue après 5 minutes
3. ❌ **AUCUN log visible** du serveur qui démarre
4. ❌ Même pas le message "ENTRYPOINT SCRIPT STARTED"

---

## 🔍 Hypothèses

### Hypothèse 1: Railway n'exécute pas le startCommand
- Railway pourrait ignorer `railway.json` et utiliser l'ENTRYPOINT du Dockerfile
- L'ENTRYPOINT pourrait ne pas s'exécuter correctement

### Hypothèse 2: Le script crash immédiatement
- Le script pourrait crash avant d'afficher des logs
- Problème de permissions ou de chemin

### Hypothèse 3: Les logs ne sont pas capturés
- Railway pourrait ne pas capturer stdout/stderr
- Problème de configuration Railway

---

## ✅ Solutions Appliquées (Sans Succès)

1. ✅ Ajouté `sh -x` dans railway.json (mode debug)
2. ✅ Ajouté `PYTHONUNBUFFERED=1` dans Dockerfile
3. ✅ Simplifié redirection logs (`exec 2>&1`)
4. ✅ Ajouté messages de debug dans ENTRYPOINT
5. ✅ Vérifié permissions entrypoint.sh
6. ✅ Augmenté healthcheckTimeout à 300s
7. ✅ Réduit healthcheckInterval à 10s

---

## 🎯 Prochaines Étapes Recommandées

### Option 1: Vérifier Configuration Railway
- Vérifier dans l'interface Railway que `railway.json` est bien détecté
- Vérifier que le service utilise bien le bon `startCommand`
- Vérifier les variables d'environnement (PORT, DATABASE_URL, etc.)

### Option 2: Simplifier l'ENTRYPOINT
- Créer un script minimal qui démarre directement Uvicorn
- Éliminer toutes les redirections complexes
- Tester avec un simple `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option 3: Vérifier les Logs Railway
- Accéder aux logs bruts dans l'interface Railway
- Vérifier s'il y a des logs cachés ou filtrés
- Vérifier les logs de build vs logs de runtime

### Option 4: Test Local
- Tester le Dockerfile localement
- Vérifier que l'entrypoint.sh fonctionne en local
- Comparer avec le comportement sur Railway

---

## 📝 Configuration Actuelle

### railway.json
```json
{
  "deploy": {
    "startCommand": "sh -x entrypoint.sh",
    "healthcheckPath": "/api/v1/health/",
    "healthcheckTimeout": 300,
    "healthcheckInterval": 10
  }
}
```

### Dockerfile ENTRYPOINT
```dockerfile
ENTRYPOINT ["/bin/sh", "-c", "echo '=== DOCKERFILE ENTRYPOINT EXECUTED ===' && ./entrypoint.sh"]
CMD ["/bin/sh", "-c", "echo '=== DOCKERFILE CMD EXECUTED ===' && ./entrypoint.sh"]
```

### entrypoint.sh
- Redirection: `exec 2>&1`
- PYTHONUNBUFFERED=1
- Messages de debug au début

---

## ⚠️ Problème Critique

**Aucun log n'est visible**, ce qui suggère que :
- Le script ne s'exécute pas du tout
- OU Railway ne capture pas les logs
- OU Il y a un problème de configuration Railway

**Action Requise:** Vérifier la configuration Railway dans l'interface web pour comprendre pourquoi aucun log n'apparaît.
