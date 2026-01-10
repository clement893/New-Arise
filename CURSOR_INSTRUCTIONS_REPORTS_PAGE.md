# ✅ Instructions pour Cursor - Création de la Page /dashboard/reports

**Objectif:** Créer une page de rapports complète et dynamique qui affiche les résultats de tous les assessments complétés, en se basant sur le fichier Excel officiel ARISE.

---

## 1. Problème Actuel

La page `/dashboard/reports` actuelle est une **maquette statique**.
- Elle ne charge **pas** les vrais résultats des assessments.
- La section "Your Assessment Results" est **vide** (juste un spinner).
- Les "Key Insights" sont des données **mockées**.

**Le but est de la rendre 100% fonctionnelle.**

---

## 2. Architecture de la Page

La page doit être composée de 4 sections principales:

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
- **Bouton:** "Download Complete Leadership Profile" (qui générera un PDF complet).

---

## 3. Instructions pour Cursor (Étape par Étape)

### Étape 1: Rendre la Liste des Résultats Dynamique

**Fichier à modifier:** `/apps/web/src/app/[locale]/dashboard/reports/page.tsx`

1. **Supprimer les données mockées:**
   - Supprimer le tableau `insights` (lignes 125-150).

2. **Charger les vrais résultats:**
   - La fonction `loadAssessments()` charge déjà les assessments. C'est parfait.
   - La fonction transforme les données pour l'affichage. C'est aussi parfait.

3. **Afficher les résultats dans la liste:**
   - La boucle `assessments.map()` (ligne 244) est déjà en place.
   - **Vérifier que les données affichées sont correctes:**
     - `assessment.name`
     - `assessment.completedDate`
     - `assessment.score`
     - `assessment.result`

### Étape 2: Rendre les Key Insights Dynamiques

1. **Créer une fonction pour générer les insights:**
   - Dans `page.tsx`, créer une nouvelle fonction `generateKeyInsights(assessments: AssessmentDisplay[])`.
   - Cette fonction doit parcourir les assessments complétés et générer un insight pour chaque type (TKI, Wellness, 360°, MBTI).

2. **Logique pour chaque insight:**
   - **TKI:** "Your dominant conflict style is **{dominant_mode}**, which is effective for..."
   - **Wellness:** "Your wellness score is **{percentage}%**. Your strongest pillar is **{strongest_pillar}** and your weakest is **{weakest_pillar}**."
   - **360°:** "Your 360° feedback shows a gap of **{gap}** in **{capability_with_biggest_gap}**."
   - **MBTI:** "Your personality type is **{mbti_type}** ({description})."

3. **Afficher les insights dynamiques:**
   - Remplacer les cartes statiques par une boucle qui affiche les insights générés.

### Étape 3: Activer les Boutons de Téléchargement

1. **Bouton "Export All":**
   - Doit appeler une fonction qui génère un zip de tous les PDFs de résultats.

2. **Bouton "Download Complete Leadership Profile":**
   - Doit appeler une fonction qui génère un PDF de synthèse complet avec:
     - Page de garde
     - Introduction
     - Section MBTI
     - Section TKI
     - Section Wellness
     - Section 360°
     - Plan de développement

### Étape 4: Mettre à Jour les Statistiques Globales

1. **Assessments Complétés:**
   - `assessments.length` (déjà correct)

2. **Score Moyen:**
   - Calculer la moyenne des pourcentages de tous les assessments (déjà correct)

3. **Objectifs de Développement:**
   - Créer un endpoint backend pour compter les objectifs de développement de l'utilisateur.
   - Appeler cet endpoint et afficher le nombre.

4. **Évaluateurs 360°:**
   - Créer un endpoint backend pour compter le nombre d'évaluateurs invités.
   - Appeler cet endpoint et afficher le nombre.

---

## 4. Exemple de Code pour Cursor

### `page.tsx` - Génération des Key Insights

```typescript
// Dans ResultsReportsContent()

const [keyInsights, setKeyInsights] = useState<any[]>([]);

useEffect(() => {
  if (assessments.length > 0) {
    const insights = generateKeyInsights(assessments);
    setKeyInsights(insights);
  }
}, [assessments]);

const generateKeyInsights = (assessments: AssessmentDisplay[]) => {
  const insights = [];

  // TKI Insight
  const tki = assessments.find(a => a.type === 'TKI');
  if (tki) {
    insights.push({
      title: 'Conflict Resolution',
      category: 'TKI',
      description: `Your dominant conflict style is ${tki.result}, which is effective for...`
    });
  }

  // Wellness Insight
  const wellness = assessments.find(a => a.type === 'WELLNESS');
  if (wellness) {
    // (logique pour trouver strongest/weakest pillar)
    insights.push({
      title: 'Wellness Focus',
      category: 'Wellness',
      description: `Your wellness score is ${wellness.score}. Your strongest pillar is...`
    });
  }

  // ... (logique pour 360° et MBTI)

  return insights;
};

// ...

// Dans le JSX, remplacer les cartes statiques par:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {keyInsights.map(insight => (
    <Card key={insight.title} className="p-6">
      <h3 className="font-bold">{insight.title}</h3>
      <p className="text-sm">{insight.description}</p>
    </Card>
  ))}
</div>
```

---

## ✅ Résumé pour Cursor

1. **Rendre la liste des résultats dynamique** (déjà presque fait).
2. **Rendre les Key Insights dynamiques** en créant la fonction `generateKeyInsights()`.
3. **Activer les boutons de téléchargement** en créant les fonctions d'export PDF.
4. **Mettre à jour les statistiques globales** en créant 2 nouveaux endpoints backend (objectifs et évaluateurs).

**Une fois ces 4 étapes terminées, la page `/dashboard/reports` sera 100% fonctionnelle et fidèle au plan.**
