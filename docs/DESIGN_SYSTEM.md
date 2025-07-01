# Bill24 Design System Configuration

This document outlines how the Bill24 brand colors are integrated into the Nuxt UI design system.

## Overview

The Bill24 design system is configured using Nuxt UI's theming capabilities, implementing our brand colors through CSS variables and Tailwind CSS configuration.

## Files Modified

### 1. `app.config.ts`
```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'bill24-sky-blue',
      neutral: 'bill24-neutral'
    }
  }
})
```

### 2. `app/assets/css/main.css`
Contains all Bill24 color definitions and CSS variable overrides:

- **@theme directive**: Defines custom Bill24 color scales
- **:root**: Light mode color configuration
- **.dark**: Dark mode color configuration

### 3. `nuxt.config.ts`
```typescript
ui: {
  theme: {
    colors: [
      'primary',
      'secondary', 
      'success',
      'info',
      'warning',
      'error',
      'neutral',
      'bill24-sky-blue',
      'bill24-neutral'
    ]
  }
}
```

## Color System

### Primary Color: Sky Blue (#43B3DE)
- **Light mode**: `#43B3DE` (500 shade)
- **Dark mode**: `#5BC0E1` (400 shade for better contrast)

#### Full Scale:
- 50: `#EAF6FC` (lightest)
- 100: `#C8E7F5`
- 200: `#A3DAEF`
- 300: `#7FCDE8`
- 400: `#5BC0E1`
- 500: `#43B3DE` (primary)
- 600: `#369CB8`
- 700: `#2A7A92`
- 800: `#1E576C`
- 900: `#123446`
- 950: `#091A23` (darkest)

### Neutral Color: Based on Bill24 Black (#211e1f)
- **Light mode**: `#6B625B` (500 shade)
- **Dark mode**: Adaptive based on context

#### Full Scale:
- 50: `#F2EFEC` (lightest)
- 100: `#E5DFDA`
- 200: `#D0C8C1`
- 300: `#B2AAA3`
- 400: `#948B84`
- 500: `#6B625B` (neutral)
- 600: `#4E4641`
- 700: `#3A332E`
- 800: `#2A241F`
- 900: `#211e1f` (Bill24 black)
- 950: `#1A1716` (darkest)

## Design Tokens

### Light Mode
- **Background**: White (`#FFFFFF`)
- **Text**: Bill24 Black (`#211e1f`)
- **Borders**: Light neutral tones
- **Primary**: Sky Blue (`#43B3DE`)

### Dark Mode
- **Background**: Darkest neutral (`#1A1716`)
- **Text**: Light neutral (`#E5DFDA`)
- **Borders**: Dark neutral tones  
- **Primary**: Lighter sky blue (`#5BC0E1`) for better contrast

## Border Radius
- **Base radius**: `0.375rem` (6px) for modern, slightly rounded appearance

## Usage Examples

### Components
```vue
<template>
  <!-- Primary button with Bill24 sky blue -->
  <UButton color="primary">Primary Action</UButton>
  
  <!-- Neutral button -->
  <UButton color="neutral">Secondary Action</UButton>
  
  <!-- Custom Bill24 colors -->
  <UButton color="bill24-sky-blue">Custom Sky Blue</UButton>
</template>
```

### Classes
```vue
<template>
  <!-- Text colors -->
  <span class="text-primary">Primary text</span>
  <span class="text-neutral">Neutral text</span>
  
  <!-- Background colors -->
  <div class="bg-primary">Primary background</div>
  <div class="bg-muted">Muted background</div>
  
  <!-- Border colors -->
  <div class="border border-primary">Primary border</div>
</template>
```

## Accessibility

- High contrast ratios maintained between text and backgrounds
- Dark mode provides appropriate contrast adjustments
- Color choices follow WCAG 2.1 AA guidelines

## Implementation Notes

1. **CSS Variables**: All colors are defined as CSS variables for easy customization
2. **Tailwind Integration**: Colors are automatically available as Tailwind classes
3. **Component Props**: Use `color="primary"` or `color="neutral"` in Nuxt UI components
4. **Dark Mode**: Automatic switching with appropriate contrast adjustments
5. **Extensibility**: Easy to add new color variations by extending the theme

## Troubleshooting

If you encounter issues with the `@theme` directive:
1. Ensure you're using Nuxt UI v3.2.0 or higher
2. Check that Tailwind CSS v4 support is enabled
3. The configuration should work with both Tailwind CSS v3 and v4

For any styling issues, refer to the [Nuxt UI documentation](https://ui.nuxt.com/getting-started/theme) for additional customization options.
