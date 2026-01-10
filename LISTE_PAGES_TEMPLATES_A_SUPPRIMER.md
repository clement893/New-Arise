# 📋 Liste des Pages Templates à Supprimer

Cette liste recense toutes les pages liées aux templates qui ne sont **pas nécessaires** pour le projet en production. Ces pages sont généralement des pages de démonstration/showcase provenant du template original.

---

## ✅ Pages à Supprimer (Non Nécessaires)

### 1. `/components/templates` 
**Type:** ⚪ Component Showcase (Page de démonstration)  
**Fichiers:**
- `apps/web/src/app/[locale]/components/templates/page.tsx`
- `apps/web/src/app/[locale]/components/templates/TemplatesComponentsContent.tsx`

**Description:**  
Page de showcase/démo des composants templates. Cette page sert uniquement à démontrer les composants `TemplateManager` et `TemplateEditor` en action. Elle n'a aucune fonctionnalité réelle et n'est pas nécessaire en production.

**Références à supprimer:**
- `apps/web/src/app/[locale]/components/ComponentsContent.tsx` (ligne ~509)
- `apps/web/public/api-manifest.json` (ligne ~740)
- `scripts/extract-static-pages.js` (ligne ~126)
- Documentation dans `docs/APP_PAGES_AND_FEATURES.md` (ligne ~289)

**Composants associés (à garder ou supprimer selon usage):**
- `apps/web/src/components/templates/TemplateManager.tsx`
- `apps/web/src/components/templates/TemplateEditor.tsx`
- `apps/web/src/components/templates/index.ts`
- `apps/web/src/components/templates/README.md`

---

### 2. `/content/templates`
**Type:** 🔵 DB + Backend (mais API incomplète)  
**Fichiers:**
- `apps/web/src/app/[locale]/content/templates/page.tsx`

**Description:**  
Page de gestion de templates de contenu avec opérations CRUD. Selon la documentation (`docs/APP_PAGES_AND_FEATURES.md` ligne 783), **l'API de gestion de templates n'est pas complètement développée** et est marquée comme "Template management API needed".

**Statut:**  
⚠️ **À vérifier** - La page existe et tente de se connecter à `/v1/templates`, mais l'API backend peut ne pas être complètement implémentée. Si cette fonctionnalité n'est pas utilisée, la page peut être supprimée.

**Références à supprimer/modifier:**
- `apps/web/src/components/content/ContentDashboard.tsx` (ligne ~95) - Lien dans le dashboard
- `apps/web/public/api-manifest.json` (ligne ~977)
- `apps/web/src/config/sitemap.ts` (ligne ~197)
- Documentation dans `docs/APP_PAGES_AND_FEATURES.md` (lignes ~111, 714, 783)

**Composant associé (à garder si utile ailleurs):**
- `apps/web/src/components/content/TemplatesManager.tsx`

---

## 📊 Résumé

| Page | Type | Statut | Priorité |
|------|------|--------|----------|
| `/components/templates` | Showcase | ❌ Non nécessaire | 🔴 Haute - Supprimer |
| `/content/templates` | Fonctionnelle (API incomplète) | ⚠️ À vérifier | 🟡 Moyenne - Vérifier utilisation |

---

## 🔍 Autres Fichiers liés aux Templates (À examiner)

### Composants Templates (peuvent être utiles ailleurs)
- `apps/web/src/components/templates/TemplateManager.tsx` - Gestionnaire de templates
- `apps/web/src/components/templates/TemplateEditor.tsx` - Éditeur de templates
- `apps/web/src/components/content/TemplatesManager.tsx` - Gestionnaire de templates de contenu
- `apps/web/src/components/email-templates/EmailTemplateManager.tsx` - Gestionnaire de templates d'email
- `apps/web/src/components/page-builder/SectionTemplates.tsx` - Templates de sections
- `apps/web/src/components/ai/TemplateAIChat.tsx` - Chat AI pour templates

### Utilitaires Templates
- `apps/web/src/lib/utils/generateContactTemplate.ts` - Utilitaire pour générer des templates de contact

**Note:** Ces composants peuvent être utilisés ailleurs dans l'application. Il faut vérifier leur utilisation avant de les supprimer.

---

## ⚠️ IMPORTANT : Conservation des Composants

**✅ Les composants seront CONSERVÉS même après suppression des pages !**

Supprimer les pages de démonstration/showcase **ne supprime PAS** les composants eux-mêmes. Tous les composants restent disponibles dans `apps/web/src/components/` et peuvent toujours être importés et utilisés ailleurs dans l'application.

**Composants qui seront conservés :**
- ✅ `apps/web/src/components/templates/TemplateManager.tsx`
- ✅ `apps/web/src/components/templates/TemplateEditor.tsx`
- ✅ `apps/web/src/components/content/TemplatesManager.tsx`
- ✅ `apps/web/src/components/email-templates/EmailTemplateManager.tsx`
- ✅ Tous les autres composants templates

**Vous pourrez toujours les utiliser :**
```typescript
import { TemplateManager } from '@/components/templates';
import { TemplatesManager } from '@/components/content';
```

Seules les **pages de démonstration** sont supprimées, pas les composants réutilisables.

---

## 🎯 Recommandation

1. **Supprimer immédiatement:** `/components/templates` - C'est clairement une page de démonstration (les composants restent disponibles)
2. **Vérifier puis décider:** `/content/templates` - Vérifier si cette fonctionnalité est réellement utilisée dans l'application avant de la supprimer (le composant `TemplatesManager` reste disponible)

---

## 📝 Actions à effectuer

### Pour `/components/templates`:
1. ✅ Supprimer les fichiers de page
2. ✅ Retirer les références dans `ComponentsContent.tsx`
3. ✅ Retirer l'entrée dans `api-manifest.json`
4. ✅ Retirer l'entrée dans `extract-static-pages.js`
5. ✅ Mettre à jour la documentation

### Pour `/content/templates` (si décidée de supprimer):
1. ⚠️ Vérifier d'abord si la fonctionnalité est utilisée
2. ⚠️ Vérifier si l'API backend est implémentée
3. Si non utilisée:
   - Supprimer le fichier de page
   - Retirer le lien dans `ContentDashboard.tsx`
   - Retirer l'entrée dans `api-manifest.json`
   - Retirer l'entrée dans `sitemap.ts`
   - Mettre à jour la documentation

---

**Date de création:** 2025-01-26  
**Dernière mise à jour:** 2025-01-26
