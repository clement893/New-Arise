# Correction Edge Runtime Crypto Error - 2026-01-15

## Problème
Le middleware Next.js générait une erreur :
```
Error: The edge runtime does not support Node.js 'crypto' module.
```

## Cause
Le middleware utilisait le module Node.js `crypto` qui n'est pas supporté dans l'Edge Runtime de Next.js :
```typescript
import { randomBytes } from 'crypto';  // ❌ Non supporté dans Edge Runtime
```

## Solution
Remplacement par l'API Web Crypto qui est disponible dans l'Edge Runtime :

**Fichier:** `apps/web/src/middleware.ts`

**Avant:**
```typescript
import { randomBytes } from 'crypto';

function generateCSPNonce(): string {
  return randomBytes(16).toString('base64url');
}
```

**Après:**
```typescript
// Pas d'import - utilise l'API Web Crypto globale

function generateCSPNonce(): string {
  // Generate 16 random bytes using Web Crypto API (Edge Runtime compatible)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Convert bytes to string for btoa (Edge Runtime supports btoa)
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  
  // Convert to base64url (URL-safe base64)
  const base64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64;
}
```

## Changements
1. ✅ Suppression de l'import `import { randomBytes } from 'crypto'`
2. ✅ Utilisation de `crypto.getRandomValues()` (API Web Crypto)
3. ✅ Conversion manuelle en base64url avec `btoa()` (disponible dans Edge Runtime)

## Compatibilité Edge Runtime
- ✅ `crypto.getRandomValues()` - Disponible
- ✅ `btoa()` - Disponible (API Web standard)
- ✅ `Uint8Array` - Disponible
- ❌ `import { randomBytes } from 'crypto'` - Non disponible (module Node.js)

## Résultat Attendu
Le middleware devrait maintenant fonctionner correctement dans l'Edge Runtime sans erreurs liées au module `crypto`.
