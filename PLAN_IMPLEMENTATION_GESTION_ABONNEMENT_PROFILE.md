# Plan d'Implémentation - Gestion d'Abonnement sur la Page Profile

## Objectif
Intégrer une fonctionnalité complète de gestion d'abonnement sur la page `/fr/profile` avec connexion aux abonnements actifs et à Stripe.

## Vue d'ensemble
La page profile possède déjà un onglet "Subscription" mais avec des données statiques. Il faut le transformer en un système fonctionnel connecté à l'API backend et Stripe.

---

## Phase 1: Analyse et Préparation

### 1.1 Composants existants à réutiliser
- ✅ **SubscriptionCard** (`apps/web/src/components/subscriptions/SubscriptionCard.tsx`)
  - Affiche les détails de l'abonnement
  - Gère les actions de cancellation/resume
  - Affiche le statut et les périodes de facturation

- ✅ **PaymentHistory** (`apps/web/src/components/billing/PaymentHistory.tsx`)
  - Affiche l'historique des paiements
  - Filtres par statut et date
  - Téléchargement de reçus

- ✅ **Hooks React Query** (`apps/web/src/lib/query/queries.ts`)
  - `useMySubscription()` - Récupère l'abonnement actif
  - `useSubscriptionPayments()` - Récupère l'historique des paiements
  - `useCancelSubscription()` - Annule l'abonnement
  - `useCreateCheckoutSession()` - Crée une session de checkout

### 1.2 API Backend existante
- ✅ **GET** `/api/v1/subscriptions/me` - Récupère l'abonnement actif
- ✅ **POST** `/api/v1/subscriptions/portal?return_url=...` - Crée une session Stripe Portal
- ✅ **POST** `/api/v1/subscriptions/cancel` - Annule l'abonnement
- ✅ **GET** `/api/v1/subscriptions/payments` - Récupère l'historique des paiements
- ✅ **POST** `/api/v1/subscriptions/checkout` - Crée une session de checkout

### 1.3 Services Stripe existants
- ✅ **StripeService.create_portal_session()** - Crée une session du portail client Stripe
- ✅ Gestion automatique des webhooks Stripe
- ✅ Synchronisation des statuts d'abonnement

---

## Phase 2: Implémentation Frontend

### 2.1 Créer un hook pour le Stripe Portal

**Fichier:** `apps/web/src/lib/query/queries.ts`

Ajouter un hook mutation pour créer une session du portail:

```typescript
export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (returnUrl: string) => 
      subscriptionsAPI.createPortalSession(returnUrl),
  });
}
```

### 2.2 Créer un composant de gestion d'abonnement

**Fichier:** `apps/web/src/components/profile/SubscriptionManagement.tsx`

Ce composant doit:
- Afficher l'abonnement actif (ou message si aucun)
- Bouton "Manage My Subscription" qui ouvre le Stripe Portal
- Afficher les informations de l'abonnement (plan, statut, dates)
- Gérer les actions (cancel, resume, change plan)
- Afficher l'historique des paiements

**Fonctionnalités:**
1. **Affichage de l'abonnement actif**
   - Utiliser `useMySubscription()` pour récupérer les données
   - Afficher avec `SubscriptionCard` si abonnement existe
   - Message invitant à s'abonner si aucun abonnement

2. **Bouton "Manage My Subscription"**
   - Utiliser `useCreatePortalSession()` 
   - Créer une session Stripe Portal avec return_url vers `/fr/profile?tab=subscription`
   - Rediriger vers l'URL du portail Stripe
   - Gérer les erreurs (pas de customer Stripe, etc.)

3. **Actions d'abonnement**
   - Cancel Subscription (via `useCancelSubscription()`)
   - Resume Subscription (si cancel_at_period_end = true)
   - Change Plan (redirection vers `/pricing`)

4. **Historique des paiements**
   - Utiliser `useSubscriptionPayments()` pour récupérer les données
   - Afficher avec `PaymentHistory` component
   - Ne s'affiche que si l'utilisateur a un abonnement

### 2.3 Modifier la page Profile

**Fichier:** `apps/web/src/app/[locale]/profile/page.tsx`

**Modifications:**
1. Remplacer le contenu de l'onglet "Subscription" par le nouveau composant
2. Intégrer `SubscriptionManagement` dans l'onglet subscription
3. Gérer le loading state et les erreurs
4. Ajouter la gestion des paramètres URL pour l'onglet actif (`?tab=subscription`)
5. Supprimer les données hardcodées

**Structure:**
```tsx
{activeTab === 'subscription' && (
  <SubscriptionManagement />
)}
```

### 2.4 Traduction/Multilingue

**Fichier:** `apps/web/src/[locale]/profile/page.tsx` ou fichiers de traduction

Ajouter les traductions nécessaires:
- "Manage My Subscription"
- "Manage Subscription"
- "Your active subscription"
- "No active subscription"
- Messages d'erreur
- Labels des actions

---

## Phase 3: Fonctionnalités Avancées

### 3.1 Gestion du retour depuis Stripe Portal

**Comportement attendu:**
- Quand l'utilisateur revient du Stripe Portal, recharger les données d'abonnement
- Afficher un message de succès si des modifications ont été effectuées
- Gérer les erreurs potentielles

**Implémentation:**
- Utiliser `useSearchParams()` pour détecter `?portal_return=true`
- Utiliser `queryClient.invalidateQueries()` pour recharger les données
- Afficher un toast/alert de confirmation

### 3.2 États de chargement et erreurs

**Gérer:**
- Loading state pendant la récupération des données
- Erreur 404 (pas d'abonnement) vs autres erreurs
- Erreur lors de la création de la session portal
- Message si l'utilisateur n'a pas de customer Stripe

### 3.3 Affichage conditionnel

**Logique:**
- Si abonnement actif → Afficher détails + bouton "Manage"
- Si abonnement annulé (cancel_at_period_end) → Afficher message + bouton "Resume"
- Si aucun abonnement → Afficher CTA vers `/pricing`
- Si statut trial → Afficher badge trial + informations

---

## Phase 4: Intégration Stripe Portal

### 4.1 Configuration Stripe Portal

**Vérifier dans Stripe Dashboard:**
- Le portail client est activé
- Les fonctionnalités disponibles:
  - Gestion de la méthode de paiement
  - Téléchargement des factures
  - Historique des paiements
  - Annulation/résiliation d'abonnement
  - Mise à niveau/rétrogradation de plan

### 4.2 Test du flux complet

**Scénarios à tester:**
1. Utilisateur avec abonnement actif → Clic sur "Manage" → Redirection vers Stripe → Retour → Données mises à jour
2. Utilisateur sans abonnement → Message approprié
3. Utilisateur avec abonnement annulé → Possibilité de reprendre
4. Erreurs (pas de customer Stripe, erreur API, etc.)

---

## Phase 5: Améliorations UX/UI

### 5.1 Design cohérent

**Alignement avec le design existant:**
- Utiliser les composants UI existants (`Card`, `Button`, `Alert`, etc.)
- Respecter les couleurs ARISE (arise-deep-teal-alt, arise-gold-alt)
- Cohérence avec le reste de la page profile

### 5.2 Responsive design

**Points d'attention:**
- Layout responsive pour mobile
- Tableaux de paiements adaptés mobile
- Boutons et actions accessibles sur tous les écrans

### 5.3 Accessibilité

**Considérations:**
- Labels ARIA appropriés
- Navigation au clavier
- Contraste des couleurs
- Messages d'erreur clairs

---

## Phase 6: Tests et Validation

### 6.1 Tests fonctionnels

**Checklist:**
- [ ] Affichage de l'abonnement actif
- [ ] Affichage correct si aucun abonnement
- [ ] Bouton "Manage My Subscription" fonctionne
- [ ] Redirection vers Stripe Portal
- [ ] Retour depuis Stripe Portal
- [ ] Rechargement des données après retour
- [ ] Affichage de l'historique des paiements
- [ ] Annulation d'abonnement
- [ ] Reprise d'abonnement
- [ ] Gestion des erreurs

### 6.2 Tests d'intégration

**Scénarios:**
- Test avec un utilisateur ayant un abonnement actif
- Test avec un utilisateur sans abonnement
- Test avec différents statuts d'abonnement (active, trial, cancelled)
- Test de la synchronisation avec Stripe

### 6.3 Tests de régression

**Vérifier:**
- La page profile fonctionne toujours correctement
- Les autres fonctionnalités ne sont pas affectées
- La navigation et les onglets fonctionnent

---

## Structure des Fichiers

```
apps/web/src/
├── app/[locale]/profile/
│   └── page.tsx                    # Modifier l'onglet subscription
├── components/
│   └── profile/
│       └── SubscriptionManagement.tsx  # Nouveau composant
└── lib/
    └── query/
        └── queries.ts              # Ajouter useCreatePortalSession
```

---

## Détails Techniques

### Format de données Subscription (Backend)

```typescript
interface Subscription {
  id: string;
  user_id: number;
  plan_id: number;
  plan: {
    id: number;
    name: string;
    amount: number;
    currency: string;
    interval: 'MONTH' | 'YEAR';
  };
  status: 'ACTIVE' | 'TRIALING' | 'CANCELLED' | 'EXPIRED' | 'INCOMPLETE';
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string;  // ISO datetime
  current_period_end: string;    // ISO datetime
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
}
```

### Format de données Payment (Backend)

```typescript
interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  payment_method: string;
  transaction_id?: string;
  date: string;  // ISO datetime
}
```

---

## Étapes d'Implémentation Détaillées

### Étape 1: Ajouter le hook pour Stripe Portal
1. Modifier `apps/web/src/lib/query/queries.ts`
2. Ajouter `useCreatePortalSession()`

### Étape 2: Créer le composant SubscriptionManagement
1. Créer `apps/web/src/components/profile/SubscriptionManagement.tsx`
2. Implémenter la logique d'affichage conditionnel
3. Intégrer les hooks React Query
4. Ajouter le bouton "Manage My Subscription"
5. Gérer les états de chargement et erreurs

### Étape 3: Modifier la page Profile
1. Importer `SubscriptionManagement`
2. Remplacer le contenu statique de l'onglet subscription
3. Ajouter la gestion des paramètres URL
4. Gérer le retour depuis Stripe Portal

### Étape 4: Styling et UX
1. Adapter le design au style ARISE
2. Assurer la responsivité
3. Ajouter les feedbacks visuels (toasts, alerts)

### Étape 5: Tests
1. Tests locaux avec données de test
2. Tests avec un compte réel Stripe (mode test)
3. Validation avec l'équipe

---

## Points d'Attention

### ⚠️ Gestion des erreurs
- Si l'utilisateur n'a pas de `stripe_customer_id`, afficher un message approprié
- Gérer les erreurs réseau
- Gérer les erreurs d'authentification

### ⚠️ Performance
- Utiliser React Query pour la mise en cache
- Éviter les rechargements inutiles
- Lazy loading du composant si nécessaire

### ⚠️ Sécurité
- Vérifier que l'utilisateur est authentifié
- S'assurer que les endpoints nécessitent l'authentification
- Valider les URLs de retour du portail Stripe

---

## Timeline Estimée

- **Phase 1 (Analyse):** ✅ Déjà complété
- **Phase 2 (Implémentation Frontend):** 4-6 heures
- **Phase 3 (Fonctionnalités Avancées):** 2-3 heures
- **Phase 4 (Intégration Stripe):** 1-2 heures
- **Phase 5 (Améliorations UX/UI):** 2-3 heures
- **Phase 6 (Tests):** 2-3 heures

**Total estimé:** 11-17 heures

---

## Prochaines Étapes

1. ✅ Créer ce plan d'implémentation
2. ⏳ Réviser le plan avec l'équipe
3. ⏳ Commencer l'implémentation par Phase 2
4. ⏳ Tests et validation
5. ⏳ Déploiement

---

## Références

- Documentation Stripe Customer Portal: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
- Composant SubscriptionCard existant: `apps/web/src/components/subscriptions/SubscriptionCard.tsx`
- Page Subscriptions existante: `apps/web/src/app/[locale]/subscriptions/page.tsx`
- API Backend: `backend/app/api/v1/endpoints/subscriptions.py`
- Service Stripe: `backend/app/services/stripe_service.py`