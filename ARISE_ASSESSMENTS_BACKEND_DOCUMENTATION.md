# ARISE Assessments Backend - Documentation Complète

## 📋 Vue d'Ensemble

Le système d'assessments ARISE permet aux utilisateurs de compléter 4 types d'évaluations de leadership :

1. **Wellness Assessment** - 30 questions sur 6 piliers de bien-être
2. **TKI Conflict Style** - 30 questions sur les styles de gestion de conflit
3. **360° Feedback** - 30 questions sur 6 capacités de leadership (Self + Evaluators)
4. **MBTI Personality** - Upload externe avec corrélation TKI

## 🗄️ Architecture de Base de Données

### Tables Créées

#### `assessments`
Stocke les assessments des utilisateurs.

```sql
- id: INTEGER (PK, auto-increment)
- user_id: INTEGER (FK → users.id)
- assessment_type: VARCHAR(50) (mbti, tki, wellness, 360_self, 360_evaluator)
- status: VARCHAR(20) (not_started, in_progress, completed)
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `assessment_answers`
Stocke les réponses individuelles aux questions.

```sql
- id: INTEGER (PK, auto-increment)
- assessment_id: INTEGER (FK → assessments.id)
- question_id: VARCHAR(100) (ex: "wellness_q1", "tki_q15")
- answer_value: TEXT (valeur de la réponse: "1-5" ou "A/B")
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(assessment_id, question_id)
```

#### `assessment_360_evaluators`
Stocke les évaluateurs pour le 360° Feedback.

```sql
- id: INTEGER (PK, auto-increment)
- assessment_id: INTEGER (FK → assessments.id)
- evaluator_email: VARCHAR(255)
- evaluator_name: VARCHAR(255)
- invitation_sent_at: TIMESTAMP
- completed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `assessment_results`
Stocke les résultats calculés des assessments.

```sql
- id: INTEGER (PK, auto-increment)
- assessment_id: INTEGER (FK → assessments.id, UNIQUE)
- result_data: JSONB (scores, insights, recommandations)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Indexes Créés

- `idx_assessments_user_id` sur `assessments(user_id)`
- `idx_assessments_type` sur `assessments(assessment_type)`
- `idx_assessments_status` sur `assessments(status)`
- `idx_assessment_answers_assessment_id` sur `assessment_answers(assessment_id)`
- `idx_assessment_360_evaluators_assessment_id` sur `assessment_360_evaluators(assessment_id)`
- `idx_assessment_results_assessment_id` sur `assessment_results(assessment_id)`

## 📡 Endpoints API

Tous les endpoints sont sous `/api/v1/assessments` et nécessitent une authentification JWT.

### 1. Démarrer un Assessment

```http
POST /api/v1/assessments/start
Content-Type: application/json
Authorization: Bearer <token>

{
  "assessment_type": "wellness" | "tki" | "360_self" | "mbti"
}

Response 201:
{
  "id": 123,
  "user_id": 456,
  "assessment_type": "wellness",
  "status": "in_progress",
  "started_at": "2025-12-31T10:00:00Z",
  "created_at": "2025-12-31T10:00:00Z"
}
```

### 2. Sauvegarder une Réponse

```http
POST /api/v1/assessments/{assessment_id}/answer
Content-Type: application/json
Authorization: Bearer <token>

{
  "question_id": "wellness_q1",
  "answer_value": "4"
}

Response 200:
{
  "id": 789,
  "assessment_id": 123,
  "question_id": "wellness_q1",
  "answer_value": "4",
  "created_at": "2025-12-31T10:01:00Z"
}
```

### 3. Soumettre un Assessment

```http
POST /api/v1/assessments/{assessment_id}/submit
Authorization: Bearer <token>

Response 200:
{
  "id": 123,
  "status": "completed",
  "completed_at": "2025-12-31T10:30:00Z",
  "result": {
    "total_score": 135,
    "max_score": 150,
    "percentage": 90.0,
    "pillar_scores": { ... }
  }
}
```

### 4. Récupérer les Résultats

```http
GET /api/v1/assessments/{assessment_id}/results
Authorization: Bearer <token>

Response 200:
{
  "assessment_id": 123,
  "assessment_type": "wellness",
  "completed_at": "2025-12-31T10:30:00Z",
  "result_data": {
    "total_score": 135,
    "pillar_scores": { ... }
  }
}
```

### 5. Lister les Assessments de l'Utilisateur

```http
GET /api/v1/assessments/my-assessments
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 123,
    "assessment_type": "wellness",
    "status": "completed",
    "completed_at": "2025-12-31T10:30:00Z"
  },
  {
    "id": 124,
    "assessment_type": "tki",
    "status": "in_progress",
    "started_at": "2025-12-31T11:00:00Z"
  }
]
```

## 🧮 Logique de Calcul des Scores

### Wellness Assessment

**Structure** : 30 questions, 6 piliers, échelle 1-5

**Calcul** :
- Score par pilier = Somme des 5 réponses (max 25)
- Score total = Somme des 6 piliers (max 150)
- Pourcentage = (Score / Max) × 100

**Pillars** :
1. Avoidance of Risky Substances (Q1-Q5)
2. Movement (Q6-Q10)
3. Nutrition (Q11-Q15)
4. Sleep (Q16-Q20)
5. Social Connection (Q21-Q25)
6. Stress Management (Q26-Q30)

**Service** : `backend/app/services/assessment_scoring.py::calculate_wellness_score()`

### TKI Conflict Style

**Structure** : 30 questions, choix binaire A/B, 5 modes

**Calcul** :
- Chaque réponse (A ou B) correspond à un mode
- Compter le nombre de fois que chaque mode est sélectionné
- Identifier le mode dominant et secondaire

**Modes** :
- Competing (CO)
- Collaborating (CL)
- Avoiding (AV)
- Accommodating (AC)
- Compromising (CM)

**Service** : `backend/app/services/assessment_scoring.py::calculate_tki_score()`

### 360° Feedback

**Structure** : 30 questions, 6 capacités, échelle 1-5

**Calcul** :
- Score par capacité = Somme des 5 réponses (max 25)
- Score total = Somme des 6 capacités (max 150)
- Comparaison Self vs Evaluators pour identifier les gaps

**Capabilities** :
1. Communication (Q1-Q5)
2. Team Culture (Q6-Q10)
3. Leadership Style (Q11-Q15)
4. Change Management (Q16-Q20)
5. Problem Solving (Q21-Q25)
6. Stress Management (Q26-Q30)

**Service** : `backend/app/services/assessment_scoring.py::calculate_360_score()`

## 📁 Structure des Fichiers

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   └── assessments.py          # Endpoints API
│   │       └── router.py                    # Enregistrement du router
│   ├── models/
│   │   ├── __init__.py                      # Import du modèle
│   │   └── assessment.py                    # Modèles SQLAlchemy
│   └── services/
│       └── assessment_scoring.py            # Logique de calcul
└── migrations/
    └── assessment_tables.sql                # Migration SQL

apps/web/src/
└── data/
    └── wellnessQuestionsReal.ts             # Questions Wellness
```

## 🔐 Sécurité

- **Authentification** : Tous les endpoints nécessitent un JWT valide
- **Autorisation** : Un utilisateur ne peut accéder qu'à ses propres assessments
- **Validation** : Pydantic valide tous les inputs
- **Rate Limiting** : Limite le nombre de requêtes par utilisateur

## 🚀 Prochaines Étapes pour Cursor

### Phase 4 : Frontend Integration

1. **Mettre à jour le questionnaire Wellness**
   - Remplacer les questions mockées par les vraies questions de `wellnessQuestionsReal.ts`
   - Connecter le store Zustand aux API endpoints
   - Implémenter la sauvegarde automatique des réponses

2. **Créer le service API frontend**
   ```typescript
   // apps/web/src/lib/api/assessments.ts
   export const assessmentsApi = {
     start: (type: AssessmentType) => axios.post('/api/v1/assessments/start', { assessment_type: type }),
     answer: (assessmentId: number, questionId: string, answerValue: string) => 
       axios.post(`/api/v1/assessments/${assessmentId}/answer`, { question_id: questionId, answer_value: answerValue }),
     submit: (assessmentId: number) => axios.post(`/api/v1/assessments/${assessmentId}/submit`),
     getResults: (assessmentId: number) => axios.get(`/api/v1/assessments/${assessmentId}/results`),
     getMyAssessments: () => axios.get('/api/v1/assessments/my-assessments')
   };
   ```

3. **Mettre à jour le store Wellness**
   ```typescript
   // apps/web/src/stores/wellnessStore.ts
   import { assessmentsApi } from '@/lib/api/assessments';
   
   // Ajouter les méthodes pour appeler l'API
   startAssessment: async () => {
     const response = await assessmentsApi.start('wellness');
     set({ assessmentId: response.data.id });
   },
   
   saveAnswer: async (questionId: string, value: number) => {
     const { assessmentId } = get();
     await assessmentsApi.answer(assessmentId, questionId, value.toString());
     set(state => ({ answers: { ...state.answers, [questionId]: value } }));
   },
   
   submitAssessment: async () => {
     const { assessmentId } = get();
     const response = await assessmentsApi.submit(assessmentId);
     set({ results: response.data.result });
   }
   ```

4. **Créer les questionnaires TKI et 360°**
   - Extraire les questions du fichier Excel
   - Créer les fichiers de données TypeScript
   - Implémenter les composants de questionnaire

5. **Créer la page Results**
   - Afficher les scores par pillar/capability
   - Créer des graphiques avec Chart.js ou Recharts
   - Afficher les insights et recommandations

### Phase 5 : 360° Feedback System

1. **Système d'invitation**
   - Formulaire pour ajouter des évaluateurs
   - Envoi d'emails d'invitation
   - Tracking du statut des invitations

2. **Page évaluateur**
   - Formulaire accessible via token unique
   - Sauvegarde des réponses évaluateur
   - Écran de remerciement

3. **Comparaison Self vs Evaluators**
   - Calcul des gaps
   - Visualisation des différences
   - Génération d'insights

### Phase 6 : MBTI Integration

1. **Upload de résultats MBTI**
   - Formulaire d'upload
   - Parsing du PDF/fichier
   - Sauvegarde du type MBTI

2. **Corrélation MBTI-TKI**
   - Algorithme de corrélation
   - Génération d'insights personnalisés
   - Recommandations basées sur le profil complet

## 📝 Notes Importantes

- La migration de base de données a déjà été appliquée en production
- Les modèles utilisent INTEGER pour les IDs (pas UUID) pour correspondre à la table users existante
- Le service de scoring est modulaire et peut être étendu facilement
- Les résultats sont stockés en JSONB pour flexibilité

## 🐛 Debugging

### Vérifier qu'un assessment existe
```sql
SELECT * FROM assessments WHERE user_id = <user_id>;
```

### Voir les réponses d'un assessment
```sql
SELECT * FROM assessment_answers WHERE assessment_id = <assessment_id> ORDER BY question_id;
```

### Voir les résultats calculés
```sql
SELECT result_data FROM assessment_results WHERE assessment_id = <assessment_id>;
```

## 📚 Ressources

- **Document Excel source** : `/home/ubuntu/upload/ARISELeadershipAssessmentToolMASTERTEMPLATENUKLEOFINAL2.xlsx`
- **Analyse de la structure** : `/home/ubuntu/ARISE_ASSESSMENTS_STRUCTURE_ANALYSIS.md`
- **Vraies questions Wellness** : `apps/web/src/data/wellnessQuestionsReal.ts`
