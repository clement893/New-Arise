"""
TKI (Thomas-Kilmann Conflict Mode Instrument) Service

Ce service gère le calcul des scores TKI, l'interprétation des résultats,
et la génération de recommandations personnalisées.

Référence: Feuille Excel "TKI ARISE"
"""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentResponse, AssessmentResult


# ============================================================================
# CALCUL DES SCORES TKI
# ============================================================================

def calculate_tki_scores(responses: List[Dict]) -> Dict:
    """
    Calcule les scores TKI à partir des réponses de l'utilisateur.

    Le TKI mesure 5 modes de gestion des conflits:
    - Competing (Compétition): Assertif et non coopératif
    - Collaborating (Collaboration): Assertif et coopératif
    - Compromising (Compromis): Modérément assertif et coopératif
    - Avoiding (Évitement): Non assertif et non coopératif
    - Accommodating (Accommodation): Non assertif et coopératif

    Args:
        responses: Liste de réponses avec structure:
            [{"question_id": "q1", "selected_mode": "competing"}, ...]

    Returns:
        Dict avec scores par mode et mode dominant:
        {
            "scores": {
                "competing": 8,
                "collaborating": 10,
                "compromising": 6,
                "avoiding": 3,
                "accommodating": 3
            },
            "dominant_mode": "collaborating",
            "total": 30
        }
    """
    # Initialiser les scores à 0
    modes = {
        'competing': 0,
        'collaborating': 0,
        'compromising': 0,
        'avoiding': 0,
        'accommodating': 0
    }

    # Compter les réponses par mode
    for response in responses:
        selected_mode = response.get('selected_mode', '').lower()
        if selected_mode in modes:
            modes[selected_mode] += 1

    # Identifier le mode dominant (score le plus élevé)
    dominant_mode = max(modes, key=modes.get)

    return {
        'scores': modes,
        'dominant_mode': dominant_mode,
        'total': sum(modes.values())
    }


# ============================================================================
# INTERPRÉTATION DES RÉSULTATS TKI
# ============================================================================

def interpret_tki_results(scores: Dict) -> Dict:
    """
    Génère des interprétations détaillées des scores TKI.

    Ranges d'interprétation (sur 12 points max par mode):
    - 0-3: Low preference (Faible préférence)
    - 4-6: Moderate preference (Préférence modérée)
    - 7-9: High preference (Forte préférence)
    - 10-12: Very high preference (Très forte préférence)

    Args:
        scores: Dict avec les scores par mode

    Returns:
        Dict avec interprétations détaillées par mode
    """
    interpretations = {}

    # Descriptions par mode et niveau
    descriptions = {
        'competing': {
            'low': "You rarely use the competing style. You may tend to avoid asserting your own needs in conflicts, which could lead to missed opportunities to stand up for important issues.",
            'moderate': "You sometimes use the competing style when necessary. You can assert yourself in conflicts when the situation calls for it, but you don't overuse this approach.",
            'high': "You frequently use the competing style. You are comfortable asserting your position and pursuing your own concerns, which can be effective in urgent situations or when quick decisions are needed.",
            'very_high': "You predominantly use the competing style. You strongly assert your own concerns in conflicts. While this can be effective in certain situations, be mindful of when collaboration or compromise might be more appropriate."
        },
        'collaborating': {
            'low': "You rarely use the collaborating style. You may miss opportunities to find win-win solutions that satisfy everyone's concerns.",
            'moderate': "You sometimes use the collaborating style. You can work with others to find mutually beneficial solutions when the situation allows.",
            'high': "You frequently use the collaborating style. You actively seek win-win solutions and work to understand and address everyone's concerns, which builds strong relationships.",
            'very_high': "You predominantly use the collaborating style. You consistently seek solutions that fully satisfy everyone's concerns. This is excellent for important issues, though it can be time-consuming."
        },
        'compromising': {
            'low': "You rarely use the compromising style. You may struggle to find middle ground in conflicts, tending toward more extreme positions.",
            'moderate': "You sometimes use the compromising style. You can find middle ground when needed, balancing different concerns appropriately.",
            'high': "You frequently use the compromising style. You are skilled at finding expedient, mutually acceptable solutions that partially satisfy everyone.",
            'very_high': "You predominantly use the compromising style. You consistently seek middle ground in conflicts. While this is efficient, ensure you're not settling too quickly when collaboration might yield better results."
        },
        'avoiding': {
            'low': "You rarely use the avoiding style. You tend to address conflicts directly rather than postponing them, which can be effective but may sometimes benefit from strategic withdrawal.",
            'moderate': "You sometimes use the avoiding style. You can strategically withdraw from conflicts when appropriate, such as when issues are trivial or when more information is needed.",
            'high': "You frequently use the avoiding style. You often postpone or withdraw from conflicts. While this can be useful for minor issues, be careful not to avoid important conflicts that need resolution.",
            'very_high': "You predominantly use the avoiding style. You consistently withdraw from or postpone conflicts. Consider whether you're avoiding important issues that need to be addressed."
        },
        'accommodating': {
            'low': "You rarely use the accommodating style. You may struggle to yield to others' concerns, even when it would be appropriate to do so.",
            'moderate': "You sometimes use the accommodating style. You can yield to others when appropriate, maintaining harmony while also standing up for your own important concerns.",
            'high': "You frequently use the accommodating style. You often yield to others' concerns, which can build goodwill and maintain relationships, though be sure you're not neglecting your own important needs.",
            'very_high': "You predominantly use the accommodating style. You consistently yield to others' concerns. While this maintains harmony, ensure you're also advocating for your own important needs and concerns."
        }
    }

    # Générer les interprétations
    for mode, score in scores.items():
        if score <= 3:
            level = "Low"
            text = descriptions[mode]['low']
        elif score <= 6:
            level = "Moderate"
            text = descriptions[mode]['moderate']
        elif score <= 9:
            level = "High"
            text = descriptions[mode]['high']
        else:
            level = "Very High"
            text = descriptions[mode]['very_high']

        interpretations[mode] = {
            'level': level,
            'score': score,
            'text': text
        }

    return {
        'dominant_mode': max(scores, key=scores.get),
        'interpretations': interpretations
    }


# ============================================================================
# GÉNÉRATION DE RECOMMANDATIONS TKI
# ============================================================================

def generate_tki_recommendations(scores: Dict, dominant_mode: str) -> List[Dict]:
    """
    Génère des recommandations personnalisées basées sur les scores TKI.

    Args:
        scores: Dict avec les scores par mode
        dominant_mode: Le mode dominant de l'utilisateur

    Returns:
        Liste de recommandations avec actions concrètes
    """
    recommendations = []

    # Recommandations par mode
    mode_recommendations = {
        'competing': {
            'strength': {
                'title': 'Leverage Your Assertiveness',
                'description': 'Your competing style is a strength in situations requiring quick, decisive action or when unpopular decisions need to be made.',
                'actions': [
                    'Use this style in emergencies or when quick decisions are critical',
                    'Apply it when implementing unpopular but necessary changes',
                    'Stand firm on issues vital to organizational welfare',
                    'Be aware of when other styles might be more effective for relationship building'
                ]
            },
            'development': {
                'title': 'Develop Your Assertiveness',
                'description': 'Building your competing style will help you stand up for your concerns and make tough decisions when needed.',
                'actions': [
                    'Practice asserting your position in low-stakes situations',
                    'Learn to recognize when quick, decisive action is needed',
                    'Develop confidence in standing up for important principles',
                    'Study how effective leaders use assertiveness appropriately'
                ]
            }
        },
        'collaborating': {
            'strength': {
                'title': 'Leverage Your Collaborative Approach',
                'description': 'Your collaborating style is a strength for finding win-win solutions and building strong relationships.',
                'actions': [
                    'Use this style for important issues where both sets of concerns are too important to compromise',
                    'Apply it when you need to gain commitment by incorporating others\' concerns',
                    'Facilitate collaborative problem-solving in your team',
                    'Be mindful of time constraints - not every issue requires full collaboration'
                ]
            },
            'development': {
                'title': 'Develop Your Collaborative Skills',
                'description': 'Building your collaborating style will help you find solutions that fully satisfy everyone\'s concerns.',
                'actions': [
                    'Practice active listening to understand others\' underlying concerns',
                    'Learn to explore disagreements to gain insights',
                    'Develop skills in creative problem-solving',
                    'Observe how skilled collaborators facilitate win-win solutions'
                ]
            }
        },
        'compromising': {
            'strength': {
                'title': 'Leverage Your Ability to Find Middle Ground',
                'description': 'Your compromising style is a strength for finding expedient, mutually acceptable solutions.',
                'actions': [
                    'Use this style when goals are moderately important but not worth potential disruption',
                    'Apply it when time pressure requires an expedient solution',
                    'Use it as a backup when collaboration or competition fails',
                    'Ensure you\'re not settling too quickly on important issues'
                ]
            },
            'development': {
                'title': 'Develop Your Compromising Skills',
                'description': 'Building your compromising style will help you find practical solutions that partially satisfy everyone.',
                'actions': [
                    'Practice identifying mutually acceptable middle ground',
                    'Learn to balance competing concerns efficiently',
                    'Develop skills in negotiation and give-and-take',
                    'Study how effective negotiators reach fair compromises'
                ]
            }
        },
        'avoiding': {
            'strength': {
                'title': 'Leverage Your Strategic Withdrawal',
                'description': 'Your avoiding style is a strength when used strategically to postpone issues or cool down tensions.',
                'actions': [
                    'Use this style when an issue is trivial or other issues are more pressing',
                    'Apply it when you need more time to gather information',
                    'Use it when others can resolve the conflict more effectively',
                    'Ensure you\'re not avoiding important issues that need resolution'
                ]
            },
            'development': {
                'title': 'Develop Strategic Avoidance',
                'description': 'Learning when to strategically avoid conflicts can help you choose your battles wisely.',
                'actions': [
                    'Practice recognizing when withdrawal is strategically appropriate',
                    'Learn to distinguish between trivial and important issues',
                    'Develop judgment about when to postpone vs. address issues',
                    'Study how effective leaders choose which conflicts to engage in'
                ]
            }
        },
        'accommodating': {
            'strength': {
                'title': 'Leverage Your Cooperative Nature',
                'description': 'Your accommodating style is a strength for maintaining relationships and building goodwill.',
                'actions': [
                    'Use this style when the issue is more important to others than to you',
                    'Apply it to build social credits for later issues',
                    'Use it when harmony and stability are especially important',
                    'Ensure you\'re also standing up for your own important concerns'
                ]
            },
            'development': {
                'title': 'Develop Your Accommodating Skills',
                'description': 'Building your accommodating style will help you maintain relationships and create goodwill.',
                'actions': [
                    'Practice yielding on less important issues',
                    'Learn to recognize when others\' concerns are more important',
                    'Develop skills in graceful concession',
                    'Study how effective leaders use accommodation to build relationships'
                ]
            }
        }
    }

    # Recommandation pour le mode dominant (force)
    if dominant_mode in mode_recommendations:
        rec = mode_recommendations[dominant_mode]['strength']
        recommendations.append({
            'category': dominant_mode.title(),
            'priority': 'High',
            'type': 'Strength',
            'title': rec['title'],
            'description': rec['description'],
            'actions': rec['actions']
        })

    # Recommandations pour les modes faibles (développement)
    weak_modes = [mode for mode, score in scores.items() if score <= 3]
    for mode in weak_modes[:2]:  # Limiter à 2 recommandations de développement
        if mode in mode_recommendations:
            rec = mode_recommendations[mode]['development']
            recommendations.append({
                'category': mode.title(),
                'priority': 'Medium',
                'type': 'Development',
                'title': rec['title'],
                'description': rec['description'],
                'actions': rec['actions']
            })

    # Recommandation générale sur l'équilibre
    recommendations.append({
        'category': 'Balance',
        'priority': 'Medium',
        'type': 'General',
        'title': 'Develop Flexibility Across All Modes',
        'description': 'The most effective leaders can use all five conflict modes appropriately depending on the situation. No single mode is best for all situations.',
        'actions': [
            'Assess each conflict situation to determine the most appropriate mode',
            'Practice using your less-preferred modes in appropriate situations',
            'Reflect on past conflicts to identify when different modes might have been more effective',
            'Seek feedback from others on your conflict management approach'
        ]
    })

    return recommendations


# ============================================================================
# FONCTION PRINCIPALE D'ANALYSE TKI
# ============================================================================

def analyze_tki_assessment(assessment_id: int, db: Session) -> Dict:
    """
    Analyse complète d'un assessment TKI.

    Cette fonction:
    1. Récupère les réponses de l'assessment
    2. Calcule les scores
    3. Génère les interprétations
    4. Génère les recommandations
    5. Stocke les résultats dans la base de données

    Args:
        assessment_id: ID de l'assessment à analyser
        db: Session de base de données

    Returns:
        Dict avec tous les résultats de l'analyse
    """
    # Récupérer l'assessment et ses réponses
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise ValueError(f"Assessment {assessment_id} not found")

    responses = db.query(AssessmentResponse).filter(
        AssessmentResponse.assessment_id == assessment_id
    ).all()

    # Convertir les réponses en format dict
    responses_data = [
        {
            'question_id': r.question_id,
            'selected_mode': r.response_data.get('selected_mode')
        }
        for r in responses
    ]

    # Calculer les scores
    scores_result = calculate_tki_scores(responses_data)

    # Générer les interprétations
    interpretations = interpret_tki_results(scores_result['scores'])

    # Générer les recommandations
    recommendations = generate_tki_recommendations(
        scores_result['scores'],
        scores_result['dominant_mode']
    )

    # Créer ou mettre à jour le résultat dans la DB
    result = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == assessment_id
    ).first()

    if not result:
        result = AssessmentResult(assessment_id=assessment_id)
        db.add(result)

    result.scores = scores_result
    result.insights = interpretations
    result.recommendations = recommendations

    db.commit()
    db.refresh(result)

    return {
        'scores': scores_result,
        'interpretations': interpretations,
        'recommendations': recommendations
    }


