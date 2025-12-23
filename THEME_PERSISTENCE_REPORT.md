# Rapport - Persistance du Thème

## Résumé

Le système de thème (Theme Builder) est **persistant côté client** via `localStorage`, mais **uniquement dans le frontend**. Il n'y a pas de synchronisation avec le backend.

## Mécanisme de Persistance

### ✅ Persistance Frontend (localStorage)

Le thème est sauvegardé dans le `localStorage` du navigateur :

```typescript
// Sauvegarde automatique
saveThemeToStorage(theme); // localStorage.setItem('theme-colors', JSON.stringify(theme))

// Chargement au démarrage
loadThemeFromStorage(); // localStorage.getItem('theme-colors')
```

**Avantages :**
- ✅ Persiste entre les sessions
- ✅ Rapide (pas de requête serveur)
- ✅ Fonctionne hors ligne

**Limitations :**
- ❌ Spécifique au navigateur (pas synchronisé entre appareils)
- ❌ Perdu si l'utilisateur vide le cache/localStorage
- ❌ Pas de synchronisation avec le backend

### ❌ Pas de Persistance Backend

Actuellement, il n'y a **aucune synchronisation** avec le backend :
- Pas d'API pour sauvegarder le thème utilisateur
- Pas de table dans la base de données pour stocker les préférences
- Pas de synchronisation entre appareils

## État Actuel

### ✅ Ce qui fonctionne

1. **Sauvegarde automatique** : Chaque modification du thème est sauvegardée dans `localStorage`
2. **Chargement au démarrage** : Le thème est chargé depuis `localStorage` au montage du composant
3. **Application immédiate** : Les changements sont appliqués instantanément via CSS variables

### ⚠️ Ce qui manque

1. **Initialisation globale** : Le `ThemeManager` n'est pas initialisé au niveau de l'application
2. **Synchronisation backend** : Pas d'API pour sauvegarder les préférences utilisateur
3. **Multi-appareils** : Les préférences ne sont pas synchronisées entre appareils

## Code Actuel

### Hook useThemeManager

```typescript
// Charge le thème depuis localStorage au montage
useEffect(() => {
  setMounted(true);
  const savedTheme = loadThemeFromStorage();
  if (savedTheme) {
    setTheme({ ...defaultTheme, ...savedTheme });
  }
}, []);

// Sauvegarde automatique à chaque changement
useEffect(() => {
  if (!mounted) return;
  applyTheme(theme);
  saveThemeToStorage(theme); // ← Sauvegarde dans localStorage
}, [theme, mounted]);
```

### Fonctions de persistance

```typescript
// Sauvegarde dans localStorage
export function saveThemeToStorage(theme: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme-colors', JSON.stringify(theme));
}

// Chargement depuis localStorage
export function loadThemeFromStorage(): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  const savedTheme = localStorage.getItem('theme-colors');
  if (!savedTheme) return null;
  return JSON.parse(savedTheme) as ThemeConfig;
}
```

## Problème Identifié

### ⚠️ ThemeManager non initialisé globalement

Le `ThemeManager` n'est pas initialisé au niveau de l'application (`layout.tsx` ou `app.tsx`). Cela signifie que :

1. Le thème n'est chargé que si le composant `ThemeManager` est rendu
2. Si l'utilisateur ne visite pas la page `/components/theme`, le thème n'est jamais chargé
3. Les préférences sauvegardées ne sont pas appliquées automatiquement

## Recommandations

### 1. Initialiser le ThemeManager globalement

Ajouter un composant qui initialise le thème au niveau de l'application :

```typescript
// apps/web/src/components/providers/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useThemeManager } from '@/components/theme/hooks';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useThemeManager();
  
  // Le thème est automatiquement chargé et appliqué par le hook
  
  return <>{children}</>;
}
```

Puis l'ajouter dans `layout.tsx` :

```typescript
<ThemeProvider>
  <QueryProvider>
    <SessionProvider>
      <App>{children}</App>
    </SessionProvider>
  </QueryProvider>
</ThemeProvider>
```

### 2. Ajouter la synchronisation backend (optionnel)

Pour synchroniser les préférences entre appareils :

1. **Créer une API backend** :
   ```python
   # backend/app/api/v1/endpoints/users.py
   @router.put("/me/preferences")
   async def update_user_preferences(
       preferences: UserPreferences,
       current_user: User = Depends(get_current_user),
       db: AsyncSession = Depends(get_db)
   ):
       # Sauvegarder les préférences dans la base de données
   ```

2. **Créer un hook pour synchroniser** :
   ```typescript
   // apps/web/src/components/theme/hooks.ts
   useEffect(() => {
     if (mounted && user) {
       // Synchroniser avec le backend
       syncThemeWithBackend(theme, user.id);
     }
   }, [theme, mounted, user]);
   ```

3. **Charger depuis le backend** :
   ```typescript
   useEffect(() => {
     if (user) {
       const backendTheme = await loadThemeFromBackend(user.id);
       if (backendTheme) {
         setTheme(backendTheme);
       }
     }
   }, [user]);
   ```

## Conclusion

**État actuel :**
- ✅ Persistance **frontend uniquement** (localStorage)
- ✅ Fonctionne pour un utilisateur sur un navigateur
- ❌ Pas de synchronisation entre appareils
- ⚠️ **Problème** : ThemeManager non initialisé globalement

**Action requise :**
1. Initialiser le `ThemeManager` au niveau de l'application pour charger automatiquement le thème
2. (Optionnel) Ajouter la synchronisation backend pour multi-appareils


