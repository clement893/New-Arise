/**
 * MBTI Personality Types - Complete Data
 * Contains all 16 personality types with descriptions, tags, and 6 leadership capabilities
 */

export interface PersonalityCapability {
  name: string;
  description: string;
}

export interface PersonalityType {
  code: string; // e.g., "ISFP"
  name: string; // e.g., "Adventurer"
  tags: string[]; // The 4 dimensions: Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving
  descriptionOverall: string;
  capabilities: {
    communication: PersonalityCapability;
    problemSolving: PersonalityCapability;
    leadershipStyle: PersonalityCapability;
    teamCulture: PersonalityCapability;
    change: PersonalityCapability;
    stress: PersonalityCapability;
  };
}

export const mbtiPersonalities: Record<string, PersonalityType> = {
  ISTJ: {
    code: 'ISTJ',
    name: 'The Inspector',
    tags: ['Introversion', 'Sensing', 'Thinking', 'Judging'],
    descriptionOverall: 'ISTJs bring stability, reliability, and an unwavering commitment to duty to any team. Their methodical and fact-based approach ensures projects are completed thoroughly and accurately.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Direct and to the point. Values clarity and factual accuracy. Listens carefully and focuses on specifics.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Relies on established methods and proven solutions. Systematic and methodical in approach. Seeks to resolve conflicts by adhering to rules and principles.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Structured and organized. Leads by example, with a focus on responsibility and duty. Ensures that rules and procedures are followed meticulously.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Builds a culture of dependability and stability. Values individual accountability and a strong work ethic. Creates a predictable and reliable environment.',
      },
      change: {
        name: 'Change',
        description: 'Prefers gradual and well-planned changes. May be resistant to change that lacks a clear purpose or justification. Needs time to analyze and prepare for new systems.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes rigid and overly critical under pressure. May withdraw and become silent. Needs to regain control and structure to reduce stress.',
      },
    },
  },
  ISFJ: {
    code: 'ISFJ',
    name: 'The Protector',
    tags: ['Introversion', 'Sensing', 'Feeling', 'Judging'],
    descriptionOverall: 'ISFJs are the backbone of any team, providing unwavering support, practical care, and a focus on collective well-being. They build a compassionate and loyal culture.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Gentle and considerate. Focuses on the needs and feelings of others. Communicates to maintain harmony and support.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Seeks practical and people-oriented solutions. Aims to restore harmony and address emotional needs during conflicts. Relies on past experiences and what has worked before.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Nurturing and supportive. Leads by building strong relationships and creating a caring environment. Focuses on the well-being of team members.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a cooperative and supportive culture. Promotes loyalty, commitment, and a sense of family. Creates a safe and welcoming space for all members.',
      },
      change: {
        name: 'Change',
        description: 'Can be hesitant with radical change, especially if it disrupts harmony. Needs to understand how the change will affect people. Values a supportive transition process.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overly concerned with details and the feelings of others. May take on too much responsibility. Needs to set boundaries and take time for self-care.',
      },
    },
  },
  INFJ: {
    code: 'INFJ',
    name: 'The Advocate',
    tags: ['Introversion', 'Intuition', 'Feeling', 'Judging'],
    descriptionOverall: 'INFJs are the visionaries of the team, bringing deep insights, a strong sense of purpose, and an ability to inspire others to work towards a meaningful future.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Visionary and empathetic. Communicates deep insights and complex ideas. Focuses on the underlying meaning and purpose.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Seeks holistic and insightful solutions. Aims to resolve conflicts by addressing core motivations and values. Prefers to find a win-win situation that aligns with everyone\'s ethics.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Quietly inspiring and value-driven. Leads by articulating a strong vision and fostering personal growth. Empowers others to reach their potential.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Creates a culture of meaning and purpose. Promotes authenticity, deep connection, and shared values. Fosters a space for personal and collective development.',
      },
      change: {
        name: 'Change',
        description: 'Embraces change that aligns with their vision and values. Sees change as an opportunity for growth and improvement. Needs to understand the "why" behind the change.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overwhelmed by details and routine tasks. May withdraw and feel misunderstood. Needs time for solitude and reflection to recharge.',
      },
    },
  },
  INTJ: {
    code: 'INTJ',
    name: 'The Architect',
    tags: ['Introversion', 'Intuition', 'Thinking', 'Judging'],
    descriptionOverall: 'INTJs are the masterminds of the team, providing strategic foresight, logical solutions, and an unwavering drive to implement innovative systems and long-term plans.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Strategic and conceptual. Communicates complex theories and long-term plans. Values intellectual honesty and logical precision.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with a big-picture, strategic mindset. Seeks innovative, logical, and efficient solutions. Resolves conflicts by focusing on facts and rational arguments.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Visionary and independent. Leads by crafting long-term strategies and optimizing systems. Empowers others to work independently towards a common goal.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of competence and intellectual rigor. Promotes autonomy, innovation, and strategic thinking. Values expertise and efficiency.',
      },
      change: {
        name: 'Change',
        description: 'Sees change as a catalyst for improvement. Embraces a new system if it\'s more logical or efficient. Loves to redesign and optimize processes.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes impatient and overly critical of incompetence. May become isolated and detached. Needs to step back and gain perspective to reduce stress.',
      },
    },
  },
  ISTP: {
    code: 'ISTP',
    name: 'The Crafter',
    tags: ['Introversion', 'Sensing', 'Thinking', 'Perceiving'],
    descriptionOverall: 'ISTPs are the resourceful problem-solvers, bringing technical expertise, a hands-on approach, and an ability to quickly adapt and fix any immediate challenges the team faces.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Practical and concise. Communicates through action and demonstration. Prefers to show rather than tell, focusing on what works.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Hands-on and analytical. Approaches problems with a logical, technical mindset. Resolves conflicts by finding practical solutions and fixing immediate issues.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Independent and action-oriented. Leads by example, demonstrating competence and technical expertise. Gives others space to work autonomously.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Creates a culture of competence and practical problem-solving. Values technical expertise and hands-on skills. Promotes independence and resourcefulness.',
      },
      change: {
        name: 'Change',
        description: 'Adapts quickly to practical changes. Embraces new tools and systems that improve efficiency. May be resistant to change that seems unnecessary or overly complex.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes withdrawn and may avoid social interaction. May become overly critical or dismissive. Needs space and practical activities to de-stress.',
      },
    },
  },
  ISFP: {
    code: 'ISFP',
    name: 'Adventurer',
    tags: ['Introversion', 'Sensing', 'Feeling', 'Perceiving'],
    descriptionOverall: 'ISFPs are the creative heart of the team, bringing a focus on authenticity, an aesthetic sensibility, and an ability to create a supportive and expressive environment.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Gentle and authentic. Communicates through actions and personal expression. Focuses on feelings and aesthetic details.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Relies on personal values and intuition. Seeks to restore harmony by focusing on the emotional side of the conflict. Prefers creative and unique solutions.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Flexible and empathetic. Leads by example, with a focus on personal expression and authenticity. Gives others the freedom to be themselves.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of authenticity and creativity. Promotes a positive, supportive, and non-judgmental atmosphere. Values individual expression and unique contributions.',
      },
      change: {
        name: 'Change',
        description: 'Resistant to change that conflicts with their personal values or disrupts harmony. Needs to feel a personal connection to the new direction. Responds best to change that is introduced gently.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overwhelmed and may withdraw. Can become overly critical of themselves. Needs to engage in a creative or expressive outlet to de-stress.',
      },
    },
  },
  INFP: {
    code: 'INFP',
    name: 'The Mediator',
    tags: ['Introversion', 'Intuition', 'Feeling', 'Perceiving'],
    descriptionOverall: 'INFPs are the idealists of the team, bringing creativity, empathy, and a strong commitment to personal values and authentic relationships.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Warm and authentic. Communicates with empathy and focuses on personal values. Expresses ideas through stories and metaphors.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Seeks solutions that align with personal values and ethics. Aims to understand all perspectives and find harmonious resolutions. Prefers creative and meaningful approaches.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Inspiring and values-driven. Leads by example, encouraging authenticity and personal growth. Creates an environment where everyone can express their true selves.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of authenticity and personal growth. Promotes empathy, creativity, and individual expression. Values meaningful connections and shared values.',
      },
      change: {
        name: 'Change',
        description: 'Embraces change that aligns with personal values and vision. May resist change that feels inauthentic or conflicts with core beliefs. Needs to understand the deeper purpose.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overwhelmed by criticism or conflict. May withdraw and become overly self-critical. Needs time alone and creative expression to recharge.',
      },
    },
  },
  INTP: {
    code: 'INTP',
    name: 'The Thinker',
    tags: ['Introversion', 'Intuition', 'Thinking', 'Perceiving'],
    descriptionOverall: 'INTPs are the intellectual pioneers of the team, bringing innovative ideas, logical analysis, and an unwavering commitment to finding the most efficient and conceptually sound solutions.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Analytical and precise. Communicates through logical arguments and complex theories. Values intellectual curiosity and accuracy.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems like a logical puzzle. Seeks elegant and innovative solutions. Resolves conflicts by using objective facts and rational analysis.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Conceptual and objective. Leads by creating innovative systems and promoting intellectual freedom. Gives others space to explore ideas independently.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of intellectual curiosity and innovation. Promotes autonomy and independent thought. Values expertise and logical reasoning.',
      },
      change: {
        name: 'Change',
        description: 'Welcomes change if it\'s based on logic and efficiency. Loves to analyze and redesign systems. Sees new challenges as opportunities for mental stimulation.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes critical and may get lost in abstract theories. Can become isolated and withdraw from social interaction. Needs a quiet space to think and solve complex problems.',
      },
    },
  },
  ESTP: {
    code: 'ESTP',
    name: 'The Dynamo',
    tags: ['Extraversion', 'Sensing', 'Thinking', 'Perceiving'],
    descriptionOverall: 'ESTPs are the driving force of the team, bringing dynamic energy, a focus on immediate results, and an ability to take action and adapt quickly to any situation.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Lively and engaging. Communicates through action and concrete details. Prefers to talk about what\'s happening in the moment.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Hands-on and practical. Thinks on their feet and enjoys a good challenge. Resolves conflicts by finding a quick, tangible solution.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Energetic and spontaneous. Leads by taking charge and making things happen. Motivates others through action and excitement.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Creates a culture of excitement and action. Promotes adaptability and a focus on immediate results. Values resourcefulness and a go-getter attitude.',
      },
      change: {
        name: 'Change',
        description: 'Adapts quickly and thrives on spontaneous change. Sees change as a new opportunity for excitement and action. Enjoys figuring things out as they go.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes impatient and may take impulsive risks. Can become overly competitive. Needs physical activity and new challenges to de-stress.',
      },
    },
  },
  ESFP: {
    code: 'ESFP',
    name: 'The Entertainer',
    tags: ['Extraversion', 'Sensing', 'Feeling', 'Perceiving'],
    descriptionOverall: 'ESFPs are the heart and soul of the team, bringing an energetic, positive spirit and an ability to create a collaborative and fun environment that makes everyone feel valued.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Enthusiastic and sociable. Communicates through stories and personal anecdotes. Focuses on creating a fun and positive atmosphere.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with a people-first mindset. Seeks to find a solution that makes everyone feel good. Resolves conflicts by focusing on harmony and emotional needs.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Charismatic and supportive. Leads by creating a fun, engaging, and positive environment. Motivates others through encouragement and celebration.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of enthusiasm and collaboration. Promotes a sociable, friendly, and lively atmosphere. Values team spirit and positive interaction.',
      },
      change: {
        name: 'Change',
        description: 'Embraces change that is exciting and new. Responds best to change when it\'s introduced in a fun way. May be resistant to change that seems boring or restrictive.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overly concerned with what others think. May take criticism personally. Needs to be around people and engage in fun activities to de-stress.',
      },
    },
  },
  ENFP: {
    code: 'ENFP',
    name: 'The Campaigner',
    tags: ['Extraversion', 'Intuition', 'Feeling', 'Perceiving'],
    descriptionOverall: 'ENFPs are the inspirers of the team, bringing a wealth of new ideas, an infectious enthusiasm, and an ability to inspire others to work towards a bright and creative future.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Inspirational and expressive. Communicates through stories, ideas, and possibilities. Focuses on creating connection and fostering enthusiasm.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with creativity and optimism. Seeks to find a solution that works for everyone. Resolves conflicts by focusing on shared values and future possibilities.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Empowering and visionary. Leads by inspiring others and fostering a culture of innovation. Encourages others to explore their passions.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of creativity and collaboration. Promotes open-mindedness, possibility, and innovation. Values personal growth and enthusiasm.',
      },
      change: {
        name: 'Change',
        description: 'Embraces change that is exciting and full of potential. Sees change as an opportunity to innovate and grow. Loves to explore new ideas and directions.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overwhelmed by routine tasks and too many details. May feel scattered or uninspired. Needs to brainstorm and connect with others to de-stress.',
      },
    },
  },
  ENTP: {
    code: 'ENTP',
    name: 'The Debater',
    tags: ['Extraversion', 'Intuition', 'Thinking', 'Perceiving'],
    descriptionOverall: 'ENTPs are the innovators of the team, bringing a fresh perspective, a talent for strategic thinking, and a willingness to challenge the norm to find the most creative solutions.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Debating and provocative. Communicates by exploring ideas and challenging the status quo. Values intellectual sparring and witty banter.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with a strategic and innovative mindset. Enjoys brainstorming and finding unconventional solutions. Resolves conflicts by engaging in logical debate.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Innovative and challenging. Leads by questioning assumptions and promoting new ideas. Empowers others to think critically and challenge the norm.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of intellectual curiosity and innovation. Promotes debate, open-mindedness, and creative problem-solving. Values originality and strategic thinking.',
      },
      change: {
        name: 'Change',
        description: 'Actively seeks and thrives on change. Loves to disrupt old systems and implement new ideas. Sees change as a chance to innovate and explore.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes bored and may stir up conflict. May feel restricted by rules or routine. Needs to engage in a new, stimulating challenge to de-stress.',
      },
    },
  },
  ESTJ: {
    code: 'ESTJ',
    name: 'The Executive',
    tags: ['Extraversion', 'Sensing', 'Thinking', 'Judging'],
    descriptionOverall: 'ESTJs are the leaders and organizers of the team, providing structure, decisive action, and an unwavering focus on achieving goals and ensuring everything runs smoothly.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Direct and fact-based. Communicates by providing clear instructions and expectations. Values efficiency and getting straight to the point.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems in a systematic and decisive manner. Relies on established procedures and proven methods. Resolves conflicts by enforcing rules and logical principles.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Decisive and results-oriented. Leads by setting clear goals, organizing resources, and holding people accountable. Focuses on efficiency and productivity.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of accountability and productivity. Promotes a strong work ethic and a focus on results. Values structure, organization, and clear roles.',
      },
      change: {
        name: 'Change',
        description: 'Prefers change that is well-planned and has a clear benefit. May be resistant to change that seems inefficient or poorly thought out. Needs a clear plan and timeline for the transition.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes controlling and overly focused on details. May become impatient with others\' inefficiencies. Needs to regain control and a sense of order to de-stress.',
      },
    },
  },
  ESFJ: {
    code: 'ESFJ',
    name: 'The Consul',
    tags: ['Extraversion', 'Sensing', 'Feeling', 'Judging'],
    descriptionOverall: 'ESFJs are the social glue of the team, providing warmth, support, and an ability to create a collaborative and harmonious environment where everyone feels appreciated and connected.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Harmonious and supportive. Communicates to build rapport and maintain positive relationships. Focuses on social cues and emotional needs.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with a people-first mentality. Seeks to find a solution that maintains harmony and considers everyone\'s feelings. Resolves conflicts by mediating and bringing people together.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Supportive and caring. Leads by building strong team bonds and ensuring everyone feels valued. Creates a positive and collaborative environment.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of cooperation and community. Promotes loyalty, warmth, and a strong sense of belonging. Values social connection and team spirit.',
      },
      change: {
        name: 'Change',
        description: 'Can be resistant to change that disrupts social harmony or traditions. Needs to understand how the change will affect people. Responds best when the team is involved and supportive of the transition.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overly concerned with pleasing others and avoiding conflict. May take on too many responsibilities. Needs to connect with people and receive appreciation to de-stress.',
      },
    },
  },
  ENFJ: {
    code: 'ENFJ',
    name: 'The Protagonist',
    tags: ['Extraversion', 'Intuition', 'Feeling', 'Judging'],
    descriptionOverall: 'ENFJs are the inspirational heart of the team, bringing a strong sense of purpose, a natural ability to inspire others, and a focus on collective growth and collaboration.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Charismatic and inspiring. Communicates with passion and a focus on human potential. Listens with empathy and seeks to connect with others on a deep level.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with an ethical and people-oriented perspective. Seeks to find solutions that align with their vision for a better future. Resolves conflicts by mediating and inspiring others to find common ground.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Visionary and empowering. Leads by articulating a compelling vision and inspiring others to follow. Focuses on the personal growth and development of each team member.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of inspiration and collaboration. Promotes a sense of purpose, shared values, and mutual support. Creates a space where everyone feels heard and valued.',
      },
      change: {
        name: 'Change',
        description: 'Embraces change that aligns with their values and a positive vision. Sees change as an opportunity for growth and improvement. Inspires the team to embrace the new direction.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes overwhelmed by criticism or a lack of harmony. May take on too much responsibility for others\' feelings. Needs to connect with their values and find a sense of purpose to de-stress.',
      },
    },
  },
  ENTJ: {
    code: 'ENTJ',
    name: 'The Commander',
    tags: ['Extraversion', 'Intuition', 'Thinking', 'Judging'],
    descriptionOverall: 'ENTJs are the natural-born leaders of the team, providing strategic direction, decisive action, and an unwavering drive to achieve ambitious goals and build a high-performing organization.',
    capabilities: {
      communication: {
        name: 'Communication',
        description: 'Assertive and strategic. Communicates with authority and a focus on the end goal. Values efficiency and logical arguments.',
      },
      problemSolving: {
        name: 'Problem-Solving & Conflict Resolution',
        description: 'Approaches problems with a long-term, strategic mindset. Seeks the most efficient and logical solution, regardless of personal feelings. Resolves conflicts by using objective analysis and decisive action.',
      },
      leadershipStyle: {
        name: 'Leadership Style',
        description: 'Decisive and visionary. Leads by setting clear goals, delegating tasks, and holding others to high standards. Focuses on achieving results and optimizing systems.',
      },
      teamCulture: {
        name: 'Team-Culture',
        description: 'Fosters a culture of competence and achievement. Promotes a results-oriented mindset and a strong work ethic. Values strategic thinking and personal accountability.',
      },
      change: {
        name: 'Change',
        description: 'Welcomes and even initiates change that is logical and beneficial. Sees change as an opportunity to restructure and improve. Loves to implement large-scale, transformative projects.',
      },
      stress: {
        name: 'Stress',
        description: 'Becomes impatient with inefficiency or incompetence. May become overly controlling or blunt. Needs to step back, re-evaluate the strategy, and regain a sense of control.',
      },
    },
  },
};
