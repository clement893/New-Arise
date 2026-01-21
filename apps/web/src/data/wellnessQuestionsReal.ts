/**
 * ARISE Wellness Assessment Questions
 * Based on 6 Pillars of Wellness (Harvard Medical School)
 * 30 questions total (5 per pillar)
 * Scale: 1-5 (Strongly Disagree to Strongly Agree)
 */

export interface WellnessResource {
  url: string;
  text: string;
}

export interface WellnessQuestion {
  id: string;
  pillar: string;
  question: string;
  resources?: WellnessResource[];
}

export const wellnessQuestions: WellnessQuestion[] = [
  // Pillar 1: Avoidance of Risky Substances (5 questions)
  {
    id: "wellness_q1",
    pillar: "Avoidance of Risky Substances",
    question: "I avoid or limit my weekly alcohol consumption to about 2 glasses per week",
    resources: [
      {
        url: "https://www.ccsa.ca/en/guidance-tools-resources/substance-use-and-addiction/alcohol/canadas-guidance-alcohol-and-health",
        text: "CCSA Guidelines - Canadian Centre on Substance Use and Addiction"
      }
    ]
  },
  {
    id: "wellness_q2",
    pillar: "Avoidance of Risky Substances",
    question: "I make healthy choices by avoiding tobacco in all forms",
    resources: [
      {
        url: "https://www.canada.ca/en/health-canada/services/canadian-tobacco-nicotine-survey/2022-summary.html",
        text: "Tobacco and Nicotine"
      }
    ]
  },
  {
    id: "wellness_q3",
    pillar: "Avoidance of Risky Substances",
    question: "I take prescription medications responsibly",
    resources: [
      {
        url: "https://www.canada.ca/en/health-canada/services/substance-use/controlled-illegal-drugs.html",
        text: "Controlled and illegal drugs - Canada.ca"
      }
    ]
  },
  {
    id: "wellness_q4",
    pillar: "Avoidance of Risky Substances",
    question: "I keep my caffeine consumption within healthy limits",
    resources: [
      {
        url: "https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/caffeine-foods.html#a2",
        text: "Caffeine Intake Amounts"
      }
    ]
  },
  {
    id: "wellness_q5",
    pillar: "Avoidance of Risky Substances",
    question: "I do not consume illegal drugs",
    resources: [
      {
        url: "https://www.canada.ca/en/health-canada/services/substance-use/controlled-illegal-drugs.html",
        text: "Controlled and Illegal drugs"
      }
    ]
  },

  // Pillar 2: Movement (5 questions)
  {
    id: "wellness_q6",
    pillar: "Movement",
    question: "I am regularly active for at least 150 min per week",
    resources: [
      {
        url: "https://csepguidelines.ca/",
        text: "Movement Guidelines"
      }
    ]
  },
  {
    id: "wellness_q7",
    pillar: "Movement",
    question: "I do strength training at least twice a week",
    resources: [
      {
        url: "https://csepguidelines.ca/",
        text: "Movement Guidelines"
      }
    ]
  },
  {
    id: "wellness_q8",
    pillar: "Movement",
    question: "I do flexibility exercises 2-3 times per week",
    resources: [
      {
        url: "https://csepguidelines.ca/",
        text: "Movement Guidelines"
      }
    ]
  },
  {
    id: "wellness_q9",
    pillar: "Movement",
    question: "I avoid sitting for longer than 30-60 minutes",
    resources: [
      {
        url: "https://csepguidelines.ca/",
        text: "Movement Guidelines"
      }
    ]
  },
  {
    id: "wellness_q10",
    pillar: "Movement",
    question: "I have the energy to stay active throughout the day",
    resources: [
      {
        url: "https://csepguidelines.ca/",
        text: "Movement Guidelines"
      }
    ]
  },

  // Pillar 3: Nutrition (5 questions)
  {
    id: "wellness_q11",
    pillar: "Nutrition",
    question: "I eat balanced meals combining protein, healthy fats, and complex carbs",
    resources: [
      {
        url: "https://food-guide.canada.ca/en/",
        text: "Canada Food Guideline and Amounts"
      }
    ]
  },
  {
    id: "wellness_q12",
    pillar: "Nutrition",
    question: "I eat 5+ servings of fruits and vegetables daily",
    resources: [
      {
        url: "https://food-guide.canada.ca/en/guidelines/section-1-foundation-healthy-eating/",
        text: "Foundations of Healthy Eating"
      }
    ]
  },
  {
    id: "wellness_q13",
    pillar: "Nutrition",
    question: "I keep processed foods and sugary drinks to a minimum",
    resources: [
      {
        url: "https://food-guide.canada.ca/en/guidelines/section-2-foods-and-beverages-undermine-healthy-eating/",
        text: "Sugar in Drinks and Snacks"
      }
    ]
  },
  {
    id: "wellness_q14",
    pillar: "Nutrition",
    question: "I drink enough water (2.7-3.8 liters per day)",
    resources: [
      {
        url: "https://www.eatright.org/health/essential-nutrients/water/how-much-water-do-you-need",
        text: "Water Intake Guidelines"
      }
    ]
  },
  {
    id: "wellness_q15",
    pillar: "Nutrition",
    question: "I follow healthy eating habits 80% of the time",
    resources: [
      {
        url: "https://food-guide.canada.ca/en/",
        text: "Canada Food Guideline and Amounts"
      }
    ]
  },

  // Pillar 4: Sleep (5 questions)
  {
    id: "wellness_q16",
    pillar: "Sleep",
    question: "I get 7-9 hours of sleep most nights",
    resources: [
      {
        url: "https://www.thensf.org/how-many-hours-of-sleep-do-you-really-need/",
        text: "Amount of Sleep Needed"
      }
    ]
  },
  {
    id: "wellness_q17",
    pillar: "Sleep",
    question: "I maintain a regular sleep schedule",
    resources: [
      {
        url: "https://www.sleephealthjournal.org/article/S2352-7218(23)00166-3/fulltext",
        text: "Sleep Regularity"
      }
    ]
  },
  {
    id: "wellness_q18",
    pillar: "Sleep",
    question: "My sleep feels restful and restorative",
    resources: [
      {
        url: "https://sleep.hms.harvard.edu/education-training/public-education/sleep-and-health-education-program/sleep-health-education-41",
        text: "Benefits of Sleep"
      }
    ]
  },
  {
    id: "wellness_q19",
    pillar: "Sleep",
    question: "I limit caffeine, alcohol, and screens before bedtime",
    resources: [
      {
        url: "https://www.sleepfoundation.org/sleep-hygiene?utm_source=chatgpt.com#why-is-sleep-hygiene-important--1",
        text: "Sleep Hygiene"
      }
    ]
  },
  {
    id: "wellness_q20",
    pillar: "Sleep",
    question: "I can settle back into restful sleep if disrupted",
    resources: [
      {
        url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/up-in-the-middle-of-the-night-how-to-get-back-to-sleep",
        text: "Getting Back to Sleep"
      }
    ]
  },

  // Pillar 5: Social Connection (5 questions)
  {
    id: "wellness_q21",
    pillar: "Social Connection",
    question: "I have strong, supportive relationships",
    resources: [
      {
        url: "https://www.socialconnectionguidelines.org/en/individual-guidelines",
        text: "Guidelines Social Connection"
      }
    ]
  },
  {
    id: "wellness_q22",
    pillar: "Social Connection",
    question: "I connect with others several times a week",
    resources: [
      {
        url: "https://www.cdc.gov/social-connectedness/data-research/promising-approaches/index.html",
        text: "Approach to Social Connectivity"
      }
    ]
  },
  {
    id: "wellness_q23",
    pillar: "Social Connection",
    question: "I feel comfortable seeking support when needed",
    resources: [
      {
        url: "https://cmha.ca/find-help/how-to-get-help/",
        text: "Support System for Mental Health"
      }
    ]
  },
  {
    id: "wellness_q24",
    pillar: "Social Connection",
    question: "I choose positive social interactions",
    resources: [
      {
        url: "https://www.nm.org/healthbeat/healthy-tips/5-benefits-of-healthy-relationships",
        text: "Healthy-Relationships"
      }
    ]
  },
  {
    id: "wellness_q25",
    pillar: "Social Connection",
    question: "I balance time with others and time alone",
    resources: [
      {
        url: "https://www.cdc.gov/social-connectedness/about/index.html",
        text: "Social Connection"
      }
    ]
  },

  // Pillar 6: Stress Management (5 questions)
  {
    id: "wellness_q26",
    pillar: "Stress Management",
    question: "I notice stress and use healthy strategies to manage it",
    resources: [
      {
        url: "https://www.cdc.gov/mental-health/living-with/index.html#cdc_living_with_man_stra-healthy-ways-to-cope-with-stress",
        text: "Coping with Stress"
      }
    ]
  },
  {
    id: "wellness_q27",
    pillar: "Stress Management",
    question: "I practice relaxation techniques several times a week",
    resources: [
      {
        url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037",
        text: "Stress Management"
      }
    ]
  },
  {
    id: "wellness_q28",
    pillar: "Stress Management",
    question: "I make time for hobbies and personal enjoyment",
    resources: [
      {
        url: "https://www.health.harvard.edu/mind-and-mood/having-a-hobby-tied-to-happiness-and-well-being",
        text: "Hobbies and Wellbeing"
      }
    ]
  },
  {
    id: "wellness_q29",
    pillar: "Stress Management",
    question: "I manage my workload in a balanced way",
    resources: [
      {
        url: "https://www.canada.ca/en/public-health/services/mental-health-workplace.html#a2",
        text: "Workplace Balance"
      }
    ]
  },
  {
    id: "wellness_q30",
    pillar: "Stress Management",
    question: "I experience calm, focus, and emotional balance",
    resources: []
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
    icon: "🤝"
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
