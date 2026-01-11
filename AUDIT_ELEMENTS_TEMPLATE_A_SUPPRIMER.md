# 🔍 Audit Complet des Éléments Template à Supprimer

**Date:** 2025-01-26  
**Projet:** ARISE  
**Objectif:** Identifier tous les éléments liés au template qui peuvent être retirés du projet

---

## 📋 Résumé Exécutif

Ce document liste tous les éléments provenant du template original qui ne sont **pas nécessaires** pour le projet ARISE. Ces éléments peuvent être supprimés pour simplifier le codebase et réduire la surface d'attaque.

### Statistiques
- **Pages de showcase de composants:** ~35 pages
- **Pages d'exemples/démo:** ~12 pages
- **Pages de test/développement:** ~10 pages
- **Pages CMS/Blog/ERP non utilisées:** ~20 pages
- **Total estimé:** ~77 pages à supprimer

---

## 🎯 Catégorie 1: Pages de Showcase de Composants (`/components/*`)

**Type:** ⚪ Component Showcase - Pages de démonstration uniquement  
**Priorité:** 🔴 Haute - À supprimer immédiatement

Toutes ces pages servent uniquement à démontrer les composants en action. Elles n'ont aucune fonctionnalité réelle et ne sont pas nécessaires en production.

### Pages à Supprimer

1. **`/components`** - Page d'aperçu des composants
   - `apps/web/src/app/[locale]/components/page.tsx`
   - `apps/web/src/app/[locale]/components/ComponentsContent.tsx`

2. **`/components/data`** - Composants de données
   - `apps/web/src/app/[locale]/components/data/page.tsx`
   - `apps/web/src/app/[locale]/components/data/DataContent.tsx`

3. **`/components/feedback`** - Composants de feedback
   - `apps/web/src/app/[locale]/components/feedback/page.tsx`
   - `apps/web/src/app/[locale]/components/feedback/FeedbackContent.tsx`

4. **`/components/forms`** - Composants de formulaires
   - `apps/web/src/app/[locale]/components/forms/page.tsx`
   - `apps/web/src/app/[locale]/components/forms/FormsContent.tsx`

5. **`/components/navigation`** - Composants de navigation
   - `apps/web/src/app/[locale]/components/navigation/page.tsx`
   - `apps/web/src/app/[locale]/components/navigation/NavigationContent.tsx`

6. **`/components/theme`** - Composants de thème
   - `apps/web/src/app/[locale]/components/theme/page.tsx`
   - `apps/web/src/app/[locale]/components/theme/ThemeContent.tsx`

7. **`/components/utils`** - Composants utilitaires
   - `apps/web/src/app/[locale]/components/utils/page.tsx`
   - `apps/web/src/app/[locale]/components/utils/UtilsContent.tsx`

8. **`/components/charts`** - Composants de graphiques
   - `apps/web/src/app/[locale]/components/charts/page.tsx`
   - `apps/web/src/app/[locale]/components/charts/ChartsContent.tsx`

9. **`/components/media`** - Composants média
   - `apps/web/src/app/[locale]/components/media/page.tsx`
   - `apps/web/src/app/[locale]/components/media/MediaContent.tsx`

10. **`/components/auth`** - Composants d'authentification
    - `apps/web/src/app/[locale]/components/auth/page.tsx`
    - `apps/web/src/app/[locale]/components/auth/AuthComponentsContent.tsx`

11. **`/components/performance`** - Composants de performance
    - `apps/web/src/app/[locale]/components/performance/page.tsx`
    - `apps/web/src/app/[locale]/components/performance/PerformanceContent.tsx`

12. **`/components/billing`** - Composants de facturation
    - `apps/web/src/app/[locale]/components/billing/page.tsx`
    - `apps/web/src/app/[locale]/components/billing/BillingComponentsContent.tsx`

13. **`/components/settings`** - Composants de paramètres
    - `apps/web/src/app/[locale]/components/settings/page.tsx`
    - `apps/web/src/app/[locale]/components/settings/SettingsComponentsContent.tsx`

14. **`/components/activity`** - Composants d'activité
    - `apps/web/src/app/[locale]/components/activity/page.tsx`
    - `apps/web/src/app/[locale]/components/activity/ActivityComponentsContent.tsx`

15. **`/components/notifications`** - Composants de notifications
    - `apps/web/src/app/[locale]/components/notifications/page.tsx`
    - `apps/web/src/app/[locale]/components/notifications/NotificationsComponentsContent.tsx`

16. **`/components/analytics`** - Composants d'analytique
    - `apps/web/src/app/[locale]/components/analytics/page.tsx`
    - `apps/web/src/app/[locale]/components/analytics/AnalyticsComponentsContent.tsx`

17. **`/components/integrations`** - Composants d'intégrations
    - `apps/web/src/app/[locale]/components/integrations/page.tsx`
    - `apps/web/src/app/[locale]/components/integrations/IntegrationsComponentsContent.tsx`

18. **`/components/workflow`** - Composants de workflow
    - `apps/web/src/app/[locale]/components/workflow/page.tsx`
    - `apps/web/src/app/[locale]/components/workflow/WorkflowComponentsContent.tsx`

19. **`/components/collaboration`** - Composants de collaboration
    - `apps/web/src/app/[locale]/components/collaboration/page.tsx`
    - `apps/web/src/app/[locale]/components/collaboration/CollaborationComponentsContent.tsx`

20. **`/components/advanced`** - Composants avancés
    - `apps/web/src/app/[locale]/components/advanced/page.tsx`
    - `apps/web/src/app/[locale]/components/advanced/AdvancedComponentsContent.tsx`

21. **`/components/monitoring`** - Composants de monitoring
    - `apps/web/src/app/[locale]/components/monitoring/page.tsx`
    - `apps/web/src/app/[locale]/components/monitoring/MonitoringComponentsContent.tsx`

22. **`/components/errors`** - Composants d'erreurs
    - `apps/web/src/app/[locale]/components/errors/page.tsx`
    - `apps/web/src/app/[locale]/components/errors/ErrorComponentsContent.tsx`

23. **`/components/i18n`** - Composants d'internationalisation
    - `apps/web/src/app/[locale]/components/i18n/page.tsx`
    - `apps/web/src/app/[locale]/components/i18n/I18nComponentsContent.tsx`

24. **`/components/admin`** - Composants d'administration
    - `apps/web/src/app/[locale]/components/admin/page.tsx`
    - `apps/web/src/app/[locale]/components/admin/AdminComponentsContent.tsx`

25. **`/components/layout`** - Composants de layout
    - `apps/web/src/app/[locale]/components/layout/page.tsx`
    - `apps/web/src/app/[locale]/components/layout/LayoutComponentsContent.tsx`

26. **`/components/ai`** - Composants IA
    - `apps/web/src/app/[locale]/components/ai/page.tsx`
    - `apps/web/src/app/[locale]/components/ai/AIComponentsContent.tsx`

27. **`/components/blog`** - Composants de blog
    - `apps/web/src/app/[locale]/components/blog/page.tsx`
    - `apps/web/src/app/[locale]/components/blog/BlogComponentsContent.tsx`

28. **`/components/cms`** - Composants CMS
    - `apps/web/src/app/[locale]/components/cms/page.tsx`
    - `apps/web/src/app/[locale]/components/cms/CMSComponentsContent.tsx`

29. **`/components/content`** - Composants de contenu
    - `apps/web/src/app/[locale]/components/content/page.tsx`
    - `apps/web/src/app/[locale]/components/content/ContentComponentsContent.tsx`

30. **`/components/templates`** - Composants de templates
    - `apps/web/src/app/[locale]/components/templates/page.tsx`
    - `apps/web/src/app/[locale]/components/templates/TemplatesComponentsContent.tsx`

31. **`/components/email-templates`** - Composants de templates email
    - `apps/web/src/app/components/email-templates/EmailTemplatesComponentsContent.tsx`
    - (Vérifier si page.tsx existe)

32. **`/components/erp`** - Composants ERP
    - `apps/web/src/app/[locale]/components/erp/page.tsx`
    - `apps/web/src/app/[locale]/components/erp/ERPComponentsContent.tsx`

33. **`/components/client`** - Composants client portal
    - `apps/web/src/app/[locale]/components/client/page.tsx`
    - `apps/web/src/app/[locale]/components/client/ClientComponentsContent.tsx`

34. **`/components/subscriptions`** - Composants d'abonnements
    - `apps/web/src/app/[locale]/components/subscriptions/page.tsx`
    - `apps/web/src/app/[locale]/components/subscriptions/SubscriptionsComponentsContent.tsx`

35. **`/components/surveys`** - Composants de sondages
    - `apps/web/src/app/[locale]/components/surveys/page.tsx`
    - `apps/web/src/app/[locale]/components/surveys/SurveysComponentsContent.tsx`

36. **`/components/tags`** - Composants de tags
    - `apps/web/src/app/[locale]/components/tags/page.tsx`
    - `apps/web/src/app/[locale]/components/tags/TagsComponentsContent.tsx`

37. **`/components/versions`** - Composants de versions
    - `apps/web/src/app/[locale]/components/versions/page.tsx`
    - `apps/web/src/app/[locale]/components/versions/VersionsComponentsContent.tsx`

38. **`/components/seo`** - Composants SEO
    - `apps/web/src/app/[locale]/components/seo/page.tsx`
    - `apps/web/src/app/[locale]/components/seo/SEOComponentsContent.tsx`

39. **`/components/sharing`** - Composants de partage
    - `apps/web/src/app/[locale]/components/sharing/page.tsx`
    - `apps/web/src/app/[locale]/components/sharing/SharingComponentsContent.tsx`

40. **`/components/profile`** - Composants de profil
    - `apps/web/src/app/[locale]/components/profile/page.tsx`
    - `apps/web/src/app/[locale]/components/profile/ProfileComponentsContent.tsx`

41. **`/components/rbac`** - Composants RBAC
    - `apps/web/src/app/[locale]/components/rbac/page.tsx`
    - `apps/web/src/app/[locale]/components/rbac/RBACComponentsContent.tsx`

42. **`/components/search`** - Composants de recherche
    - `apps/web/src/app/[locale]/components/search/page.tsx`
    - `apps/web/src/app/[locale]/components/search/SearchComponentsContent.tsx`

43. **`/components/favorites`** - Composants de favoris
    - `apps/web/src/app/[locale]/components/favorites/page.tsx`
    - `apps/web/src/app/[locale]/components/favorites/FavoritesComponentsContent.tsx`

44. **`/components/page-builder`** - Composants de page builder
    - `apps/web/src/app/[locale]/components/page-builder/page.tsx`
    - `apps/web/src/app/[locale]/components/page-builder/PageBuilderComponentsContent.tsx`

45. **`/components/sections`** - Composants de sections
    - `apps/web/src/app/[locale]/components/sections/page.tsx`
    - `apps/web/src/app/[locale]/components/sections/SectionsComponentsContent.tsx`

46. **`/components/theme-showcase`** - Showcase de thèmes
    - `apps/web/src/app/[locale]/components/theme-showcase/page.tsx`
    - `apps/web/src/app/[locale]/components/theme-showcase/[style]/page.tsx`
    - `apps/web/src/app/[locale]/components/theme-showcase/[style]/DesignStyleContent.tsx`

47. **`/components/help`** - Composants d'aide
    - `apps/web/src/app/[locale]/components/help/page.tsx`
    - `apps/web/src/app/[locale]/components/help/HelpComponentsContent.tsx`

48. **`/components/marketing`** - Composants marketing
    - `apps/web/src/app/[locale]/components/marketing/page.tsx`
    - `apps/web/src/app/[locale]/components/marketing/MarketingComponentsContent.tsx`

49. **`/components/providers`** - Composants providers
    - `apps/web/src/app/[locale]/components/providers/page.tsx`
    - `apps/web/src/app/[locale]/components/providers/ProvidersComponentsContent.tsx`

### Références à Supprimer

- **Header/Footer:** Liens vers `/components` dans:
  - `apps/web/src/components/layout/Header.tsx`
  - `apps/web/src/components/layout/Footer.tsx`
  - `apps/web/src/components/landing/Footer.tsx`

- **Navigation:** Liens dans:
  - `apps/web/src/components/sections/Hero.tsx`
  - `apps/web/src/components/sections/CTA.tsx`
  - `apps/web/src/app/not-found.tsx`
  - `apps/web/src/app/[locale]/not-found.tsx`
  - `apps/web/src/app/docs/page.tsx`
  - `apps/web/src/app/[locale]/docs/page.tsx`

- **API Manifest:** Entrées dans:
  - `apps/web/public/api-manifest.json`

- **Sitemap:** Entrées dans:
  - `apps/web/src/config/sitemap.ts`

- **Scripts:** Références dans:
  - `apps/web/scripts/extract-static-pages.js`

---

## 🎯 Catégorie 2: Pages d'Exemples/Démonstration (`/examples/*`)

**Type:** 🔴 Test/Demo - Pages de démonstration  
**Priorité:** 🔴 Haute - À supprimer immédiatement

### Pages à Supprimer

1. **`/examples`** - Page d'aperçu des exemples
   - `apps/web/src/app/[locale]/examples/page.tsx`
   - `apps/web/src/app/[locale]/examples/README.md`

2. **`/examples/dashboard`** - Exemple de dashboard
   - `apps/web/src/app/[locale]/examples/dashboard/page.tsx`

3. **`/examples/auth`** - Exemples d'authentification
   - `apps/web/src/app/[locale]/examples/auth/page.tsx`

4. **`/examples/crud`** - Exemples CRUD
   - `apps/web/src/app/[locale]/examples/crud/page.tsx`

5. **`/examples/data-table`** - Exemple de tableau de données
   - `apps/web/src/app/[locale]/examples/data-table/page.tsx`

6. **`/examples/file-upload`** - Exemple d'upload de fichiers
   - `apps/web/src/app/[locale]/examples/file-upload/page.tsx`

7. **`/examples/modal`** - Exemples de modales
   - `apps/web/src/app/[locale]/examples/modal/page.tsx`

8. **`/examples/onboarding`** - Exemple d'onboarding
   - `apps/web/src/app/[locale]/examples/onboarding/page.tsx`

9. **`/examples/search`** - Exemple de recherche
   - `apps/web/src/app/[locale]/examples/search/page.tsx`

10. **`/examples/settings`** - Exemple de paramètres
    - `apps/web/src/app/[locale]/examples/settings/page.tsx`

11. **`/examples/toast`** - Exemples de toasts
    - `apps/web/src/app/[locale]/examples/toast/page.tsx`

12. **`/examples/api-fetching`** - Exemples de récupération API
    - `apps/web/src/app/[locale]/examples/api-fetching/page.tsx`

### Références à Supprimer

- **Documentation:** Liens dans:
  - `apps/web/src/app/docs/page.tsx`
  - `apps/web/src/app/[locale]/docs/page.tsx`

- **API Manifest:** Entrées dans `apps/web/public/api-manifest.json`

- **Sitemap:** Entrées dans `apps/web/src/config/sitemap.ts`

---

## 🎯 Catégorie 3: Pages de Test et Développement

**Type:** 🔴 Test/Demo - Pages de test uniquement  
**Priorité:** 🔴 Haute - À supprimer en production

### Pages à Supprimer

1. **`/test-sentry`** - Test Sentry
   - `apps/web/src/app/test-sentry/page.tsx`
   - `apps/web/src/app/[locale]/test-sentry/page.tsx`

2. **`/sentry/test`** - Test Sentry (redirection)
   - `apps/web/src/app/sentry/test/page.tsx`

3. **`/sentry/testing`** - Test Sentry (page principale)
   - `apps/web/src/app/[locale]/sentry/testing/page.tsx`
   - `apps/web/src/app/[locale]/sentry/layout.tsx`

4. **`/db/test`** - Test de base de données
   - `apps/web/src/app/[locale]/db/test/page.tsx` (si existe)

5. **`/email/test`** - Test email (redirection)
   - `apps/web/src/app/email/test/page.tsx`

6. **`/email/testing`** - Test email (page principale)
   - `apps/web/src/app/[locale]/email/testing/page.tsx` (si existe)

7. **`/ai/test`** - Test AI (redirection)
   - `apps/web/src/app/ai/test/page.tsx`

8. **`/ai/testing`** - Test AI (page principale)
   - `apps/web/src/app/[locale]/ai/testing/page.tsx` (si existe)

9. **`/ai/chat`** - Chat AI (si c'est juste pour test)
   - `apps/web/src/app/[locale]/ai/chat/page.tsx` (vérifier usage)

10. **`/upload`** - Test d'upload de fichiers
    - `apps/web/src/app/upload/page.tsx`
    - `apps/web/src/app/upload/layout.tsx`
    - `apps/web/src/app/[locale]/upload/page.tsx`
    - `apps/web/src/app/[locale]/upload/layout.tsx`

11. **`/check-my-superadmin-status`** - Vérification statut super admin
    - `apps/web/src/app/[locale]/check-my-superadmin-status/page.tsx` (si existe)

12. **`/test/api-connections`** - Test des connexions API
    - `apps/web/src/app/[locale]/test/api-connections/page.tsx` (si existe)
    - `apps/web/src/app/[locale]/test/api-connections/services/endpointTester.ts`

### Références à Supprimer

- **Admin Panel:** Liens dans:
  - `apps/web/src/app/[locale]/admin/AdminContent.tsx`
  - `apps/web/src/app/admin/AdminContent.tsx`
  - `apps/web/src/app/dashboard/page.tsx`

---

## 🎯 Catégorie 4: Pages CMS/Blog (Non Utilisées)

**Type:** 🔵 DB + Backend - Mais non utilisées dans ARISE  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Blog à Supprimer (si non utilisées)

1. **`/blog`** - Liste des articles de blog
   - `apps/web/src/app/[locale]/blog/page.tsx`

2. **`/blog/[slug]`** - Article de blog individuel
   - `apps/web/src/app/[locale]/blog/[slug]/page.tsx`

3. **`/blog/archive/[year]`** - Archive par année
   - `apps/web/src/app/[locale]/blog/archive/[year]/page.tsx`

4. **`/blog/author/[author]`** - Articles par auteur
   - `apps/web/src/app/[locale]/blog/author/[author]/page.tsx`

5. **`/blog/category/[category]`** - Articles par catégorie
   - `apps/web/src/app/[locale]/blog/category/[category]/page.tsx`

6. **`/blog/tag/[tag]`** - Articles par tag
   - `apps/web/src/app/[locale]/blog/tag/[tag]/page.tsx`

7. **`/blog/rss`** - Flux RSS
   - `apps/web/src/app/[locale]/blog/rss/route.ts`

8. **`/blog/sitemap`** - Sitemap du blog
   - `apps/web/src/app/[locale]/blog/sitemap/route.ts`

### Pages CMS à Supprimer (si non utilisées)

1. **`/content`** - Dashboard de contenu
   - `apps/web/src/app/[locale]/content/page.tsx` (si existe)

2. **`/content/posts`** - Gestion des articles
   - `apps/web/src/app/[locale]/content/posts/page.tsx`
   - `apps/web/src/app/[locale]/content/posts/[id]/edit/page.tsx`

3. **`/content/pages`** - Gestion des pages
   - `apps/web/src/app/[locale]/content/pages/page.tsx`
   - `apps/web/src/app/[locale]/content/pages/[slug]/edit/page.tsx`
   - `apps/web/src/app/[locale]/content/pages/[slug]/preview/page.tsx`

4. **`/content/media`** - Bibliothèque média
   - `apps/web/src/app/[locale]/content/media/page.tsx` (si existe)

5. **`/content/categories`** - Gestion des catégories
   - `apps/web/src/app/[locale]/content/categories/page.tsx` (si existe)

6. **`/content/tags`** - Gestion des tags
   - `apps/web/src/app/[locale]/content/tags/page.tsx` (si existe)

7. **`/content/templates`** - Templates de contenu
   - `apps/web/src/app/[locale]/content/templates/page.tsx` (si existe)

8. **`/content/schedule`** - Contenu programmé
   - `apps/web/src/app/[locale]/content/schedule/page.tsx` (si existe)

9. **`/pages/[slug]`** - Rendu dynamique de pages
   - `apps/web/src/app/[locale]/pages/[slug]/page.tsx` (si existe)

### Références à Supprimer

- **Navigation:** Liens dans `apps/web/src/lib/navigation/index.tsx` (section "Contenu")
- **Sitemap:** Entrées dans `apps/web/src/config/sitemap.ts`
- **API Manifest:** Entrées dans `apps/web/public/api-manifest.json`

---

## 🎯 Catégorie 5: Pages ERP (Non Utilisées)

**Type:** 🔵 DB + Backend - Mais non utilisées dans ARISE  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages ERP à Supprimer (si non utilisées)

1. **`/erp/dashboard`** - Dashboard ERP
   - `apps/web/src/app/[locale]/erp/dashboard/page.tsx`

2. **`/erp/clients`** - Gestion des clients
   - `apps/web/src/app/[locale]/erp/clients/page.tsx`

3. **`/erp/orders`** - Gestion des commandes
   - `apps/web/src/app/[locale]/erp/orders/page.tsx`

4. **`/erp/invoices`** - Gestion des factures
   - `apps/web/src/app/[locale]/erp/invoices/page.tsx`

5. **`/erp/inventory`** - Gestion de l'inventaire
   - `apps/web/src/app/[locale]/erp/inventory/page.tsx`

6. **`/erp/reports`** - Rapports ERP
   - `apps/web/src/app/[locale]/erp/reports/page.tsx`

7. **`/erp/layout.tsx`** - Layout ERP
   - `apps/web/src/app/[locale]/erp/layout.tsx`

### Références à Supprimer

- **Admin Panel:** Liens dans:
  - `apps/web/src/app/[locale]/admin/AdminContent.tsx`
  - `apps/web/src/app/admin/AdminContent.tsx`

- **Navigation:** Vérifier `apps/web/src/lib/navigation/index.tsx`

- **Sitemap:** Entrées dans `apps/web/src/config/sitemap.ts`

---

## 🎯 Catégorie 6: Pages Client Portal (Non Utilisées)

**Type:** 🔵 DB + Backend - Mais non utilisées dans ARISE  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Client Portal à Supprimer (si non utilisées)

1. **`/client/dashboard`** - Dashboard client
   - `apps/web/src/app/[locale]/client/dashboard/page.tsx`

2. **`/client/projects`** - Projets client
   - `apps/web/src/app/[locale]/client/projects/page.tsx`

3. **`/client/invoices`** - Factures client
   - `apps/web/src/app/[locale]/client/invoices/page.tsx`

4. **`/client/tickets`** - Tickets client
   - `apps/web/src/app/[locale]/client/tickets/page.tsx`

### Références à Supprimer

- **Sitemap:** Entrées dans `apps/web/src/config/sitemap.ts`

---

## 🎯 Catégorie 7: Pages Help Center (Non Utilisées)

**Type:** 🟡 Static ou 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Help à Supprimer (si non utilisées)

1. **`/help`** - Centre d'aide
   - `apps/web/src/app/[locale]/help/page.tsx` (si existe)

2. **`/help/faq`** - FAQ
   - `apps/web/src/app/[locale]/help/faq/page.tsx` (si existe)

3. **`/help/guides`** - Guides utilisateur
   - `apps/web/src/app/[locale]/help/guides/page.tsx` (si existe)

4. **`/help/videos`** - Tutoriels vidéo
   - `apps/web/src/app/[locale]/help/videos/page.tsx` (si existe)

5. **`/help/contact`** - Contact support
   - `apps/web/src/app/[locale]/help/contact/page.tsx` (si existe)

6. **`/help/tickets`** - Tickets de support
   - `apps/web/src/app/[locale]/help/tickets/page.tsx` (si existe)
   - `apps/web/src/app/[locale]/help/tickets/[id]/page.tsx` (si existe)

### Références à Supprimer

- **Footer:** Liens dans:
  - `apps/web/src/components/layout/DashboardFooter.tsx`
  - `apps/web/src/components/landing/Footer.tsx`
  - `apps/web/src/components/help/HelpCenter.tsx`
  - `apps/web/src/app/[locale]/contact/page.tsx`

---

## 🎯 Catégorie 8: Pages Monitoring (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Monitoring à Supprimer (si non utilisées)

1. **`/monitoring`** - Dashboard de monitoring
   - `apps/web/src/app/[locale]/monitoring/page.tsx` (si existe)

2. **`/monitoring/performance`** - Métriques de performance
   - `apps/web/src/app/[locale]/monitoring/performance/page.tsx` (si existe)

3. **`/monitoring/errors`** - Suivi des erreurs
   - `apps/web/src/app/[locale]/monitoring/errors/page.tsx` (si existe)

### Références à Supprimer

- **Hero Section:** Liens dans `apps/web/src/components/sections/Hero.tsx`
- **Test Pages:** Liens dans `apps/web/src/app/test-sentry/page.tsx`

---

## 🎯 Catégorie 9: Pages SEO/Menus (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages à Supprimer (si non utilisées)

1. **`/seo`** - Gestion SEO
   - `apps/web/src/app/[locale]/seo/page.tsx` (si existe)

2. **`/sitemap`** - Visualiseur de sitemap
   - `apps/web/src/app/[locale]/sitemap/page.tsx` (si existe)

3. **`/menus`** - Gestion des menus
   - `apps/web/src/app/[locale]/menus/page.tsx` (si existe)

---

## 🎯 Catégorie 10: Pages Dashboard Template (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Dashboard à Supprimer (si non utilisées)

1. **`/dashboard/analytics`** - Analytics dashboard
   - `apps/web/src/app/[locale]/dashboard/analytics/page.tsx`

2. **`/dashboard/activity`** - Feed d'activité
   - `apps/web/src/app/[locale]/dashboard/activity/page.tsx`

3. **`/dashboard/insights`** - Insights et rapports
   - `apps/web/src/app/[locale]/dashboard/insights/page.tsx`

4. **`/dashboard/projects`** - Gestion de projets
   - `apps/web/src/app/[locale]/dashboard/projects/page.tsx`

5. **`/dashboard/become-superadmin`** - Demande super admin
   - `apps/web/src/app/[locale]/dashboard/become-superadmin/page.tsx`

### ⚠️ Pages Dashboard à CONSERVER (Utilisées par ARISE)

- ✅ `/dashboard` - Dashboard principal
- ✅ `/dashboard/assessments` - Assessments (Wellness, TKI, 360°, MBTI)
- ✅ `/dashboard/results` - Résultats
- ✅ `/dashboard/reports` - Rapports (si utilisé)
- ✅ `/dashboard/development` - Plan de développement
- ✅ `/dashboard/reseau` - Réseau (entreprises, contacts, témoignages)
- ✅ `/dashboard/coach` - Coaching
- ✅ `/dashboard/coaching-options` - Options de coaching
- ✅ `/dashboard/evaluators` - Évaluateurs
- ✅ `/dashboard/business` - Business
- ✅ `/dashboard/management` - Management

---

## 🎯 Catégorie 11: Pages Onboarding (Non Utilisées)

**Type:** 🟢 Backend Only ou 🟡 Static  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Onboarding à Supprimer (si non utilisées)

1. **`/onboarding`** - Aperçu onboarding
   - `apps/web/src/app/[locale]/onboarding/page.tsx` (si existe)

2. **`/onboarding/welcome`** - Étape de bienvenue
   - `apps/web/src/app/[locale]/onboarding/welcome/page.tsx` (si existe)

3. **`/onboarding/profile`** - Configuration profil
   - `apps/web/src/app/[locale]/onboarding/profile/page.tsx` (si existe)

4. **`/onboarding/preferences`** - Configuration préférences
   - `apps/web/src/app/[locale]/onboarding/preferences/page.tsx` (si existe)

5. **`/onboarding/team`** - Configuration équipe
   - `apps/web/src/app/[locale]/onboarding/team/page.tsx` (si existe)

6. **`/onboarding/complete`** - Page de complétion
   - `apps/web/src/app/[locale]/onboarding/complete/page.tsx` (si existe)

---

## 🎯 Catégorie 12: Pages Forms/Surveys (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages à Supprimer (si non utilisées)

1. **`/forms`** - Liste des formulaires
   - `apps/web/src/app/[locale]/forms/page.tsx` (si existe)

2. **`/forms/[id]/submissions`** - Soumissions de formulaire
   - `apps/web/src/app/[locale]/forms/[id]/submissions/page.tsx` (si existe)

3. **`/surveys`** - Liste des sondages
   - `apps/web/src/app/[locale]/surveys/page.tsx` (si existe)

4. **`/surveys/[id]/preview`** - Aperçu de sondage
   - `apps/web/src/app/[locale]/surveys/[id]/preview/page.tsx` (si existe)

5. **`/surveys/[id]/results`** - Résultats de sondage
   - `apps/web/src/app/[locale]/surveys/[id]/results/page.tsx` (si existe)

---

## 🎯 Catégorie 13: Pages Subscriptions (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages à Supprimer (si non utilisées)

1. **`/subscriptions`** - Gestion des abonnements
   - `apps/web/src/app/[locale]/subscriptions/page.tsx` (si existe)

2. **`/subscriptions/success`** - Page de succès
   - `apps/web/src/app/subscriptions/success/page.tsx`
   - `apps/web/src/app/[locale]/subscriptions/success/page.tsx`

3. **`/pricing`** - Page de tarification
   - `apps/web/src/app/[locale]/pricing/page.tsx` (si existe et non utilisée)

---

## 🎯 Catégorie 14: Pages Admin Template (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Admin à Supprimer (si non utilisées)

1. **`/admin/statistics`** - Statistiques système
   - `apps/web/src/app/[locale]/admin/statistics/page.tsx` (si existe)

2. **`/admin/themes`** - Gestion des thèmes
   - `apps/web/src/app/[locale]/admin/themes/page.tsx` (si non utilisée)
   - `apps/web/src/app/[locale]/admin/themes/builder/page.tsx` (si non utilisée)

3. **`/admin/tenancy`** - Gestion multi-tenant
   - `apps/web/src/app/[locale]/admin/tenancy/page.tsx` (si existe)

### ⚠️ Pages Admin à CONSERVER (Utilisées par ARISE)

- ✅ `/admin` - Dashboard admin
- ✅ `/admin/users` - Gestion utilisateurs
- ✅ `/admin/teams` - Gestion équipes
- ✅ `/admin/organizations` - Gestion organisations
- ✅ `/admin/invitations` - Gestion invitations
- ✅ `/admin/rbac` - Gestion RBAC
- ✅ `/admin/logs` - Logs système
- ✅ `/admin/settings` - Paramètres système
- ✅ `/admin/plans` - Gestion des plans (si utilisé)
- ✅ `/admin/api-keys` - Gestion clés API (si utilisé)

---

## 🎯 Catégorie 15: Pages Profile/Settings Template (Non Utilisées)

**Type:** 🔵 DB + Backend  
**Priorité:** 🟡 Moyenne - Vérifier avant suppression

### Pages Profile à Supprimer (si non utilisées)

1. **`/profile/activity`** - Log d'activité personnel
   - `apps/web/src/app/[locale]/profile/activity/page.tsx` (si existe)

2. **`/profile/notifications`** - Préférences notifications
   - `apps/web/src/app/[locale]/profile/notifications/page.tsx` (si non utilisée)

3. **`/profile/notifications-list`** - Historique notifications
   - `apps/web/src/app/[locale]/profile/notifications-list/page.tsx` (si non utilisée)

### ⚠️ Pages Profile/Settings à CONSERVER

- ✅ `/profile` - Profil utilisateur
- ✅ `/profile/settings` - Paramètres profil
- ✅ `/profile/security` - Sécurité
- ✅ `/settings` - Paramètres généraux
- ✅ `/settings/general` - Paramètres généraux
- ✅ `/settings/preferences` - Préférences
- ✅ `/settings/security` - Sécurité
- ✅ `/settings/billing` - Facturation (si utilisé)
- ✅ `/settings/api` - Clés API (si utilisé)
- ✅ `/settings/integrations` - Intégrations (si utilisé)
- ✅ `/settings/team` - Équipe (si utilisé)
- ✅ `/settings/organization` - Organisation (si utilisé)

---

## 🎯 Catégorie 16: Navigation et Menus

**Priorité:** 🔴 Haute - Nettoyer les liens vers les pages supprimées

### Fichiers à Modifier

1. **`apps/web/src/lib/navigation/index.tsx`**
   - Supprimer la section "Contenu" (Pages, Articles, Médias)
   - Vérifier les autres sections

2. **`apps/web/src/components/layout/Header.tsx`**
   - Supprimer le lien vers `/components`

3. **`apps/web/src/components/layout/Footer.tsx`**
   - Supprimer le lien vers `/components`

4. **`apps/web/src/components/landing/Footer.tsx`**
   - Supprimer le lien vers `/help` (si non utilisé)

5. **`apps/web/src/components/sections/Hero.tsx`**
   - Supprimer les liens vers `/components` et `/monitoring`

6. **`apps/web/src/components/sections/CTA.tsx`**
   - Supprimer le lien vers `/components`

7. **`apps/web/src/app/not-found.tsx`**
   - Supprimer le lien vers `/components`

8. **`apps/web/src/app/[locale]/not-found.tsx`**
   - Supprimer le lien vers `/components`

9. **`apps/web/src/app/docs/page.tsx`**
   - Supprimer les liens vers `/components` et `/examples`

10. **`apps/web/src/app/[locale]/docs/page.tsx`**
    - Supprimer les liens vers `/components` et `/examples`

---

## 🎯 Catégorie 17: Fichiers de Configuration

**Priorité:** 🔴 Haute - Nettoyer les références

### Fichiers à Modifier

1. **`apps/web/public/api-manifest.json`**
   - Supprimer toutes les entrées pour les pages supprimées

2. **`apps/web/src/config/sitemap.ts`**
   - Supprimer toutes les entrées pour les pages supprimées

3. **`apps/web/scripts/extract-static-pages.js`**
   - Supprimer les références aux pages supprimées

---

## 📊 Plan d'Action Recommandé

### Phase 1: Suppression Immédiate (Priorité Haute)
1. ✅ Supprimer toutes les pages `/components/*` (35+ pages)
2. ✅ Supprimer toutes les pages `/examples/*` (12 pages)
3. ✅ Supprimer toutes les pages de test (`/test-sentry`, `/sentry/test`, `/upload`, etc.)
4. ✅ Nettoyer les liens dans Header/Footer/Navigation

### Phase 2: Vérification et Suppression Conditionnelle (Priorité Moyenne)
1. ⚠️ Vérifier l'utilisation des pages Blog/CMS
2. ⚠️ Vérifier l'utilisation des pages ERP
3. ⚠️ Vérifier l'utilisation des pages Client Portal
4. ⚠️ Vérifier l'utilisation des pages Help Center
5. ⚠️ Vérifier l'utilisation des pages Monitoring
6. ⚠️ Vérifier l'utilisation des pages Dashboard template (analytics, activity, insights, projects)

### Phase 3: Nettoyage Final
1. ✅ Nettoyer `api-manifest.json`
2. ✅ Nettoyer `sitemap.ts`
3. ✅ Nettoyer les scripts
4. ✅ Mettre à jour la documentation

---

## ⚠️ IMPORTANT: Éléments à CONSERVER

### Pages Essentielles ARISE
- ✅ `/dashboard` - Dashboard principal
- ✅ `/dashboard/assessments` - Tous les assessments (Wellness, TKI, 360°, MBTI)
- ✅ `/dashboard/results` - Résultats
- ✅ `/dashboard/reports` - Rapports
- ✅ `/dashboard/development` - Plan de développement
- ✅ `/dashboard/reseau` - Réseau (entreprises, contacts, témoignages)
- ✅ `/dashboard/coach` - Coaching
- ✅ `/dashboard/coaching-options` - Options de coaching
- ✅ `/dashboard/evaluators` - Évaluateurs
- ✅ `/dashboard/business` - Business
- ✅ `/dashboard/management` - Management

### Pages Admin Essentielles
- ✅ `/admin` - Dashboard admin
- ✅ `/admin/users` - Gestion utilisateurs
- ✅ `/admin/teams` - Gestion équipes
- ✅ `/admin/organizations` - Gestion organisations
- ✅ `/admin/invitations` - Gestion invitations
- ✅ `/admin/rbac` - Gestion RBAC
- ✅ `/admin/logs` - Logs système
- ✅ `/admin/settings` - Paramètres système

### Pages Auth/Profile Essentielles
- ✅ `/auth/login` - Connexion
- ✅ `/auth/register` - Inscription
- ✅ `/profile` - Profil utilisateur
- ✅ `/settings` - Paramètres

### Composants
- ✅ **TOUS les composants dans `apps/web/src/components/`** doivent être CONSERVÉS
- ✅ Seules les **pages de showcase** sont supprimées, pas les composants eux-mêmes

---

## 📝 Notes Finales

1. **Composants vs Pages:** Les composants réutilisables dans `apps/web/src/components/` doivent être **conservés**. Seules les **pages de démonstration** sont supprimées.

2. **Vérification:** Avant de supprimer les pages de catégorie "Moyenne", vérifier leur utilisation réelle dans le projet.

3. **Backup:** Faire un backup avant toute suppression massive.

4. **Tests:** Après suppression, tester que l'application fonctionne toujours correctement.

5. **Documentation:** Mettre à jour la documentation après suppression.

---

**Date de création:** 2025-01-26  
**Dernière mise à jour:** 2025-01-26
