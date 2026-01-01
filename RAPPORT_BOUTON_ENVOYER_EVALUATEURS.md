# Rapport: Problème du bouton "Envoyer" dans la modal d'invitation d'évaluateurs

## Date: 2026-01-01

## Problème identifié

Le bouton **"Envoyer les invitations"** dans la modal `InviteAdditionalEvaluatorsModal` ne fonctionne pas.

## Analyse du code

### Fichiers concernés

1. **Frontend - Modal:** `apps/web/src/components/360/InviteAdditionalEvaluatorsModal.tsx`
2. **Frontend - API:** `apps/web/src/lib/api/assessments.ts`
3. **Backend - Endpoint:** `backend/app/api/v1/endpoints/assessments.py` (ligne 638)

### Structure du code

#### Frontend - Modal (`InviteAdditionalEvaluatorsModal.tsx`)

**Ligne 116-155:** Fonction `handleSubmit`
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);

  if (!validateForm()) {
    return; // Validation échoue
  }

  try {
    setIsSubmitting(true);
    const evaluatorsData: Evaluator360Data[] = evaluators.map((e) => ({
      name: e.name.trim(),
      email: e.email.trim(),
      role: e.role,
    }));
    await invite360Evaluators(assessmentId, evaluatorsData);
    setSuccess(true);
    setTimeout(() => {
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);
  } catch (err: any) {
    console.error('Failed to invite evaluators:', err);
    setError(...);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Ligne 198:** Form avec `onSubmit={handleSubmit}`
```typescript
<form onSubmit={handleSubmit}>
```

**Ligne 308-315:** Bouton submit
```typescript
<Button
  type="submit"
  variant="primary"
  className="flex-1"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Envoi en cours...' : 'Envoyer les invitations'}
</Button>
```

#### Frontend - API (`assessments.ts`)

**Ligne 246-256:** Fonction `invite360Evaluators`
```typescript
export const invite360Evaluators = async (
  assessmentId: number,
  evaluators: Evaluator360Data[]
): Promise<{ message: string; evaluators: Evaluator360Data[] }> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}/360/invite-evaluators`,
    { evaluators },
    { headers: getAuthHeaders() }
  );
  return response.data;
};
```

#### Backend - Endpoint (`assessments.py`)

**Ligne 638-721:** Endpoint `/api/v1/assessments/{assessment_id}/360/invite-evaluators`

- **Méthode:** POST
- **Body attendu:** `Evaluator360InviteRequest` avec `evaluators: List[Evaluator360Data]`
- **Validation:**
  - Vérifie que l'assessment existe et appartient à l'utilisateur
  - Vérifie que c'est un assessment `THREE_SIXTY_SELF`
- **Réponse:** `{ "message": "...", "evaluators": [...] }`

### Points à vérifier

1. **Validation du formulaire:**
   - La fonction `validateForm()` peut retourner `false` si:
     - Un nom est vide
     - Un email est vide
     - Un email n'est pas valide
     - Des emails sont dupliqués
   - Si la validation échoue, le submit est bloqué silencieusement

2. **Erreurs réseau:**
   - Les erreurs axios sont capturées dans le `catch` mais peuvent ne pas être visibles
   - Vérifier la console du navigateur pour les erreurs

3. **Problèmes possibles:**
   - Le bouton peut être désactivé (`disabled={isSubmitting}`) mais l'état ne change jamais
   - La validation peut échouer sans afficher d'erreur visible
   - L'API peut retourner une erreur qui n'est pas correctement affichée
   - Le `assessmentId` peut être invalide ou null

### Solutions possibles

1. **Ajouter plus de logs de debug** pour comprendre où ça bloque
2. **Vérifier que l'erreur s'affiche bien** dans l'UI
3. **Vérifier que la validation passe** avant le submit
4. **Vérifier la console du navigateur** pour les erreurs réseau
5. **Vérifier que `assessmentId` est valide** avant d'appeler l'API
