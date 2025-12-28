# Audit Complet du Système d'Authentification

## Date: 2025-01-XX

## Problème Identifié

L'utilisateur se connecte avec succès, voit le dashboard, puis est immédiatement redirigé vers la page de login.

## Causes Racines Identifiées

### 1. **ProtectedRoute réinitialisait `isAuthorized` lors de chaque changement de `user` ou `token`**

**Problème**: Quand l'utilisateur se connecte, le store Zustand est mis à jour avec `user` et `token`. Le `useEffect` dans `ProtectedRoute` détecte ce changement et réinitialise `isAuthorized` à `false`, causant une redirection vers login même si l'utilisateur vient de se connecter.

**Solution**: Modifié la logique pour ne réinitialiser `isAuthorized` que si on passe d'un état authentifié à un état non-authentifié, pas l'inverse.

### 2. **Problème de timing après login**

**Problème**: Après le login, `router.push('/dashboard')` est appelé immédiatement, mais `ProtectedRoute` peut vérifier l'authentification avant que le store soit complètement mis à jour et persisté.

**Solution**: Ajout d'un délai de 100ms après le login pour garantir que le store est mis à jour et persisté avant la redirection.

### 3. **Format utilisateur incohérent**

**Problème**: Le hook `useAuth` appelait `setUser` avec les données brutes de l'API, mais le format ne correspondait pas au format attendu par le store.

**Solution**: Adaptation systématique des données utilisateur de l'API au format attendu par le store dans tous les endroits où l'utilisateur est défini.

### 4. **Intercepteur API trop restrictif**

**Problème**: L'intercepteur de requête bloquait certaines requêtes authentifiées si le token n'était pas présent, même pour des endpoints qui pourraient fonctionner sans token.

**Solution**: Simplifié l'intercepteur pour toujours ajouter le token s'il est disponible, laissant le backend gérer les vérifications d'authentification.

## Corrections Appliquées

### 1. `apps/web/src/components/auth/ProtectedRoute.tsx`

- ✅ Ne réinitialise `isAuthorized` que lors de la perte d'authentification
- ✅ Détecte la transition de non-authentifié à authentifié et autorise immédiatement
- ✅ Augmenté le délai d'hydratation de 100ms à 150ms pour plus de stabilité

### 2. `apps/web/src/app/[locale]/auth/login/page.tsx`

- ✅ Ajout d'un délai de 100ms après le login avant la redirection
- ✅ Utilisation de `await` pour garantir que le login est complété

### 3. `apps/web/src/app/[locale]/auth/register/page.tsx`

- ✅ Ajout d'un délai de 100ms après le login automatique avant la redirection
- ✅ Utilisation de `await` pour garantir que le login est complété

### 4. `apps/web/src/app/auth/register/page.tsx`

- ✅ Ajout d'un délai de 100ms après le login automatique avant la redirection
- ✅ Utilisation de `await` pour garantir que le login est complété

### 5. `apps/web/src/hooks/useAuth.ts`

- ✅ Correction de `handleRegister` pour utiliser le format correct des données utilisateur
- ✅ Correction de `setUser` dans `checkAuth` pour adapter les données au format du store

### 6. `apps/web/src/lib/api.ts`

- ✅ Simplifié l'intercepteur de requête pour toujours ajouter le token s'il est disponible
- ✅ Supprimé la logique de blocage des requêtes authentifiées sans token

## Architecture du Système d'Authentification

### Flux de Login

1. **Utilisateur soumet le formulaire de login**
   - `apps/web/src/app/[locale]/auth/login/page.tsx` → `handleSubmit`
   - Appel à `authAPI.login(email, password)`

2. **Backend traite la requête**
   - `backend/app/api/v1/endpoints/auth.py` → `login`
   - Vérifie les credentials
   - Crée un access token JWT
   - Retourne `TokenWithUser` avec `access_token`, `token_type`, et `user`

3. **Frontend traite la réponse**
   - Adapte les données utilisateur au format du store
   - Appelle `login(userForStore, access_token)` du store
   - Le store:
     - Stocke le token dans `TokenStorage` (sessionStorage + cookies httpOnly)
     - Met à jour l'état Zustand avec `user` et `token`
     - Persiste l'état dans localStorage via Zustand persist

4. **Redirection vers dashboard**
   - Délai de 100ms pour garantir la persistance
   - `router.push('/dashboard')`

5. **ProtectedRoute vérifie l'authentification**
   - Détecte la transition de non-authentifié à authentifié
   - Autorise immédiatement sans vérification supplémentaire
   - Affiche le dashboard

### Stockage des Tokens

- **sessionStorage**: Stockage immédiat pour accès synchrone
- **Cookies httpOnly**: Stockage sécurisé via API route `/api/auth/token`
- **Zustand persist**: Persistance dans localStorage pour hydratation au rechargement

### Vérification d'Authentification

- **ProtectedRoute**: Vérifie `user` et `token` du store + sessionStorage
- **Intercepteur API**: Ajoute automatiquement le token Bearer dans les headers
- **Backend**: Vérifie le token JWT et retourne 401 si invalide

## Points d'Attention

### 1. Refresh Token

Le backend ne retourne actuellement pas de `refresh_token` dans la réponse de login. Si nécessaire, il faudra:
- Ajouter `refresh_token` au schéma `TokenWithUser`
- Créer le refresh token dans l'endpoint login
- Gérer le refresh automatique dans l'intercepteur API

### 2. Hydratation Zustand

Le délai de 150ms dans `ProtectedRoute` est nécessaire pour laisser le temps à Zustand persist de s'hydrater. Si ce délai cause des problèmes, considérer:
- Utiliser `useStore` avec un sélecteur pour vérifier l'hydratation
- Implémenter un flag `hasHydrated` dans le store

### 3. Gestion des Erreurs

Les erreurs d'authentification sont gérées à plusieurs niveaux:
- **Intercepteur API**: Gère les 401 et tente le refresh token
- **ProtectedRoute**: Redirige vers login si non authentifié
- **Pages login/register**: Affichent les erreurs à l'utilisateur

## Tests Recommandés

1. ✅ Login avec email/password
2. ✅ Register puis auto-login
3. ✅ Redirection après login (ne doit pas revenir à login)
4. ✅ Refresh de page sur dashboard (doit rester connecté)
5. ✅ Logout puis accès à dashboard (doit rediriger vers login)
6. ✅ Token expiré (doit rediriger vers login)
7. ✅ Requêtes API avec token invalide (doit gérer le refresh)

## Améliorations Futures

1. **Refresh Token automatique**: Implémenter le refresh automatique des tokens expirés
2. **Meilleure gestion de l'hydratation**: Utiliser un flag d'hydratation au lieu d'un délai fixe
3. **Retry logic**: Ajouter une logique de retry pour les requêtes échouées
4. **Session timeout**: Implémenter un timeout de session avec notification
5. **Multi-device**: Gérer les sessions sur plusieurs appareils

