/**
 * 360° Feedback Questions - FROM EXCEL
 * 30 questions across 6 leadership capabilities
 * Each question is rated on a scale of 1-5
 */

export type Feedback360Capability = 
  | 'change_management'
  | 'communication'
  | 'leadership_style'
  | 'problem_solving_and_decision_making'
  | 'stress_management'
  | 'team_culture';

export interface Feedback360Question {
  id: string;
  number: number;
  capability: Feedback360Capability;
  question: string;
}

export const feedback360Capabilities = [
  {
    id: 'change_management' as Feedback360Capability,
    title: 'Change Management',
    icon: '🔄',
    description: 'Ability to adapt to and drive organizational changes effectively.',
  },
  {
    id: 'communication' as Feedback360Capability,
    title: 'Communication',
    icon: '💬',
    description: 'Effectiveness in conveying ideas and understanding others.',
  },
  {
    id: 'leadership_style' as Feedback360Capability,
    title: 'Leadership Style',
    icon: '👔',
    description: 'Approach to inspiring, motivating, and guiding others.',
  },
  {
    id: 'problem_solving_and_decision_making' as Feedback360Capability,
    title: 'Problem Solving and Decision Making',
    icon: '🧩',
    description: 'Ability to analyze situations and make effective decisions.',
  },
  {
    id: 'stress_management' as Feedback360Capability,
    title: 'Stress Management',
    icon: '🧘',
    description: 'Capacity to handle pressure and maintain composure.',
  },
  {
    id: 'team_culture' as Feedback360Capability,
    title: 'Team Culture',
    icon: '👥',
    description: 'Contribution to building positive and collaborative team environments.',
  },
];

export const feedback360Questions: Feedback360Question[] = [
  {
    id: '360_1',
    number: 1,
    capability: 'communication',
    question: 'I communicate my ideas and expectations clearly and in a way that is easy to understand.',
  },
  {
    id: '360_2',
    number: 2,
    capability: 'communication',
    question: 'I listen attentively and demonstrate understanding of others’ perspectives before responding',
  },
  {
    id: '360_3',
    number: 3,
    capability: 'communication',
    question: 'I adapt my communication style to different audiences and situations.',
  },
  {
    id: '360_4',
    number: 4,
    capability: 'communication',
    question: 'I provide feedback that is respectful, actionable, and supportive of growth',
  },
  {
    id: '360_5',
    number: 5,
    capability: 'communication',
    question: 'My communication fosters collaboration, engagement and alignment within the team.',
  },
  {
    id: '360_6',
    number: 6,
    capability: 'team_culture',
    question: 'I promote teamwork and support colleagues to achieve shared goals',
  },
  {
    id: '360_7',
    number: 7,
    capability: 'team_culture',
    question: 'I treat team members with respect and encourage an inclusive environment where everyone feels valued.',
  },
  {
    id: '360_8',
    number: 8,
    capability: 'team_culture',
    question: 'I build trust within the team by being reliable, transparent and accountable',
  },
  {
    id: '360_9',
    number: 9,
    capability: 'team_culture',
    question: 'I address and resolve conflicts in a constructive and respectful way',
  },
  {
    id: '360_10',
    number: 10,
    capability: 'team_culture',
    question: 'I actively contribute to building a positive, motivating and collaborative team culture.',
  },
  {
    id: '360_11',
    number: 11,
    capability: 'leadership_style',
    question: 'I inspire and motivate others towards a shared vision',
  },
  {
    id: '360_12',
    number: 12,
    capability: 'leadership_style',
    question: 'I demonstrate fairness, integrity and consistency in my leadership.',
  },
  {
    id: '360_13',
    number: 13,
    capability: 'leadership_style',
    question: 'I empower others to take ownership and make decisions.',
  },
  {
    id: '360_14',
    number: 14,
    capability: 'leadership_style',
    question: 'I adapt my leadership style to different situations and individuals.',
  },
  {
    id: '360_15',
    number: 15,
    capability: 'leadership_style',
    question: 'I provide clear direction while also encouraging autonomy.',
  },
  {
    id: '360_16',
    number: 16,
    capability: 'change_management',
    question: 'I embrace and adapt effectively to organizational changes.',
  },
  {
    id: '360_17',
    number: 17,
    capability: 'change_management',
    question: 'I help others understand and navigate change confidently.',
  },
  {
    id: '360_18',
    number: 18,
    capability: 'change_management',
    question: 'I maintain a positive and flexible attitude during transitions.',
  },
  {
    id: '360_19',
    number: 19,
    capability: 'change_management',
    question: 'I support the team effectively during challenges linked to change.',
  },
  {
    id: '360_20',
    number: 20,
    capability: 'change_management',
    question: 'I actively contribute to driving and sustaining change initiatives.',
  },
  {
    id: '360_21',
    number: 21,
    capability: 'problem_solving_and_decision_making',
    question: 'I analyze problems effectively and identify appropriate solutions.',
  },
  {
    id: '360_22',
    number: 22,
    capability: 'problem_solving_and_decision_making',
    question: 'I consider diverse perspectives when solving problems.',
  },
  {
    id: '360_23',
    number: 23,
    capability: 'problem_solving_and_decision_making',
    question: 'I manage disagreements constructively and seek mutually beneficial solutions.',
  },
  {
    id: '360_24',
    number: 24,
    capability: 'problem_solving_and_decision_making',
    question: 'I remain calm and constructive under pressure.',
  },
  {
    id: '360_25',
    number: 25,
    capability: 'problem_solving_and_decision_making',
    question: 'I follow through on problem-solving actions to ensure effective outcomes.',
  },
  {
    id: '360_26',
    number: 26,
    capability: 'stress_management',
    question: 'I manage stress without negatively affecting performance or team dynamics.',
  },
  {
    id: '360_27',
    number: 27,
    capability: 'stress_management',
    question: 'I demonstrate resilience and composure under pressure.',
  },
  {
    id: '360_28',
    number: 28,
    capability: 'stress_management',
    question: 'I use healthy coping strategies to handle stress effectively.',
  },
  {
    id: '360_29',
    number: 29,
    capability: 'stress_management',
    question: 'I support colleagues in managing stress and maintaining well-being.',
  },
  {
    id: '360_30',
    number: 30,
    capability: 'stress_management',
    question: 'I balance workload and prioritize effectively to prevent unnecessary stress.',
  },
];

export interface Feedback360ScaleOption {
  value: number;
  label: string;
}

export const feedback360Scale: Feedback360ScaleOption[] = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];
