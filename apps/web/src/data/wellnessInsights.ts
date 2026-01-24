/**
 * Wellness Assessment Insights
 * Score-based insights and recommendations for each pillar
 * 
 * Score ranges:
 * - 5-10: Critical/Foundation level (Red: #FFC7CE)
 * - 11-15: Developing level (Yellow: #FFEB9C)
 * - 16-20: Strong level (Light Green: #92D050)
 * - 21-25: Optimal level (Dark Green: #00B050)
 */

export interface WellnessPillarInsight {
  pillar: string;
  scoreRange: string;
  colorCode: string;
  assessment: string;
  assessmentFr?: string;
  recommendation: string;
  recommendationFr?: string;
  actions: string[];
  actionsFr?: string[];
}

export const wellnessInsights: WellnessPillarInsight[] = [
  // SLEEP INSIGHTS
  {
    pillar: 'Sleep',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Sleep is insufficient or irregular, leading to fatigue, reduced focus, and impaired performance. Poor sleep habits may negatively affect health and mood.',
    assessmentFr: 'Le sommeil est insuffisant ou irrégulier, entraînant fatigue, concentration réduite et performance diminuée. De mauvaises habitudes de sommeil peuvent affecter négativement la santé et l\'humeur.',
    recommendation: 'Establish foundational sleep hygiene and consistent routines to improve rest, energy, and cognitive performance.',
    recommendationFr: 'Établir une hygiène de sommeil fondamentale et des routines cohérentes pour améliorer le repos, l\'énergie et les performances cognitives.',
    actions: [
      'Set fixed sleep/wake times daily',
      'Remove screens 60 minutes before bed',
      'Create a dark, cool, quiet sleep environment'
    ],
    actionsFr: [
      'Établir des horaires de sommeil/réveil fixes quotidiennement',
      'Retirer les écrans 60 minutes avant le coucher',
      'Créer un environnement de sommeil sombre, frais et silencieux'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Sleep is adequate at times but inconsistent. Occasional fatigue or concentration issues may occur.',
    assessmentFr: 'Le sommeil est adéquat parfois mais incohérent. De la fatigue ou des problèmes de concentration peuvent survenir occasionnellement.',
    recommendation: 'Strengthen consistency and quality by refining habits and eliminating disruptions that cause irregular rest.',
    recommendationFr: 'Renforcer la cohérence et la qualité en affinant les habitudes et en éliminant les perturbations qui causent un repos irrégulier.',
    actions: [
      'Track sleep patterns weekly',
      'Introduce calming wind-down routines',
      'Reduce caffeine and heavy meals late in the day'
    ],
    actionsFr: [
      'Suivre les habitudes de sommeil hebdomadairement',
      'Introduire des routines calmantes avant le coucher',
      'Réduire la caféine et les repas lourds en fin de journée'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Sleep patterns are generally healthy and consistent, supporting sustained energy and emotional balance. Some variability may occur during high-pressure periods or travel, creating opportunities to refine recovery cycles.',
    assessmentFr: 'Les habitudes de sommeil sont généralement saines et cohérentes, soutenant une énergie durable et un équilibre émotionnel. Une certaine variabilité peut survenir pendant les périodes de forte pression ou les voyages, créant des opportunités pour affiner les cycles de récupération.',
    recommendation: 'Maintain strong habits while optimizing recovery during periods of stress, travel, or peak demand.',
    recommendationFr: 'Maintenir de fortes habitudes tout en optimisant la récupération pendant les périodes de stress, de voyage ou de forte demande.',
    actions: [
      'Implement pre-sleep relaxation practices',
      'Prioritize deep-sleep quality',
      'Use sleep tracking to align timing with circadian rhythm'
    ],
    actionsFr: [
      'Mettre en place des pratiques de relaxation avant le sommeil',
      'Prioriser la qualité du sommeil profond',
      'Utiliser le suivi du sommeil pour aligner le timing avec le rythme circadien'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Sleep is restorative and consistent, supporting strong performance and well-being. Opportunities may remain in optimizing quality during periods of stress or travel.',
    assessmentFr: 'Le sommeil est réparateur et cohérent, soutenant une forte performance et un bien-être. Des opportunités peuvent subsister pour optimiser la qualité pendant les périodes de stress ou de voyage.',
    recommendation: 'Continue advanced optimization and leverage habits to support peak performance and leadership well-being and share practices to others.',
    recommendationFr: 'Continuer l\'optimisation avancée et tirer parti des habitudes pour soutenir la performance de pointe et le bien-être en leadership, et partager les pratiques avec les autres.',
    actions: [
      'Integrate habits and behaviors that help improve Heart Rate Variability (HRV)',
      'Plan sleep proactively during high-demand cycles',
      'Share healthy habits with others'
    ],
    actionsFr: [
      'Intégrer des habitudes et comportements qui aident à améliorer la variabilité de la fréquence cardiaque (HRV)',
      'Planifier le sommeil de manière proactive pendant les cycles de forte demande',
      'Partager les habitudes saines avec les autres'
    ]
  },

  // NUTRITION INSIGHTS
  {
    pillar: 'Nutrition',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Diet may be unbalanced or inconsistent, impacting energy, concentration, and long-term health. Possible reliance on processed or unhealthy foods.',
    assessmentFr: 'Le régime alimentaire peut être déséquilibré ou incohérent, affectant l\'énergie, la concentration et la santé à long terme. Dépendance possible aux aliments transformés ou malsains.',
    recommendation: 'Build a balanced nutritional foundation to improve energy, focus, and long-term wellness.',
    recommendationFr: 'Construire une base nutritionnelle équilibrée pour améliorer l\'énergie, la concentration et le bien-être à long terme.',
    actions: [
      'Increase daily intake of whole foods, fruits, vegetables',
      'Reduce processed foods and added sugars',
      'Prepare simple planned meals'
    ],
    actionsFr: [
      'Augmenter l\'apport quotidien d\'aliments entiers, fruits, légumes',
      'Réduire les aliments transformés et les sucres ajoutés',
      'Préparer des repas simples et planifiés'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Nutrition is generally adequate but inconsistent. Healthy eating is practiced but may lapse during stress or busy periods.',
    assessmentFr: 'La nutrition est généralement adéquate mais incohérente. Une alimentation saine est pratiquée mais peut faiblir pendant les périodes de stress ou d\'occupation.',
    recommendation: 'Improve consistency and balance, especially during stress or irregular schedules and refine meal planning for balance and consistency.',
    recommendationFr: 'Améliorer la cohérence et l\'équilibre, surtout pendant les périodes de stress ou d\'horaires irréguliers, et affiner la planification des repas pour l\'équilibre et la cohérence.',
    actions: [
      'Strengthen hydration habits',
      'Meal prep multiple days',
      'Keep healthy snacks accessible and portion control'
    ],
    actionsFr: [
      'Renforcer les habitudes d\'hydratation',
      'Préparer les repas pour plusieurs jours',
      'Garder des collations saines accessibles et contrôler les portions'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Nutrition habits are strong, balanced, and mostly aligned with energy and performance goals. Occasional gaps may occur with time pressure, social environments, or travel.',
    assessmentFr: 'Les habitudes nutritionnelles sont fortes, équilibrées et largement alignées avec les objectifs d\'énergie et de performance. Des lacunes occasionnelles peuvent survenir avec la pression du temps, les environnements sociaux ou les voyages.',
    recommendation: 'Maintain strong nutrition habits and refine alignment to performance needs and lifestyle demands.',
    recommendationFr: 'Maintenir de fortes habitudes nutritionnelles et affiner l\'alignement avec les besoins de performance et les exigences du mode de vie.',
    actions: [
      'Track nutrition during busy periods',
      'Increase micronutrient diversity',
      'Share strategies to inspire others and to be continued engaged in healthy eating ideas and actions'
    ],
    actionsFr: [
      'Suivre la nutrition pendant les périodes occupées',
      'Augmenter la diversité des micronutriments',
      'Partager des stratégies pour inspirer les autres et continuer à s\'engager dans des idées et actions d\'alimentation saine'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Nutrition is balanced and supportive of energy and health. Remaining opportunities may be in fine-tuning for performance or wellness goals.',
    assessmentFr: 'La nutrition est équilibrée et soutient l\'énergie et la santé. Les opportunités restantes peuvent être dans l\'ajustement fin pour les objectifs de performance ou de bien-être.',
    recommendation: 'Pursue advanced optimization to amplify energy and influence others positively.',
    recommendationFr: 'Poursuivre l\'optimisation avancée pour amplifier l\'énergie et influencer positivement les autres.',
    actions: [
      'Use performance-aligned nutrition strategies',
      'Maintain personalized hydration plan',
      'Mentor others in healthy habits'
    ],
    actionsFr: [
      'Utiliser des stratégies nutritionnelles alignées sur la performance',
      'Maintenir un plan d\'hydratation personnalisé',
      'Encadrer les autres dans des habitudes saines'
    ]
  },

  // MOVEMENT INSIGHTS
  {
    pillar: 'Movement',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Physical activity is insufficient, which may affect energy, mood, and long-term health.',
    assessmentFr: 'L\'activité physique est insuffisante, ce qui peut affecter l\'énergie, l\'humeur et la santé à long terme.',
    recommendation: 'Establish regular movement habits to support baseline health, energy, and strength.',
    recommendationFr: 'Établir des habitudes de mouvement régulières pour soutenir la santé de base, l\'énergie et la force.',
    actions: [
      'Daily low-intensity activity',
      'Set weekly movement goals',
      'Reduce sedentary time with movement breaks'
    ],
    actionsFr: [
      'Activité quotidienne de faible intensité',
      'Fixer des objectifs de mouvement hebdomadaires',
      'Réduire le temps sédentaire avec des pauses de mouvement'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Movement is present but inconsistent or not diverse. May lack strength, flexibility, or endurance balance.',
    assessmentFr: 'Le mouvement est présent mais incohérent ou peu diversifié. Peut manquer d\'équilibre en force, flexibilité ou endurance.',
    recommendation: 'Increase consistency and diversify movement to balance strength, cardio, and mobility.',
    recommendationFr: 'Augmenter la cohérence et diversifier le mouvement pour équilibrer force, cardio et mobilité.',
    actions: [
      'Schedule workouts to establish consistency in habits',
      'Add strength + flexibility components',
      'Use activity trackers'
    ],
    actionsFr: [
      'Planifier les entraînements pour établir la cohérence des habitudes',
      'Ajouter des composantes de force + flexibilité',
      'Utiliser des trackers d\'activité'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Movement routines are consistent and contribute positively to strength, mobility, and energy. Opportunities may lie in structured training plans, progression cycles, or improved recovery practices.',
    assessmentFr: 'Les routines de mouvement sont cohérentes et contribuent positivement à la force, la mobilité et l\'énergie. Les opportunités peuvent résider dans des plans d\'entraînement structurés, des cycles de progression ou des pratiques de récupération améliorées.',
    recommendation: 'Maintain regular activity while progressing toward performance goals and structured improvement.',
    recommendationFr: 'Maintenir une activité régulière tout en progressant vers des objectifs de performance et une amélioration structurée.',
    actions: [
      'Follow progressive training plans',
      'Schedule active recovery',
      'Track physical metrics'
    ],
    actionsFr: [
      'Suivre des plans d\'entraînement progressifs',
      'Planifier la récupération active',
      'Suivre les métriques physiques'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Movement is consistent and well-balanced, supporting strong health and energy. Opportunities may remain in optimizing performance or recovery.',
    assessmentFr: 'Le mouvement est cohérent et bien équilibré, soutenant une forte santé et énergie. Des opportunités peuvent subsister pour optimiser la performance ou la récupération.',
    recommendation: 'Elevate training strategy to maximize performance and recovery while supporting others\' growth.',
    recommendationFr: 'Élever la stratégie d\'entraînement pour maximiser la performance et la récupération tout en soutenant la croissance des autres.',
    actions: [
      'Maintain prioritization of training habits',
      'Pair recovery tools with training',
      'Support others in active habits'
    ],
    actionsFr: [
      'Maintenir la priorisation des habitudes d\'entraînement',
      'Associer les outils de récupération à l\'entraînement',
      'Soutenir les autres dans des habitudes actives'
    ]
  },

  // AVOIDANCE OF RISKY SUBSTANCES INSIGHTS
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'High or frequent exposure to toxic substances (alcohol, nicotine, drugs) negatively impacts health and performance.',
    assessmentFr: 'Une exposition élevée ou fréquente aux substances toxiques (alcool, nicotine, drogues) impacte négativement la santé et la performance.',
    recommendation: 'Reduce harmful substance use and establish healthier coping mechanisms.',
    recommendationFr: 'Réduire l\'utilisation de substances nocives et établir des mécanismes d\'adaptation plus sains.',
    actions: [
      'Set reduction goals',
      'Seek support if needed',
      'Replace habits with healthy alternatives'
    ],
    actionsFr: [
      'Fixer des objectifs de réduction',
      'Chercher du soutien si nécessaire',
      'Remplacer les habitudes par des alternatives saines'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Occasional or moderate use of substances, but habits may still pose risks over time.',
    assessmentFr: 'Utilisation occasionnelle ou modérée de substances, mais les habitudes peuvent encore poser des risques à long terme.',
    recommendation: 'Increase intentionality and boundaries to minimize long-term risk.',
    recommendationFr: 'Augmenter l\'intentionnalité et les limites pour minimiser les risques à long terme.',
    actions: [
      'Set daily limits',
      'Identify the main triggers and reframe it to support change',
      'Replace stress-driven use with wellness routines'
    ],
    actionsFr: [
      'Fixer des limites quotidiennes',
      'Identifier les principaux déclencheurs et les recadrer pour soutenir le changement',
      'Remplacer l\'utilisation liée au stress par des routines de bien-être'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Healthy habits and self-regulation are present, with minimal reliance on substances for coping or social settings. Occasional consumption may still be habitual rather than intentional.',
    assessmentFr: 'Des habitudes saines et une autorégulation sont présentes, avec une dépendance minimale aux substances pour faire face ou dans les contextes sociaux. La consommation occasionnelle peut encore être habituelle plutôt qu\'intentionnelle.',
    recommendation: 'Maintain low use and reinforce conscious, values-aligned choices.',
    recommendationFr: 'Maintenir une faible utilisation et renforcer des choix conscients et alignés sur les valeurs.',
    actions: [
      'Monitor habits in social settings',
      'Prioritize choosing wellness alternatives',
      'Pair stress relief with non-substance rituals'
    ],
    actionsFr: [
      'Surveiller les habitudes dans les contextes sociaux',
      'Prioriser le choix d\'alternatives de bien-être',
      'Associer le soulagement du stress à des rituels sans substances'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Avoidance of toxic substances is strong, supporting optimal health. Opportunities remain in educating and supporting others in healthy choices.',
    assessmentFr: 'L\'évitement des substances toxiques est fort, soutenant une santé optimale. Des opportunités subsistent pour éduquer et soutenir les autres dans des choix sains.',
    recommendation: 'Sustain optimal avoidance while supporting awareness and community health.',
    recommendationFr: 'Maintenir un évitement optimal tout en soutenant la sensibilisation et la santé communautaire.',
    actions: [
      'Share strategies for cross-collaboration and engagement',
      'Maintain rituals that reinforce identity',
      'Advocate for substance-free spaces'
    ],
    actionsFr: [
      'Partager des stratégies pour la collaboration croisée et l\'engagement',
      'Maintenir des rituels qui renforcent l\'identité',
      'Plaider pour des espaces sans substances'
    ]
  },

  // STRESS MANAGEMENT INSIGHTS
  {
    pillar: 'Stress Management',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Stress is poorly managed, leading to negative impacts on health, relationships, or decision-making.',
    assessmentFr: 'Le stress est mal géré, entraînant des impacts négatifs sur la santé, les relations ou la prise de décision.',
    recommendation: 'Build foundational coping mechanisms to reduce negative impacts of stress.',
    recommendationFr: 'Construire des mécanismes d\'adaptation fondamentaux pour réduire les impacts négatifs du stress.',
    actions: [
      'Identify stress triggers',
      'Begin daily mindfulness',
      'Install breathing techniques when stress is abnormal'
    ],
    actionsFr: [
      'Identifier les déclencheurs de stress',
      'Commencer la pleine conscience quotidienne',
      'Installer des techniques de respiration lorsque le stress est anormal'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Stress management is adequate but not consistent. Some situations may still cause visible strain.',
    assessmentFr: 'La gestion du stress est adéquate mais pas cohérente. Certaines situations peuvent encore causer une tension visible.',
    recommendation: 'Improve consistency in managing stress across environments.',
    recommendationFr: 'Améliorer la cohérence dans la gestion du stress dans tous les environnements.',
    actions: [
      'Plan routines proactively and follow for consistency',
      'Use physical activity for regulation',
      'Practice journaling'
    ],
    actionsFr: [
      'Planifier les routines de manière proactive et les suivre pour la cohérence',
      'Utiliser l\'activité physique pour la régulation',
      'Pratiquer le journal'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Stress is generally managed well through coping strategies and emotional awareness. Occasional overwhelm may surface during major deadlines or multiple responsibilities.',
    assessmentFr: 'Le stress est généralement bien géré grâce à des stratégies d\'adaptation et à une conscience émotionnelle. Un débordement occasionnel peut survenir lors de grandes échéances ou de multiples responsabilités.',
    recommendation: 'Maintain healthy coping strategies and strengthen responses during peak pressure.',
    recommendationFr: 'Maintenir des stratégies d\'adaptation saines et renforcer les réponses pendant les périodes de forte pression.',
    actions: [
      'Track patterns to validate gaps',
      'Use short daily resilience practices',
      'Set boundaries protecting energy'
    ],
    actionsFr: [
      'Suivre les schémas pour valider les lacunes',
      'Utiliser de courtes pratiques de résilience quotidiennes',
      'Établir des limites protégeant l\'énergie'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Stress is managed effectively, with resilience in most situations. Opportunities may remain in supporting others.',
    assessmentFr: 'Le stress est géré efficacement, avec de la résilience dans la plupart des situations. Des opportunités peuvent subsister pour soutenir les autres.',
    recommendation: 'Continue modeling resilience and supporting others in healthy stress habits.',
    recommendationFr: 'Continuer à modéliser la résilience et à soutenir les autres dans des habitudes de stress saines.',
    actions: [
      'Lead stress conversations',
      'Integrate recovery cycles',
      'Mentor others in resilience'
    ],
    actionsFr: [
      'Mener des conversations sur le stress',
      'Intégrer des cycles de récupération',
      'Encadrer les autres dans la résilience'
    ]
  },

  // SOCIAL CONNECTION INSIGHTS
  {
    pillar: 'Social Connection',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Social connections may be limited or strained, leading to feelings of isolation or reduced support.',
    assessmentFr: 'Les connexions sociales peuvent être limitées ou tendues, entraînant des sentiments d\'isolement ou un soutien réduit.',
    recommendation: 'Build relationships to reduce isolation and improve well-being.',
    recommendationFr: 'Construire des relations pour réduire l\'isolement et améliorer le bien-être.',
    actions: [
      'Reach out weekly',
      'Join community activities',
      'Express emotional needs openly'
    ],
    actionsFr: [
      'Prendre contact chaque semaine',
      'Rejoindre des activités communautaires',
      'Exprimer ouvertement les besoins émotionnels'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Social connections are present but may lack depth or consistency. Support network is adequate but could be strengthened.',
    assessmentFr: 'Les connexions sociales sont présentes mais peuvent manquer de profondeur ou de cohérence. Le réseau de soutien est adéquat mais pourrait être renforcé.',
    recommendation: 'Strengthen depth and consistency of relationships.',
    recommendationFr: 'Renforcer la profondeur et la cohérence des relations.',
    actions: [
      'Schedule recurring check-ins',
      'Practice active listening',
      'Deepen select relationships'
    ],
    actionsFr: [
      'Planifier des suivis récurrents',
      'Pratiquer l\'écoute active',
      'Approfondir certaines relations'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Social relationships are meaningful and supportive, contributing to well-being and belonging. Opportunities lie in expanding networks or deepening selective relationships for mutual growth.',
    assessmentFr: 'Les relations sociales sont significatives et soutenantes, contribuant au bien-être et à l\'appartenance. Les opportunités résident dans l\'expansion des réseaux ou l\'approfondissement de relations sélectives pour une croissance mutuelle.',
    recommendation: 'Maintain meaningful relationships while expanding networks for mutual growth.',
    recommendationFr: 'Maintenir des relations significatives tout en élargissant les réseaux pour une croissance mutuelle.',
    actions: [
      'Join aligned communities',
      'Invest time in close relationships',
      'Support others\' goals'
    ],
    actionsFr: [
      'Rejoindre des communautés alignées',
      'Investir du temps dans des relations proches',
      'Soutenir les objectifs des autres'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Strong social connections provide support, belonging, and resilience. Opportunities may remain in expanding networks or mentoring others.',
    assessmentFr: 'De fortes connexions sociales apportent soutien, appartenance et résilience. Des opportunités peuvent subsister pour élargir les réseaux ou encadrer les autres.',
    recommendation: 'Leverage strong networks to reinforce collective well-being.',
    recommendationFr: 'Tirer parti de réseaux forts pour renforcer le bien-être collectif.',
    actions: [
      'Mentor others',
      'Lead community initiatives',
      'Create intentional spaces for connection'
    ],
    actionsFr: [
      'Encadrer les autres',
      'Diriger des initiatives communautaires',
      'Créer des espaces intentionnels pour la connexion'
    ]
  }
];

/**
 * Get insight for a specific pillar based on score with locale support
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
  
  // Ensure actions is always an array
  const actions = isFrench && insight.actionsFr 
    ? (Array.isArray(insight.actionsFr) ? insight.actionsFr : [])
    : (Array.isArray(insight.actions) ? insight.actions : []);
  
  const result = {
    assessment: isFrench && insight.assessmentFr ? insight.assessmentFr : insight.assessment,
    recommendation: isFrench && insight.recommendationFr ? insight.recommendationFr : insight.recommendation,
    actions: actions,
    colorCode: insight.colorCode
  };
  
  // Debug logging in development
  if (typeof window !== 'undefined' && actions.length === 0) {
    console.warn('getWellnessInsightWithLocale: No actions found', { 
      pillar, 
      score, 
      locale,
      hasActions: !!insight.actions,
      hasActionsFr: !!insight.actionsFr,
      actionsCount: insight.actions?.length || 0,
      actionsFrCount: insight.actionsFr?.length || 0
    });
  }
  
  return result;
}

/**
 * Map backend pillar keys to insight pillar names
 */
const pillarNameMap: Record<string, string> = {
  'sleep': 'Sleep',
  'nutrition': 'Nutrition',
  'movement': 'Movement',
  'avoidance_of_risky_substances': 'Avoidance of Risky Substances',
  'avoidance_of_toxic_substances': 'Avoidance of Risky Substances',
  'stress_management': 'Stress Management',
  'social_connection': 'Social Connection',
};

/**
 * Get insight for a specific pillar based on score
 */
export function getWellnessInsight(pillar: string, score: number): WellnessPillarInsight | null {
  // First, try to map the pillar name using the mapping
  const mappedPillar = pillarNameMap[pillar.toLowerCase()] || pillar;
  
  // Find the matching insight based on pillar and score range
  const insights = wellnessInsights.filter(insight => {
    // Direct match first (most reliable)
    if (insight.pillar === mappedPillar) {
      // Parse score range
      const rangeParts = insight.scoreRange.split('-').map(s => parseInt(s.trim(), 10));
      const min = rangeParts[0];
      const max = rangeParts[1];
      
      if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) return false;
      return score >= min && score <= max;
    }
    
    // Fallback: Normalize pillar name for comparison
    const normalizedPillar = insight.pillar.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    const normalizedInputPillar = mappedPillar.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    
    // Check if pillars match (handling variations)
    const pillarMatches = normalizedPillar === normalizedInputPillar ||
                         normalizedPillar.includes(normalizedInputPillar) ||
                         normalizedInputPillar.includes(normalizedPillar);
    
    if (!pillarMatches) return false;
    
    // Parse score range
    const rangeParts = insight.scoreRange.split('-').map(s => parseInt(s.trim(), 10));
    const min = rangeParts[0];
    const max = rangeParts[1];
    
    if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) return false;
    return score >= min && score <= max;
  });
  
  const result = insights[0] || null;
  
  // Debug logging only when no result found
  if (typeof window !== 'undefined' && result === null) {
    console.error('❌ getWellnessInsight: No insight found', { 
      inputPillar: pillar, 
      mappedPillar, 
      score,
      availablePillars: [...new Set(wellnessInsights.map(i => i.pillar))],
      allInsightsCount: wellnessInsights.length
    });
  }
  
  return result;
}

/**
 * Get color code for a score
 */
export function getScoreColorCode(score: number): string {
  if (score >= 21) return '#00B050'; // Dark green
  if (score >= 16) return '#92D050'; // Light green
  if (score >= 11) return '#FFEB9C'; // Yellow
  return '#FFC7CE'; // Red
}

/**
 * Get level label for display
 */
export function getScoreLevelLabel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (score >= 21) return 'very_high';
  if (score >= 16) return 'high';
  if (score >= 11) return 'moderate';
  return 'low';
}
