# Plan de Suppression des Endpoints API

## Endpoints à Supprimer

Basé sur l'audit des tables, voici les endpoints API à supprimer correspondant aux 22 tables à supprimer :

### 1. Projects (`projects`)
- **Fichier:** `backend/app/api/v1/endpoints/projects.py`
- **Router:** Ligne 76 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/project.py`
- **Note:** ⚠️ Vérifier si `projects_router` dans client portal utilise la même table

### 2. Forms (`forms`, `form_submissions`)
- **Fichier:** `backend/app/api/v1/endpoints/forms.py`
- **Router:** Ligne 308 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/form.py`

### 3. Onboarding (`onboarding_steps`, `user_onboarding`)
- **Fichier:** `backend/app/api/v1/endpoints/onboarding.py`
- **Router:** Ligne 232 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/onboarding.py`

### 4. Announcements (`announcements`, `announcement_dismissals`)
- **Fichier:** `backend/app/api/v1/endpoints/announcements.py`
- **Router:** Ligne 212 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/announcement.py`

### 5. Feature Flags (`feature_flags`, `feature_flag_logs`)
- **Fichier:** `backend/app/api/v1/endpoints/feature_flags.py`
- **Router:** Ligne 205 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/feature_flag.py`

### 6. Scheduled Tasks (`scheduled_tasks`, `task_execution_logs`)
- **Fichier:** `backend/app/api/v1/endpoints/scheduled_tasks.py`
- **Router:** Ligne 246 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/scheduled_task.py`

### 7. Backups (`backups`, `restore_operations`)
- **Fichier:** `backend/app/api/v1/endpoints/backups.py`
- **Router:** Ligne 253 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/backup.py`

### 8. Documentation (`documentation_articles`, `documentation_categories`, `documentation_feedback`)
- **Fichier:** `backend/app/api/v1/endpoints/documentation.py`
- **Router:** Ligne 239 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/documentation.py`

### 9. Shares (`shares`, `share_access_logs`)
- **Fichier:** `backend/app/api/v1/endpoints/shares.py`
- **Router:** Ligne 198 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/share.py`

### 10. Favorites (`favorites`)
- **Fichier:** `backend/app/api/v1/endpoints/favorites.py`
- **Router:** Ligne 177 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/favorite.py`

### 11. Comments (`comments`, `comment_reactions`)
- **Fichier:** `backend/app/api/v1/endpoints/comments.py`
- **Router:** Ligne 170 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/comment.py`

### 12. Feedback (`feedback`, `feedback_attachments`)
- **Fichier:** `backend/app/api/v1/endpoints/feedback.py`
- **Router:** Ligne 225 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/feedback.py`
- **Note:** ⚠️ Différent de `support_tickets` qui est conservé

### 13. Reports (`reports`)
- **Fichier:** `backend/app/api/v1/endpoints/reports.py`
- **Router:** Ligne 332 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/report.py`
- **Note:** ⚠️ Vérifier si `reports_router` dans ERP portal utilise la même table

### 14. Versions (`versions`)
- **Fichier:** `backend/app/api/v1/endpoints/versions.py`
- **Router:** Ligne 191 dans `backend/app/api/v1/router.py`
- **Modèle:** `backend/app/models/version.py`
- **Note:** ⚠️ Différent de `email_template_versions` qui est conservé

## Actions à Effectuer

1. ✅ Migration créée : `034_remove_unused_template_tables.py`
2. ⏭️ Supprimer les endpoints du router
3. ⏭️ Supprimer les fichiers d'endpoints
4. ⏭️ Supprimer les modèles SQLAlchemy
5. ⏭️ Nettoyer les imports dans `backend/app/models/__init__.py`
6. ⏭️ Nettoyer les imports dans `backend/app/api/v1/router.py`
7. ⏭️ Supprimer les schémas Pydantic associés
8. ⏭️ Vérifier les tests et les supprimer/mettre à jour
