# UnderDevelopment Component

A reusable Vue component to display when a page or feature is under development. This component follows the Bill24 design guidelines and provides a professional way to communicate that a feature is being worked on.

## Features

- 🎨 Follows Bill24 color scheme with gradient background
- 🌐 Multi-language support (English and Khmer)
- 🔄 Animated loading indicators
- 📱 Responsive design
- ⬅️ Optional back navigation
- ✨ Beautiful UI with decorative elements

## Usage

### Basic Usage

```vue
<template>
  <UnderDevelopment />
</template>
```

### Without Back Button

```vue
<template>
  <UnderDevelopment :show-back-button="false" />
</template>
```

### In a Full Page

```vue
<template>
  <div class="min-h-screen bg-[#f4ece3] flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <UnderDevelopment />
    </div>
  </div>
</template>
```

## Props

| Prop             | Type      | Default | Description                                                             |
| ---------------- | --------- | ------- | ----------------------------------------------------------------------- |
| `showBackButton` | `boolean` | `true`  | Whether to show the back navigation button                              |
| `customMessage`  | `string`  | `''`    | Custom message (currently not implemented but available for future use) |

## Translations

The component uses the following translation keys:

### English (`en.json`)

```json
{
  "underDevelopment": {
    "title": "Under Development",
    "description": "This feature is currently being developed and will be available soon.",
    "workingOnIt": "We're working on it...",
    "goBack": "Go Back"
  }
}
```

### Khmer (`km.json`)

```json
{
  "underDevelopment": {
    "title": "កំពុងអភិវឌ្ឍ",
    "description": "មុខងារនេះកំពុងត្រូវបានអភិវឌ្ឍ និងនឹងអាចប្រើប្រាស់ឆាប់ៗនេះ។",
    "workingOnIt": "យើងកំពុងធ្វើការលើវា...",
    "goBack": "ត្រឡប់ក្រោយ"
  }
}
```

## Design

The component uses the Bill24 design system:

- **Primary Color**: Sky Blue (`#43B3DE`) for the gradient background
- **Secondary Color**: White (`#FFFFFF`) for text and button
- **Background**: Gradient from `#43B3DE` to `#FFFFFF`
- **Typography**: Uses system fonts with proper hierarchy
- **Animation**: Subtle bounce animations for the loading dots

## Navigation

The back button functionality:

- Uses Vue Router to navigate back in history
- Falls back to home page (`/`) if no history exists
- Can be disabled with `show-back-button="false"`

## Accessibility

- Proper color contrast for text readability
- Semantic HTML structure
- Keyboard navigation support for the back button
- Screen reader friendly content

## Example Pages

You can see examples of the component in action at:

- `/test/under-development` - Demo page showing different variations

## File Location

- Component: `app/components/UnderDevelopment.vue`
- Demo Page: `app/pages/test/under-development.vue`
- Translations:
  - `i18n/locales/en.json`
  - `i18n/locales/km.json`
