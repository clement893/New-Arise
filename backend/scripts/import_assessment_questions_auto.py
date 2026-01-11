"""
Auto-import assessment questions script
This script is called automatically after migrations to import existing questions
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os

from app.models.assessment import AssessmentQuestion, AssessmentType
from app.config.assessment_questions import (
    WELLNESS_QUESTIONS,
    TKI_QUESTIONS,
    FEEDBACK_360_QUESTIONS
)
from app.core.config import get_settings

settings = get_settings()


async def import_questions():
    """Import questions from config files into database"""
    
    try:
        # Create async engine
        database_url = str(settings.DATABASE_URL)
        if not database_url.startswith("postgresql+asyncpg"):
            # Convert sync URL to async
            database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
        
        engine = create_async_engine(database_url, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as db:
            imported_count = 0
            updated_count = 0
            
            # Import Wellness questions
            for q_data in WELLNESS_QUESTIONS:
                result = await db.execute(
                    select(AssessmentQuestion).where(AssessmentQuestion.question_id == q_data["id"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Update existing question
                    existing.question = q_data.get("question")
                    existing.pillar = q_data.get("pillar")
                    existing.assessment_type = AssessmentType.WELLNESS
                    updated_count += 1
                else:
                    # Create new question
                    question = AssessmentQuestion(
                        question_id=q_data["id"],
                        assessment_type=AssessmentType.WELLNESS,
                        question=q_data.get("question"),
                        pillar=q_data.get("pillar")
                    )
                    db.add(question)
                    imported_count += 1
            
            # Import TKI questions
            for q_data in TKI_QUESTIONS:
                result = await db.execute(
                    select(AssessmentQuestion).where(AssessmentQuestion.question_id == q_data["id"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    existing.number = q_data.get("number")
                    existing.option_a = q_data.get("optionA")
                    existing.option_b = q_data.get("optionB")
                    existing.mode_a = q_data.get("modeA")
                    existing.mode_b = q_data.get("modeB")
                    existing.assessment_type = AssessmentType.TKI
                    updated_count += 1
                else:
                    question = AssessmentQuestion(
                        question_id=q_data["id"],
                        assessment_type=AssessmentType.TKI,
                        number=q_data.get("number"),
                        option_a=q_data.get("optionA"),
                        option_b=q_data.get("optionB"),
                        mode_a=q_data.get("modeA"),
                        mode_b=q_data.get("modeB")
                    )
                    db.add(question)
                    imported_count += 1
            
            # Import 360° Feedback questions
            for q_data in FEEDBACK_360_QUESTIONS:
                result = await db.execute(
                    select(AssessmentQuestion).where(AssessmentQuestion.question_id == q_data["id"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    existing.question = q_data.get("question")
                    existing.capability = q_data.get("capability")
                    existing.number = q_data.get("number")
                    existing.assessment_type = AssessmentType.THREE_SIXTY_SELF
                    updated_count += 1
                else:
                    question = AssessmentQuestion(
                        question_id=q_data["id"],
                        assessment_type=AssessmentType.THREE_SIXTY_SELF,
                        question=q_data.get("question"),
                        capability=q_data.get("capability"),
                        number=q_data.get("number")
                    )
                    db.add(question)
                    imported_count += 1
            
            await db.commit()
            
            if imported_count > 0 or updated_count > 0:
                print(f"✅ Imported {imported_count} questions, updated {updated_count} questions")
            else:
                print("ℹ️  All questions already imported")
            
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"⚠️  Error importing questions: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(import_questions())
    sys.exit(0 if success else 1)
