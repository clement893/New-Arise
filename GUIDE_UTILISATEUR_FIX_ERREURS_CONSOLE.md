# Guide de résolution des erreurs console

## Résumé du problème

Vous voyez des erreurs répétées dans la console:
- `401 Unauthorized` sur `/api/v1/auth/me`
- `404 Not Found` sur `/api/v1/assessments/142` (TKI)
- `400 Bad Request` sur `/api/v1/assessments/143/submit` (Wellness)
- Message: "Cannot submit assessment: No answers provided"

## Cause

Le système a un **état corrompu dans le localStorage** - il pense qu'il y a un assessment en cours (ID 143) mais il n'a pas de réponses sauvegardées, créant une boucle d'erreurs.

## Solution rapide (5 minutes)

### Étape 1: Ouvrir la console du navigateur

1. Appuyez sur **F12** (ou clic droit > Inspecter)
2. Allez dans l'onglet **Console**

### Étape 2: Effacer le localStorage corrompu

Dans la console, copiez-collez ces commandes une par une:

```javascript
// Effacer le store wellness corrompu
localStorage.removeItem('wellness-assessment');

// Effacer aussi les autres stores pour être sûr
localStorage.removeItem('tki-assessment-storage');
localStorage.removeItem('mbti-assessment');
localStorage.removeItem('feedback360-assessment');

// Afficher confirmation
console.log('✓ localStorage nettoyé');
```

### Étape 3: Recharger la page

```javascript
// Dans la console
window.location.reload();
```

Ou simplement appuyez sur **F5** ou **Ctrl+R**.

### Étape 4: Vérifier que c'est résolu

1. Ouvrez la console (F12)
2. Vous ne devriez plus voir de boucle d'erreurs
3. Si vous voyez toujours l'erreur 401 (Unauthorized), passez à l'étape 5

### Étape 5: Se reconnecter (si erreur 401 persiste)

1. Déconnectez-vous de l'application
2. Reconnectez-vous avec vos identifiants
3. Les erreurs devraient disparaître

## Vérification

Après ces étapes, vous devriez voir:

✓ Pas d'erreurs répétées dans la console
✓ Navigation fluide dans l'application
✓ Possibilité de démarrer un nouvel assessment

## Si le problème persiste

### Diagnostic avancé

Dans la console du navigateur, exécutez:

```javascript
// Vérifier votre authentification
fetch('/api/v1/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('✓ Utilisateur:', data))
  .catch(err => console.error('✗ Erreur auth:', err));

// Vérifier vos assessments
fetch('/api/v1/assessments/my-assessments', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('✓ Mes assessments:', data);
    data.forEach(a => {
      console.log(`- ${a.assessment_type} (ID: ${a.id}): ${a.status} (${a.answer_count || 0}/${a.total_questions || 0} réponses)`);
    });
  })
  .catch(err => console.error('✗ Erreur assessments:', err));
```

Envoyez le résultat à votre équipe technique.

## Prévention

Les corrections suivantes ont été appliquées au code pour éviter ce problème à l'avenir:

1. ✓ Validation des réponses avant soumission
2. ✓ Détection automatique d'état corrompu
3. ✓ Messages d'erreur clairs
4. ✓ Réinitialisation automatique en cas d'erreur

Ces corrections sont maintenant actives dans tous les stores d'assessment (Wellness, TKI, MBTI).

## Contact

Si le problème persiste après avoir suivi toutes ces étapes, contactez le support technique avec:
- Les résultats du diagnostic avancé
- Une capture d'écran de la console
- Votre nom d'utilisateur

---

**Dernière mise à jour:** 2026-01-20
