# Audit Complet: React Error #130 - Objects Not Valid as React Child

## Date: 2026-01-04
## Statut: CRITIQUE - Erreur récurrente

## Problème
L'erreur React #130 se produit de manière récurrente:
1. **Lors de la navigation arrière** depuis une page d'assessment vers la page assessments
2. **Sur la page wellness** lors de l'accès ou de la navigation
3. **Lors du chargement initial** de la page assessments

L'erreur indique qu'un **objet est rendu directement dans le JSX** au lieu d'une valeur primitive (string, number, etc.).

## Erreurs observées dans les logs

### 1. Erreurs 404 (Not Found) - NORMALES
```
GET /api/v1/assessments/70/results 404 (Not Found)
```
- **Statut**: Normal - Les résultats n'existent pas encore pour cet assessment
- **Impact**: L'erreur 404 est gérée, mais l'objet d'erreur axios pourrait être rendu

### 2. Erreurs 401 (Unauthorized) - PROBLÉMATIQUES
```
GET /api/v1/assessments/my-assessments 401 (Unauthorized)
GET /api/v1/admin/check-my-superadmin-status 401 (Unauthorized)
```
- **Statut**: Problématique - Le token JWT a expiré
- **Impact**: Les objets d'erreur axios sont passés à `setError()` et pourraient être rendus
- **Fréquence**: Se produit fréquemment lors de la navigation arrière

### 3. Erreurs de permissions (EACCES) - INFRASTRUCTURE
```
Error: EACCES: permission denied, mkdir '/app/apps/web/.next/cache'
```
- **Statut**: Problème d'infrastructure/de déploiement sur Railway
- **Impact**: N'affecte pas directement React #130 mais peut causer des erreurs secondaires

## Analyse détaillée par fichier

### 1. Page Assessments (`apps/web/src/app/[locale]/dashboard/assessments/page.tsx`)

#### ✅ CORRECTIONS APPLIQUÉES:
- **Ligne 245-267**: Gestion d'erreur avec try-catch et conversion en chaînes
- **Ligne 499-515**: Vérification que `error` est une chaîne avant le rendu
- **Lignes 121-129, 141-150, 174-198, 191-197, 329-338**: `console.log` convertis en `JSON.stringify()`

#### ⚠️ PROBLÈMES POTENTIELS RESTANTS:
- **Ligne 118**: `await getMyAssessments()` - Si cette fonction lance une erreur axios, l'objet pourrait être passé à `setError()`
- **Ligne 266**: `await startAssessment()` - Même problème
- **Ligne 386**: `await submitAssessment()` - Même problème

### 2. Page Results (`apps/web/src/app/[locale]/dashboard/assessments/results/page.tsx`)

#### ✅ CORRECTIONS APPLIQUÉES:
- **Ligne 123-147**: Parsing d'erreur avec try-catch et fallbacks
- **Ligne 231-256**: Vérification que `error` est une chaîne avant le rendu
- **Lignes 404-412, 419-427**: Expressions JSX complexes encapsulées dans des IIFE

#### ⚠️ PROBLÈMES POTENTIELS RESTANTS:
- **Ligne 119**: `await assessmentsApi.getResults(id)` - Si cette fonction lance une erreur axios, l'objet pourrait être passé à `setError()`
- **Ligne 42**: `await getMyAssessments()` - Même problème
- **Ligne 83**: `await submitAssessment(id)` - Même problème

### 3. Page Wellness (`apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`)

#### ✅ CORRECTIONS APPLIQUÉES:
- **Ligne 188-209**: Conversion de l'erreur en chaîne avant de logger
- **Lignes 48-60**: Vérifications de type pour `progress` et `currentAnswer`
- **Lignes 483, 489**: Vérifications de type avant le rendu de `progress`

#### ⚠️ PROBLÈMES POTENTIELS IDENTIFIÉS:
- **Ligne 194**: `await getAssessmentResults(assessmentId)` - Si cette fonction lance une erreur axios, l'objet pourrait être passé à `setError()` ou rendu
- **Ligne 211-228**: `handleAnswerSelect` - Si `setAnswer` lance une erreur, l'objet pourrait être rendu
- **Ligne 234**: `await completeAssessment()` - Même problème
- **Ligne 323**: `await startAssessment('WELLNESS')` - Même problème

### 4. Page 360-Feedback Results (`apps/web/src/app/[locale]/dashboard/assessments/360-feedback/results/page.tsx`)

#### ⚠️ PROBLÈMES CRITIQUES:
- **Ligne 115-119**: Parsing d'erreur **INCOMPLET**
  ```typescript
  const errorMessage = err && typeof err === 'object' && 'message' in err
    ? (err as { message?: string }).message
    : undefined;
  setError(errorMessage || 'Failed to load results');
  ```
  - **PROBLÈME**: Ne gère que `err.message`, pas les erreurs axios complètes avec `response`
  - **PROBLÈME**: Pas de try-catch autour du parsing
  - **PROBLÈME**: Pas de vérification que `errorMessage` est une chaîne avant `setError()`
  - **PROBLÈME**: Si `err` est un objet axios, `err.message` pourrait être `undefined` et l'objet pourrait être stocké

- **Ligne 137**: Rendu de `error` dans le JSX
  ```typescript
  <p className="mb-4 text-red-600">{error || 'No results found'}</p>
  ```
  - **PROBLÈME**: Pas de vérification que `error` est une chaîne avant le rendu
  - **PROBLÈME**: Si `error` est un objet, il sera rendu directement

### 5. Page TKI Results (`apps/web/src/app/[locale]/dashboard/assessments/tki/results/page.tsx`)

#### ⚠️ PROBLÈMES CRITIQUES:
- **Ligne 53-57**: Parsing d'erreur **INCOMPLET**
  ```typescript
  const errorMessage = err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
    : undefined;
  setError(errorMessage || 'Failed to load results');
  ```
  - **PROBLÈME**: Ne gère que `response.data.detail`, pas tous les cas (message, status, etc.)
  - **PROBLÈME**: Pas de try-catch autour du parsing
  - **PROBLÈME**: Pas de vérification que `errorMessage` est une chaîne avant `setError()`
  - **PROBLÈME**: Si `err` n'a pas `response`, l'objet pourrait être stocké

### 6. Stores Zustand

#### Wellness Store (`apps/web/src/stores/wellnessStore.ts`)
- **À VÉRIFIER**: Les valeurs stockées dans `answers`, `currentQuestionIndex`, `progress` pourraient être des objets
- **À VÉRIFIER**: `loadExistingAnswers` pourrait stocker des objets dans le state
- **À VÉRIFIER**: `setAnswer` pourrait stocker des objets au lieu de valeurs primitives

#### TKI Store (`apps/web/src/stores/tkiStore.ts`)
- **À VÉRIFIER**: Même problème que Wellness Store

#### Feedback 360 Store (`apps/web/src/stores/feedback360Store.ts`)
- **À VÉRIFIER**: Même problème que Wellness Store

### 7. API Client (`apps/web/src/lib/api/client.ts`)

#### ⚠️ PROBLÈME CRITIQUE IDENTIFIÉ:
- **Ligne 73-191**: Intercepteur de réponse axios
  - **PROBLÈME**: `handleApiError(error)` est appelé, mais la fonction retourne un objet `AppError`
  - **PROBLÈME**: Si `handleApiError` retourne un objet, cet objet est rejeté avec `Promise.reject(appError)`
  - **PROBLÈME**: Les composants qui attrapent cette erreur pourraient la stocker directement dans `setError()`

### 8. Error Handler (`apps/web/src/lib/errors.ts`)

#### ⚠️ À VÉRIFIER:
- La fonction `handleApiError` retourne-t-elle un objet `AppError`?
- Si oui, cet objet pourrait être passé à `setError()` et rendu directement

### 9. Composants Parents

#### DashboardLayout (`apps/web/src/components/layout/DashboardLayout.tsx`)
- **À VÉRIFIER**: Gestion d'erreurs dans les `useEffect`
- **À VÉRIFIER**: Rendu d'objets dans le JSX

#### Sidebar (`apps/web/src/components/ui/Sidebar.tsx`)
- **À VÉRIFIER**: Rendu d'objets dans le JSX
- **À VÉRIFIER**: Gestion d'erreurs lors du chargement des données

## Scénarios de reproduction

### Scénario 1: Navigation arrière depuis un test
1. Ouvrir un test (Wellness, TKI, ou 360-Feedback)
2. Faire BACK vers `/dashboard/assessments`
3. **ERREUR**: React #130 se produit

**Cause probable**: 
- Lors du chargement de `/dashboard/assessments`, `getMyAssessments()` est appelé
- Si le token a expiré, une erreur 401 est lancée
- L'objet d'erreur axios est passé à `setError()` sans conversion
- L'objet est rendu dans le JSX → React #130

### Scénario 2: Accès à la page wellness
1. Accéder directement à `/dashboard/assessments/wellness`
2. **ERREUR**: React #130 se produit

**Cause probable**:
- `getAssessmentResults()` est appelé dans le `useEffect` (ligne 194)
- Si les résultats n'existent pas, une erreur 404 est lancée
- L'objet d'erreur axios est passé à `setError()` ou rendu directement
- L'objet est rendu dans le JSX → React #130

### Scénario 3: Chargement initial de assessments
1. Accéder à `/dashboard/assessments`
2. **ERREUR**: React #130 se produit

**Cause probable**:
- `getMyAssessments()` est appelé
- Si le token a expiré, une erreur 401 est lancée
- L'objet d'erreur axios est passé à `setError()` sans conversion
- L'objet est rendu dans le JSX → React #130

## Analyse de la chaîne d'erreur

### Flux typique d'une erreur:
1. **API Client** (`apiClient.get()`) → Lance une erreur axios
2. **Intercepteur** (`client.ts:73`) → Appelle `handleApiError(error)`
3. **Error Handler** (`errors.ts`) → Retourne un objet `AppError`
4. **Composant** → Attrape l'erreur dans un `catch`
5. **setError()** → Stocke l'erreur (qui pourrait être un objet)
6. **JSX** → Rend `{error}` → **React #130**

### Points de défaillance:
1. **`handleApiError` retourne un objet** au lieu d'une chaîne
2. **Les composants ne convertissent pas toujours** les erreurs en chaînes avant `setError()`
3. **Les composants ne vérifient pas toujours** que `error` est une chaîne avant le rendu

## Solutions recommandées

### Solution 1: Fonction utilitaire `formatError()`
Créer une fonction utilitaire qui convertit **TOUJOURS** les erreurs en chaînes:

```typescript
// apps/web/src/lib/utils/formatError.ts
export function formatError(error: unknown): string {
  try {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: { detail?: string; message?: string }; status?: number } }).response;
      if (response?.status === 401) {
        return 'Your session has expired. Please refresh the page to log in again.';
      } else if (response?.status === 404) {
        return response.data?.detail || response.data?.message || 'Resource not found.';
      } else {
        return response?.data?.detail || response?.data?.message || 'An error occurred.';
      }
    } else if (error instanceof Error) {
      return error.message;
    } else if (error !== null && error !== undefined) {
      return String(error);
    }
    return 'An unexpected error occurred.';
  } catch (parseError) {
    return 'An unexpected error occurred while processing the error.';
  }
}
```

### Solution 2: Wrapper pour `setError()`
Créer un wrapper qui garantit que seules les chaînes sont stockées:

```typescript
// apps/web/src/lib/utils/safeSetError.ts
import { formatError } from './formatError';

export function safeSetError(
  setError: (error: string | null) => void,
  error: unknown
): void {
  setError(formatError(error));
}
```

### Solution 3: Modifier `handleApiError` pour retourner une chaîne
Modifier `handleApiError` pour retourner une chaîne au lieu d'un objet, OU modifier tous les composants pour utiliser `formatError()`.

### Solution 4: Vérification systématique avant le rendu
Ajouter une vérification systématique avant de rendre `error`:

```typescript
const errorString = typeof error === 'string' ? error : formatError(error);
```

## Fichiers à corriger en priorité

### PRIORITÉ 1 (CRITIQUE):
1. ✅ `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` - DÉJÀ CORRIGÉ
2. ✅ `apps/web/src/app/[locale]/dashboard/assessments/results/page.tsx` - DÉJÀ CORRIGÉ
3. ⚠️ `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/results/page.tsx` - **À CORRIGER**
4. ⚠️ `apps/web/src/app/[locale]/dashboard/assessments/tki/results/page.tsx` - **À CORRIGER**
5. ⚠️ `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx` - **À VÉRIFIER/CORRIGER**

### PRIORITÉ 2 (IMPORTANT):
6. ⚠️ `apps/web/src/lib/utils/formatError.ts` - **À CRÉER**
7. ⚠️ `apps/web/src/lib/utils/safeSetError.ts` - **À CRÉER**
8. ⚠️ `apps/web/src/lib/errors.ts` - **À VÉRIFIER/MODIFIER**

### PRIORITÉ 3 (À VÉRIFIER):
9. ⚠️ `apps/web/src/stores/wellnessStore.ts` - **À VÉRIFIER**
10. ⚠️ `apps/web/src/stores/tkiStore.ts` - **À VÉRIFIER**
11. ⚠️ `apps/web/src/stores/feedback360Store.ts` - **À VÉRIFIER**
12. ⚠️ `apps/web/src/components/layout/DashboardLayout.tsx` - **À VÉRIFIER**
13. ⚠️ `apps/web/src/components/ui/Sidebar.tsx` - **À VÉRIFIER**

## Plan d'action immédiat

### Étape 1: Créer la fonction utilitaire `formatError()`
- Créer `apps/web/src/lib/utils/formatError.ts`
- Implémenter la conversion complète des erreurs en chaînes
- Gérer tous les cas: axios errors, Error objects, strings, null, undefined

### Étape 2: Corriger les pages de résultats non corrigées
- Corriger `360-feedback/results/page.tsx` avec le même pattern que `results/page.tsx`
- Corriger `tki/results/page.tsx` avec le même pattern
- Utiliser `formatError()` partout

### Étape 3: Corriger la page wellness
- Vérifier tous les `setError()` dans `wellness/page.tsx`
- Utiliser `formatError()` pour toutes les erreurs
- Vérifier que `error` est toujours une chaîne avant le rendu

### Étape 4: Vérifier les stores Zustand
- Vérifier que les valeurs stockées sont toujours des primitives
- Vérifier que `setAnswer()` stocke toujours des nombres, pas des objets
- Vérifier que `loadExistingAnswers()` ne stocke pas d'objets

### Étape 5: Vérifier les composants parents
- Vérifier `DashboardLayout` pour des objets rendus
- Vérifier `Sidebar` pour des objets rendus
- Utiliser `formatError()` partout où des erreurs sont gérées

### Étape 6: Tests
- Tester la navigation arrière depuis tous les tests
- Tester l'accès direct à toutes les pages
- Tester avec des tokens expirés (401)
- Tester avec des ressources non trouvées (404)

## Problèmes critiques identifiés dans les stores

### Wellness Store (`apps/web/src/stores/wellnessStore.ts`)

#### ⚠️ PROBLÈME CRITIQUE - Ligne 149-155:
```typescript
} catch (error: unknown) {
  console.error('[Wellness] Failed to load existing answers:', error);
  set({
    error: 'Failed to load existing answers',
    isLoading: false,
  });
}
```
- **PROBLÈME**: `console.error` avec un objet `error` - pourrait causer React #130 si React essaie de rendre l'objet
- **PROBLÈME**: Le message d'erreur est hardcodé, mais l'objet `error` est passé à `console.error`

#### ⚠️ PROBLÈME CRITIQUE - Ligne 73-82:
```typescript
} catch (error: unknown) {
  const errorMessage =
    axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : 'Failed to start assessment';
  set({
    error: errorMessage,
    isLoading: false,
  });
}
```
- **PROBLÈME**: Parsing d'erreur incomplet - ne gère que `response.data.message`, pas tous les cas
- **PROBLÈME**: Pas de vérification que `errorMessage` est une chaîne avant `set()`

#### ⚠️ PROBLÈME CRITIQUE - Ligne 193-235:
```typescript
setAnswer: async (questionId: string, value: number) => {
  // ...
  try {
    // ...
  } catch (error: unknown) {
    // Always log errors (even in production) with detailed context
    console.error('[Wellness] Failed to save answer:', {
      questionId,
      value,
      assessmentId: get().assessmentId,
      error,
    });
    throw error; // Re-throw to let component handle it
  }
}
```
- **PROBLÈME CRITIQUE**: `console.error` avec un objet contenant `error` - pourrait causer React #130
- **PROBLÈME**: L'erreur est re-lancée, mais si elle est attrapée dans le composant, elle pourrait être rendue

### Page Wellness (`apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`)

#### ⚠️ PROBLÈME CRITIQUE - Ligne 64:
```typescript
} catch (error) {
  console.error('[Wellness] Error accessing question data:', error);
  // Fallback values - component will show error state
}
```
- **PROBLÈME**: `console.error` avec un objet `error` - pourrait causer React #130

#### ⚠️ PROBLÈME CRITIQUE - Ligne 211-228:
```typescript
const handleAnswerSelect = async (value: number) => {
  // ...
  try {
    await setAnswer(currentQuestion.id, value);
  } catch (err) {
    console.error('[Wellness] Error saving answer:', err);
    alert('Erreur lors de la sauvegarde de la réponse. Veuillez réessayer.');
  }
}
```
- **PROBLÈME**: `console.error` avec un objet `err` - pourrait causer React #130
- **PROBLÈME**: Si `setAnswer` lance une erreur, elle pourrait être rendue quelque part

## Conclusion

L'erreur React #130 est causée par le rendu direct d'objets d'erreur dans le JSX. Bien que plusieurs corrections aient été appliquées, il reste des endroits critiques où:

1. **Les `console.error` passent des objets** - React pourrait essayer de les rendre dans certains cas
2. **Les stores ne convertissent pas toujours les erreurs en chaînes** avant de les stocker
3. **Les pages wellness et autres pages de résultats** ont des parsing d'erreur incomplets
4. **Les erreurs axios sont passées directement** à `setError()` sans conversion

**La solution la plus efficace** est de:
1. Créer une fonction utilitaire `formatError()` qui garantit que toutes les erreurs sont converties en chaînes
2. Convertir tous les `console.error` pour utiliser `JSON.stringify()` ou `formatError()`
3. Utiliser `formatError()` systématiquement partout où des erreurs sont gérées
4. Vérifier que tous les stores convertissent les erreurs en chaînes avant de les stocker
