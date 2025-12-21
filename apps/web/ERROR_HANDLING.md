# Gestion d'Erreurs Standardisée

Ce document décrit le système de gestion d'erreurs standardisé pour l'application.

## 🎯 Vue d'ensemble

Le système de gestion d'erreurs fournit :
- **Composants d'erreur réutilisables** pour l'affichage cohérent
- **Logging structuré** pour le frontend et le backend
- **Gestion centralisée** des erreurs API
- **Pages d'erreur Next.js** personnalisées

## 📦 Composants d'Erreur

### ErrorBoundary

Composant React pour capturer les erreurs dans l'arbre de composants :

```tsx
import { ErrorBoundary } from '@/components/errors';

<ErrorBoundary fallback={<CustomError />}>
  <YourComponent />
</ErrorBoundary>
```

### ErrorDisplay

Composant réutilisable pour afficher les erreurs :

```tsx
import { ErrorDisplay } from '@/components/errors';
import { NotFoundError } from '@/lib/errors';

<ErrorDisplay
  error={new NotFoundError('Resource not found')}
  onRetry={() => retry()}
  showDetails={true}
/>
```

### ApiError

Composant spécialisé pour les erreurs API :

```tsx
import { ApiError } from '@/components/errors';

try {
  await apiCall();
} catch (error) {
  return <ApiError error={error} onRetry={() => retry()} />;
}
```

## 📝 Logging Structuré

### Frontend

```tsx
import { logger } from '@/lib/logger';
// ou
import { useLogger } from '@/hooks/useLogger';

// Dans un composant
const log = useLogger();
log.info('User action', { userId: user.id });
log.error('API call failed', error, { endpoint: '/api/users' });

// Directement
logger.debug('Debug message', { context: 'value' });
logger.warn('Warning message', { context: 'value' });
```

### Backend

```python
from app.core.logging import logger

logger.info("User created", context={"user_id": user.id})
logger.error("Database error", context={"query": query}, exc_info=exception)
logger.warning("Rate limit approaching", context={"user_id": user_id})
```

## 🔧 Gestion des Erreurs API

### Frontend

Le client API gère automatiquement les erreurs :

```tsx
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/errors';

try {
  const response = await apiClient.get('/api/users');
} catch (error) {
  const appError = handleApiError(error);
  // appError est une instance de AppError
  console.error(appError.code, appError.message);
}
```

### Backend

Les exceptions sont gérées automatiquement :

```python
from app.core.exceptions import NotFoundException, ValidationException

# Dans un endpoint
if not user:
    raise NotFoundException("User not found")

# Validation
if not email_valid:
    raise ValidationException("Invalid email", details={"field": "email"})
```

## 🎨 Pages d'Erreur Next.js

### error.tsx

Page d'erreur globale pour les erreurs non gérées :

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }) {
  return <ErrorDisplay error={error} onRetry={reset} />;
}
```

### not-found.tsx

Page 404 personnalisée :

```tsx
// app/not-found.tsx
import { NotFoundError } from '@/lib/errors';

export default function NotFound() {
  return <ErrorDisplay error={new NotFoundError()} />;
}
```

### global-error.tsx

Boundary d'erreur pour le layout racine :

```tsx
// app/global-error.tsx
'use client';

export default function GlobalError({ error, reset }) {
  return <ErrorDisplay error={error} onRetry={reset} />;
}
```

## 🔍 Types d'Erreurs

### Codes d'Erreur

```typescript
enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
}
```

### Classes d'Erreur

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} from '@/lib/errors';

throw new NotFoundError('User not found');
throw new ValidationError('Invalid input', { field: 'email' });
```

## 📊 Format des Réponses d'Erreur API

Toutes les erreurs API suivent ce format :

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {
      "resource": "user",
      "id": "123"
    },
    "validationErrors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid"
      }
    ]
  },
  "timestamp": "2025-12-21T18:00:00.000Z"
}
```

## 🛠️ Utilisation Pratique

### Dans un composant React

```tsx
'use client';

import { useState } from 'react';
import { ApiError } from '@/components/errors';
import { apiClient } from '@/lib/api/client';
import { useLogger } from '@/hooks/useLogger';

export function UserList() {
  const [error, setError] = useState(null);
  const log = useLogger();

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      log.info('Users fetched', { count: response.data?.length });
    } catch (err) {
      setError(err);
      log.error('Failed to fetch users', err);
    }
  };

  if (error) {
    return <ApiError error={error} onRetry={fetchUsers} />;
  }

  return <div>...</div>;
}
```

### Dans un endpoint FastAPI

```python
from app.core.exceptions import NotFoundException
from app.core.logging import logger

@router.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        logger.warning("User not found", context={"user_id": user_id})
        raise NotFoundException("User not found", details={"user_id": user_id})
    
    logger.info("User retrieved", context={"user_id": user_id})
    return user
```

## 🔐 Gestion des Erreurs d'Authentification

```tsx
import { UnauthorizedError } from '@/lib/errors';

try {
  await apiClient.get('/api/protected');
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Rediriger vers la page de connexion
    router.push('/auth/signin');
  }
}
```

## 📈 Monitoring et Tracking

En production, les erreurs sont automatiquement envoyées aux services de tracking :

- **Frontend** : Intégration avec Sentry (à configurer)
- **Backend** : Logs structurés JSON pour agrégation

## 🧪 Tests

```typescript
import { NotFoundError } from '@/lib/errors';

test('should throw NotFoundError', () => {
  expect(() => {
    throw new NotFoundError('Not found');
  }).toThrow(NotFoundError);
});
```

## 📚 Ressources

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [FastAPI Exception Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/)

