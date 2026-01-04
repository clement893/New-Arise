# Debug 360 Feedback Status Issue

## Problème
Le bouton "Voir les résultats" s'affiche même quand toutes les questions ne sont pas complétées (26/30 au lieu de 30/30).

## Points à vérifier

### 1. Logs console
Ouvrez la console du navigateur et vérifiez les logs suivants:
- `[Assessments] THREE_SIXTY_SELF assessment status check:`
- `[Assessments] THREE_SIXTY_SELF assessment determined status:`
- `[Assessments] THREE_SIXTY_SELF button determination:`

Ces logs doivent montrer:
- `answerCount`: nombre de réponses (devrait être 26)
- `totalQuestions`: nombre total de questions (devrait être 30)
- `status`: statut déterminé (devrait être 'in-progress' pas 'completed')
- `hasAllAnswers`: devrait être `false` si answerCount !== totalQuestions

### 2. Vérification backend
Vérifiez dans la base de données:
- Table `assessments`: Quel est le `status` dans la base de données?
- Table `assessment_answers`: Combien de lignes pour cet assessment_id?

### 3. Vérification API
Appelez directement l'API:
```bash
GET /api/v1/assessments/my-assessments
```

Vérifiez la réponse JSON pour le 360 feedback:
- `status`: quel statut est retourné?
- `answer_count`: combien de réponses?
- `total_questions`: combien de questions totales?

### 4. Cache
Videz le cache du navigateur (Ctrl+Shift+Delete) et rechargez la page.

### 5. Vérification du code
Les corrections ont été appliquées dans:
- `apps/web/src/lib/utils/assessmentStatus.ts`: PRIMARY CHECK et SECONDARY CHECK utilisent `===` strict
- `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`: getActionButton a une vérification supplémentaire dans le case 'completed'

## Action requise
Merci de partager:
1. Les logs de la console (surtout ceux avec `THREE_SIXTY_SELF`)
2. Le statut retourné par l'API `/api/v1/assessments/my-assessments`
3. Le nombre exact de questions répondues et le nombre total de questions
