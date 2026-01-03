# Audit des Boutons des Assessments

## Date: 2024
## Objectif: Corriger la logique des boutons pour afficher correctement "Commencer", "Continuer", ou "Voir les résultats"

---

## 📋 État Actuel des Boutons

### 1. Page `/dashboard/assessments/page.tsx`

**Fonction `getActionButton` (lignes 291-430)**

| Statut | Bouton Actuel | Comportement | Problème Identifié |
|--------|---------------|--------------|-------------------|
| `completed` | "Voir les résultats" | ✅ Correct | Aucun |
| `in-progress` (toutes réponses) | "Voir les résultats" | ✅ Correct | Aucun |
| `in-progress` (réponses partielles) | "Continuer" | ⚠️ Partiel | Le statut `in-progress` peut inclure des assessments avec `status = "not_started"` qui n'ont pas encore été commencés. Ces cas devraient afficher "Commencer" |
| `available` | "Commencer" | ✅ Correct | Aucun |
| `locked` | "Verrouillé" (disabled) | ✅ Correct | Aucun |

**Problèmes identifiés:**
- Le statut `in-progress` est assigné à la fois aux assessments réellement en cours ET aux assessments avec `status = "not_started"` (ligne 173-175)
- Un assessment avec `status = "not_started"` et `answer_count = 0` devrait afficher "Commencer" mais affiche actuellement "Continuer"

### 2. Page `/dashboard/page.tsx`

**Fonction `getActionButton` (lignes 245-288)**

| Statut | Bouton Actuel | Comportement | Problème Identifié |
|--------|---------------|--------------|-------------------|
| `completed` | "View Results" | ⚠️ Texte en anglais | Devrait être "Voir les résultats" |
| `in-progress` | "Continue" | ⚠️ Texte en anglais | Devrait être "Continuer" |
| `available` | "Add the assessment" | ❌ Incorrect | Devrait être "Commencer" |
| `locked` | "Locked" (disabled) | ⚠️ Texte en anglais | Devrait être "Verrouillé" |

**Problèmes identifiés:**
1. Tous les textes sont en anglais au lieu de français
2. Pour `available`, le texte est "Add the assessment" au lieu de "Commencer"
3. La logique ne vérifie pas si l'assessment a réellement été commencé (answer_count > 0)

---

## 🎯 Logique Attendue

### Règles de détermination du statut:

1. **"Commencer"** doit être affiché quand:
   - `status = 'available'` OU
   - `status = 'in-progress'` ET `answer_count = 0` (ou undefined/null) ET `assessmentId` existe (assessment créé mais pas commencé)

2. **"Continuer"** doit être affiché quand:
   - `status = 'in-progress'` ET `answer_count > 0` ET `answer_count < total_questions`

3. **"Voir les résultats"** doit être affiché quand:
   - `status = 'completed'` OU
   - `status = 'in-progress'` ET `answer_count >= total_questions` (toutes les questions répondues)

---

## 🔍 Analyse Détaillée

### Problème de détermination du statut dans `loadAssessments`

**Fichier:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` (lignes 136-185)

```typescript
// Problème actuel:
else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress' || statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
  // Status is in progress or not started, and not all answers are provided
  status = 'in-progress';  // ❌ Problème: "not_started" devient "in-progress"
}
```

**Solution:** Distinguer `not_started` de `in_progress`:
- `not_started` + `answer_count = 0` → `status = 'available'`
- `not_started` + `answer_count > 0` → `status = 'in-progress'`
- `in_progress` → `status = 'in-progress'`

---

## 📝 Plan d'Implémentation

### Phase 1: Corriger la détermination du statut

**Fichier:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

1. **Modifier la logique de détermination du statut (lignes 136-185)**
   - Séparer le traitement de `not_started` et `in_progress`
   - Si `not_started` ET `answer_count = 0` → `status = 'available'`
   - Si `not_started` ET `answer_count > 0` → `status = 'in-progress'`
   - Si `in_progress` → `status = 'in-progress'`

### Phase 2: Améliorer la fonction `getActionButton` dans assessments/page.tsx

**Fichier:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

1. **Simplifier la logique (lignes 291-430)**
   - Pour `available`: Toujours afficher "Commencer"
   - Pour `in-progress`: 
     - Si `answer_count >= total_questions` → "Voir les résultats"
     - Sinon → "Continuer"
   - Pour `completed`: Toujours afficher "Voir les résultats"

### Phase 3: Corriger la page dashboard

**Fichier:** `apps/web/src/app/[locale]/dashboard/page.tsx`

1. **Traduire tous les textes en français**
   - "View Results" → "Voir les résultats"
   - "Continue" → "Continuer"
   - "Add the assessment" → "Commencer"
   - "Locked" → "Verrouillé"

2. **Corriger la logique de détermination du statut**
   - Utiliser la même logique que dans assessments/page.tsx
   - Vérifier `answer_count` pour déterminer si l'assessment a été commencé

3. **Améliorer la fonction `getActionButton` (lignes 245-288)**
   - Appliquer la même logique que dans assessments/page.tsx
   - Vérifier `answer_count` pour distinguer "Commencer" de "Continuer"

### Phase 4: Tests et Validation

1. **Scénarios de test:**
   - Assessment non créé → "Commencer"
   - Assessment créé mais pas commencé (`not_started`, `answer_count = 0`) → "Commencer"
   - Assessment en cours (`in_progress`, `answer_count > 0`, `answer_count < total`) → "Continuer"
   - Assessment complété (`answer_count >= total`) → "Voir les résultats"
   - Assessment avec statut `completed` → "Voir les résultats"

2. **Types d'assessments à tester:**
   - TKI
   - Wellness
   - 360° Feedback
   - MBTI (lien externe)

---

## 🔧 Modifications Détaillées

### Modification 1: Corriger la détermination du statut

```typescript
// Avant (ligne 173-175):
else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress' || statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
  status = 'in-progress';
}

// Après:
else if (statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
  // Assessment créé mais pas commencé
  if (apiAssessment.answer_count === undefined || apiAssessment.answer_count === 0) {
    status = 'available'; // Pas encore commencé
  } else {
    status = 'in-progress'; // Commencé mais pas complété
  }
} else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress') {
  status = 'in-progress';
}
```

### Modification 2: Simplifier getActionButton dans assessments/page.tsx

```typescript
const getActionButton = (assessment: AssessmentDisplay) => {
  const isStarting = startingAssessment === assessment.assessmentType;
  
  // Cas spécial: MBTI avec lien externe et complété
  if (assessment.status === 'completed' && assessment.externalLink && assessment.assessmentType === 'MBTI') {
    return (
      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open(assessment.externalLink, '_blank')}>
        <Upload size={16} />
        Télécharger mon score
      </Button>
    );
  }
  
  // Cas: Complété → Voir les résultats
  if (assessment.status === 'completed') {
    return (
      <Button variant="outline" onClick={() => {
        // Navigation vers résultats selon le type
      }}>
        Voir les résultats
      </Button>
    );
  }
  
  // Cas: En cours avec toutes les réponses → Voir les résultats
  if (assessment.status === 'in-progress' && 
      assessment.answerCount !== undefined && 
      assessment.totalQuestions !== undefined && 
      assessment.answerCount >= assessment.totalQuestions) {
    return (
      <Button variant="outline" onClick={async () => {
        // Soumettre et rediriger vers résultats
      }}>
        Voir les résultats
      </Button>
    );
  }
  
  // Cas: En cours avec réponses partielles → Continuer
  if (assessment.status === 'in-progress') {
    return (
      <Button variant="primary" onClick={() => {
        // Continuer l'assessment
      }}>
        Continuer
      </Button>
    );
  }
  
  // Cas: Disponible ou pas commencé → Commencer
  if (assessment.status === 'available') {
    return (
      <Button variant="primary" onClick={() => handleStartAssessment(assessment.assessmentType, assessment.assessmentId)}>
        Commencer
      </Button>
    );
  }
  
  // Cas: Verrouillé
  return (
    <Button variant="secondary" disabled>
      Verrouillé
    </Button>
  );
};
```

### Modification 3: Corriger dashboard/page.tsx

1. Traduire tous les textes
2. Utiliser la même logique de détermination du statut
3. Appliquer la même logique de boutons

---

## ✅ Checklist de Validation

- [ ] Les assessments non créés affichent "Commencer"
- [ ] Les assessments créés mais non commencés (`not_started`, `answer_count = 0`) affichent "Commencer"
- [ ] Les assessments en cours (`in_progress`, réponses partielles) affichent "Continuer"
- [ ] Les assessments complétés (toutes réponses) affichent "Voir les résultats"
- [ ] Les assessments avec statut `completed` affichent "Voir les résultats"
- [ ] Tous les textes sont en français
- [ ] La logique fonctionne pour tous les types d'assessments (TKI, Wellness, 360°, MBTI)
- [ ] Les boutons redirigent correctement vers les bonnes pages

---

## 📌 Notes Importantes

1. **Distinction `not_started` vs `in_progress`:**
   - Un assessment peut être créé (`assessmentId` existe) mais pas encore commencé (`answer_count = 0`)
   - Dans ce cas, le statut backend peut être `not_started` mais l'UI devrait afficher "Commencer"

2. **Cohérence entre les pages:**
   - La logique doit être identique entre `/dashboard` et `/dashboard/assessments`
   - Les textes doivent être cohérents (toujours en français)

3. **Gestion des cas limites:**
   - `answer_count` peut être `undefined` ou `null`
   - `total_questions` peut être `undefined` ou `null`
   - Il faut gérer ces cas avec des vérifications appropriées
