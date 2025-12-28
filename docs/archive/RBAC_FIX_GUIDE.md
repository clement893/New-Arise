# 🛠️ Guide de Correction RBAC - Exécution des Scripts

## 🎯 Objectif

Corriger les erreurs `403 Forbidden` sur les endpoints RBAC en :
1. Diagnostiquant l'état actuel du système RBAC
2. Créant les rôles et permissions par défaut si nécessaire
3. Assignant le rôle `superadmin` à votre compte

## 📋 Méthodes Disponibles

### Méthode 1 : Via l'API (Recommandé) ⭐

Cette méthode utilise des endpoints API que nous venons de créer. C'est la plus simple et ne nécessite pas d'accès SSH ou Railway CLI.

#### Étape 1 : Diagnostiquer le Problème

Appelez l'endpoint de diagnostic :

```bash
# Remplacez VOTRE_EMAIL@example.com par votre email
curl -X GET "https://modelebackend-production-0590.up.railway.app/api/v1/admin/rbac/diagnose?user_email=VOTRE_EMAIL@example.com" \
  -H "Content-Type: application/json"
```

Ou depuis votre navigateur :
```
https://modelebackend-production-0590.up.railway.app/api/v1/admin/rbac/diagnose?user_email=VOTRE_EMAIL@example.com
```

**Réponse attendue :**
```json
{
  "roles_count": 0,
  "permissions_count": 0,
  "user_has_superadmin": false,
  "user_roles": [],
  "user_permissions": [],
  "required_permissions_status": {
    "roles:read": false,
    "permissions:read": false,
    "users:read": false
  },
  "recommendations": [
    "No roles found. Run seed script to create default roles.",
    "Very few permissions found. Run seed script to create default permissions.",
    "User 'VOTRE_EMAIL@example.com' does not have superadmin role. Assign superadmin role to fix RBAC access."
  ]
}
```

#### Étape 2 : Corriger le Problème

**Option A : Avec Bootstrap Key (Recommandé pour la première fois)**

Si vous avez configuré `BOOTSTRAP_SUPERADMIN_KEY` dans vos variables d'environnement Railway :

```bash
curl -X POST "https://modelebackend-production-0590.up.railway.app/api/v1/admin/rbac/fix" \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Key: VOTRE_BOOTSTRAP_KEY" \
  -d '{
    "user_email": "VOTRE_EMAIL@example.com",
    "seed_data": true,
    "assign_superadmin": true
  }'
```

**Option B : Via l'Interface Swagger**

1. Allez sur : `https://modelebackend-production-0590.up.railway.app/docs`
2. Trouvez l'endpoint `POST /api/v1/admin/rbac/fix`
3. Cliquez sur "Try it out"
4. Entrez votre email dans le champ `user_email`
5. Cochez `seed_data` et `assign_superadmin`
6. Si vous avez une bootstrap key, ajoutez-la dans le header `X-Bootstrap-Key`
7. Cliquez sur "Execute"

**Réponse attendue :**
```json
{
  "success": true,
  "message": "RBAC fix completed successfully",
  "roles_created": 2,
  "permissions_created": 16,
  "superadmin_assigned": true
}
```

#### Étape 3 : Vérifier la Correction

Réexécutez le diagnostic pour confirmer :

```bash
curl -X GET "https://modelebackend-production-0590.up.railway.app/api/v1/admin/rbac/diagnose?user_email=VOTRE_EMAIL@example.com"
```

Vous devriez maintenant voir :
- `user_has_superadmin: true`
- `user_roles: ["superadmin"]`
- `required_permissions_status` avec toutes les permissions à `true`

#### Étape 4 : Se Reconnecter

**Important** : Après avoir assigné le rôle superadmin, vous devez vous **reconnecter** dans l'application frontend pour obtenir un nouveau token JWT qui reflète vos nouvelles permissions.

---

### Méthode 2 : Via Railway CLI

Si vous avez Railway CLI installé et configuré :

```bash
# Se connecter à Railway
railway login

# Se connecter au projet
railway link

# Exécuter le script de diagnostic
railway run python backend/scripts/diagnose_rbac.py --user-email VOTRE_EMAIL@example.com

# Exécuter le script de correction
railway run python backend/scripts/fix_rbac_user.py --user-email VOTRE_EMAIL@example.com --seed-data --assign-superadmin
```

---

### Méthode 3 : Via SSH (Si disponible)

Si Railway vous donne accès SSH :

```bash
# Se connecter via SSH
railway shell

# Dans le shell Railway
cd backend
python scripts/diagnose_rbac.py --user-email VOTRE_EMAIL@example.com
python scripts/fix_rbac_user.py --user-email VOTRE_EMAIL@example.com --seed-data --assign-superadmin
```

---

## 🔐 Configuration de la Bootstrap Key (Optionnel mais Recommandé)

Pour utiliser l'endpoint `/rbac/fix` avec la bootstrap key, ajoutez cette variable d'environnement dans Railway :

1. Allez dans votre projet Railway
2. Ouvrez l'onglet "Variables"
3. Ajoutez une nouvelle variable :
   - **Nom** : `BOOTSTRAP_SUPERADMIN_KEY`
   - **Valeur** : Générez une clé sécurisée (ex: `openssl rand -hex 32`)
4. Sauvegardez

Ensuite, utilisez cette clé dans le header `X-Bootstrap-Key` lors de l'appel à `/rbac/fix`.

---

## ✅ Vérification Post-Correction

Après avoir exécuté la correction, vérifiez que :

1. ✅ Vous pouvez accéder à `/admin/rbac` dans l'interface
2. ✅ Vous voyez la liste des rôles
3. ✅ Vous voyez la liste des permissions
4. ✅ Vous pouvez gérer les rôles et permissions des utilisateurs

Si les erreurs `403` persistent :

1. Vérifiez que vous vous êtes bien reconnecté (nouveau token JWT)
2. Vérifiez les logs du backend pour voir les erreurs exactes
3. Réexécutez le diagnostic pour voir l'état actuel

---

## 🆘 Dépannage

### Erreur : "User not found"
- Vérifiez que l'email est correct
- Assurez-vous que l'utilisateur existe dans la base de données

### Erreur : "Invalid bootstrap key"
- Vérifiez que `BOOTSTRAP_SUPERADMIN_KEY` est bien configuré dans Railway
- Vérifiez que vous utilisez la bonne clé dans le header

### Erreur : "Superadmin already exists"
- Cela signifie qu'un superadmin existe déjà
- Utilisez l'endpoint `/make-superadmin` au lieu de `/rbac/fix`

### Les erreurs 403 persistent après correction
- Vérifiez que vous vous êtes reconnecté (nouveau token JWT)
- Vérifiez les logs du backend
- Réexécutez le diagnostic pour voir l'état actuel

---

## 📝 Notes Importantes

1. **Le seeding est idempotent** : Vous pouvez l'exécuter plusieurs fois sans créer de doublons
2. **Les rôles système** (`is_system=True`) ne peuvent pas être supprimés
3. **Sécurité** : Le dernier superadmin ne peut pas être retiré (protection backend)
4. **Token JWT** : Après avoir assigné le rôle superadmin, reconnectez-vous pour obtenir un nouveau token

---

## 🎉 Résultat Attendu

Après avoir exécuté la correction avec succès :

- ✅ Les endpoints RBAC retournent `200 OK` au lieu de `403 Forbidden`
- ✅ L'interface affiche les rôles et permissions disponibles
- ✅ Vous pouvez gérer les rôles et permissions des utilisateurs
- ✅ Les messages "Aucune permission/rôle disponible" disparaissent
