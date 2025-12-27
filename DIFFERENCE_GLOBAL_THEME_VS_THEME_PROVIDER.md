# Différence entre GlobalThemeProvider et ThemeProvider

**Date:** 2025-12-27  
**Objectif:** Comprendre les rôles distincts de GlobalThemeProvider et ThemeProvider

---

## 📊 Vue d'Ensemble

Ces deux providers gèrent des aspects **différents** du système de thème:

- **GlobalThemeProvider** = Thème **global de l'application** (couleurs, fonts, styles)
- **ThemeProvider** = Préférence **utilisateur** (light/dark/system)

Ils travaillent **ensemble** mais ont des responsabilités **séparées**.

---

## 🎨 GlobalThemeProvider

### Rôle Principal
Gère le **thème global de l'application** défini par les **superadmins** dans la base de données.

### Responsabilités

1. **Charger le thème depuis le backend**
   - Appelle l'API `/api/v1/themes/active`
   - Récupère la configuration du thème (couleurs, fonts, etc.)
   - Cache le thème dans localStorage pour performance

2. **Appliquer les CSS variables**
   - Applique les couleurs (primary, secondary, danger, etc.)
   - Applique les fonts (font-family)
   - Applique le border-radius
   - Applique les effets (glassmorphism, shadows, gradients)
   - Met à jour les CSS variables sur `:root`

3. **Gérer le cache**
   - Charge le thème depuis le cache au démarrage
   - Met à jour le cache quand le thème change
   - Utilise le cache comme fallback si l'API échoue

### Ce qu'il NE fait PAS
- ❌ Ne gère PAS les préférences utilisateur (light/dark)
- ❌ Ne gère PAS le toggle dark/light
- ❌ Ne devrait PAS gérer les classes `light`/`dark` (conflit actuel)

### Contexte Fourni

```tsx
interface GlobalThemeContextType {
  theme: ThemeConfigResponse | null;  // Configuration complète du thème
  isLoading: boolean;                 // État de chargement
  error: Error | null;                // Erreurs éventuelles
  refreshTheme: () => Promise<void>;  // Rafraîchir le thème
}
```

### Hook Disponible

```tsx
const { theme, isLoading, error, refreshTheme } = useGlobalTheme();
```

**Utilisation typique:**
- Composants admin qui affichent/modifient le thème global
- Composants qui ont besoin des couleurs du thème
- Composants qui doivent rafraîchir le thème

### Exemple d'Utilisation

```tsx
function AdminThemeEditor() {
  const { theme, refreshTheme } = useGlobalTheme();
  
  if (!theme) return <div>Loading theme...</div>;
  
  return (
    <div>
      <h1>Thème Global: {theme.name}</h1>
      <ColorPicker 
        color={theme.config.primary_color}
        onChange={(color) => {
          // Mettre à jour le thème global
          updateGlobalTheme({ primary_color: color });
          refreshTheme();
        }}
      />
    </div>
  );
}
```

### Fichier
`apps/web/src/lib/theme/global-theme-provider.tsx`

---

## 👤 ThemeProvider

### Rôle Principal
Gère la **préférence utilisateur** pour le mode light/dark/system.

### Responsabilités

1. **Gérer les préférences utilisateur**
   - Stocke la préférence dans localStorage (`theme: 'light' | 'dark' | 'system'`)
   - Charge la préférence au démarrage
   - Permet à l'utilisateur de changer sa préférence

2. **Gérer le toggle dark/light**
   - Fournit `toggleTheme()` pour basculer entre light et dark
   - Fournit `setTheme()` pour définir explicitement le thème
   - Respecte la préférence système si `theme === 'system'`

3. **Appliquer les classes CSS `light`/`dark`**
   - Ajoute/retire les classes `light` et `dark` sur `documentElement`
   - C'est la **source de vérité** pour les classes CSS
   - Permet à Tailwind CSS et aux styles CSS de s'appliquer correctement

4. **Écouter les changements système**
   - Écoute `prefers-color-scheme: dark`
   - Met à jour automatiquement si `theme === 'system'`

### Ce qu'il NE fait PAS
- ❌ Ne gère PAS les couleurs du thème (primary, secondary, etc.)
- ❌ Ne gère PAS les fonts, border-radius, effets
- ❌ Ne charge PAS le thème depuis le backend

### Contexte Fourni

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';  // Préférence utilisateur
  resolvedTheme: 'light' | 'dark';     // Thème résolu (sans 'system')
  setTheme: (theme: Theme) => void;    // Changer la préférence
  toggleTheme: () => void;             // Basculer light/dark
}
```

### Hook Disponible

```tsx
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
```

**Utilisation typique:**
- Composants UI qui ont besoin du toggle dark/light
- Composants qui doivent savoir si on est en dark ou light
- Composants qui doivent appliquer des styles conditionnels

### Exemple d'Utilisation

```tsx
function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

function MyComponent() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      Content
    </div>
  );
}
```

### Fichier
`apps/web/src/contexts/ThemeContext.tsx`

---

## 🔄 Comment Ils Travaillent Ensemble

### Hiérarchie dans AppProviders

```tsx
<GlobalThemeProvider>      {/* Extérieur - Thème global */}
  <ThemeProvider>          {/* Intérieur - Préférence utilisateur */}
    {children}
  </ThemeProvider>
</GlobalThemeProvider>
```

### Flux de Données

```
1. GlobalThemeProvider charge le thème depuis le backend
   → Applique les CSS variables (couleurs, fonts, etc.)

2. ThemeProvider charge la préférence utilisateur depuis localStorage
   → Applique les classes light/dark sur documentElement

3. Les deux travaillent ensemble:
   - GlobalThemeProvider définit QUELS couleurs utiliser
   - ThemeProvider définit SI on utilise le mode dark ou light
   - Les CSS variables de GlobalThemeProvider + la classe dark de ThemeProvider
     = Thème complet appliqué
```

### Exemple Concret

**Scénario:** Superadmin définit `primary_color: #2563eb` dans le thème global, utilisateur choisit dark mode.

1. **GlobalThemeProvider:**
   - Charge le thème → `primary_color: #2563eb`
   - Applique: `--color-primary-500: #2563eb` sur `:root`

2. **ThemeProvider:**
   - Charge préférence → `theme: 'dark'`
   - Applique: `class="dark"` sur `<html>`

3. **Résultat:**
   - Les composants utilisent `var(--color-primary-500)` pour la couleur primaire
   - Les styles `.dark` de Tailwind s'appliquent
   - Le thème dark avec les couleurs personnalisées est actif

---

## 📋 Tableau Comparatif

| Aspect | GlobalThemeProvider | ThemeProvider |
|--------|---------------------|---------------|
| **Source de données** | Backend API (`/api/v1/themes/active`) | localStorage (`theme`) |
| **Qui contrôle** | Superadmins | Utilisateurs |
| **Ce qu'il gère** | Couleurs, fonts, effets | Mode light/dark/system |
| **CSS appliqué** | CSS variables (`--color-primary-500`) | Classes CSS (`dark`, `light`) |
| **Fréquence de changement** | Rare (quand superadmin change) | Fréquent (quand utilisateur toggle) |
| **Cache** | Oui (localStorage) | Oui (localStorage) |
| **Hook** | `useGlobalTheme()` | `useTheme()` |
| **Contexte** | `GlobalThemeContext` | `ThemeContext` |

---

## 🎯 Quand Utiliser Chacun?

### Utiliser `useGlobalTheme()` quand:
- ✅ Vous avez besoin des **couleurs du thème** (primary, secondary, etc.)
- ✅ Vous créez un **composant admin** pour gérer le thème
- ✅ Vous devez **rafraîchir le thème** après une modification
- ✅ Vous avez besoin de savoir si le thème est en **chargement**
- ✅ Vous voulez accéder à la **configuration complète** du thème

**Exemple:**
```tsx
function ColorDisplay() {
  const { theme } = useGlobalTheme();
  const primaryColor = theme?.config.primary_color;
  return <div style={{ color: primaryColor }}>Text</div>;
}
```

### Utiliser `useTheme()` quand:
- ✅ Vous créez un **toggle dark/light**
- ✅ Vous avez besoin de savoir si on est en **dark ou light mode**
- ✅ Vous voulez **changer la préférence** utilisateur
- ✅ Vous appliquez des **styles conditionnels** basés sur dark/light
- ✅ Vous utilisez des **classes Tailwind** conditionnelles

**Exemple:**
```tsx
function DarkModeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      className={resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}
    >
      Toggle
    </button>
  );
}
```

---

## ⚠️ Problème Actuel: Double Gestion

### Le Conflit

**GlobalThemeProvider** appelle `applyDarkModeClass()` (ligne 89-91):
```tsx
if (mode === 'dark' || ...) {
  applyDarkModeClass(true);  // ❌ Ajoute classe 'dark'
}
```

**ThemeProvider** retire et ajoute les classes (ligne 119-120):
```tsx
root.classList.remove('light', 'dark');  // ❌ Retire classe 'dark'
root.classList.add(resolved);             // Ajoute 'dark' ou 'light'
```

**Résultat:** Race condition → La classe `dark` peut être retirée après avoir été ajoutée.

### Solution

**GlobalThemeProvider** ne devrait **PAS** appeler `applyDarkModeClass()`.
- Il devrait seulement gérer les **CSS variables**
- Laisser **ThemeProvider** gérer les classes `light`/`dark`

---

## 📝 Résumé

| | GlobalThemeProvider | ThemeProvider |
|---|---|---|
| **C'est quoi?** | Thème global (couleurs, styles) | Préférence utilisateur (light/dark) |
| **Qui contrôle?** | Superadmins | Utilisateurs |
| **Où sont les données?** | Backend + Cache | localStorage |
| **Que fait-il?** | Applique CSS variables | Applique classes CSS |
| **Quand changer?** | Rare (admin change thème) | Fréquent (utilisateur toggle) |
| **Hook** | `useGlobalTheme()` | `useTheme()` |

**En bref:**
- **GlobalThemeProvider** = "Quelles couleurs utiliser?" (couleurs du thème)
- **ThemeProvider** = "Mode dark ou light?" (préférence utilisateur)

Ils sont **complémentaires** et doivent travailler **ensemble**, mais avec des **responsabilités séparées**.

---

**Rapport généré le:** 2025-12-27  
**Statut:** Documentation complète

