# Audit : Liaison des Questions aux Questionnaires et au Backend

**Date**: 2026-01-11  
**Page analysée**: `/dashboard/admin/assessment-management`  
**Objectif**: Vérifier que les questions sont correctement liées au backend et aux questionnaires

## Résumé Exécutif

❌ **PROBLÈME IDENTIFIÉ**: Les questions dans la page d'administration utilisent des données statiques du frontend et ne sont PAS connectées au backend. Aucun endpoint API n'existe pour gérer les questions depuis le backend.

## Analyse Détaillée

### 1. Source des Données Actuelles

#### Frontend (Page Admin)
- **Fichier**: `apps/web/src/app/[locale]/dashboard/admin/assessment-management/page.tsx`
- **Lignes 31-33**: Import des questions depuis des fichiers de données statiques:
  ```typescript
  import { wellnessQuestions } from '@/data/wellnessQuestionsReal';
  import { tkiQuestions } from '@/data/tkiQuestions';
  import { feedback360Questions, feedback360Capabilities } from '@/data/feedback360Questions';
  ```

#### Fonction `getQuestionsForType()` (Lignes 148-160)
```typescript
const getQuestionsForType = (type: string) => {
  switch (type) {
    case 'WELLNESS':
      return wellnessQuestions;  // ⚠️ Données statiques
    case 'TKI':
      return tkiQuestions;       // ⚠️ Données statiques
    case 'THREE_SIXTY_SELF':
    case 'THREE_SIXTY_EVALUATOR':
      return feedback360Questions; // ⚠️ Données statiques
    default:
      return [];
  }
};
```

**Verdict**: ✅ Les données sont correctement chargées depuis les fichiers de données, MAIS ❌ elles ne sont pas synchronisées avec le backend.

### 2. Fichiers de Données Frontend

| Type | Fichier Source | Structure |
|------|---------------|-----------|
| Wellness | `apps/web/src/data/wellnessQuestionsReal.ts` | 30 questions, format: `{ id, pillar, question }` |
| TKI | `apps/web/src/data/tkiQuestions.ts` | 30 questions, format: `{ id, number, optionA, optionB, modeA, modeB }` |
| 360° Feedback | `apps/web/src/data/feedback360Questions.ts` | 30 questions, format: `{ id, number, capability, question }` |

**Note**: La question "I keep my caffeine consumption within healthy limits" se trouve dans `wellnessQuestionsReal.ts` à la ligne 34 avec l'ID `wellness_q4`.

### 3. Backend - Endpoints API

#### ❌ Aucun Endpoint pour les Questions

Recherche effectuée dans `backend/app/api/v1/endpoints/assessments.py`:
- ✅ Endpoint `/assessments/list` - Liste les assessments
- ✅ Endpoint `/assessments/{id}/answer` - Sauvegarde une réponse
- ✅ Endpoint `/assessments/{id}/submit` - Soumet un assessment
- ❌ **AUCUN endpoint `/assessments/questions`** pour récupérer les questions
- ❌ **AUCUN endpoint admin pour gérer les questions**

#### Backend - Règles de Calcul

- **Fichier**: `backend/app/services/assessment_scoring.py`
- Les règles de calcul sont définies côté backend mais:
  - ✅ Les fonctions de calcul existent (`calculate_wellness_score`, `calculate_tki_score`, etc.)
  - ❌ Aucun endpoint API pour récupérer les règles depuis le frontend
  - ❌ La page admin utilise des données mockées en dur (lignes 162-202)

### 4. Fonctions de Sauvegarde

#### `handleSaveQuestion()` (Lignes 209-213)
```typescript
const handleSaveQuestion = () => {
  // TODO: Implement save logic when backend API is available
  setQuestionEditModalOpen(false);
  setEditingQuestion(null);
};
```

#### `handleSaveRule()` (Lignes 220-224)
```typescript
const handleSaveRule = () => {
  // TODO: Implement save logic when backend API is available
  setRuleEditModalOpen(false);
  setEditingRule(null);
};
```

**Verdict**: ❌ Les fonctions de sauvegarde ne font rien - elles sont des placeholders avec des TODO.

### 5. Utilisation dans les Assessments Utilisateurs

Les pages d'assessments utilisateurs utilisent également les mêmes fichiers de données statiques:

- **Wellness**: `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`
  - Import: `import { wellnessQuestions } from '@/data/wellnessQuestionsReal';`
  
- **TKI**: `apps/web/src/app/[locale]/dashboard/assessments/tki/page.tsx`
  - Import: `import { tkiQuestions } from '@/data/tkiQuestions';`
  
- **360° Feedback**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/page.tsx`
  - Import: `import { feedback360Questions } from '@/data/feedback360Questions';`

**Verdict**: ✅ Cohérence - les mêmes données sont utilisées partout, MAIS ❌ aucune source unique de vérité (Single Source of Truth) depuis le backend.

## Problèmes Identifiés

### 🔴 Critique

1. **Pas de synchronisation Backend**
   - Les questions sont en dur dans le frontend
   - Aucune possibilité de modifier les questions sans déploiement
   - Pas de versioning des questions
   - Risque de désynchronisation entre frontend et backend

2. **Règles de calcul mockées**
   - La fonction `getRulesForType()` utilise des données hardcodées
   - Les règles réelles sont dans `backend/app/services/assessment_scoring.py` mais non accessibles via API

3. **Fonctions de sauvegarde non fonctionnelles**
   - `handleSaveQuestion()` ne fait rien
   - `handleSaveRule()` ne fait rien
   - Les boutons "Enregistrer" dans les modals ne sauvegardent pas réellement

### 🟡 Important

4. **Pas de validation backend**
   - Les IDs de questions ne sont pas validés côté backend
   - Les structures de questions peuvent diverger

5. **Pas de gestion de versions**
   - Impossible de tracker les changements de questions
   - Impossible de versionner les questionnaires

## Recommandations

### Priorité 1: Créer des Endpoints API Backend

#### 1.1 Endpoint GET `/api/v1/assessments/questions`
```python
@router.get("/questions")
async def get_questions(
    assessment_type: AssessmentType = Query(...),
    current_user: User = Depends(get_current_user),
):
    """Get questions for a specific assessment type"""
    # Retourner les questions depuis un fichier de config ou base de données
```

#### 1.2 Endpoint GET `/api/v1/admin/assessments/questions` (Admin seulement)
```python
@router.get("/admin/assessments/questions")
async def admin_get_questions(
    assessment_type: Optional[AssessmentType] = None,
    current_user: User = Depends(require_admin),
):
    """Admin: Get all questions for management"""
```

#### 1.3 Endpoint POST/PUT `/api/v1/admin/assessments/questions`
```python
@router.post("/admin/assessments/questions")
async def admin_create_question(
    question: QuestionCreateRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Create a new question"""
```

#### 1.4 Endpoint GET `/api/v1/admin/assessments/rules`
```python
@router.get("/admin/assessments/rules")
async def admin_get_rules(
    assessment_type: AssessmentType = Query(...),
    current_user: User = Depends(require_admin),
):
    """Admin: Get scoring rules for an assessment type"""
```

### Priorité 2: Migrer les Données

1. **Option A: Fichiers de Configuration Backend**
   - Déplacer les questions dans `backend/app/config/assessment_questions.py`
   - Les servir via API

2. **Option B: Base de Données**
   - Créer une table `assessment_questions`
   - Permettre la modification via l'interface admin
   - Permettre le versioning

### Priorité 3: Mettre à Jour le Frontend

1. **Créer des hooks API**
   ```typescript
   // apps/web/src/lib/api/assessments.ts
   export const getQuestions = async (assessmentType: string) => {
     const response = await axios.get(`/api/v1/assessments/questions?type=${assessmentType}`);
     return response.data;
   };
   ```

2. **Mettre à jour la page admin**
   - Remplacer les imports statiques par des appels API
   - Implémenter les fonctions de sauvegarde
   - Ajouter la gestion d'erreurs

3. **Cache des questions**
   - Utiliser React Query pour le caching
   - Invalidater le cache lors des modifications

## Conclusion

**État Actuel**: ⚠️ Les questions fonctionnent mais sont complètement découplées du backend. La page admin affiche les questions mais ne peut pas les modifier réellement.

**Impact**: 
- ✅ Les assessments fonctionnent correctement
- ❌ Pas de gestion dynamique des questions
- ❌ Risque de désynchronisation
- ❌ Pas de traçabilité des changements

**Action Requise**: Implémenter les endpoints API backend et connecter la page admin pour une vraie gestion des questions.
