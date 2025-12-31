export interface WellnessQuestion {
  id: string;
  text: string;
  category: 'wellness' | 'mindfulness' | 'stress';
}

export interface WellnessCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const wellnessCategories: WellnessCategory[] = [
  {
    id: 'wellness',
    title: 'Wellness',
    description: 'Physical and mental well-being',
    icon: '💪',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Present moment awareness',
    icon: '🧘',
  },
  {
    id: 'stress',
    title: 'Stress Management',
    description: 'Coping with pressure',
    icon: '😌',
  },
];

export const wellnessQuestions: WellnessQuestion[] = [
  // Wellness questions
  {
    id: 'w1',
    text: 'I engage in regular physical exercise (at least 30 minutes, 3 times per week).',
    category: 'wellness',
  },
  {
    id: 'w2',
    text: 'I maintain a balanced and nutritious diet.',
    category: 'wellness',
  },
  {
    id: 'w3',
    text: 'I get adequate sleep (7-9 hours per night).',
    category: 'wellness',
  },
  {
    id: 'w4',
    text: 'I feel energized and motivated throughout the day.',
    category: 'wellness',
  },
  {
    id: 'w5',
    text: 'I take regular breaks during work to rest and recharge.',
    category: 'wellness',
  },
  
  // Mindfulness questions
  {
    id: 'm1',
    text: 'I practice mindfulness or meditation regularly.',
    category: 'mindfulness',
  },
  {
    id: 'm2',
    text: 'I am aware of my thoughts and emotions in the present moment.',
    category: 'mindfulness',
  },
  {
    id: 'm3',
    text: 'I can focus on one task at a time without getting distracted.',
    category: 'mindfulness',
  },
  {
    id: 'm4',
    text: 'I take time to reflect on my experiences and learnings.',
    category: 'mindfulness',
  },
  {
    id: 'm5',
    text: 'I am present and engaged in conversations with others.',
    category: 'mindfulness',
  },
  
  // Stress Management questions
  {
    id: 's1',
    text: 'I effectively manage my stress levels.',
    category: 'stress',
  },
  {
    id: 's2',
    text: 'I have healthy coping mechanisms for dealing with pressure.',
    category: 'stress',
  },
  {
    id: 's3',
    text: 'I maintain a good work-life balance.',
    category: 'stress',
  },
  {
    id: 's4',
    text: 'I feel in control of my workload and responsibilities.',
    category: 'stress',
  },
  {
    id: 's5',
    text: 'I seek support from others when I feel overwhelmed.',
    category: 'stress',
  },
];

export const scaleOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];
