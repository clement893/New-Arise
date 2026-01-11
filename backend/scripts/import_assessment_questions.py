"""
Script to import existing assessment questions from config files into database.

This script reads questions from app.config.assessment_questions and imports them
into the assessment_questions table.
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
    
    # Create async engine
    database_url = settings.DATABASE_URL
    if not database_url.startswith("postgresql+asyncpg"):
        # Convert sync URL to async
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        try:
            # Import Wellness questions
            print(f"Importing {len(WELLNESS_QUESTIONS)} Wellness questions...")
            for q_data in WELLNESS_QUESTIONS:
                # Check if question already exists
                result = await db.execute(
                    select(AssessmentQuestion).where(AssessmentQuestion.question_id == q_data["id"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Update existing question
                    existing.question = q_data.get("question")
                    existing.pillar = q_data.get("pillar")
                    existing.assessment_type = AssessmentType.WELLNESS
                    print(f"  Updated: {q_data['id']}")
                else:
                    # Create new question
                    question = AssessmentQuestion(
                        question_id=q_data["id"],
                        assessment_type=AssessmentType.WELLNESS,
                        question=q_data.get("question"),
                        pillar=q_data.get("pillar")
                    )
                    db.add(question)
                    print(f"  Created: {q_data['id']}")
            
            # Import TKI questions
            print(f"\nImporting {len(TKI_QUESTIONS)} TKI questions...")
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
                    print(f"  Updated: {q_data['id']}")
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
                    print(f"  Created: {q_data['id']}")
            
            # Import 360° Feedback questions
            print(f"\nImporting {len(FEEDBACK_360_QUESTIONS)} 360° Feedback questions...")
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
                    print(f"  Updated: {q_data['id']}")
                else:
                    question = AssessmentQuestion(
                        question_id=q_data["id"],
                        assessment_type=AssessmentType.THREE_SIXTY_SELF,
                        question=q_data.get("question"),
                        capability=q_data.get("capability"),
                        number=q_data.get("number")
                    )
                    db.add(question)
                    print(f"  Created: {q_data['id']}")
            
            await db.commit()
            print("\n✅ Questions imported successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Error importing questions: {e}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(import_questions())
