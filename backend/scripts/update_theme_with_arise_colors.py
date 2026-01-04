#!/usr/bin/env python3
"""
Script to update the active theme with ARISE brand colors.

This script updates the active theme (or TemplateTheme if none is active)
to include ARISE brand colors in the colors section.
Run this from the backend directory: python scripts/update_theme_with_arise_colors.py
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.core.database import get_db
from app.models.theme import Theme
from app.core.theme_defaults import DEFAULT_THEME_CONFIG


async def update_theme_with_arise_colors():
    """Update the active theme with ARISE brand colors."""
    print("=" * 70)
    print("Updating Theme with ARISE Brand Colors")
    print("=" * 70)
    
    try:
        async for db in get_db():
            # Get active theme or TemplateTheme (ID 32)
            result = await db.execute(select(Theme).where(Theme.is_active == True))
            active_theme = result.scalar_one_or_none()
            
            if not active_theme:
                # If no active theme, use TemplateTheme (ID 32)
                result = await db.execute(select(Theme).where(Theme.id == 32))
                active_theme = result.scalar_one_or_none()
                
                if not active_theme:
                    print("\n❌ No theme found (neither active nor TemplateTheme)")
                    print("   Creating TemplateTheme with ARISE colors...")
                    # Create TemplateTheme with default config (includes ARISE colors)
                    active_theme = Theme(
                        id=32,
                        name='TemplateTheme',
                        display_name='Template Theme',
                        description='Master theme that controls all components',
                        config=DEFAULT_THEME_CONFIG.copy(),
                        is_active=True,
                        created_by=1
                    )
                    db.add(active_theme)
                    await db.commit()
                    await db.refresh(active_theme)
                    print(f"✅ Created TemplateTheme (ID {active_theme.id}) with ARISE colors")
                    return
            
            print(f"\n📝 Updating theme: {active_theme.display_name} (ID: {active_theme.id})")
            
            # Get current config
            config = active_theme.config or {}
            
            # Ensure colors section exists
            if "colors" not in config:
                config["colors"] = {}
            
            # Add ARISE brand colors
            arise_colors = {
                "ariseDeepTeal": "#0A3A40",
                "ariseDeepTealAlt": "#1B5E6B",
                "ariseButtonPrimary": "#0F454D",
                "ariseButtonPrimaryHover": "#0d4148",
                "ariseGold": "#D4AF37",
                "ariseGoldAlt": "#F4B860",
                "ariseDarkGray": "#2e2e2e",
                "ariseLightBeige": "#F5F5DC",
                "ariseBeige": "#E9E4D4",
                "ariseTextDark": "#1a202c",
                "ariseTextLight": "#ffffff"
            }
            
            # Merge ARISE colors (don't override existing ones if they exist)
            colors_added = []
            colors_updated = []
            
            for key, value in arise_colors.items():
                if key not in config["colors"]:
                    config["colors"][key] = value
                    colors_added.append(key)
                elif config["colors"][key] != value:
                    config["colors"][key] = value
                    colors_updated.append(key)
            
            # Update theme config
            active_theme.config = config
            await db.commit()
            await db.refresh(active_theme)
            
            print(f"\n✅ Theme updated successfully!")
            if colors_added:
                print(f"   Added {len(colors_added)} ARISE color(s): {', '.join(colors_added)}")
            if colors_updated:
                print(f"   Updated {len(colors_updated)} ARISE color(s): {', '.join(colors_updated)}")
            if not colors_added and not colors_updated:
                print(f"   All ARISE colors were already present and up-to-date")
            
            print(f"\n🎨 ARISE Brand Colors in theme:")
            for key in sorted(arise_colors.keys()):
                value = config["colors"].get(key, "N/A")
                print(f"   - {key}: {value}")
            
            break  # Exit the async generator loop
        
    except Exception as e:
        print(f"\n❌ Error updating theme: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(update_theme_with_arise_colors())
