# 🎯 Mise à Jour RBAC - Permissions Admin et Gestion des Permissions par Défaut

## ✅ Ce qui a été fait

### 1. Permissions Admin Créées

Les permissions suivantes ont été ajoutées pour chaque section admin :

- **`admin:users`** - Accès à la section gestion des utilisateurs
- **`admin:invitations`** - Accès à la section gestion des invitations
- **`admin:organizations`** - Accès à la section gestion des organisations
- **`admin:themes`** - Accès à la section gestion des thèmes
- **`admin:settings`** - Accès à la section paramètres
- **`admin:logs`** - Accès à la section logs
- **`admin:statistics`** - Accès à la section statistiques
- **`admin:rbac`** - Accès à la section RBAC
- **`admin:teams`** - Accès à la section gestion des équipes
- **`admin:tenancy`** - Accès à la section multi-tenancy

**Note** : La permission `admin:*` accorde automatiquement l'accès à toutes ces sections.

### 2. Permissions par Défaut des Rôles

Les rôles par défaut ont été configurés avec les permissions suivantes :

#### Super Admin (`superadmin`)
- ✅ **`admin:*`** - Accès à TOUT (toutes les permissions)

#### Admin (`admin`)
- ✅ **`admin:*`** - Accès à toutes les sections admin
- ✅ **`users:read`**, **`users:create`**, **`users:update`**, **`users:list`**
- ✅ **`roles:read`**, **`roles:list`**
- ✅ **`permissions:read`**, **`permissions:list`**

#### Manager (`manager`)
- ✅ **`admin:users`**, **`admin:teams`**, **`admin:statistics`**
- ✅ **`users:read`**, **`users:list`**
- ✅ **`teams:read`**, **`teams:create`**, **`teams:update`**, **`teams:list`**

#### User (`user`)
- ❌ Aucune permission admin (utilisateur standard)

### 3. Composant de Gestion des Permissions par Défaut

Un nouveau composant **`RoleDefaultPermissionsEditor`** a été créé et intégré dans la page de gestion des utilisateurs (`/admin/users`).

**Fonctionnalités** :
- ✅ Sélection d'un rôle pour modifier ses permissions par défaut
- ✅ Organisation des permissions par catégories (Admin, Users, Roles, Permissions)
- ✅ Recherche de permissions
- ✅ Gestion spéciale de `admin:*` (décoche automatiquement les autres permissions si activé)
- ✅ Protection du rôle `superadmin` (ne peut pas être modifié)
- ✅ Sauvegarde des modifications

### 4. Mise à Jour du Seeding

Les scripts de seeding ont été mis à jour pour :
- ✅ Créer toutes les permissions admin lors du seeding
- ✅ Assigner les permissions par défaut à chaque rôle
- ✅ Être idempotents (peuvent être exécutés plusieurs fois sans créer de doublons)

## 📋 Fichiers Modifiés

### Backend

1. **`backend/app/services/rbac_service.py`**
   - Ajout de `seed_default_permissions()` - Crée toutes les permissions par défaut
   - Ajout de `seed_default_roles()` - Crée les rôles avec leurs permissions
   - Ajout de `seed_default_data()` - Méthode principale de seeding

2. **`backend/scripts/fix_rbac_user.py`**
   - Mise à jour pour inclure les permissions admin
   - Mise à jour des rôles par défaut avec leurs permissions

3. **`backend/app/api/v1/endpoints/admin.py`**
   - Mise à jour de l'endpoint `/rbac/fix` pour inclure les nouvelles permissions

### Frontend

1. **`apps/web/src/components/admin/RoleDefaultPermissionsEditor.tsx`** (NOUVEAU)
   - Composant pour gérer les permissions par défaut de chaque rôle
   - Interface avec onglets pour organiser les permissions par catégorie

2. **`apps/web/src/app/[locale]/admin/users/AdminUsersContent.tsx`**
   - Intégration du composant `RoleDefaultPermissionsEditor`
   - Affiché comme une section séparée après le tableau des utilisateurs

3. **`apps/web/src/components/admin/index.ts`**
   - Export du nouveau composant

## 🚀 Comment Utiliser

### 1. Seeder les Nouvelles Permissions

Pour créer les nouvelles permissions admin dans votre base de données :

```bash
# Via Railway CLI
railway run python backend/scripts/fix_rbac_user.py --user-email votre@email.com --seed-data

# Ou via l'API (après déploiement)
curl -X POST "https://modelebackend-production-0590.up.railway.app/api/v1/admin/rbac/fix" \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Key: VOTRE_CLE" \
  -d '{"user_email": "votre@email.com", "seed_data": true, "assign_superadmin": false}'
```

### 2. Gérer les Permissions par Défaut des Rôles

1. Allez sur `/admin/users` dans l'application
2. Faites défiler jusqu'à la section **"Permissions par Défaut des Rôles"**
3. Sélectionnez un rôle (Super Admin, Admin, Manager, User)
4. Utilisez les onglets pour naviguer entre les catégories de permissions :
   - **Admin** : Permissions pour les sections admin
   - **Users** : Permissions pour la gestion des utilisateurs
   - **Roles** : Permissions pour la gestion des rôles
   - **Permissions** : Permissions pour la gestion des permissions
5. Cochez/décochez les permissions souhaitées
6. Cliquez sur **"Enregistrer les modifications"**

### 3. Comportement de `admin:*`

- ✅ Si vous cochez `admin:*`, toutes les autres permissions sont automatiquement décochées
- ✅ Si vous décochez `admin:*`, les permissions spécifiques restent telles quelles
- ✅ Si vous cochez une permission spécifique alors que `admin:*` est actif, `admin:*` est automatiquement décoché

### 4. Protection du Rôle Superadmin

- ⚠️ Le rôle `superadmin` ne peut pas être modifié (il garde toujours `admin:*`)
- ⚠️ Les rôles système (`is_system=True`) peuvent être modifiés mais avec prudence

## 📝 Notes Importantes

1. **Superadmin = TOUT** : Le rôle `superadmin` a toujours `admin:*` qui accorde toutes les permissions. C'est intentionnel et ne peut pas être modifié.

2. **Permissions par Défaut** : Les permissions que vous définissez pour un rôle deviennent les permissions par défaut pour tous les nouveaux utilisateurs qui reçoivent ce rôle.

3. **Permissions Custom** : Les utilisateurs peuvent toujours avoir des permissions custom supplémentaires qui s'ajoutent aux permissions de leur rôle.

4. **Idempotence** : Le seeding peut être exécuté plusieurs fois sans créer de doublons.

5. **Rôles Système** : Les rôles marqués `is_system=True` peuvent être modifiés, mais il est recommandé de ne modifier que leurs permissions, pas leur nom ou slug.

## 🎯 Prochaines Étapes

1. **Déployer les changements** sur Railway
2. **Exécuter le seeding** pour créer les nouvelles permissions
3. **Tester le composant** dans `/admin/users`
4. **Configurer les permissions par défaut** pour chaque rôle selon vos besoins

## 🔍 Vérification

Après le déploiement et le seeding, vous devriez voir :

- ✅ 10 nouvelles permissions admin dans `/admin/rbac`
- ✅ Le composant "Permissions par Défaut des Rôles" dans `/admin/users`
- ✅ Les rôles avec leurs permissions par défaut correctement assignées
