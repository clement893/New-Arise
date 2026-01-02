/**
 * Wellness Assessment Questions - FROM EXCEL
 * 30 questions across 6 wellness pillars
 * Each question is rated on a scale of 1-5
 */

export type WellnessPillar = 
  | 'avoidance_of_risky_substances'
  | 'stress_management'
  | 'sleep'
  | 'movement'
  | 'nutrition'
  | 'social_connection';

export interface WellnessQuestion {
  id: string;
  number: number;
  pillar: WellnessPillar;
  subcategory: string;
  question: string;
}

export const wellnessPillars = [
  {
    id: 'avoidance_of_risky_substances' as WellnessPillar,
    title: 'Avoidance of Risky Substances',
    description: 'This section explores habits around toxic substances, which represents limiting or avoiding harmful substances (e.g., tobacco, excess alcohol, drugs) to protect health and clarity.',
  },
  {
    id: 'movement' as WellnessPillar,
    title: 'Movement',
    description: 'This section explores our habits around being active through movement, which represents regular exercise or psysical activity to boost heart beat, strength, energy, and overall mood.',
  },
  {
    id: 'nutrition' as WellnessPillar,
    title: 'Nutrition',
    description: 'This section explores our eating habits, which represents eating balanced, nourishing meals that provide energy, strengthen the body, and promote long-term well-being.',
  },
  {
    id: 'sleep' as WellnessPillar,
    title: 'Sleep',
    description: 'This section explores the quality of our sleep, which represents consistently getting enough restful sleep to restore energy, improve focus, and support overall health.',
  },
  {
    id: 'social_connection' as WellnessPillar,
    title: 'Social Connection',
    description: 'This section explores our social connections, which represent building and maintaining supportive, positive relationships that create a sense of belonging and emotional well-being.',
  },
  {
    id: 'stress_management' as WellnessPillar,
    title: 'Stress Management',
    description: 'This section explores our ability to manage our stress levels, which represents using healthy strategies (e.g., relaxation, mindfulness, planning) to reduce tension and prevent burnout.',
  },
];

export const wellnessQuestions: WellnessQuestion[] = [
  {
    id: 'wellness_1',
    number: 1,
    pillar: 'avoidance_of_risky_substances',
    subcategory: 'CCSA Guidelines - Canadian Centre on Substance Use and Addiction',
    question: 'I avoid or limit my weekly alcohol consumption to about 2 glasses per week',
  },
  {
    id: 'wellness_2',
    number: 2,
    pillar: 'avoidance_of_risky_substances',
    subcategory: 'Tobacco and Nicotine ',
    question: 'I make healthy choices by avoiding tobacco in all forms, such as smoking, vaping, or chewing tobacco.',
  },
  {
    id: 'wellness_3',
    number: 3,
    pillar: 'avoidance_of_risky_substances',
    subcategory: 'Controlled and illegal drugs - Canada.ca',
    question: 'I take prescription and over-the-counter medications responsibly, following dosage instructions and using them only when medically necessary',
  },
  {
    id: 'wellness_4',
    number: 4,
    pillar: 'avoidance_of_risky_substances',
    subcategory: 'Caffeine Intake Amounts',
    question: 'I keep my caffeine consumption within healthy limits, which is no more than 3 cups of coffee or 8 cups of tea per day',
  },
  {
    id: 'wellness_5',
    number: 5,
    pillar: 'avoidance_of_risky_substances',
    subcategory: 'Controlled and Illegal drugs',
    question: ' I do not consume illegal drugs and avoid usage of recreational drugs',
  },
  {
    id: 'wellness_6',
    number: 6,
    pillar: 'movement',
    subcategory: 'Movement Guidelines',
    question: 'I am regularly active for at least 150 min (1.5h) per week in ways that get my heart rate up, like fast walking, jogging, cycling, or sports.',
  },
  {
    id: 'wellness_7',
    number: 7,
    pillar: 'movement',
    subcategory: 'Movement Guidelines',
    question: 'I do strength or resistance training, such as weightlifting, bodyweight exercises, or resistance bands, at least twice a week.',
  },
  {
    id: 'wellness_8',
    number: 8,
    pillar: 'movement',
    subcategory: 'Movement Guidelines',
    question: 'I do flexibility or mobility exercises, such as stretching or yoga, at least 2–3 times per week',
  },
  {
    id: 'wellness_9',
    number: 9,
    pillar: 'movement',
    subcategory: 'Movement Guidelines',
    question: 'I avoid sitting for longer than 30–60 minutes at a time by standing, walking, or moving around during the day.',
  },
  {
    id: 'wellness_10',
    number: 10,
    pillar: 'movement',
    subcategory: 'Movement Guidelines',
    question: 'I have the physical and mental energy to stay active, focused, and productive throughout the day.',
  },
  {
    id: 'wellness_11',
    number: 11,
    pillar: 'nutrition',
    subcategory: 'Canada Food Guideline and Amounts',
    question: 'I make it a habit to eat balanced meals — for example, meals that combine protein (like fish, beans, or eggs), healthy fats (like nuts or olive oil), and complex carbs (like whole grains or vegetables).',
  },
  {
    id: 'wellness_12',
    number: 12,
    pillar: 'nutrition',
    subcategory: 'Foundations of Healthy Eating',
    question: 'Each day, I make sure to eat fruits and vegetables — about 5 or more servings, such as a piece of fruit, a handful of raw veggies, or half a cup of cooked vegetables.',
  },
  {
    id: 'wellness_13',
    number: 13,
    pillar: 'nutrition',
    subcategory: 'Sugar in Drinks and Snacks',
    question: 'I maintain a healthier lifestyle by focusing on nutritious foods while keeping processed foods, sugary drinks, and sweet snacks to a minimum — treating them as occasional rather than everyday choices.',
  },
  {
    id: 'wellness_14',
    number: 14,
    pillar: 'nutrition',
    subcategory: 'Water Intake Guidelines',
    question: 'I make sure to drink enough water throughout the day, aiming for the recommended amount — about 2.7 liters (91 ounces) for women and 3.8 liters (128 ounces) for men.',
  },
  {
    id: 'wellness_15',
    number: 15,
    pillar: 'nutrition',
    subcategory: 'Canada Food Guideline and Amounts',
    question: 'I consistently follow healthy eating habits (closer to  80%)  while allowing some flexibility during the week ( closer to 20%)',
  },
  {
    id: 'wellness_16',
    number: 16,
    pillar: 'sleep',
    subcategory: 'Amount of Sleep Needed',
    question: 'I get 7–9 hours of sleep most nights, supporting my health and daily energy.',
  },
  {
    id: 'wellness_17',
    number: 17,
    pillar: 'sleep',
    subcategory: 'Sleep Regularity',
    question: 'I maintain a regular sleep schedule by going to bed and waking up at consistent times.',
  },
  {
    id: 'wellness_18',
    number: 18,
    pillar: 'sleep',
    subcategory: 'Benefits of Sleep',
    question: 'Most nights, my sleep feels restful and restorative, leaving me refreshed in the morning.',
  },
  {
    id: 'wellness_19',
    number: 19,
    pillar: 'sleep',
    subcategory: 'Sleep Hygiene',
    question: 'I prepare for restful sleep by limiting caffeine, alcohol, and screen use (such as TV, phone, or computer) in the evening — especially within 1–2 hours before bedtime',
  },
  {
    id: 'wellness_20',
    number: 20,
    pillar: 'sleep',
    subcategory: 'Getting Back to Sleep',
    question: 'If my sleep is disrupted by stress, noise, or restlessness, I take healthy steps — such as calming my mind, creating a quiet environment, or using relaxation techniques — to settle back into restful sleep.',
  },
  {
    id: 'wellness_21',
    number: 21,
    pillar: 'social_connection',
    subcategory: 'Guidelines Social Connection',
    question: 'I have close personal relationships that are strong, supportive, and nurturing, and I feel I can rely on these people when I need help or support.',
  },
  {
    id: 'wellness_22',
    number: 22,
    pillar: 'social_connection',
    subcategory: 'Approach to Social Connectivity',
    question: 'I connect with friends, family, or community several times a week in meaningful ways — such as supportive conversations, shared activities, or spending quality time together.',
  },
  {
    id: 'wellness_23',
    number: 23,
    pillar: 'social_connection',
    subcategory: 'Support System for Mental Health',
    question: 'I feel comfortable seeking support from others when I need it.',
  },
  {
    id: 'wellness_24',
    number: 24,
    pillar: 'social_connection',
    subcategory: 'Healthy-Relationships',
    question: 'I choose positive and uplifting social interactions that support my well-being.',
  },
  {
    id: 'wellness_25',
    number: 25,
    pillar: 'social_connection',
    subcategory: 'Social Connection',
    question: 'I balance time with others and time alone in a way that supports my health and happiness — making space for connection, while also giving myself quiet time to rest, recharge, and take care of personal needs',
  },
  {
    id: 'wellness_26',
    number: 26,
    pillar: 'stress_management',
    subcategory: 'Coping with Stress',
    question: 'I notice when I am feeling stressed and use healthy strategies — such as deep breathing, taking breaks, exercising, or talking with someone I trust — to manage it as part of my daily life.',
  },
  {
    id: 'wellness_27',
    number: 27,
    pillar: 'stress_management',
    subcategory: 'Stress Management',
    question: 'A few times each week, I practice relaxation techniques — such as meditation, stretching, or deep breathing — to calm my mind, release tension, and support my overall well-being.',
  },
  {
    id: 'wellness_28',
    number: 28,
    pillar: 'stress_management',
    subcategory: 'Hobbies and Wellbeing',
    question: 'I make time several times a week for hobbies, fun, or personal enjoyment, which helps me relax, recharge, and maintain my well-being.',
  },
  {
    id: 'wellness_29',
    number: 29,
    pillar: 'stress_management',
    subcategory: 'Workplace Balance',
    question: 'I manage my workload in a balanced way, setting healthy limits and taking breaks when needed, so I can stay productive without feeling overwhelmed or burned out',
  },
  {
    id: 'wellness_30',
    number: 30,
    pillar: 'stress_management',
    subcategory: '',
    question: 'I experience a sense of calm, focus, and emotional balance in my daily life, helping me handle challenges without feeling overly stressed or unsettled.',
  },
];
