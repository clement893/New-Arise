"""
Assessment Questions Configuration
ARISE Leadership Assessment Tool

Central configuration for all assessment questions.
This provides a single source of truth for questions that can be served via API.
"""

from typing import List, Dict, Any
from app.models.assessment import AssessmentType

# Wellness Questions
WELLNESS_QUESTIONS: List[Dict[str, Any]] = [
    {"id": "wellness_q1", "pillar": "Avoidance of Risky Substances", "question": "I avoid or limit my weekly alcohol consumption to about 2 glasses per week"},
    {"id": "wellness_q2", "pillar": "Avoidance of Risky Substances", "question": "I make healthy choices by avoiding tobacco in all forms"},
    {"id": "wellness_q3", "pillar": "Avoidance of Risky Substances", "question": "I take prescription medications responsibly"},
    {"id": "wellness_q4", "pillar": "Avoidance of Risky Substances", "question": "I keep my caffeine consumption within healthy limits"},
    {"id": "wellness_q5", "pillar": "Avoidance of Risky Substances", "question": "I do not consume illegal drugs"},
    {"id": "wellness_q6", "pillar": "Movement", "question": "I am regularly active for at least 150 min per week"},
    {"id": "wellness_q7", "pillar": "Movement", "question": "I do strength training at least twice a week"},
    {"id": "wellness_q8", "pillar": "Movement", "question": "I do flexibility exercises 2-3 times per week"},
    {"id": "wellness_q9", "pillar": "Movement", "question": "I avoid sitting for longer than 30-60 minutes"},
    {"id": "wellness_q10", "pillar": "Movement", "question": "I have the energy to stay active throughout the day"},
    {"id": "wellness_q11", "pillar": "Nutrition", "question": "I eat balanced meals combining protein, healthy fats, and complex carbs"},
    {"id": "wellness_q12", "pillar": "Nutrition", "question": "I eat 5+ servings of fruits and vegetables daily"},
    {"id": "wellness_q13", "pillar": "Nutrition", "question": "I keep processed foods and sugary drinks to a minimum"},
    {"id": "wellness_q14", "pillar": "Nutrition", "question": "I drink enough water (2.7-3.8 liters per day)"},
    {"id": "wellness_q15", "pillar": "Nutrition", "question": "I follow healthy eating habits 80% of the time"},
    {"id": "wellness_q16", "pillar": "Sleep", "question": "I get 7-9 hours of sleep most nights"},
    {"id": "wellness_q17", "pillar": "Sleep", "question": "I maintain a regular sleep schedule"},
    {"id": "wellness_q18", "pillar": "Sleep", "question": "My sleep feels restful and restorative"},
    {"id": "wellness_q19", "pillar": "Sleep", "question": "I limit caffeine, alcohol, and screens before bedtime"},
    {"id": "wellness_q20", "pillar": "Sleep", "question": "I can settle back into restful sleep if disrupted"},
    {"id": "wellness_q21", "pillar": "Social Connection", "question": "I have strong, supportive relationships"},
    {"id": "wellness_q22", "pillar": "Social Connection", "question": "I connect with others several times a week"},
    {"id": "wellness_q23", "pillar": "Social Connection", "question": "I feel comfortable seeking support when needed"},
    {"id": "wellness_q24", "pillar": "Social Connection", "question": "I choose positive social interactions"},
    {"id": "wellness_q25", "pillar": "Social Connection", "question": "I balance time with others and time alone"},
    {"id": "wellness_q26", "pillar": "Stress Management", "question": "I notice stress and use healthy strategies to manage it"},
    {"id": "wellness_q27", "pillar": "Stress Management", "question": "I practice relaxation techniques several times a week"},
    {"id": "wellness_q28", "pillar": "Stress Management", "question": "I make time for hobbies and personal enjoyment"},
    {"id": "wellness_q29", "pillar": "Stress Management", "question": "I manage my workload in a balanced way"},
    {"id": "wellness_q30", "pillar": "Stress Management", "question": "I experience calm, focus, and emotional balance"},
]

# TKI Questions
TKI_QUESTIONS: List[Dict[str, Any]] = [
    {"id": "tki_1", "number": 1, "optionA": "I press to get my points across", "optionB": "I try to investigate an issue to find a mutually acceptable solution.", "modeA": "competing", "modeB": "collaborating"},
    {"id": "tki_2", "number": 2, "optionA": "I generally pursue my goals firmly.", "optionB": "I try to postpone the issue until I can properly reflect about it", "modeA": "competing", "modeB": "avoiding"},
    {"id": "tki_3", "number": 3, "optionA": "I attempt to postpone the issue until I've had some time to think it over.", "optionB": "I give up some points in exchange for others.", "modeA": "avoiding", "modeB": "compromising"},
    {"id": "tki_4", "number": 4, "optionA": "I try to win my position.", "optionB": "I might try to soothe the other's feelings and preserve our relationship.", "modeA": "competing", "modeB": "accommodating"},
    {"id": "tki_5", "number": 5, "optionA": "I consistently seek the other's help in working out a solution.", "optionB": "I try to do what is necessary to avoid useless tensions.", "modeA": "collaborating", "modeB": "avoiding"},
    {"id": "tki_6", "number": 6, "optionA": "I am firm in pursuing my goals.", "optionB": "I try to find a compromise solution.", "modeA": "competing", "modeB": "compromising"},
    {"id": "tki_7", "number": 7, "optionA": "I try to find a middle ground.", "optionB": "I attempt to get all concerns and issues immediately out in the open.", "modeA": "compromising", "modeB": "collaborating"},
    {"id": "tki_8", "number": 8, "optionA": "I sometimes avoid taking positions that would create controversy.", "optionB": "I will let the other person have some of his/her positions if he/she lets me have some of mine.", "modeA": "avoiding", "modeB": "compromising"},
    {"id": "tki_9", "number": 9, "optionA": "I suggest a middle ground.", "optionB": "I press to get my points made.", "modeA": "compromising", "modeB": "competing"},
    {"id": "tki_10", "number": 10, "optionA": "I might try to soothe the other's feelings and preserve our relationship.", "optionB": "I am usually firm in pursuing my goals.", "modeA": "accommodating", "modeB": "competing"},
    {"id": "tki_11", "number": 11, "optionA": "I attempt to get all concerns out in the open.", "optionB": "I feel that differences are not always worth worrying about.", "modeA": "collaborating", "modeB": "avoiding"},
    {"id": "tki_12", "number": 12, "optionA": "I try to win my position.", "optionB": "Rather negotiate on things we both disagree, I rather stress those things on upon which we both agree", "modeA": "competing", "modeB": "accommodating"},
    {"id": "tki_13", "number": 13, "optionA": "I give up some points in exchange for others.", "optionB": "I try to postpone the issue until I have time to think about it.", "modeA": "compromising", "modeB": "avoiding"},
    {"id": "tki_14", "number": 14, "optionA": "I consistently seek the other's help in working out a solution.", "optionB": "I try to find a compromise solution.", "modeA": "collaborating", "modeB": "compromising"},
    {"id": "tki_15", "number": 15, "optionA": "I feel that differences are not always worth worrying about.", "optionB": "I make some effort to get my way.", "modeA": "avoiding", "modeB": "competing"},
    {"id": "tki_16", "number": 16, "optionA": "I sometimes sacrifice my own wishes for the wishes of the other person.", "optionB": "I attempt to get all concerns and issues immediately out in the open.", "modeA": "accommodating", "modeB": "collaborating"},
    {"id": "tki_17", "number": 17, "optionA": "I try to find a compromise solution.", "optionB": "I feel that differences are not always worth worrying about.", "modeA": "compromising", "modeB": "accommodating"},
    {"id": "tki_18", "number": 18, "optionA": "I am usually firm in pursuing my goals.", "optionB": "I try to find a solution that satisfies both of us.", "modeA": "competing", "modeB": "collaborating"},
    {"id": "tki_19", "number": 19, "optionA": "I propose a middle ground.", "optionB": "I am frequently concerned in satistying all wishes", "modeA": "compromising", "modeB": "collaborating"},
    {"id": "tki_20", "number": 20, "optionA": "I will let the other person have some of his/her positions if he/she lets me have some of mine.", "optionB": "I attempt to deal with all his/her and my concerns.", "modeA": "compromising", "modeB": "collaborating"},
    {"id": "tki_21", "number": 21, "optionA": "I try to do what is necessary to avoid useless tensions.", "optionB": "I generally pursue my goals firmly.", "modeA": "avoiding", "modeB": "competing"},
    {"id": "tki_22", "number": 22, "optionA": "I attempt to postpone the issue until I have had some time to think it over.", "optionB": "I might try to soothe the other's feelings and preserve our relationship.", "modeA": "avoiding", "modeB": "accommodating"},
    {"id": "tki_23", "number": 23, "optionA": "I try to find a compromise solution.", "optionB": "I try to win my position.", "modeA": "compromising", "modeB": "competing"},
    {"id": "tki_24", "number": 24, "optionA": "I try to do what is necessary to avoid useless tensions.", "optionB": "I sometimes sacrifice my own wishes for the wishes of the other person.", "modeA": "avoiding", "modeB": "accommodating"},
    {"id": "tki_25", "number": 25, "optionA": "I consistently seek the other's help in working out a solution.", "optionB": "I am usually firm in pursuing my goals.", "modeA": "collaborating", "modeB": "competing"},
    {"id": "tki_26", "number": 26, "optionA": "I try to find a middle ground.", "optionB": "I try to get the other person to settle for a compromise", "modeA": "compromising", "modeB": "competing"},
    {"id": "tki_27", "number": 27, "optionA": "I attempt to get all concerns and issues immediately out in the open.", "optionB": "I attempt to postpone the issue until I've had some time to think it over.", "modeA": "collaborating", "modeB": "avoiding"},
    {"id": "tki_28", "number": 28, "optionA": "I sometimes sacrifice my own wishes for the wishes of the other person.", "optionB": "I try to win my position.", "modeA": "accommodating", "modeB": "competing"},
    {"id": "tki_29", "number": 29, "optionA": "I give up some points in exchange for others.", "optionB": "I feel that differences are not always worth worrying about.", "modeA": "compromising", "modeB": "avoiding"},
    {"id": "tki_30", "number": 30, "optionA": "I try to find a solution that satisfies both of us.", "optionB": "I might try to soothe the other's feelings and preserve our relationship.", "modeA": "collaborating", "modeB": "accommodating"},
]

# 360 Feedback Questions
FEEDBACK_360_QUESTIONS: List[Dict[str, Any]] = [
    {"id": "360_1", "number": 1, "capability": "communication", "question": "I communicate my ideas and expectations clearly and in a way that is easy to understand."},
    {"id": "360_2", "number": 2, "capability": "communication", "question": "I listen attentively and demonstrate understanding of others' perspectives before responding"},
    {"id": "360_3", "number": 3, "capability": "communication", "question": "I adapt my communication style to different audiences and situations."},
    {"id": "360_4", "number": 4, "capability": "communication", "question": "I provide feedback that is respectful, actionable, and supportive of growth"},
    {"id": "360_5", "number": 5, "capability": "communication", "question": "My communication fosters collaboration, engagement and alignment within the team."},
    {"id": "360_6", "number": 6, "capability": "team_culture", "question": "I promote teamwork and support colleagues to achieve shared goals"},
    {"id": "360_7", "number": 7, "capability": "team_culture", "question": "I treat team members with respect and encourage an inclusive environment where everyone feels valued."},
    {"id": "360_8", "number": 8, "capability": "team_culture", "question": "I build trust within the team by being reliable, transparent and accountable"},
    {"id": "360_9", "number": 9, "capability": "team_culture", "question": "I address and resolve conflicts in a constructive and respectful way"},
    {"id": "360_10", "number": 10, "capability": "team_culture", "question": "I actively contribute to building a positive, motivating and collaborative team culture."},
    {"id": "360_11", "number": 11, "capability": "leadership_style", "question": "I inspire and motivate others towards a shared vision"},
    {"id": "360_12", "number": 12, "capability": "leadership_style", "question": "I demonstrate fairness, integrity and consistency in my leadership."},
    {"id": "360_13", "number": 13, "capability": "leadership_style", "question": "I empower others to take ownership and make decisions."},
    {"id": "360_14", "number": 14, "capability": "leadership_style", "question": "I adapt my leadership style to different situations and individuals."},
    {"id": "360_15", "number": 15, "capability": "leadership_style", "question": "I provide clear direction while also encouraging autonomy."},
    {"id": "360_16", "number": 16, "capability": "change_management", "question": "I embrace and adapt to change effectively."},
    {"id": "360_17", "number": 17, "capability": "change_management", "question": "I help others understand and navigate through changes."},
    {"id": "360_18", "number": 18, "capability": "change_management", "question": "I identify opportunities for improvement and innovation."},
    {"id": "360_19", "number": 19, "capability": "change_management", "question": "I manage resistance to change in a constructive way."},
    {"id": "360_20", "number": 20, "capability": "change_management", "question": "I create a culture that is open to learning and continuous improvement."},
    {"id": "360_21", "number": 21, "capability": "problem_solving_and_decision_making", "question": "I analyze problems systematically and identify root causes."},
    {"id": "360_22", "number": 22, "capability": "problem_solving_and_decision_making", "question": "I make informed decisions in a timely manner."},
    {"id": "360_23", "number": 23, "capability": "problem_solving_and_decision_making", "question": "I consider multiple perspectives and gather relevant information before deciding."},
    {"id": "360_24", "number": 24, "capability": "problem_solving_and_decision_making", "question": "I balance risks and benefits when making decisions."},
    {"id": "360_25", "number": 25, "capability": "problem_solving_and_decision_making", "question": "I implement solutions effectively and monitor their impact."},
    {"id": "360_26", "number": 26, "capability": "stress_management", "question": "I remain calm and composed under pressure."},
    {"id": "360_27", "number": 27, "capability": "stress_management", "question": "I manage my workload effectively and maintain work-life balance."},
    {"id": "360_28", "number": 28, "capability": "stress_management", "question": "I help others manage stress and maintain well-being."},
    {"id": "360_29", "number": 29, "capability": "stress_management", "question": "I bounce back quickly from setbacks and challenges."},
    {"id": "360_30", "number": 30, "capability": "stress_management", "question": "I maintain a positive attitude even in difficult situations."},
]


def get_questions_for_type(assessment_type: AssessmentType) -> List[Dict[str, Any]]:
    """
    Get questions for a specific assessment type.
    
    Args:
        assessment_type: The type of assessment
        
    Returns:
        List of question dictionaries
    """
    type_map = {
        AssessmentType.WELLNESS: WELLNESS_QUESTIONS,
        AssessmentType.TKI: TKI_QUESTIONS,
        AssessmentType.THREE_SIXTY_SELF: FEEDBACK_360_QUESTIONS,
        AssessmentType.THREE_SIXTY_EVALUATOR: FEEDBACK_360_QUESTIONS,
    }
    return type_map.get(assessment_type, [])
