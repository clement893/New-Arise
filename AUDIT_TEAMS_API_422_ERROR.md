# Audit - Erreur 422 sur l'API Teams

## Problème identifié

L'endpoint `/api/v1/teams` retourne une erreur **422 (Unprocessable Entity)** avec le message :
```
VALIDATION ERROR - Path: /api/v1/teams | Field: settings | Message: Input should be a valid dictionary | Type: dict_type
```

### Cause technique

**Problème racine** : Incohérence dans le parsing du champ `settings` dans le backend.

1. **Modèle de base de données** (`backend/app/models/team.py:29`) :
   - `settings = Column(Text, nullable=True)` - Stocké comme **string JSON** dans la DB

2. **Schéma Pydantic** (`backend/app/schemas/team.py:16`) :
   - `settings: Optional[Dict[str, Any]]` - Attendu comme **dictionnaire** dans la réponse API

3. **Incohérence dans le code** :
   - ✅ `create_team()` (ligne 58-68) : **Parse correctement** la string JSON en dict
   - ✅ `create_team()` (ligne 124-132) : **Parse correctement** dans le retour de réponse
   - ❌ `list_teams()` (ligne 219) : **Ne parse PAS** - fait directement `"settings": team.settings`
   - ❌ `get_team()` (ligne 258) : **Ne parse PAS** - fait directement `"settings": team.settings`
   - ❌ `update_team()` (ligne 307) : **Ne parse PAS** - fait directement `"settings": team.settings`

**Résultat** : Quand `team.settings` est une string JSON (ou null), Pydantic essaie de valider une string comme un dict et échoue avec une erreur 422.

## Pages affectées

### ✅ **1. `/fr/settings/organization`** - PROBLÈME CONFIRMÉ
- **Fichier** : `apps/web/src/app/[locale]/settings/organization/page.tsx`
- **Ligne** : 72
- **Appel API** : `teamsAPI.getMyTeams()`
- **Impact** : ❌ **CRITIQUE** - La page ne peut pas charger les paramètres de l'organisation
- **Gestion d'erreur** : Affiche "Échec du chargement des paramètres de l'organisation"
- **Code** :
  ```typescript
  const teamsResponse = await teamsAPI.getMyTeams();
  ```

### ⚠️ **2. `/admin/organizations`** - RISQUE ÉLEVÉ
- **Fichier** : `apps/web/src/app/[locale]/admin/organizations/AdminOrganizationsContent.tsx`
- **Ligne** : 67
- **Appel API** : `teamsAPI.list()`
- **Impact** : ⚠️ **ÉLEVÉ** - La page admin ne peut pas lister les organisations
- **Gestion d'erreur** : Gère les erreurs 404 mais pas les 422 spécifiquement
- **Code** :
  ```typescript
  const response = await teamsAPI.list();
  ```

### ⚠️ **3. `/admin/teams`** - RISQUE ÉLEVÉ
- **Fichier** : `apps/web/src/app/[locale]/admin/teams/page.tsx`
- **Ligne** : 76
- **Appel API** : `teamsAPI.list()`
- **Impact** : ⚠️ **ÉLEVÉ** - La page admin ne peut pas lister les équipes
- **Gestion d'erreur** : Gère les erreurs 404 mais pas les 422 spécifiquement
- **Code** :
  ```typescript
  const response = await teamsAPI.list();
  ```

### ⚠️ **4. `TeamManagement` Component** - RISQUE MOYEN
- **Fichier** : `apps/web/src/components/admin/TeamManagement.tsx`
- **Ligne** : 79
- **Appel API** : `teamsAPI.list()`
- **Impact** : ⚠️ **MOYEN** - Le composant ne peut pas charger les équipes
- **Gestion d'erreur** : Affiche un message d'erreur générique
- **Code** :
  ```typescript
  const response = await teamsAPI.list();
  ```

### ⚠️ **5. `/admin/statistics`** - RISQUE MOYEN
- **Fichier** : `apps/web/src/app/[locale]/admin/statistics/AdminStatisticsContent.tsx`
- **Ligne** : 128
- **Appel API** : `teamsAPI.list()`
- **Impact** : ⚠️ **MOYEN** - Les statistiques ne peuvent pas compter les organisations
- **Gestion d'erreur** : Ignore silencieusement les erreurs (try/catch vide)
- **Code** :
  ```typescript
  const teamsResponse = await teamsAPI.list();
  // ...
  } catch (e) {
    // Ignore if teams API is not available
  }
  ```

### ⚠️ **6. React Query Hooks** - RISQUE MOYEN
- **Fichier** : `apps/web/src/lib/query/queries.ts`
- **Ligne** : 182
- **Appel API** : `teamsAPI.list()` (via hook `useTeams()`)
- **Impact** : ⚠️ **MOYEN** - Tous les composants utilisant ces hooks échoueront
- **Gestion d'erreur** : Gestion standard de React Query
- **Code** :
  ```typescript
  export function useTeams() {
    return useQuery({
      queryKey: queryKeys.teams.all,
      queryFn: () => teamsAPI.list(),
    });
  }
  ```

## Analyse de la gestion d'erreur

### Pages avec gestion d'erreur 422 :
- ❌ **Aucune** - Aucune page ne gère spécifiquement l'erreur 422

### Pages avec gestion d'erreur partielle :
1. ✅ `AdminOrganizationsContent.tsx` - Gère les erreurs mais pas spécifiquement 422
2. ✅ `admin/teams/page.tsx` - Gère les erreurs 404 mais pas 422
3. ✅ `TeamManagement.tsx` - Affiche un message d'erreur générique
4. ⚠️ `AdminStatisticsContent.tsx` - **Ignore silencieusement** les erreurs (risque de données incomplètes)

## Recommandations

### Solution immédiate (Backend) - 🔴 PRIORITÉ 1
1. **Corriger `list_teams()` dans `backend/app/api/v1/endpoints/teams.py`** (ligne 219) :
   ```python
   # AVANT (ligne 219)
   "settings": team.settings,
   
   # APRÈS (ajouter parsing comme dans create_team)
   "settings": parse_team_settings(team.settings),
   ```

2. **Corriger `get_team()` dans `backend/app/api/v1/endpoints/teams.py`** (ligne 258) :
   ```python
   # AVANT (ligne 258)
   "settings": team.settings,
   
   # APRÈS (ajouter parsing)
   "settings": parse_team_settings(team.settings),
   ```

3. **Corriger `update_team()` dans `backend/app/api/v1/endpoints/teams.py`** (ligne 307) :
   ```python
   # AVANT (ligne 307)
   "settings": team.settings,
   
   # APRÈS (ajouter parsing)
   "settings": parse_team_settings(team.settings),
   ```

4. **Créer une fonction helper** pour éviter la duplication :
   ```python
   def parse_team_settings(settings_value):
       """Parse team settings from DB (string JSON) to dict"""
       if not settings_value:
           return None
       if isinstance(settings_value, dict):
           return settings_value
       if isinstance(settings_value, str):
           try:
               import json
               return json.loads(settings_value)
           except (json.JSONDecodeError, TypeError):
               return None
       return None
   ```

5. **Note** : `_team_to_response()` (ligne 162) utilise déjà `settings_dict` qui est parsé correctement (ligne 142)

### Solution à court terme (Frontend)
1. **Ajouter une gestion d'erreur 422** dans toutes les pages :
   - Détecter spécifiquement l'erreur 422
   - Afficher un message d'erreur clair
   - Proposer une action de récupération (retry, skip, etc.)

2. **Améliorer la gestion d'erreur** dans `AdminStatisticsContent.tsx` :
   - Ne pas ignorer silencieusement les erreurs
   - Logger l'erreur pour debugging
   - Afficher un indicateur si les données sont incomplètes

### Solution à long terme
1. **Migration de données** : Nettoyer tous les teams avec `settings` invalides dans la base de données
2. **Validation backend** : Ajouter une validation stricte lors de la création/mise à jour des teams
3. **Tests** : Ajouter des tests pour vérifier la robustesse de l'API teams

## Priorité de correction

1. 🔴 **URGENT** : `/fr/settings/organization` - Bloque l'utilisation principale
2. 🟠 **HAUTE** : `/admin/organizations` - Bloque l'administration
3. 🟠 **HAUTE** : `/admin/teams` - Bloque l'administration
4. 🟡 **MOYENNE** : `TeamManagement` Component - Impact sur composants réutilisables
5. 🟡 **MOYENNE** : `/admin/statistics` - Données incomplètes mais non bloquant
6. 🟡 **MOYENNE** : React Query Hooks - Impact sur tous les composants utilisant ces hooks

## Fichiers à modifier

### Backend - 🔴 URGENT
- `backend/app/api/v1/endpoints/teams.py` :
  - **Ligne 219** dans `list_teams()` : Ajouter parsing de `team.settings`
  - **Ligne 258** dans `get_team()` : Ajouter parsing de `team.settings`
  - **Ligne 307** dans `update_team()` : Ajouter parsing de `team.settings`
  - Créer fonction helper `parse_team_settings()` pour éviter duplication (réutiliser la logique des lignes 58-68)

### Frontend
- `apps/web/src/app/[locale]/settings/organization/page.tsx` - Ajouter gestion 422
- `apps/web/src/app/[locale]/admin/organizations/AdminOrganizationsContent.tsx` - Ajouter gestion 422
- `apps/web/src/app/[locale]/admin/teams/page.tsx` - Ajouter gestion 422
- `apps/web/src/components/admin/TeamManagement.tsx` - Ajouter gestion 422
- `apps/web/src/app/[locale]/admin/statistics/AdminStatisticsContent.tsx` - Améliorer gestion d'erreur
- `apps/web/src/lib/api/teams.ts` - Ajouter helper pour gérer les erreurs 422
