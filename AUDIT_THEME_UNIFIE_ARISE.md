# Audit du Thème Unifié ARISE

**Date:** 2026-01-04
**Objectif:** Vérifier que toutes les couleurs de la plateforme utilisent le système de thème ARISE unifié

## Résumé Exécutif

Le système de thème ARISE est configuré avec:
- **Primary (Teal ARISE):** `#0A3A40` (Deep Teal)
- **Secondary (Gold ARISE):** `#D4AF37` (Gold)

Cependant, de nombreux composants utilisent encore des couleurs hardcodées (blue, green, teal génériques) au lieu d'utiliser le système de thème.

## État Actuel du Système de Thème

### ✅ Configuration Correcte

1. **Thème par défaut** (`default-theme-config.ts`):
   - `primary_color: "#0A3A40"` (ARISE deep teal) ✓
   - `secondary_color: "#D4AF37"` (ARISE gold) ✓

2. **Variables CSS générées**:
   - `--color-primary-*` → Généré à partir de `#0A3A40` ✓
   - `--color-secondary-*` → Généré à partir de `#D4AF37` ✓
   - `--color-arise-*` → Couleurs spécifiques ARISE ✓

3. **Configuration Tailwind**:
   - `primary.*` utilise `var(--color-primary-*)` ✓
   - `secondary.*` utilise `var(--color-secondary-*)` ✓
   - `arise.*` utilise `var(--color-arise-*)` ✓

### ❌ Problèmes Identifiés

#### 1. Dashboard - Vue d'ensemble (`dashboard/page.tsx`)

**Problèmes:**
- Ligne 148-159: Utilise `color: 'teal'` et `color: 'orange'` en JavaScript
- Ligne 237: `bg-green-100 text-green-700` (hardcodé)
- Ligne 245-249: `bg-blue-100 text-blue-700`, `bg-blue-50 text-blue-700` (hardcodé)

**Recommandation:**
- Remplacer `color: 'teal'` par `color: 'primary'` (qui utilisera ARISE teal)
- Remplacer `bg-green-*` par `bg-success-*` (qui utilise secondary/gold par défaut)
- Remplacer `bg-blue-*` par `bg-primary-*` (qui utilisera ARISE teal)

#### 2. Boutons (Button.tsx)

**État actuel:**
- Variant `primary`: Utilise `bg-primary-600` ✓ (CORRECT - utilise le thème)
- Variant `arise-primary`: Utilise `bg-arise-button-primary` ✓ (CORRECT)
- Variant `secondary`: Utilise `bg-secondary-600` ✓ (CORRECT - utilise le thème)

**Problèmes mineurs:**
- Le variant par défaut est `primary`, ce qui est correct
- Certains composants utilisent encore `variant="outline"` avec des couleurs hardcodées

#### 3. Badges et Status

**Fichiers affectés:**
- `dashboard/page.tsx` (lignes 237, 245-249)
- `dashboard/assessments/page.tsx` (ligne 559, 872)

**Problèmes:**
- Badges "Terminé": `bg-green-100 text-green-700` → Devrait utiliser `bg-success-*`
- Badges "En cours": `bg-blue-100 text-blue-700` → Devrait utiliser `bg-primary-*`

#### 4. Progress Bars

**Fichiers affectés:**
- `dashboard/page.tsx` (ligne 153)

**Problème:**
- Utilise `color: 'teal'` en JavaScript
- Devrait utiliser `color: 'primary'` pour utiliser les couleurs ARISE

#### 5. Formulaires (Form.tsx)

**Problème:**
- Ligne 195: `bg-primary-600` (CORRECT)
- Mais le composant utilise des classes hardcodées au lieu du composant Button

**Recommandation:**
- Remplacer le bouton submit par le composant `<Button>` standardisé

#### 6. Autres Composants

**Fichiers avec couleurs hardcodées:**

1. **360-feedback/results/page.tsx:**
   - Ligne 230: `text-blue-600` → Devrait utiliser `text-primary-*`
   - Lignes 288-289, 324, 350, 462, 495-499: `bg-blue-*`, `text-blue-*` → Devrait utiliser `bg-primary-*`, `text-primary-*`

2. **assessments/results/page.tsx:**
   - Utilise `bg-arise-gold` ✓ (CORRECT - utilise les couleurs ARISE)

3. **settings/page.tsx:**
   - Utilise `bg-arise-teal` ✓ (CORRECT - utilise les couleurs ARISE)

## Plan de Correction

### Phase 1: Dashboard et Composants Principaux

1. **dashboard/page.tsx:**
   - [ ] Remplacer `color: 'teal'` par `color: 'primary'`
   - [ ] Remplacer `bg-green-100 text-green-700` par `bg-success-100 text-success-700`
   - [ ] Remplacer `bg-blue-100 text-blue-700` par `bg-primary-100 text-primary-700`
   - [ ] Remplacer `bg-blue-50 text-blue-700` par `bg-primary-50 text-primary-700`

2. **dashboard/assessments/page.tsx:**
   - [ ] Remplacer `bg-blue-*` par `bg-primary-*`
   - [ ] Remplacer `text-blue-*` par `text-primary-*`

3. **360-feedback/results/page.tsx:**
   - [ ] Remplacer `bg-blue-*` par `bg-primary-*`
   - [ ] Remplacer `text-blue-*` par `text-primary-*`

### Phase 2: Composants UI

1. **Form.tsx:**
   - [ ] Utiliser le composant `<Button>` au lieu d'un `<button>` avec classes hardcodées

2. **Badge.tsx:**
   - [ ] Vérifier que les variants utilisent les couleurs du thème
   - [ ] Ajouter des variants pour success/primary/secondary si manquants

### Phase 3: Vérification Globale

1. **Recherche globale:**
   - [ ] Chercher tous les usages de `bg-blue-*`, `text-blue-*`, `border-blue-*`
   - [ ] Chercher tous les usages de `bg-green-*`, `text-green-*` (sauf pour success)
   - [ ] Chercher tous les usages de `bg-teal-*`, `text-teal-*` (remplacer par primary)
   - [ ] Vérifier que tous les `color: 'teal'` en JS utilisent `color: 'primary'`

## Mapping des Couleurs

| Ancienne Couleur | Nouvelle Couleur | Variable CSS | Usage |
|-----------------|------------------|--------------|-------|
| `bg-blue-*` | `bg-primary-*` | `var(--color-primary-*)` | Couleurs principales (teal ARISE) |
| `text-blue-*` | `text-primary-*` | `var(--color-primary-*)` | Texte principal |
| `border-blue-*` | `border-primary-*` | `var(--color-primary-*)` | Bordures principales |
| `bg-green-*` (success) | `bg-success-*` | `var(--color-success-*)` | Succès (gold ARISE) |
| `text-green-*` (success) | `text-success-*` | `var(--color-success-*)` | Texte succès |
| `bg-teal-*` | `bg-primary-*` | `var(--color-primary-*)` | Remplacé par primary |
| `text-teal-*` | `text-primary-*` | `var(--color-primary-*)` | Remplacé par primary |
| `color: 'teal'` (JS) | `color: 'primary'` | N/A | Variables JavaScript |

## Règles de Remplacement

1. **Couleurs principales (actions, liens, focus):**
   - `blue-*` → `primary-*` (utilise ARISE teal `#0A3A40`)

2. **Couleurs de succès:**
   - `green-*` → `success-*` (utilise ARISE gold `#D4AF37` par défaut)

3. **Couleurs spécifiques ARISE:**
   - Pour les boutons: Utiliser `bg-arise-button-primary`
   - Pour les accents gold: Utiliser `bg-arise-gold`, `text-arise-gold`
   - Pour les backgrounds teal: Utiliser `bg-arise-deep-teal`

4. **Éviter:**
   - ❌ Couleurs hardcodées: `bg-blue-500`, `text-green-600`
   - ❌ Couleurs génériques: `bg-teal-*` (remplacer par `primary-*`)
   - ✅ Utiliser les variables CSS: `bg-primary-*`, `bg-success-*`
   - ✅ Utiliser les couleurs ARISE spécifiques: `bg-arise-*`

## Tests à Effectuer

1. [ ] Vérifier que le dashboard utilise les couleurs ARISE
2. [ ] Vérifier que les boutons utilisent les couleurs ARISE
3. [ ] Vérifier que les badges utilisent les couleurs ARISE
4. [ ] Vérifier que les progress bars utilisent les couleurs ARISE
5. [ ] Vérifier que tous les liens utilisent les couleurs ARISE
6. [ ] Vérifier le mode sombre (si applicable)
7. [ ] Vérifier l'accessibilité (contraste WCAG AA)

## Statistiques

### Couleurs hardcodées trouvées dans `/dashboard`:

- **`bg-blue-*`, `text-blue-*`, `border-blue-*`:** 79 occurrences dans 14 fichiers
- **`bg-green-*`, `text-green-*`, `border-green-*`:** 77 occurrences dans 25 fichiers
- **`bg-teal-*`, `text-teal-*`, `border-teal-*`:** 19 occurrences dans 2 fichiers

**Total:** ~175 occurrences de couleurs hardcodées à remplacer dans le dashboard uniquement.

### Fichiers les plus affectés:

1. **`admin/assessment-management/page.tsx`:** 21 blue + 13 green + 14 teal = 48 occurrences
2. **`360-feedback/results/page.tsx`:** 9 blue + 6 green = 15 occurrences
3. **`assessments/page.tsx`:** 2 blue + 1 green = 3 occurrences
4. **`page.tsx` (dashboard principal):** 2 blue + 1 green = 3 occurrences

## Conclusion

Le système de thème est correctement configuré pour utiliser les couleurs ARISE, mais **~175 occurrences** de couleurs hardcodées sont présentes dans le dashboard uniquement. Il faut les remplacer systématiquement par les variables CSS du thème pour avoir une plateforme cohérente avec les couleurs ARISE.

### Priorités de correction:

1. **Haute priorité:** Dashboard principal (`page.tsx`) - Vue d'ensemble visible par tous
2. **Haute priorité:** Page assessments (`assessments/page.tsx`) - Utilisée fréquemment
3. **Moyenne priorité:** Pages de résultats (360-feedback, wellness, etc.)
4. **Basse priorité:** Pages admin (utilisées moins fréquemment)
