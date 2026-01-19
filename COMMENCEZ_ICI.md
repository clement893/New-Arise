# 🎬 COMMENCEZ ICI - CORRECTION DES PRIX

## 📋 CE QUE VOUS ALLEZ FAIRE

Vous allez copier-coller du SQL dans Railway pour créer 3 plans avec les bons prix.

**Temps estimé** : 5 minutes  
**Difficulté** : ⭐ Facile (copier-coller)

---

## 🎯 ÉTAPES SIMPLES

### 1️⃣ Ouvrir Railway (1 min)

```
1. Ouvrez votre navigateur
2. Allez sur : https://railway.app
3. Connectez-vous si nécessaire
4. Cliquez sur votre projet "modelebackend-production"
5. Cliquez sur "PostgreSQL" (icône de cylindre)
6. Cliquez sur l'onglet "Query" en haut
```

---

### 2️⃣ Vérifier le Nom de la Table (30 secondes)

Copiez et exécutez ceci :

```sql
SELECT COUNT(*) FROM plans;
```

**Si ça marche** → Votre table s'appelle `plans` ✓  
**Si erreur** → Essayez :

```sql
SELECT COUNT(*) FROM subscription_plans;
```

**Si ça marche** → Votre table s'appelle `subscription_plans` ✓

> **Important** : Notez le nom de votre table !

---

### 3️⃣ Exécuter le SQL (2 min)

#### **SI votre table s'appelle `plans`** :

Ouvrez le fichier **`SQL_SIMPLE_A_EXECUTER.txt`** et copiez TOUT le contenu.

#### **SI votre table s'appelle `subscription_plans`** :

Ouvrez **`SQL_SIMPLE_A_EXECUTER.txt`** et remplacez tous les `plans` par `subscription_plans`, puis copiez.

OU utilisez cette version :

```sql
-- Désactiver l'ancien plan Test
UPDATE subscription_plans SET status = 'inactive' WHERE name LIKE '%Test%';

-- Nettoyer
DELETE FROM subscription_plans WHERE name IN ('REVELATION', 'SELF EXPLORATION', 'WELLNESS');

-- Créer REVELATION ($299)
INSERT INTO subscription_plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('REVELATION', 'Complete leadership assessment', 29900, 'usd', 'month', 1, 'active', true, NOW(), NOW());

-- Créer SELF EXPLORATION ($250)
INSERT INTO subscription_plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('SELF EXPLORATION', 'Professional assessment', 25000, 'usd', 'month', 1, 'active', false, NOW(), NOW());

-- Créer WELLNESS ($99)
INSERT INTO subscription_plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('WELLNESS', 'Basic wellness assessment', 9900, 'usd', 'month', 1, 'active', false, NOW(), NOW());

-- Vérifier
SELECT name, (amount::numeric / 100) as price_dollars FROM subscription_plans WHERE status = 'active';
```

**Collez dans Railway et cliquez sur "Run"**

---

### 4️⃣ Vérifier (30 secondes)

Vous devriez voir dans les résultats :

```
REVELATION       | 299.00
SELF EXPLORATION | 250.00
WELLNESS         | 99.00
```

✅ **Parfait !** Les plans sont créés.

---

### 5️⃣ Tester sur le Site (1 min)

1. **Ouvrez** : https://modeleweb-production-136b.up.railway.app/register

2. **IMPORTANT** : Faites **CTRL + F5** (Windows) ou **CMD + SHIFT + R** (Mac)
   > Cela vide le cache du navigateur

3. **Cliquez** sur "Individual"

4. **Cliquez** sur "REVELATION $299"

5. **Cliquez** sur "Professional Assessment"

6. **VÉRIFIEZ** : Vous devriez voir :
   ```
   REVELATION  $299.00/month  ✓
   SELF EXPLORATION  $250.00/month  ✓
   WELLNESS  $99.00/month  ✓
   ```

---

## ✅ C'EST TERMINÉ !

Si vous voyez les bons prix, **félicitations** ! 🎉

Le problème est résolu.

---

## ❌ Ça Ne Marche Pas ?

### Problème 1 : Je vois toujours $24900

**Solution** :
1. Vérifiez que l'étape 4️⃣ montre bien les bons prix
2. Faites **CTRL + SHIFT + DELETE** → Vider le cache → Redémarrez le navigateur
3. Réessayez

### Problème 2 : Erreur "column does not exist"

**Solution** :
Votre table a peut-être des colonnes différentes. Essayez cette version simplifiée :

```sql
INSERT INTO plans (name, amount, currency, interval, status)
VALUES ('REVELATION', 29900, 'usd', 'month', 'active');

INSERT INTO plans (name, amount, currency, interval, status)
VALUES ('SELF EXPLORATION', 25000, 'usd', 'month', 'active');

INSERT INTO plans (name, amount, currency, interval, status)
VALUES ('WELLNESS', 9900, 'usd', 'month', 'active');
```

### Problème 3 : Je ne trouve pas l'onglet "Query"

**Solution** :
Cherchez "Data", "Console", ou une icône de terminal. Ou essayez Option B ci-dessous.

---

## 🔄 OPTION B : Via Railway CLI

Si vous préférez utiliser le terminal :

```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Se connecter
railway login

# 3. Lier le projet
railway link

# 4. Ouvrir psql
railway run psql $DATABASE_URL
```

Puis dans psql, copiez-collez le SQL de l'étape 3️⃣.

---

## 📞 BESOIN D'AIDE ?

Contactez-moi avec :
- ❓ À quelle étape êtes-vous bloqué ?
- 📸 Capture d'écran de l'erreur
- 📋 Résultat de l'étape 4️⃣ (vérification)

---

## 📚 FICHIERS UTILES

| Fichier | Quand l'utiliser |
|---------|-----------------|
| **Ce fichier** | ⭐ Commencez ici |
| `SQL_SIMPLE_A_EXECUTER.txt` | Le SQL à copier-coller |
| `EXECUTEZ_CES_COMMANDES.md` | Commandes une par une |
| `README_CORRECTION_PRIX.md` | Vue d'ensemble complète |
| `GUIDE_RAILWAY_STEP_BY_STEP.md` | Guide détaillé avec screenshots |

---

**N'oubliez pas** : Le code frontend fonctionne déjà ! Il faut juste créer les bons plans dans la base de données. ✅
