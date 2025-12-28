# 🎯 Plan de Développement: Système de Gestion de Permissions Robuste

## 📋 Vue d'ensemble

Création d'un système de gestion de permissions complet pour un template SaaS, permettant:
- Gestion des rôles et permissions (RBAC)
- Permissions custom par utilisateur
- Interface d'administration complète
- Intégration dans la gestion des utilisateurs

---

## 🏗️ Architecture du Système

### Structure des Permissions

```
User
├── Roles (via UserRole)
│   └── Permissions (via RolePermission)
└── Custom Permissions (via UserPermission) - NOUVEAU
```

### Niveaux de Permission

1. **Rôles Système** (is_system=true)
   - superadmin: Toutes les permissions
   - admin: Permissions administratives
   - user: Permissions de base

2. **Rôles Custom** (is_system=false)
   - Créés par les superadmins
   - Permissions configurables

3. **Permissions Custom Utilisateur**
   - Permissions spécifiques à un utilisateur
   - Override les permissions des rôles
   - Permet des cas d'usage spécifiques

---

## ⚠️ IMPORTANT: Refactoring et Consolidation

### Problème Identifié: Duplication de Systèmes

Il existe actuellement **DEUX systèmes de permissions** qui coexistent:

1. **RBACService** (`backend/app/services/rbac_service.py`) - ✅ **À CONSERVER**
   - Utilise les modèles DB (Role, Permission, RolePermission, UserRole)
   - Récupère les permissions depuis la base de données
   - Utilisé dans les endpoints RBAC

2. **permissions.py** (`backend/app/core/permissions.py`) - ⚠️ **À REFACTORER**
   - Utilise des constantes hardcodées
   - `get_role_permissions()` retourne des permissions hardcodées par nom
   - `get_user_permissions()` mélange DB et hardcoded
   - **PROBLÈME:** Duplication et confusion

### Stratégie de Refactoring

- ✅ **Conserver RBACService** comme source de vérité (DB-based)
- 🔄 **Refactorer permissions.py** pour utiliser RBACService
- ➕ **Ajouter UserPermission** pour permissions custom utilisateur
- 🗑️ **Supprimer le code hardcodé** dans permissions.py
- ✅ **Maintenir la compatibilité** avec le code existant qui utilise permissions.py

---

## 📦 Plan par Batch

### **BATCH 1: Backend - Refactoring et Modèle UserPermission**
**Objectif:** Consolider les systèmes de permissions et ajouter le support des permissions custom

**Tâches:**
1. **Analyser l'utilisation de permissions.py:**
   - Identifier tous les endroits qui utilisent `get_user_permissions()` et `get_role_permissions()` de permissions.py
   - Lister les dépendances

2. **Créer le modèle `UserPermission` dans `backend/app/models/role.py`:**
   - Table `user_permissions` pour permissions custom utilisateur
   - Relation avec User et Permission

3. **Créer la migration Alembic:**
   - Table `user_permissions`
   - Index pour performance

4. **Refactorer `RBACService.get_user_permissions()`:**
   - Inclure les permissions custom utilisateur
   - Combiner: permissions de rôles + permissions custom
   - Gérer le superadmin (admin:*)

5. **Refactorer `backend/app/core/permissions.py`:**
   - Faire en sorte que `get_user_permissions()` utilise RBACService
   - Faire en sorte que `get_role_permissions()` utilise RBACService (depuis DB)
   - **Supprimer les permissions hardcodées** sauf pour migration/seeding
   - Créer fonction `seed_default_permissions()` pour initialiser les permissions système

6. **Mettre à jour les relations dans le modèle `User`:**
   - Ajouter relation `custom_permissions`

**Fichiers à modifier:**
- `backend/app/models/role.py` - Ajouter UserPermission
- `backend/app/services/rbac_service.py` - Refactorer get_user_permissions()
- `backend/app/core/permissions.py` - Refactorer pour utiliser RBACService
- Migration Alembic - Nouvelle table

**Fichiers à vérifier (pour compatibilité):**
- Tous les fichiers qui importent `from app.core.permissions import`
- Vérifier que le refactoring ne casse rien

**Tests:**
- Vérifier que les permissions custom sont bien récupérées
- Vérifier que les permissions custom override les permissions de rôle
- Vérifier que le code existant fonctionne toujours
- Tests de régression

**Risques:**
- Migration peut échouer si table existe déjà
- Code existant peut casser si refactoring trop agressif
- Besoin de migration des permissions hardcodées vers DB

---

### **BATCH 2: Backend - Endpoints pour Permissions Custom**
**Objectif:** API pour gérer les permissions custom utilisateur

**Tâches:**
1. Ajouter les schémas Pydantic dans `backend/app/schemas/rbac.py`
   - `UserPermissionCreate`
   - `UserPermissionResponse`
   - `UserPermissionUpdate`
2. Ajouter les endpoints dans `backend/app/api/v1/endpoints/rbac.py`:
   - `POST /rbac/users/{user_id}/permissions` - Ajouter permission custom
   - `DELETE /rbac/users/{user_id}/permissions/{permission_id}` - Retirer permission custom
   - `GET /rbac/users/{user_id}/permissions/custom` - Lister permissions custom
   - `PUT /rbac/users/{user_id}/permissions/{permission_id}` - Modifier permission custom
3. Ajouter les endpoints pour assigner/retirer des rôles à un utilisateur:
   - `PUT /rbac/users/{user_id}/roles` - Mettre à jour les rôles d'un utilisateur (remplace tous les rôles)
   - `PATCH /rbac/users/{user_id}/roles` - Ajouter/retirer des rôles spécifiques

**Fichiers à modifier:**
- `backend/app/schemas/rbac.py` - Nouveaux schémas
- `backend/app/api/v1/endpoints/rbac.py` - Nouveaux endpoints
- `backend/app/services/rbac_service.py` - Méthodes de service

**Tests:**
- Tester tous les endpoints avec Postman/curl
- Vérifier les permissions requises (superadmin seulement)
- Vérifier l'audit logging

**Risques:**
- Erreurs de validation Pydantic
- Problèmes de permissions (accès non autorisé)

---

### **BATCH 3: Backend - Migration des Permissions Hardcodées vers DB**
**Objectif:** Migrer les permissions hardcodées vers la base de données

**Tâches:**
1. **Créer script de migration/seeding:**
   - Script pour créer les permissions système dans la DB
   - Script pour créer les rôles système (superadmin, admin, user, etc.)
   - Script pour assigner les permissions aux rôles système
   - Utiliser les données de `permissions.py` comme source

2. **Créer fonction `seed_default_data()` dans RBACService:**
   - Créer toutes les permissions définies dans `Permission` class
   - Créer les rôles système avec leurs permissions
   - Idempotent (peut être exécuté plusieurs fois)

3. **Mettre à jour les migrations Alembic:**
   - Migration pour seed les données initiales
   - Ou script séparé à exécuter après migrations

4. **Améliorer la validation dans les endpoints:**
   - Empêcher la suppression du dernier superadmin
   - Empêcher la modification des rôles système critiques
   - Valider que les permissions existent avant assignation

**Fichiers à créer/modifier:**
- `backend/app/services/rbac_service.py` - Fonction seed_default_data()
- `backend/scripts/seed_rbac_data.py` - Script de seeding
- Migration Alembic - Seed data (optionnel)

**Tests:**
- Exécuter le script de seeding
- Vérifier que toutes les permissions sont créées
- Vérifier que les rôles système ont les bonnes permissions
- Vérifier l'idempotence

**Risques:**
- Conflits si données existent déjà
- Besoin de gérer les migrations de données existantes

---

### **BATCH 4: Frontend - API Client RBAC (Refactor de rbac.ts existant)**
**Objectif:** Implémenter le client API TypeScript pour RBAC (actuellement vide)

**Tâches:**
1. **Refactorer `apps/web/src/lib/api/rbac.ts` (actuellement vide):**
   - Implémenter toutes les méthodes pour les endpoints existants ET nouveaux:
   - ✅ `listRoles()`, `getRole(id)`, `createRole()`, `updateRole()`, `deleteRole()` - Endpoints existants
   - ✅ `listPermissions()`, `createPermission()` - Endpoints existants
   - ✅ `assignPermissionToRole()`, `removePermissionFromRole()` - Endpoints existants
   - ✅ `getUserRoles()`, `assignRoleToUser()`, `removeRoleFromUser()` - Endpoints existants
   - ✅ `getUserPermissions()` - Endpoint existant (amélioré pour inclure custom)
   - ➕ `updateRolePermissions(roleId, permissionIds)` - Bulk update (nouveau)
   - ➕ `updateUserRoles(userId, roleIds)` - Bulk update (nouveau)
   - ➕ `getUserCustomPermissions(userId)` - Nouveau
   - ➕ `addCustomPermission(userId, permissionId)` - Nouveau
   - ➕ `removeCustomPermission(userId, permissionId)` - Nouveau

2. **Ajouter les types TypeScript dans `packages/types/src/api.ts`:**
   - Types pour Role, Permission, UserRole, UserPermission
   - Types pour les réponses API
   - Types pour les requêtes (create, update)

3. **Créer les hooks React (optionnel mais recommandé):**
   - `useRBAC()` - Hook général pour RBAC
   - `useRoles()` - Hook pour gérer les rôles
   - `usePermissions()` - Hook pour gérer les permissions
   - `useUserPermissions(userId)` - Hook pour les permissions d'un utilisateur

**Fichiers à créer/modifier:**
- `apps/web/src/lib/api/rbac.ts` - Implémentation complète (actuellement vide)
- `packages/types/src/api.ts` - Types TypeScript
- `apps/web/src/hooks/useRBAC.ts` - Hook React (nouveau, optionnel)

**Tests:**
- Vérifier que tous les appels API fonctionnent
- Vérifier la gestion des erreurs
- Vérifier les types TypeScript
- Tester avec les endpoints existants ET nouveaux

**Risques:**
- Erreurs TypeScript
- Problèmes de types avec les réponses API
- Incompatibilité avec les endpoints existants

---

### **BATCH 5: Frontend - Refactor Page RBAC Existante**
**Objectif:** Refactorer la page RBAC existante (qui utilise des mock data) pour utiliser les vraies API

**Tâches:**
1. **Refactoriser `apps/web/src/app/[locale]/admin/rbac/page.tsx`:**
   - ✅ **Conserver la structure existante** (ne pas tout réécrire)
   - 🔄 **Remplacer les mock data** par les vraies API calls (rbacAPI)
   - ➕ Ajouter la gestion complète des permissions par rôle
   - ➕ Interface pour créer/modifier/supprimer des rôles (améliorer l'existant)
   - ➕ Interface pour assigner/retirer des permissions à un rôle (améliorer l'existant)
   - ➕ Groupement des permissions par ressource (users, projects, etc.)
   - ➕ Checkboxes pour sélection multiple de permissions (bulk update)
   - ➕ Indicateur visuel pour les permissions système vs custom

2. **Créer composant `RolePermissionsEditor` (nouveau):**
   - Liste des permissions groupées par ressource
   - Checkboxes pour chaque permission
   - Bouton "Sauvegarder" pour mettre à jour les permissions (bulk)
   - Indicateur visuel pour les permissions système
   - Filtre par ressource

3. **Créer composant `RoleForm` (nouveau):**
   - Formulaire pour créer/modifier un rôle
   - Validation du slug
   - Gestion des erreurs
   - Réutilisable dans modal et page

4. **Améliorer les composants existants:**
   - Vérifier s'il y a des composants RBAC existants à réutiliser
   - Éviter la duplication

**Fichiers à créer/modifier:**
- `apps/web/src/app/[locale]/admin/rbac/page.tsx` - Refactor (remplacer mock par API)
- `apps/web/src/components/admin/RolePermissionsEditor.tsx` - Nouveau composant
- `apps/web/src/components/admin/RoleForm.tsx` - Nouveau composant

**Tests:**
- Tester la création/modification/suppression de rôles
- Tester l'assignation de permissions (individuelle et bulk)
- Vérifier les validations
- Vérifier que l'UI existante fonctionne toujours

**Risques:**
- Erreurs TypeScript
- Problèmes de performance avec beaucoup de permissions
- UX complexe
- Casser l'UI existante

---

### **BATCH 6: Frontend - Intégration dans Gestion Utilisateurs**
**Objectif:** Permettre de modifier les rôles d'un utilisateur depuis la page de gestion

**Tâches:**
1. Modifier `apps/web/src/app/[locale]/admin/users/AdminUsersContent.tsx`:
   - Ajouter colonne "Rôles" dans le tableau
   - Ajouter bouton "Modifier les rôles" dans les actions
   - Créer modal `UserRolesModal` pour modifier les rôles d'un utilisateur
2. Créer composant `UserRolesEditor`:
   - Liste des rôles disponibles avec checkboxes
   - Affichage des rôles actuels de l'utilisateur
   - Bouton pour sauvegarder les changements
   - Validation (ne pas permettre de retirer le dernier superadmin)
3. Ajouter affichage des permissions dans le modal utilisateur:
   - Liste des permissions de l'utilisateur (depuis rôles + custom)
   - Badge pour distinguer permissions de rôle vs custom

**Fichiers à créer/modifier:**
- `apps/web/src/app/[locale]/admin/users/AdminUsersContent.tsx` - Ajouter gestion rôles
- `apps/web/src/components/admin/UserRolesEditor.tsx` - Nouveau composant
- `apps/web/src/components/admin/UserRolesModal.tsx` - Nouveau composant

**Tests:**
- Tester la modification des rôles d'un utilisateur
- Vérifier les validations (superadmin)
- Vérifier l'affichage des permissions

**Risques:**
- Erreurs TypeScript
- Problèmes de synchronisation après modification

---

### **BATCH 7: Frontend - Page Gestion Permissions Custom Utilisateur**
**Objectif:** Interface pour gérer les permissions custom d'un utilisateur

**Tâches:**
1. Créer page `apps/web/src/app/[locale]/admin/users/[id]/permissions/page.tsx`:
   - Liste des permissions custom de l'utilisateur
   - Formulaire pour ajouter une permission custom
   - Possibilité de retirer des permissions custom
   - Affichage des permissions totales (rôles + custom)
   - Indicateur visuel pour permissions de rôle vs custom
2. Créer composant `UserCustomPermissionsEditor`:
   - Liste des permissions disponibles (toutes les permissions du système)
   - Filtre par ressource
   - Checkboxes pour sélectionner les permissions à ajouter
   - Liste des permissions custom actuelles avec bouton de suppression
3. Ajouter navigation depuis la page de gestion des utilisateurs

**Fichiers à créer:**
- `apps/web/src/app/[locale]/admin/users/[id]/permissions/page.tsx` - Nouvelle page
- `apps/web/src/components/admin/UserCustomPermissionsEditor.tsx` - Nouveau composant

**Tests:**
- Tester l'ajout/retrait de permissions custom
- Vérifier l'affichage des permissions totales
- Vérifier les permissions requises (superadmin)

**Risques:**
- Erreurs TypeScript
- Performance avec beaucoup de permissions
- UX complexe

---

### **BATCH 8: Frontend - Amélioration UX et Validation**
**Objectif:** Améliorer l'expérience utilisateur et les validations

**Tâches:**
1. Ajouter des confirmations pour actions destructives:
   - Suppression de rôles
   - Retrait de permissions importantes
   - Modification de rôles système
2. Ajouter des messages de succès/erreur:
   - Toasts pour les actions réussies
   - Messages d'erreur clairs
3. Améliorer les validations:
   - Empêcher la suppression du dernier superadmin
   - Empêcher la modification de rôles système critiques
   - Validation des slugs de rôles
4. Ajouter des indicateurs de chargement:
   - Loading states pour toutes les opérations async
   - Skeleton loaders pour les listes

**Fichiers à modifier:**
- Tous les composants RBAC créés précédemment
- `apps/web/src/components/admin/*` - Améliorations UX

**Tests:**
- Tester toutes les validations
- Vérifier les messages d'erreur
- Vérifier les états de chargement

**Risques:**
- Oublier certaines validations
- Messages d'erreur pas assez clairs

---

### **BATCH 9: Backend - Amélioration Sécurité et Audit**
**Objectif:** Renforcer la sécurité et l'audit logging

**Tâches:**
1. Ajouter des vérifications de sécurité supplémentaires:
   - Empêcher un utilisateur de modifier ses propres permissions (sauf superadmin)
   - Empêcher la suppression du dernier superadmin
   - Valider que les permissions existent avant assignation
2. Améliorer l'audit logging:
   - Logger toutes les modifications de rôles/permissions
   - Logger les permissions custom ajoutées/retirées
   - Inclure plus de métadonnées dans les logs
3. Ajouter des tests unitaires pour les services RBAC:
   - Tests pour RBACService
   - Tests pour les endpoints RBAC
   - Tests pour les validations de sécurité

**Fichiers à modifier:**
- `backend/app/api/v1/endpoints/rbac.py` - Validations sécurité
- `backend/app/services/rbac_service.py` - Validations
- `backend/tests/test_rbac.py` - Nouveaux tests

**Tests:**
- Tester toutes les validations de sécurité
- Vérifier l'audit logging
- Exécuter les tests unitaires

**Risques:**
- Oublier certaines validations de sécurité
- Tests incomplets

---

### **BATCH 10: Documentation et Finalisation**
**Objectif:** Documenter le système et finaliser

**Tâches:**
1. Créer documentation dans `docs/RBAC_SYSTEM.md`:
   - Architecture du système
   - Guide d'utilisation
   - Exemples de code
   - Bonnes pratiques
2. Mettre à jour `README.md`:
   - Ajouter section sur le système RBAC
   - Ajouter liens vers la documentation
3. Mettre à jour `API_ENDPOINTS.md`:
   - Documenter tous les nouveaux endpoints RBAC
4. Créer guide de migration pour les utilisateurs du template:
   - Comment migrer depuis l'ancien système
   - Comment créer des rôles custom
   - Comment gérer les permissions

**Fichiers à créer/modifier:**
- `docs/RBAC_SYSTEM.md` - Nouvelle documentation
- `README.md` - Mise à jour
- `backend/API_ENDPOINTS.md` - Mise à jour
- `docs/RBAC_MIGRATION_GUIDE.md` - Guide de migration

**Tests:**
- Vérifier que la documentation est complète
- Vérifier que les exemples fonctionnent

**Risques:**
- Documentation incomplète
- Exemples qui ne fonctionnent pas

---

## 🔍 Points d'Attention

### Sécurité
- ✅ Toutes les opérations RBAC doivent être réservées aux superadmins
- ✅ Empêcher la suppression du dernier superadmin
- ✅ Valider toutes les entrées utilisateur
- ✅ Logger toutes les modifications de permissions

### Performance
- ⚠️ Optimiser les requêtes pour récupérer les permissions (éviter N+1)
- ⚠️ Mettre en cache les permissions si nécessaire
- ⚠️ Utiliser des transactions pour les opérations bulk

### UX
- ✅ Messages d'erreur clairs
- ✅ Confirmations pour actions destructives
- ✅ Loading states pour toutes les opérations async
- ✅ Validation en temps réel

### Compatibilité
- ✅ Maintenir la compatibilité avec l'ancien système (is_admin)
- ✅ Migration progressive possible
- ✅ Support des rôles système existants

---

## 📊 Estimation (Révisée avec Refactoring)

- **BATCH 1:** 4-5 heures (Backend - Refactoring + Modèle UserPermission)
  - Plus de temps pour analyser et refactorer permissions.py
- **BATCH 2:** 3-4 heures (Backend - Endpoints permissions custom + amélioration existants)
- **BATCH 3:** 3-4 heures (Backend - Migration permissions hardcodées vers DB)
  - Script de seeding et migration
- **BATCH 4:** 3-4 heures (Frontend - API Client RBAC)
  - Implémenter tous les endpoints existants + nouveaux
- **BATCH 5:** 4-5 heures (Frontend - Refactor page RBAC existante)
  - Refactor plutôt que création complète
- **BATCH 6:** 3-4 heures (Frontend - Intégration gestion utilisateurs)
- **BATCH 7:** 3-4 heures (Frontend - Page permissions custom)
- **BATCH 8:** 2-3 heures (Frontend - UX et validation)
- **BATCH 9:** 3-4 heures (Backend - Sécurité et tests)
- **BATCH 10:** 2-3 heures (Documentation)

**Total estimé:** 30-40 heures (légèrement augmenté à cause du refactoring)

---

## ✅ Checklist de Validation par Batch

Pour chaque batch:
- [ ] Code fonctionne sans erreurs TypeScript/Python
- [ ] Build réussit sans erreurs
- [ ] Tests passent (si applicable)
- [ ] Code review effectué
- [ ] Commit et push effectués
- [ ] Rapport de progression créé

---

## 🚀 Ordre d'Exécution Recommandé

1. **BATCH 1** → Migration et modèle de base
2. **BATCH 2** → API backend pour permissions custom
3. **BATCH 3** → API backend pour rôles améliorés
4. **BATCH 4** → Client API frontend
5. **BATCH 5** → Interface gestion rôles
6. **BATCH 6** → Intégration gestion utilisateurs
7. **BATCH 7** → Page permissions custom
8. **BATCH 8** → Améliorations UX
9. **BATCH 9** → Sécurité et tests
10. **BATCH 10** → Documentation

---

## 📝 Notes Importantes

1. **Ne jamais pousser de code cassé** - Chaque batch doit être fonctionnel
2. **Tester après chaque batch** - Vérifier que tout fonctionne avant de continuer
3. **Documenter au fur et à mesure** - Ajouter des commentaires dans le code
4. **Respecter les conventions** - Suivre les patterns existants du projet
5. **Gérer les erreurs** - Toujours gérer les cas d'erreur

---

**Date de création:** 2025-01-28
**Dernière mise à jour:** 2025-01-28
