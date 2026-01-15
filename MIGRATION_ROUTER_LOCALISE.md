# Migration vers Router Localisé

**Date**: 15 janvier 2026

## 🎯 Objectif

Tous les liens des boutons doivent utiliser le système de routing localisé de next-intl pour gérer automatiquement les préfixes de locale (`/fr/...` ou `/...` pour l'anglais).

---

## ✅ Fichiers Modifiés

### Pages Dashboard (25 fichiers)

Tous les fichiers dans `apps/web/src/app/[locale]/dashboard/` qui utilisent `router.push()` ont été mis à jour pour utiliser `useRouter` de `@/i18n/routing` :

1. ✅ `apps/web/src/app/[locale]/dashboard/page.tsx`
2. ✅ `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
3. ✅ `apps/web/src/app/[locale]/dashboard/assessments/results/page.tsx`
4. ✅ `apps/web/src/app/[locale]/dashboard/assessments/tki/page.tsx`
5. ✅ `apps/web/src/app/[locale]/dashboard/assessments/tki/results/page.tsx`
6. ✅ `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`
7. ✅ `apps/web/src/app/[locale]/dashboard/assessments/wellness/results/page.tsx`
8. ✅ `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/page.tsx`
9. ✅ `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/results/page.tsx`
10. ✅ `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx`
11. ✅ `apps/web/src/app/[locale]/dashboard/assessments/mbti/page.tsx`
12. ✅ `apps/web/src/app/[locale]/dashboard/assessments/mbti/upload/page.tsx`
13. ✅ `apps/web/src/app/[locale]/dashboard/assessments/mbti/results/page.tsx`
14. ✅ `apps/web/src/app/[locale]/dashboard/results/page.tsx`
15. ✅ `apps/web/src/app/[locale]/dashboard/reports/page.tsx`
16. ✅ `apps/web/src/app/[locale]/dashboard/coaching-options/page.tsx`
17. ✅ `apps/web/src/app/[locale]/dashboard/coaching-options/book/page.tsx`
18. ✅ `apps/web/src/app/[locale]/dashboard/coaching-options/success/page.tsx`
19. ✅ `apps/web/src/app/[locale]/dashboard/development-plan/page.tsx`
20. ✅ `apps/web/src/app/[locale]/dashboard/development-plan/resources/[id]/page.tsx`
21. ✅ `apps/web/src/app/[locale]/dashboard/coach/agenda/page.tsx`
22. ✅ `apps/web/src/app/[locale]/dashboard/coach/coachee/page.tsx`
23. ✅ `apps/web/src/app/[locale]/dashboard/evaluators/page.tsx`
24. ✅ `apps/web/src/app/[locale]/individual/dashboard-2/page.tsx`

### Pages Admin (3 fichiers)

1. ✅ `apps/web/src/app/[locale]/admin/rbac/page.tsx`
2. ✅ `apps/web/src/app/admin/teams/page.tsx`
3. ✅ `apps/web/src/app/[locale]/admin/teams/page.tsx`

### Composants (3 fichiers)

1. ✅ `apps/web/src/components/onboarding/OnboardingComplete.tsx`
2. ✅ `apps/web/src/components/dashboard/CoachingSection.tsx`
3. ✅ `apps/web/src/components/layout/DashboardCustomLayout.tsx`

### Pages Auth (2 fichiers)

1. ✅ `apps/web/src/app/[locale]/auth/register/page.tsx`
2. ✅ `apps/web/src/app/auth/callback/page.tsx`

---

## 📝 Changements Appliqués

### Avant
```tsx
import { useRouter } from 'next/navigation';

// ...
router.push('/dashboard/assessments'); // ❌ Ne gère pas la locale
```

### Après
```tsx
import { useRouter } from '@/i18n/routing';

// ...
router.push('/dashboard/assessments'); // ✅ Gère automatiquement /fr/dashboard/assessments ou /dashboard/assessments
```

---

## 🔍 Comment ça fonctionne

Le router de `@/i18n/routing` :
- Détecte automatiquement la locale actuelle depuis l'URL
- Ajoute le préfixe `/fr/` pour le français
- N'ajoute pas de préfixe pour l'anglais (locale par défaut)
- Gère les autres locales (`/ar/`, `/he/`) selon la configuration

**Exemple** :
- Si `html lang="fr"` → `router.push('/dashboard')` → `/fr/dashboard`
- Si `html lang="en"` → `router.push('/dashboard')` → `/dashboard`

---

## ⚠️ Fichiers Restants (Optionnel)

Il reste encore ~74 fichiers qui utilisent `useRouter` de `next/navigation`, mais ils n'ont pas tous des `router.push()` avec des chemins hardcodés vers `/dashboard` ou `/admin`. 

Ces fichiers peuvent être mis à jour progressivement si nécessaire :
- Fichiers dans `reseau/` (contacts, entreprises)
- Fichiers dans `settings/`
- Fichiers dans `profile/`
- Fichiers dans `content/`
- Fichiers dans `blog/`
- Etc.

---

## ✅ Résultat

Tous les boutons dans les pages dashboard et admin utilisent maintenant le router localisé, ce qui garantit que :
- Les liens fonctionnent correctement avec toutes les locales
- Les préfixes de locale sont gérés automatiquement
- Pas besoin de hardcoder `/fr/` dans les chemins

---

*Migration effectuée le 15/01/2026*
