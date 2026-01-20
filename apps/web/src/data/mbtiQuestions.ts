/**
 * MBTI Assessment Questions
 * Based on the Myers-Briggs Type Indicator framework
 *
 * 4 Dimensions:
 * - E/I: Extraversion vs Introversion (Energy source)
 * - S/N: Sensing vs Intuition (Information gathering)
 * - T/F: Thinking vs Feeling (Decision making)
 * - J/P: Judging vs Perceiving (Lifestyle)
 */

export interface MBTIQuestion {
  id: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  question: string;
  optionA: {
    text: string;
    preference: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  };
  optionB: {
    text: string;
    preference: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  };
}

export const mbtiQuestions: MBTIQuestion[] = [
  // Extraversion (E) vs Introversion (I) - 10 questions
  {
    id: 'ei_1',
    dimension: 'EI',
    question: 'At a party, you usually:',
    optionA: {
      text: 'Interact with many people, including strangers',
      preference: 'E',
    },
    optionB: {
      text: 'Interact with a few people you know well',
      preference: 'I',
    },
  },
  {
    id: 'ei_2',
    dimension: 'EI',
    question: 'After a long day, you prefer to:',
    optionA: {
      text: 'Go out and socialize to recharge',
      preference: 'E',
    },
    optionB: {
      text: 'Stay home alone to recharge',
      preference: 'I',
    },
  },
  {
    id: 'ei_3',
    dimension: 'EI',
    question: 'When working on a project, you prefer to:',
    optionA: {
      text: 'Work with a team and brainstorm together',
      preference: 'E',
    },
    optionB: {
      text: 'Work independently and think things through alone',
      preference: 'I',
    },
  },
  {
    id: 'ei_4',
    dimension: 'EI',
    question: 'You tend to:',
    optionA: {
      text: 'Think out loud and process ideas by talking',
      preference: 'E',
    },
    optionB: {
      text: 'Think internally before sharing your ideas',
      preference: 'I',
    },
  },
  {
    id: 'ei_5',
    dimension: 'EI',
    question: 'In social situations, you:',
    optionA: {
      text: 'Feel energized and enjoy being the center of attention',
      preference: 'E',
    },
    optionB: {
      text: 'Feel drained and prefer to observe from the sidelines',
      preference: 'I',
    },
  },
  {
    id: 'ei_6',
    dimension: 'EI',
    question: 'You make friends:',
    optionA: {
      text: 'Easily and have a wide circle of acquaintances',
      preference: 'E',
    },
    optionB: {
      text: 'Slowly and have a small circle of close friends',
      preference: 'I',
    },
  },
  {
    id: 'ei_7',
    dimension: 'EI',
    question: 'When solving a problem, you prefer to:',
    optionA: {
      text: 'Discuss it with others to get different perspectives',
      preference: 'E',
    },
    optionB: {
      text: 'Reflect on it privately before seeking input',
      preference: 'I',
    },
  },
  {
    id: 'ei_8',
    dimension: 'EI',
    question: 'At work, you:',
    optionA: {
      text: 'Enjoy open office spaces and frequent interactions',
      preference: 'E',
    },
    optionB: {
      text: 'Prefer quiet spaces with minimal interruptions',
      preference: 'I',
    },
  },
  {
    id: 'ei_9',
    dimension: 'EI',
    question: 'When learning something new, you prefer to:',
    optionA: {
      text: 'Learn through group discussions and activities',
      preference: 'E',
    },
    optionB: {
      text: 'Learn through reading and independent study',
      preference: 'I',
    },
  },
  {
    id: 'ei_10',
    dimension: 'EI',
    question: 'You would describe yourself as:',
    optionA: {
      text: 'Outgoing and expressive',
      preference: 'E',
    },
    optionB: {
      text: 'Reserved and reflective',
      preference: 'I',
    },
  },

  // Sensing (S) vs Intuition (N) - 10 questions
  {
    id: 'sn_1',
    dimension: 'SN',
    question: 'You tend to focus on:',
    optionA: {
      text: 'Facts and concrete details',
      preference: 'S',
    },
    optionB: {
      text: 'Patterns and possibilities',
      preference: 'N',
    },
  },
  {
    id: 'sn_2',
    dimension: 'SN',
    question: 'When reading instructions, you:',
    optionA: {
      text: 'Follow them step-by-step precisely',
      preference: 'S',
    },
    optionB: {
      text: 'Get the general idea and improvise',
      preference: 'N',
    },
  },
  {
    id: 'sn_3',
    dimension: 'SN',
    question: 'You are more interested in:',
    optionA: {
      text: 'What is real and practical',
      preference: 'S',
    },
    optionB: {
      text: 'What is possible and theoretical',
      preference: 'N',
    },
  },
  {
    id: 'sn_4',
    dimension: 'SN',
    question: 'When describing an event, you focus on:',
    optionA: {
      text: 'The specific details of what happened',
      preference: 'S',
    },
    optionB: {
      text: 'The overall meaning and implications',
      preference: 'N',
    },
  },
  {
    id: 'sn_5',
    dimension: 'SN',
    question: 'You prefer work that:',
    optionA: {
      text: 'Uses established methods and procedures',
      preference: 'S',
    },
    optionB: {
      text: 'Allows for innovation and new approaches',
      preference: 'N',
    },
  },
  {
    id: 'sn_6',
    dimension: 'SN',
    question: 'You trust:',
    optionA: {
      text: 'Your experience and what you can observe',
      preference: 'S',
    },
    optionB: {
      text: 'Your intuition and gut feelings',
      preference: 'N',
    },
  },
  {
    id: 'sn_7',
    dimension: 'SN',
    question: 'When planning, you focus on:',
    optionA: {
      text: 'Practical realities and current resources',
      preference: 'S',
    },
    optionB: {
      text: 'Future possibilities and potential',
      preference: 'N',
    },
  },
  {
    id: 'sn_8',
    dimension: 'SN',
    question: 'You are more comfortable with:',
    optionA: {
      text: 'Concrete facts and data',
      preference: 'S',
    },
    optionB: {
      text: 'Abstract concepts and theories',
      preference: 'N',
    },
  },
  {
    id: 'sn_9',
    dimension: 'SN',
    question: 'When learning, you prefer:',
    optionA: {
      text: 'Hands-on practical examples',
      preference: 'S',
    },
    optionB: {
      text: 'Conceptual frameworks and big picture',
      preference: 'N',
    },
  },
  {
    id: 'sn_10',
    dimension: 'SN',
    question: 'You would describe yourself as:',
    optionA: {
      text: 'Realistic and down-to-earth',
      preference: 'S',
    },
    optionB: {
      text: 'Imaginative and visionary',
      preference: 'N',
    },
  },

  // Thinking (T) vs Feeling (F) - 10 questions
  {
    id: 'tf_1',
    dimension: 'TF',
    question: 'When making decisions, you prioritize:',
    optionA: {
      text: 'Logic and objective analysis',
      preference: 'T',
    },
    optionB: {
      text: "People's feelings and values",
      preference: 'F',
    },
  },
  {
    id: 'tf_2',
    dimension: 'TF',
    question: 'You value:',
    optionA: {
      text: 'Fairness and consistency',
      preference: 'T',
    },
    optionB: {
      text: 'Harmony and compassion',
      preference: 'F',
    },
  },
  {
    id: 'tf_3',
    dimension: 'TF',
    question: 'When giving feedback, you:',
    optionA: {
      text: 'Focus on what needs to be improved objectively',
      preference: 'T',
    },
    optionB: {
      text: 'Consider how the person might feel',
      preference: 'F',
    },
  },
  {
    id: 'tf_4',
    dimension: 'TF',
    question: 'You are more convinced by:',
    optionA: {
      text: 'Logical arguments and data',
      preference: 'T',
    },
    optionB: {
      text: 'Personal stories and values',
      preference: 'F',
    },
  },
  {
    id: 'tf_5',
    dimension: 'TF',
    question: 'In conflicts, you focus on:',
    optionA: {
      text: 'Finding the most rational solution',
      preference: 'T',
    },
    optionB: {
      text: 'Maintaining relationships and understanding',
      preference: 'F',
    },
  },
  {
    id: 'tf_6',
    dimension: 'TF',
    question: 'You prefer to be seen as:',
    optionA: {
      text: 'Competent and capable',
      preference: 'T',
    },
    optionB: {
      text: 'Caring and empathetic',
      preference: 'F',
    },
  },
  {
    id: 'tf_7',
    dimension: 'TF',
    question: 'When analyzing a situation, you focus on:',
    optionA: {
      text: 'The principles and rules involved',
      preference: 'T',
    },
    optionB: {
      text: 'The people and their circumstances',
      preference: 'F',
    },
  },
  {
    id: 'tf_8',
    dimension: 'TF',
    question: 'You are more likely to:',
    optionA: {
      text: 'Question and critique ideas',
      preference: 'T',
    },
    optionB: {
      text: 'Support and encourage people',
      preference: 'F',
    },
  },
  {
    id: 'tf_9',
    dimension: 'TF',
    question: 'In a team, you contribute by:',
    optionA: {
      text: 'Analyzing problems and finding solutions',
      preference: 'T',
    },
    optionB: {
      text: 'Building consensus and maintaining morale',
      preference: 'F',
    },
  },
  {
    id: 'tf_10',
    dimension: 'TF',
    question: 'You would describe yourself as:',
    optionA: {
      text: 'Analytical and objective',
      preference: 'T',
    },
    optionB: {
      text: 'Empathetic and considerate',
      preference: 'F',
    },
  },

  // Judging (J) vs Perceiving (P) - 10 questions
  {
    id: 'jp_1',
    dimension: 'JP',
    question: 'You prefer to:',
    optionA: {
      text: 'Have things decided and settled',
      preference: 'J',
    },
    optionB: {
      text: 'Keep options open and flexible',
      preference: 'P',
    },
  },
  {
    id: 'jp_2',
    dimension: 'JP',
    question: 'Your workspace is usually:',
    optionA: {
      text: 'Organized and structured',
      preference: 'J',
    },
    optionB: {
      text: 'Flexible and adaptable',
      preference: 'P',
    },
  },
  {
    id: 'jp_3',
    dimension: 'JP',
    question: 'When starting a project, you:',
    optionA: {
      text: 'Create a detailed plan and timeline',
      preference: 'J',
    },
    optionB: {
      text: 'Start and see where it goes',
      preference: 'P',
    },
  },
  {
    id: 'jp_4',
    dimension: 'JP',
    question: 'You feel more comfortable when:',
    optionA: {
      text: 'Things are scheduled and planned',
      preference: 'J',
    },
    optionB: {
      text: 'You can be spontaneous',
      preference: 'P',
    },
  },
  {
    id: 'jp_5',
    dimension: 'JP',
    question: 'With deadlines, you:',
    optionA: {
      text: 'Finish early to avoid last-minute stress',
      preference: 'J',
    },
    optionB: {
      text: 'Work best under pressure close to the deadline',
      preference: 'P',
    },
  },
  {
    id: 'jp_6',
    dimension: 'JP',
    question: 'You prefer:',
    optionA: {
      text: 'Making decisions quickly and moving on',
      preference: 'J',
    },
    optionB: {
      text: 'Gathering more information before deciding',
      preference: 'P',
    },
  },
  {
    id: 'jp_7',
    dimension: 'JP',
    question: 'Your daily routine is:',
    optionA: {
      text: 'Structured with regular schedules',
      preference: 'J',
    },
    optionB: {
      text: 'Flexible and varies day to day',
      preference: 'P',
    },
  },
  {
    id: 'jp_8',
    dimension: 'JP',
    question: 'When traveling, you:',
    optionA: {
      text: 'Plan your itinerary in advance',
      preference: 'J',
    },
    optionB: {
      text: 'Prefer to explore spontaneously',
      preference: 'P',
    },
  },
  {
    id: 'jp_9',
    dimension: 'JP',
    question: 'You feel satisfied when:',
    optionA: {
      text: 'Tasks are completed and checked off',
      preference: 'J',
    },
    optionB: {
      text: 'You have multiple projects in progress',
      preference: 'P',
    },
  },
  {
    id: 'jp_10',
    dimension: 'JP',
    question: 'You would describe yourself as:',
    optionA: {
      text: 'Organized and decisive',
      preference: 'J',
    },
    optionB: {
      text: 'Adaptable and spontaneous',
      preference: 'P',
    },
  },
];

// MBTI Type Descriptions
export const mbtiTypes: Record<string, { name: string; description: string; strengths: string[] }> =
  {
    ISTJ: {
      name: 'The Inspector',
      description: 'Practical, fact-minded individuals whose reliability cannot be doubted.',
      strengths: ['Responsible', 'Organized', 'Detail-oriented', 'Loyal'],
    },
    ISFJ: {
      name: 'The Protector',
      description: 'Very dedicated and warm protectors, always ready to defend their loved ones.',
      strengths: ['Supportive', 'Reliable', 'Patient', 'Observant'],
    },
    INFJ: {
      name: 'Advocate',
      description: 'Quiet and mystical, yet very inspiring and tireless idealists.',
      strengths: ['Insightful', 'Principled', 'Passionate', 'Creative'],
    },
    INTJ: {
      name: 'Architect',
      description: 'Imaginative and strategic thinkers, with a plan for everything.',
      strengths: ['Strategic', 'Independent', 'Determined', 'Innovative'],
    },
    ISTP: {
      name: 'The Craftsman',
      description: 'Bold and practical experimenters, masters of all kinds of tools.',
      strengths: ['Practical', 'Flexible', 'Logical', 'Hands-on'],
    },
    ISFP: {
      name: 'Adventurer',
      description:
        'Flexible and charming artists, always ready to explore and experience something new.',
      strengths: ['Artistic', 'Sensitive', 'Flexible', 'Spontaneous'],
    },
    INFP: {
      name: 'The Healer',
      description: 'Poetic, kind and altruistic people, always eager to help a good cause.',
      strengths: ['Idealistic', 'Empathetic', 'Creative', 'Open-minded'],
    },
    INTP: {
      name: 'The Architect',
      description: 'Innovative inventors with an unquenchable thirst for knowledge.',
      strengths: ['Analytical', 'Objective', 'Innovative', 'Curious'],
    },
    ESTP: {
      name: 'The Dynamo',
      description:
        'Smart, energetic and very perceptive people, who truly enjoy living on the edge.',
      strengths: ['Energetic', 'Pragmatic', 'Perceptive', 'Bold'],
    },
    ESFP: {
      name: 'The Performer',
      description:
        'Spontaneous, energetic and enthusiastic people – life is never boring around them.',
      strengths: ['Enthusiastic', 'Friendly', 'Spontaneous', 'Practical'],
    },
    ENFP: {
      name: 'The Champion',
      description:
        'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.',
      strengths: ['Enthusiastic', 'Creative', 'Sociable', 'Energetic'],
    },
    ENTP: {
      name: 'The Visionary',
      description: 'Smart and curious thinkers who cannot resist an intellectual challenge.',
      strengths: ['Innovative', 'Charismatic', 'Knowledgeable', 'Quick-thinking'],
    },
    ESTJ: {
      name: 'The Supervisor',
      description: 'Excellent administrators, unsurpassed at managing things – or people.',
      strengths: ['Organized', 'Practical', 'Dedicated', 'Strong-willed'],
    },
    ESFJ: {
      name: 'The Provider',
      description: 'Extraordinarily caring, social and popular people, always eager to help.',
      strengths: ['Caring', 'Social', 'Loyal', 'Organized'],
    },
    ENFJ: {
      name: 'Protagonist',
      description: 'Charismatic and inspiring leaders, able to mesmerize their listeners.',
      strengths: ['Charismatic', 'Altruistic', 'Natural leader', 'Reliable'],
    },
    ENTJ: {
      name: 'The Commander',
      description:
        'Bold, imaginative and strong-willed leaders, always finding a way – or making one.',
      strengths: ['Efficient', 'Strategic', 'Confident', 'Charismatic'],
    },
  };

export const mbtiDimensions = [
  {
    id: 'EI',
    name: 'Extraversion vs Introversion',
    description: 'How you direct and receive energy',
  },
  {
    id: 'SN',
    name: 'Sensing vs Intuition',
    description: 'How you take in information',
  },
  {
    id: 'TF',
    name: 'Thinking vs Feeling',
    description: 'How you make decisions',
  },
  {
    id: 'JP',
    name: 'Judging vs Perceiving',
    description: 'How you approach the outside world',
  },
];



