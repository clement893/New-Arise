#!/usr/bin/env python3
"""
Script to ensure the active theme uses ARISE colors as primary colors.

This script:
1. Gets or creates the active theme (TemplateTheme if none exists)
2. Updates primary and secondary colors to ARISE colors
3. Ensures ARISE brand colors are present
4. Activates the theme

Run this from the backend directory: python scripts/ensure_arise_theme_active.py
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
from app.api.v1.endpoints.themes import ensure_default_theme


async def ensure_arise_theme_active():
    """Ensure the active theme uses ARISE colors."""
    print("=" * 70)
    print("Ensuring Active Theme Uses ARISE Colors")
    print("=" * 70)
    
    try:
        async for db in get_db():
            # Ensure TemplateTheme exists
            print("\n1. Ensuring TemplateTheme exists...")
            theme = await ensure_default_theme(db, created_by=1)
            print(f"   ✅ TemplateTheme ready (ID: {theme.id})")
            
            # Get the active theme (or TemplateTheme if none is active)
            result = await db.execute(select(Theme).where(Theme.is_active == True))
            active_theme = result.scalar_one_or_none()
            
            if not active_theme:
                # Activate TemplateTheme if no theme is active
                print("\n2. No active theme found, activating TemplateTheme...")
                template_result = await db.execute(select(Theme).where(Theme.id == 32))
                template_theme = template_result.scalar_one_or_none()
                
                if template_theme:
                    template_theme.is_active = True
                    await db.commit()
                    await db.refresh(template_theme)
                    active_theme = template_theme
                    print(f"   ✅ TemplateTheme activated (ID: {active_theme.id})")
                else:
                    # Create TemplateTheme if it doesn't exist
                    from app.core.theme_defaults import DEFAULT_THEME_CONFIG
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
                    print(f"   ✅ Created and activated TemplateTheme (ID: {active_theme.id})")
            else:
                print(f"\n2. Active theme found: {active_theme.display_name} (ID: {active_theme.id})")
            
            # Update theme with ARISE colors
            print("\n3. Updating theme with ARISE colors...")
            config = active_theme.config or {}
            
            # Update primary and secondary colors
            updates_made = []
            
            if config.get("primary_color") != "#0A3A40":
                config["primary_color"] = "#0A3A40"
                updates_made.append("primary_color -> ARISE deep teal")
            
            if config.get("secondary_color") != "#D4AF37":
                config["secondary_color"] = "#D4AF37"
                updates_made.append("secondary_color -> ARISE gold")
            
            # Update colors.primary and colors.secondary
            if "colors" not in config:
                config["colors"] = {}
            
            if config["colors"].get("primary") != "#0A3A40":
                config["colors"]["primary"] = "#0A3A40"
                updates_made.append("colors.primary -> ARISE deep teal")
            
            if config["colors"].get("secondary") != "#D4AF37":
                config["colors"]["secondary"] = "#D4AF37"
                updates_made.append("colors.secondary -> ARISE gold")
            
            # Update ring to match primary
            if config["colors"].get("ring") != "#0A3A40":
                config["colors"]["ring"] = "#0A3A40"
                updates_made.append("colors.ring -> ARISE deep teal")
            
            # Update textLink to match primary
            if "typography" not in config:
                config["typography"] = {}
            if config["typography"].get("textLink") != "#0A3A40":
                config["typography"]["textLink"] = "#0A3A40"
                updates_made.append("typography.textLink -> ARISE deep teal")
            
            # Ensure ARISE brand colors are present
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
            
            for key, value in arise_colors.items():
                if config["colors"].get(key) != value:
                    config["colors"][key] = value
                    updates_made.append(f"colors.{key} -> {value}")
            
            # Update theme config
            active_theme.config = config
            await db.commit()
            await db.refresh(active_theme)
            
            print(f"\n✅ Theme updated successfully!")
            if updates_made:
                print(f"   Made {len(updates_made)} update(s):")
                for update in updates_made:
                    print(f"   - {update}")
            else:
                print(f"   All colors were already up-to-date")
            
            print(f"\n🎨 Current Primary Colors:")
            print(f"   primary_color: {config.get('primary_color')}")
            print(f"   secondary_color: {config.get('secondary_color')}")
            print(f"   colors.primary: {config.get('colors', {}).get('primary')}")
            print(f"   colors.secondary: {config.get('colors', {}).get('secondary')}")
            
            print(f"\n✅ Theme '{active_theme.display_name}' (ID: {active_theme.id}) is active and uses ARISE colors!")
            
            break  # Exit the async generator loop
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(ensure_arise_theme_active())
