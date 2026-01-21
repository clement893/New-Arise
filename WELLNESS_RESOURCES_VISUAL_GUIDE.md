# Wellness Assessment Resources - Visual Guide

## How Resources Appear in the Assessment

### Location
Resources appear between the question text and the answer scale, in a light gray box.

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  [Pillar Icon] PILLAR NAME                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Large Pillar Icon]                                │
│                                                     │
│  QUESTION TEXT HERE                                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📖 Resources for Proper Answering                  │
│                                                     │
│  🔗 Resource Title 1                                │
│  🔗 Resource Title 2 (if applicable)                │
│                                                     │
│  ℹ️ Click on each resource to open it in a new     │
│     window for easy reference while answering...    │
└─────────────────────────────────────────────────────┘
│                                                     │
│  [1] [2] [3] [4] [5] (Answer Scale)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Example: Avoidance of Risky Substances (Question 1)

```
┌─────────────────────────────────────────────────────┐
│  🚭 Avoidance of Risky Substances    Question 1/30  │
├─────────────────────────────────────────────────────┤
│                                                     │
│                     🚭                              │
│                                                     │
│  I avoid or limit my weekly alcohol consumption    │
│  to about 2 glasses per week                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📖 Resources for Proper Answering                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔗 CCSA Guidelines - Canadian Centre on      │  │
│  │    Substance Use and Addiction               │  │
│  │    (hover: underline + lighter color)        │  │
│  │                                              │  │
│  │ ℹ️ Click on each resource to open it in a   │  │
│  │    new window for easy reference...         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
│                                                     │
│  [Not at all 1/5] [Rarely 2/5] [Sometimes 3/5]     │
│  [Often 4/5] [Always 5/5]                           │
│                                                     │
│  ← Back                     0/30 responses    Next →│
└─────────────────────────────────────────────────────┘
```

## Example: Movement (Question 6)

```
┌─────────────────────────────────────────────────────┐
│  🏃 Movement                         Question 6/30  │
├─────────────────────────────────────────────────────┤
│                                                     │
│                     🏃                              │
│                                                     │
│  I am regularly active for at least                 │
│  150 min per week                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📖 Resources for Proper Answering                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔗 Movement Guidelines                       │  │
│  │    (hover: underline + lighter color)        │  │
│  │                                              │  │
│  │ ℹ️ Click on each resource to open it in a   │  │
│  │    new window for easy reference...         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
│                                                     │
│  [Not at all 1/5] [Rarely 2/5] [Sometimes 3/5]     │
│  [Often 4/5] [Always 5/5]                           │
│                                                     │
│  ← Back                     5/30 responses    Next →│
└─────────────────────────────────────────────────────┘
```

## Interactive Behavior

### Resource Link States

1. **Default State**
   - Color: ARISE Deep Teal (#0F4C56)
   - Icon: External link arrow
   - Cursor: Pointer

2. **Hover State**
   - Color: Lighter teal (80% opacity)
   - Text: Underlined
   - Cursor: Pointer

3. **Click Behavior**
   - Opens in new window
   - Window features: noopener, noreferrer
   - Original window remains on same question
   - User can reference resource while answering

### Resource Box States

1. **With Resources**
   - Light gray background
   - Border visible
   - Resources listed with links
   - Helper text at bottom

2. **Without Resources** (if any question had none)
   - Section not displayed
   - No empty space

## Color Palette

- **Background**: `bg-gray-50` (very light gray)
- **Border**: `border-gray-200` (light gray)
- **Text**: `text-gray-700` (dark gray)
- **Link Color**: `text-arise-deep-teal` (#0F4C56)
- **Link Hover**: `text-arise-deep-teal/80` (80% opacity)
- **Helper Text**: `text-gray-500 italic` (medium gray, italic)

## Accessibility Features

1. **Semantic HTML**
   - Proper heading hierarchy
   - Meaningful link text
   - ARIA labels where needed

2. **Keyboard Navigation**
   - All links are keyboard accessible
   - Tab order is logical
   - Focus indicators visible

3. **Screen Readers**
   - Descriptive link text
   - Helper text provides context
   - External link indicator

## Mobile Responsiveness

### On Mobile Devices
- Resources stack vertically
- Touch targets are large enough (min 44x44px)
- Links remain easily tappable
- Text remains readable at all sizes

### Breakpoints
- Mobile: Full width, stacked layout
- Tablet: Same as mobile
- Desktop: Constrained width, centered

## Example Code Snippet

### How to Add a New Resource

```typescript
{
  id: "wellness_q1",
  pillar: "Avoidance of Risky Substances",
  question: "Your question text here",
  resources: [
    {
      url: "https://example.com/resource",
      text: "Descriptive Resource Title"
    },
    // Add more resources as needed
  ]
}
```

### How Resources Render

```tsx
{currentQuestion.resources.map((resource, index) => (
  <a
    key={index}
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-arise-deep-teal hover:text-arise-deep-teal/80 hover:underline transition-colors cursor-pointer"
  >
    <ExternalLinkIcon />
    <span>{resource.text}</span>
  </a>
))}
```

## User Flow

1. User reads the question
2. User notices "Resources for Proper Answering" section
3. User clicks on a resource link
4. Resource opens in new window
5. User reads resource information
6. User returns to assessment window
7. User selects their answer based on resource information
8. User proceeds to next question

## Best Practices

### Resource Selection
- Choose authoritative sources
- Prefer government/health organization sites
- Ensure resources are current
- Verify all links work

### Resource Titles
- Be descriptive but concise
- Indicate what information user will find
- Use consistent naming conventions
- Avoid overly technical jargon

### Maintenance
- Periodically check all links
- Update resources as new information becomes available
- Monitor user feedback on resource usefulness
- Consider adding more resources if users request them
