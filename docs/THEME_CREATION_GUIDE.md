# Guide de Création de Thème

Ce guide explique tous les éléments nécessaires pour créer un thème personnalisé dans l'application.

## 📋 Champs Requis

### 1. Informations de Base (Obligatoires)

- **`name`** (string, requis) : Identifiant technique unique du thème
  - Format : alphanumérique, tirets et underscores uniquement
  - Exemple : `dark-blue`, `corporate-theme`, `modern_light`
  - Converti automatiquement en minuscules

- **`display_name`** (string, requis) : Nom d'affichage du thème
  - Longueur : 1-200 caractères
  - Exemple : `Dark Blue Theme`, `Corporate Theme`, `Modern Light`

### 2. Informations Optionnelles

- **`description`** (string, optionnel) : Description du thème
  - Exemple : `Thème sombre avec accents bleus pour une expérience moderne`

- **`is_active`** (boolean, optionnel) : Activer le thème immédiatement
  - Par défaut : `false`
  - Si `true`, désactive automatiquement tous les autres thèmes

## 🎨 Configuration JSON (`config`)

Le champ `config` est un objet JSON qui contient toutes les propriétés visuelles du thème.

### Structure Minimale Recommandée

```json
{
  "mode": "system",
  "primary": "#3b82f6",
  "secondary": "#8b5cf6",
  "danger": "#ef4444",
  "warning": "#f59e0b",
  "info": "#06b6d4"
}
```

### Structure Complète Recommandée

```json
{
  "mode": "system",
  
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "danger": "#ef4444",
    "warning": "#f59e0b",
    "info": "#06b6d4",
    "success": "#10b981",
    
    "background": "#ffffff",
    "foreground": "#000000",
    "muted": "#f3f4f6",
    "mutedForeground": "#6b7280",
    "border": "#e5e7eb",
    "accent": "#f59e0b"
  },
  
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontFamilyHeading": "Inter, sans-serif",
    "fontFamilySubheading": "Inter, sans-serif",
    "fontSize": {
      "base": "16px",
      "sm": "14px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px"
    },
    "textHeading": "#111827",
    "textSubheading": "#374151",
    "textBody": "#1f2937",
    "textSecondary": "#6b7280",
    "textLink": "#3b82f6"
  },
  
  "spacing": {
    "unit": "8px"
  },
  
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  }
}
```

## 🎨 Propriétés de Configuration Détaillées

### Mode (`mode`)

Définit le mode du thème :
- `"light"` : Mode clair uniquement
- `"dark"` : Mode sombre uniquement
- `"system"` : Suit les préférences système (recommandé)

### Couleurs Principales

#### Couleurs de Base (Recommandées)

- **`primary`** : Couleur principale de l'application
  - Format : Hex (`#3b82f6`) ou RGB (`rgb(59, 130, 246)`)
  - Utilisée pour : Boutons principaux, liens, accents

- **`secondary`** : Couleur secondaire
  - Utilisée pour : Éléments secondaires, compléments

- **`danger`** : Couleur d'erreur/danger
  - Utilisée pour : Boutons de suppression, alertes d'erreur

- **`warning`** : Couleur d'avertissement
  - Utilisée pour : Alertes d'avertissement, notifications

- **`info`** : Couleur d'information
  - Utilisée pour : Messages informatifs, badges

- **`success`** : Couleur de succès
  - Utilisée pour : Messages de succès, validations

#### Couleurs de Fond et Texte

- **`background`** : Couleur de fond principale
- **`foreground`** : Couleur de texte principale
- **`muted`** : Couleur de fond atténuée
- **`mutedForeground`** : Couleur de texte atténuée
- **`border`** : Couleur des bordures
- **`accent`** : Couleur d'accentuation

### Typographie

#### Polices (`typography.fontFamily`)

- **`fontFamily`** : Police principale pour le corps du texte
  - Exemple : `"Inter, sans-serif"`, `"Roboto, sans-serif"`

- **`fontFamilyHeading`** : Police pour les titres
  - Exemple : `"Inter, sans-serif"`, `"Poppins, sans-serif"`

- **`fontFamilySubheading`** : Police pour les sous-titres
  - Exemple : `"Inter, sans-serif"`

#### Tailles de Police (`typography.fontSize`)

- **`base`** : Taille de base (généralement 16px)
- **`sm`** : Petite taille (14px)
- **`lg`** : Grande taille (18px)
- **`xl`** : Très grande taille (20px)
- **`2xl`** : Extra grande taille (24px)

#### Couleurs de Texte (`typography`)

- **`textHeading`** : Couleur des titres
- **`textSubheading`** : Couleur des sous-titres
- **`textBody`** : Couleur du texte principal
- **`textSecondary`** : Couleur du texte secondaire
- **`textLink`** : Couleur des liens

### Espacement (`spacing`)

- **`unit`** : Unité de base pour l'espacement
  - Exemple : `"8px"` (utilisé comme base pour les marges/paddings)

### Bordures (`borderRadius`)

- **`sm`** : Petit rayon (0.25rem)
- **`md`** : Rayon moyen (0.375rem)
- **`lg`** : Grand rayon (0.5rem)
- **`xl`** : Très grand rayon (0.75rem)
- **`full`** : Cercle complet (9999px)

## 📝 Exemple Complet

### Thème Moderne Sombre

```json
{
  "name": "modern-dark",
  "display_name": "Modern Dark",
  "description": "Thème sombre moderne avec accents bleus",
  "is_active": false,
  "config": {
    "mode": "dark",
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "danger": "#ef4444",
    "warning": "#f59e0b",
    "info": "#06b6d4",
    "success": "#10b981",
    "colors": {
      "background": "#0f172a",
      "foreground": "#f1f5f9",
      "muted": "#1e293b",
      "mutedForeground": "#94a3b8",
      "border": "#334155",
      "accent": "#3b82f6"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "fontFamilyHeading": "Inter, sans-serif",
      "textHeading": "#f1f5f9",
      "textSubheading": "#cbd5e1",
      "textBody": "#e2e8f0",
      "textSecondary": "#94a3b8",
      "textLink": "#60a5fa"
    },
    "borderRadius": {
      "md": "0.5rem",
      "lg": "0.75rem"
    }
  }
}
```

### Thème Corporate Clair

```json
{
  "name": "corporate-light",
  "display_name": "Corporate Light",
  "description": "Thème professionnel clair pour entreprises",
  "is_active": false,
  "config": {
    "mode": "light",
    "primary": "#1e40af",
    "secondary": "#475569",
    "danger": "#dc2626",
    "warning": "#d97706",
    "info": "#0284c7",
    "success": "#059669",
    "colors": {
      "background": "#ffffff",
      "foreground": "#0f172a",
      "muted": "#f8fafc",
      "mutedForeground": "#64748b",
      "border": "#e2e8f0",
      "accent": "#1e40af"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "fontFamilyHeading": "Inter, sans-serif",
      "textHeading": "#0f172a",
      "textSubheading": "#1e293b",
      "textBody": "#334155",
      "textSecondary": "#64748b",
      "textLink": "#2563eb"
    },
    "borderRadius": {
      "md": "0.375rem",
      "lg": "0.5rem"
    }
  }
}
```

## 🔧 Création via l'Interface Admin

1. Allez sur `/fr/admin/themes`
2. Cliquez sur "Create New Theme"
3. Remplissez le formulaire :
   - **Theme Name** : Identifiant technique (ex: `my-custom-theme`)
   - **Display Name** : Nom d'affichage (ex: `My Custom Theme`)
   - **Description** : Description optionnelle
   - **Configuration** : JSON avec la structure ci-dessus
4. Cliquez sur "Create"

## 🔧 Création via l'API

```bash
POST /api/v1/themes
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "my-custom-theme",
  "display_name": "My Custom Theme",
  "description": "Description du thème",
  "is_active": false,
  "config": {
    "mode": "system",
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "danger": "#ef4444",
    "warning": "#f59e0b",
    "info": "#06b6d4"
  }
}
```

## ✅ Checklist de Création

- [ ] `name` : Identifiant unique et valide
- [ ] `display_name` : Nom d'affichage descriptif
- [ ] `config.mode` : `light`, `dark`, ou `system`
- [ ] `config.primary` : Couleur principale définie
- [ ] `config.secondary` : Couleur secondaire définie
- [ ] `config.danger` : Couleur d'erreur définie
- [ ] `config.warning` : Couleur d'avertissement définie
- [ ] `config.info` : Couleur d'information définie
- [ ] Configuration JSON valide (testez avec un validateur JSON)

## 💡 Conseils

1. **Commencez simple** : Utilisez d'abord la structure minimale, puis ajoutez des propriétés
2. **Testez les contrastes** : Assurez-vous que les couleurs de texte sont lisibles sur les fonds
3. **Mode système** : Utilisez `"mode": "system"` pour supporter automatiquement le mode sombre/clair
4. **Couleurs accessibles** : Respectez les ratios de contraste WCAG AA (4.5:1 pour le texte normal)
5. **Cohérence** : Gardez une palette de couleurs cohérente dans tout le thème

## 🎨 Outils Utiles

- **Générateur de palette** : [Coolors.co](https://coolors.co)
- **Contraste de couleurs** : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Validateur JSON** : [JSONLint](https://jsonlint.com/)

