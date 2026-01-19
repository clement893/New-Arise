# 📖 Guide Étape par Étape - Railway

## 🎯 Objectif
Corriger le prix de $24900 à $299 dans la base de données

---

## 📋 ÉTAPE PAR ÉTAPE

### ÉTAPE 1️⃣ : Ouvrir Railway
```
1. Ouvrez votre navigateur
2. Allez sur : https://railway.app
3. Cliquez sur "Login" si nécessaire
```

### ÉTAPE 2️⃣ : Trouver le Projet
```
1. Sur le dashboard Railway, vous verrez tous vos projets
2. Cherchez le projet : "modelebackend-production" ou "New-Arise"
3. Cliquez dessus pour l'ouvrir
```

### ÉTAPE 3️⃣ : Ouvrir la Base de Données
```
1. Dans le projet, vous verrez plusieurs services
2. Cherchez le service "Postgres" ou "PostgreSQL" (icône cylindrique)
3. Cliquez dessus
```

### ÉTAPE 4️⃣ : Ouvrir l'Éditeur SQL
```
1. En haut de la page, vous verrez plusieurs onglets
2. Cliquez sur l'onglet "Query" ou "Data"
3. Vous verrez un éditeur de texte pour écrire du SQL
```

### ÉTAPE 5️⃣ : Copier le SQL
```
1. Ouvrez le fichier : backend/scripts/FIX_NOW.sql
2. Copiez TOUT le contenu (CTRL+A puis CTRL+C)
3. Collez dans l'éditeur Railway (CTRL+V)
```

OU copiez directement ceci :

```sql
UPDATE plans 
SET amount = 29900,
    name = 'REVELATION',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

SELECT id, name, amount, (amount::numeric / 100) as price_dollars 
FROM plans WHERE status = 'active';
```

### ÉTAPE 6️⃣ : Exécuter
```
1. Cliquez sur le bouton "Run" ou "Execute" ou "Play" (▶️)
2. Attendez 1-2 secondes
3. Vous verrez le résultat en dessous
```

### ÉTAPE 7️⃣ : Vérifier le Résultat
```
Vous devriez voir dans les résultats :
┌────┬────────────┬────────┬──────────────┐
│ id │ name       │ amount │ price_dollars│
├────┼────────────┼────────┼──────────────┤
│ 16 │ REVELATION │ 29900  │ 299.00       │
└────┴────────────┴────────┴──────────────┘

✓ Si vous voyez 299.00 → SUCCÈS !
```

### ÉTAPE 8️⃣ : Tester sur le Site
```
1. Allez sur : https://modeleweb-production-136b.up.railway.app/register
2. IMPORTANT : Faites CTRL + F5 (Windows) ou CMD + SHIFT + R (Mac)
   (Cela vide le cache du navigateur)
3. Cliquez sur "Individual"
4. Cliquez sur "REVELATION $299"
5. Cliquez sur une fonctionnalité pour avancer
```

### ÉTAPE 9️⃣ : Confirmation
```
✓ Vous devriez maintenant voir : $299.00/month
✗ Si vous voyez encore $24900.00, refaites CTRL+F5
```

---

## ❓ Questions Fréquentes

### Q : Je ne trouve pas le bouton "Query"
**R** : Essayez de chercher "Data" ou "Console" ou cherchez une icône de terminal/console

### Q : J'ai une erreur "permission denied"
**R** : Vérifiez que vous êtes connecté avec le bon compte Railway qui a accès au projet

### Q : Après l'exécution, je ne vois rien
**R** : Faites défiler vers le bas, les résultats apparaissent en dessous de l'éditeur

### Q : Le site affiche toujours $24900
**R** : 
- Faites CTRL + F5 pour vider le cache
- Attendez 30 secondes et réessayez
- Vérifiez que le SQL s'est bien exécuté dans Railway

### Q : Je n'ai pas accès à Railway
**R** : Demandez l'accès au propriétaire du projet ou contactez-moi

---

## 🆘 Besoin d'Aide ?

Si vous êtes bloqué :
1. Faites une capture d'écran de l'erreur
2. Notez à quelle étape vous êtes bloqué
3. Contactez-moi avec ces informations

---

## ⚡ Méthode Alternative (si Railway ne marche pas)

Si vous ne pouvez vraiment pas utiliser Railway, il existe d'autres options :

### Option 1 : Railway CLI
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Ouvrir psql
railway run psql $DATABASE_URL

# Puis dans psql :
UPDATE plans SET amount = 29900, name = 'REVELATION', updated_at = NOW() WHERE name LIKE '%Test%';
\q
```

### Option 2 : Via DBeaver ou pgAdmin
```
1. Installez DBeaver (gratuit) : https://dbeaver.io/download/
2. Récupérez l'URL de connexion depuis Railway (onglet "Variables")
3. Connectez-vous à la base de données
4. Exécutez le SQL
```

---

**Temps estimé** : 5 minutes  
**Difficulté** : ⭐⭐ (Facile)  
**Impact** : ✅ Correction immédiate
