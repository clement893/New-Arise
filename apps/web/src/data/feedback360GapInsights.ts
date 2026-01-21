/**
 * 360° Feedback Gap Insights
 * Textes basés sur la différence entre self_score et others_avg_score (gap)
 * 
 * Gap ranges:
 * - 0: High Self-Awareness (Green: #C6EFCE)
 * - 0.1-0.5 ou -0.5 à -0.1: Good-Partial Self-Awareness (Yellow: #FFEB9C)
 * - > 0.5 ou < -0.5: Limited Self-Awareness (Red: #FFC7CE)
 */

export interface Feedback360GapInsight {
  capability: string;
  gapDirection: 'higher' | 'lower';
  overview: string;
  overviewFr?: string;
  recommendation: string;
  recommendationFr?: string;
}

export const feedback360GapInsights: Feedback360GapInsight[] = [
  // COMMUNICATION GAP INSIGHTS
  {
    capability: 'communication',
    gapDirection: 'higher',
    overview: 'Summary Overview: Your self-perception reflects strong confidence in communication skills; however, others may not experience the same level of clarity or alignment. This suggests a gap between intent and perceived impact.',
    overviewFr: 'Résumé: Votre auto-perception reflète une forte confiance dans vos compétences en communication; cependant, les autres peuvent ne pas ressentir le même niveau de clarté ou d\'alignement. Cela suggère un écart entre l\'intention et l\'impact perçu.',
    recommendation: 'Increase transparency and check for understanding more frequently. Ask stakeholders for real-time feedback to ensure messages are landing as intended.',
    recommendationFr: 'Augmenter la transparence et vérifier la compréhension plus fréquemment. Demander aux parties prenantes des commentaires en temps réel pour s\'assurer que les messages sont bien reçus comme prévu.',
  },
  {
    capability: 'communication',
    gapDirection: 'lower',
    overview: 'Summary Overview: Others perceive your communication as stronger than you do, indicating untapped confidence or skills that are not fully recognized by you.',
    overviewFr: 'Résumé: Les autres perçoivent votre communication comme plus forte que vous ne le pensez, indiquant une confiance ou des compétences inexploitées que vous ne reconnaissez pas pleinement.',
    recommendation: 'Leverage existing strengths by engaging more proactively in discussions, presenting ideas clearly, and asserting viewpoints where helpful.',
    recommendationFr: 'Tirer parti des forces existantes en s\'engageant plus proactivement dans les discussions, en présentant les idées clairement et en affirmant les points de vue lorsque cela est utile.',
  },

  // LEADERSHIP STYLE GAP INSIGHTS
  {
    capability: 'leadership_style',
    gapDirection: 'higher',
    overview: 'Overview: You may believe your leadership approach is effective, while others experience it as less impactful or aligned with their needs.',
    overviewFr: 'Aperçu: Vous pouvez croire que votre approche de leadership est efficace, tandis que les autres la perçoivent comme moins percutante ou alignée avec leurs besoins.',
    recommendation: 'Clarify expectations, request candid feedback, and tailor leadership behaviors to varying preferences and team dynamics.',
    recommendationFr: 'Clarifier les attentes, demander des commentaires francs et adapter les comportements de leadership aux préférences variées et à la dynamique de l\'équipe.',
  },
  {
    capability: 'leadership_style',
    gapDirection: 'lower',
    overview: 'Overview: The team may value your leadership efforts more than you recognize, indicating potential underestimation of influence.',
    overviewFr: 'Aperçu: L\'équipe peut valoriser vos efforts de leadership plus que vous ne le reconnaissez, indiquant une sous-estimation potentielle de l\'influence.',
    recommendation: 'With enhanced overall awareness trust to lean into leadership opportunities with higher confidence—delegate strategically, communicate a clear vision, and provide recognition to strengthen influence.',
    recommendationFr: 'Avec une conscience globale améliorée, faites confiance pour vous engager dans les opportunités de leadership avec plus de confiance—déléguer stratégiquement, communiquer une vision claire et fournir une reconnaissance pour renforcer l\'influence.',
  },

  // TEAM CULTURE GAP INSIGHTS
  {
    capability: 'team_culture',
    gapDirection: 'higher',
    overview: 'Overview: You may feel you\'re contributing strongly to a positive culture, while others may not perceive the same cultural impact or intentionality.',
    overviewFr: 'Aperçu: Vous pouvez sentir que vous contribuez fortement à une culture positive, tandis que les autres peuvent ne pas percevoir le même impact culturel ou l\'intentionnalité.',
    recommendation: 'Increase visible actions that foster culture—rituals, shared norms, collaboration forums—and ensure alignment with team expectations.',
    recommendationFr: 'Augmenter les actions visibles qui favorisent la culture—rituels, normes partagées, forums de collaboration—et assurer l\'alignement avec les attentes de l\'équipe.',
  },
  {
    capability: 'team_culture',
    gapDirection: 'lower',
    overview: 'Overview: The team may feel more supported and engaged culturally than you realize, showing strengths that could be intentionally reinforced.',
    overviewFr: 'Aperçu: L\'équipe peut se sentir plus soutenue et engagée culturellement que vous ne le réalisez, montrant des forces qui pourraient être intentionnellement renforcées.',
    recommendation: 'Continue behaviors that build cohesion and amplify them publicly (e.g., recognizing wins, promoting psychological safety).',
    recommendationFr: 'Continuer les comportements qui construisent la cohésion et les amplifier publiquement (par exemple, reconnaître les victoires, promouvoir la sécurité psychologique).',
  },

  // PROBLEM SOLVING & DECISION MAKING GAP INSIGHTS
  {
    capability: 'problem_solving_and_decision_making',
    gapDirection: 'higher',
    overview: 'Overview: Confidence in analytical or decision-making skills may not fully translate to how others experience structure, clarity, or follow-through.',
    overviewFr: 'Aperçu: La confiance dans les compétences analytiques ou de prise de décision peut ne pas se traduire pleinement dans la façon dont les autres perçoivent la structure, la clarté ou le suivi.',
    recommendation: 'Use structured frameworks (root cause analysis, decision logs) and increase transparency in reasoning to improve alignment.',
    recommendationFr: 'Utiliser des cadres structurés (analyse de la cause racine, journaux de décision) et augmenter la transparence dans le raisonnement pour améliorer l\'alignement.',
  },
  {
    capability: 'problem_solving_and_decision_making',
    gapDirection: 'lower',
    overview: 'Overview: Others may perceive your decision-making as more effective or thoughtful than you recognize, suggesting hidden strengths.',
    overviewFr: 'Aperçu: Les autres peuvent percevoir votre prise de décision comme plus efficace ou réfléchie que vous ne le reconnaissez, suggérant des forces cachées.',
    recommendation: 'Step into more decision-ownership opportunities, especially on initiatives where you already contribute analysis or insights and make your reasoning more visible by verbalizing key drivers, alternatives considered, and criteria—this builds confidence and enhanced alignment.',
    recommendationFr: 'S\'engager dans plus d\'opportunités de propriété de décision, en particulier sur les initiatives où vous contribuez déjà à l\'analyse ou aux insights et rendre votre raisonnement plus visible en verbalisant les facteurs clés, les alternatives considérées et les critères—cela renforce la confiance et l\'alignement amélioré.',
  },

  // STRESS MANAGEMENT GAP INSIGHTS
  {
    capability: 'stress_management',
    gapDirection: 'higher',
    overview: 'Overview: You may feel you handle stress well, but others may observe signs of strain, inconsistent pacing, or emotional spillover.',
    overviewFr: 'Aperçu: Vous pouvez sentir que vous gérez bien le stress, mais les autres peuvent observer des signes de tension, un rythme incohérent ou un débordement émotionnel.',
    recommendation: 'Establish routines that support consistency—prioritize workload planning, communicate boundaries, and model calm under pressure intentionally.',
    recommendationFr: 'Établir des routines qui soutiennent la cohérence—prioriser la planification de la charge de travail, communiquer les limites et modéliser le calme sous pression intentionnellement.',
  },
  {
    capability: 'stress_management',
    gapDirection: 'lower',
    overview: 'Overview: Others may see greater resilience than you perceive, indicating personal expectations may be higher than external impact.',
    overviewFr: 'Aperçu: Les autres peuvent voir une plus grande résilience que vous ne le percevez, indiquant que les attentes personnelles peuvent être plus élevées que l\'impact externe.',
    recommendation: 'Acknowledge resilience as a strength and focus on self-care practices that sustain performance over time, while supporting team in recognizing the same and promoting higher vulnerability for growth.',
    recommendationFr: 'Reconnaître la résilience comme une force et se concentrer sur les pratiques d\'auto-soin qui maintiennent la performance dans le temps, tout en soutenant l\'équipe pour reconnaître la même chose et promouvoir une plus grande vulnérabilité pour la croissance.',
  },

  // CHANGE MANAGEMENT GAP INSIGHTS
  {
    capability: 'change_management',
    gapDirection: 'higher',
    overview: 'Overview: You may see yourself as adaptable and supportive of change while others may experience hesitation or limited visibility into your support.',
    overviewFr: 'Aperçu: Vous pouvez vous voir comme adaptable et favorable au changement tandis que les autres peuvent ressentir de l\'hésitation ou une visibilité limitée de votre soutien.',
    recommendation: 'Increase visible advocacy for new initiatives and engage early with stakeholders to reinforce alignment.',
    recommendationFr: 'Augmenter le plaidoyer visible pour les nouvelles initiatives et s\'engager tôt avec les parties prenantes pour renforcer l\'alignement.',
  },
  {
    capability: 'change_management',
    gapDirection: 'lower',
    overview: 'Overview: Others may recognize adaptability you don\'t fully see in yourself, showing potential for greater influence during transitions.',
    overviewFr: 'Aperçu: Les autres peuvent reconnaître une adaptabilité que vous ne voyez pas pleinement en vous, montrant un potentiel pour une plus grande influence pendant les transitions.',
    recommendation: 'Actively champion change during rollout, not just conceptually—volunteer to pilot initiatives or lead transition workstreams.',
    recommendationFr: 'Défendre activement le changement pendant le déploiement, pas seulement conceptuellement—se porter volontaire pour piloter des initiatives ou diriger des flux de travail de transition.',
  },
];

/**
 * Get gap insight for a specific capability based on gap direction with locale support
 */
export function getFeedback360GapInsightWithLocale(
  capability: string,
  gap: number,
  locale: string = 'en'
): {
  overview: string;
  recommendation: string;
  colorCode: string;
  awarenessLevel: string;
} | null {
  const insight = getFeedback360GapInsight(capability, gap);
  if (!insight) return null;
  
  const isFrench = locale === 'fr' || locale.startsWith('fr');
  
  // Determine color and awareness level based on gap
  let colorCode = '#C6EFCE';
  let awarenessLevel = '1️⃣ High Self-Awareness';
  
  const absGap = Math.abs(gap);
  if (absGap === 0) {
    colorCode = '#C6EFCE';
    awarenessLevel = '1️⃣ High Self-Awareness';
  } else if (absGap >= 0.1 && absGap <= 0.5) {
    colorCode = '#FFEB9C';
    awarenessLevel = '2️⃣ Good-Partial Self-Awareness';
  } else if (absGap > 0.5) {
    colorCode = '#FFC7CE';
    awarenessLevel = '3️⃣ Limited Self-Awareness';
  }
  
  return {
    overview: isFrench && insight.overviewFr ? insight.overviewFr : insight.overview,
    recommendation: isFrench && insight.recommendationFr ? insight.recommendationFr : insight.recommendation,
    colorCode,
    awarenessLevel
  };
}

/**
 * Get gap insight for a specific capability based on gap direction
 */
export function getFeedback360GapInsight(
  capability: string,
  gap: number
): Feedback360GapInsight | null {
  // Determine direction (gap = self_score - others_avg_score)
  // gap > 0 means self is higher, gap < 0 means self is lower
  const direction: 'higher' | 'lower' = gap > 0 ? 'higher' : 'lower';
  
  // Find matching insight
  const insight = feedback360GapInsights.find(insight => {
    const normalizedCapability = insight.capability.toLowerCase().replace(/\s+/g, '_');
    const normalizedInputCapability = capability.toLowerCase().replace(/\s+/g, '_');
    
    // Check if capabilities match exactly
    const capabilityMatches = normalizedCapability === normalizedInputCapability ||
                             normalizedCapability.includes(normalizedInputCapability) ||
                             normalizedInputCapability.includes(normalizedCapability);
    
    return capabilityMatches && insight.gapDirection === direction;
  });
  
  return insight || null;
}

/**
 * Get color code for a gap value
 */
export function get360GapColorCode(gap: number): string {
  const absGap = Math.abs(gap);
  
  if (absGap === 0) {
    return '#C6EFCE'; // Green - High Self-Awareness
  } else if (absGap >= 0.1 && absGap <= 0.5) {
    return '#FFEB9C'; // Yellow - Good-Partial Self-Awareness
  } else {
    return '#FFC7CE'; // Red - Limited Self-Awareness
  }
}

/**
 * Get awareness level label for a gap value
 */
export function get360GapAwarenessLevel(gap: number): string {
  const absGap = Math.abs(gap);
  
  if (absGap === 0) {
    return '1️⃣ High Self-Awareness';
  } else if (absGap >= 0.1 && absGap <= 0.5) {
    return '2️⃣ Good-Partial Self-Awareness';
  } else {
    return '3️⃣ Limited Self-Awareness';
  }
}
