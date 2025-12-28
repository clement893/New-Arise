# Vérification - Sauvegarde de la Préférence de Langue

## ✅ Oui, la préférence de langue EST sauvegardée dans la DB

### Flux de sauvegarde

1. **Frontend** (`PreferencesManager.tsx`)
   - L'utilisateur change la langue dans le select
   - Clique sur "Save"
   - Appel API : `apiClient.put('/v1/users/preferences', editedPreferences)`
   - Les données envoyées incluent `{ language: 'en' }` ou `{ language: 'fr' }`

2. **Backend API** (`backend/app/api/v1/endpoints/user_preferences.py`)
   - Endpoint : `PUT /api/v1/users/preferences`
   - Reçoit le dictionnaire de préférences : `{ language: 'en', theme: 'dark', ... }`
   - Appelle : `service.set_preferences(current_user.id, preferences)`

3. **Service** (`backend/app/services/user_preference_service.py`)
   - Méthode `set_preferences()` itère sur chaque clé/valeur
   - Pour chaque préférence, appelle `set_preference(user_id, key, value)`
   - `set_preference()` :
     - Vérifie si la préférence existe déjà (clé `language` pour cet utilisateur)
     - Si oui : met à jour la valeur
     - Si non : crée une nouvelle entrée
   - Commit dans la base de données

4. **Base de données** (`backend/app/models/user_preference.py`)
   - Table : `user_preferences`
   - Structure :
     - `id` : Integer (PK)
     - `user_id` : Integer (FK vers users.id)
     - `key` : String(100) - ex: "language"
     - `value` : JSON - ex: "en" ou "fr"
     - `created_at` : DateTime
     - `updated_at` : DateTime
   - Contrainte unique : `(user_id, key)` - une seule préférence par clé par utilisateur

### Exemple de données en DB

```sql
SELECT * FROM user_preferences WHERE key = 'language';

id | user_id | key      | value | created_at          | updated_at
---|---------|----------|-------|---------------------|-------------------
1  | 1       | language | "en"  | 2025-01-27 10:00:00 | 2025-01-27 10:05:00
```

### Vérification

Pour vérifier si la préférence est bien sauvegardée :

1. **Via l'API** :
   ```bash
   curl -X GET https://modelebackend-production-0590.up.railway.app/api/v1/users/preferences \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Devrait retourner : `{ "language": "en", ... }`

2. **Via la base de données** :
   ```sql
   SELECT * FROM user_preferences 
   WHERE user_id = YOUR_USER_ID AND key = 'language';
   ```

3. **Via le frontend** :
   - Aller sur `/settings/preferences`
   - Le select devrait afficher la langue sauvegardée

### Points importants

- ✅ La préférence est sauvegardée avec la clé `"language"`
- ✅ La valeur est stockée en JSON (string simple : `"en"` ou `"fr"`)
- ✅ Si la préférence existe déjà, elle est mise à jour (pas de doublon)
- ✅ La contrainte unique `(user_id, key)` garantit une seule préférence par clé

### Problème potentiel

Si la préférence n'est pas appliquée au chargement, c'est parce que :
- Le middleware Next.js détecte la locale depuis l'URL, pas depuis les préférences DB
- Il faudrait ajouter une logique pour charger la préférence au démarrage et rediriger

Mais la sauvegarde elle-même fonctionne correctement ! ✅

