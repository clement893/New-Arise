# ✅ Instructions pour Cursor - Création de la Page /dashboard/reports (basé sur Excel)

**Objectif:** Créer une page de rapports complète et dynamique qui **agrège les résultats de tous les assessments**, en se basant sur le fichier Excel officiel ARISE.

---

## 1. Analyse du Template Excel

Le fichier Excel ne contient **pas** de feuille dédiée à une page "Reports" ou "Dashboard".

**Conclusion:** La page `/dashboard/reports` doit être une **synthèse** des résultats de toutes les autres feuilles (TKI, Wellness, 360°, MBTI).

---

## 2. Architecture de la Page (selon l'analyse)

La page doit être une **vue d'ensemble** qui permet à l'utilisateur de voir ses résultats clés en un coup d'œil et de naviguer vers les rapports détaillés.

### Section 1: Statistiques Globales
- **4 cartes:**
  - Assessments Complétés (nombre)
  - Score Moyen (pourcentage)
  - Objectifs de Développement (nombre)
  - Évaluateurs 360° (nombre)

### Section 2: Liste des Résultats d'Assessments
- **Titre:** "Your Assessment Results"
- **Contenu:** Une liste dynamique des assessments complétés.
- **Chaque item doit afficher:**
  - Nom de l'assessment (ex: "TKI Conflict Style")
  - Date de complétion
  - Score principal (ex: 85%, ou type MBTI)
  - Bouton "View Details" qui redirige vers la page de résultats détaillée.

### Section 3: Key Insights (Aperçus Clés)
- **Titre:** "Key Insights"
- **Contenu:** 4 cartes qui résument les points les plus importants de chaque assessment.
- **Chaque carte doit afficher:**
  - Titre (ex: "Leadership Style")
  - Catégorie (ex: "Personality")
  - Un insight concis (ex: "Your INTJ personality type indicates a strategic and analytical approach to leadership.")

### Section 4: Profil de Leadership Complet
- **Titre:** "Your Comprehensive Leadership Profile"
- **Contenu:** 4 cartes qui lient vers les pages de résultats détaillées.
- **Bouton:** "Download Complete Leadership Profile" (qui générera un PDF de synthèse).

---

## 3. Ce Qui Manque (Gaps)

La page actuelle est une **maquette statique**. Voici ce qui manque pour la rendre fonctionnelle:

1. **Chargement des Données Réelles:**
   - La page doit appeler l'endpoint `getMyAssessments()` pour récupérer les vrais résultats.

2. **Liste des Résultats Dynamique:**
   - La section "Your Assessment Results" doit afficher la liste des assessments retournés par l'API.

3. **Key Insights Dynamiques:**
   - Les 4 cartes d'insights doivent être générées dynamiquement à partir des résultats.

4. **Statistiques Globales Dynamiques:**
   - Les 4 cartes de statistiques doivent être calculées à partir des données réelles.

5. **Boutons d'Export Fonctionnels:**
   - Les boutons "Export All" et "Download Complete Leadership Profile" doivent être activés.

---

## 4. Instructions pour Cursor (Étape par Étape)

### Étape 1: Rendre la Page 100% Dynamique

**Fichier à modifier:** `/apps/web/src/app/[locale]/dashboard/reports/page.tsx`

1. **Charger les Données:**
   - La fonction `loadAssessments()` est déjà en place. Il faut s'assurer qu'elle est appelée au chargement de la page.

2. **Afficher la Liste des Résultats:**
   - Utiliser la variable `assessments` (qui contient les résultats de l'API) pour afficher la liste des assessments complétés.
   - La boucle `assessments.map()` (ligne 244) est déjà là, il faut juste s'assurer qu'elle fonctionne avec les vraies données.

3. **Générer les Key Insights:**
   - Créer une fonction `generateKeyInsights(assessments)` qui prend les résultats et génère les 4 insights.
   - **Logique pour chaque insight:**
     - **TKI:** "Your dominant conflict style is **{dominant_mode}**..."
     - **Wellness:** "Your wellness score is **{percentage}%**. Your strongest pillar is **{strongest_pillar}**..."
     - **360°:** "Your 360° feedback shows a gap of **{gap}** in **{capability_with_biggest_gap}**..."
     - **MBTI:** "Your personality type is **{mbti_type}**..."

4. **Mettre à Jour les Statistiques:**
   - **Assessments Complétés:** `assessments.length`
   - **Score Moyen:** Calculer la moyenne des scores
   - **Objectifs & Évaluateurs:** Créer 2 nouveaux endpoints backend pour récupérer ces chiffres.

### Étape 2: Activer les Boutons d'Export

1. **Bouton "Export All":**
   - Doit appeler une fonction qui:
     - Récupère tous les IDs des assessments complétés
     - Appelle l'endpoint `/assessments/{id}/pdf` pour chaque ID
     - Crée un fichier zip avec tous les PDFs

2. **Bouton "Download Complete Leadership Profile":**
   - Doit appeler un nouvel endpoint backend `/reports/comprehensive-profile/pdf` qui génère un PDF de synthèse complet.
   - Ce PDF doit contenir les sections définies dans l'Excel (MBTI, TKI, Wellness, 360°).

---

## 5. Exemple de Code pour Cursor

### `page.tsx` - Rendre la page dynamique

```typescript
// Dans ResultsReportsContent()

const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [keyInsights, setKeyInsights] = useState<any[]>([]);
const [stats, setStats] = useState({ completed: 0, avgScore: 0, goals: 0, evaluators: 0 });

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setIsLoading(true);
    const apiAssessments = await getMyAssessments();
    const completed = apiAssessments.filter(a => a.status === 'COMPLETED');
    
    // Transformer les données
    const transformed = transformAssessments(completed);
    setAssessments(transformed);
    
    // Générer les insights
    const insights = generateKeyInsights(transformed);
    setKeyInsights(insights);
    
    // Calculer les stats
    const calculatedStats = calculateStats(transformed);
    setStats(calculatedStats);
    
  } catch (err) {
    // ...
  } finally {
    setIsLoading(false);
  }
};

// ... (implémenter transformAssessments, generateKeyInsights, calculateStats)

// Dans le JSX, utiliser les variables d'état (assessments, keyInsights, stats)
// pour afficher les données dynamiques.
```

---

## ✅ Résumé pour Cursor

1. **Rendre la page dynamique** en chargeant les vrais résultats avec `getMyAssessments()`.
2. **Afficher la liste des assessments** complétés.
3. **Générer les Key Insights** dynamiquement.
4. **Calculer les statistiques globales** (et créer 2 endpoints backend pour les objectifs et évaluateurs).
5. **Activer les boutons d'export PDF** en créant les fonctions d'export.

**Une fois ces 5 étapes terminées, la page `/dashboard/reports` sera 100% fonctionnelle et fidèle à la vision du produit définie dans le template Excel.**
