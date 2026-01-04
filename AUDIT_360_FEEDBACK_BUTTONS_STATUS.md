# Audit complet: Boutons, Tests et États d'avancement - 360° Feedback

## Problème identifié

Le bouton "Voir les résultats" s'affiche même quand toutes les questions ne sont pas complétées (par exemple: 26/30 questions répondues).

## Points d'audit

### 1. Nombre de questions pour 360° Feedback
- **Attendu**: 30 questions (confirmé dans `feedback360Questions.ts`)
- **Vérifié**: Le fichier de données contient 30 questions (360_1 à 360_30)

### 2. Fonction `determineAssessmentStatus` (ligne 45-49)
**Fichier**: `apps/web/src/lib/utils/assessmentStatus.ts`

**Problème**: Utilise `>=` au lieu de `===` strict

```typescript
const hasAllAnswers = 
  apiAssessment.answer_count !== undefined && 
  apiAssessment.total_questions !== undefined &&
  apiAssessment.total_questions > 0 &&
  apiAssessment.answer_count >= apiAssessment.total_questions; // ⚠️ PROBLÈME: >= au lieu de ===
```

**Impact**: Si `answer_count` est supérieur à `total_questions` (dû à une erreur de données), l'assessment est marqué comme "completed" incorrectement.

**Solution recommandée**: Utiliser `===` strict pour s'assurer que le nombre exact de questions est répondu.

### 3. Fonction `getActionButton` (ligne 781-788)
**Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

**État actuel**: Utilise `===` strict (CORRECT après correction récente)

```typescript
if (answerCountNum > 0 && 
    totalQuestionsNum > 0 && 
    answerCountNum === totalQuestionsNum) { // ✅ CORRECT: === strict
```

**Problème**: Si `determineAssessmentStatus` retourne "completed" (avec `>=`), le code dans `getActionButton` pour "in-progress" n'est jamais exécuté. Le status "completed" affiche toujours "Voir les résultats" sans vérifier si toutes les questions sont vraiment répondues.

**Solution**: 
1. Corriger `determineAssessmentStatus` pour utiliser `===` strict
2. Ajouter une vérification supplémentaire dans le case 'completed' pour vérifier que toutes les questions sont vraiment complétées

### 4. Calcul de `answerCount` et `totalQuestions` depuis l'API
**Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

Les valeurs viennent directement de l'API:
- `apiAssessment.answer_count`
- `apiAssessment.total_questions`

**Vérification nécessaire**: S'assurer que le backend retourne les bonnes valeurs pour le 360 feedback.

### 5. Flux de statut pour 360° Feedback

1. **Backend** retourne `status`, `answer_count`, `total_questions`
2. **`determineAssessmentStatus`** détermine le statut d'affichage ('completed' | 'in-progress' | 'available')
3. **`getActionButton`** affiche le bouton approprié basé sur le statut

**Point de défaillance**: Si `determineAssessmentStatus` retourne "completed" avec `>=`, le bouton "Voir les résultats" s'affiche même si pas toutes les questions sont répondues.

## Corrections nécessaires

1. ✅ **FAIT**: `getActionButton` utilise `===` strict (corrigé)
2. ❌ **À FAIRE**: Corriger `determineAssessmentStatus` pour utiliser `===` strict au lieu de `>=`
3. ❌ **À FAIRE**: Ajouter une vérification supplémentaire dans le case 'completed' de `getActionButton` pour le 360 feedback

## Tests recommandés

1. Tester avec 26/30 questions répondues - ne devrait PAS afficher "Voir les résultats"
2. Tester avec 30/30 questions répondues - devrait afficher "Voir les résultats"
3. Tester avec 31/30 questions répondues (erreur de données) - devrait gérer gracieusement
4. Vérifier que le backend retourne `total_questions = 30` pour le 360 feedback
