"""
360° Feedback Service

Ce service gère le calcul des scores 360°, l'interprétation des résultats,
la comparaison self vs others, et la génération de recommandations.

Référence: Feuilles Excel "360 Questionnaire Self", "360 Scores, Analysis and Reco"
"""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentResponse, AssessmentResult


# ============================================================================
# CALCUL DES SCORES 360°
# ============================================================================

def calculate_360_scores(responses: List[Dict]) -> Dict:
    """
    Calcule les scores 360° à partir des réponses de l'utilisateur.

    Le 360° mesure 6 capabilities de leadership:
    - Communication: Clarté, écoute, feedback
    - Team Culture: Collaboration, inclusion, reconnaissance
    - Accountability: Responsabilité, ownership, suivi
    - Talent Development: Coaching, mentorat, développement
    - Execution: Résultats, efficacité, qualité
    - Strategic Thinking: Vision, innovation, planification

    Chaque capability est notée sur 25 points (5 questions × 5 points max)
    Score total: 150 points

    Args:
        responses: Liste de réponses avec structure:
            [{"question_id": "q1", "capability": "communication", "score": 4}, ...]

    Returns:
        Dict avec scores par capability:
        {
            "scores": {
                "communication": 20,
                "team_culture": 18,
                "accountability": 22,
                "talent_development": 15,
                "execution": 23,
                "strategic_thinking": 19
            },
            "total": 117,
            "average": 19.5,
            "percentage": 78.0
        }
    """
    # Initialiser les capabilities
    capabilities = {
        'communication': [],
        'team_culture': [],
        'accountability': [],
        'talent_development': [],
        'execution': [],
        'strategic_thinking': []
    }

    # Regrouper les scores par capability
    for response in responses:
        capability = response.get('capability', '').lower()
        score = response.get('score', 0)  # Score de 1 à 5

        if capability in capabilities:
            capabilities[capability].append(score)

    # Calculer le total par capability (max 25 points)
    scores = {}
    for capability, values in capabilities.items():
        scores[capability] = sum(values)

    total = sum(scores.values())
    average = total / len(scores) if scores else 0
    percentage = (total / 150) * 100  # 150 = score maximum (6 × 25)

    return {
        'scores': scores,
        'total': total,
        'average': average,
        'percentage': percentage
    }


# ============================================================================
# INTERPRÉTATION DES RÉSULTATS 360°
# ============================================================================

def interpret_360_results(scores: Dict) -> Dict:
    """
    Génère des interprétations détaillées des scores 360°.

    Ranges d'interprétation (sur 25 points max par capability):
    - 5-10: Significant Growth Opportunity (Rouge)
    - 11-15: Early Development (Orange)
    - 16-20: Consistency Stage (Jaune)
    - 21-25: Strong Foundation (Vert)

    Overall summary (sur 150 points total):
    - < 90 (60%): Needs significant improvement
    - 90-111 (60-74%): Developing, inconsistent
    - 112-127 (75-85%): Strong habits, mostly consistent
    - 128-150 (86-100%): Excellent overall leadership

    Args:
        scores: Dict avec les scores par capability

    Returns:
        Dict avec interprétations détaillées
    """
    interpretations = {}

    # Descriptions par capability et range
    descriptions = {
        'communication': {
            'low': "Your communication skills show significant room for growth. Focus on clarity in your messages, active listening, and providing constructive feedback. This is a critical area for leadership development.",
            'early': "Your communication skills are developing. You're making progress in expressing ideas clearly and listening to others, but consistency is needed. Continue practicing these skills in various contexts.",
            'consistent': "Your communication skills are solid and consistent. You effectively convey information, listen actively, and provide feedback. Continue refining these skills to reach excellence.",
            'strong': "Your communication skills are a significant strength. You excel at clear expression, active listening, and constructive feedback. You serve as a role model for effective communication."
        },
        'team_culture': {
            'low': "Building team culture is a significant growth area. Focus on fostering collaboration, creating an inclusive environment, and recognizing team contributions. These skills are essential for team success.",
            'early': "You're developing your ability to build team culture. You show awareness of the importance of collaboration and inclusion, but need to strengthen these practices consistently.",
            'consistent': "You consistently contribute to a positive team culture. You foster collaboration, promote inclusion, and recognize contributions effectively. Your team benefits from your cultural leadership.",
            'strong': "Building team culture is one of your greatest strengths. You excel at creating collaborative, inclusive environments where team members feel valued and motivated."
        },
        'accountability': {
            'low': "Accountability is a key development area. Focus on taking ownership of outcomes, following through on commitments, and holding yourself and others responsible for results.",
            'early': "Your accountability practices are developing. You're beginning to take ownership and follow through, but need to strengthen consistency in holding yourself and others accountable.",
            'consistent': "You demonstrate consistent accountability. You take ownership of outcomes, follow through on commitments, and appropriately hold others accountable. This builds trust and reliability.",
            'strong': "Accountability is a core strength. You exemplify ownership, consistently deliver on commitments, and create a culture of accountability that drives results and builds trust."
        },
        'talent_development': {
            'low': "Developing others is a significant growth opportunity. Focus on coaching, providing growth opportunities, and investing time in others' development. This is crucial for long-term team success.",
            'early': "You're beginning to develop others. You show interest in team members' growth, but need to strengthen your coaching skills and create more development opportunities.",
            'consistent': "You consistently invest in developing others. You provide coaching, create growth opportunities, and support team members' career development effectively.",
            'strong': "Talent development is a key strength. You excel at coaching, mentoring, and creating opportunities for others to grow. Your investment in people drives long-term success."
        },
        'execution': {
            'low': "Execution is a critical development area. Focus on delivering results, managing priorities effectively, and maintaining quality standards. Strong execution is fundamental to leadership success.",
            'early': "Your execution capabilities are developing. You're making progress in delivering results and managing priorities, but need to strengthen consistency and quality.",
            'consistent': "You consistently execute well. You deliver results, manage priorities effectively, and maintain quality standards. Your reliability in execution builds credibility.",
            'strong': "Execution is a core strength. You excel at delivering high-quality results, managing complex priorities, and driving outcomes. Your execution excellence sets the standard for others."
        },
        'strategic_thinking': {
            'low': "Strategic thinking is a key growth area. Focus on developing long-term vision, thinking systemically, and anticipating future challenges and opportunities.",
            'early': "Your strategic thinking is developing. You're beginning to think beyond immediate tasks and consider broader implications, but need to strengthen this capability.",
            'consistent': "You demonstrate consistent strategic thinking. You consider long-term implications, think systemically, and anticipate future needs effectively.",
            'strong': "Strategic thinking is a significant strength. You excel at envisioning the future, thinking systemically, and positioning for long-term success. Your strategic insight guides important decisions."
        }
    }

    # Générer les interprétations par capability
    for capability, score in scores.items():
        if score <= 10:
            level = "Significant Growth Opportunity"
            color = "red"
            text = descriptions[capability]['low']
        elif score <= 15:
            level = "Early Development"
            color = "orange"
            text = descriptions[capability]['early']
        elif score <= 20:
            level = "Consistency Stage"
            color = "yellow"
            text = descriptions[capability]['consistent']
        else:
            level = "Strong Foundation"
            color = "green"
            text = descriptions[capability]['strong']

        interpretations[capability] = {
            'level': level,
            'color': color,
            'score': score,
            'max_score': 25,
            'percentage': (score / 25) * 100,
            'text': text
        }

    # Overall summary
    total = sum(scores.values())
    percentage = (total / 150) * 100

    if percentage < 60:
        overall_level = "Needs Significant Improvement"
        overall_text = "Your overall leadership capabilities show significant room for growth. Focus on developing fundamental skills across all areas, starting with your lowest-scoring capabilities."
    elif percentage < 75:
        overall_level = "Developing, Inconsistent"
        overall_text = "Your leadership capabilities are developing. You show strengths in some areas but need to build consistency across all capabilities. Focus on your development areas while maintaining your strengths."
    elif percentage < 86:
        overall_level = "Strong Habits, Mostly Consistent"
        overall_text = "Your leadership capabilities are strong and mostly consistent. You demonstrate solid skills across most areas. Continue refining your capabilities and addressing any remaining gaps."
    else:
        overall_level = "Excellent Overall Leadership"
        overall_text = "Your leadership capabilities are excellent. You demonstrate strong, consistent skills across all areas. Continue to refine and deepen your expertise while serving as a role model for others."

    return {
        'by_capability': interpretations,
        'overall': {
            'level': overall_level,
            'total_score': total,
            'max_score': 150,
            'percentage': percentage,
            'text': overall_text
        }
    }


# ============================================================================
# GÉNÉRATION DE RECOMMANDATIONS 360°
# ============================================================================

def generate_360_recommendations(scores: Dict, interpretations: Dict) -> List[Dict]:
    """
    Génère des recommandations personnalisées basées sur les scores 360°.

    Args:
        scores: Dict avec les scores par capability
        interpretations: Dict avec les interprétations

    Returns:
        Liste de recommandations avec actions concrètes
    """
    recommendations = []

    # Recommandations par capability
    capability_recommendations = {
        'communication': {
            'actions': [
                'Practice active listening: Focus fully on the speaker, ask clarifying questions, and summarize to confirm understanding',
                'Improve clarity: Use simple language, provide context, and check for understanding',
                'Enhance feedback skills: Provide specific, timely, and constructive feedback regularly',
                'Develop presentation skills: Practice structuring messages clearly and engaging your audience'
            ],
            'resources': [
                'Book: "Crucial Conversations" by Kerry Patterson',
                'Course: Executive Communication Skills',
                'Practice: Schedule regular 1-on-1s with team members'
            ]
        },
        'team_culture': {
            'actions': [
                'Foster psychological safety: Create an environment where team members feel safe to speak up and take risks',
                'Promote inclusion: Actively seek diverse perspectives and ensure all voices are heard',
                'Recognize contributions: Regularly acknowledge and celebrate team and individual achievements',
                'Build trust: Follow through on commitments and demonstrate consistency between words and actions'
            ],
            'resources': [
                'Book: "The Culture Code" by Daniel Coyle',
                'Assessment: Team culture survey',
                'Practice: Implement regular team recognition rituals'
            ]
        },
        'accountability': {
            'actions': [
                'Set clear expectations: Define specific, measurable goals and communicate them clearly',
                'Follow through consistently: Do what you say you\'ll do and hold others to the same standard',
                'Address issues promptly: Don\'t avoid difficult conversations about performance or behavior',
                'Model ownership: Take responsibility for outcomes, both successes and failures'
            ],
            'resources': [
                'Book: "Extreme Ownership" by Jocko Willink',
                'Framework: SMART goals methodology',
                'Practice: Implement weekly accountability check-ins'
            ]
        },
        'talent_development': {
            'actions': [
                'Provide regular coaching: Schedule dedicated time for development conversations',
                'Create growth opportunities: Assign stretch assignments and new responsibilities',
                'Give developmental feedback: Focus on growth, not just performance evaluation',
                'Support career planning: Help team members identify and work toward their career goals'
            ],
            'resources': [
                'Book: "The Coaching Habit" by Michael Bungay Stanier',
                'Training: Coaching skills for managers',
                'Practice: Implement Individual Development Plans (IDPs)'
            ]
        },
        'execution': {
            'actions': [
                'Prioritize ruthlessly: Focus on high-impact activities and eliminate low-value work',
                'Manage time effectively: Use time-blocking and protect focus time for important work',
                'Drive results: Set clear milestones, track progress, and remove obstacles',
                'Maintain quality: Establish standards and review work to ensure excellence'
            ],
            'resources': [
                'Book: "The 4 Disciplines of Execution" by Chris McChesney',
                'Method: Getting Things Done (GTD) system',
                'Practice: Weekly priority planning sessions'
            ]
        },
        'strategic_thinking': {
            'actions': [
                'Think long-term: Regularly consider 3-5 year implications of decisions',
                'Analyze trends: Stay informed about industry trends and emerging technologies',
                'Think systemically: Consider how different parts of the organization interconnect',
                'Anticipate challenges: Identify potential obstacles and develop contingency plans'
            ],
            'resources': [
                'Book: "Good Strategy Bad Strategy" by Richard Rumelt',
                'Practice: Quarterly strategic planning sessions',
                'Tool: SWOT analysis and scenario planning'
            ]
        }
    }

    # Identifier les capabilities à développer (score <= 20)
    development_areas = [(cap, score) for cap, score in scores.items() if score <= 20]
    development_areas.sort(key=lambda x: x[1])  # Trier par score croissant

    # Générer des recommandations pour les 3 capabilities les plus faibles
    for capability, score in development_areas[:3]:
        priority = 'High' if score <= 15 else 'Medium'
        rec_data = capability_recommendations.get(capability, {})

        recommendations.append({
            'category': capability.replace('_', ' ').title(),
            'priority': priority,
            'type': 'Development',
            'title': f'Strengthen Your {capability.replace("_", " ").title()}',
            'description': f'Your score of {score}/25 indicates room for growth in this area. Focus on building these skills to enhance your overall leadership effectiveness.',
            'actions': rec_data.get('actions', []),
            'resources': rec_data.get('resources', [])
        })

    # Identifier les forces (score >= 21)
    strengths = [(cap, score) for cap, score in scores.items() if score >= 21]

    # Recommandation pour la force principale
    if strengths:
        top_strength = max(strengths, key=lambda x: x[1])
        capability, score = top_strength

        recommendations.append({
            'category': capability.replace('_', ' ').title(),
            'priority': 'Medium',
            'type': 'Strength',
            'title': f'Leverage Your {capability.replace("_", " ").title()} Strength',
            'description': f'Your score of {score}/25 shows this is a significant strength. Continue to refine this capability and use it to mentor others.',
            'actions': [
                'Continue practicing and refining this strength',
                'Share your expertise with team members',
                'Mentor others who are developing this capability',
                'Look for opportunities to apply this strength in new contexts'
            ],
            'resources': []
        })

    return recommendations


# ============================================================================
# COMPARAISON SELF VS OTHERS (pour Phase 3)
# ============================================================================

def calculate_360_comparison(self_scores: Dict, others_scores: List[Dict]) -> Dict:
    """
    Compare les scores self-assessment avec les scores des évaluateurs.

    Cette fonction sera utilisée dans la Phase 3 quand le système d'évaluateurs
    sera implémenté.

    Args:
        self_scores: Scores de l'auto-évaluation
        others_scores: Liste des scores des évaluateurs

    Returns:
        Dict avec la comparaison et le niveau de self-awareness
    """
    # Calculer la moyenne des scores des autres
    avg_others_scores = {}
    for capability in self_scores.keys():
        others_values = [s[capability] for s in others_scores if capability in s]
        avg_others_scores[capability] = sum(others_values) / len(others_values) if others_values else 0

    # Calculer les différences
    differences = {}
    for capability in self_scores.keys():
        diff = self_scores[capability] - avg_others_scores[capability]
        differences[capability] = {
            'self': self_scores[capability],
            'others': avg_others_scores[capability],
            'difference': diff,
            'percentage_diff': (diff / 25) * 100 if 25 > 0 else 0
        }

    # Déterminer le niveau de self-awareness
    avg_diff = sum(d['difference'] for d in differences.values()) / len(differences)

    if abs(avg_diff) <= 2:
        awareness_level = "Well Aligned"
        awareness_text = "Your self-perception is well aligned with how others see you. This indicates strong self-awareness."
    elif avg_diff > 2:
        awareness_level = "Overestimated"
        awareness_text = "You tend to rate yourself higher than others rate you. Consider seeking more feedback to calibrate your self-perception."
    else:
        awareness_level = "Underestimated"
        awareness_text = "You tend to rate yourself lower than others rate you. You may be more capable than you give yourself credit for."

    return {
        'by_capability': differences,
        'self_awareness': {
            'level': awareness_level,
            'average_difference': avg_diff,
            'text': awareness_text
        }
    }


# ============================================================================
# FONCTION PRINCIPALE D'ANALYSE 360°
# ============================================================================

def analyze_360_assessment(assessment_id: int, db: Session) -> Dict:
    """
    Analyse complète d'un assessment 360°.

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
            'capability': r.response_data.get('capability'),
            'score': r.response_data.get('score')
        }
        for r in responses
    ]

    # Calculer les scores
    scores_result = calculate_360_scores(responses_data)

    # Générer les interprétations
    interpretations = interpret_360_results(scores_result['scores'])

    # Générer les recommandations
    recommendations = generate_360_recommendations(
        scores_result['scores'],
        interpretations
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


