# Fix pour la boucle de soumission Wellness

## Problème
L'application tente de soumettre l'assessment Wellness (ID 143) de façon répétée sans réponses, causant une boucle d'erreurs 400.

## Cause
État corrompu dans le localStorage (zustand persist) - le store pense qu'un assessment est en cours mais n'a pas de réponses.

## Solution immédiate

### 1. Effacer le localStorage pour cet utilisateur

Dans la console du navigateur (F12), exécuter:
```javascript
// Effacer le store wellness corrompu
localStorage.removeItem('wellness-assessment');

// Optionnel: effacer tous les stores d'assessments
localStorage.removeItem('tki-assessment');
localStorage.removeItem('mbti-assessment');
localStorage.removeItem('feedback360-assessment');

// Recharger la page
window.location.reload();
```

### 2. Se reconnecter

Si l'erreur 401 persiste, déconnectez-vous et reconnectez-vous:
- Cliquez sur le bouton de déconnexion
- Reconnectez-vous avec vos identifiants

## Prévention - Corrections appliquées ✓

Les corrections suivantes ont été appliquées pour prévenir ce problème à l'avenir:

### 1. Validation avant soumission (wellnessStore.ts)

Ajout d'une vérification pour s'assurer qu'il y a des réponses avant de soumettre:
- Vérification du nombre de réponses dans `submitAssessment()`
- Vérification du nombre de réponses dans `completeAssessment()`
- Message d'erreur clair si aucune réponse n'est trouvée
- Réinitialisation de l'état `isCompleted` si état corrompu détecté

### 2. Protection des autres stores

Les mêmes protections ont été appliquées à:
- **tkiStore.ts** - Ajout de validation des réponses avant soumission
- **mbtiStore.ts** - Amélioration de la gestion des erreurs et validation

### 3. Détection d'état corrompu

Si l'API retourne une erreur "No answers provided":
- Le système détecte automatiquement l'état corrompu
- Affiche un message clair à l'utilisateur
- Réinitialise `isCompleted` à `false`
- Permet à l'utilisateur de recommencer

## Test des corrections

Après avoir effacé le localStorage et rechargé la page, vous devriez voir:

1. ✓ Pas de boucle de tentatives de soumission
2. ✓ Message d'erreur clair si tentative de soumettre sans réponses
3. ✓ Possibilité de recommencer l'assessment
4. ✓ Logs console informatifs (non-intrusifs)

## Diagnostic supplémentaire

Si le problème persiste après avoir suivi les étapes ci-dessus:

### Vérifier l'authentification
```javascript
// Dans la console du navigateur
fetch('/api/v1/auth/me', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Si vous obtenez une erreur 401, reconnectez-vous.

### Vérifier les assessments existants
```javascript
// Dans la console du navigateur
fetch('/api/v1/assessments/my-assessments', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => {
    console.log('Mes assessments:', data);
    // Regarder l'ID, le status, et answer_count de chaque assessment
  })
  .catch(console.error);
```

Cela vous montrera tous vos assessments et leur statut.
