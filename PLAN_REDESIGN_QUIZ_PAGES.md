# Plan de Redesign des Pages de Quiz

## Analyse du Design Cible (d'après l'image)

### Structure actuelle vs. souhaitée

**Design actuel:**
- Barre de progression en haut (simple)
- Carte avec badge de pilier, question, 5 boutons en grille
- Navigation en bas (Back, Next)

**Design souhaité:**
- **Header** avec:
  - Icône (cœur) à gauche
  - "Title" (nom du pilier/catégorie)
  - "Question 00/00" au centre
  - Barre de progression "0% completed"
  - "Label" à droite
- **Zone Question** avec:
  - Icône du pilier (ex: dumbbell pour Movement)
  - Question principale en grand
  - Sous-titre explicatif (ex: "At least 3 times a week")
- **Boutons de réponse** (5 boutons horizontaux):
  - Format: "Not at all 1/5", "Rarely 2/5", "Sometimes 3/5", "Often 4/5", "Always 5/5"
  - Bouton sélectionné: fond gris foncé avec texte clair
  - Boutons non sélectionnés: fond blanc avec texte foncé
- **Footer** avec:
  - Bouton "Back" à gauche
  - Compteur "01 / 30 responses" au centre
  - Bouton "Next →" à droite (teal foncé)

---

## Changements à Effectuer

### 1. **Header Redesign** 
**Fichiers concernés:**
- `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`
- `apps/web/src/app/[locale]/dashboard/assessments/tki/page.tsx` (si applicable)

**Changements:**
- Créer un header structuré avec:
  - Icône du pilier à gauche (utiliser les icônes existantes de `wellnessPillars`)
  - Titre du pilier (ex: "Movement", "Sleep", etc.)
  - "Question {current+1} / {total}" au centre
  - Barre de progression avec pourcentage "X% completed"
  - Label du pilier à droite (badge)

**Structure HTML:**
```tsx
<header className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="text-2xl">{pillarIcon}</div>
    <span className="font-semibold">{pillarName}</span>
  </div>
  <div className="text-center">
    <span>Question {current+1} / {total}</span>
    <div className="progress-bar">X% completed</div>
  </div>
  <div className="badge">{pillarLabel}</div>
</header>
```

---

### 2. **Zone Question Redesign**
**Fichiers concernés:**
- `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`

**Changements:**
- Réorganiser la zone question:
  - Afficher l'icône du pilier (grande, visible)
  - Question principale en grand texte
  - Ajouter un sous-titre si disponible (pour certaines questions comme "I engage in regular physical activity" → "At least 3 times a week")

**Note:** Certaines questions peuvent nécessiter l'ajout de sous-titres dans les données. Pour l'instant, on peut utiliser le nom du pilier comme sous-titre ou laisser vide.

---

### 3. **Boutons de Réponse Redesign**
**Fichiers concernés:**
- `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`

**Changements:**
- Changer le format des boutons:
  - De grille 5 colonnes → 5 boutons horizontaux en ligne
  - Format du texte: "{Label} {value}/5" (ex: "Not at all 1/5")
  - Style sélectionné: fond gris foncé (`bg-gray-800` ou `bg-gray-700`) avec texte blanc
  - Style non sélectionné: fond blanc avec texte gris foncé
  - Supprimer les icônes de checkmark, utiliser le fond coloré comme indicateur

**Mapping des labels:**
- 1: "Not at all"
- 2: "Rarely" 
- 3: "Sometimes"
- 4: "Often"
- 5: "Always"

**Structure HTML:**
```tsx
<div className="flex gap-3">
  {scaleOptions.map((option) => (
    <button className={`
      flex-1 p-4 rounded-lg border-2
      ${selected ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
    `}>
      {getLabel(option.value)} {option.value}/5
    </button>
  ))}
</div>
```

---

### 4. **Footer Redesign**
**Fichiers concernés:**
- `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`
- `apps/web/src/app/[locale]/dashboard/assessments/tki/page.tsx`

**Changements:**
- Restructurer le footer:
  - Bouton "Back" à gauche
  - Compteur de réponses au centre: "{answered} / {total} responses"
  - Bouton "Next →" à droite (teal foncé `bg-arise-deep-teal`)

**Structure HTML:**
```tsx
<footer className="flex items-center justify-between mt-8">
  <Button variant="outline">Back</Button>
  <span className="text-gray-600">{answeredCount} / {totalQuestions} responses</span>
  <Button variant="primary" className="bg-arise-deep-teal">
    Next →
  </Button>
</footer>
```

---

### 5. **Layout Global**
**Fichiers concernés:**
- `apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`

**Changements:**
- La carte principale doit être centrée verticalement
- Fond avec image floutée (déjà présent)
- Carte blanche avec ombre portée
- Espacement cohérent entre les sections

---

## Fichiers à Modifier

1. **`apps/web/src/app/[locale]/dashboard/assessments/wellness/page.tsx`**
   - Section Question Screen (lignes ~513-612)
   - Restructurer complètement le layout

2. **`apps/web/src/data/wellnessQuestionsReal.ts`** (optionnel)
   - Ajouter des sous-titres aux questions si nécessaire
   - Ou créer un mapping label/value pour les boutons

---

## Fonctionnalités à Préserver

- ✅ Logique de navigation (next/previous)
- ✅ Sauvegarde des réponses
- ✅ Barre de progression fonctionnelle
- ✅ Validation (ne peut pas avancer sans réponse)
- ✅ Gestion des états (loading, errors)
- ✅ Responsive design

---

## Ordre d'Implémentation

1. **Étape 1:** Créer le nouveau header avec icône, titre, question count, et label
2. **Étape 2:** Redesigner la zone question avec icône et sous-titre
3. **Étape 3:** Transformer les boutons de réponse (format horizontal, nouveau style)
4. **Étape 4:** Redesigner le footer avec compteur de réponses
5. **Étape 5:** Ajuster le layout global et l'espacement
6. **Étape 6:** Tester sur toutes les tailles d'écran (responsive)
7. **Étape 7:** Appliquer les mêmes changements à TKI si nécessaire

---

## Questions à Clarifier

1. **Sous-titres:** Doit-on ajouter des sous-titres explicatifs pour toutes les questions ou seulement certaines?
2. **TKI:** Le design doit-il être appliqué aussi à la page TKI (qui a un format différent avec 2 options A/B)?
3. **Icônes:** Utiliser les icônes emoji existantes des piliers ou des icônes Lucide React?
4. **Responsive:** Comment adapter le layout sur mobile (boutons horizontaux → vertical?)

---

## Estimation

- **Temps estimé:** 2-3 heures
- **Complexité:** Moyenne
- **Risques:** 
  - Besoin de tester le responsive
  - Possible besoin d'ajuster les données (sous-titres)

---

## Validation

Avant de commencer, confirmer:
- [ ] Le design correspond bien à l'image fournie
- [ ] Les changements doivent s'appliquer à Wellness ET TKI, ou seulement Wellness?
- [ ] Les sous-titres sont-ils nécessaires pour toutes les questions?
