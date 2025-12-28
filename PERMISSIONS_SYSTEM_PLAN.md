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

## 📦 Plan par Batch

### **BATCH 1: Backend - Modèle UserPermission et Migration**
**Objectif:** Ajouter le support des permissions custom utilisateur

**Tâches:**
1. Créer le modèle `UserPermission` dans `backend/app/models/role.py`
2. Créer la migration Alembic pour la table `user_permissions`
3. Mettre à jour les relations dans le modèle `User`
4. Ajouter les méthodes dans `RBACService` pour gérer les permissions custom
5. Mettre à jour `get_user_permissions` pour inclure les permissions custom

**Fichiers à modifier:**
- `backend/app/models/role.py` - Ajouter UserPermission
- `backend/app/services/rbac_service.py` - Méthodes pour permissions custom
- Migration Alembic - Nouvelle table

**Tests:**
- Vérifier que les permissions custom sont bien récupérées
- Vérifier que les permissions custom override les permissions de rôle

**Risques:**
- Migration peut échouer si table existe déjà
- Conflits de noms avec permissions existantes

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

### **BATCH 3: Backend - Endpoints pour Gestion Complète des Rôles**
**Objectif:** API complète pour gérer les permissions des rôles

**Tâches:**
1. Améliorer les endpoints existants dans `rbac.py`:
   - `PUT /rbac/roles/{role_id}/permissions` - Mettre à jour toutes les permissions d'un rôle
   - `PATCH /rbac/roles/{role_id}/permissions` - Ajouter/retirer des permissions spécifiques
2. Ajouter endpoint pour bulk operations:
   - `POST /rbac/roles/{role_id}/permissions/bulk` - Assigner plusieurs permissions en une fois
3. Améliorer la validation:
   - Empêcher la suppression du dernier superadmin
   - Empêcher la modification des rôles système critiques

**Fichiers à modifier:**
- `backend/app/api/v1/endpoints/rbac.py` - Améliorer endpoints
- `backend/app/services/rbac_service.py` - Méthodes bulk

**Tests:**
- Tester les opérations bulk
- Vérifier les validations de sécurité

**Risques:**
- Performance avec beaucoup de permissions
- Transactions DB pour bulk operations

---

### **BATCH 4: Frontend - API Client RBAC**
**Objectif:** Client API TypeScript pour RBAC

**Tâches:**
1. Implémenter `apps/web/src/lib/api/rbac.ts` avec toutes les méthodes:
   - `listRoles()`, `getRole(id)`, `createRole()`, `updateRole()`, `deleteRole()`
   - `listPermissions()`, `createPermission()`
   - `assignPermissionToRole()`, `removePermissionFromRole()`
   - `updateRolePermissions()` - Bulk update
   - `getUserRoles()`, `assignRoleToUser()`, `removeRoleFromUser()`, `updateUserRoles()` - Bulk update
   - `getUserPermissions()`, `getUserCustomPermissions()`
   - `addCustomPermission()`, `removeCustomPermission()`, `updateCustomPermission()`
2. Ajouter les types TypeScript dans `packages/types/src/api.ts`
3. Créer les hooks React si nécessaire (`useRBAC`, `useRoles`, `usePermissions`)

**Fichiers à créer/modifier:**
- `apps/web/src/lib/api/rbac.ts` - Implémentation complète
- `packages/types/src/api.ts` - Types TypeScript
- `apps/web/src/hooks/useRBAC.ts` - Hook React (optionnel)

**Tests:**
- Vérifier que tous les appels API fonctionnent
- Vérifier la gestion des erreurs
- Vérifier les types TypeScript

**Risques:**
- Erreurs TypeScript
- Problèmes de types avec les réponses API

---

### **BATCH 5: Frontend - Composant de Gestion des Rôles**
**Objectif:** Interface complète pour gérer les rôles et leurs permissions

**Tâches:**
1. Refactoriser `apps/web/src/app/[locale]/admin/rbac/page.tsx`:
   - Remplacer les mock data par les vraies API calls
   - Ajouter la gestion des permissions par rôle
   - Interface pour créer/modifier/supprimer des rôles
   - Interface pour assigner/retirer des permissions à un rôle
   - Groupement des permissions par ressource (users, projects, etc.)
   - Checkboxes pour sélection multiple de permissions
2. Créer composant `RolePermissionsEditor`:
   - Liste des permissions groupées par ressource
   - Checkboxes pour chaque permission
   - Bouton "Sauvegarder" pour mettre à jour les permissions
   - Indicateur visuel pour les permissions système
3. Créer composant `RoleForm`:
   - Formulaire pour créer/modifier un rôle
   - Validation du slug
   - Gestion des erreurs

**Fichiers à créer/modifier:**
- `apps/web/src/app/[locale]/admin/rbac/page.tsx` - Refactor complet
- `apps/web/src/components/admin/RolePermissionsEditor.tsx` - Nouveau composant
- `apps/web/src/components/admin/RoleForm.tsx` - Nouveau composant

**Tests:**
- Tester la création/modification/suppression de rôles
- Tester l'assignation de permissions
- Vérifier les validations

**Risques:**
- Erreurs TypeScript
- Problèmes de performance avec beaucoup de permissions
- UX complexe

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

## 📊 Estimation

- **BATCH 1:** 2-3 heures (Backend - Modèle)
- **BATCH 2:** 3-4 heures (Backend - Endpoints permissions custom)
- **BATCH 3:** 2-3 heures (Backend - Endpoints rôles améliorés)
- **BATCH 4:** 2-3 heures (Frontend - API Client)
- **BATCH 5:** 4-5 heures (Frontend - Composant gestion rôles)
- **BATCH 6:** 3-4 heures (Frontend - Intégration gestion utilisateurs)
- **BATCH 7:** 3-4 heures (Frontend - Page permissions custom)
- **BATCH 8:** 2-3 heures (Frontend - UX et validation)
- **BATCH 9:** 3-4 heures (Backend - Sécurité et tests)
- **BATCH 10:** 2-3 heures (Documentation)

**Total estimé:** 26-36 heures

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
