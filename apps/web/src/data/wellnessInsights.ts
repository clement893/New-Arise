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
  recommendation: string;
  actions: string[];
}

export const wellnessInsights: WellnessPillarInsight[] = [
  // SLEEP INSIGHTS
  {
    pillar: 'Sleep',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Sleep is insufficient or irregular, leading to fatigue, reduced focus, and impaired performance. Poor sleep habits may negatively affect health and mood.',
    recommendation: 'Establish foundational sleep hygiene and consistent routines to improve rest, energy, and cognitive performance.',
    actions: [
      'Set fixed sleep/wake times daily',
      'Remove screens 60 minutes before bed',
      'Create a dark, cool, quiet sleep environment'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Sleep is adequate at times but inconsistent. Occasional fatigue or concentration issues may occur.',
    recommendation: 'Strengthen consistency and quality by refining habits and eliminating disruptions that cause irregular rest.',
    actions: [
      'Track sleep patterns weekly',
      'Introduce calming wind-down routines',
      'Reduce caffeine and heavy meals late in the day'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Sleep patterns are generally healthy and consistent, supporting sustained energy and emotional balance. Some variability may occur during high-pressure periods or travel, creating opportunities to refine recovery cycles.',
    recommendation: 'Maintain strong habits while optimizing recovery during periods of stress, travel, or peak demand.',
    actions: [
      'Implement pre-sleep relaxation practices',
      'Prioritize deep-sleep quality',
      'Use sleep tracking to align timing with circadian rhythm'
    ]
  },
  {
    pillar: 'Sleep',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Sleep is restorative and consistent, supporting strong performance and well-being. Opportunities may remain in optimizing quality during periods of stress or travel.',
    recommendation: 'Continue advanced optimization and leverage habits to support peak performance and leadership well-being and share practices to others.',
    actions: [
      'Integrate habits and behaviors that help improve Heart Rate Variability (HRV)',
      'Plan sleep proactively during high-demand cycles',
      'Share healthy habits with others'
    ]
  },

  // NUTRITION INSIGHTS
  {
    pillar: 'Nutrition',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Diet may be unbalanced or inconsistent, impacting energy, concentration, and long-term health. Possible reliance on processed or unhealthy foods.',
    recommendation: 'Build a balanced nutritional foundation to improve energy, focus, and long-term wellness.',
    actions: [
      'Increase daily intake of whole foods, fruits, vegetables',
      'Reduce processed foods and added sugars',
      'Prepare simple planned meals'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Nutrition is generally adequate but inconsistent. Healthy eating is practiced but may lapse during stress or busy periods.',
    recommendation: 'Improve consistency and balance, especially during stress or irregular schedules and refine meal planning for balance and consistency.',
    actions: [
      'Strengthen hydration habits',
      'Meal prep multiple days',
      'Keep healthy snacks accessible and portion control'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Nutrition habits are strong, balanced, and mostly aligned with energy and performance goals. Occasional gaps may occur with time pressure, social environments, or travel.',
    recommendation: 'Maintain strong nutrition habits and refine alignment to performance needs and lifestyle demands.',
    actions: [
      'Track nutrition during busy periods',
      'Increase micronutrient diversity',
      'Share strategies to inspire others and to be continued engaged in healthy eating ideas and actions'
    ]
  },
  {
    pillar: 'Nutrition',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Nutrition is balanced and supportive of energy and health. Remaining opportunities may be in fine-tuning for performance or wellness goals.',
    recommendation: 'Pursue advanced optimization to amplify energy and influence others positively.',
    actions: [
      'Use performance-aligned nutrition strategies',
      'Maintain personalized hydration plan',
      'Mentor others in healthy habits'
    ]
  },

  // MOVEMENT INSIGHTS
  {
    pillar: 'Movement',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Physical activity is insufficient, which may affect energy, mood, and long-term health.',
    recommendation: 'Establish regular movement habits to support baseline health, energy, and strength.',
    actions: [
      'Daily low-intensity activity',
      'Set weekly movement goals',
      'Reduce sedentary time with movement breaks'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Movement is present but inconsistent or not diverse. May lack strength, flexibility, or endurance balance.',
    recommendation: 'Increase consistency and diversify movement to balance strength, cardio, and mobility.',
    actions: [
      'Schedule workouts to establish consistency in habits',
      'Add strength + flexibility components',
      'Use activity trackers'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Movement routines are consistent and contribute positively to strength, mobility, and energy. Opportunities may lie in structured training plans, progression cycles, or improved recovery practices.',
    recommendation: 'Maintain regular activity while progressing toward performance goals and structured improvement.',
    actions: [
      'Follow progressive training plans',
      'Schedule active recovery',
      'Track physical metrics'
    ]
  },
  {
    pillar: 'Movement',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Movement is consistent and well-balanced, supporting strong health and energy. Opportunities may remain in optimizing performance or recovery.',
    recommendation: 'Elevate training strategy to maximize performance and recovery while supporting others\' growth.',
    actions: [
      'Maintain prioritization of training habits',
      'Pair recovery tools with training',
      'Support others in active habits'
    ]
  },

  // AVOIDANCE OF RISKY SUBSTANCES INSIGHTS
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'High or frequent exposure to toxic substances (alcohol, nicotine, drugs) negatively impacts health and performance.',
    recommendation: 'Reduce harmful substance use and establish healthier coping mechanisms.',
    actions: [
      'Set reduction goals',
      'Seek support if needed',
      'Replace habits with healthy alternatives'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Occasional or moderate use of substances, but habits may still pose risks over time.',
    recommendation: 'Increase intentionality and boundaries to minimize long-term risk.',
    actions: [
      'Set daily limits',
      'Identify the main triggers and reframe it to support change',
      'Replace stress-driven use with wellness routines'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Healthy habits and self-regulation are present, with minimal reliance on substances for coping or social settings. Occasional consumption may still be habitual rather than intentional.',
    recommendation: 'Maintain low use and reinforce conscious, values-aligned choices.',
    actions: [
      'Monitor habits in social settings',
      'Prioritize choosing wellness alternatives',
      'Pair stress relief with non-substance rituals'
    ]
  },
  {
    pillar: 'Avoidance of Risky Substances',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Avoidance of toxic substances is strong, supporting optimal health. Opportunities remain in educating and supporting others in healthy choices.',
    recommendation: 'Sustain optimal avoidance while supporting awareness and community health.',
    actions: [
      'Share strategies for cross-collaboration and engagement',
      'Maintain rituals that reinforce identity',
      'Advocate for substance-free spaces'
    ]
  },

  // STRESS MANAGEMENT INSIGHTS
  {
    pillar: 'Stress Management',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Stress is poorly managed, leading to negative impacts on health, relationships, or decision-making.',
    recommendation: 'Build foundational coping mechanisms to reduce negative impacts of stress.',
    actions: [
      'Identify stress triggers',
      'Begin daily mindfulness',
      'Install breathing techniques when stress is abnormal'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Stress management is adequate but not consistent. Some situations may still cause visible strain.',
    recommendation: 'Improve consistency in managing stress across environments.',
    actions: [
      'Plan routines proactively and follow for consistency',
      'Use physical activity for regulation',
      'Practice journaling'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Stress is generally managed well through coping strategies and emotional awareness. Occasional overwhelm may surface during major deadlines or multiple responsibilities.',
    recommendation: 'Maintain healthy coping strategies and strengthen responses during peak pressure.',
    actions: [
      'Track patterns to validate gaps',
      'Use short daily resilience practices',
      'Set boundaries protecting energy'
    ]
  },
  {
    pillar: 'Stress Management',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Stress is managed effectively, with resilience in most situations. Opportunities may remain in supporting others.',
    recommendation: 'Continue modeling resilience and supporting others in healthy stress habits.',
    actions: [
      'Lead stress conversations',
      'Integrate recovery cycles',
      'Mentor others in resilience'
    ]
  },

  // SOCIAL CONNECTION INSIGHTS
  {
    pillar: 'Social Connection',
    scoreRange: '5-10',
    colorCode: '#FFC7CE',
    assessment: 'Social connections may be limited or strained, leading to feelings of isolation or reduced support.',
    recommendation: 'Build relationships to reduce isolation and improve well-being.',
    actions: [
      'Reach out weekly',
      'Join community activities',
      'Express emotional needs openly'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '11-15',
    colorCode: '#FFEB9C',
    assessment: 'Social connections are present but may lack depth or consistency. Support network is adequate but could be strengthened.',
    recommendation: 'Strengthen depth and consistency of relationships.',
    actions: [
      'Schedule recurring check-ins',
      'Practice active listening',
      'Deepen select relationships'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '16-20',
    colorCode: '#92D050',
    assessment: 'Social relationships are meaningful and supportive, contributing to well-being and belonging. Opportunities lie in expanding networks or deepening selective relationships for mutual growth.',
    recommendation: 'Maintain meaningful relationships while expanding networks for mutual growth.',
    actions: [
      'Join aligned communities',
      'Invest time in close relationships',
      'Support others\' goals'
    ]
  },
  {
    pillar: 'Social Connection',
    scoreRange: '21-25',
    colorCode: '#00B050',
    assessment: 'Strong social connections provide support, belonging, and resilience. Opportunities may remain in expanding networks or mentoring others.',
    recommendation: 'Leverage strong networks to reinforce collective well-being.',
    actions: [
      'Mentor others',
      'Lead community initiatives',
      'Create intentional spaces for connection'
    ]
  }
];

/**
 * Get insight for a specific pillar based on score
 */
export function getWellnessInsight(pillar: string, score: number): WellnessPillarInsight | null {
  // Find the matching insight based on pillar and score range
  const insights = wellnessInsights.filter(insight => {
    // Normalize pillar name for comparison
    const normalizedPillar = insight.pillar.toLowerCase().replace(/\s+/g, '_');
    const normalizedInputPillar = pillar.toLowerCase().replace(/\s+/g, '_');
    
    // Check if pillars match (handling variations like "avoidance_of_risky_substances")
    const pillarMatches = normalizedPillar === normalizedInputPillar ||
                         normalizedPillar.includes(normalizedInputPillar) ||
                         normalizedInputPillar.includes(normalizedPillar);
    
    if (!pillarMatches) return false;
    
    // Parse score range
    const [min, max] = insight.scoreRange.split('-').map(s => parseInt(s.trim()));
    if (min === undefined || max === undefined) return false;
    return score >= min && score <= max;
  });
  
  return insights[0] || null;
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
