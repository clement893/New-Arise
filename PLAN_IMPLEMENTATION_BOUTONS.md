# Plan d'Implémentation - Correction des Boutons des Assessments

## Objectif
Corriger la logique des boutons pour afficher correctement:
- **"Commencer"** si le test n'est pas commencé
- **"Continuer"** si le test est commencé mais pas complété
- **"Voir les résultats"** si le test est complété

---

## Étape 1: Corriger la détermination du statut dans assessments/page.tsx

### Fichier: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
### Lignes: 136-185

**Problème:** Le statut `not_started` est traité comme `in-progress`, ce qui fait afficher "Continuer" au lieu de "Commencer" pour les assessments créés mais non commencés.

**Solution:** Distinguer `not_started` de `in_progress` en vérifiant `answer_count`.

**Code à remplacer:**

```typescript
// REMPLACER les lignes 173-175:
} else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress' || statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
  // Status is in progress or not started, and not all answers are provided
  status = 'in-progress';
} else {
```

**PAR:**

```typescript
} else if (statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
  // Assessment créé mais pas encore commencé
  // Si answer_count est 0 ou undefined, c'est disponible (pas commencé)
  // Si answer_count > 0, c'est en cours
  if (apiAssessment.answer_count === undefined || apiAssessment.answer_count === 0) {
    status = 'available'; // Pas encore commencé, affichera "Commencer"
  } else {
    status = 'in-progress'; // Commencé mais pas complété, affichera "Continuer"
  }
} else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress') {
  // Status is explicitly in progress
  status = 'in-progress';
} else {
```

---

## Étape 2: Simplifier et corriger getActionButton dans assessments/page.tsx

### Fichier: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
### Lignes: 291-430

**Problème:** La logique est complexe et peut afficher "Continuer" pour des assessments non commencés.

**Solution:** Simplifier la logique en suivant l'ordre: completed → in-progress (complété) → in-progress (partiel) → available.

**Code à remplacer:**

```typescript
const getActionButton = (assessment: AssessmentDisplay) => {
  const isStarting = startingAssessment === assessment.assessmentType;
  
  switch (assessment.status) {
    case 'completed':
      // ... code existant ...
    case 'in-progress':
      // ... code existant complexe ...
    case 'available':
      // ... code existant ...
    default:
      // ... code existant ...
  }
};
```

**PAR:**

```typescript
const getActionButton = (assessment: AssessmentDisplay) => {
  const isStarting = startingAssessment === assessment.assessmentType;
  
  // Cas spécial: MBTI complété avec lien externe
  if (assessment.status === 'completed' && assessment.externalLink && assessment.assessmentType === 'MBTI') {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => window.open(assessment.externalLink, '_blank')}
      >
        <Upload size={16} />
        Télécharger mon score
      </Button>
    );
  }
  
  // Cas 1: Assessment complété → Voir les résultats
  if (assessment.status === 'completed') {
    return (
      <Button 
        variant="outline" 
        onClick={() => {
          if (assessment.assessmentType === 'TKI') {
            router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
          } else if (assessment.assessmentType === 'WELLNESS') {
            router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
          } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
            router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
          }
        }}
      >
        Voir les résultats
      </Button>
    );
  }
  
  // Cas 2: En cours avec toutes les réponses → Voir les résultats
  if (assessment.status === 'in-progress' && 
      assessment.answerCount !== undefined && 
      assessment.totalQuestions !== undefined && 
      assessment.answerCount >= assessment.totalQuestions &&
      assessment.assessmentId) {
    return (
      <Button 
        variant="outline"
        disabled={isStarting}
        onClick={async () => {
          if (assessment.assessmentId) {
            try {
              setStartingAssessment(assessment.assessmentType);
              // Soumettre l'assessment si pas déjà soumis
              await submitAssessment(assessment.assessmentId);
              // Rediriger vers résultats
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
              }
            } catch (err) {
              console.error('Failed to submit assessment:', err);
              // Si la soumission échoue, essayer quand même d'aller aux résultats
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
              }
            } finally {
              setStartingAssessment(null);
            }
          }
        }}
      >
        {isStarting ? (
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
  
  // Cas 3: En cours avec réponses partielles → Continuer
  if (assessment.status === 'in-progress') {
    return (
      <Button 
        variant="primary"
        disabled={isStarting}
        onClick={() => {
          if (assessment.requiresEvaluators) {
            setShowEvaluatorModal(true);
          } else {
            // Pour 360 feedback, inclure assessmentId dans l'URL
            if (assessment.assessmentType === 'THREE_SIXTY_SELF' && assessment.assessmentId) {
              router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessment.assessmentId}`);
            } else {
              router.push(`/dashboard/assessments/${getAssessmentRoute(assessment.assessmentType)}`);
            }
          }
        }}
      >
        {isStarting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          'Continuer'
        )}
      </Button>
    );
  }
  
  // Cas 4: Disponible ou pas commencé → Commencer
  if (assessment.status === 'available') {
    return (
      <Button 
        variant="primary"
        className="!bg-[#0F454D] hover:!bg-[#0d4148] !text-white"
        style={{ backgroundColor: '#0F454D', color: '#ffffff' }}
        disabled={isStarting}
        onClick={() => handleStartAssessment(assessment.assessmentType, assessment.assessmentId)}
      >
        {isStarting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          'Commencer'
        )}
      </Button>
    );
  }
  
  // Cas 5: Verrouillé
  return (
    <Button variant="secondary" disabled>
      Verrouillé
    </Button>
  );
};
```

---

## Étape 3: Corriger la page dashboard

### Fichier: `apps/web/src/app/[locale]/dashboard/page.tsx`

### 3.1: Corriger la détermination du statut (similaire à assessments/page.tsx)

**Lignes à trouver:** Dans la fonction qui construit `evaluations` (vers lignes 171-201)

**Problème:** La logique de détermination du statut n'est pas aussi détaillée que dans assessments/page.tsx.

**Solution:** Utiliser la même logique que dans assessments/page.tsx pour déterminer le statut.

**Note:** Il faut d'abord vérifier comment le statut est déterminé dans cette page. Si c'est différent, il faut l'aligner.

### 3.2: Corriger getActionButton dans dashboard/page.tsx

**Fichier:** `apps/web/src/app/[locale]/dashboard/page.tsx`
**Lignes:** 245-288

**Problème:** 
1. Textes en anglais
2. Logique incorrecte pour `available` (affiche "Add the assessment")
3. Ne vérifie pas `answer_count` pour distinguer "Commencer" de "Continuer"

**Code à remplacer:**

```typescript
const getActionButton = (evaluation: typeof evaluations[0]) => {
  if (evaluation.status === 'locked') {
    return (
      <Button variant="secondary" disabled className="w-full">
        Locked
      </Button>
    );
  }

  if (evaluation.status === 'completed') {
    return (
      <Button 
        variant="outline" 
        className="w-full rounded-full"
        onClick={() => {
          // ... navigation ...
        }}
      >
        View Results
      </Button>
    );
  }

  return (
    <Button 
      variant="primary" 
      className="w-full !bg-arise-gold-alt !text-arise-deep-teal-alt hover:!bg-arise-gold-alt/90 font-semibold"
      style={{ backgroundColor: 'var(--color-arise-gold-alt, #F4B860)', color: 'var(--color-arise-deep-teal-alt, #1B5E6B)' }}
      onClick={() => {
        router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
      }}
    >
      {evaluation.status === 'in-progress' ? 'Continue' : 'Add the assessment'}
    </Button>
  );
};
```

**PAR:**

```typescript
const getActionButton = (evaluation: typeof evaluations[0]) => {
  if (evaluation.status === 'locked') {
    return (
      <Button variant="secondary" disabled className="w-full">
        Verrouillé
      </Button>
    );
  }

  // Cas: Complété → Voir les résultats
  if (evaluation.status === 'completed') {
    return (
      <Button 
        variant="outline" 
        className="w-full rounded-full"
        onClick={() => {
          if (evaluation.assessmentType === 'TKI' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
          } else if (evaluation.assessmentType === 'WELLNESS' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
          } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
          } else if (evaluation.assessmentType === 'MBTI' && evaluation.externalLink) {
            window.open(evaluation.externalLink, '_blank');
          }
        }}
      >
        Voir les résultats
      </Button>
    );
  }

  // Cas: En cours avec toutes les réponses → Voir les résultats
  if (evaluation.status === 'in-progress' && 
      evaluation.answerCount !== undefined && 
      evaluation.totalQuestions !== undefined && 
      evaluation.answerCount >= evaluation.totalQuestions) {
    return (
      <Button 
        variant="outline" 
        className="w-full rounded-full"
        onClick={() => {
          if (evaluation.assessmentType === 'TKI' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
          } else if (evaluation.assessmentType === 'WELLNESS' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
          } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF' && evaluation.assessmentId) {
            router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
          }
        }}
      >
        Voir les résultats
      </Button>
    );
  }

  // Cas: En cours avec réponses partielles → Continuer
  if (evaluation.status === 'in-progress') {
    return (
      <Button 
        variant="primary" 
        className="w-full !bg-arise-gold-alt !text-arise-deep-teal-alt hover:!bg-arise-gold-alt/90 font-semibold"
        style={{ backgroundColor: 'var(--color-arise-gold-alt, #F4B860)', color: 'var(--color-arise-deep-teal-alt, #1B5E6B)' }}
        onClick={() => {
          router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
        }}
      >
        Continuer
      </Button>
    );
  }

  // Cas: Disponible ou pas commencé → Commencer
  return (
    <Button 
      variant="primary" 
      className="w-full !bg-arise-gold-alt !text-arise-deep-teal-alt hover:!bg-arise-gold-alt/90 font-semibold"
      style={{ backgroundColor: 'var(--color-arise-gold-alt, #F4B860)', color: 'var(--color-arise-deep-teal-alt, #1B5E6B)' }}
      onClick={() => {
        router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
      }}
    >
      Commencer
    </Button>
  );
};
```

---

## Étape 4: Vérifier la cohérence de la détermination du statut dans dashboard/page.tsx

**Fichier:** `apps/web/src/app/[locale]/dashboard/page.tsx`
**Lignes:** ~171-201 (dans la construction de `evaluations`)

**Action:** Vérifier que la logique de détermination du statut est cohérente avec assessments/page.tsx. Si ce n'est pas le cas, l'aligner.

**Note:** Il faut examiner comment `evaluations` est construit pour voir si le statut est déterminé de la même manière.

---

## Checklist d'Implémentation

### Phase 1: assessments/page.tsx
- [ ] Modifier la détermination du statut pour distinguer `not_started` de `in_progress`
- [ ] Simplifier `getActionButton` avec la nouvelle logique
- [ ] Tester avec différents scénarios

### Phase 2: dashboard/page.tsx
- [ ] Vérifier/Corriger la détermination du statut
- [ ] Corriger `getActionButton` avec textes en français
- [ ] Ajouter vérification de `answer_count` pour distinguer "Commencer" de "Continuer"
- [ ] Tester avec différents scénarios

### Phase 3: Tests
- [ ] Test: Assessment non créé → "Commencer"
- [ ] Test: Assessment créé mais non commencé (`not_started`, `answer_count = 0`) → "Commencer"
- [ ] Test: Assessment en cours (`in_progress`, réponses partielles) → "Continuer"
- [ ] Test: Assessment complété (toutes réponses) → "Voir les résultats"
- [ ] Test: Assessment avec statut `completed` → "Voir les résultats"
- [ ] Test: Tous les types d'assessments (TKI, Wellness, 360°, MBTI)

---

## Notes Techniques

1. **Gestion des cas limites:**
   - Toujours vérifier `answerCount !== undefined` et `totalQuestions !== undefined` avant comparaison
   - Gérer le cas où `assessmentId` peut être `undefined`

2. **Cohérence:**
   - Les deux pages (`/dashboard` et `/dashboard/assessments`) doivent utiliser la même logique
   - Tous les textes doivent être en français

3. **Performance:**
   - Les vérifications de statut sont faites une seule fois lors du chargement
   - Pas d'impact sur les performances
