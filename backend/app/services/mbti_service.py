"""
MBTI Assessment Service

Service pour calculer les résultats MBTI (Myers-Briggs Type Indicator),
générer des interprétations et des recommandations personnalisées.

MBTI mesure 4 dimensions:
- E/I: Extraversion vs Introversion
- S/N: Sensing vs Intuition
- T/F: Thinking vs Feeling
- J/P: Judging vs Perceiving
"""

from sqlalchemy.orm import Session
from typing import Dict, List, Any
import json
from datetime import datetime

from app.models.assessment import Assessment, AssessmentAnswer, AssessmentResult


# ============================================================================
# CALCUL DES SCORES MBTI
# ============================================================================

def calculate_mbti_scores(assessment_id: int, db: Session) -> Dict[str, Any]:
    """
    Calcule les scores MBTI à partir des réponses.

    Args:
        assessment_id: ID de l'assessment
        db: Session de base de données

    Returns:
        Dict contenant:
        - dimension_scores: Dict avec E, I, S, N, T, F, J, P scores
        - mbti_type: Type MBTI (ex: "INTJ")
        - dimension_preferences: Dict avec les préférences par dimension
    """
    # Récupérer toutes les réponses
    answers = db.query(AssessmentAnswer).filter(
        AssessmentAnswer.assessment_id == assessment_id
    ).all()

    if not answers:
        raise ValueError("No answers found for this assessment")

    # Compter les préférences pour chaque dimension
    dimension_counts = {
        'E': 0, 'I': 0,  # Extraversion vs Introversion
        'S': 0, 'N': 0,  # Sensing vs Intuition
        'T': 0, 'F': 0,  # Thinking vs Feeling
        'J': 0, 'P': 0,  # Judging vs Perceiving
    }

    for answer in answers:
        # answer_value contient la préférence choisie (E, I, S, N, T, F, J, P)
        preference = answer.answer_value.strip().upper()
        if preference in dimension_counts:
            dimension_counts[preference] += 1

    # Déterminer le type MBTI (4 lettres)
    mbti_type = ""
    mbti_type += "E" if dimension_counts['E'] >= dimension_counts['I'] else "I"
    mbti_type += "S" if dimension_counts['S'] >= dimension_counts['N'] else "N"
    mbti_type += "T" if dimension_counts['T'] >= dimension_counts['F'] else "F"
    mbti_type += "J" if dimension_counts['J'] >= dimension_counts['P'] else "P"

    # Calculer les pourcentages pour chaque dimension
    total_ei = dimension_counts['E'] + dimension_counts['I']
    total_sn = dimension_counts['S'] + dimension_counts['N']
    total_tf = dimension_counts['T'] + dimension_counts['F']
    total_jp = dimension_counts['J'] + dimension_counts['P']

    dimension_preferences = {
        'EI': {
            'E': round((dimension_counts['E'] / total_ei * 100) if total_ei > 0 else 0, 1),
            'I': round((dimension_counts['I'] / total_ei * 100) if total_ei > 0 else 0, 1),
            'preference': 'E' if dimension_counts['E'] >= dimension_counts['I'] else 'I',
        },
        'SN': {
            'S': round((dimension_counts['S'] / total_sn * 100) if total_sn > 0 else 0, 1),
            'N': round((dimension_counts['N'] / total_sn * 100) if total_sn > 0 else 0, 1),
            'preference': 'S' if dimension_counts['S'] >= dimension_counts['N'] else 'N',
        },
        'TF': {
            'T': round((dimension_counts['T'] / total_tf * 100) if total_tf > 0 else 0, 1),
            'F': round((dimension_counts['F'] / total_tf * 100) if total_tf > 0 else 0, 1),
            'preference': 'T' if dimension_counts['T'] >= dimension_counts['F'] else 'F',
        },
        'JP': {
            'J': round((dimension_counts['J'] / total_jp * 100) if total_jp > 0 else 0, 1),
            'P': round((dimension_counts['P'] / total_jp * 100) if total_jp > 0 else 0, 1),
            'preference': 'J' if dimension_counts['J'] >= dimension_counts['P'] else 'P',
        },
    }

    return {
        'mbti_type': mbti_type,
        'dimension_scores': dimension_counts,
        'dimension_preferences': dimension_preferences,
    }


# ============================================================================
# INTERPRÉTATIONS MBTI
# ============================================================================

# Descriptions des types MBTI
MBTI_TYPE_DESCRIPTIONS = {
    'ISTJ': {
        'name': 'The Inspector',
        'description': 'Practical, fact-minded individuals whose reliability cannot be doubted. ISTJs are responsible, organized, and value tradition and loyalty.',
        'strengths': ['Responsible', 'Organized', 'Detail-oriented', 'Loyal', 'Practical'],
        'challenges': ['May resist change', 'Can be inflexible', 'May overlook feelings'],
    },
    'ISFJ': {
        'name': 'The Protector',
        'description': 'Very dedicated and warm protectors, always ready to defend their loved ones. ISFJs are supportive, reliable, and patient.',
        'strengths': ['Supportive', 'Reliable', 'Patient', 'Observant', 'Hardworking'],
        'challenges': ['May neglect own needs', 'Can be too humble', 'Dislikes change'],
    },
    'INFJ': {
        'name': 'The Counselor',
        'description': 'Quiet and mystical, yet very inspiring and tireless idealists. INFJs are insightful, principled, and passionate about helping others.',
        'strengths': ['Insightful', 'Principled', 'Passionate', 'Creative', 'Altruistic'],
        'challenges': ['Can be perfectionistic', 'May burn out', 'Sensitive to criticism'],
    },
    'INTJ': {
        'name': 'The Mastermind',
        'description': 'Imaginative and strategic thinkers, with a plan for everything. INTJs are independent, determined, and innovative.',
        'strengths': ['Strategic', 'Independent', 'Determined', 'Innovative', 'Confident'],
        'challenges': ['Can be arrogant', 'May dismiss emotions', 'Overly analytical'],
    },
    'ISTP': {
        'name': 'The Craftsman',
        'description': 'Bold and practical experimenters, masters of all kinds of tools. ISTPs are logical, flexible, and hands-on.',
        'strengths': ['Practical', 'Flexible', 'Logical', 'Hands-on', 'Calm under pressure'],
        'challenges': ['May be insensitive', 'Risk-taking', 'Difficulty with commitment'],
    },
    'ISFP': {
        'name': 'The Composer',
        'description': 'Flexible and charming artists, always ready to explore and experience something new. ISFPs are artistic, sensitive, and spontaneous.',
        'strengths': ['Artistic', 'Sensitive', 'Flexible', 'Spontaneous', 'Passionate'],
        'challenges': ['Can be unpredictable', 'Dislikes conflict', 'May be too competitive'],
    },
    'INFP': {
        'name': 'The Healer',
        'description': 'Poetic, kind and altruistic people, always eager to help a good cause. INFPs are idealistic, empathetic, and creative.',
        'strengths': ['Idealistic', 'Empathetic', 'Creative', 'Open-minded', 'Passionate'],
        'challenges': ['Can be too idealistic', 'May take things personally', 'Difficult to know'],
    },
    'INTP': {
        'name': 'The Architect',
        'description': 'Innovative inventors with an unquenchable thirst for knowledge. INTPs are analytical, objective, and curious.',
        'strengths': ['Analytical', 'Objective', 'Innovative', 'Curious', 'Honest'],
        'challenges': ['Can be insensitive', 'May be absent-minded', 'Dislikes rules'],
    },
    'ESTP': {
        'name': 'The Dynamo',
        'description': 'Smart, energetic and very perceptive people, who truly enjoy living on the edge. ESTPs are bold, pragmatic, and perceptive.',
        'strengths': ['Energetic', 'Pragmatic', 'Perceptive', 'Bold', 'Direct'],
        'challenges': ['May be impatient', 'Risk-taking', 'Can be insensitive'],
    },
    'ESFP': {
        'name': 'The Performer',
        'description': 'Spontaneous, energetic and enthusiastic people – life is never boring around them. ESFPs are friendly, spontaneous, and practical.',
        'strengths': ['Enthusiastic', 'Friendly', 'Spontaneous', 'Practical', 'Observant'],
        'challenges': ['Can be easily bored', 'May avoid conflict', 'Difficulty with long-term planning'],
    },
    'ENFP': {
        'name': 'The Champion',
        'description': 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile. ENFPs are creative, sociable, and energetic.',
        'strengths': ['Enthusiastic', 'Creative', 'Sociable', 'Energetic', 'Independent'],
        'challenges': ['Can be unfocused', 'May overthink', 'Difficulty with routine'],
    },
    'ENTP': {
        'name': 'The Visionary',
        'description': 'Smart and curious thinkers who cannot resist an intellectual challenge. ENTPs are innovative, charismatic, and knowledgeable.',
        'strengths': ['Innovative', 'Charismatic', 'Knowledgeable', 'Quick-thinking', 'Original'],
        'challenges': ['Can be argumentative', 'May be insensitive', 'Dislikes routine'],
    },
    'ESTJ': {
        'name': 'The Supervisor',
        'description': 'Excellent administrators, unsurpassed at managing things – or people. ESTJs are organized, practical, and strong-willed.',
        'strengths': ['Organized', 'Practical', 'Dedicated', 'Strong-willed', 'Direct'],
        'challenges': ['Can be inflexible', 'May be insensitive', 'Difficulty delegating'],
    },
    'ESFJ': {
        'name': 'The Provider',
        'description': 'Extraordinarily caring, social and popular people, always eager to help. ESFJs are caring, social, and loyal.',
        'strengths': ['Caring', 'Social', 'Loyal', 'Organized', 'Practical'],
        'challenges': ['Can be needy', 'May be too selfless', 'Sensitive to criticism'],
    },
    'ENFJ': {
        'name': 'Protagonist',
        'description': 'Charismatic and inspiring leaders, able to mesmerize their listeners. ENFJs are altruistic, natural leaders, and reliable.',
        'strengths': ['Charismatic', 'Altruistic', 'Natural leader', 'Reliable', 'Tolerant'],
        'challenges': ['Can be too idealistic', 'May be too selfless', 'Difficulty making tough decisions'],
    },
    'ENTJ': {
        'name': 'The Commander',
        'description': 'Bold, imaginative and strong-willed leaders, always finding a way – or making one. ENTJs are efficient, strategic, and confident.',
        'strengths': ['Efficient', 'Strategic', 'Confident', 'Charismatic', 'Strong-willed'],
        'challenges': ['Can be stubborn', 'May be intolerant', 'Impatient'],
    },
}


# ============================================================================
# LEADERSHIP CAPABILITIES
# ============================================================================

def get_leadership_capabilities(mbti_type: str) -> Dict[str, Dict[str, str]]:
    """
    Returns the 6 key leadership skills for a given MBTI type.
    
    Args:
        mbti_type: MBTI type (e.g., "INTJ")
    
    Returns:
        Dict with 6 leadership capabilities
    """
    capabilities = {
        'ISTJ': {
            'communication': {
                'title': 'Direct and Precise Communication',
                'description': 'ISTJs communicate in a clear, factual, and organized manner. They prefer written communication and detailed reports, ensuring all information is accurate and well-documented. They value efficiency in meetings and expect others to be prepared and concise.'
            },
            'problemSolving': {
                'title': 'Systematic Problem-Solver',
                'description': 'Approaches conflicts with logic and established procedures. Relies on past experiences and proven methods to resolve issues. Prefers to address problems through systematic analysis and step-by-step solutions, minimizing emotional involvement.'
            },
            'leadershipStyle': {
                'title': 'Traditional and Reliable Leader',
                'description': 'Leads by example through consistent, dependable actions. Values hierarchy and clear chains of command. Ensures tasks are completed thoroughly and on time, emphasizing accountability and adherence to established standards and procedures.'
            },
            'teamCulture': {
                'title': 'Structured and Accountable',
                'description': 'Fosters a culture of responsibility, reliability, and respect for rules. Team members know what to expect and appreciate the stability and clear expectations. Values loyalty and long-term commitment within the team.'
            },
            'change': {
                'title': 'Cautious Change Adopter',
                'description': 'Prefers gradual, well-planned changes supported by data and evidence. Needs to understand the rationale and practical benefits before implementing new approaches. Values stability but will adapt when change is proven necessary.'
            },
            'stress': {
                'title': 'Methodical Stress Management',
                'description': 'Under stress, may become more rigid and focused on details. Benefits from maintaining routines, creating structured plans, and addressing issues systematically. Needs alone time to process and organize thoughts before making decisions.'
            }
        },
        'ISFJ': {
            'communication': {
                'title': 'Supportive and Personal Communication',
                'description': 'ISFJs communicate with warmth and attention to individual needs. They excel at one-on-one conversations and remember personal details about team members. Prefer face-to-face interactions where they can gauge emotional responses and provide support.'
            },
            'problemSolving': {
                'title': 'Harmony-Focused Mediator',
                'description': 'Seeks to resolve conflicts by understanding all perspectives and finding solutions that maintain relationships. Approaches problems with empathy and consideration for how decisions affect people. Works to prevent conflicts through attentiveness to team dynamics.'
            },
            'leadershipStyle': {
                'title': 'Servant Leader',
                'description': 'Leads through support, dedication, and attention to team members\' well-being. Creates a nurturing environment where people feel valued and cared for. Leads quietly by example, often putting others\' needs before their own.'
            },
            'teamCulture': {
                'title': 'Caring and Harmonious',
                'description': 'Builds a culture of mutual support, appreciation, and collaboration. Team members feel personally valued and supported in their development. Creates traditions and rituals that strengthen team bonds and create a sense of belonging.'
            },
            'change': {
                'title': 'Supportive Change Partner',
                'description': 'Adapts to change when it benefits people and relationships. Helps team members transition through change by providing emotional support and practical assistance. Prefers changes that honor existing values and traditions while improving outcomes.'
            },
            'stress': {
                'title': 'Service-Oriented Stress Response',
                'description': 'May overextend themselves helping others during stressful times. Benefits from setting boundaries, taking personal time, and accepting help from others. Needs to balance caring for others with self-care to prevent burnout.'
            }
        },
        'INFJ': {
            'communication': {'title': 'Insightful and Meaningful Communication', 'description': 'INFJs communicate with depth and meaning, often addressing underlying values and long-term implications. They excel at understanding unspoken concerns and facilitating discussions that align people around shared purpose. Prefer authentic, purposeful conversations.'},
            'problemSolving': {'title': 'Values-Based Integrator', 'description': 'Resolves conflicts by identifying shared values and common ground. Sees multiple perspectives and works to find solutions that honor everyone\'s core needs. Skilled at reading between the lines and addressing root causes rather than surface issues.'},
            'leadershipStyle': {'title': 'Visionary Advocate', 'description': 'Leads with a clear vision aligned with values and purpose. Inspires others through authentic commitment to meaningful goals. Provides individualized attention and development while maintaining focus on the bigger picture and long-term impact.'},
            'teamCulture': {'title': 'Purpose-Driven and Authentic', 'description': 'Creates a culture where work has meaning and aligns with values. Team members feel connected to a larger purpose and encouraged to bring their authentic selves. Fosters deep, genuine relationships based on mutual understanding and respect.'},
            'change': {'title': 'Purposeful Change Catalyst', 'description': 'Embraces change that aligns with values and vision. Helps others see the deeper meaning and long-term benefits of transformation. Can be early adopters when change serves a greater purpose, but resistant to changes that conflict with core principles.'},
            'stress': {'title': 'Introspective Stress Processor', 'description': 'Needs solitude and reflection to process stress. May become overwhelmed by others\' emotions or compromising their values. Benefits from creative outlets, meaningful conversations with trusted confidants, and reconnecting with their sense of purpose.'}
        },
        'INTJ': {
            'communication': {'title': 'Strategic and Analytical Communication', 'description': 'INTJs communicate with precision and focus on strategic implications. They present well-organized, logical arguments and expect others to engage with ideas critically. Prefer substantive discussions over small talk and value intellectual rigor in exchanges.'},
            'problemSolving': {'title': 'Systems-Level Problem-Solver', 'description': 'Approaches conflicts and problems by analyzing systems and identifying root causes. Develops comprehensive, long-term solutions rather than quick fixes. Values logic and objective criteria over emotional considerations in decision-making.'},
            'leadershipStyle': {'title': 'Visionary Strategist', 'description': 'Leads through strategic vision and competence. Sets high standards and expects excellence from self and others. Provides autonomy to capable team members while maintaining focus on overarching goals and strategic direction.'},
            'teamCulture': {'title': 'Excellence-Oriented and Autonomous', 'description': 'Fosters a culture of competence, continuous improvement, and intellectual challenge. Team members are valued for their expertise and given independence to contribute. Appreciates innovation and strategic thinking over conformity.'},
            'change': {'title': 'Strategic Change Architect', 'description': 'Embraces change that improves efficiency or aligns with strategic vision. Often initiates transformational change when current systems are inadequate. Develops detailed implementation plans to ensure successful transformation.'},
            'stress': {'title': 'Analytical Stress Response', 'description': 'Under stress, may become hypercritical or withdraw into intense analysis. Benefits from physical activity, structured problem-solving time, and maintaining perspective on what can be controlled. Needs space to process independently before engaging.'}
        },
        'ISTP': {
            'communication': {'title': 'Concise and Action-Oriented Communication', 'description': 'ISTPs communicate efficiently, focusing on practical information and immediate needs. They prefer hands-on demonstrations over lengthy explanations. Communication style is direct and matter-of-fact, avoiding unnecessary elaboration.'},
            'problemSolving': {'title': 'Pragmatic Troubleshooter', 'description': 'Excels at identifying practical solutions to immediate problems. Approaches conflicts with calm objectivity, focusing on what works rather than who\'s right. Skilled at improvising solutions using available resources.'},
            'leadershipStyle': {'title': 'Flexible Facilitator', 'description': 'Leads through action and expertise rather than formal authority. Provides tools, resources, and freedom for team members to work independently. Steps in to solve critical problems but otherwise maintains a hands-off approach.'},
            'teamCulture': {'title': 'Independent and Results-Focused', 'description': 'Creates a culture where people have freedom to work their own way and are judged by results. Team members appreciate the lack of micromanagement and emphasis on practical outcomes over bureaucracy.'},
            'change': {'title': 'Adaptable and Pragmatic', 'description': 'Highly adaptable to change, especially when it offers practical improvements. Can quickly pivot strategies based on new information or circumstances. Prefers flexible approaches that allow for real-time adjustments.'},
            'stress': {'title': 'Action-Oriented Stress Relief', 'description': 'Under stress, may withdraw or seek physical outlets. Benefits from hands-on activities, problem-solving challenges, and physical exercise. Needs space to process independently and work through issues practically.'}
        },
        'ISFP': {
            'communication': {'title': 'Gentle and Expressive Communication', 'description': 'ISFPs communicate through actions, creativity, and genuine emotional expression. They excel at showing rather than telling and prefer authentic, personal interactions. May struggle with confrontation but excel at expressing care through tangible support.'},
            'problemSolving': {'title': 'Harmonious and Present-Focused', 'description': 'Resolves conflicts by seeking harmony and understanding individual needs. Addresses immediate concerns with practical, people-centered solutions. Values maintaining positive relationships and creating win-win outcomes.'},
            'leadershipStyle': {'title': 'Supportive and Flexible Leader', 'description': 'Leads by supporting individual expression and responding to current needs. Creates space for creativity and personal approaches. Demonstrates values through actions and maintains a gentle, non-imposing leadership presence.'},
            'teamCulture': {'title': 'Creative and Accepting', 'description': 'Fosters a culture where individual differences are celebrated and creativity is encouraged. Team members feel accepted for who they are and supported in expressing their unique contributions. Values present-moment collaboration over rigid planning.'},
            'change': {'title': 'Experience-Based Change Adopter', 'description': 'Adapts to change through direct experience and seeing practical benefits. Open to new approaches that feel authentic and improve current situations. May resist change that feels forced or conflicts with personal values.'},
            'stress': {'title': 'Creative and Sensory Stress Relief', 'description': 'Under stress, may withdraw into creative activities or seek sensory experiences. Benefits from artistic expression, time in nature, and supportive relationships. Needs space to process emotions and reconnect with personal values.'}
        },
        'INFP': {
            'communication': {'title': 'Authentic and Values-Driven Communication', 'description': 'INFPs communicate with authenticity and emotional depth, often through metaphor and storytelling. They excel at expressing ideals and connecting on a meaningful level. Prefer conversations that explore possibilities and align with values.'},
            'problemSolving': {'title': 'Idealistic Mediator', 'description': 'Seeks solutions that honor everyone\'s values and maintain authenticity. Approaches conflicts by understanding underlying motivations and finding creative compromises. Works to ensure resolutions align with principles and preserve relationships.'},
            'leadershipStyle': {'title': 'Values-Centered Inspirer', 'description': 'Leads by inspiring others around shared values and meaningful purpose. Encourages individual authenticity and personal growth. Creates space for creativity and supports team members in finding their own paths to contribute.'},
            'teamCulture': {'title': 'Authentic and Growth-Oriented', 'description': 'Builds a culture where people can be themselves and work on meaningful projects. Team members feel valued for their unique contributions and supported in personal development. Emphasizes purpose and authenticity over conformity.'},
            'change': {'title': 'Values-Aligned Change Supporter', 'description': 'Embraces change that aligns with ideals and creates positive impact. Can be passionate advocates for transformations that serve a greater good. May resist changes that feel inauthentic or violate core values.'},
            'stress': {'title': 'Reflective Stress Processing', 'description': 'Under stress, may become overwhelmed by emotions or withdraw into idealistic thinking. Benefits from creative expression, time alone to reflect, and supportive relationships that honor their feelings. Needs to reconnect with values and purpose.'}
        },
        'INTP': {
            'communication': {'title': 'Logical and Conceptual Communication', 'description': 'INTPs communicate complex ideas with logical precision and conceptual clarity. They enjoy intellectual discussions and exploring theoretical possibilities. Communication style is analytical and focused on understanding underlying principles.'},
            'problemSolving': {'title': 'Analytical Systems-Thinker', 'description': 'Approaches problems by analyzing logical inconsistencies and developing innovative solutions. Questions assumptions and explores multiple angles before reaching conclusions. Values objective truth over social harmony in resolving conflicts.'},
            'leadershipStyle': {'title': 'Innovative Knowledge Leader', 'description': 'Leads through expertise and innovative thinking. Encourages independent analysis and creative problem-solving. Provides intellectual freedom and values competence and logical reasoning over hierarchy.'},
            'teamCulture': {'title': 'Intellectually Curious and Open', 'description': 'Creates a culture that values knowledge, innovation, and logical debate. Team members are encouraged to question assumptions and explore new ideas. Appreciates intellectual honesty and creative problem-solving.'},
            'change': {'title': 'Innovative Change Explorer', 'description': 'Embraces change that offers intellectual challenge or improves logical efficiency. Often generates innovative ideas for transformation. Enjoys exploring new possibilities and rethinking established systems.'},
            'stress': {'title': 'Analytical Withdrawal Under Stress', 'description': 'Under stress, may overthink or become lost in abstract analysis. Benefits from physical activity, social breaks from intense thinking, and structured problem-solving. Needs time alone to process and reorganize thoughts.'}
        },
        'ESTP': {
            'communication': {'title': 'Direct and Energetic Communication', 'description': 'ESTPs communicate with energy, directness, and focus on immediate action. They excel at quick thinking and responding dynamically to situations. Prefer active, engaging discussions over theoretical debates.'},
            'problemSolving': {'title': 'Action-Oriented Problem-Solver', 'description': 'Addresses conflicts and problems with immediate, practical action. Excels in crisis situations and high-pressure environments. Focuses on what works now rather than perfect long-term solutions.'},
            'leadershipStyle': {'title': 'Dynamic and Persuasive Leader', 'description': 'Leads through charisma, quick decision-making, and tactical expertise. Energizes teams and drives rapid results. Thrives in competitive, fast-paced environments and encourages bold action.'},
            'teamCulture': {'title': 'Dynamic and Results-Driven', 'description': 'Fosters a culture of action, competition, and immediate results. Team members appreciate the energy, excitement, and focus on tangible outcomes. Values performance and adaptability over process.'},
            'change': {'title': 'Opportunistic Change Seeker', 'description': 'Thrives on change and sees it as opportunity for action and advancement. Quick to adapt and capitalize on new situations. Prefers rapid implementation over extensive planning.'},
            'stress': {'title': 'Active Stress Response', 'description': 'Under stress, may become restless or seek immediate outlets. Benefits from physical activity, hands-on challenges, and social engagement. Needs action and variety to manage stress effectively.'}
        },
        'ESFP': {
            'communication': {'title': 'Warm and Engaging Communication', 'description': 'ESFPs communicate with enthusiasm, warmth, and focus on positive experiences. They excel at reading the room and adapting their approach to audience needs. Prefer interactive, fun communication over formal presentations.'},
            'problemSolving': {'title': 'People-Centered Facilitator', 'description': 'Resolves conflicts by bringing people together and creating positive energy. Focuses on immediate harmony and finding solutions that make everyone feel good. Uses humor and optimism to defuse tensions.'},
            'leadershipStyle': {'title': 'Enthusiastic Motivator', 'description': 'Leads by creating positive energy and making work enjoyable. Builds strong personal connections with team members and celebrates successes. Encourages participation and keeps morale high through difficult times.'},
            'teamCulture': {'title': 'Fun and Collaborative', 'description': 'Creates a culture where work is enjoyable and people feel appreciated. Team members value the positive atmosphere, social connection, and celebration of achievements. Emphasizes collaboration and mutual support.'},
            'change': {'title': 'Enthusiastic Change Embracer', 'description': 'Welcomes change that brings new experiences and opportunities for fun. Helps others see the positive aspects of transformation. Adapts quickly and encourages team flexibility through optimism.'},
            'stress': {'title': 'Social Stress Relief', 'description': 'Under stress, may seek social support or sensory pleasures. Benefits from connecting with others, engaging in enjoyable activities, and maintaining optimism. Needs positive experiences and affirmation to recover.'}
        },
        'ENFP': {
            'communication': {'title': 'Enthusiastic and Inspiring Communication', 'description': 'ENFPs communicate with passion, creativity, and ability to connect diverse ideas. They excel at inspiring others and generating excitement around possibilities. Prefer dynamic, interactive conversations that explore potential.'},
            'problemSolving': {'title': 'Creative and People-Focused', 'description': 'Approaches conflicts by generating creative solutions that honor individual needs. Skilled at seeing multiple perspectives and finding innovative compromises. Values maintaining positive relationships while solving problems.'},
            'leadershipStyle': {'title': 'Inspirational and Democratic Leader', 'description': 'Leads by inspiring others around possibilities and shared values. Encourages participation, creativity, and individual contribution. Creates energy and enthusiasm while supporting team members\' growth and authentic expression.'},
            'teamCulture': {'title': 'Innovative and Inclusive', 'description': 'Fosters a culture of creativity, possibility, and appreciation for diverse perspectives. Team members feel encouraged to share ideas and contribute authentically. Values innovation, personal growth, and collaborative exploration.'},
            'change': {'title': 'Change Champion', 'description': 'Embraces change enthusiastically and helps others see exciting possibilities. Often initiates transformation and inspires others to join. Thrives in dynamic environments with opportunities for innovation and growth.'},
            'stress': {'title': 'Connection-Seeking Stress Response', 'description': 'Under stress, may become scattered or seek external validation. Benefits from reconnecting with values, engaging creativity, and meaningful conversations with trusted individuals. Needs to balance enthusiasm with focused action.'}
        },
        'ENTP': {
            'communication': {'title': 'Witty and Challenging Communication', 'description': 'ENTPs communicate with intellectual energy, wit, and love of debate. They excel at presenting innovative ideas and challenging conventional thinking. Prefer stimulating discussions that explore multiple angles.'},
            'problemSolving': {'title': 'Innovative Debater', 'description': 'Addresses conflicts by analyzing situations from multiple perspectives and proposing creative solutions. Enjoys intellectual challenge and may use debate to reach better outcomes. Focuses on logical innovation over emotional harmony.'},
            'leadershipStyle': {'title': 'Entrepreneurial Innovator', 'description': 'Leads by challenging the status quo and driving innovation. Encourages creative thinking and intellectual risk-taking. Provides strategic vision while giving team members autonomy to explore new approaches.'},
            'teamCulture': {'title': 'Innovative and Intellectually Stimulating', 'description': 'Creates a culture that values innovation, strategic thinking, and intellectual challenge. Team members are encouraged to question assumptions and propose bold ideas. Appreciates competence and creative problem-solving.'},
            'change': {'title': 'Strategic Change Initiator', 'description': 'Thrives on change and often drives transformational innovation. Sees opportunities where others see obstacles. Enjoys challenging existing systems and implementing strategic improvements.'},
            'stress': {'title': 'Intellectual Stimulation for Stress', 'description': 'Under stress, may become argumentative or scatter energy across too many projects. Benefits from focusing on one challenge at a time, engaging in strategic planning, and balancing debate with action.'}
        },
        'ESTJ': {
            'communication': {'title': 'Direct and Structured Communication', 'description': 'ESTJs communicate with clarity, directness, and focus on practical outcomes. They organize information logically and expect efficient, fact-based discussions. Prefer structured meetings with clear agendas and actionable results.'},
            'problemSolving': {'title': 'Decisive Administrator', 'description': 'Approaches conflicts with logical analysis and decisive action. Implements established procedures and clear policies to prevent future issues. Values fairness, efficiency, and adherence to standards in resolution.'},
            'leadershipStyle': {'title': 'Organized and Results-Driven Leader', 'description': 'Leads through organization, clear expectations, and decisive action. Creates structured systems and holds everyone accountable to standards. Drives results through efficient processes and strong work ethic.'},
            'teamCulture': {'title': 'Productive and Organized', 'description': 'Fosters a culture of productivity, accountability, and clear structure. Team members know expectations and appreciate the organization and efficiency. Values dedication, competence, and getting things done.'},
            'change': {'title': 'Structured Change Manager', 'description': 'Implements change through organized planning and systematic execution. Needs clear business case and practical benefits before adopting new approaches. Excels at managing the logistics of transformation.'},
            'stress': {'title': 'Control-Oriented Stress Response', 'description': 'Under stress, may become more controlling or rigid. Benefits from physical activity, maintaining routines, and delegating responsibilities. Needs to balance control with flexibility and recognize what cannot be managed.'}
        },
        'ESFJ': {
            'communication': {'title': 'Warm and Organized Communication', 'description': 'ESFJs communicate with warmth, attention to people\'s needs, and practical organization. They excel at facilitating group communication and ensuring everyone feels heard. Prefer personal, supportive interactions that build relationships.'},
            'problemSolving': {'title': 'Harmonious Coordinator', 'description': 'Resolves conflicts by bringing people together and facilitating collaborative solutions. Focuses on maintaining harmony while addressing practical concerns. Values everyone\'s input and works to ensure fair, people-centered outcomes.'},
            'leadershipStyle': {'title': 'Supportive Organizer', 'description': 'Leads by organizing people and resources while maintaining strong relationships. Creates structured, supportive environments where team members feel valued. Ensures smooth operations while attending to individual needs.'},
            'teamCulture': {'title': 'Harmonious and Appreciative', 'description': 'Builds a culture of mutual support, appreciation, and collaborative achievement. Team members feel valued personally and work together effectively. Emphasizes both task completion and relationship maintenance.'},
            'change': {'title': 'People-Centered Change Supporter', 'description': 'Supports change that benefits people and relationships while maintaining stability. Helps team members adapt through personal support and clear communication. Prefers changes that honor existing relationships and values.'},
            'stress': {'title': 'Relationship-Focused Stress Response', 'description': 'Under stress, may worry excessively about others\' opinions or approval. Benefits from reconnecting with supportive relationships, engaging in helpful activities, and receiving appreciation. Needs to balance others\' needs with self-care.'}
        },
        'ENFJ': {
            'communication': {'title': 'Inspiring and Empathetic Communication', 'description': 'ENFJs communicate with warmth, inspiration, and ability to connect with diverse audiences. They excel at understanding others\' needs and articulating shared vision. Prefer meaningful conversations that align people around common purpose.'},
            'problemSolving': {'title': 'Diplomatic Facilitator', 'description': 'Resolves conflicts by understanding all perspectives and facilitating win-win solutions. Skilled at addressing both task and relationship issues. Values harmony and mutual growth while ensuring practical resolution.'},
            'leadershipStyle': {'title': 'Charismatic Mentor', 'description': 'Leads by inspiring others around shared vision and developing their potential. Creates inclusive environments where everyone contributes meaningfully. Provides both strategic direction and personal mentorship.'},
            'teamCulture': {'title': 'Collaborative and Growth-Focused', 'description': 'Fosters a culture where people work together toward shared goals while developing individually. Team members feel valued, supported in growth, and connected to meaningful purpose. Emphasizes both achievement and relationships.'},
            'change': {'title': 'Visionary Change Leader', 'description': 'Champions change that aligns with values and benefits people. Inspires others to embrace transformation by connecting it to meaningful outcomes. Excels at leading cultural and organizational change initiatives.'},
            'stress': {'title': 'Purpose-Driven Stress Management', 'description': 'Under stress, may overextend helping others or lose objectivity. Benefits from reconnecting with personal values, setting boundaries, and engaging in self-reflection. Needs to balance caring for others with self-care.'}
        },
        'ENTJ': {
            'communication': {'title': 'Strategic and Commanding Communication', 'description': 'ENTJs communicate with confidence, strategic focus, and expectation of competence. They excel at articulating vision and organizing complex ideas. Prefer efficient, goal-oriented discussions that drive results.'},
            'problemSolving': {'title': 'Strategic Decision-Maker', 'description': 'Approaches conflicts with logical analysis and decisive action focused on long-term outcomes. Implements systematic solutions and holds people accountable. Values efficiency and effectiveness over emotional considerations.'},
            'leadershipStyle': {'title': 'Visionary Commander', 'description': 'Leads through strategic vision, decisive action, and high standards. Organizes resources and people effectively to achieve ambitious goals. Drives results while developing organizational capability and competence.'},
            'teamCulture': {'title': 'Achievement-Oriented and Strategic', 'description': 'Creates a culture of high performance, strategic thinking, and continuous improvement. Team members are challenged to excel and contribute to ambitious goals. Values competence, efficiency, and results.'},
            'change': {'title': 'Strategic Transformation Leader', 'description': 'Drives change strategically to achieve better outcomes. Often initiates bold transformations aligned with long-term vision. Excels at planning and executing large-scale organizational change.'},
            'stress': {'title': 'Achievement-Focused Stress Response', 'description': 'Under stress, may become domineering or impatient with others. Benefits from physical activity, strategic planning time, and recognizing limits of control. Needs to balance achievement drive with patience and self-care.'}
        },
    }
    
    # Return capabilities for the type, or empty dict if not found
    return capabilities.get(mbti_type, {})


def interpret_mbti_results(mbti_type: str, dimension_preferences: Dict[str, Any]) -> Dict[str, Any]:
    """
    Génère des interprétations détaillées pour le type MBTI.

    Args:
        mbti_type: Type MBTI (ex: "INTJ")
        dimension_preferences: Préférences par dimension

    Returns:
        Dict contenant les interprétations
    """
    type_info = MBTI_TYPE_DESCRIPTIONS.get(mbti_type, {
        'name': 'Unknown Type',
        'description': 'Type description not available.',
        'strengths': [],
        'challenges': [],
    })

    # Interprétations par dimension
    dimension_interpretations = {
        'EI': {
            'E': 'You gain energy from interacting with others and the external world. You are outgoing, expressive, and enjoy being around people.',
            'I': 'You gain energy from spending time alone and reflecting internally. You are reserved, thoughtful, and prefer deep one-on-one conversations.',
        },
        'SN': {
            'S': 'You focus on concrete facts and details, trusting what you can observe and experience. You are practical, realistic, and detail-oriented.',
            'N': 'You focus on patterns, possibilities, and the big picture. You are imaginative, future-oriented, and enjoy abstract concepts.',
        },
        'TF': {
            'T': 'You make decisions based on logic and objective analysis. You value fairness, consistency, and rational problem-solving.',
            'F': 'You make decisions based on values and how they affect people. You value harmony, compassion, and understanding others\' feelings.',
        },
        'JP': {
            'J': 'You prefer structure, planning, and having things decided. You are organized, decisive, and like to complete tasks.',
            'P': 'You prefer flexibility, spontaneity, and keeping options open. You are adaptable, curious, and comfortable with ambiguity.',
        },
    }

    # Leadership capabilities for each type
    leadership_capabilities = get_leadership_capabilities(mbti_type)
    
    insights = {
        'type_name': type_info['name'],
        'type_description': type_info['description'],
        'strengths': type_info['strengths'],
        'challenges': type_info['challenges'],
        'leadership_capabilities': leadership_capabilities,
        'dimensions': {}
    }

    for dimension, prefs in dimension_preferences.items():
        # Handle both formats: with explicit 'preference' key or without
        if 'preference' in prefs:
            preference = prefs['preference']
        else:
            # Calculate preference from percentages (highest value)
            # For example: {"E": 46, "I": 54} -> preference is "I"
            preference = max(prefs.items(), key=lambda x: x[1])[0]
        
        # Get percentage for the preference
        percentage = prefs.get(preference, 0)
        
        insights['dimensions'][dimension] = {
            'preference': preference,
            'percentage': percentage,
            'description': dimension_interpretations.get(dimension, {}).get(preference, 'No description available'),
        }

    return insights


# ============================================================================
# RECOMMANDATIONS MBTI
# ============================================================================

def generate_mbti_recommendations(mbti_type: str, dimension_preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Génère des recommandations personnalisées basées sur le type MBTI.

    Args:
        mbti_type: Type MBTI
        dimension_preferences: Préférences par dimension

    Returns:
        Liste de recommandations
    """
    recommendations = []

    # Recommandations générales par type
    type_recommendations = {
        'INTJ': {
            'title': 'Leverage Your Strategic Thinking',
            'description': 'As an INTJ, your ability to see the big picture and plan strategically is a major strength. Use this in leadership roles.',
            'actions': [
                'Take on strategic planning projects',
                'Mentor others in analytical thinking',
                'Balance analysis with action - don\'t get stuck in planning mode',
            ],
        },
        'ENFP': {
            'title': 'Channel Your Enthusiasm',
            'description': 'Your enthusiasm and creativity are infectious. Focus on projects that allow you to innovate and inspire others.',
            'actions': [
                'Lead brainstorming sessions',
                'Take on roles that require creativity and people skills',
                'Build systems to follow through on your ideas',
            ],
        },
        # Add more type-specific recommendations as needed
    }

    # Recommandation principale basée sur le type
    if mbti_type in type_recommendations:
        recommendations.append({
            **type_recommendations[mbti_type],
            'priority': 'high',
        })

    # Recommandations basées sur les dimensions
    ei_pref = dimension_preferences['EI']['preference']
    if ei_pref == 'I':
        recommendations.append({
            'title': 'Recharge Through Solitude',
            'description': 'As an introvert, you need alone time to recharge. Don\'t feel guilty about taking breaks from social interactions.',
            'actions': [
                'Schedule regular quiet time in your calendar',
                'Find a quiet workspace when you need to focus',
                'Communicate your need for alone time to others',
            ],
            'priority': 'medium',
        })
    else:
        recommendations.append({
            'title': 'Leverage Your Social Energy',
            'description': 'As an extravert, you thrive in social settings. Use this to build networks and collaborate effectively.',
            'actions': [
                'Join professional networking groups',
                'Volunteer to lead team meetings',
                'Balance social time with focused individual work',
            ],
            'priority': 'medium',
        })

    # Recommandation pour le développement personnel
    recommendations.append({
        'title': 'Develop Your Less Preferred Functions',
        'description': 'While it\'s important to leverage your strengths, developing your less preferred functions can make you more well-rounded.',
        'actions': [
            'Practice using your non-dominant functions in low-stakes situations',
            'Seek feedback from people with different personality types',
            'Read about personality types different from yours',
        ],
        'resources': [
            {'title': 'Understanding MBTI Types', 'url': 'https://www.myersbriggs.org/'},
            {'title': 'Personality Development', 'url': 'https://www.16personalities.com/'},
        ],
        'priority': 'low',
    })

    return recommendations


# ============================================================================
# ANALYSE COMPLÈTE
# ============================================================================

def analyze_mbti_assessment(assessment_id: int, db: Session) -> Dict[str, Any]:
    """
    Analyse complète d'un assessment MBTI.

    Args:
        assessment_id: ID de l'assessment
        db: Session de base de données

    Returns:
        Dict contenant scores, insights et recommandations
    """
    try:
        # 1. Calculer les scores
        scores = calculate_mbti_scores(assessment_id, db)

        # 2. Générer les interprétations
        insights = interpret_mbti_results(
            scores['mbti_type'],
            scores['dimension_preferences']
        )

        # 3. Générer les recommandations
        recommendations = generate_mbti_recommendations(
            scores['mbti_type'],
            scores['dimension_preferences']
        )

        # 4. Sauvegarder les résultats
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        # Créer ou mettre à jour le résultat
        result = db.query(AssessmentResult).filter(
            AssessmentResult.assessment_id == assessment_id
        ).first()

        if not result:
            result = AssessmentResult(
                assessment_id=assessment_id,
                user_id=assessment.user_id,
                scores=scores,
                insights=insights,
                recommendations=recommendations,
                generated_at=datetime.utcnow()
            )
            db.add(result)
        else:
            result.scores = scores
            result.insights = insights
            result.recommendations = recommendations
            result.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(result)

        return {
            'assessment_id': assessment_id,
            'mbti_type': scores['mbti_type'],
            'scores': scores,
            'insights': insights,
            'recommendations': recommendations,
        }

    except Exception as e:
        db.rollback()
        raise Exception(f"Error analyzing MBTI assessment: {str(e)}")



