# Audit: Payment Form Reset Issue

**Date:** 2026-01-04  
**Problème:** "Payment form was reset. Please try again." lors de la soumission du formulaire de paiement Stripe

## 🔴 Problèmes Identifiés

### 1. **Elements Provider sans key - Remount potentiel**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:480-486`

**Problème:** Le composant `Elements` de Stripe n'a pas de prop `key` stable. Si le composant parent se re-rend, Stripe peut recréer l'instance, causant le démontage des éléments.

```tsx
export function Step5_Payment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent />
    </Elements>
  );
}
```

**Impact:** L'élément CardElement peut être démonté pendant le traitement du paiement, causant l'erreur "Payment form was reset".

**Solution:** Ajouter une key stable au composant Elements pour éviter les remounts inutiles.

---

### 2. **StripeCardElement sans key stable**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:403`

**Problème:** Bien qu'une key ait été ajoutée (`key={`stripe-element-${selectedPlan.id}`}`), cette key change si le plan change, causant un remount de l'élément.

**Impact:** Si le composant se re-rend pendant le traitement, l'élément est recréé et perd son état.

**Solution:** Utiliser une key stable basée sur le step ou le composant lui-même, pas sur le plan.

---

### 3. **Race condition dans handleSubmit**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:132-154`

**Problème:** Le code récupère l'élément deux fois :
1. Ligne 132: `const cardElement = elements.getElement(CardElement);`
2. Ligne 146: `const currentElement = elements.getElement(CardElement);`

Entre ces deux appels, l'élément peut être démonté, causant une erreur.

**Impact:** L'élément peut disparaître entre la vérification initiale et l'utilisation réelle.

**Solution:** Stocker l'élément dans une ref et ne le récupérer qu'une seule fois.

---

### 4. **Gestion d'erreur trop large pour les erreurs Stripe**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:168-191`

**Problème:** Le catch block capture toutes les erreurs de `stripe.createPaymentMethod`, mais certaines erreurs (comme les erreurs de validation de carte) ne devraient pas déclencher "Payment form was reset".

**Impact:** Des erreurs normales (carte invalide) peuvent être confondues avec des erreurs de démontage.

**Solution:** Vérifier le type exact d'erreur Stripe avant de considérer que c'est une erreur de démontage.

---

### 5. **Re-renders potentiels pendant le traitement**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:230-256`

**Problème:** Après la création réussie de l'abonnement, le code utilise `requestAnimationFrame` et `setTimeout` pour retarder le changement d'étape, mais le composant peut se re-rendre pendant ce temps.

**Impact:** Si le composant se re-rend, Stripe Elements peut être démonté avant que le paiement ne soit complètement traité.

**Solution:** Utiliser une ref pour s'assurer que le changement d'étape ne se produit que si le composant est toujours monté.

---

### 6. **Stripe promise non mémoïsée**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:15`

**Problème:** `stripePromise` est créé au niveau du module, mais si le composant est importé plusieurs fois ou si le module est rechargé, une nouvelle instance peut être créée.

**Impact:** Plusieurs instances de Stripe peuvent coexister, causant des conflits.

**Solution:** S'assurer que stripePromise est vraiment singleton (déjà le cas, mais vérifier).

---

### 7. **Pas de vérification que Stripe est chargé**
**Fichier:** `apps/web/src/components/register/Step5_Payment.tsx:122-125`

**Problème:** Le code vérifie `!stripe` mais ne vérifie pas si Stripe est complètement chargé et prêt. `useStripe()` peut retourner `null` même si Stripe est en cours de chargement.

**Impact:** Le formulaire peut être soumis avant que Stripe soit prêt, causant des erreurs.

**Solution:** Ajouter une vérification que Stripe est vraiment prêt avant de permettre la soumission.

---

### 8. **Elements Provider peut être recréé lors de changements d'étape**
**Fichier:** `apps/web/src/app/[locale]/register/page.tsx:41-73`

**Problème:** Le composant `Step5_Payment` est créé/démonté à chaque changement d'étape. Même avec `keepStep5Mounted`, la logique est complexe et peut échouer.

**Impact:** Le Elements Provider est démonté pendant le traitement du paiement.

**Solution:** Garder le Elements Provider monté au niveau parent et ne monter/démonter que le contenu du formulaire.

---

## 🔧 Solutions Recommandées

### Solution 1: Ajouter une key stable au Elements Provider

```tsx
export function Step5_Payment() {
  return (
    <Elements 
      stripe={stripePromise}
      key="payment-elements" // Key stable
      options={{
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <PaymentFormContent />
    </Elements>
  );
}
```

### Solution 2: Utiliser une ref pour l'élément card

```tsx
const cardElementRef = useRef<any>(null);

useEffect(() => {
  if (elements) {
    cardElementRef.current = elements.getElement(CardElement);
  }
}, [elements]);

// Dans handleSubmit, utiliser cardElementRef.current
```

### Solution 3: Améliorer la gestion d'erreur Stripe

```tsx
try {
  const result = await stripe.createPaymentMethod({
    type: 'card',
    card: currentElement,
  });
  
  if (result.error) {
    // Erreur de validation de carte - pas une erreur de démontage
    setCardError(result.error.message);
    return;
  }
  
  paymentMethod = result.paymentMethod;
} catch (stripeError: any) {
  // Vérifier le type exact d'erreur
  if (stripeError?.code === 'element_unmounted' || 
      stripeError?.message?.includes('Element') && 
      stripeError?.message?.includes('mounted')) {
    // Vraie erreur de démontage
    setError('Payment form was reset. Please try again.');
    return;
  }
  // Autres erreurs Stripe
  throw stripeError;
}
```

### Solution 4: Déplacer Elements Provider au niveau parent

Déplacer le `<Elements>` wrapper au niveau de `RegisterPage` pour qu'il reste monté pendant tout le processus d'enregistrement.

### Solution 5: Ajouter un état de chargement Stripe

```tsx
const stripe = useStripe();
const elements = useElements();
const [stripeReady, setStripeReady] = useState(false);

useEffect(() => {
  if (stripe && elements) {
    setStripeReady(true);
  }
}, [stripe, elements]);

// Dans le render, vérifier stripeReady avant d'afficher le formulaire
```

---

## 📊 Priorité des Correctifs

1. **HAUTE PRIORITÉ:**
   - Solution 1: Key stable sur Elements Provider
   - Solution 3: Améliorer la gestion d'erreur Stripe
   - Solution 5: État de chargement Stripe

2. **MOYENNE PRIORITÉ:**
   - Solution 2: Ref pour l'élément card
   - Vérifier que stripePromise est vraiment singleton

3. **BASSE PRIORITÉ (refactoring majeur):**
   - Solution 4: Déplacer Elements Provider au parent

---

## 🧪 Tests à Effectuer

1. Soumettre le formulaire rapidement après le chargement
2. Soumettre avec une carte invalide (doit montrer erreur de carte, pas "form reset")
3. Soumettre puis naviguer rapidement (doit gérer le démontage proprement)
4. Recharger la page pendant le traitement
5. Tester avec une connexion lente (simuler le chargement de Stripe)

---

## 📝 Notes Additionnelles

- L'erreur "Payment form was reset" apparaît dans le catch block ligne 183 et 282
- L'erreur Stripe réelle est: "We could not retrieve data from the specified Element. Please make sure the Element you are attempting to use is still mounted."
- Le problème se produit probablement pendant `stripe.createPaymentMethod()`, pas après
- Les logs montrent aussi une erreur 400 de l'API backend, ce qui pourrait indiquer que le payment_method_id n'est pas créé correctement
