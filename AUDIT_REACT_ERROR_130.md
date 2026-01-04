# Audit: React Error #130 - Objects Not Valid as React Child

## Date: 2026-01-04

## Problème
L'erreur React #130 se produit de manière récurrente, particulièrement lors de la navigation arrière depuis une page d'assessment vers la page assessments. L'erreur indique qu'un objet est rendu directement dans le JSX au lieu d'une valeur primitive (string, number, etc.).

## Erreurs observées

### 1. Erreurs 401 (Unauthorized)
```
GET /api/v1/assessments/my-assessments 401 (Unauthorized)
GET /api/v1/admin/check-my-superadmin-status 401 (Unauthorized)
```
- Ces erreurs se produisent lors du chargement de la page assessments
- Le token d'authentification peut avoir expiré
- Les objets d'erreur axios peuvent être rendus directement

### 2. Erreurs 404 (Not Found)
```
GET /api/v1/assessments/70/results 404 (Not Found)
```
- Se produit lors de l'accès aux résultats d'un assessment non complété
- Les objets d'erreur peuvent être rendus dans le JSX

### 3. Erreurs de permissions (EACCES)
```
Error: EACCES: permission denied, mkdir '/app/apps/web/.next/cache'
```
- Problème d'infrastructure/de déploiement sur Railway
- N'affecte pas directement React #130 mais peut causer des erreurs secondaires

## Endroits potentiels où des objets sont rendus

### 1. Page Assessments (`apps/web/src/app/[locale]/dashboard/assessments/page.tsx`)

#### Problèmes identifiés:
- **Ligne 245-250**: Gestion d'erreur dans `loadAssessments()`
  - ✅ **CORRIGÉ**: Conversion des erreurs en chaînes avec try-catch
  - ✅ **CORRIGÉ**: Gestion spécifique des erreurs 401
  - ✅ **CORRIGÉ**: Vérification que `error` est une chaîne avant le rendu

- **Ligne 499-515**: Affichage de l'erreur dans le JSX
  - ✅ **CORRIGÉ**: Conversion de `error` en chaîne avant le rendu
  - ✅ **CORRIGÉ**: Détection des erreurs 401 pour afficher le bon bouton

- **Lignes 121-129, 141-150, 174-198, 191-197, 329-338**: `console.log` avec objets
  - ✅ **CORRIGÉ**: Conversion en `JSON.stringify()` pour éviter React #130

### 2. Page Results (`apps/web/src/app/[locale]/dashboard/assessments/results/page.tsx`)

#### Problèmes identifiés:
- **Ligne 123-140**: Gestion d'erreur dans `loadResults()`
  - ✅ **CORRIGÉ**: Parsing d'erreur avec try-catch et fallbacks
  - ✅ **CORRIGÉ**: Conversion de toutes les erreurs en chaînes

- **Ligne 231-256**: Affichage de l'erreur dans le JSX
  - ✅ **CORRIGÉ**: Conversion de `error` en chaîne avant le rendu
  - ⚠️ **PROBLÈME POTENTIEL**: `assessmentId` pourrait être un objet si `searchParams` est mal géré

- **Ligne 97**: `console.error` avec objet
  - ✅ **CORRIGÉ**: Conversion en chaîne

- **Lignes 404-412, 419-427**: Expressions JSX complexes avec `wellnessPillars.find()`
  - ✅ **CORRIGÉ**: Encapsulation dans des IIFE pour garantir une sortie string

### 3. Page Wellness (`apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`)

#### Problèmes identifiés:
- **Ligne 188-209**: `useEffect` qui vérifie les résultats
  - ✅ **CORRIGÉ**: Conversion de l'erreur en chaîne avant de logger

- **Lignes 48-60**: Calcul de `progress` et `currentAnswer`
  - ✅ **CORRIGÉ**: Vérifications de type pour s'assurer que ce sont des nombres

- **Lignes 483, 489**: Rendu de `progress` dans le JSX
  - ✅ **CORRIGÉ**: Vérifications de type avant le rendu

### 4. API Client (`apps/web/src/lib/api/client.ts`)

#### Problèmes potentiels:
- Les erreurs axios sont des objets complexes avec `response`, `request`, `message`, etc.
- Si ces objets sont passés directement à `setError()`, ils peuvent être rendus dans le JSX
- **ACTION REQUISE**: Vérifier comment `apiClient` gère les erreurs et s'assurer qu'elles sont toujours converties en chaînes

### 5. ErrorBoundary (`apps/web/src/components/errors/ErrorBoundary.tsx`)

#### Problèmes potentiels:
- **Ligne 148**: `this.state.error.toString()` - devrait être sûr
- **Ligne 151**: `this.state.errorInfo.componentStack` - devrait être une chaîne
- ⚠️ **PROBLÈME POTENTIEL**: Si `showDetails={true}` et qu'un objet d'erreur complexe est rendu, cela pourrait causer React #130
- ✅ **CORRIGÉ**: `showDetails={false}` dans les pages assessments et results

## Problèmes non résolus

### 1. Navigation arrière depuis un test
- L'erreur se produit "à chaque fois que j'ouvre un test et que je fais BACK"
- Cela suggère que le problème pourrait être dans:
  - La gestion de l'état lors de la navigation
  - Les stores Zustand qui pourraient contenir des objets
  - Les `useEffect` qui se déclenchent lors de la navigation arrière

### 2. Erreurs 401 non gérées
- Les erreurs 401 peuvent se produire dans d'autres composants (Sidebar, DashboardLayout, etc.)
- Ces composants pourraient rendre des objets d'erreur directement

### 3. Stores Zustand
- Les stores (`wellnessStore.ts`, `tkiStore.ts`, `feedback360Store.ts`) pourraient contenir des objets qui sont rendus
- Vérifier si des objets sont stockés dans le state et rendus directement

## Recommandations

### 1. Audit complet des stores Zustand
- Vérifier tous les stores pour s'assurer qu'aucun objet n'est rendu directement
- S'assurer que tous les états sont des valeurs primitives ou des objets React valides

### 2. Wrapper pour la gestion d'erreurs
- Créer une fonction utilitaire `formatError(error: unknown): string` qui convertit toujours les erreurs en chaînes
- Utiliser cette fonction partout où des erreurs sont stockées ou rendues

### 3. Vérification des composants parents
- Vérifier `DashboardLayout`, `Sidebar`, et autres composants parents
- S'assurer qu'aucun objet n'est rendu dans ces composants

### 4. Tests de navigation
- Tester spécifiquement la navigation arrière depuis les pages d'assessment
- Vérifier si des objets sont créés ou rendus lors de cette navigation

### 5. Configuration Next.js
- Vérifier la configuration Next.js pour le cache d'images
- Le problème EACCES pourrait être résolu en configurant un chemin de cache différent ou en utilisant un volume persistant

## Actions immédiates requises

1. ✅ **FAIT**: Conversion de tous les `console.log/error` objets en `JSON.stringify()`
2. ✅ **FAIT**: Parsing d'erreur avec try-catch et fallbacks
3. ✅ **FAIT**: Vérification que `error` est toujours une chaîne avant le rendu
4. ⚠️ **À FAIRE**: Audit des stores Zustand
5. ⚠️ **À FAIRE**: Vérification des composants parents (DashboardLayout, Sidebar)
6. ⚠️ **À FAIRE**: Création d'une fonction utilitaire `formatError()`
7. ⚠️ **À FAIRE**: Tests de navigation arrière spécifiques

## Fichiers à vérifier

1. `apps/web/src/stores/wellnessStore.ts`
2. `apps/web/src/stores/tkiStore.ts`
3. `apps/web/src/stores/feedback360Store.ts`
4. `apps/web/src/components/layout/DashboardLayout.tsx`
5. `apps/web/src/components/ui/Sidebar.tsx`
6. `apps/web/src/lib/api/client.ts`
7. `apps/web/src/lib/api/assessments.ts`

## Conclusion

Bien que plusieurs corrections aient été appliquées, l'erreur React #130 persiste, particulièrement lors de la navigation arrière. Il est probable que le problème vienne d'un composant parent ou d'un store Zustand qui n'a pas encore été audité. Un audit complet de tous les composants et stores est nécessaire pour identifier la source exacte du problème.
