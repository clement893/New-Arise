/**
 * ARISE Wellness Assessment Questions
 * Based on 6 Pillars of Wellness (Harvard Medical School)
 * 30 questions total (5 per pillar)
 * Scale: 1-5 (Strongly Disagree to Strongly Agree)
 */

export interface WellnessQuestion {
  id: string;
  pillar: string;
  question: string;
}

export const wellnessQuestions: WellnessQuestion[] = [
  // Pillar 1: Avoidance of Risky Substances (5 questions)
  {
    id: "wellness_q1",
    pillar: "Avoidance of Risky Substances",
    question: "I avoid or limit my weekly alcohol consumption to about 2 glasses per week"
  },
  {
    id: "wellness_q2",
    pillar: "Avoidance of Risky Substances",
    question: "I make healthy choices by avoiding tobacco in all forms"
  },
  {
    id: "wellness_q3",
    pillar: "Avoidance of Risky Substances",
    question: "I take prescription medications responsibly"
  },
  {
    id: "wellness_q4",
    pillar: "Avoidance of Risky Substances",
    question: "I keep my caffeine consumption within healthy limits"
  },
  {
    id: "wellness_q5",
    pillar: "Avoidance of Risky Substances",
    question: "I do not consume illegal drugs"
  },

  // Pillar 2: Movement (5 questions)
  {
    id: "wellness_q6",
    pillar: "Movement",
    question: "I am regularly active for at least 150 min per week"
  },
  {
    id: "wellness_q7",
    pillar: "Movement",
    question: "I do strength training at least twice a week"
  },
  {
    id: "wellness_q8",
    pillar: "Movement",
    question: "I do flexibility exercises 2-3 times per week"
  },
  {
    id: "wellness_q9",
    pillar: "Movement",
    question: "I avoid sitting for longer than 30-60 minutes"
  },
  {
    id: "wellness_q10",
    pillar: "Movement",
    question: "I have the energy to stay active throughout the day"
  },

  // Pillar 3: Nutrition (5 questions)
  {
    id: "wellness_q11",
    pillar: "Nutrition",
    question: "I eat balanced meals combining protein, healthy fats, and complex carbs"
  },
  {
    id: "wellness_q12",
    pillar: "Nutrition",
    question: "I eat 5+ servings of fruits and vegetables daily"
  },
  {
    id: "wellness_q13",
    pillar: "Nutrition",
    question: "I keep processed foods and sugary drinks to a minimum"
  },
  {
    id: "wellness_q14",
    pillar: "Nutrition",
    question: "I drink enough water (2.7-3.8 liters per day)"
  },
  {
    id: "wellness_q15",
    pillar: "Nutrition",
    question: "I follow healthy eating habits 80% of the time"
  },

  // Pillar 4: Sleep (5 questions)
  {
    id: "wellness_q16",
    pillar: "Sleep",
    question: "I get 7-9 hours of sleep most nights"
  },
  {
    id: "wellness_q17",
    pillar: "Sleep",
    question: "I maintain a regular sleep schedule"
  },
  {
    id: "wellness_q18",
    pillar: "Sleep",
    question: "My sleep feels restful and restorative"
  },
  {
    id: "wellness_q19",
    pillar: "Sleep",
    question: "I limit caffeine, alcohol, and screens before bedtime"
  },
  {
    id: "wellness_q20",
    pillar: "Sleep",
    question: "I can settle back into restful sleep if disrupted"
  },

  // Pillar 5: Social Connection (5 questions)
  {
    id: "wellness_q21",
    pillar: "Social Connection",
    question: "I have strong, supportive relationships"
  },
  {
    id: "wellness_q22",
    pillar: "Social Connection",
    question: "I connect with others several times a week"
  },
  {
    id: "wellness_q23",
    pillar: "Social Connection",
    question: "I feel comfortable seeking support when needed"
  },
  {
    id: "wellness_q24",
    pillar: "Social Connection",
    question: "I choose positive social interactions"
  },
  {
    id: "wellness_q25",
    pillar: "Social Connection",
    question: "I balance time with others and time alone"
  },

  // Pillar 6: Stress Management (5 questions)
  {
    id: "wellness_q26",
    pillar: "Stress Management",
    question: "I notice stress and use healthy strategies to manage it"
  },
  {
    id: "wellness_q27",
    pillar: "Stress Management",
    question: "I practice relaxation techniques several times a week"
  },
  {
    id: "wellness_q28",
    pillar: "Stress Management",
    question: "I make time for hobbies and personal enjoyment"
  },
  {
    id: "wellness_q29",
    pillar: "Stress Management",
    question: "I manage my workload in a balanced way"
  },
  {
    id: "wellness_q30",
    pillar: "Stress Management",
    question: "I experience calm, focus, and emotional balance"
  }
];

export const wellnessPillars = [
  {
    id: "avoidance_of_risky_substances",
    name: "Avoidance of Risky Substances",
    description: "Making healthy choices about alcohol, tobacco, medications, and other substances",
    icon: "🚭"
  },
  {
    id: "movement",
    name: "Movement",
    description: "Regular physical activity, strength training, and flexibility exercises",
    icon: "🏃"
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Balanced diet with fruits, vegetables, and proper hydration",
    icon: "🥗"
  },
  {
    id: "sleep",
    name: "Sleep",
    description: "Quality rest with consistent sleep schedule and restorative sleep",
    icon: "😴"
  },
  {
    id: "social_connection",
    name: "Social Connection",
    description: "Strong relationships and positive social interactions",
    icon: "👥"
  },
  {
    id: "stress_management",
    name: "Stress Management",
    description: "Healthy coping strategies and work-life balance",
    icon: "🧘"
  }
];

export const wellnessScale = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

// Alias for compatibility
export const scaleOptions = wellnessScale;
