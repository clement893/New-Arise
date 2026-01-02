"""
Wellness Service

Ce service gère le calcul des scores Wellness, l'interprétation des résultats,
et la génération de recommandations personnalisées.

Référence: Feuilles Excel "Wellness Questionnaire", "Wellness Results and Analysis"
"""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentResponse, AssessmentResult


# ============================================================================
# CALCUL DES SCORES WELLNESS
# ============================================================================

def calculate_wellness_scores(responses: List[Dict]) -> Dict:
    """
    Calcule les scores Wellness à partir des réponses de l'utilisateur.
    
    Le Wellness mesure 6 pillars de bien-être:
    - Sleep: Qualité et quantité de sommeil
    - Nutrition: Alimentation équilibrée et saine
    - Hydration: Consommation d'eau adéquate
    - Movement: Activité physique régulière
    - Stress Management: Gestion du stress et résilience
    - Social Connection: Relations sociales et soutien
    
    Chaque pillar est noté sur 25 points (5 questions × 5 points max)
    Score total: 150 points
    
    Args:
        responses: Liste de réponses avec structure:
            [{"question_id": "q1", "pillar": "sleep", "score": 4}, ...]
    
    Returns:
        Dict avec scores par pillar:
        {
            "scores": {
                "sleep": 20,
                "nutrition": 18,
                "hydration": 22,
                "movement": 15,
                "stress_management": 19,
                "social_connection": 21
            },
            "total": 115,
            "average": 19.2,
            "percentage": 76.7
        }
    """
    # Initialiser les pillars
    pillars = {
        'sleep': [],
        'nutrition': [],
        'hydration': [],
        'movement': [],
        'stress_management': [],
        'social_connection': []
    }
    
    # Regrouper les scores par pillar
    for response in responses:
        pillar = response.get('pillar', '').lower()
        score = response.get('score', 0)  # Score de 1 à 5
        
        if pillar in pillars:
            pillars[pillar].append(score)
    
    # Calculer le total par pillar (max 25 points)
    scores = {}
    for pillar, values in pillars.items():
        scores[pillar] = sum(values)
    
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
# INTERPRÉTATION DES RÉSULTATS WELLNESS
# ============================================================================

def interpret_wellness_results(scores: Dict) -> Dict:
    """
    Génère des interprétations détaillées des scores Wellness.
    
    Ranges d'interprétation (sur 25 points max par pillar):
    - 5-10: Significant Growth Opportunity (Rouge)
    - 11-15: Early Development (Orange)
    - 16-20: Consistency Stage (Jaune)
    - 21-25: Strong Foundation (Vert)
    
    Overall summary (sur 150 points total):
    - < 90 (60%): Needs significant improvement
    - 90-111 (60-74%): Developing, inconsistent
    - 112-127 (75-85%): Strong habits, mostly consistent
    - 128-150 (86-100%): Excellent overall health
    
    Args:
        scores: Dict avec les scores par pillar
    
    Returns:
        Dict avec interprétations détaillées
    """
    interpretations = {}
    
    # Descriptions par pillar et range
    descriptions = {
        'sleep': {
            'low': "Your sleep habits need significant improvement. Poor sleep affects every aspect of your health and performance. Prioritize establishing a consistent sleep routine and aim for 7-9 hours of quality sleep per night.",
            'early': "Your sleep habits are developing. You're making some progress but lack consistency. Focus on establishing a regular sleep schedule and improving sleep quality through better sleep hygiene.",
            'consistent': "Your sleep habits are solid and consistent. You generally get adequate sleep and maintain good sleep hygiene. Continue these practices to maintain optimal rest and recovery.",
            'strong': "Your sleep habits are excellent. You consistently get quality sleep and maintain strong sleep hygiene. Your commitment to rest supports your overall health and performance."
        },
        'nutrition': {
            'low': "Your nutrition habits need significant attention. What you eat directly impacts your energy, mood, and health. Focus on eating more whole foods, reducing processed foods, and establishing regular meal patterns.",
            'early': "Your nutrition habits are developing. You're aware of the importance of healthy eating but struggle with consistency. Work on meal planning and making healthier food choices more regularly.",
            'consistent': "Your nutrition habits are solid. You generally make healthy food choices and maintain balanced eating patterns. Continue these habits while being mindful of occasional indulgences.",
            'strong': "Your nutrition habits are excellent. You consistently fuel your body with nutritious foods and maintain balanced eating patterns. Your commitment to nutrition supports optimal health and energy."
        },
        'hydration': {
            'low': "Your hydration habits need significant improvement. Proper hydration is essential for physical and cognitive function. Aim to drink water regularly throughout the day, targeting at least 8 glasses daily.",
            'early': "Your hydration habits are developing. You're aware of the need to drink more water but often forget. Set reminders and keep water readily available to build more consistent habits.",
            'consistent': "Your hydration habits are solid. You generally drink adequate water throughout the day. Continue these habits and pay attention to increased needs during exercise or hot weather.",
            'strong': "Your hydration habits are excellent. You consistently maintain proper hydration throughout the day. Your commitment to staying well-hydrated supports optimal physical and cognitive function."
        },
        'movement': {
            'low': "Your physical activity level needs significant improvement. Regular movement is crucial for physical and mental health. Start with small, achievable goals like a 10-minute daily walk and gradually increase activity.",
            'early': "Your physical activity is developing. You're beginning to incorporate more movement but lack consistency. Focus on finding activities you enjoy and scheduling regular exercise time.",
            'consistent': "Your physical activity habits are solid. You regularly engage in exercise and movement. Continue these habits and consider varying your activities to maintain engagement and work different muscle groups.",
            'strong': "Your physical activity habits are excellent. You consistently engage in regular, varied exercise. Your commitment to movement supports your physical health, mental well-being, and energy levels."
        },
        'stress_management': {
            'low': "Your stress management needs significant attention. Chronic stress negatively impacts health and performance. Learn and practice stress-reduction techniques like deep breathing, meditation, or mindfulness.",
            'early': "Your stress management skills are developing. You're aware of stress but struggle to manage it effectively. Experiment with different stress-reduction techniques to find what works for you.",
            'consistent': "Your stress management is solid. You have effective strategies for managing stress and use them regularly. Continue these practices and refine your approach as needed.",
            'strong': "Your stress management is excellent. You effectively manage stress through consistent practices and maintain resilience. Your approach to stress supports your overall well-being and performance."
        },
        'social_connection': {
            'low': "Your social connections need significant strengthening. Social support is crucial for mental health and well-being. Make time for meaningful relationships and consider joining groups or activities to expand your social network.",
            'early': "Your social connections are developing. You have some relationships but may not invest enough time in them. Prioritize regular contact with friends and family and seek opportunities for meaningful connection.",
            'consistent': "Your social connections are solid. You maintain regular contact with friends and family and have a supportive social network. Continue nurturing these relationships.",
            'strong': "Your social connections are excellent. You have strong, supportive relationships and regularly invest time in meaningful connections. Your social network significantly supports your well-being."
        }
    }
    
    # Générer les interprétations par pillar
    for pillar, score in scores.items():
        if score <= 10:
            level = "Significant Growth Opportunity"
            color = "red"
            text = descriptions[pillar]['low']
        elif score <= 15:
            level = "Early Development"
            color = "orange"
            text = descriptions[pillar]['early']
        elif score <= 20:
            level = "Consistency Stage"
            color = "yellow"
            text = descriptions[pillar]['consistent']
        else:
            level = "Strong Foundation"
            color = "green"
            text = descriptions[pillar]['strong']
        
        interpretations[pillar] = {
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
        overall_text = "Your overall wellness shows significant room for improvement. Focus on building fundamental healthy habits across all pillars, starting with your lowest-scoring areas."
    elif percentage < 75:
        overall_level = "Developing, Inconsistent"
        overall_text = "Your wellness habits are developing. You show strengths in some areas but need to build consistency across all pillars. Focus on your development areas while maintaining your strengths."
    elif percentage < 86:
        overall_level = "Strong Habits, Mostly Consistent"
        overall_text = "Your wellness habits are strong and mostly consistent. You demonstrate solid practices across most areas. Continue refining your habits and addressing any remaining gaps."
    else:
        overall_level = "Excellent Overall Health"
        overall_text = "Your wellness habits are excellent. You demonstrate strong, consistent practices across all pillars. Continue to maintain and refine these habits for long-term health and well-being."
    
    return {
        'by_pillar': interpretations,
        'overall': {
            'level': overall_level,
            'total_score': total,
            'max_score': 150,
            'percentage': percentage,
            'text': overall_text
        }
    }


# ============================================================================
# GÉNÉRATION DE RECOMMANDATIONS WELLNESS
# ============================================================================

def generate_wellness_recommendations(scores: Dict, interpretations: Dict) -> List[Dict]:
    """
    Génère des recommandations personnalisées basées sur les scores Wellness.
    
    Args:
        scores: Dict avec les scores par pillar
        interpretations: Dict avec les interprétations
    
    Returns:
        Liste de recommandations avec actions concrètes
    """
    recommendations = []
    
    # Recommandations par pillar
    pillar_recommendations = {
        'sleep': {
            'actions': [
                'Establish a consistent sleep schedule: Go to bed and wake up at the same time every day, even on weekends',
                'Create a bedtime routine: Wind down 30-60 minutes before bed with relaxing activities',
                'Optimize your sleep environment: Keep your bedroom dark, quiet, cool (60-67°F), and comfortable',
                'Limit screen time: Avoid screens 1-2 hours before bed, or use blue light filters',
                'Avoid caffeine and alcohol: No caffeine after 2 PM, and limit alcohol which disrupts sleep quality'
            ],
            'resources': [
                'Book: "Why We Sleep" by Matthew Walker',
                'App: Sleep Cycle or Headspace for sleep',
                'Target: 7-9 hours of quality sleep per night'
            ]
        },
        'nutrition': {
            'actions': [
                'Eat more whole foods: Focus on vegetables, fruits, whole grains, lean proteins, and healthy fats',
                'Plan your meals: Prepare healthy meals in advance to avoid last-minute unhealthy choices',
                'Practice mindful eating: Eat slowly, without distractions, and pay attention to hunger and fullness cues',
                'Reduce processed foods: Minimize consumption of highly processed foods, added sugars, and trans fats',
                'Stay consistent: Eat regular meals and avoid skipping breakfast'
            ],
            'resources': [
                'Book: "How Not to Die" by Michael Greger',
                'App: MyFitnessPal for tracking nutrition',
                'Guideline: Follow the Mediterranean or DASH diet patterns'
            ]
        },
        'hydration': {
            'actions': [
                'Drink water first thing: Start your day with a glass of water to rehydrate after sleep',
                'Carry a water bottle: Keep water with you throughout the day as a visual reminder',
                'Set reminders: Use phone alarms or apps to remind you to drink water regularly',
                'Drink before meals: Have a glass of water before each meal',
                'Monitor urine color: Aim for pale yellow color as an indicator of adequate hydration'
            ],
            'resources': [
                'App: WaterMinder or Hydro Coach',
                'Target: At least 8 glasses (64 oz) of water daily, more if exercising or in hot weather',
                'Tip: Add lemon or cucumber for flavor if plain water is boring'
            ]
        },
        'movement': {
            'actions': [
                'Aim for 150 minutes weekly: Get at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week',
                'Include strength training: Do muscle-strengthening activities at least 2 days per week',
                'Break up sitting time: Stand and move for 5 minutes every hour if you have a desk job',
                'Find activities you enjoy: Choose exercises you like to increase adherence',
                'Start small and build: If you\'re inactive, start with 10-minute walks and gradually increase'
            ],
            'resources': [
                'App: Nike Training Club or Peloton',
                'Program: Couch to 5K for beginners',
                'Tip: Schedule exercise like any other important appointment'
            ]
        },
        'stress_management': {
            'actions': [
                'Practice daily mindfulness: Spend 10-20 minutes daily on meditation, deep breathing, or mindfulness',
                'Exercise regularly: Physical activity is one of the most effective stress reducers',
                'Set boundaries: Learn to say no and protect your time and energy',
                'Connect with others: Talk to friends, family, or a therapist about your stressors',
                'Identify and address stressors: Make a list of your stressors and develop action plans for each'
            ],
            'resources': [
                'App: Headspace, Calm, or Insight Timer',
                'Book: "The Relaxation Response" by Herbert Benson',
                'Technique: Box breathing (4-4-4-4) for immediate stress relief'
            ]
        },
        'social_connection': {
            'actions': [
                'Schedule regular social time: Put social activities on your calendar like any other commitment',
                'Reach out proactively: Don\'t wait for others to initiate - be the one to reach out',
                'Join groups or clubs: Find communities around your interests or hobbies',
                'Deepen existing relationships: Have meaningful conversations and be vulnerable with close friends',
                'Volunteer or help others: Giving back creates connections and provides purpose'
            ],
            'resources': [
                'Book: "The Village Effect" by Susan Pinker',
                'Platform: Meetup.com to find local groups',
                'Tip: Quality matters more than quantity - focus on meaningful connections'
            ]
        }
    }
    
    # Identifier les pillars à développer (score <= 20)
    development_areas = [(pillar, score) for pillar, score in scores.items() if score <= 20]
    development_areas.sort(key=lambda x: x[1])  # Trier par score croissant
    
    # Générer des recommandations pour les 3 pillars les plus faibles
    for pillar, score in development_areas[:3]:
        priority = 'High' if score <= 15 else 'Medium'
        rec_data = pillar_recommendations.get(pillar, {})
        
        recommendations.append({
            'category': pillar.replace('_', ' ').title(),
            'priority': priority,
            'type': 'Development',
            'title': f'Improve Your {pillar.replace("_", " ").title()}',
            'description': f'Your score of {score}/25 indicates room for improvement in this wellness pillar. Focus on building healthier habits in this area.',
            'actions': rec_data.get('actions', []),
            'resources': rec_data.get('resources', [])
        })
    
    # Identifier les forces (score >= 21)
    strengths = [(pillar, score) for pillar, score in scores.items() if score >= 21]
    
    # Recommandation pour la force principale
    if strengths:
        top_strength = max(strengths, key=lambda x: x[1])
        pillar, score = top_strength
        
        recommendations.append({
            'category': pillar.replace('_', ' ').title(),
            'priority': 'Low',
            'type': 'Strength',
            'title': f'Maintain Your {pillar.replace("_", " ").title()} Strength',
            'description': f'Your score of {score}/25 shows this is a significant strength. Continue these excellent habits and use them as a foundation for improving other areas.',
            'actions': [
                'Continue your current practices in this area',
                'Use this strength as motivation for other wellness pillars',
                'Share your success strategies with others',
                'Refine and deepen your practices in this area'
            ],
            'resources': []
        })
    
    # Recommandation générale sur l'approche holistique
    recommendations.append({
        'category': 'Holistic Wellness',
        'priority': 'Medium',
        'type': 'General',
        'title': 'Take a Holistic Approach to Wellness',
        'description': 'All six wellness pillars are interconnected. Improvements in one area often support improvements in others. Focus on sustainable, incremental changes rather than dramatic overhauls.',
        'actions': [
            'Start with one small change in your weakest pillar',
            'Build habits gradually - aim for 1% improvement each day',
            'Track your progress to stay motivated and accountable',
            'Be patient and compassionate with yourself - lasting change takes time',
            'Celebrate small wins along the way'
        ],
        'resources': [
            'Book: "Atomic Habits" by James Clear',
            'Framework: Start with keystone habits that create positive ripple effects',
            'Reminder: Progress, not perfection, is the goal'
        ]
    })
    
    return recommendations


# ============================================================================
# FONCTION PRINCIPALE D'ANALYSE WELLNESS
# ============================================================================

def analyze_wellness_assessment(assessment_id: int, db: Session) -> Dict:
    """
    Analyse complète d'un assessment Wellness.
    
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
            'pillar': r.response_data.get('pillar'),
            'score': r.response_data.get('score')
        }
        for r in responses
    ]
    
    # Calculer les scores
    scores_result = calculate_wellness_scores(responses_data)
    
    # Générer les interprétations
    interpretations = interpret_wellness_results(scores_result['scores'])
    
    # Générer les recommandations
    recommendations = generate_wellness_recommendations(
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
