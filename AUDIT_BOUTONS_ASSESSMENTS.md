# Audit des Boutons d'Assessments - Rapport Complet

**Date :** 2024-01-XX  
**Objectif :** Identifier et corriger les problèmes avec la logique des 3 états des boutons de tests

---

## 📋 Résumé Exécutif

Les boutons des assessments doivent afficher 3 états distincts :
1. **"Commencer"** - Test non commencé (status = `available`)
2. **"Continuer"** - Test commencé mais non complété (status = `in-progress` avec `answer_count < total_questions`)
3. **"Voir les résultats"** - Test complété (status = `completed` OU `answer_count >= total_questions`)

**Problèmes identifiés :** Plusieurs incohérences dans la détermination du status et la logique des boutons.

---

## 🔍 Analyse Détaillée

### 1. Format du Status Backend

**Backend (`backend/app/models/assessment.py`) :**
```python
class AssessmentStatus(str, enum.Enum):
    NOT_STARTED = "not_started"  # Valeur retournée: "not_started"
    IN_PROGRESS = "in_progress"  # Valeur retournée: "in_progress"
    COMPLETED = "completed"      # Valeur retournée: "completed"
```

**API Response (`backend/app/api/v1/endpoints/assessments.py`) :**
- Le backend retourne `assessment.status.value` qui est toujours en **minuscules avec underscores**
- Format exact : `"not_started"`, `"in_progress"`, `"completed"`

### 2. Pages Concernées

#### A. `/dashboard/assessments` (`apps/web/src/app/[locale]/dashboard/assessments/page.tsx`)

**Fonction de détermination du status (lignes 136-194) :**

✅ **Points positifs :**
- Normalise correctement le status : `rawStatus.toLowerCase().trim().replace(/[_-]/g, '')`
- Vérifie `answer_count >= total_questions` en premier (logique correcte)
- Gère le cas `NOT_STARTED` avec `answer_count > 0` → `in-progress`

⚠️ **Problèmes identifiés :**

1. **Normalisation trop agressive** (ligne 143) :
   ```typescript
   const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');
   ```
   - `"not_started"` devient `"notstarted"` ✅
   - `"in_progress"` devient `"inprogress"` ✅
   - Mais `"not_started"` et `"notstarted"` deviennent identiques (pas de problème ici)
   - **Problème réel** : Si le backend retourne une valeur inattendue, la normalisation peut créer des collisions

2. **Vérification `hasAllAnswers`** (lignes 159-162) :
   ```typescript
   const hasAllAnswers = apiAssessment.answer_count !== undefined && 
                         apiAssessment.total_questions !== undefined &&
                         apiAssessment.total_questions > 0 &&
                         apiAssessment.answer_count >= apiAssessment.total_questions;
   ```
   - ✅ Correcte en théorie
   - ⚠️ Si `total_questions` est `undefined` ou `0`, un assessment complété peut être considéré comme `in-progress`

3. **Ordre des vérifications** :
   - ✅ Correct : Vérifie `hasAllAnswers` AVANT le status normalisé
   - ✅ Correct : Gère `NOT_STARTED` avec réponses

**Fonction `getActionButton` (lignes 300-439) :**

✅ **Logique correcte :**
- `completed` → "Voir les résultats" ✅
- `in-progress` avec `answerCount >= totalQuestions` → "Voir les résultats" ✅
- `in-progress` avec `answerCount < totalQuestions` → "Continuer" ✅
- `available` → "Commencer" ✅

⚠️ **Problème :**
- Pour `in-progress` avec toutes les réponses, soumet l'assessment avant de rediriger (lignes 348-349) ✅
- Mais si la soumission échoue, redirige quand même (lignes 360-367) - peut causer des problèmes

#### B. `/dashboard` (`apps/web/src/app/[locale]/dashboard/page.tsx`)

**Fonction de détermination du status (lignes 202-224) :**

❌ **Problèmes majeurs identifiés :**

1. **Pas de normalisation du status** :
   ```typescript
   if (hasAllAnswers || assessment.status === 'COMPLETED') {
     status = 'completed';
   } else if (assessment.status === 'NOT_STARTED') {
     // ...
   } else if (assessment.status === 'IN_PROGRESS') {
     status = 'in-progress';
   }
   ```
   - Compare directement avec `'COMPLETED'`, `'NOT_STARTED'`, `'IN_PROGRESS'` (uppercase)
   - Mais le backend retourne `'completed'`, `'not_started'`, `'in_progress'` (lowercase avec underscores)
   - **RÉSULTAT : Les comparaisons échouent toujours !**

2. **Logique incohérente** :
   - La vérification `hasAllAnswers` est correcte
   - Mais si `hasAllAnswers` est `false` et que le status est `'completed'` (lowercase), l'assessment sera considéré comme `available` ou `in-progress` au lieu de `completed`

**Fonction `getActionButton` (lignes 283-368) :**

⚠️ **Problèmes :**

1. **Pas de soumission automatique** :
   - Pour `in-progress` avec toutes les réponses, redirige directement vers les résultats
   - Ne soumet pas l'assessment avant (contrairement à `assessments/page.tsx`)
   - **RÉSULTAT : L'assessment peut ne pas être marqué comme `completed` dans la base de données**

2. **Logique correcte mais incomplète** :
   - Les vérifications sont dans le bon ordre
   - Mais manque la soumission automatique

---

## 🐛 Problèmes Critiques Identifiés

### ❌ Problème Critique #1 : Comparaison incorrecte du status dans `dashboard/page.tsx`

**Fichier :** `apps/web/src/app/[locale]/dashboard/page.tsx`  
**Lignes :** 210, 212, 221

**Description :**
```typescript
// ❌ INCORRECT - Compare avec uppercase
if (assessment.status === 'COMPLETED') { ... }
else if (assessment.status === 'NOT_STARTED') { ... }
else if (assessment.status === 'IN_PROGRESS') { ... }

// ✅ CORRECT - Backend retourne lowercase avec underscores
// "completed", "not_started", "in_progress"
```

**Impact :**
- Les assessments avec status `'completed'` ne sont jamais détectés comme complétés
- Les assessments avec status `'not_started'` ne sont jamais détectés comme non commencés
- Les assessments avec status `'in_progress'` ne sont jamais détectés comme en cours
- **RÉSULTAT : Tous les assessments affichent "Commencer" ou le mauvais bouton**

**Solution :**
- Normaliser le status comme dans `assessments/page.tsx`
- OU comparer avec les valeurs lowercase avec underscores

### ⚠️ Problème #2 : Pas de soumission automatique dans `dashboard/page.tsx`

**Fichier :** `apps/web/src/app/[locale]/dashboard/page.tsx`  
**Lignes :** 315-336

**Description :**
- Quand un assessment a toutes les réponses (`answerCount >= totalQuestions`), le bouton "Voir les résultats" redirige directement
- Ne soumet pas l'assessment avant (contrairement à `assessments/page.tsx` lignes 348-349)

**Impact :**
- L'assessment reste avec status `'in_progress'` dans la base de données
- Les résultats peuvent ne pas être calculés
- Incohérence entre les deux pages

**Solution :**
- Ajouter la soumission automatique avant de rediriger vers les résultats

### ⚠️ Problème #3 : Gestion incomplète des cas limites

**Description :**
- Si `total_questions` est `undefined` ou `0`, la vérification `hasAllAnswers` échoue toujours
- Si `answer_count` est `undefined`, un assessment peut être mal catégorisé

**Impact :**
- Assessments complétés peuvent afficher "Continuer" au lieu de "Voir les résultats"
- Comportement imprévisible dans certains cas

---

## 🔧 Solutions Proposées

### Solution 1 : Créer une fonction utilitaire pour déterminer le status

**Fichier à créer :** `apps/web/src/lib/utils/assessmentStatus.ts`

```typescript
import type { Assessment } from '@/lib/api/assessments';

/**
 * Détermine le status d'affichage d'un assessment basé sur le status backend et les réponses
 * 
 * @param apiAssessment - Assessment depuis l'API (peut être undefined)
 * @returns Status d'affichage: 'completed' | 'in-progress' | 'available'
 */
export function determineAssessmentStatus(
  apiAssessment: {
    status: string;
    answer_count?: number;
    total_questions?: number;
  } | undefined
): 'completed' | 'in-progress' | 'available' {
  if (!apiAssessment) {
    return 'available';
  }

  // Normalize status: backend returns "not_started", "in_progress", "completed"
  // Handle variations: uppercase, lowercase, with/without underscores
  const rawStatus = String(apiAssessment.status);
  const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');

  // PRIMARY CHECK: If all answers are provided, it's completed (regardless of status)
  const hasAllAnswers = 
    apiAssessment.answer_count !== undefined && 
    apiAssessment.total_questions !== undefined &&
    apiAssessment.total_questions > 0 &&
    apiAssessment.answer_count >= apiAssessment.total_questions;

  if (hasAllAnswers) {
    return 'completed';
  }

  // SECONDARY CHECK: Check normalized status
  if (statusNormalized === 'completed' || statusNormalized === 'complete') {
    return 'completed';
  }

  // Handle NOT_STARTED: if there are answers, it's actually in progress
  if (statusNormalized === 'notstarted' || statusNormalized === 'notstarted') {
    if (apiAssessment.answer_count !== undefined && apiAssessment.answer_count > 0) {
      return 'in-progress';
    }
    return 'available';
  }

  // Handle IN_PROGRESS
  if (statusNormalized === 'inprogress' || statusNormalized === 'inprogress') {
    return 'in-progress';
  }

  // FALLBACK: If there are some answers, it's in progress
  if (apiAssessment.answer_count !== undefined && apiAssessment.answer_count > 0) {
    return 'in-progress';
  }

  return 'available';
}
```

### Solution 2 : Créer une fonction utilitaire pour générer le bouton d'action

**Fichier à créer :** `apps/web/src/lib/utils/assessmentButton.tsx`

```typescript
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import type { AssessmentType } from '@/lib/api/assessments';
import { submitAssessment } from '@/lib/api/assessments';

interface AssessmentButtonProps {
  status: 'completed' | 'in-progress' | 'available' | 'locked';
  assessmentType: AssessmentType;
  assessmentId?: number;
  answerCount?: number;
  totalQuestions?: number;
  externalLink?: string;
  requiresEvaluators?: boolean;
  onEvaluatorModalOpen?: () => void;
  className?: string;
}

export function getAssessmentActionButton({
  status,
  assessmentType,
  assessmentId,
  answerCount,
  totalQuestions,
  externalLink,
  requiresEvaluators,
  onEvaluatorModalOpen,
  className = '',
}: AssessmentButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get route
  const getAssessmentRoute = (type: AssessmentType): string => {
    switch (type) {
      case 'TKI': return 'tki';
      case 'WELLNESS': return 'wellness';
      case 'THREE_SIXTY_SELF': return '360-feedback';
      case 'MBTI': return 'mbti';
      default: return String(type).toLowerCase();
    }
  };

  // Helper function to navigate to results
  const navigateToResults = (type: AssessmentType, id?: number) => {
    if (!id) return;
    
    if (type === 'TKI') {
      router.push(`/dashboard/assessments/tki/results?id=${id}`);
    } else if (type === 'WELLNESS') {
      router.push(`/dashboard/assessments/results?id=${id}`);
    } else if (type === 'THREE_SIXTY_SELF') {
      router.push(`/dashboard/assessments/360-feedback/results?id=${id}`);
    } else if (type === 'MBTI' && externalLink) {
      window.open(externalLink, '_blank');
    }
  };

  // Case 1: Locked
  if (status === 'locked') {
    return (
      <Button variant="secondary" disabled className={className}>
        Verrouillé
      </Button>
    );
  }

  // Case 2: Completed → Voir les résultats
  if (status === 'completed') {
    if (assessmentType === 'MBTI' && externalLink) {
      return (
        <Button
          variant="outline"
          className={className}
          onClick={() => window.open(externalLink, '_blank')}
        >
          Télécharger mon score
        </Button>
      );
    }
    
    return (
      <Button
        variant="outline"
        className={className}
        onClick={() => navigateToResults(assessmentType, assessmentId)}
      >
        Voir les résultats
      </Button>
    );
  }

  // Case 3: In-progress with all answers → Voir les résultats (with auto-submit)
  if (status === 'in-progress' &&
      answerCount !== undefined &&
      totalQuestions !== undefined &&
      answerCount >= totalQuestions &&
      assessmentId) {
    return (
      <Button
        variant="outline"
        className={className}
        disabled={isSubmitting}
        onClick={async () => {
          try {
            setIsSubmitting(true);
            // Submit assessment first
            await submitAssessment(assessmentId);
            // Then navigate to results
            navigateToResults(assessmentType, assessmentId);
          } catch (err) {
            console.error('Failed to submit assessment:', err);
            // If submission fails, try to go to results anyway (might already be submitted)
            navigateToResults(assessmentType, assessmentId);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          'Voir les résultats'
        )}
      </Button>
    );
  }

  // Case 4: In-progress with partial answers → Continuer
  if (status === 'in-progress') {
    return (
      <Button
        variant="primary"
        className={className}
        onClick={() => {
          if (requiresEvaluators && onEvaluatorModalOpen) {
            onEvaluatorModalOpen();
          } else {
            if (assessmentType === 'THREE_SIXTY_SELF' && assessmentId) {
              router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentId}`);
            } else {
              router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
            }
          }
        }}
      >
        Continuer
      </Button>
    );
  }

  // Case 5: Available → Commencer
  return (
    <Button
      variant="primary"
      className={className}
      onClick={() => {
        if (requiresEvaluators && onEvaluatorModalOpen) {
          onEvaluatorModalOpen();
        } else {
          if (assessmentType === 'THREE_SIXTY_SELF' && assessmentId) {
            router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentId}`);
          } else {
            router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
          }
        }
      }}
    >
      Commencer
    </Button>
  );
}
```

### Solution 3 : Refactoriser les deux pages pour utiliser les utilitaires

**Actions :**
1. Importer `determineAssessmentStatus` dans les deux pages
2. Remplacer la logique de détermination du status par l'appel à la fonction
3. Utiliser la fonction `getAssessmentActionButton` ou refactoriser `getActionButton` pour utiliser la même logique

---

## 📊 Tableau de Comparaison Actuel

| Aspect | `assessments/page.tsx` | `dashboard/page.tsx` | Problème |
|--------|------------------------|----------------------|----------|
| Normalisation du status | ✅ Oui | ❌ Non | **CRITIQUE** |
| Comparaison status | ✅ Normalisé | ❌ Directe (uppercase) | **CRITIQUE** |
| Vérification `hasAllAnswers` | ✅ Oui | ✅ Oui | OK |
| Gestion `NOT_STARTED` avec réponses | ✅ Oui | ✅ Oui | OK |
| Soumission auto avant résultats | ✅ Oui | ❌ Non | **IMPORTANT** |
| Gestion cas limites | ⚠️ Partielle | ⚠️ Partielle | À améliorer |

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Créer les fonctions utilitaires (PRIORITÉ HAUTE)
1. ✅ Créer `apps/web/src/lib/utils/assessmentStatus.ts`
2. ✅ Créer une fonction helper pour générer les boutons (ou refactoriser `getActionButton`)

### Phase 2 : Corriger `dashboard/page.tsx` (PRIORITÉ CRITIQUE)
1. ✅ Utiliser `determineAssessmentStatus` au lieu de la logique inline
2. ✅ Corriger les comparaisons de status (utiliser normalisation)
3. ✅ Ajouter la soumission automatique avant d'afficher les résultats

### Phase 3 : Unifier `assessments/page.tsx`
1. ✅ Utiliser `determineAssessmentStatus` pour cohérence
2. ✅ S'assurer que la logique est identique dans les deux pages

### Phase 4 : Tests et validation
1. ✅ Tester les 3 états sur chaque type d'assessment
2. ✅ Vérifier les cas limites
3. ✅ Valider avec des données réelles

---

## 🔍 Checklist de Validation

### Scénarios à Tester

- [ ] **Scénario 1** : Assessment créé mais jamais commencé
  - `status = "not_started"`, `answer_count = 0` ou `undefined`
  - **Attendu :** Bouton "Commencer"

- [ ] **Scénario 2** : Assessment commencé mais pas complété
  - `status = "not_started"` ou `"in_progress"`, `answer_count > 0` mais `< total_questions`
  - **Attendu :** Bouton "Continuer"

- [ ] **Scénario 3** : Assessment avec toutes les réponses mais status pas mis à jour
  - `status = "in_progress"`, `answer_count >= total_questions`
  - **Attendu :** Bouton "Voir les résultats" (avec soumission auto)

- [ ] **Scénario 4** : Assessment complété
  - `status = "completed"`, `answer_count >= total_questions`
  - **Attendu :** Bouton "Voir les résultats"

- [ ] **Scénario 5** : Assessment avec `total_questions` undefined
  - `status = "in_progress"`, `answer_count > 0`, `total_questions = undefined`
  - **Attendu :** Bouton "Continuer" (gestion gracieuse)

- [ ] **Scénario 6** : Assessment avec `answer_count` undefined
  - `status = "not_started"`, `answer_count = undefined`
  - **Attendu :** Bouton "Commencer"

---

## 📝 Notes Techniques

### Backend Status Values (Confirmé)

D'après `backend/app/models/assessment.py` et `backend/app/api/v1/endpoints/assessments.py` :
- Le backend retourne **toujours** : `"not_started"`, `"in_progress"`, `"completed"` (lowercase avec underscores)
- Format exact via `assessment.status.value`

### API Response Structure

```typescript
interface ApiAssessment {
  id: number;
  assessment_type: AssessmentType;
  status: string; // "not_started" | "in_progress" | "completed" (lowercase avec underscores)
  answer_count?: number;
  total_questions?: number;
  created_at: string;
  updated_at: string;
}
```

---

## ✅ Conclusion

**Problèmes critiques identifiés :**

1. ❌ **CRITIQUE** : `dashboard/page.tsx` compare le status avec des valeurs uppercase alors que le backend retourne lowercase
2. ⚠️ **IMPORTANT** : Pas de soumission automatique dans `dashboard/page.tsx`
3. ⚠️ **MOYEN** : Gestion incomplète des cas limites

**Recommandation immédiate :**
1. Créer la fonction utilitaire `determineAssessmentStatus`
2. Corriger `dashboard/page.tsx` pour utiliser la normalisation
3. Ajouter la soumission automatique dans `dashboard/page.tsx`
4. Unifier la logique entre les deux pages

**Impact attendu :**
- Les boutons afficheront correctement les 3 états
- Cohérence entre les deux pages
- Meilleure gestion des cas limites
