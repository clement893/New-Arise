# Plan d'Implémentation - MBTI avec PDF Upload et OCR

## Vue d'ensemble
Transformation du flux MBTI pour :
1. Rediriger vers 16personalities.com pour le test externe
2. Accepter l'upload d'un PDF de résultats
3. Utiliser OpenAI Vision API pour extraire les résultats via OCR
4. Afficher les résultats extraits dans l'interface

## Architecture

```
[Page Assessments] → [Page MBTI Intro] → [Redirection 16personalities.com]
                                                      ↓
                                              [Retour utilisateur]
                                                      ↓
                                            [Page Upload PDF MBTI]
                                                      ↓
                                            [Backend: Upload + OCR]
                                                      ↓
                                            [Page Résultats MBTI]
```

---

## Phase 1 : Frontend - Modification du flux MBTI

### 1.1 Modifier la page MBTI (`apps/web/src/app/[locale]/dashboard/assessments/mbti/page.tsx`)

**Objectif** : Remplacer les questions par une page d'introduction et de redirection

**Changements** :
- Supprimer toute la logique de questions
- Créer une page d'introduction avec :
  - Description du test MBTI
  - Bouton "Passer le test sur 16Personalities" (lien externe)
  - Instructions pour télécharger le PDF de résultats
  - Bouton "Uploader mon PDF de résultats"

**Fichier à créer/modifier** :
```typescript
// Nouveau composant : MBTI Introduction Page
- Page intro avec instructions
- Lien vers https://www.16personalities.com/personality-types
- Bouton "J'ai terminé le test, uploader mon PDF"
- Redirection vers /dashboard/assessments/mbti/upload
```

### 1.2 Créer la page Upload PDF (`apps/web/src/app/[locale]/dashboard/assessments/mbti/upload/page.tsx`)

**Fonctionnalités** :
- Zone de drag & drop pour PDF
- Validation du fichier (format PDF uniquement, max 10MB)
- Preview du fichier sélectionné
- Bouton "Analyser mon PDF"
- Loading state pendant le traitement
- Gestion des erreurs

**Composants nécessaires** :
- FileUpload component (déjà existe dans `/upload`)
- Progress indicator
- Error display

### 1.3 Modifier la configuration MBTI dans `page.tsx`

**Fichier** : `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

**Changements** :
- Mettre à jour `ASSESSMENT_CONFIG.mbti.externalLink` vers `https://www.16personalities.com/personality-types`
- Modifier le bouton "Commencer" pour rediriger vers `/dashboard/assessments/mbti` (page intro)
- Supprimer la logique de test interne

---

## Phase 2 : Backend - API d'Upload et OCR

### 2.1 Créer le service OCR PDF (`backend/app/services/pdf_ocr_service.py`)

**Fonctionnalités** :
- Utiliser OpenAI Vision API (GPT-4 Vision ou GPT-4o) pour analyser le PDF
- Extraire le type MBTI (INTJ, ENFP, etc.)
- Extraire les scores par dimension (EI, SN, TF, JP)
- Extraire les descriptions et insights si présents

**Structure** :
```python
class PDFOCRService:
    async def extract_mbti_results(pdf_file: UploadFile) -> MBTIResults:
        """
        1. Convertir PDF en images (1 page = 1 image)
        2. Envoyer chaque image à OpenAI Vision API
        3. Extraire texte structuré
        4. Parser les résultats MBTI
        5. Retourner structure normalisée
        """
```

**Prompt OpenAI** :
```
Analysez cette image de résultats de test MBTI de 16Personalities.
Extrayez les informations suivantes au format JSON:
{
  "mbti_type": "INTJ",
  "dimension_preferences": {
    "EI": {"E": 45, "I": 55},
    "SN": {"S": 30, "N": 70},
    "TF": {"T": 65, "F": 35},
    "JP": {"J": 75, "P": 25}
  },
  "description": "...",
  "strengths": ["...", "..."],
  "challenges": ["...", "..."]
}
```

### 2.2 Modifier l'endpoint d'upload pour MBTI

**Fichier** : `backend/app/api/v1/endpoints/assessments.py`

**Nouvel endpoint** :
```python
@router.post("/mbti/upload-pdf", response_model=AssessmentResult)
async def upload_mbti_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    1. Valider le fichier PDF
    2. Appeler OCR service pour extraire résultats
    3. Créer ou mettre à jour l'assessment MBTI
    4. Calculer et sauvegarder les scores
    5. Retourner les résultats formatés
    """
```

**Workflow** :
1. Validation du fichier (PDF, max 10MB)
2. Upload vers S3 (optionnel, pour archive)
3. Conversion PDF → Images (utiliser `pdf2image` ou `PyPDF2` + `Pillow`)
4. OCR avec OpenAI Vision API
5. Parsing des résultats extraits
6. Création/mise à jour de l'assessment MBTI dans la DB
7. Calcul des scores (si nécessaire)
8. Retour des résultats

### 2.3 Dépendances Backend

**Ajouter à `backend/requirements.txt`** :
```
pdf2image>=1.16.3
Pillow>=10.0.0
pymupdf>=1.23.0  # Alternative: PyMuPDF pour conversion PDF
openai>=1.0.0  # Déjà présent
```

**Variables d'environnement** :
```bash
OPENAI_API_KEY=sk-...  # Déjà configuré
OPENAI_MODEL=gpt-4o  # ou gpt-4-vision-preview pour OCR
```

---

## Phase 3 : Intégration Frontend-Backend

### 3.1 Créer l'API client pour upload PDF

**Fichier** : `apps/web/src/lib/api/assessments.ts`

**Nouvelle fonction** :
```typescript
export const uploadMBTIPDF = async (file: File): Promise<AssessmentResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(
    '/v1/assessments/mbti/upload-pdf',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // Gérer le progress
      },
    }
  );
  
  return response.data;
};
```

### 3.2 Modifier la page Upload pour intégrer l'API

**Fichier** : `apps/web/src/app/[locale]/dashboard/assessments/mbti/upload/page.tsx`

**Flux** :
1. User sélectionne/téléverse le PDF
2. Validation côté client
3. Appel API `uploadMBTIPDF(file)`
4. Loading pendant traitement (peut prendre 10-30 secondes)
5. Redirection vers `/dashboard/assessments/mbti/results?id={assessmentId}`

**Gestion d'erreurs** :
- PDF invalide
- OCR échoué (texte non lisible)
- Format de résultats non reconnu
- Timeout (retry possible)

### 3.3 Modifier la page Results pour afficher les résultats OCR

**Fichier** : `apps/web/src/app/[locale]/dashboard/assessments/mbti/results/page.tsx`

**Changements** :
- La page reste la même structure
- Les données viennent maintenant de l'OCR au lieu des réponses
- Ajouter un badge "Résultats extraits depuis PDF" si applicable
- Afficher la confiance de l'extraction (si disponible)

---

## Phase 4 : Améliorations et Optimisations

### 4.1 Cache et Optimisation

- Cache des résultats OCR (éviter de re-traiter le même PDF)
- Compression des images avant envoi à OpenAI
- Retry logic en cas d'échec API

### 4.2 Expérience Utilisateur

- Preview du PDF avant upload
- Progress bar détaillée (Upload → Conversion → OCR → Parsing)
- Messages d'aide si OCR échoue
- Possibilité de corriger manuellement les résultats extraits

### 4.3 Validation et Sécurité

- Validation stricte du format PDF
- Scan antivirus (optionnel)
- Limite de taille de fichier
- Rate limiting sur l'endpoint OCR
- Logs d'audit pour traçabilité

---

## Structure des fichiers à créer/modifier

### Frontend
```
apps/web/src/app/[locale]/dashboard/assessments/mbti/
├── page.tsx (MODIFIER - page intro au lieu de questions)
├── upload/
│   └── page.tsx (NOUVEAU - page upload PDF)
└── results/
    └── page.tsx (MODIFIER - afficher badge OCR si applicable)

apps/web/src/lib/api/
└── assessments.ts (MODIFIER - ajouter uploadMBTIPDF)
```

### Backend
```
backend/app/api/v1/endpoints/
└── assessments.py (MODIFIER - ajouter endpoint upload-pdf)

backend/app/services/
└── pdf_ocr_service.py (NOUVEAU - service OCR)

backend/requirements.txt (MODIFIER - ajouter dépendances PDF)
```

---

## Ordre d'implémentation recommandé

1. **Phase 1.1** : Modifier page MBTI intro (frontend simple)
2. **Phase 2.1** : Créer service OCR (backend, test isolé)
3. **Phase 2.2** : Créer endpoint upload (backend)
4. **Phase 3.1** : Créer API client (frontend)
5. **Phase 1.2** : Créer page upload (frontend)
6. **Phase 3.2** : Intégrer upload dans la page
7. **Phase 3.3** : Vérifier affichage résultats
8. **Phase 4** : Optimisations et améliorations

---

## Tests à prévoir

### Backend
- [ ] Test OCR service avec PDF sample
- [ ] Test endpoint upload avec fichier valide
- [ ] Test validation fichier invalide
- [ ] Test timeout et retry
- [ ] Test parsing de différents formats de résultats

### Frontend
- [ ] Test upload de PDF
- [ ] Test validation côté client
- [ ] Test affichage des résultats
- [ ] Test gestion d'erreurs
- [ ] Test UX flow complet

---

## Notes importantes

1. **Coût OpenAI** : 
   - GPT-4o Vision : ~$0.01 par image
   - Un PDF de 2-3 pages = 2-3 images = $0.02-$0.03 par analyse
   - Prévoir budget mensuel selon volume

2. **Performance** :
   - OCR peut prendre 10-30 secondes
   - Prévoir timeout de 60 secondes
   - Afficher progress bar et messages clairs

3. **Format PDF variable** :
   - 16Personalities peut changer le format
   - Prévoir prompts robustes ou fallback manuel
   - Logger les échecs pour amélioration continue

4. **Alternative si OCR échoue** :
   - Permettre à l'utilisateur de saisir manuellement le type MBTI
   - Ou demander de ré-uploader un PDF plus lisible

---

## Checklist de déploiement

- [ ] Variables d'environnement configurées (OPENAI_API_KEY)
- [ ] Dépendances installées (pdf2image, Pillow)
- [ ] S3 configuré pour stockage PDF (optionnel)
- [ ] Endpoints testés en staging
- [ ] Documentation utilisateur mise à jour
- [ ] Monitoring configuré pour OCR failures
- [ ] Alerts configurées pour API limits OpenAI
