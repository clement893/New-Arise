# Diagnostic : Problème de Chargements Multiples et Redirections

## Problèmes Identifiés

### 1. **ProtectedSuperAdminRoute - Dépendances Instables du useEffect**

**Fichier**: `apps/web/src/components/auth/ProtectedSuperAdminRoute.tsx` (ligne 161)

**Problème**: 
- Le `useEffect` a des dépendances `[user?.email, user?.is_admin, token, router, pathname]`
- Pendant l'hydratation de Zustand, `user` et `token` passent de `null` → `undefined` → valeurs réelles
- Chaque changement déclenche une nouvelle vérification, causant des chargements multiples
- **Aucun garde contre les vérifications simultanées** (contrairement à `ProtectedRoute` qui a `checkingRef`)

**Impact**: 
- 2-3 vérifications d'authentification par chargement de page
- Appels API multiples à `checkMySuperAdminStatus`
- Redirections multiples possibles

```typescript
// Ligne 30-161: Le useEffect se déclenche à chaque changement de dépendances
useEffect(() => {
  const checkAuth = async () => {
    // Pas de garde contre les multiples exécutions simultanées
    await new Promise(resolve => setTimeout(resolve, 100));
    // ... vérifications ...
  };
  checkAuth();
}, [user?.email, user?.is_admin, token, router, pathname]); // ⚠️ Dépendances instables
```

### 2. **ProtectedRoute - Dépendances Instables**

**Fichier**: `apps/web/src/components/auth/ProtectedRoute.tsx` (ligne 270)

**Problème**:
- Dépendances `[user, token, requireAdmin, pathname]`
- Même problème d'hydratation Zustand
- Bien qu'il y ait un `checkingRef`, il peut y avoir des race conditions si plusieurs composants utilisent `ProtectedRoute` simultanément

**Impact**:
- Vérifications multiples pendant l'hydratation
- Appels API redondants

### 3. **LocaleSync - Redirections Multiples**

**Fichier**: `apps/web/src/components/preferences/LocaleSync.tsx` (ligne 155)

**Problème**:
- Le `useEffect` se déclenche à chaque changement de `[currentLocale, pathname, user, token]`
- Pendant l'hydratation, ces valeurs changent plusieurs fois
- Utilise `window.location.href` qui cause un rechargement complet de la page
- Même avec des gardes (`isProcessingRef`, `hasCheckedRef`), il peut y avoir des race conditions

**Impact**:
- Redirections multiples possibles
- Rechargements complets de page
- Navigation vers dashboard ou retour en arrière

```typescript
// Ligne 43-155: Se déclenche à chaque changement
useEffect(() => {
  const syncLocale = async () => {
    // Gardes présents mais peuvent être contournés pendant l'hydratation
    if (isProcessingRef.current) return;
    // ...
    window.location.href = newPath; // ⚠️ Rechargement complet
  };
  syncLocale();
}, [currentLocale, pathname, user, token]); // ⚠️ Dépendances instables
```

### 4. **Imbrication de Composants de Protection**

**Problème**:
- Le layout dashboard (`apps/web/src/app/dashboard/layout.tsx`) utilise `ProtectedRoute`
- Si une page utilise aussi `ProtectedSuperAdminRoute`, il y a double vérification
- Chaque composant fait ses propres vérifications indépendamment

**Exemple**:
```typescript
// Layout
<ProtectedRoute>  {/* Vérification 1 */}
  <DashboardLayoutContent>
    {/* Page */}
    <ProtectedSuperAdminRoute>  {/* Vérification 2 */}
      <BecomeSuperAdminPage />
    </ProtectedSuperAdminRoute>
  </DashboardLayoutContent>
</ProtectedRoute>
```

### 5. **Hydratation Zustand - Changements d'État Multiples**

**Fichier**: `apps/web/src/lib/store.ts`

**Problème**:
- Zustand persist hydrate progressivement
- L'état passe par plusieurs phases: `null` → `undefined` → valeurs réelles
- Chaque changement déclenche les `useEffect` qui dépendent de `user` ou `token`

**Séquence typique**:
1. Premier render: `user = null`, `token = null`
2. Hydratation commence: `user = undefined`, `token = undefined`
3. Hydratation complète: `user = {...}`, `token = "..."`

Chaque étape déclenche les `useEffect` des composants protégés.

### 6. **useAuth Hook - Vérifications Supplémentaires**

**Fichier**: `apps/web/src/hooks/useAuth.ts` (ligne 134-191)

**Problème**:
- Un `useEffect` vérifie l'authentification et peut mettre à jour `user`
- Cela peut déclencher d'autres `useEffect` dans les composants protégés
- Crée une boucle de vérifications

## Scénario de Problème Typique

1. **Utilisateur ouvre `/dashboard/become-superadmin`**
2. **Layout Dashboard** (`ProtectedRoute`) vérifie l'authentification
   - Hydratation Zustand: `user` change de `null` → `undefined` → `{...}`
   - Déclenche 2-3 vérifications
3. **Page BecomeSuperAdmin** (si elle utilise `ProtectedSuperAdminRoute`)
   - Hydratation continue: `user.email` change
   - Déclenche 2-3 vérifications supplémentaires
   - Appels API multiples à `checkMySuperAdminStatus`
4. **LocaleSync** vérifie les préférences
   - Si locale différente, redirige avec `window.location.href`
   - Rechargement complet → retour à l'étape 1
5. **Résultat**: Page qui charge 2-3 fois, parfois redirige vers dashboard

## Solutions Recommandées

### Solution 1: Ajouter un Garde dans ProtectedSuperAdminRoute

Ajouter un `checkingRef` similaire à `ProtectedRoute` pour empêcher les vérifications simultanées.

### Solution 2: Stabiliser les Dépendances du useEffect

Utiliser des refs pour suivre les valeurs précédentes et éviter les vérifications inutiles.

### Solution 3: Désactiver LocaleSync pendant l'hydratation

Attendre que l'hydratation Zustand soit complète avant d'exécuter LocaleSync.

### Solution 4: Utiliser un Flag d'Hydratation Globale

Créer un hook `useHydrated()` qui indique quand Zustand a fini d'hydrater, et attendre avant les vérifications.

### Solution 5: Éviter l'Imbrication de Composants de Protection

Si le layout protège déjà la route, ne pas re-protéger dans les pages enfants.

## Fichiers à Modifier

1. `apps/web/src/components/auth/ProtectedSuperAdminRoute.tsx`
2. `apps/web/src/components/auth/ProtectedRoute.tsx`
3. `apps/web/src/components/preferences/LocaleSync.tsx`
4. `apps/web/src/hooks/useAuth.ts` (optionnel)

## Priorité

- **Haute**: ProtectedSuperAdminRoute (pas de garde contre les multiples exécutions)
- **Moyenne**: LocaleSync (peut causer des redirections)
- **Basse**: ProtectedRoute (a déjà des gardes mais peut être amélioré)
