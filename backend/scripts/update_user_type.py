"""
Script to update user_type for a user
Usage: python scripts/update_user_type.py <email> <user_type>
Example: python scripts/update_user_type.py admin@example.com ADMIN
"""

import asyncio
import sys
from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.user import User, UserType


async def update_user_type(email: str, user_type_str: str):
    """Update user_type for a user by email"""
    try:
        # Convert string to UserType enum
        user_type = UserType[user_type_str.upper()]
    except KeyError:
        print(f"Error: Invalid user_type '{user_type_str}'. Valid values: INDIVIDUAL, COACH, BUSINESS, ADMIN")
        return False
    
    async with async_session_maker() as db:
        try:
            # Find user by email
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print(f"Error: User with email '{email}' not found")
                return False
            
            # Update user_type
            user.user_type = user_type
            await db.commit()
            
            print(f"✅ Successfully updated user_type for {email} to {user_type.value}")
            return True
            
        except Exception as e:
            await db.rollback()
            print(f"Error updating user_type: {e}")
            return False


async def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/update_user_type.py <email> <user_type>")
        print("Example: python scripts/update_user_type.py admin@example.com ADMIN")
        print("Valid user_types: INDIVIDUAL, COACH, BUSINESS, ADMIN")
        sys.exit(1)
    
    email = sys.argv[1]
    user_type_str = sys.argv[2]
    
    success = await update_user_type(email, user_type_str)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
