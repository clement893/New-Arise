# Plan d'Implémentation - Toggle FR/ENG sur le Site

## 📋 Vue d'Ensemble

Ajouter un toggle de langue Français/Anglais dans le Header de la landing page pour permettre aux utilisateurs de basculer facilement entre les deux langues.

## 🎯 Objectifs

1. ✅ Ajouter un composant de toggle FR/ENG dans le Header de la landing page
2. ✅ Permettre la navigation entre les versions française et anglaise du site
3. ✅ Conserver l'URL actuelle lors du changement de langue
4. ✅ Afficher la langue actuelle de manière claire
5. ✅ Style cohérent avec le design existant de la landing page

## 🔍 Analyse de l'Existant

### Configuration i18n Actuelle

- **Framework**: `next-intl` (déjà configuré)
- **Locales supportées**: `en`, `fr`, `ar`, `he` (dans `routing.ts`)
- **Locale par défaut**: `en`
- **Structure**: Routes avec `[locale]` dans `apps/web/src/app/[locale]/`

### Composants Existants

1. **`LocaleSwitcher.tsx`** (`apps/web/src/components/i18n/LocaleSwitcher.tsx`)
   - Composant complet avec dropdown
   - Supporte toutes les locales (en, fr, ar, he)
   - Style pour le dashboard (dark mode support)

2. **`LanguageSwitcher.tsx`** (`apps/web/src/components/i18n/LanguageSwitcher.tsx`)
   - Alternative avec window.location
   - Même fonctionnalité que LocaleSwitcher

3. **`Header.tsx`** (Landing page - `apps/web/src/components/landing/Header.tsx`)
   - Header simple sans switcher de langue
   - Style blanc avec navigation basique

### Fichiers de Traduction

- `apps/web/messages/en.json` - Traductions anglaises
- `apps/web/messages/fr.json` - Traductions françaises

## 📝 Plan d'Implémentation

### Phase 1: Créer un Composant Toggle Simplifié pour la Landing Page

**Fichier**: `apps/web/src/components/landing/LanguageToggle.tsx`

**Caractéristiques**:
- Toggle simple FR/ENG (pas de dropdown)
- Style adapté au Header blanc de la landing page
- Utilise `next-intl` pour la navigation
- Design compact et élégant

**Fonctionnalités**:
- Affiche "FR" ou "ENG" selon la locale actuelle
- Cliquer bascule entre les deux langues
- Conserve la route actuelle lors du changement
- Animation de transition douce

### Phase 2: Intégrer le Toggle dans le Header

**Fichier**: `apps/web/src/components/landing/Header.tsx`

**Modifications**:
1. Importer le composant `LanguageToggle`
2. Ajouter le toggle dans la section "Actions" du header
3. Positionner entre "Sign In" et "Get Started"
4. Style cohérent avec le reste du header

### Phase 3: Utiliser les Helpers de Navigation next-intl

**Utilisation**:
- `useLocale()` pour obtenir la locale actuelle
- `useRouter()` et `usePathname()` de `next-intl/navigation`
- `Link` de `@/i18n/routing` pour la navigation typée

### Phase 4: Traductions du Header (Optionnel)

**Fichier**: `apps/web/messages/fr.json` et `apps/web/messages/en.json`

**Traductions nécessaires**:
- "Sign In" → "Connexion" (FR)
- "Get Started" → "Commencer" (FR)
- "Products" → "Produits" (FR)
- "Pricing" → "Tarifs" (FR)
- "News" → "Actualités" (FR)

## 🎨 Design du Toggle

### Style Proposé

```
┌─────────────────────────────────────────┐
│  ARISE  │ Products │ Pricing │ News    │
│         │          │         │         │
│         │          │         │  [FR]   │  Sign In  │ Get Started │
└─────────────────────────────────────────┘
```

**Variantes de Design**:

1. **Toggle Simple** (Recommandé)
   - Bouton avec texte "FR" ou "ENG"
   - Style minimaliste
   - Hover avec underline

2. **Toggle avec Icône**
   - Globe icon + texte
   - Plus visuel mais prend plus de place

3. **Toggle avec Séparateur**
   - "FR | ENG" avec la langue active en gras
   - Style élégant et compact

### Classes CSS Suggérées

```tsx
// Style pour le toggle
className="text-gray-700 hover:text-arise-deep-teal transition-colors font-medium px-2 py-1 border border-gray-300 rounded hover:border-arise-deep-teal"

// Style pour la langue active
className="text-arise-deep-teal font-semibold"
```

## 🔧 Implémentation Technique

### Structure du Composant LanguageToggle

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { type Locale } from '@/i18n/routing';

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  
  const toggleLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    // Navigation logic
  };
  
  return (
    <button onClick={toggleLanguage}>
      {locale === 'fr' ? 'ENG' : 'FR'}
    </button>
  );
}
```

### Intégration dans Header.tsx

```tsx
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  return (
    <nav>
      {/* ... */}
      <div className="flex items-center space-x-4">
        <Link href="/login">Sign In</Link>
        <LanguageToggle />
        <Button asChild>
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}
```

## ✅ Checklist d'Implémentation

### Étape 1: Création du Composant
- [ ] Créer `apps/web/src/components/landing/LanguageToggle.tsx`
- [ ] Implémenter la logique de basculement FR/ENG
- [ ] Ajouter les styles appropriés
- [ ] Tester la navigation entre les locales

### Étape 2: Intégration dans le Header
- [ ] Importer `LanguageToggle` dans `Header.tsx`
- [ ] Ajouter le composant dans la section Actions
- [ ] Ajuster l'espacement et l'alignement
- [ ] Vérifier la responsivité mobile

### Étape 3: Tests
- [ ] Tester le changement de langue sur la page d'accueil
- [ ] Vérifier que l'URL est correctement mise à jour
- [ ] Tester sur différentes routes (/fr, /en, /fr/products, etc.)
- [ ] Vérifier le comportement sur mobile
- [ ] Tester avec différentes tailles d'écran

### Étape 4: Améliorations (Optionnel)
- [ ] Ajouter des traductions pour les éléments du Header
- [ ] Ajouter une animation de transition
- [ ] Sauvegarder la préférence de langue dans localStorage
- [ ] Ajouter un indicateur visuel de la langue active

## 🐛 Points d'Attention

1. **Navigation avec next-intl**
   - Utiliser les helpers de `@/i18n/routing` et non ceux de `next/navigation`
   - Respecter le format d'URL avec/sans préfixe selon la locale

2. **Hydration**
   - Le composant doit être `'use client'`
   - Gérer le cas où la locale n'est pas encore chargée

3. **Style Responsive**
   - Sur mobile, le toggle doit rester accessible
   - Peut-être réduire à juste "FR" ou "ENG" sans texte complet

4. **Accessibilité**
   - Ajouter `aria-label` approprié
   - Gérer le focus keyboard
   - Indiquer clairement la langue active

## 📊 Résultat Attendu

Après implémentation, le Header de la landing page devrait avoir:

```
┌─────────────────────────────────────────────────────────────┐
│ ARISE │ Products │ Pricing │ News │ [FR/ENG] │ Sign In │ Get Started │
└─────────────────────────────────────────────────────────────┘
```

Le toggle devrait:
- ✅ Basculer entre FR et ENG en un clic
- ✅ Conserver la route actuelle
- ✅ Afficher la langue active de manière claire
- ✅ Avoir un style cohérent avec le reste du header

## 🚀 Prochaines Étapes

1. Implémenter le composant `LanguageToggle`
2. L'intégrer dans le `Header` de la landing page
3. Tester sur différentes pages et routes
4. Ajuster le style si nécessaire
5. Optionnel: Ajouter les traductions du Header
