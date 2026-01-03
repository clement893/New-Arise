# Audit - Problème de Sauvegarde des Réponses Wellness

## 🔍 Problème Identifié

L'utilisateur signale que les réponses ne sont pas sauvegardées lors d'un test Wellness. Les réponses n'apparaissent pas dans le compteur (0/30) et les barres de progression ne se mettent pas à jour.

## 📋 Analyse du Code

### 1. Fonction `setAnswer` dans `wellnessStore.ts` (lignes 163-192)

```typescript
setAnswer: async (questionId: string, value: number) => {
  const { assessmentId, answers } = get();

  // Update local state immediately for better UX
  set({ answers: { ...answers, [questionId]: value } });

  // Save to backend if assessment is started
  if (assessmentId) {
    try {
      // Save answer - backend expects answer_value as string
      await assessmentsApi.saveResponse(assessmentId, {
        question_id: questionId,
        answer_value: String(value),
      });
    } catch (error: unknown) {
      // Error is handled and displayed to user via error state
      // Only log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save answer:', error);
      }
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to save answer';
      set({
        error: errorMessage,
      });
    }
  }
},
```

**Problème potentiel #1 :** Si `assessmentId` est `null` ou `undefined`, la sauvegarde backend ne se fait jamais, mais le state local est mis à jour. Cela crée une incohérence.

**Problème potentiel #2 :** Les erreurs de sauvegarde ne sont loggées qu'en développement. En production, l'utilisateur ne voit pas l'erreur.

### 2. Fonction `getProgress` dans `wellnessStore.ts` (lignes 335-338)

```typescript
getProgress: () => {
  const { answers } = get();
  return Math.round((Object.keys(answers).length / TOTAL_QUESTIONS) * 100);
},
```

**Problème potentiel #3 :** Le progrès est calculé uniquement à partir du state local (`answers`). Si les réponses ne sont pas sauvegardées dans le backend mais sont dans le state local, le progrès s'affiche mais les données ne persistent pas.

### 3. Fonction `loadExistingAnswers` dans `wellnessStore.ts` (lignes 86-134)

```typescript
loadExistingAnswers: async (assessmentId: number) => {
  // ...
  const existingAnswers = await getAssessmentAnswers(assessmentId);
  // ...
  set({
    assessmentId,
    answers,
    currentQuestionIndex: firstUnansweredIndex,
    currentStep: 'questions',
    isLoading: false,
  });
},
```

**Problème potentiel #4 :** Si `loadExistingAnswers` est appelé après que l'utilisateur ait répondu à des questions, il pourrait écraser les réponses locales non sauvegardées.

### 4. Page `wellness/page.tsx` - `checkExistingAssessment` (lignes 42-116)

```typescript
useEffect(() => {
  const checkExistingAssessment = async () => {
    // ...
    if (wellnessAssessment && wellnessAssessment.id) {
      // ...
      // Load existing answers and navigate to last unanswered question
      await loadExistingAnswers(wellnessAssessment.id);
    }
  };
  checkExistingAssessment();
}, [router]);
```

**Problème potentiel #5 :** `loadExistingAnswers` est appelé à chaque fois que `router` change, ce qui pourrait écraser les réponses en cours.

**Problème potentiel #6 :** Si l'utilisateur commence un nouveau test mais qu'un assessment existant est trouvé, `loadExistingAnswers` pourrait écraser les nouvelles réponses.

## 🐛 Problèmes Identifiés

### ❌ Problème Critique #1 : `assessmentId` peut être `null` lors de la sauvegarde

**Scénario :**
1. L'utilisateur clique sur "Start Assessment"
2. `startAssessment()` est appelé mais échoue silencieusement
3. `assessmentId` reste `null`
4. L'utilisateur répond aux questions
5. `setAnswer()` met à jour le state local mais ne sauvegarde pas au backend (car `assessmentId` est `null`)
6. Le progrès s'affiche localement mais les données ne persistent pas

**Solution :** Vérifier que `assessmentId` est défini avant de permettre à l'utilisateur de répondre.

### ⚠️ Problème #2 : Erreurs de sauvegarde silencieuses en production

**Scénario :**
1. L'utilisateur répond à une question
2. `setAnswer()` essaie de sauvegarder au backend
3. La sauvegarde échoue (erreur réseau, timeout, etc.)
4. L'erreur n'est loggée qu'en développement
5. L'utilisateur ne sait pas que sa réponse n'a pas été sauvegardée

**Solution :** Toujours logger les erreurs et afficher un message à l'utilisateur.

### ⚠️ Problème #3 : `loadExistingAnswers` peut écraser les réponses locales

**Scénario :**
1. L'utilisateur répond à quelques questions (réponses dans le state local)
2. `loadExistingAnswers` est appelé (peut-être par un re-render)
3. Les réponses locales sont écrasées par les réponses du backend (qui peuvent être vides si la sauvegarde n'a pas fonctionné)

**Solution :** Ne pas appeler `loadExistingAnswers` si des réponses locales existent déjà.

### ⚠️ Problème #4 : Le progrès ne reflète pas les réponses sauvegardées

**Scénario :**
1. Le progrès est calculé uniquement à partir du state local
2. Si les réponses ne sont pas sauvegardées au backend, le progrès affiche un faux positif
3. Quand l'utilisateur recharge la page, le progrès revient à 0

**Solution :** Recharger les réponses depuis le backend périodiquement ou après chaque sauvegarde.

## 🔧 Solutions Proposées

### Solution 1 : Vérifier `assessmentId` avant de permettre les réponses

**Fichier :** `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`

```typescript
const handleAnswerSelect = async (value: number) => {
  if (currentQuestion) {
    const { assessmentId } = useWellnessStore.getState();
    if (!assessmentId) {
      console.error('No assessment ID - cannot save answer');
      // Optionally show error to user
      return;
    }
    await setAnswer(currentQuestion.id, value);
  }
};
```

### Solution 2 : Toujours logger les erreurs et afficher un message

**Fichier :** `apps/web/src/stores/wellnessStore.ts`

```typescript
setAnswer: async (questionId: string, value: number) => {
  const { assessmentId, answers } = get();

  // Update local state immediately for better UX
  set({ answers: { ...answers, [questionId]: value } });

  // Save to backend if assessment is started
  if (assessmentId) {
    try {
      await assessmentsApi.saveResponse(assessmentId, {
        question_id: questionId,
        answer_value: String(value),
      });
      // Log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Wellness] Answer saved: ${questionId} = ${value}`);
      }
    } catch (error: unknown) {
      // ALWAYS log errors, even in production
      console.error('[Wellness] Failed to save answer:', error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to save answer';
      set({
        error: errorMessage,
      });
      // Optionally show toast notification to user
    }
  } else {
    // Log warning if assessmentId is missing
    console.warn('[Wellness] Cannot save answer: assessmentId is null');
    set({
      error: 'Assessment not started. Please start the assessment first.',
    });
  }
},
```

### Solution 3 : Ne pas écraser les réponses locales

**Fichier :** `apps/web/src/stores/wellnessStore.ts`

```typescript
loadExistingAnswers: async (assessmentId: number) => {
  set({ isLoading: true, error: null });
  try {
    const { answers: existingLocalAnswers } = get();
    
    // Only load from backend if we don't have local answers
    // This prevents overwriting answers that haven't been saved yet
    if (Object.keys(existingLocalAnswers).length > 0) {
      console.log('[Wellness] Local answers exist, skipping load from backend');
      set({ isLoading: false });
      return;
    }

    const existingAnswers = await getAssessmentAnswers(assessmentId);
    // ... rest of the function
  }
},
```

### Solution 4 : Recharger les réponses après sauvegarde pour vérifier

**Fichier :** `apps/web/src/stores/wellnessStore.ts`

```typescript
setAnswer: async (questionId: string, value: number) => {
  const { assessmentId, answers } = get();

  // Update local state immediately for better UX
  set({ answers: { ...answers, [questionId]: value } });

  if (assessmentId) {
    try {
      await assessmentsApi.saveResponse(assessmentId, {
        question_id: questionId,
        answer_value: String(value),
      });
      
      // Verify the answer was saved by reloading from backend
      // This ensures consistency between local state and backend
      const savedAnswers = await getAssessmentAnswers(assessmentId);
      const savedValue = savedAnswers[questionId];
      if (savedValue && String(savedValue) === String(value)) {
        // Answer was saved successfully
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Wellness] Answer verified: ${questionId} = ${value}`);
        }
      } else {
        console.warn(`[Wellness] Answer may not have been saved: ${questionId}`);
      }
    } catch (error: unknown) {
      // ... error handling
    }
  }
},
```

## 🎯 Plan d'Action Recommandé

### Phase 1 : Diagnostic (PRIORITÉ HAUTE)
1. ✅ Ajouter des logs détaillés pour tracer le flux de sauvegarde
2. ✅ Vérifier que `assessmentId` est défini avant chaque sauvegarde
3. ✅ Vérifier que les appels API réussissent

### Phase 2 : Corrections (PRIORITÉ HAUTE)
1. ✅ S'assurer que `assessmentId` est toujours défini avant de permettre les réponses
2. ✅ Toujours logger les erreurs (même en production)
3. ✅ Afficher un message d'erreur à l'utilisateur si la sauvegarde échoue
4. ✅ Ne pas écraser les réponses locales avec `loadExistingAnswers` si des réponses locales existent

### Phase 3 : Améliorations (PRIORITÉ MOYENNE)
1. ✅ Vérifier la sauvegarde après chaque réponse
2. ✅ Recharger périodiquement les réponses depuis le backend
3. ✅ Afficher un indicateur de sauvegarde en cours

## 🔍 Points de Vérification

### Checklist de Diagnostic

- [ ] Vérifier que `assessmentId` est défini dans le store après `startAssessment()`
- [ ] Vérifier que `setAnswer()` est appelé avec un `assessmentId` valide
- [ ] Vérifier que les appels API `saveResponse()` réussissent (status 200)
- [ ] Vérifier que les réponses sont bien dans la base de données après sauvegarde
- [ ] Vérifier que `getProgress()` utilise bien le state local `answers`
- [ ] Vérifier que `loadExistingAnswers()` ne s'exécute pas trop souvent
- [ ] Vérifier les logs de la console pour les erreurs de sauvegarde

## 📝 Notes Techniques

### Format des Question IDs

Les questions Wellness utilisent le format `"wellness_q1"`, `"wellness_q2"`, etc. (défini dans `wellnessQuestionsReal.ts`).

### Format des Réponses

Les réponses Wellness sont des nombres de 1 à 5, convertis en string pour l'API : `String(value)`.

### Persistence

Le store Wellness utilise `persist` de Zustand, ce qui sauvegarde dans `localStorage`. Cela peut créer une incohérence si :
- Les réponses sont dans `localStorage` mais pas dans le backend
- Le `localStorage` est vidé mais le backend a les réponses
