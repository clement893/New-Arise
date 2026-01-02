"""
TKI (Thomas-Kilmann Conflict Mode Instrument) Service - CORRECTED

Ce service gère le calcul des scores TKI et l'interprétation des résultats
BASÉ EXACTEMENT sur le fichier Excel officiel ARISE.

IMPORTANT: L'Excel ne définit PAS de seuils numériques (0-3, 4-6, etc.)
Les interprétations sont basées sur le MODE DOMINANT uniquement.

Référence: Feuille Excel "TKI ARISE" et "MBTI & TKI Correlations"
"""

from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentResponse, AssessmentResult


# ============================================================================
# CALCUL DES SCORES TKI
# ============================================================================

def calculate_tki_scores(responses: List[Dict]) -> Dict:
    """
    Calcule les scores TKI à partir des réponses de l'utilisateur.
    
    Le TKI mesure 5 modes de gestion des conflits:
    - Competing: Assertif et non coopératif
    - Collaborating: Assertif et coopératif
    - Compromising: Modérément assertif et coopératif
    - Avoiding: Non assertif et non coopératif
    - Accommodating: Non assertif et coopératif
    
    Distribution réelle des modes (selon Excel):
    - Competing: 14 occurrences possibles
    - Collaborating: 12 occurrences possibles
    - Compromising: 13 occurrences possibles
    - Avoiding: 12 occurrences possibles
    - Accommodating: 9 occurrences possibles
    
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
    Génère des interprétations basées sur le MODE DOMINANT.
    
    IMPORTANT: Pas de seuils numériques (0-3, 4-6, etc.)
    L'interprétation se base uniquement sur le mode le plus utilisé.
    
    Args:
        scores: Dict avec les scores par mode
    
    Returns:
        Dict avec interprétation du mode dominant
    """
    # Identifier le mode dominant
    dominant_mode = max(scores, key=scores.get)
    dominant_score = scores[dominant_mode]
    
    # Descriptions par mode (basées sur la théorie TKI standard)
    mode_descriptions = {
        'competing': {
            'title': 'Competing (Competition)',
            'description': 'You tend to assert your own concerns at the expense of others. This style is assertive and uncooperative.',
            'when_effective': 'Effective in emergencies, when quick decisions are vital, on important issues where unpopular actions need implementing, or against people who take advantage of non-competitive behavior.',
            'potential_pitfalls': 'Can damage relationships if overused. May miss opportunities for collaboration and creative solutions.'
        },
        'collaborating': {
            'title': 'Collaborating (Collaboration)',
            'description': 'You attempt to work with others to find solutions that fully satisfy the concerns of both parties. This style is both assertive and cooperative.',
            'when_effective': 'Effective when both sets of concerns are too important to be compromised, when the objective is to learn, to merge insights from people with different perspectives, or to gain commitment by incorporating concerns into a consensus.',
            'potential_pitfalls': 'Can be time-consuming. May not be appropriate for trivial issues.'
        },
        'compromising': {
            'title': 'Compromising (Compromise)',
            'description': 'You seek to find an expedient, mutually acceptable solution that partially satisfies both parties. This style is intermediate in both assertiveness and cooperativeness.',
            'when_effective': 'Effective when goals are important but not worth the effort of more assertive modes, when opponents with equal power are committed to mutually exclusive goals, or to achieve temporary settlements to complex issues.',
            'potential_pitfalls': 'May lead to cynical climate of gamesmanship. May distract from larger issues.'
        },
        'avoiding': {
            'title': 'Avoiding (Avoidance)',
            'description': 'You do not immediately pursue your own concerns or those of others. You do not address the conflict. This style is unassertive and uncooperative.',
            'when_effective': 'Effective when an issue is trivial or more important issues are pressing, when you perceive no chance of satisfying your concerns, when potential disruption outweighs benefits of resolution, or to let people cool down.',
            'potential_pitfalls': 'Important decisions may be made by default. Issues may escalate if not addressed.'
        },
        'accommodating': {
            'title': 'Accommodating (Accommodation)',
            'description': 'You neglect your own concerns to satisfy the concerns of others. This style is unassertive and cooperative.',
            'when_effective': 'Effective when you find you are wrong, when the issue is more important to others than to yourself, to build social credits for later issues, or when harmony and stability are especially important.',
            'potential_pitfalls': 'Your own ideas and concerns may not get attention. May lose influence and respect if overused.'
        }
    }
    
    interpretation = mode_descriptions.get(dominant_mode, {})
    
    return {
        'dominant_mode': dominant_mode,
        'dominant_score': dominant_score,
        'interpretation': interpretation,
        'all_scores': scores
    }


# ============================================================================
# RECOMMANDATIONS
# ============================================================================

def generate_tki_recommendations(dominant_mode: str, scores: Dict) -> List[Dict]:
    """
    Génère des recommandations basées sur le mode dominant.
    
    Args:
        dominant_mode: Le mode de conflit dominant
        scores: Tous les scores par mode
    
    Returns:
        Liste de recommandations
    """
    recommendations = []
    
    # Recommandations générales par mode dominant
    mode_recommendations = {
        'competing': [
            {
                'title': 'Balance Assertiveness with Collaboration',
                'description': 'While your competing style can be effective, consider when collaboration might yield better long-term results.',
                'action': 'Practice asking for others\' input before making decisions, especially on non-urgent matters.'
            },
            {
                'title': 'Develop Active Listening',
                'description': 'Strengthen your ability to understand others\' perspectives before asserting your own.',
                'action': 'In your next conflict, commit to fully listening and restating the other person\'s position before presenting your own.'
            }
        ],
        'collaborating': {
            'title': 'Maintain Your Collaborative Approach',
            'description': 'Your collaborative style is excellent for building strong relationships and finding win-win solutions.',
            'action': 'Continue seeking to understand all perspectives. Be mindful of time constraints and when a quicker resolution might be more appropriate.'
        },
        'compromising': [
            {
                'title': 'Know When to Collaborate Fully',
                'description': 'While compromise is efficient, some important issues may benefit from full collaboration.',
                'action': 'For your next significant conflict, try collaborating to find a solution that fully satisfies all concerns rather than settling for middle ground.'
            }
        ],
        'avoiding': [
            {
                'title': 'Practice Addressing Conflicts Directly',
                'description': 'While avoiding can be strategic, important issues need to be addressed.',
                'action': 'Identify one conflict you\'ve been avoiding and commit to addressing it this week. Start with a low-stakes issue to build confidence.'
            },
            {
                'title': 'Develop Assertiveness Skills',
                'description': 'Build your confidence in expressing your concerns and needs.',
                'action': 'Practice stating your position clearly in low-risk situations.'
            }
        ],
        'accommodating': [
            {
                'title': 'Balance Harmony with Your Own Needs',
                'description': 'While maintaining relationships is important, your own concerns matter too.',
                'action': 'Identify one issue where you\'ve been accommodating and practice asserting your needs.'
            },
            {
                'title': 'Learn to Say No',
                'description': 'Develop the ability to decline requests when they conflict with your important goals.',
                'action': 'Practice saying no to small requests this week to build your assertiveness.'
            }
        ]
    }
    
    # Ajouter les recommandations pour le mode dominant
    mode_reco = mode_recommendations.get(dominant_mode, [])
    if isinstance(mode_reco, list):
        recommendations.extend(mode_reco)
    else:
        recommendations.append(mode_reco)
    
    # Recommandation pour développer les modes sous-utilisés
    min_mode = min(scores, key=scores.get)
    min_score = scores[min_mode]
    
    if min_score <= 2:
        recommendations.append({
            'title': f'Develop Your {min_mode.title()} Style',
            'description': f'You rarely use the {min_mode} style. Consider situations where this approach might be beneficial.',
            'action': f'Look for opportunities to practice {min_mode} in low-stakes situations.'
        })
    
    return recommendations


# ============================================================================
# ANALYSE COMPLÈTE
# ============================================================================

def analyze_tki_assessment(assessment_id: int, db: Session) -> Dict:
    """
    Analyse complète d'un assessment TKI.
    
    Args:
        assessment_id: ID de l'assessment
        db: Session de base de données
    
    Returns:
        Dict avec résultats complets
    """
    # Récupérer les réponses
    responses = db.query(AssessmentResponse).filter(
        AssessmentResponse.assessment_id == assessment_id
    ).all()
    
    # Préparer les données
    response_data = [
        {
            'question_id': r.question_id,
            'selected_mode': r.answer_value  # A ou B → mode correspondant
        }
        for r in responses
    ]
    
    # Calculer les scores
    scores_result = calculate_tki_scores(response_data)
    
    # Générer les interprétations
    interpretation = interpret_tki_results(scores_result['scores'])
    
    # Générer les recommandations
    recommendations = generate_tki_recommendations(
        interpretation['dominant_mode'],
        scores_result['scores']
    )
    
    # Sauvegarder les résultats
    result = AssessmentResult(
        assessment_id=assessment_id,
        scores=scores_result['scores'],
        insights={
            'dominant_mode': interpretation['dominant_mode'],
            'interpretation': interpretation['interpretation']
        },
        recommendations=recommendations
    )
    
    db.add(result)
    db.commit()
    
    return {
        'scores': scores_result,
        'interpretation': interpretation,
        'recommendations': recommendations
    }
