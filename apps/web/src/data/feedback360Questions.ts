/**
 * 360° Feedback Questions
 * 30 questions across 6 leadership capabilities
 * Scale: 1-5 (Never to Always)
 */

export type Feedback360Capability = 
  | 'communication'
  | 'team_culture'
  | 'leadership_style'
  | 'change_management'
  | 'problem_solving'
  | 'stress_management';

export interface Feedback360Question {
  id: string;
  number: number;
  capability: Feedback360Capability;
  text: string;
}

export const feedback360Scale = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost always or Always' },
];

export const feedback360Capabilities = [
  {
    id: 'communication' as Feedback360Capability,
    title: 'Communication',
    description: 'Clear, adaptive, and collaborative communication',
    icon: '💬',
    color: 'bg-blue-500',
  },
  {
    id: 'team_culture' as Feedback360Capability,
    title: 'Team Culture',
    description: 'Building trust, respect, and inclusivity',
    icon: '🤝',
    color: 'bg-green-500',
  },
  {
    id: 'leadership_style' as Feedback360Capability,
    title: 'Leadership Style',
    description: 'Inspiring, empowering, and adaptive leadership',
    icon: '👑',
    color: 'bg-purple-500',
  },
  {
    id: 'change_management' as Feedback360Capability,
    title: 'Change Management',
    description: 'Embracing and driving organizational change',
    icon: '🔄',
    color: 'bg-orange-500',
  },
  {
    id: 'problem_solving' as Feedback360Capability,
    title: 'Problem Solving and Decision Making',
    description: 'Analytical, collaborative, and effective solutions',
    icon: '🧩',
    color: 'bg-red-500',
  },
  {
    id: 'stress_management' as Feedback360Capability,
    title: 'Stress Management',
    description: 'Resilience, composure, and well-being',
    icon: '🧘',
    color: 'bg-teal-500',
  },
];

export const feedback360Questions: Feedback360Question[] = [
  // Communication (5 questions)
  {
    id: '360_q1',
    number: 1,
    capability: 'communication',
    text: 'I communicate my ideas and expectations clearly and in a way that is easy to understand.',
  },
  {
    id: '360_q2',
    number: 2,
    capability: 'communication',
    text: 'I listen attentively and demonstrate understanding of others\' perspectives before responding.',
  },
  {
    id: '360_q3',
    number: 3,
    capability: 'communication',
    text: 'I adapt my communication style to different audiences and situations.',
  },
  {
    id: '360_q4',
    number: 4,
    capability: 'communication',
    text: 'I provide feedback that is respectful, actionable, and supportive of growth.',
  },
  {
    id: '360_q5',
    number: 5,
    capability: 'communication',
    text: 'My communication fosters collaboration, engagement and alignment within the team.',
  },

  // Team Culture (5 questions)
  {
    id: '360_q6',
    number: 6,
    capability: 'team_culture',
    text: 'I promote teamwork and support colleagues to achieve shared goals.',
  },
  {
    id: '360_q7',
    number: 7,
    capability: 'team_culture',
    text: 'I treat team members with respect and encourage an inclusive environment where everyone feels valued.',
  },
  {
    id: '360_q8',
    number: 8,
    capability: 'team_culture',
    text: 'I build trust within the team by being reliable, transparent and accountable.',
  },
  {
    id: '360_q9',
    number: 9,
    capability: 'team_culture',
    text: 'I address and resolve conflicts in a constructive and respectful way.',
  },
  {
    id: '360_q10',
    number: 10,
    capability: 'team_culture',
    text: 'I actively contribute to building a positive, motivating and collaborative team culture.',
  },

  // Leadership Style (5 questions)
  {
    id: '360_q11',
    number: 11,
    capability: 'leadership_style',
    text: 'I inspire and motivate others towards a shared vision.',
  },
  {
    id: '360_q12',
    number: 12,
    capability: 'leadership_style',
    text: 'I demonstrate fairness, integrity and consistency in my leadership.',
  },
  {
    id: '360_q13',
    number: 13,
    capability: 'leadership_style',
    text: 'I empower others to take ownership and make decisions.',
  },
  {
    id: '360_q14',
    number: 14,
    capability: 'leadership_style',
    text: 'I adapt my leadership style to different situations and individuals.',
  },
  {
    id: '360_q15',
    number: 15,
    capability: 'leadership_style',
    text: 'I provide clear direction while also encouraging autonomy.',
  },

  // Change Management (5 questions)
  {
    id: '360_q16',
    number: 16,
    capability: 'change_management',
    text: 'I embrace and adapt effectively to organizational changes.',
  },
  {
    id: '360_q17',
    number: 17,
    capability: 'change_management',
    text: 'I help others understand and navigate change confidently.',
  },
  {
    id: '360_q18',
    number: 18,
    capability: 'change_management',
    text: 'I maintain a positive and flexible attitude during transitions.',
  },
  {
    id: '360_q19',
    number: 19,
    capability: 'change_management',
    text: 'I support the team effectively during challenges linked to change.',
  },
  {
    id: '360_q20',
    number: 20,
    capability: 'change_management',
    text: 'I actively contribute to driving and sustaining change initiatives.',
  },

  // Problem Solving and Decision Making (5 questions)
  {
    id: '360_q21',
    number: 21,
    capability: 'problem_solving',
    text: 'I analyze problems effectively and identify appropriate solutions.',
  },
  {
    id: '360_q22',
    number: 22,
    capability: 'problem_solving',
    text: 'I consider diverse perspectives when solving problems.',
  },
  {
    id: '360_q23',
    number: 23,
    capability: 'problem_solving',
    text: 'I manage disagreements constructively and seek mutually beneficial solutions.',
  },
  {
    id: '360_q24',
    number: 24,
    capability: 'problem_solving',
    text: 'I remain calm and constructive under pressure.',
  },
  {
    id: '360_q25',
    number: 25,
    capability: 'problem_solving',
    text: 'I follow through on problem-solving actions to ensure effective outcomes.',
  },

  // Stress Management (5 questions)
  {
    id: '360_q26',
    number: 26,
    capability: 'stress_management',
    text: 'I manage stress without negatively affecting performance or team dynamics.',
  },
  {
    id: '360_q27',
    number: 27,
    capability: 'stress_management',
    text: 'I demonstrate resilience and composure under pressure.',
  },
  {
    id: '360_q28',
    number: 28,
    capability: 'stress_management',
    text: 'I use healthy coping strategies to handle stress effectively.',
  },
  {
    id: '360_q29',
    number: 29,
    capability: 'stress_management',
    text: 'I support colleagues in managing stress and maintaining well-being.',
  },
  {
    id: '360_q30',
    number: 30,
    capability: 'stress_management',
    text: 'I balance workload and prioritize effectively to prevent unnecessary stress.',
  },
];

// Helper function to get questions by capability
export const getQuestionsByCapability = (capability: Feedback360Capability) => {
  return feedback360Questions.filter(q => q.capability === capability);
};

// Helper function to get capability info
export const getCapabilityInfo = (capability: Feedback360Capability) => {
  return feedback360Capabilities.find(c => c.id === capability);
};
