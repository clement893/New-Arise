# Theme Showcase Pages

## Overview

This showcase demonstrates the flexibility of the theme system by presenting 5 completely different design styles, each using the same components but with different visual appearances.

## Pages Created

### Main Showcase Page
**Route**: `/components/theme-showcase`

A landing page that displays all 5 design styles with previews and links to individual design pages.

### Individual Design Pages
**Route**: `/components/theme-showcase/[style]`

Each design page showcases components styled according to a specific design aesthetic:

1. **Modern Minimal** (`/components/theme-showcase/modern-minimal`)
   - Clean, spacious design
   - Subtle colors and generous whitespace
   - Perfect for content-focused applications

2. **Glassmorphism** (`/components/theme-showcase/glassmorphism`)
   - Frosted glass effects with backdrop blur
   - Transparent backgrounds with layered depth
   - Modern and visually striking

3. **Neon Cyberpunk** (`/components/theme-showcase/neon-cyberpunk`)
   - Bold neon colors and glowing effects
   - High contrast, futuristic aesthetics
   - Eye-catching and high energy

4. **Corporate Professional** (`/components/theme-showcase/corporate-professional`)
   - Traditional business aesthetic
   - Structured layouts and professional colors
   - Clear hierarchy and formal typography

5. **Playful Colorful** (`/components/theme-showcase/playful-colorful`)
   - Vibrant, energetic design
   - Bold colors and playful interactions
   - Great for creative applications

## Components Demonstrated

Each design page showcases:

- **Buttons**: Primary, Secondary, Success, Danger variants
- **Cards**: Various card layouts and styles
- **Forms**: Input fields and form elements
- **Badges**: Different badge variants
- **Alerts**: Success and warning alerts
- **Interactive Components**: Dropdowns and Modals
- **Layout Components**: Stack layouts

## File Structure

```
apps/web/src/app/components/theme-showcase/
├── page.tsx                          # Main showcase page
├── ThemeShowcaseContent.tsx          # Main showcase content
└── [style]/
    ├── page.tsx                      # Dynamic route handler
    └── DesignStyleContent.tsx        # Individual design page content
```

## Usage

### Accessing the Showcase

1. Navigate to `/components/theme-showcase` to see all design styles
2. Click "View Design →" on any style card to see detailed examples
3. Use the navigation buttons at the bottom to switch between styles

### Customizing Styles

Each design page uses a `styleConfigs` object that defines:
- Title and description
- CSS classes for cards and buttons
- Background gradients
- Visual styling

To add a new design style:

1. Add a new entry to `styleConfigs` in `DesignStyleContent.tsx`
2. Add the style ID to the `validStyles` array in `[style]/page.tsx`
3. Add a preview card to `ThemeShowcaseContent.tsx`

## Technical Details

### Styling Approach

- Uses Tailwind CSS classes for styling
- Background gradients applied to page wrapper
- Card and button classes customized per style
- Maintains dark mode support

### Component Integration

- All components use the theme system
- Components automatically adapt to theme variables
- Effects (like glassmorphism) are applied when enabled
- Backward compatible with default themes

## Future Enhancements

Potential improvements:

1. **Theme Switching**: Allow users to apply a design style as their active theme
2. **More Styles**: Add additional design styles (e.g., Dark Mode, Light Mode, High Contrast)
3. **Interactive Theme Editor**: Let users customize colors/spacing in real-time
4. **Export Theme**: Allow exporting theme configuration as JSON
5. **Component Variants**: Show more component variants per style
6. **Responsive Examples**: Show how designs adapt to different screen sizes

## Notes

- All pages are client-side rendered for dynamic theming
- Pages use the existing layout components (PageHeader, PageContainer, Section)
- Navigation breadcrumbs are included for easy navigation
- Each design page includes a back button to return to the showcase
