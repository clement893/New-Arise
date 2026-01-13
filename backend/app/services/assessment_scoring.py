"""
Assessment Scoring Service
Calculate scores for different assessment types
"""

from typing import List, Dict, Any
from app.models.assessment import AssessmentType, AssessmentAnswer


def calculate_wellness_score(answers: List[AssessmentAnswer]) -> Dict[str, Any]:
    """
    Calculate Wellness assessment score
    
    30 questions across 6 pillars (5 questions each)
    Scale: 1-5
    Max score per pillar: 25
    Max total score: 150
    """
    if not answers:
        raise ValueError("No answers provided for wellness assessment")
    
    # Define pillar question mappings
    pillar_questions = {
        "avoidance_of_risky_substances": ["wellness_q1", "wellness_q2", "wellness_q3", "wellness_q4", "wellness_q5"],
        "movement": ["wellness_q6", "wellness_q7", "wellness_q8", "wellness_q9", "wellness_q10"],
        "nutrition": ["wellness_q11", "wellness_q12", "wellness_q13", "wellness_q14", "wellness_q15"],
        "sleep": ["wellness_q16", "wellness_q17", "wellness_q18", "wellness_q19", "wellness_q20"],
        "social_connection": ["wellness_q21", "wellness_q22", "wellness_q23", "wellness_q24", "wellness_q25"],
        "stress_management": ["wellness_q26", "wellness_q27", "wellness_q28", "wellness_q29", "wellness_q30"],
    }
    
    # Create answer lookup with error handling
    answer_lookup = {}
    invalid_answers = []
    for answer in answers:
        try:
            # Try to convert answer_value to int
            value = answer.answer_value
            if value is None or value == '':
                invalid_answers.append(answer.question_id)
                continue  # Skip empty answers
            int_value = int(value)
            # Validate range (1-5 for wellness)
            if int_value < 1 or int_value > 5:
                invalid_answers.append(answer.question_id)
                continue
            answer_lookup[answer.question_id] = int_value
        except (ValueError, TypeError) as e:
            # Track invalid answers
            invalid_answers.append(answer.question_id)
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Invalid answer value for question {answer.question_id}: {value} (error: {e})")
            continue
    
    if not answer_lookup:
        raise ValueError("No valid answers found. Please ensure all answers are numeric values between 1 and 5.")
    
    if invalid_answers:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Found {len(invalid_answers)} invalid answers: {invalid_answers}")
    
    # Calculate pillar scores
    pillar_scores = {}
    total_score = 0
    
    for pillar_name, question_ids in pillar_questions.items():
        pillar_score = sum(answer_lookup.get(qid, 0) for qid in question_ids)
        pillar_scores[pillar_name] = {
            "score": pillar_score,
            "max": 25,
            "percentage": round((pillar_score / 25) * 100, 2)
        }
        total_score += pillar_score
    
    return {
        "total_score": total_score,
        "max_score": 150,
        "percentage": round((total_score / 150) * 100, 2),
        "pillar_scores": pillar_scores,
        "answers": answer_lookup
    }


def calculate_tki_score(answers: List[AssessmentAnswer]) -> Dict[str, Any]:
    """
    Calculate TKI (Conflict Management Style) score
    
    30 questions with binary choice (A or B)
    Each choice corresponds to a conflict mode:
    - Competing (CO)
    - Collaborating (CL)
    - Avoiding (AV)
    - Accommodating (AC)
    - Compromising (CM)
    """
    # TKI question mappings (from Excel document TKI_ARISE.csv)
    # Format: {question_id: {"A": mode, "B": mode}}
    tki_mappings = {
        "tki_1": {"A": "avoiding", "B": "accommodating"},
        "tki_2": {"A": "compromising", "B": "collaborating"},
        "tki_3": {"A": "competing", "B": "accommodating"},
        "tki_4": {"A": "compromising", "B": "accommodating"},
        "tki_5": {"A": "collaborating", "B": "avoiding"},
        "tki_6": {"A": "avoiding", "B": "competing"},
        "tki_7": {"A": "avoiding", "B": "compromising"},
        "tki_8": {"A": "competing", "B": "collaborating"},
        "tki_9": {"A": "avoiding", "B": "competing"},
        "tki_10": {"A": "accommodating", "B": "competing"},
        "tki_11": {"A": "collaborating", "B": "avoiding"},
        "tki_12": {"A": "competing", "B": "accommodating"},
        "tki_13": {"A": "compromising", "B": "avoiding"},
        "tki_14": {"A": "collaborating", "B": "compromising"},
        "tki_15": {"A": "avoiding", "B": "competing"},
        "tki_16": {"A": "accommodating", "B": "collaborating"},
        "tki_17": {"A": "compromising", "B": "accommodating"},
        "tki_18": {"A": "competing", "B": "collaborating"},
        "tki_19": {"A": "compromising", "B": "collaborating"},
        "tki_20": {"A": "compromising", "B": "collaborating"},
        "tki_21": {"A": "avoiding", "B": "competing"},
        "tki_22": {"A": "avoiding", "B": "accommodating"},
        "tki_23": {"A": "compromising", "B": "competing"},
        "tki_24": {"A": "avoiding", "B": "accommodating"},
        "tki_25": {"A": "collaborating", "B": "competing"},
        "tki_26": {"A": "compromising", "B": "competing"},
        "tki_27": {"A": "collaborating", "B": "avoiding"},
        "tki_28": {"A": "accommodating", "B": "competing"},
        "tki_29": {"A": "compromising", "B": "avoiding"},
        "tki_30": {"A": "collaborating", "B": "accommodating"},
    }
    
    # Count mode selections
    mode_counts = {
        "competing": 0,
        "collaborating": 0,
        "avoiding": 0,
        "accommodating": 0,
        "compromising": 0
    }
    
    answer_lookup = {}
    for answer in answers:
        choice = answer.answer_value.upper()  # "A" or "B"
        answer_lookup[answer.question_id] = choice
        
        if answer.question_id in tki_mappings:
            mode = tki_mappings[answer.question_id][choice]
            mode_counts[mode] += 1
    
    # Determine dominant and secondary modes
    sorted_modes = sorted(mode_counts.items(), key=lambda x: x[1], reverse=True)
    dominant_mode = sorted_modes[0][0]
    secondary_mode = sorted_modes[1][0] if len(sorted_modes) > 1 else None
    
    return {
        "total_questions": 30,
        "mode_counts": mode_counts,
        "dominant_mode": dominant_mode,
        "secondary_mode": secondary_mode,
        "answers": answer_lookup
    }


def calculate_360_score(answers: List[AssessmentAnswer]) -> Dict[str, Any]:
    """
    Calculate 360 Feedback score
    
    30 questions across 6 capabilities (5 questions each)
    Scale: 1-5
    Max score per capability: 25
    Max total score: 150
    """
    if not answers:
        raise ValueError("No answers provided for 360 feedback assessment")
    
    # Define capability question mappings
    capability_questions = {
        "communication": ["360_q1", "360_q2", "360_q3", "360_q4", "360_q5"],
        "team_culture": ["360_q6", "360_q7", "360_q8", "360_q9", "360_q10"],
        "leadership_style": ["360_q11", "360_q12", "360_q13", "360_q14", "360_q15"],
        "change_management": ["360_q16", "360_q17", "360_q18", "360_q19", "360_q20"],
        "problem_solving": ["360_q21", "360_q22", "360_q23", "360_q24", "360_q25"],
        "stress_management": ["360_q26", "360_q27", "360_q28", "360_q29", "360_q30"],
    }
    
    # Create answer lookup with error handling
    answer_lookup = {}
    invalid_answers = []
    for answer in answers:
        try:
            # Try to convert answer_value to int
            value = answer.answer_value
            if value is None or value == '':
                invalid_answers.append(answer.question_id)
                continue  # Skip empty answers
            int_value = int(value)
            # Validate range (1-5 for 360)
            if int_value < 1 or int_value > 5:
                invalid_answers.append(answer.question_id)
                continue
            answer_lookup[answer.question_id] = int_value
        except (ValueError, TypeError) as e:
            # Track invalid answers
            invalid_answers.append(answer.question_id)
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Invalid answer value for question {answer.question_id}: {value} (error: {e})")
            continue
    
    if not answer_lookup:
        raise ValueError("No valid answers found. Please ensure all answers are numeric values between 1 and 5.")
    
    if invalid_answers:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Found {len(invalid_answers)} invalid answers: {invalid_answers}")
    
    # Calculate capability scores
    capability_scores = {}
    total_score = 0
    max_score = 150
    
    for capability_name, question_ids in capability_questions.items():
        capability_score = sum(answer_lookup.get(qid, 0) for qid in question_ids)
        capability_scores[capability_name] = capability_score
        total_score += capability_score
    
    # Calculate percentage
    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    
    return {
        "total_score": total_score,
        "max_score": max_score,
        "percentage": round(percentage, 1),
        "capability_scores": capability_scores,
        "answers": answer_lookup
    }


def calculate_scores(assessment_type: AssessmentType, answers: List[AssessmentAnswer]) -> Dict[str, Any]:
    """
    Main function to calculate scores based on assessment type
    """
    if assessment_type == AssessmentType.WELLNESS:
        return calculate_wellness_score(answers)
    elif assessment_type == AssessmentType.TKI:
        return calculate_tki_score(answers)
    elif assessment_type in [AssessmentType.THREE_SIXTY_SELF, AssessmentType.THREE_SIXTY_EVALUATOR]:
        return calculate_360_score(answers)
    else:
        raise ValueError(f"Unsupported assessment type: {assessment_type}")
