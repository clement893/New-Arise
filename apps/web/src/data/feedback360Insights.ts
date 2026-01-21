/**
 * 360° Feedback Assessment Insights
 * Score-based insights and recommendations for each capability
 * 
 * Score ranges:
 * - 1-2: Critical/Foundation level (Red: #FFC7CE)
 * - 3: Developing level (Yellow: #FFEB9C)
 * - 4-5: Strong level (Green: #C6EFCE)
 */

export interface Feedback360CapabilityInsight {
  capability: string;
  scoreRange: string;
  colorCode: string;
  analysis: string;
  analysisFr?: string;
  recommendation: string;
  recommendationFr?: string;
}

export const feedback360Insights: Feedback360CapabilityInsight[] = [
  // COMMUNICATION INSIGHTS
  {
    capability: 'communication',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Feedback indicates communication is unclear, inconsistent, or ineffective. Colleagues may feel left out of updates, confused about instructions, or uncertain about expectations. Active listening and adapting to the audience appear limited.',
    analysisFr: 'Les commentaires indiquent que la communication est peu claire, incohérente ou inefficace. Les collègues peuvent se sentir exclus des mises à jour, confus quant aux instructions ou incertains quant aux attentes. L\'écoute active et l\'adaptation au public semblent limitées.',
    recommendation: 'Clarity: Use simple, structured messages. Listening: Practice active listening. Feedback: Ask colleagues for input. Training: Take communication training. Action Plan: Set small, practical goals.',
    recommendationFr: 'Clarté: Utiliser des messages simples et structurés. Écoute: Pratiquer l\'écoute active. Retour: Demander l\'avis des collègues. Formation: Suivre une formation en communication. Plan d\'action: Fixer de petits objectifs pratiques.',
  },
  {
    capability: 'communication',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Communication is generally functional, but not always impactful. Messages may lack precision, timing, or the right tone. In some cases, information is shared but not fully adapted to the audience or situation.',
    analysisFr: 'La communication est généralement fonctionnelle, mais pas toujours percutante. Les messages peuvent manquer de précision, de timing ou du bon ton. Dans certains cas, l\'information est partagée mais pas entièrement adaptée au public ou à la situation.',
    recommendation: 'Refinement: Tailor communication to stakeholders. Consistency: Establish communication routines. Engagement: Encourage dialogue. Development: Improve verbal and written skills. Action Plan: Use frameworks like "what, why, how".',
    recommendationFr: 'Affinement: Adapter la communication aux parties prenantes. Cohérence: Établir des routines de communication. Engagement: Encourager le dialogue. Développement: Améliorer les compétences verbales et écrites. Plan d\'action: Utiliser des cadres comme "quoi, pourquoi, comment".',
  },
  {
    capability: 'communication',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Communication is seen as strong, clear, and effective. Stakeholders likely value clarity and listening skills. Remaining opportunities may be in influencing, inspiring, or handling challenging conversations.',
    analysisFr: 'La communication est perçue comme forte, claire et efficace. Les parties prenantes apprécient probablement la clarté et les compétences d\'écoute. Les opportunités restantes peuvent être dans l\'influence, l\'inspiration ou la gestion de conversations difficiles.',
    recommendation: 'Leadership Communication: Inspire with vision. Strategic Influence: Drive alignment. Advanced Skills: Manage conflict diplomatically. Visibility: Broaden impact through leadership presence. Action Plan: Take on stretch opportunities.',
    recommendationFr: 'Communication de leadership: Inspirer avec la vision. Influence stratégique: Favoriser l\'alignement. Compétences avancées: Gérer les conflits diplomatiquement. Visibilité: Élargir l\'impact par la présence de leadership. Plan d\'action: Saisir des opportunités d\'étirement.',
  },

  // LEADERSHIP STYLE INSIGHTS
  {
    capability: 'leadership_style',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Leadership approach may be inconsistent, unclear, or ineffective. Team members may lack direction, feel unsupported, or experience confusion about expectations. Trust and motivation may be compromised.',
    analysisFr: 'L\'approche de leadership peut être incohérente, peu claire ou inefficace. Les membres de l\'équipe peuvent manquer de direction, se sentir non soutenus ou éprouver de la confusion quant aux attentes. La confiance et la motivation peuvent être compromises.',
    recommendation: 'Foundation: Establish clear vision and values. Consistency: Demonstrate reliable behavior. Support: Provide guidance and resources. Development: Learn leadership fundamentals. Action Plan: Start with small leadership moments.',
    recommendationFr: 'Fondation: Établir une vision et des valeurs claires. Cohérence: Démontrer un comportement fiable. Soutien: Fournir des conseils et des ressources. Développement: Apprendre les fondamentaux du leadership. Plan d\'action: Commencer par de petits moments de leadership.',
  },
  {
    capability: 'leadership_style',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Leadership is present but may lack consistency or impact. Some situations are handled well, while others reveal gaps in approach, delegation, or team empowerment. Development opportunities exist in adapting style to context.',
    analysisFr: 'Le leadership est présent mais peut manquer de cohérence ou d\'impact. Certaines situations sont bien gérées, tandis que d\'autres révèlent des lacunes dans l\'approche, la délégation ou l\'autonomisation de l\'équipe. Des opportunités de développement existent dans l\'adaptation du style au contexte.',
    recommendation: 'Adaptation: Match leadership style to situations. Empowerment: Delegate effectively. Feedback: Seek input on leadership impact. Development: Build situational leadership skills. Action Plan: Practice different leadership approaches.',
    recommendationFr: 'Adaptation: Adapter le style de leadership aux situations. Autonomisation: Déléguer efficacement. Retour: Demander des commentaires sur l\'impact du leadership. Développement: Développer les compétences de leadership situationnel. Plan d\'action: Pratiquer différentes approches de leadership.',
  },
  {
    capability: 'leadership_style',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Leadership is strong, inspiring, and effective. Team members likely feel motivated, supported, and clear about direction. Opportunities may remain in strategic influence, developing other leaders, or handling complex organizational challenges.',
    analysisFr: 'Le leadership est fort, inspirant et efficace. Les membres de l\'équipe se sentent probablement motivés, soutenus et clairs sur la direction. Des opportunités peuvent subsister dans l\'influence stratégique, le développement d\'autres leaders ou la gestion de défis organisationnels complexes.',
    recommendation: 'Strategic Leadership: Influence at organizational level. Mentorship: Develop other leaders. Vision: Drive long-term transformation. Impact: Scale leadership effectiveness. Action Plan: Take on strategic leadership roles.',
    recommendationFr: 'Leadership stratégique: Influencer au niveau organisationnel. Mentorat: Développer d\'autres leaders. Vision: Conduire la transformation à long terme. Impact: Augmenter l\'efficacité du leadership. Plan d\'action: Assumer des rôles de leadership stratégique.',
  },

  // TEAM CULTURE INSIGHTS
  {
    capability: 'team_culture',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Team culture may be fragmented, unsupportive, or lacking in collaboration. Trust issues, poor conflict resolution, or exclusionary behaviors may be present. Team members may feel disconnected or undervalued.',
    analysisFr: 'La culture d\'équipe peut être fragmentée, peu solidaire ou manquer de collaboration. Des problèmes de confiance, une mauvaise résolution des conflits ou des comportements d\'exclusion peuvent être présents. Les membres de l\'équipe peuvent se sentir déconnectés ou sous-estimés.',
    recommendation: 'Foundation: Build trust through transparency. Inclusion: Ensure all voices are heard. Respect: Model respectful interactions. Conflict: Address issues constructively. Action Plan: Start with small team-building actions.',
    recommendationFr: 'Fondation: Construire la confiance par la transparence. Inclusion: S\'assurer que toutes les voix sont entendues. Respect: Modéliser des interactions respectueuses. Conflit: Aborder les problèmes de manière constructive. Plan d\'action: Commencer par de petites actions de renforcement d\'équipe.',
  },
  {
    capability: 'team_culture',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Team culture is functional but may lack depth or consistency. Collaboration happens but could be stronger. Some team members may feel more included than others. Opportunities exist in strengthening trust and shared values.',
    analysisFr: 'La culture d\'équipe est fonctionnelle mais peut manquer de profondeur ou de cohérence. La collaboration se produit mais pourrait être plus forte. Certains membres de l\'équipe peuvent se sentir plus inclus que d\'autres. Des opportunités existent pour renforcer la confiance et les valeurs partagées.',
    recommendation: 'Consistency: Reinforce positive behaviors regularly. Engagement: Increase team participation. Values: Clarify and live shared values. Recognition: Acknowledge contributions. Action Plan: Establish regular team rituals.',
    recommendationFr: 'Cohérence: Renforcer les comportements positifs régulièrement. Engagement: Augmenter la participation de l\'équipe. Valeurs: Clarifier et vivre les valeurs partagées. Reconnaissance: Reconnaître les contributions. Plan d\'action: Établir des rituels d\'équipe réguliers.',
  },
  {
    capability: 'team_culture',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Team culture is strong, collaborative, and positive. Team members likely feel valued, included, and motivated. Trust and respect are evident. Opportunities may remain in scaling culture across larger groups or maintaining culture during growth.',
    analysisFr: 'La culture d\'équipe est forte, collaborative et positive. Les membres de l\'équipe se sentent probablement valorisés, inclus et motivés. La confiance et le respect sont évidents. Des opportunités peuvent subsister pour étendre la culture à des groupes plus larges ou maintenir la culture pendant la croissance.',
    recommendation: 'Scale: Extend culture to broader organization. Sustainability: Maintain culture during change. Innovation: Foster creative collaboration. Leadership: Model culture for others. Action Plan: Lead culture initiatives.',
    recommendationFr: 'Échelle: Étendre la culture à l\'organisation plus large. Durabilité: Maintenir la culture pendant le changement. Innovation: Favoriser la collaboration créative. Leadership: Modéliser la culture pour les autres. Plan d\'action: Diriger les initiatives culturelles.',
  },

  // PROBLEM SOLVING & DECISION MAKING INSIGHTS
  {
    capability: 'problem_solving_and_decision_making',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Problem-solving and decision-making may be reactive, incomplete, or ineffective. Decisions may lack analysis, stakeholder input, or follow-through. Team members may experience confusion or frustration with decision processes.',
    analysisFr: 'La résolution de problèmes et la prise de décision peuvent être réactives, incomplètes ou inefficaces. Les décisions peuvent manquer d\'analyse, d\'avis des parties prenantes ou de suivi. Les membres de l\'équipe peuvent éprouver de la confusion ou de la frustration avec les processus décisionnels.',
    recommendation: 'Process: Establish structured problem-solving approach. Analysis: Gather relevant information before deciding. Input: Consult stakeholders. Follow-through: Ensure decisions are implemented. Action Plan: Use decision-making frameworks.',
    recommendationFr: 'Processus: Établir une approche structurée de résolution de problèmes. Analyse: Recueillir des informations pertinentes avant de décider. Contribution: Consulter les parties prenantes. Suivi: S\'assurer que les décisions sont mises en œuvre. Plan d\'action: Utiliser des cadres de prise de décision.',
  },
  {
    capability: 'problem_solving_and_decision_making',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Problem-solving is adequate but may lack consistency or depth. Some decisions are well-made, while others may be rushed or incomplete. Opportunities exist in improving analysis, stakeholder engagement, or decision quality.',
    analysisFr: 'La résolution de problèmes est adéquate mais peut manquer de cohérence ou de profondeur. Certaines décisions sont bien prises, tandis que d\'autres peuvent être précipitées ou incomplètes. Des opportunités existent pour améliorer l\'analyse, l\'engagement des parties prenantes ou la qualité des décisions.',
    recommendation: 'Quality: Improve decision-making processes. Analysis: Deepen problem analysis. Collaboration: Involve diverse perspectives. Speed: Balance thoroughness with timeliness. Action Plan: Practice structured decision-making.',
    recommendationFr: 'Qualité: Améliorer les processus de prise de décision. Analyse: Approfondir l\'analyse des problèmes. Collaboration: Impliquer des perspectives diverses. Vitesse: Équilibrer la minutie avec la rapidité. Plan d\'action: Pratiquer la prise de décision structurée.',
  },
  {
    capability: 'problem_solving_and_decision_making',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Problem-solving and decision-making are strong, analytical, and effective. Complex issues are handled well with appropriate analysis and stakeholder input. Opportunities may remain in strategic decision-making, innovation, or handling ambiguity.',
    analysisFr: 'La résolution de problèmes et la prise de décision sont fortes, analytiques et efficaces. Les problèmes complexes sont bien gérés avec une analyse appropriée et l\'avis des parties prenantes. Des opportunités peuvent subsister dans la prise de décision stratégique, l\'innovation ou la gestion de l\'ambiguïté.',
    recommendation: 'Strategic: Make decisions with long-term impact. Innovation: Foster creative problem-solving. Complexity: Handle ambiguous situations confidently. Influence: Guide others in decision-making. Action Plan: Lead strategic initiatives.',
    recommendationFr: 'Stratégique: Prendre des décisions avec un impact à long terme. Innovation: Favoriser la résolution créative de problèmes. Complexité: Gérer les situations ambiguës avec confiance. Influence: Guider les autres dans la prise de décision. Plan d\'action: Diriger les initiatives stratégiques.',
  },

  // STRESS MANAGEMENT INSIGHTS
  {
    capability: 'stress_management',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Stress management appears limited, with stress negatively impacting performance, relationships, or well-being. Coping strategies may be ineffective or absent. Team members may notice stress affecting leadership effectiveness.',
    analysisFr: 'La gestion du stress semble limitée, le stress ayant un impact négatif sur la performance, les relations ou le bien-être. Les stratégies d\'adaptation peuvent être inefficaces ou absentes. Les membres de l\'équipe peuvent remarquer que le stress affecte l\'efficacité du leadership.',
    recommendation: 'Awareness: Recognize stress triggers and patterns. Coping: Develop healthy stress management techniques. Boundaries: Set limits to protect well-being. Support: Seek help when needed. Action Plan: Build daily stress management habits.',
    recommendationFr: 'Conscience: Reconnaître les déclencheurs et les schémas de stress. Adaptation: Développer des techniques saines de gestion du stress. Limites: Fixer des limites pour protéger le bien-être. Soutien: Chercher de l\'aide si nécessaire. Plan d\'action: Construire des habitudes quotidiennes de gestion du stress.',
  },
  {
    capability: 'stress_management',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Stress is managed adequately in most situations, but challenges may arise during high-pressure periods. Some coping strategies are effective, while others could be strengthened. Consistency in stress management could improve.',
    analysisFr: 'Le stress est géré de manière adéquate dans la plupart des situations, mais des défis peuvent survenir pendant les périodes de forte pression. Certaines stratégies d\'adaptation sont efficaces, tandis que d\'autres pourraient être renforcées. La cohérence dans la gestion du stress pourrait s\'améliorer.',
    recommendation: 'Consistency: Maintain stress management during pressure. Resilience: Build capacity to handle challenges. Balance: Prioritize well-being alongside performance. Techniques: Expand stress management toolkit. Action Plan: Practice stress management proactively.',
    recommendationFr: 'Cohérence: Maintenir la gestion du stress pendant la pression. Résilience: Construire la capacité à gérer les défis. Équilibre: Prioriser le bien-être parallèlement à la performance. Techniques: Élargir la boîte à outils de gestion du stress. Plan d\'action: Pratiquer la gestion du stress de manière proactive.',
  },
  {
    capability: 'stress_management',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Stress is managed effectively with strong resilience and composure. Leadership remains effective under pressure. Team members likely see calm, steady leadership. Opportunities may remain in supporting others\' stress management or handling extreme situations.',
    analysisFr: 'Le stress est géré efficacement avec une forte résilience et un sang-froid. Le leadership reste efficace sous pression. Les membres de l\'équipe voient probablement un leadership calme et stable. Des opportunités peuvent subsister pour soutenir la gestion du stress des autres ou gérer des situations extrêmes.',
    recommendation: 'Support: Help others manage stress effectively. Modeling: Demonstrate resilience to team. Advanced: Handle extreme pressure situations. Wellness: Maintain long-term well-being. Action Plan: Lead stress management initiatives.',
    recommendationFr: 'Soutien: Aider les autres à gérer le stress efficacement. Modélisation: Démontrer la résilience à l\'équipe. Avancé: Gérer les situations de pression extrême. Bien-être: Maintenir le bien-être à long terme. Plan d\'action: Diriger les initiatives de gestion du stress.',
  },

  // CHANGE MANAGEMENT INSIGHTS
  {
    capability: 'change_management',
    scoreRange: '1-2',
    colorCode: '#FFC7CE',
    analysis: 'Change management appears limited, with resistance, confusion, or ineffective adaptation to change. Team members may struggle with transitions or lack support during change. Change initiatives may face obstacles.',
    analysisFr: 'La gestion du changement semble limitée, avec résistance, confusion ou adaptation inefficace au changement. Les membres de l\'équipe peuvent avoir des difficultés avec les transitions ou manquer de soutien pendant le changement. Les initiatives de changement peuvent rencontrer des obstacles.',
    recommendation: 'Foundation: Understand change management principles. Communication: Explain change clearly to team. Support: Provide resources during transitions. Resilience: Build adaptability. Action Plan: Start with small change initiatives.',
    recommendationFr: 'Fondation: Comprendre les principes de gestion du changement. Communication: Expliquer le changement clairement à l\'équipe. Soutien: Fournir des ressources pendant les transitions. Résilience: Construire l\'adaptabilité. Plan d\'action: Commencer par de petites initiatives de changement.',
  },
  {
    capability: 'change_management',
    scoreRange: '3',
    colorCode: '#FFEB9C',
    analysis: 'Change management is functional but could be more effective. Some changes are handled well, while others reveal gaps in communication, support, or adaptation. Opportunities exist in improving change leadership and team support.',
    analysisFr: 'La gestion du changement est fonctionnelle mais pourrait être plus efficace. Certains changements sont bien gérés, tandis que d\'autres révèlent des lacunes dans la communication, le soutien ou l\'adaptation. Des opportunités existent pour améliorer le leadership du changement et le soutien de l\'équipe.',
    recommendation: 'Effectiveness: Improve change communication and planning. Engagement: Involve team in change process. Support: Provide ongoing assistance during transitions. Adaptation: Develop flexibility. Action Plan: Practice change leadership skills.',
    recommendationFr: 'Efficacité: Améliorer la communication et la planification du changement. Engagement: Impliquer l\'équipe dans le processus de changement. Soutien: Fournir une assistance continue pendant les transitions. Adaptation: Développer la flexibilité. Plan d\'action: Pratiquer les compétences de leadership du changement.',
  },
  {
    capability: 'change_management',
    scoreRange: '4-5',
    colorCode: '#C6EFCE',
    analysis: 'Change management is strong, with effective adaptation and leadership during transitions. Team members likely feel supported and clear about changes. Opportunities may remain in driving large-scale transformations or maintaining momentum during extended change.',
    analysisFr: 'La gestion du changement est forte, avec une adaptation et un leadership efficaces pendant les transitions. Les membres de l\'équipe se sentent probablement soutenus et clairs sur les changements. Des opportunités peuvent subsister pour conduire des transformations à grande échelle ou maintenir l\'élan pendant un changement prolongé.',
    recommendation: 'Transformation: Lead large-scale organizational change. Vision: Drive strategic change initiatives. Sustainability: Maintain change momentum. Influence: Guide others through change. Action Plan: Champion transformation initiatives.',
    recommendationFr: 'Transformation: Diriger le changement organisationnel à grande échelle. Vision: Conduire des initiatives de changement stratégique. Durabilité: Maintenir l\'élan du changement. Influence: Guider les autres à travers le changement. Plan d\'action: Défendre les initiatives de transformation.',
  },
];

/**
 * Get insight for a specific capability based on score with locale support
 */
export function getFeedback360InsightWithLocale(
  capability: string,
  score: number,
  locale: string = 'en'
): {
  analysis: string;
  recommendation: string;
  colorCode: string;
} | null {
  const insight = getFeedback360Insight(capability, score);
  if (!insight) return null;
  
  const isFrench = locale === 'fr' || locale.startsWith('fr');
  
  return {
    analysis: isFrench && insight.analysisFr ? insight.analysisFr : insight.analysis,
    recommendation: isFrench && insight.recommendationFr ? insight.recommendationFr : insight.recommendation,
    colorCode: insight.colorCode
  };
}

/**
 * Get insight for a specific capability based on score
 */
export function getFeedback360Insight(
  capability: string,
  score: number
): Feedback360CapabilityInsight | null {
  // Find the matching insight based on capability and score range
  const insights = feedback360Insights.filter(insight => {
    // Normalize capability name for comparison
    const normalizedCapability = insight.capability.toLowerCase().replace(/\s+/g, '_');
    const normalizedInputCapability = capability.toLowerCase().replace(/\s+/g, '_');
    
    // Check if capabilities match
    const capabilityMatches = normalizedCapability === normalizedInputCapability ||
                             normalizedCapability.includes(normalizedInputCapability) ||
                             normalizedInputCapability.includes(normalizedCapability);
    
    if (!capabilityMatches) return false;
    
    // Parse score range
    const [min, max] = insight.scoreRange.split('-').map(s => parseInt(s.trim()));
    if (min === undefined) return false;
    if (max === undefined) {
      // Single value range (e.g., "3")
      return score === min;
    }
    return score >= min && score <= max;
  });
  
  return insights[0] || null;
}

/**
 * Get color code for a 360-feedback score
 */
export function get360ScoreColorCode(score: number): string {
  if (score >= 4) return '#C6EFCE'; // Green (4-5)
  if (score >= 3) return '#FFEB9C'; // Yellow (3)
  return '#FFC7CE'; // Red (1-2)
}
