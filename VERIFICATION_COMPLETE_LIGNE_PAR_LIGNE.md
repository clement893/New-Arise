# Vérification Complète Ligne par Ligne - Tous les Changements

## ✅ CHANGEMENTS COMPLÉTÉS

### 1. Header - Bouton "commencer"
- ✅ **Demande**: Ajouter un fond #D8B868 au bouton "commencer". Arrondir les contours du blocs à 16px. Ajouter du padding au bouton.
- ✅ **Fait**: `apps/web/src/components/landing/Header.tsx` lignes 75, 85 - style={{ borderRadius: '16px', padding: '12px 24px' }}, className="bg-[#D8B868]"

### 2. Header - Ligne sous header
- ✅ **Demande**: Sous le header, trace une ligne de 1px à #00000 5%
- ✅ **Fait**: `apps/web/src/components/landing/Header.tsx` ligne 185 - `<div className="h-px bg-black" style={{ opacity: 0.05 }}></div>`

### 3. Typography - Inter → Open Sans
- ✅ **Demande**: Change les textes en "inter" en "Open Sans"
- ✅ **Fait**: 
  - `apps/web/src/lib/theme/default-theme-config.ts` lignes 20, 25-27
  - `backend/app/core/theme_defaults.py` lignes 19, 24-26

### 4. Typography - Bold → Medium
- ⚠️ **Demande**: Les titres en graisse Bold deviennent en graisse "Medium"
- ⚠️ **Statut**: PARTIELLEMENT FAIT - La config a été changée mais tous les `font-bold` dans le code n'ont pas été remplacés par `font-medium`. Il y a encore ~15 occurrences de `font-bold` dans le code.

### 5. Tarifs - FAQ Titre
- ✅ **Demande**: Sur la page pricing la section "Questions fréquentes" : écris le titre en Semi Bold et en couleur or.
- ✅ **Fait**: `apps/web/src/app/[locale]/pricing/page.tsx` ligne 283 - `font-semibold` et `style={{ color: '#D8B868' }}`

### 6. Tarifs - FAQ Blocs plus larges
- ✅ **Demande**: Sur la page pricing la section "Questions fréquentes" : rends plus large les blocs questions, donc réduis les marges de ce bloc.
- ✅ **Fait**: `apps/web/src/app/[locale]/pricing/page.tsx` ligne 282 - `max-w-3xl` → `max-w-4xl`

### 7. Tarifs - Marges réduites
- ✅ **Demande**: Sur la page pricing réduis les marges gauches et droites comme sur la page d'accueil
- ✅ **Fait**: `apps/web/src/app/[locale]/pricing/page.tsx` ligne 241 - `padding={false}` et ligne 242 - `px-[11px]` (comme la page d'accueil)

### 8. Register - Espace au-dessus étapes (x4)
- ✅ **Demande**: Sur la page register, augmente x4 l'espace au-dessus de la section étapes
- ✅ **Fait**: `apps/web/src/app/[locale]/register/page.tsx` ligne 95 - `pt-24` → `pt-96` (4x)

### 9. Register - Espace avant footer (x6)
- ✅ **Demande**: Augmente x6 l'espace avant le footer
- ✅ **Fait**: `apps/web/src/app/[locale]/register/page.tsx` ligne 124 - `<div className="h-96"></div>`

### 10. Register Step 1 - Retirer bloc blanc
- ✅ **Demande**: Sur la page register, retire le bloc blanc principal, qui est derrière les 3 blocs "individual" ; "coach" ; "business"
- ✅ **Fait**: `apps/web/src/components/register/Step1_RoleSelection.tsx` ligne 37 - `bg-white rounded-lg shadow-xl` → retiré

### 11. Register Step 2 - Centrer bouton cocher
- ✅ **Demande**: Sur la page Étape 02, Centrer le bouton que l'on peut cocher en hauteur
- ✅ **Fait**: `apps/web/src/components/register/Step2_PlanSelection.tsx` ligne 204 - ajouté `self-center`

### 12. Register Step 3 - Rapprocher titre
- ✅ **Demande**: Sur la page Étape 03, rapprocher le titre "Enter your information to get started" de "create your account"
- ✅ **Fait**: `apps/web/src/components/register/Step3_CreateAccount.tsx` ligne 110 - `mb-2` → `mb-1`

### 13. Register Step 4 - Garder bouton
- ✅ **Demande**: Sur la page register : bien garder le bouton "continue to payment"
- ✅ **Fait**: Déjà présent dans `Step4_ReviewConfirm.tsx` ligne 79

### 14. Register Step 5 - Retirer fond blanc Payment
- ✅ **Demande**: Sur la page register, pour rappel, retirer le fond blanc derrière le bloc "Payment"
- ✅ **Fait**: `apps/web/src/components/register/Step5_Payment.tsx` ligne 355 - `bg-white` retiré

### 15. Register Step 5 - Order Summary fond
- ✅ **Demande**: Garde le fond pour le bloc "Order Summary" et change la couleur de fond #FFFFF en #00000 en 10% d'opacité et arrière fond flou à 40. Le contenu texte sera blanc.
- ✅ **Fait**: `apps/web/src/components/register/Step5_Payment.tsx` ligne 467 - style avec `backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(40px)'` et texte blanc

### 16. Register Step 5 - Bloc garanties fond
- ✅ **Demande**: Sur la page register, change le fond du bloc #F5F5DC en #00000 en 20% d'opacité
- ✅ **Fait**: `apps/web/src/components/register/Step5_Payment.tsx` ligne 493 - `style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}`

### 17. Register Step 5 - Prix sous Total
- ✅ **Demande**: Sur la page register, place le prix sous le mot "total" et non à sa droite
- ✅ **Fait**: `apps/web/src/components/register/Step5_Payment.tsx` ligne 485 - `flex justify-between` → `flex flex-col`

### 18. Register Step 6 - Retirer Skip
- ✅ **Demande**: Sur la page register retirer le bouton "skip for now"
- ✅ **Fait**: `apps/web/src/components/register/Step6_CompleteProfile.tsx` lignes 72-80 - bouton "Skip for now" retiré

### 19. Register Step 7 - Espacements 120px
- ✅ **Demande**: Sur la page register Ajouter 120px d'espace au-dessus et en dessous du bloc du contenu
- ✅ **Fait**: `apps/web/src/components/register/Step7_Welcome.tsx` ligne 26 - `style={{ paddingTop: '120px', paddingBottom: '120px' }}`

### 20. Register Step 7 - Retirer fond blanc, texte blanc
- ✅ **Demande**: Sur la page register Retirer le fond blanc du bloc. Mettre le titre et le texte en blanc
- ✅ **Fait**: `apps/web/src/components/register/Step7_Welcome.tsx` lignes 27, 32, 36, 40 - fond blanc retiré, texte en blanc

### 21. Register Step 7 - What's next fond
- ✅ **Demande**: Sur le bloc contenant le texte "What's next?", changer la couleur du fond en #00000 10% d'opacité avec un arrière-fond flou à 40
- ✅ **Fait**: `apps/web/src/components/register/Step7_Welcome.tsx` ligne 44 - style avec `backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(40px)'`

## ❌ CHANGEMENTS NON FAITS (nécessitent images Google Drive)

### 22-26. À propos - Redesigns
- ❌ Hero : reprends le même design que sur cette image A propos_01
- ❌ Notre Mission - Vision : reprends le même design que sur cette image A propos_02
- ❌ Nos valeurs : reprends le même design que sur cette image A propos_03
- ❌ Notre parcours : reprends le même design que sur cette image A propos_04
- ❌ Prêt à commencer : reprends le même design que sur cette image A propos_05

### 27. Accueil - CTA
- ❌ Prêt à commencer votre parcours de leadership ? : reprends le même design que sur cette image A propos_05

### 28-29. Tarifs - Redesigns
- ❌ Hero : reprends le design de l'image Tarifs_01
- ❌ Prix : reprends le design de l'image Tarifs_02

### 30-31. Actualités et insights - Redesigns
- ❌ Hero : reprends le design de l'image "Actus_01"
- ❌ Seconde section : reprends le design de l'image "Actus_02"

### 32. Header - Design bouton
- ❌ Sur le header, le bouton "commencer" : fais le même design que sur l'image "bouton_Header"

### 33. Commencer - 2 - Discover our plans
- ❌ Ajouter entre l'étape 1 et l'étape 2 un "Discover our plans". Design dans le lien Google Drive

## 📋 CHANGEMENTS À FAIRE (sans images nécessaires)

### Dashboard - Sidebar et Layout

### 34. Dashboard - Réduire largeur sidebar 20%
- ❌ **Demande**: Réduire de 20% la largeur de la colonne de gauche (w-64 → ~w-51)
- **Fichier**: `apps/web/src/components/dashboard/Sidebar.tsx` ligne 28
- **Action**: Changer `w-64` en `w-51` (256px → 204px, soit 20% de réduction)

### 35-36. Dashboard - Flèche sidebar sens
- ❌ **Demande**: L'icône dans la colonne de gauche, à gauche de "Log Out" et maison : c'est une flèche. La flèche est dans le mauvais sens. Tourne-le à 180 degrés.
- **Fichier**: `apps/web/src/components/ui/Sidebar.tsx` ligne 379-384 (ChevronRight)
- **Action**: Inverser la rotation ou utiliser ChevronLeft

### 37. Dashboard - Sidebar collapsed - Icônes seulement
- ❌ **Demande**: Quand je réduis la colonne de gauche avec la flèche, les éléments apparaissent mal. Pour les boutons "Dashboard" ; "Assessments" ;"Results & Reports" ; "Development plan" ; "Profile" : ne garde que les icônes et retire les textes des boutons.
- **Fichier**: `apps/web/src/components/ui/Sidebar.tsx` ligne ~250-265
- **Action**: Ajouter condition `{!collapsed && <span>...</span>}` pour masquer le texte

### 38. Dashboard - Sidebar collapsed - Flèche sens
- ❌ **Demande**: Quand je réduis la colonne de gauche avec la flèche, L'icône dans la colonne de gauche, à gauche de "Log Out" et maison : c'est une flèche. La flèche est dans le mauvais sens. Tourne-le à 180 degrés.
- **Même action que 35-36**

### 39-40. Dashboard - Espace colonne et largeur bloc
- ❌ **Demande**: Réduis l'espace entre la colonne de gauche et le bloc principal. Ensuite, augmente la largeur du bloc principal.
- **Fichier**: `apps/web/src/components/layout/DashboardLayout.tsx` ligne 421-432
- **Action**: Réduire `marginLeft` et `marginRight`, augmenter la largeur du main

### 41. Dashboard - Arrondir bords bloc principal
- ❌ **Demande**: Arrondis les bords du bloc principal : 24px
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 445-459
- **Action**: Ajouter `borderRadius: '24px'` au style du bloc

### 42. Dashboard - Double espace progress/evaluations
- ❌ **Demande**: Double l'espace entre la section "your progress" et "you evaluations"
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 600-602
- **Action**: Augmenter le `mb-8` entre les sections

### 43. Dashboard - Réduire taille boutons
- ❌ **Demande**: Réduis la taille des boutons "Add Assessment" "Add evaluators" "start"
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` lignes 510, 528, 413
- **Action**: Ajouter `size="sm"` ou réduire padding

### 44. Dashboard - Hoverlay evaluation
- ❌ **Demande**: Section "your evaluation" : change la couleur du hoverlay en #0F4C56 20% d'opacité
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 615-624
- **Action**: Changer `#6f949a` en `rgba(15, 76, 86, 0.2)`

### 45. Dashboard - Hoverlay View Reports
- ❌ **Demande**: Section "your progress" : changer le Hoverlay du bouton "View Reports". Réduire le fond du hoverlay en 10% d'opacité
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 587-597
- **Action**: Modifier le hover pour avoir 10% d'opacité

### 46. Dashboard - Aligner boutons start
- ❌ **Demande**: Section "your evaluations" : aligner tous les boutons "start" sur le bas du bloc
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 682-684
- **Action**: Ajouter `mt-auto` au conteneur du bouton

### 47. Dashboard - Ready to accelerate arrondi
- ❌ **Demande**: Section "Ready to accelerate your growth?" : Arrondis les bords à 24px
- **Fichier**: `apps/web/src/app/[locale]/dashboard/page.tsx` ligne 696-737
- **Action**: Ajouter `borderRadius: '24px'` au style

### Start a 360° Feedback Assessment

### 48. 360 Start - Corriger couleur #0F4RDC
- ❌ **Demande**: Change les couleurs #0F4RDC en #0F4C56 (corriger la faute de frappe)
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx`
- **Action**: Rechercher et remplacer toutes les occurrences

### 49. 360 Start - Fond bloc principal
- ❌ **Demande**: Change la couleur du fond du bloc principal en #D5DEE0
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx`
- **Action**: Ajouter style au Container ou Card principal

### 50. 360 Start - Réduire paddings boutons
- ❌ **Demande**: Réduis de 50% les paddings autour des boutons "cancel" , "skip the step" , "ajouter un évaluateur"
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx` lignes 526-545
- **Action**: Réduire padding des boutons

### 51. 360 Start - Style boutons
- ❌ **Demande**: Les boutons "cancel" , "skip the step" , "ajouter un évaluateur" : contour de 1px couleur or #D8B868 et texte or #D8B868 100% d'opacité
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx` lignes 526-545
- **Action**: Ajouter `border: '1px solid #D8B868'` et `color: '#D8B868'`

### 52. 360 Start - Aligner Évaluateur 1
- ❌ **Demande**: Aligner le mot "Évaluateur 1" sur la gauche, comme le mot "nom complet"
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/start/page.tsx`
- **Action**: Vérifier l'alignement du label

### 360° Feedback Assessment (page principale)

### 53. 360 Feedback - Corriger couleur #0F4RDC
- ❌ **Demande**: Change les couleurs #0F4RDC en #0F4C56
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/page.tsx`
- **Action**: Rechercher et remplacer

### 54. 360 Feedback - Largeur bloc et espace
- ❌ **Demande**: Augmente la largeur du bloc principal et réduis de 50% l'espace entre la colonne et le bloc principal
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/page.tsx`
- **Action**: Modifier les marges et largeur

### 55. 360 Feedback - Fond bloc principal
- ❌ **Demande**: Change la couleur du fond du bloc principal en #D5DEE0
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/360-feedback/page.tsx`
- **Action**: Ajouter style

### Mes évaluateurs

### 56. Evaluators - Boutons retour/actualiser
- ❌ **Demande**: Réduire la taille des boutons "retour" et 'actualiser'. Retirer le contour. Mettre le contenu en blanc #FFFFF
- **Fichier**: `apps/web/src/app/[locale]/dashboard/evaluators/page.tsx`
- **Action**: Trouver les boutons et modifier

### 57. Evaluators - Aligner symbole +
- ❌ **Demande**: Aligner le symbole "+" à la gauche du mot "Ajouter des évaluateurs" dans le bouton. Le bloc doit faire la largeur de ces 2 éléments + padding
- **Fichier**: `apps/web/src/app/[locale]/dashboard/evaluators/page.tsx`
- **Action**: Modifier le layout du bouton

### Assessment

### 58. Assessments - Fond et arrondi
- ❌ **Demande**: Change la couleur du fond du bloc principal en #D5DEE0 et ajoute un arrondi au bloc de 24px
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` ligne 1094-1107
- **Action**: Ajouter style

### 59. Assessments - Corriger couleur #0F4RDC
- ❌ **Demande**: Change les couleurs #0F4RDC en #0F4C56
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
- **Action**: Rechercher et remplacer

### 60. Assessments - Réduire taille boutons
- ❌ **Demande**: Réduire la taille des boutons "take the test" ; "upload your test" ; 'start"" ; ""voir tous"" ; ""ajouter"""
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
- **Action**: Ajouter `size="sm"`

### 61. Assessments - Bouton actualiser
- ❌ **Demande**: Retirer le contour autour du bouton "acutaliser". Réduire le padding du bouton
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
- **Action**: Trouver le bouton et modifier

### 62. Assessments - Réduire espace colonne
- ❌ **Demande**: Réduire de 50% l'espace entre la colonne et le bloc principal
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
- **Action**: Modifier les marges

### 63. Assessments - Aligner texte gauche
- ❌ **Demande**: Aligner le texte "Vos assessments Suivez et gérez vos assessments de leadership" sur la gauche du bloc principal
- **Fichier**: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` ligne 1084-1091
- **Action**: Changer `text-center` en `text-left` ou retirer centrage

### Results & Reports

### 64. Reports - Aligner texte gauche
- ❌ **Demande**: Aligner le texte sur la gauche du bloc principal "Results & Reports View your assessment results and comprehensive leadership profile"
- **Fichier**: `apps/web/src/app/[locale]/dashboard/reports/page.tsx` ligne 531-540
- **Action**: Retirer centrage si présent

### 65. Reports - Fond et arrondi
- ❌ **Demande**: Change la couleur du fond du bloc principal en #D5DEE0. Mets des bords arrondis à 24px
- **Fichier**: `apps/web/src/app/[locale]/dashboard/reports/page.tsx` ligne 618-632
- **Action**: Modifier le style du bloc

### 66. Reports - Titre "reports" en or
- ❌ **Demande**: Dans le titre "Results & Reports", mettre "reports" en or #D8B868
- **Fichier**: `apps/web/src/app/[locale]/dashboard/reports/page.tsx` ligne 534
- **Action**: Splitter le titre et colorer "Reports"

### 67. Reports - Icône blanc
- ❌ **Demande**: Section Your Assessment Results : Mets l'icone à la gauche du titre en blanc et non en noir
- **Fichier**: `apps/web/src/app/[locale]/dashboard/reports/page.tsx` ligne 687-688
- **Action**: Changer `text-arise-deep-teal` en `text-white`

### 68. Reports - Réduire hauteur bloc
- ❌ **Demande**: Section Your Assessment Results : Réduis la hauteur de ce bloc de 50%
- **Fichier**: `apps/web/src/app/[locale]/dashboard/reports/page.tsx` ligne 684-766
- **Action**: Réduire padding ou hauteur

### Development Plan

### 69. Development Plan - Titre "plan" en or
- ❌ **Demande**: Dans le titre "Development Plan" mets "plan" en or #D8B868
- **Fichier**: `apps/web/src/app/[locale]/dashboard/development-plan/page.tsx` ligne 83
- **Action**: Splitter le titre et colorer "Plan"

### 70. Development Plan - Recommended Resources icône
- ❌ **Demande**: Section "Recommended Resources" : ajoute un fond derrière l'icône de couleur #0F4C56 10%. Mets l'icone en #0F4C56 100%
- **Fichier**: `apps/web/src/app/[locale]/dashboard/development-plan/page.tsx` ligne 155-156
- **Action**: Modifier le style de l'icône

### 71. Development Plan - Your Development Goals icône
- ❌ **Demande**: Section "Your Development Goals" : ajoute un fond derrière l'icône de couleur #0F4C56 10%. Mets l'icone en #0F4C56 100%
- **Fichier**: `apps/web/src/app/[locale]/dashboard/development-plan/page.tsx` ligne 95-96
- **Action**: Modifier le style de l'icône

### 72. Development Plan - Your progress icône
- ❌ **Demande**: Section "Your progress" : ajoute un fond derrière l'icône de couleur #0F4C56 10%. Mets l'icone en #0F4C56 100%
- **Fichier**: `apps/web/src/app/[locale]/dashboard/development-plan/page.tsx` ligne 217-218
- **Action**: Modifier le style de l'icône

### Your profile

### 73. Profile - Titre "profile" en or
- ❌ **Demande**: Dans le titre "Your profile", change la couleur du mot "profile en #D8B868
- **Fichier**: `apps/web/src/app/[locale]/profile/page.tsx` ligne 233
- **Action**: Splitter le titre et colorer "profile"

### 74. Profile - Bouton save couleur
- ❌ **Demande**: Change la couleur du mot 'save' dans le bouton en #2E2E2E
- **Fichier**: `apps/web/src/app/[locale]/profile/page.tsx` ligne 484
- **Action**: Modifier la couleur du texte du bouton

## 📊 RÉSUMÉ

- ✅ **Complétés**: 21 changements
- ⚠️ **Partiellement faits**: 1 changement (Bold → Medium)
- ❌ **Non faits (images)**: 12 changements nécessitant les images Google Drive
- ❌ **À faire (sans images)**: 41 changements restants

**Total**: 75 changements demandés
**Complétés**: 21 (28%)
**À faire**: 42 (56%)
**Nécessitent images**: 12 (16%)
