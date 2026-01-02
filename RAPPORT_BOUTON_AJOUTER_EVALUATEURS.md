# Rapport: Problème du bouton "Ajouter des évaluateurs"

## Date: 2026-01-01

## Problème identifié

Le bouton **"Ajouter des évaluateurs"** sur la page dashboard principal (`/dashboard/page.tsx`) ne fonctionne pas correctement. Il redirige simplement vers `/dashboard/assessments` mais n'ouvre pas la modal pour ajouter des évaluateurs.

## Localisation du problème

**Fichier:** `apps/web/src/app/[locale]/dashboard/page.tsx`  
**Lignes:** 323-329

```typescript
<Button 
  variant="primary" 
  className="whitespace-nowrap"
  onClick={() => router.push('/dashboard/assessments')}
>
  Ajouter des évaluateurs
</Button>
```

## Analyse du code

### État actuel

1. **Dashboard (`/dashboard/page.tsx`):**
   - Le bouton redirige vers `/dashboard/assessments`
   - Aucune logique pour ouvrir une modal
   - Ne charge pas les assessments 360° pour vérifier s'ils existent
   - Ne passe aucun paramètre pour indiquer l'intention d'ajouter des évaluateurs

2. **Page Assessments (`/dashboard/assessments/page.tsx`):**
   - Gère correctement la modal `InviteAdditionalEvaluatorsModal`
   - Le modal s'ouvre uniquement via `setShowEvaluatorModal(true)`
   - Le modal nécessite un `assessmentId` valide pour fonctionner
   - La modal s'affiche uniquement si un assessment `THREE_SIXTY_SELF` existe

### Fonctionnalité attendue

Le bouton devrait:
1. Vérifier si un assessment 360° existe déjà
2. Si oui, ouvrir la modal directement depuis le dashboard
3. Si non, rediriger vers `/dashboard/assessments/360-feedback/start` pour créer l'assessment

### Problèmes techniques identifiés

1. **Absence de logique modale sur le dashboard:**
   - Le dashboard n'importe pas `InviteAdditionalEvaluatorsModal`
   - Le dashboard n'a pas d'état pour gérer l'ouverture/fermeture de la modal
   - Le dashboard charge les assessments mais ne les utilise pas pour la logique du bouton

2. **Redirection non contextuelle:**
   - La redirection vers `/dashboard/assessments` ne garantit pas que la modal s'ouvrira
   - L'utilisateur doit ensuite trouver et cliquer sur un autre bouton

3. **Expérience utilisateur dégradée:**
   - Deux clics nécessaires au lieu d'un
   - Pas de feedback immédiat

## Solution proposée

### Option 1: Ouvrir la modal directement depuis le dashboard (RECOMMANDÉE)

**Avantages:**
- Expérience utilisateur fluide
- Un seul clic nécessaire
- Cohérent avec le design du dashboard

**Implémentation:**
1. Importer `InviteAdditionalEvaluatorsModal` dans `dashboard/page.tsx`
2. Ajouter un état `showEvaluatorModal` pour gérer la modal
3. Trouver l'assessment 360° dans la liste des assessments déjà chargés
4. Si l'assessment existe, ouvrir la modal directement
5. Si l'assessment n'existe pas, rediriger vers `/dashboard/assessments/360-feedback/start`

### Option 2: Utiliser un paramètre URL

**Avantages:**
- Solution simple
- Réutilise le code existant de la page assessments

**Inconvénients:**
- Nécessite encore une navigation
- Moins direct

**Implémentation:**
1. Rediriger vers `/dashboard/assessments?addEvaluators=true`
2. Modifier la page assessments pour détecter ce paramètre
3. Ouvrir automatiquement la modal si le paramètre est présent

## Code actuel problématique

```typescript:323:329:apps/web/src/app/[locale]/dashboard/page.tsx
<Button 
  variant="primary" 
  className="whitespace-nowrap"
  onClick={() => router.push('/dashboard/assessments')}
>
  Ajouter des évaluateurs
</Button>
```

## Recommandation

**Implémenter l'Option 1** pour offrir la meilleure expérience utilisateur. Le dashboard charge déjà les assessments, donc toutes les données nécessaires sont disponibles.
