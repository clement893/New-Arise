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
        'name': 'The Teacher',
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
    
    insights = {
        'type_name': type_info['name'],
        'type_description': type_info['description'],
        'strengths': type_info['strengths'],
        'challenges': type_info['challenges'],
        'dimensions': {}
    }
    
    for dimension, prefs in dimension_preferences.items():
        preference = prefs['preference']
        insights['dimensions'][dimension] = {
            'preference': preference,
            'percentage': prefs[preference],
            'description': dimension_interpretations[dimension][preference],
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
