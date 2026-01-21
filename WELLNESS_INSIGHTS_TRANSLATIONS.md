# Traductions Wellness Insights

Comme il y a 24 insights (6 pillars × 4 score ranges), je vais créer un script pour générer toutes les traductions.

Pour l'instant, ajoutons une fonction helper pour obtenir les insights dans la bonne langue.

## Fonction à ajouter dans wellnessInsights.ts:

```typescript
/**
 * Get insight with proper language
 */
export function getWellnessInsightWithLocale(
  pillar: string, 
  score: number,
  locale: string = 'en'
): {
  assessment: string;
  recommendation: string;
  actions: string[];
  colorCode: string;
} | null {
  const insight = getWellnessInsight(pillar, score);
  if (!insight) return null;
  
  const isFrench = locale === 'fr' || locale.startsWith('fr');
  
  return {
    assessment: isFrench ? insight.assessmentFr : insight.assessment,
    recommendation: isFrench ? insight.recommendationFr : insight.recommendation,
    actions: isFrench ? insight.actionsFr : insight.actions,
    colorCode: insight.colorCode
  };
}
```

## Messages de traduction pour la section Key Insights:

### EN:
```json
"insights": {
  "title": "Key Insights",
  "strengths": {
    "title": "Strengths",
    "noStrengths": "No strengths identified yet. Keep building your wellness habits!",
    "levels": {
      "strongFoundation": "STRONG FOUNDATION - Healthy habits are established and practiced most of the time. Continuing to refine and maintain consistency will keep this pillar robust.",
      "consistencyStage": "CONSISTENCY STAGE - Good habits are in place and showing progress, though not always steady. With more regularity, this pillar can become a solid strength."
    }
  },
  "growth": {
    "title": "Areas for Growth",
    "allStrong": "Great work! All pillars are showing strong performance.",
    "levels": {
      "earlyDevelopment": "EARLY DEVELOPMENT - Some positive habits are present, but they are irregular or not yet sustainable. Building consistency will strengthen this pillar.",
      "significantOpportunity": "SIGNIFICANT GROWTH OPPORTUNITY - Currently limited or inconsistent practices in this area. A focused effort can create meaningful improvement in your overall well-being."
    }
  }
}
```

### FR:
```json
"insights": {
  "title": "Insights clés",
  "strengths": {
    "title": "Forces",
    "noStrengths": "Aucune force identifiée pour le moment. Continuez à développer vos habitudes de bien-être!",
    "levels": {
      "strongFoundation": "FONDATION SOLIDE - Les habitudes saines sont établies et pratiquées la plupart du temps. Continuer à les raffiner et maintenir la cohérence gardera ce pilier robuste.",
      "consistencyStage": "STADE DE COHÉRENCE - Les bonnes habitudes sont en place et progressent, bien que pas toujours de façon régulière. Avec plus de régularité, ce pilier peut devenir une force solide."
    }
  },
  "growth": {
    "title": "Domaines de croissance",
    "allStrong": "Excellent travail! Tous les piliers montrent une forte performance.",
    "levels": {
      "earlyDevelopment": "DÉVELOPPEMENT PRÉCOCE - Certaines habitudes positives sont présentes, mais elles sont irrégulières ou pas encore durables. Construire la cohérence renforcera ce pilier.",
      "significantOpportunity": "OPPORTUNITÉ DE CROISSANCE SIGNIFICATIVE - Pratiques actuellement limitées ou incohérentes dans ce domaine. Un effort concentré peut créer une amélioration significative de votre bien-être général."
    }
  }
}
```
