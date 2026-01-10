# AUDIT MENU ET FOOTER ARISE

**Date:** 2026-01-10
**Objectif:** Vérifier que le menu (Header) et le footer utilisent le style ARISE partout dans l'application

---

## 📋 RÉSUMÉ EXÉCUTIF

L'audit a identifié **5 composants principaux** qui n'utilisent pas le style ARISE et doivent être corrigés. La majorité des pages publiques utilisent déjà les composants ARISE, mais certains composants génériques et l'application principale utilisent encore "MODELEFULLSTACK" ou "Nukleo" au lieu de "ARISE".

---

## ✅ PAGES UTILISANT CORRECTEMENT ARISE

Toutes ces pages utilisent les composants `@/components/landing/Header` et `@/components/landing/Footer` avec le style ARISE :

1. **Page d'accueil** (`/`) - ✅ ARISE
2. **About** (`/about`) - ✅ ARISE
3. **Contact** (`/contact`) - ✅ ARISE
4. **Privacy** (`/privacy`) - ✅ ARISE
5. **Terms** (`/terms`) - ✅ ARISE
6. **Cookies** (`/cookies`) - ✅ ARISE
7. **Team** (`/team`) - ✅ ARISE
8. **Pricing** (`/pricing`) - ✅ ARISE
9. **News** (`/news`, `/news/[id]`) - ✅ ARISE
10. **Help** (`/help`, `/help/faq`) - ✅ ARISE
11. **Login** (`/login`, `/auth/login`) - ✅ ARISE
12. **Register** (`/register`, `/auth/register`) - ✅ ARISE
13. **360 Evaluator** (`/360-evaluator/[token]`) - ✅ ARISE
14. **Admin Plans** (`/admin/plans`) - ✅ ARISE

**Total: 18+ pages utilisent correctement ARISE**

---

## ❌ PROBLÈMES IDENTIFIÉS

### 1. **app.tsx** - Utilise Header/Footer génériques
**Fichier:** `apps/web/src/app/app.tsx`
**Lignes:** 12-13, 154-160

**Problème:**
- Utilise `Header from '@/components/layout/Header'` et `Footer from '@/components/layout/Footer'`
- Ces composants affichent "MODELEFULLSTACK" au lieu de "ARISE"
- Utilisés pour les pages publiques qui ne sont pas dans la liste `isArisePage`

**Impact:**
- Toutes les pages publiques non listées dans `isArisePage` affichent le mauvais Header/Footer
- Incohérence visuelle sur certaines pages publiques

**Solution recommandée:**
- Remplacer les imports par les composants ARISE
- Utiliser `Header` et `Footer` de `@/components/landing/Header` et `@/components/landing/Footer`

---

### 2. **Header.tsx (layout)** - Logo MODELEFULLSTACK
**Fichier:** `apps/web/src/components/layout/Header.tsx`
**Ligne:** 46

**Problème:**
```tsx
MODELE<span className="text-primary">FULLSTACK</span>
```

**Solution:**
- Remplacer par "ARISE" avec le style ARISE (text-arise-deep-teal ou text-arise-gold)
- Ou supprimer ce composant si non utilisé ailleurs

---

### 3. **Footer.tsx (layout)** - Nom MODELEFULLSTACK et Nukleo
**Fichier:** `apps/web/src/components/layout/Footer.tsx`
**Lignes:** 29, 169

**Problèmes:**
1. **Ligne 29:** Logo "MODELEFULLSTACK"
2. **Ligne 169:** Copyright "© {currentYear} Nukleo. Tous droits réservés."

**Solution:**
- Remplacer "MODELEFULLSTACK" par "ARISE" avec le style ARISE
- Remplacer "Nukleo" par "ARISE"
- Appliquer les couleurs ARISE (arise-gold, arise-deep-teal)

---

### 4. **DashboardLayout.tsx** - Header mobile MODELE
**Fichier:** `apps/web/src/components/layout/DashboardLayout.tsx`
**Ligne:** 407

**Problème:**
```tsx
<h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
  MODELE
</h1>
```

**Solution:**
- Remplacer "MODELE" par "ARISE"
- Utiliser les couleurs ARISE (text-arise-deep-teal ou text-arise-gold)

---

### 5. **DashboardFooter.tsx** - Copyright MODELEFULLSTACK
**Fichier:** `apps/web/src/components/layout/DashboardFooter.tsx`
**Ligne:** 37

**Problème:**
```tsx
<p>© {currentYear} MODELEFULLSTACK. Tous droits réservés.</p>
```

**Solution:**
- Remplacer "MODELEFULLSTACK" par "ARISE"

**Note:** Ce composant semble ne pas être utilisé actuellement (non importé dans DashboardLayout). Mais doit être corrigé si utilisé à l'avenir.

---

### 6. **Pages showcase (/components/layout)** - Utilisent Header/Footer génériques
**Fichiers:**
- `apps/web/src/app/[locale]/components/layout/LayoutComponentsContent.tsx`
- `apps/web/src/app/components/layout/LayoutComponentsContent.tsx`

**Lignes:** 9-10

**Problème:**
- Ces pages utilisent Header/Footer génériques pour démonstration
- Affichent "MODELEFULLSTACK" au lieu de "ARISE"

**Solution:**
- Option 1: Remplacer par les composants ARISE
- Option 2: Garder pour démonstration mais ajouter un commentaire expliquant que c'est pour le showcase
- **Recommandation:** Remplacer par ARISE pour cohérence

---

## 📊 STATISTIQUES

- **Pages utilisant ARISE:** 18+ pages ✅
- **Composants à corriger:** 6 fichiers
- **Priorité haute:** 3 (app.tsx, Header.tsx, Footer.tsx)
- **Priorité moyenne:** 2 (DashboardLayout.tsx, pages showcase)
- **Priorité basse:** 1 (DashboardFooter.tsx - non utilisé actuellement)

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Corrections critiques (Priorité haute)
1. ✅ Corriger `app.tsx` - Remplacer Header/Footer par composants ARISE
2. ✅ Corriger `Header.tsx` (layout) - Remplacer MODELEFULLSTACK par ARISE
3. ✅ Corriger `Footer.tsx` (layout) - Remplacer MODELEFULLSTACK et Nukleo par ARISE

### Phase 2: Corrections moyennes
4. ✅ Corriger `DashboardLayout.tsx` - Remplacer MODELE par ARISE
5. ✅ Corriger pages showcase `/components/layout` - Utiliser composants ARISE

### Phase 3: Nettoyage (Priorité basse)
6. ✅ Corriger `DashboardFooter.tsx` - Remplacer MODELEFULLSTACK par ARISE (pour cohérence future)

---

## 🔍 VÉRIFICATIONS SUPPLÉMENTAIRES

### Composants ARISE existants (références)
- **Header ARISE:** `apps/web/src/components/landing/Header.tsx`
  - Utilise: `text-arise-deep-teal`, `arise-gold`, `bg-arise-deep-teal`
  - Logo: `<span className="text-2xl font-bold text-arise-deep-teal">ARISE</span>`

- **Footer ARISE:** `apps/web/src/components/landing/Footer.tsx`
  - Utilise: `text-arise-gold`, `hover:text-arise-gold`, `bg-gray-900`
  - Logo: `<h3 className="text-2xl font-bold text-arise-gold mb-4">ARISE</h3>`

### Pages dashboard
Les pages dashboard utilisent `DashboardLayout` qui n'a pas de Header/Footer traditionnels (utilise Sidebar). Le header mobile doit être corrigé.

### Pages auth
Les pages auth (`/auth/*`) utilisent leurs propres Header/Footer ARISE - ✅ Correct

---

## ✅ VALIDATION FINALE

Après corrections, vérifier:
- [ ] Toutes les pages publiques affichent "ARISE" dans le Header
- [ ] Tous les footers affichent "ARISE" dans le copyright
- [ ] Aucune référence à "MODELEFULLSTACK", "MODELE", ou "Nukleo" dans les Headers/Footers
- [ ] Les couleurs ARISE (arise-gold, arise-deep-teal) sont utilisées
- [ ] Le header mobile du dashboard affiche "ARISE"

---

## 📝 NOTES

1. **app.tsx** est le composant le plus critique car il affecte toutes les pages publiques non listées dans `isArisePage`
2. Les composants `layout/Header.tsx` et `layout/Footer.tsx` sont peut-être obsolètes si tous les usages sont remplacés par les composants ARISE
3. Le `DashboardFooter.tsx` n'est pas utilisé actuellement mais doit être corrigé pour cohérence future
4. Les pages showcase peuvent garder les composants génériques si c'est intentionnel pour la démonstration

---

**Audit réalisé par:** AI Assistant
**Date:** 2026-01-10
