# Plan de Création des Pages Manquantes du Footer ARISE

## Date: 2024
## Objectif: Créer toutes les pages référencées dans le footer ARISE qui n'existent pas encore

---

## 📋 État Actuel des Pages du Footer ARISE

### Pages existantes ✅
- `/help` - Help Center (existe: `apps/web/src/app/[locale]/help/page.tsx`)
- `/help/faq` - FAQ (existe: `apps/web/src/app/[locale]/help/faq/page.tsx`)

### Pages manquantes ❌

#### Section "About Us"
1. **`/about`** - Our Story
2. **`/team`** - Team
3. **`/careers`** - Careers

#### Section "Support"
4. **`/contact`** - Contact Us

#### Section "Legal"
5. **`/privacy`** - Privacy Policy
6. **`/terms`** - Terms of Service
7. **`/cookies`** - Cookie Policy

---

## 🎯 Plan d'Implémentation

### Phase 1: Pages "About Us"

#### 1.1 Page `/about` (Our Story)
**Fichier:** `apps/web/src/app/[locale]/about/page.tsx`

**Contenu suggéré:**
- Histoire d'ARISE
- Mission et vision
- Valeurs
- Timeline de l'entreprise
- Images/illustrations

**Structure:**
- Hero section avec titre "Our Story"
- Sections: Mission, Vision, Values, Timeline
- Call-to-action vers les assessments

#### 1.2 Page `/team` (Team)
**Fichier:** `apps/web/src/app/[locale]/team/page.tsx`

**Contenu suggéré:**
- Présentation de l'équipe
- Membres clés avec photos et descriptions
- Expertises
- Contact de l'équipe

**Structure:**
- Hero section "Meet Our Team"
- Grille de membres de l'équipe
- Sections par département/expertise

#### 1.3 Page `/careers` (Careers)
**Fichier:** `apps/web/src/app/[locale]/careers/page.tsx`

**Contenu suggéré:**
- Offres d'emploi
- Culture d'entreprise
- Avantages
- Processus de recrutement
- Formulaire de candidature

**Structure:**
- Hero section "Join Our Team"
- Liste des postes ouverts
- Section culture et avantages
- Formulaire de contact pour candidatures spontanées

---

### Phase 2: Page "Support"

#### 2.1 Page `/contact` (Contact Us)
**Fichier:** `apps/web/src/app/[locale]/contact/page.tsx`

**Contenu suggéré:**
- Formulaire de contact
- Informations de contact (email, téléphone, adresse)
- Horaires de support
- Carte (optionnelle)
- FAQ rapide

**Structure:**
- Hero section "Contact Us"
- Formulaire de contact avec validation
- Informations de contact
- Section FAQ rapide avec liens vers /help/faq

---

### Phase 3: Pages "Legal"

#### 3.1 Page `/privacy` (Privacy Policy)
**Fichier:** `apps/web/src/app/[locale]/privacy/page.tsx`

**Contenu suggéré:**
- Politique de confidentialité complète
- Collecte de données
- Utilisation des données
- Partage des données
- Droits des utilisateurs (RGPD)
- Cookies
- Sécurité
- Modifications de la politique

**Structure:**
- Titre "Privacy Policy"
- Sections numérotées avec table des matières
- Dernière mise à jour
- Contact pour questions

#### 3.2 Page `/terms` (Terms of Service)
**Fichier:** `apps/web/src/app/[locale]/terms/page.tsx`

**Contenu suggéré:**
- Conditions d'utilisation
- Acceptation des termes
- Utilisation du service
- Comptes utilisateurs
- Propriété intellectuelle
- Limitation de responsabilité
- Résiliation
- Modifications des termes

**Structure:**
- Titre "Terms of Service"
- Sections numérotées avec table des matières
- Dernière mise à jour
- Contact pour questions

#### 3.3 Page `/cookies` (Cookie Policy)
**Fichier:** `apps/web/src/app/[locale]/cookies/page.tsx`

**Contenu suggéré:**
- Qu'est-ce qu'un cookie
- Types de cookies utilisés
- Cookies essentiels
- Cookies analytiques
- Cookies de marketing
- Gestion des cookies
- Cookies tiers
- Dernière mise à jour

**Structure:**
- Titre "Cookie Policy"
- Explication des cookies
- Liste des cookies utilisés avec descriptions
- Instructions pour gérer les cookies
- Lien vers les paramètres de cookies

---

## 📝 Structure Commune pour Toutes les Pages

### Layout Standard
Toutes les pages doivent :
- Utiliser le Header ARISE (`@/components/landing/Header`)
- Utiliser le Footer ARISE (`@/components/landing/Footer`)
- Avoir un design cohérent avec le reste du site
- Être responsive
- Avoir un SEO optimisé (metadata)

### Template de Base

```typescript
'use client';

import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';

export default function PageName() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Page Title
            </h1>
            <p className="text-gray-600">
              Page description
            </p>
          </div>
        </MotionDiv>
        
        {/* Content sections */}
        <div className="space-y-8">
          {/* Add content here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## 🔧 Détails d'Implémentation par Page

### Page `/about` - Our Story

**Sections à inclure:**
1. Hero: "Our Story" avec image de fond
2. Mission: "Empowering authentic leaders"
3. Vision: "A world where every leader reaches their full potential"
4. Values: Liste des valeurs (Authenticity, Growth, Impact, etc.)
5. Timeline: Histoire de l'entreprise
6. CTA: "Start Your Leadership Journey"

**Composants nécessaires:**
- HeroSection (réutilisable)
- Timeline component
- Values grid

---

### Page `/team` - Team

**Sections à inclure:**
1. Hero: "Meet Our Team"
2. Leadership Team: Photos et descriptions
3. Advisory Board (optionnel)
4. Join Us: CTA vers /careers

**Composants nécessaires:**
- TeamMemberCard component
- Grid layout pour les membres

**Données nécessaires:**
- Liste des membres de l'équipe avec:
  - Nom
  - Photo
  - Titre/Rôle
  - Bio
  - LinkedIn (optionnel)

---

### Page `/careers` - Careers

**Sections à inclure:**
1. Hero: "Join Our Team"
2. Open Positions: Liste des postes ouverts
3. Why Work With Us: Avantages et culture
4. Application Process: Étapes du recrutement
5. Contact Form: Candidature spontanée

**Composants nécessaires:**
- JobListingCard component
- ApplicationForm component
- BenefitsList component

**Fonctionnalités:**
- Liste des postes (peut être statique ou dynamique)
- Formulaire de candidature avec upload CV
- Email notification (backend)

---

### Page `/contact` - Contact Us

**Sections à inclure:**
1. Hero: "Get in Touch"
2. Contact Form: Formulaire avec validation
3. Contact Information: Email, téléphone, adresse
4. Office Hours: Horaires de support
5. Quick FAQ: Liens vers questions fréquentes

**Composants nécessaires:**
- ContactForm component avec validation
- ContactInfoCard component

**Fonctionnalités:**
- Formulaire de contact avec validation
- Envoi d'email (backend)
- Protection contre spam (reCAPTCHA optionnel)

---

### Page `/privacy` - Privacy Policy

**Sections à inclure:**
1. Introduction
2. Information We Collect
3. How We Use Your Information
4. Information Sharing
5. Your Rights (RGPD)
6. Data Security
7. Cookies
8. Changes to Privacy Policy
9. Contact Information

**Format:**
- Texte structuré avec sections numérotées
- Table des matières (optionnel)
- Dernière mise à jour visible
- Format légal mais lisible

---

### Page `/terms` - Terms of Service

**Sections à inclure:**
1. Acceptance of Terms
2. Description of Service
3. User Accounts
4. Use of Service
5. Intellectual Property
6. Payment Terms (si applicable)
7. Limitation of Liability
8. Termination
9. Changes to Terms
10. Governing Law

**Format:**
- Texte structuré avec sections numérotées
- Table des matières (optionnel)
- Dernière mise à jour visible
- Format légal mais lisible

---

### Page `/cookies` - Cookie Policy

**Sections à inclure:**
1. What Are Cookies
2. Types of Cookies We Use
   - Essential Cookies
   - Analytics Cookies
   - Marketing Cookies
3. Third-Party Cookies
4. Managing Cookies
5. Cookie Settings
6. Updates to Cookie Policy

**Format:**
- Explication claire et simple
- Tableau des cookies avec descriptions
- Instructions pour gérer les cookies
- Lien vers les paramètres de cookies dans l'application

---

## 📊 Priorité d'Implémentation

### Priorité Haute (Pages essentielles)
1. **`/privacy`** - Obligatoire légalement (RGPD)
2. **`/terms`** - Obligatoire légalement
3. **`/contact`** - Important pour le support client
4. **`/cookies`** - Obligatoire légalement (RGPD)

### Priorité Moyenne (Pages importantes)
5. **`/about`** - Important pour la crédibilité
6. **`/team`** - Important pour la confiance

### Priorité Basse (Pages optionnelles)
7. **`/careers`** - Utile si recrutement actif

---

## ✅ Checklist de Validation

Pour chaque page créée:
- [ ] Page créée avec le bon chemin
- [ ] Utilise Header ARISE
- [ ] Utilise Footer ARISE
- [ ] Design cohérent avec le reste du site
- [ ] Responsive (mobile, tablette, desktop)
- [ ] SEO optimisé (metadata, title, description)
- [ ] Contenu complet et pertinent
- [ ] Liens fonctionnels
- [ ] Accessibilité (ARIA, contraste, etc.)
- [ ] Testé sur différents navigateurs

---

## 🔗 Liens dans le Footer

Le footer ARISE (`components/landing/Footer.tsx`) référence ces pages:
- `/about` → Our Story
- `/team` → Team
- `/careers` → Careers
- `/help` → Help Center ✅ (existe)
- `/contact` → Contact Us
- `/faq` → FAQ ✅ (existe: `/help/faq`)
- `/privacy` → Privacy Policy
- `/terms` → Terms of Service
- `/cookies` → Cookie Policy

**Note:** Le footer référence `/faq` mais la page existe à `/help/faq`. Il faudra soit:
- Créer une redirection de `/faq` vers `/help/faq`
- Ou créer une page `/faq` qui redirige
- Ou modifier le footer pour pointer vers `/help/faq`

---

## 📌 Notes Importantes

1. **Contenu légal:** Les pages Privacy, Terms et Cookies doivent être révisées par un avocat avant publication
2. **Traduction:** Toutes les pages doivent être traduites (français/anglais au minimum)
3. **RGPD:** Les pages Privacy et Cookies doivent être conformes RGPD
4. **Maintenance:** Les dates de dernière mise à jour doivent être maintenues à jour
5. **Contact:** Toutes les pages légales doivent avoir un moyen de contact pour questions

---

## 🚀 Prochaines Étapes

1. ✅ Corriger le double footer (fait)
2. Créer les pages légales en priorité (Privacy, Terms, Cookies)
3. Créer la page Contact
4. Créer les pages About et Team
5. Créer la page Careers (si nécessaire)
6. Vérifier/Corriger le lien FAQ dans le footer
