# Plan de Correction de l'Audit - Par Batch

## 📋 Vue d'Ensemble

Plan de correction des problèmes identifiés dans l'audit, organisé en batches logiques avec push à chaque étape.

---

## 🔴 Batch 1 : Remplacer console.log par logger (CRITIQUE)

**Priorité:** Critique  
**Impact:** Sécurité, Performance, Qualité  
**Effort:** Moyen  
**Fichiers:** ~51 fichiers avec 224 occurrences

### Objectifs
- Remplacer tous les `console.log/error/warn` par le système de logging
- Utiliser `logger.debug()` pour développement uniquement
- Garder `logger.error()` pour les erreurs critiques

### Fichiers à modifier
- `apps/web/src/hooks/usePreferences.ts`
- `apps/web/src/lib/theme/presets.ts`
- `apps/web/src/lib/performance/webVitals.ts`
- `apps/web/src/lib/logger.ts`
- `apps/web/src/lib/logger/index.ts`
- Et ~46 autres fichiers

### Commande de vérification
```bash
grep -r "console\.\(log\|error\|warn\)" apps/web/src --include="*.ts" --include="*.tsx" | wc -l
```

---

## 🔴 Batch 2 : Headers de Sécurité (CRITIQUE)

**Priorité:** Critique  
**Impact:** Sécurité  
**Effort:** Faible-Moyen  
**Fichiers:** Middleware, configuration

### Objectifs
- Ajouter CSP (Content Security Policy)
- Ajouter HSTS (HTTP Strict Transport Security)
- Ajouter X-Frame-Options, X-Content-Type-Options
- Ajouter Referrer-Policy

### Fichiers à modifier
- `backend/app/main.py` (middleware)
- `apps/web/src/middleware.ts` (headers Next.js)
- `backend/app/core/security.py` (si nécessaire)

---

## 🟡 Batch 3 : Résoudre les TODO Critiques (IMPORTANT)

**Priorité:** Important  
**Impact:** Qualité, Maintenance  
**Effort:** Variable  
**Fichiers:** ~137 fichiers avec 305 occurrences

### Objectifs
- Analyser les TODO/FIXME/XXX/HACK/BUG
- Résoudre les critiques (sécurité, bugs)
- Créer des issues GitHub pour les autres
- Documenter les décisions

### Fichiers prioritaires
- `apps/web/src/lib/api/client.ts` (2 TODO)
- `apps/web/src/lib/api/theme.ts` (4 TODO)
- `apps/web/src/lib/api.ts` (7 TODO)
- `apps/web/src/lib/errors/api.ts` (8 TODO)
- `apps/web/src/components/auth/ProtectedRoute.tsx` (9 TODO)

---

## 🟡 Batch 4 : Optimisations Performance (IMPORTANT)

**Priorité:** Important  
**Impact:** Performance  
**Effort:** Moyen  
**Fichiers:** Services, composants

### Objectifs
- Résoudre les requêtes N+1
- Optimiser les requêtes avec `joinedload`/`selectinload`
- Ajouter lazy loading pour images
- Analyser bundle size

### Fichiers à modifier
- `backend/app/services/*.py` (requêtes N+1)
- `apps/web/src/components/**/*.tsx` (lazy loading)
- `backend/app/core/pagination.py` (optimisations)

---

## 🟢 Batch 5 : Améliorer Couverture de Tests (AMÉLIORATION)

**Priorité:** Amélioration  
**Impact:** Qualité, Maintenance  
**Effort:** Élevé  
**Fichiers:** Tests

### Objectifs
- Augmenter couverture à >80% pour code critique
- Ajouter tests de sécurité (XSS, CSRF)
- Tests d'intégration frontend
- Tests de rate limiting

---

## 🟢 Batch 6 : Documentation et Nettoyage (AMÉLIORATION)

**Priorité:** Amélioration  
**Impact:** Maintenance  
**Effort:** Faible-Moyen  
**Fichiers:** Documentation

### Objectifs
- Compléter documentation API
- Ajouter exemples OpenAPI
- Nettoyer code dupliqué
- Factoriser utilitaires

---

## 📅 Plan d'Exécution

1. **Batch 1** → Push → Vérification
2. **Batch 2** → Push → Vérification
3. **Batch 3** → Push → Vérification
4. **Batch 4** → Push → Vérification
5. **Batch 5** → Push → Vérification
6. **Batch 6** → Push → Vérification

---

## ✅ Checklist de Progression

- [ ] Batch 1 : console.log → logger
- [ ] Batch 2 : Headers de sécurité
- [ ] Batch 3 : TODO critiques
- [ ] Batch 4 : Optimisations performance
- [ ] Batch 5 : Couverture de tests
- [ ] Batch 6 : Documentation

---

## 📝 Notes

- Chaque batch sera commité et poussé séparément
- Tests de régression après chaque batch
- Documentation mise à jour au fur et à mesure
