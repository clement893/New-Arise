# Audit : Délais de Propagation des Changements Backend/BDD vers Frontend

**Date**: 2026-01-11  
**Objectif**: Identifier les causes des délais de plusieurs minutes entre les changements sur le backend/BDD et leur affichage sur le frontend

---

## 🔍 Résumé Exécutif

L'audit a identifié **plusieurs mécanismes de cache empilés** qui créent des délais cumulatifs de **5 à 10 minutes** avant que les changements backend/BDD soient visibles sur le frontend.

**Problème principal**: Les données sont considérées "fraîches" pendant 5 minutes par React Query, ce qui empêche le refetch automatique même si elles changent dans la base de données.

---

## 📊 Analyse des Mécanismes de Cache

### 1. React Query (TanStack Query) - Frontend

**Fichier**: `apps/web/src/lib/query/queryClient.ts`

**Configuration actuelle**:
```typescript
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,      // ⚠️ 5 MINUTES - Données considérées "fraîches"
    gcTime: 1000 * 60 * 10,         // ⚠️ 10 MINUTES - Cache persiste en mémoire
    refetchOnWindowFocus: true,      // ✅ Refetch sur focus (production seulement)
    refetchOnReconnect: true,        // ✅ Refetch sur reconnexion
    refetchOnMount: false,           // ❌ NE REFETCH PAS au montage si données fraîches
  }
}
```

**Impact**:
- ❌ Les données sont considérées "fraîches" pendant **5 minutes**
- ❌ Même si les données changent dans la BDD, React Query ne refetch pas automatiquement
- ❌ `refetchOnMount: false` empêche le refetch lors de la navigation entre pages
- ⚠️ Seul le focus de la fenêtre déclenche un refetch (en production)

**Délai estimé**: **5 minutes** avant refetch automatique (via window focus)

---

### 2. Service Worker - Cache Navigateur

**Fichier**: `apps/web/public/sw.js`

**Configuration actuelle**:
```javascript
// API requests - Network First avec cache
if (url.pathname.startsWith('/api/')) {
  event.respondWith(networkFirst(request, API_CACHE_NAME, 60000)); // ⚠️ 1 MINUTE cache
}

// HTML pages - Network First avec cache
if (request.headers.get('accept')?.includes('text/html')) {
  event.respondWith(networkFirst(request, CACHE_NAME, 300000)); // ⚠️ 5 MINUTES cache
}

// Default - Stale While Revalidate
event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
```

**Impact**:
- ⚠️ Les requêtes API sont cachées pendant **1 minute**
- ⚠️ Les pages HTML sont cachées pendant **5 minutes**
- ✅ Stratégie "Network First" = Essaie le réseau d'abord, fallback cache
- ⚠️ Stratégie "Stale While Revalidate" = Affiche cache pendant refetch en arrière-plan

**Délai estimé**: **1 à 5 minutes** selon le type de ressource

---

### 3. Cache Headers Backend - HTTP Cache

**Fichier**: `backend/app/core/cache_headers.py`

**Configuration actuelle**:
```python
class CacheHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_max_age: int = 300):  # ⚠️ 5 MINUTES par défaut
        self.default_max_age = default_max_age

    def _get_cache_max_age(self, path: str) -> int:
        # Cache spécifique par endpoint
        if '/themes' in path:
            return 600  # ⚠️ 10 MINUTES pour themes
        # ... autres règles
        return self.default_max_age  # ⚠️ 5 MINUTES par défaut
```

**Headers HTTP générés**:
```
Cache-Control: public, max-age=300, must-revalidate  # ⚠️ 5 MINUTES
Expires: <date + 5 minutes>
ETag: <hash>
```

**Impact**:
- ⚠️ Le navigateur/cache intermédiaire peut cacher les réponses pendant **5 minutes**
- ⚠️ Les endpoints `/themes` sont cachés pendant **10 minutes**
- ⚠️ Même si React Query refetch, le navigateur peut retourner une réponse en cache

**Délai estimé**: **5 minutes** (10 minutes pour themes)

---

### 4. Cache Backend (Redis/Memory Cache)

**Fichier**: `backend/app/core/cache.py`

**Décorateurs trouvés**:
```python
@cached(expire=600, key_prefix="theme")  # ⚠️ 10 MINUTES pour certains endpoints
```

**Impact**:
- ⚠️ Certains endpoints utilisent un cache backend (Redis/Memory) avec TTL
- ⚠️ Même si la BDD change, le backend peut retourner des données en cache
- ✅ L'invalidation de cache est implémentée mais peut être incomplète

**Délai estimé**: **Jusqu'à 10 minutes** selon l'endpoint

---

## 🎯 Délai Total Cumulatif

### Scénario 1: Données fraîches (dans les 5 premières minutes)
1. **Backend Cache**: 0-10 min (selon endpoint)
2. **HTTP Cache Headers**: 0-5 min (navigateur/CDN)
3. **Service Worker**: 0-1 min (API) ou 0-5 min (HTML)
4. **React Query staleTime**: 0-5 min (données considérées fraîches)
5. **React Query gcTime**: 0-10 min (cache en mémoire)

**Délai total**: **5 à 10 minutes** avant refetch automatique

### Scénario 2: Après focus de fenêtre (production)
1. React Query détecte le focus
2. Vérifie si données sont "stales" (> 5 min)
3. Refetch si stale
4. Mais peut recevoir réponse en cache HTTP (5 min)
5. Ou réponse en cache Service Worker (1-5 min)

**Délai total**: **1 à 5 minutes** après focus de fenêtre

---

## ✅ Bonnes Pratiques Actuelles

1. ✅ **Invalidation de cache après mutations**:
   - Les mutations utilisent `queryClient.invalidateQueries()` pour invalider le cache React Query
   - Le backend invalide les patterns de cache après modifications

2. ✅ **Service Worker "Network First"**:
   - Essaie le réseau d'abord avant le cache
   - Stratégie correcte pour des données fréquemment mises à jour

3. ✅ **Refetch on reconnect**:
   - React Query refetch automatiquement après reconnexion réseau

---

## ❌ Problèmes Identifiés

### Problème 1: staleTime trop élevé (5 minutes)
**Impact**: Les données sont considérées "fraîches" pendant 5 minutes, empêchant le refetch automatique même si elles changent dans la BDD.

**Fréquence**: Affecte TOUTES les requêtes React Query

### Problème 2: refetchOnMount: false
**Impact**: Lors de la navigation entre pages, React Query ne refetch pas si les données sont "fraîches" (< 5 min).

**Fréquence**: Affecte la navigation entre pages

### Problème 3: HTTP Cache Headers (5 minutes)
**Impact**: Le navigateur peut retourner une réponse en cache même si React Query fait une nouvelle requête.

**Fréquence**: Affecte toutes les requêtes HTTP

### Problème 4: Service Worker Cache (1-5 minutes)
**Impact**: Le Service Worker peut retourner une réponse en cache même si le réseau est disponible.

**Fréquence**: Affecte les requêtes API et pages HTML

### Problème 5: Cache Backend (jusqu'à 10 minutes)
**Impact**: Certains endpoints backend utilisent un cache avec TTL élevé, retardant la propagation des changements.

**Fréquence**: Affecte certains endpoints spécifiques (ex: themes)

---

## 🔧 Recommandations

### Priorité 1: Réduire staleTime de React Query

**Action**: Réduire `staleTime` de 5 minutes à 30 secondes ou 1 minute pour les données fréquemment mises à jour.

**Fichier**: `apps/web/src/lib/query/queryClient.ts`

**Avant**:
```typescript
staleTime: 1000 * 60 * 5,  // 5 minutes
```

**Après**:
```typescript
staleTime: 1000 * 30,  // 30 secondes pour données fréquemment mises à jour
```

**Impact**: Les données seront refetch plus fréquemment, réduisant le délai de 5 minutes à 30 secondes.

**Trade-off**: Plus de requêtes API, mais données plus à jour.

---

### Priorité 2: Activer refetchOnMount conditionnellement

**Action**: Activer `refetchOnMount: true` ou utiliser une stratégie conditionnelle basée sur le type de données.

**Fichier**: `apps/web/src/lib/query/queryClient.ts`

**Avant**:
```typescript
refetchOnMount: false,
```

**Après**:
```typescript
refetchOnMount: true,  // Ou 'always' pour forcer le refetch
```

**Impact**: Les données seront refetch lors de la navigation entre pages.

**Trade-off**: Plus de requêtes API, mais données toujours à jour lors de la navigation.

---

### Priorité 3: Réduire HTTP Cache Headers

**Action**: Réduire `default_max_age` de 5 minutes à 30 secondes ou 1 minute pour les données fréquemment mises à jour.

**Fichier**: `backend/app/core/cache_headers.py`

**Avant**:
```python
default_max_age: int = 300  # 5 minutes
```

**Après**:
```python
default_max_age: int = 30  # 30 secondes
```

**Impact**: Le navigateur/cache intermédiaire ne cachera les réponses que 30 secondes.

**Trade-off**: Plus de requêtes HTTP, mais données plus à jour.

**Alternative**: Utiliser `Cache-Control: no-cache, must-revalidate` pour les endpoints critiques (assessments, evaluators, etc.)

---

### Priorité 4: Réduire Service Worker Cache

**Action**: Réduire le TTL du cache Service Worker pour les requêtes API de 1 minute à 30 secondes.

**Fichier**: `apps/web/public/sw.js`

**Avant**:
```javascript
event.respondWith(networkFirst(request, API_CACHE_NAME, 60000)); // 1 minute
```

**Après**:
```javascript
event.respondWith(networkFirst(request, API_CACHE_NAME, 30000)); // 30 secondes
```

**Impact**: Le Service Worker ne cachera les requêtes API que 30 secondes.

**Trade-off**: Légèrement plus de requêtes réseau, mais données plus à jour.

---

### Priorité 5: Invalidation de cache après mutations

**Action**: Vérifier que toutes les mutations invalident correctement les queries associées.

**Fichier**: Vérifier tous les fichiers `useMutation` dans `apps/web/src`

**Exemple actuel (correct)**:
```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['data'] });
  },
});
```

**Impact**: Les données seront refetch immédiatement après une mutation.

---

### Priorité 6: Utiliser refetchInterval pour données critiques

**Action**: Ajouter `refetchInterval` pour les données critiques qui doivent être mises à jour fréquemment.

**Exemple**:
```typescript
const { data } = useQuery({
  queryKey: ['evaluators', assessmentId],
  queryFn: fetchEvaluators,
  staleTime: 1000 * 30,  // 30 secondes
  refetchInterval: 1000 * 60,  // Refetch toutes les minutes
});
```

**Impact**: Les données critiques seront refetch automatiquement toutes les minutes.

**Trade-off**: Requêtes API périodiques même si pas de changement.

---

### Priorité 7: Désactiver cache backend pour endpoints critiques

**Action**: Désactiver ou réduire le cache backend pour les endpoints fréquemment modifiés (assessments, evaluators, etc.).

**Fichier**: `backend/app/api/v1/endpoints/`

**Impact**: Les changements dans la BDD seront immédiatement visibles via l'API.

---

## 📈 Impact Estimé des Recommandations

### Scénario Optimisé (après recommandations)

**Délai total**: **0 à 30 secondes** (au lieu de 5-10 minutes)

1. **Backend Cache**: 0-30 sec (réduit ou désactivé)
2. **HTTP Cache Headers**: 0-30 sec (réduit)
3. **Service Worker**: 0-30 sec (réduit)
4. **React Query staleTime**: 0-30 sec (réduit)
5. **refetchOnMount**: ✅ Actif (refetch immédiat)

**Amélioration**: **90-95% de réduction du délai**

---

## 🎯 Plan d'Action Recommandé

### Phase 1: Corrections Rapides (1-2 heures)
1. ✅ Réduire `staleTime` React Query à 30 secondes
2. ✅ Activer `refetchOnMount: true`
3. ✅ Vérifier invalidation de cache après mutations

### Phase 2: Optimisations Backend (2-4 heures)
4. ✅ Réduire HTTP Cache Headers à 30 secondes
5. ✅ Réduire Service Worker cache à 30 secondes
6. ✅ Désactiver cache backend pour endpoints critiques

### Phase 3: Optimisations Avancées (optionnel)
7. ✅ Utiliser `refetchInterval` pour données critiques
8. ✅ Implémenter WebSockets/SSE pour mises à jour en temps réel
9. ✅ Utiliser `stale-while-revalidate` avec TTL court

---

## 📝 Notes Supplémentaires

### Données Rarement Modifiées
Pour les données rarement modifiées (ex: configuration de thème, paramètres système), les délais de cache actuels (5-10 minutes) sont acceptables et peuvent être maintenus.

### Données Fréquemment Modifiées
Pour les données fréquemment modifiées (ex: assessments, evaluators, résultats), les délais de cache doivent être réduits à 30 secondes ou moins.

### Stratégie Hybride Recommandée
Utiliser des `staleTime` différents selon le type de données:
- **Données critiques/fréquentes**: 30 secondes
- **Données modérées**: 2 minutes
- **Données statiques**: 10 minutes

---

## 🔗 Fichiers à Modifier

1. `apps/web/src/lib/query/queryClient.ts` - Configuration React Query
2. `backend/app/core/cache_headers.py` - HTTP Cache Headers
3. `apps/web/public/sw.js` - Service Worker Cache
4. `backend/app/core/cache.py` - Backend Cache Configuration
5. `backend/app/api/v1/endpoints/*.py` - Cache spécifique par endpoint

---

## ✅ Validation

Après implémentation, tester:
1. Modifier une donnée dans la BDD
2. Vérifier que le changement est visible sur le frontend dans les **30 secondes**
3. Vérifier que les mutations invalident correctement le cache
4. Vérifier que la navigation entre pages refetch les données

---

**Auteur**: Audit Automatique  
**Date**: 2026-01-11  
**Version**: 1.0
