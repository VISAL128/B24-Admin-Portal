# Splash Screen Implementation

This document describes the splash screen implementation for the Bill24 Admin Portal.

## Overview

The splash screen provides a branded loading experience while the application initializes. It follows the Bill24 color scheme and branding guidelines.

## Components

### 1. SplashScreen.vue
The main splash screen component with full branding and animations.

**Features:**
- Bill24 logo animation
- Gradient background using brand colors
- Loading progress bar
- Animated text and elements
- Multi-language support (English/Khmer)
- Configurable duration

**Props:**
- `minDuration` (default: 2000ms) - Minimum display time
- `maxDuration` (default: 5000ms) - Maximum display time before force hide

**Events:**
- `complete` - Emitted when splash screen is ready to hide

### 2. SimpleSplashScreen.vue
A minimal splash screen for faster loading scenarios.

**Features:**
- Simple logo display
- Basic loading animation
- Shorter duration
- Lightweight implementation

**Props:**
- `duration` (default: 1500ms) - Display duration

## Composables

### useSplashScreen.ts
Manages splash screen state and app readiness checks.

**Methods:**
- `setAppReady()` - Mark app as ready
- `onSplashComplete()` - Handle splash completion
- `hideSplashScreen()` - Manually hide splash
- `checkAppReadiness()` - Check if app is ready to show

**State:**
- `isAppReady` - Boolean indicating app readiness
- `showSplash` - Boolean controlling splash visibility

## Integration

The splash screen is integrated into `app.vue` and will show automatically on app startup. It waits for:

1. Language initialization
2. Theme preferences loading
3. Authentication state check
4. Other app readiness checks

## Customization

### Colors
The splash screen uses Bill24 brand colors:
- Primary: `#43B3DE` (Sky Blue)
- Background: Gradient from Sky Blue to White
- Text: `#211e1f` (Bill24 Black)

### Duration
You can customize the splash screen duration by modifying the props in `app.vue`:

```vue
<SplashScreen 
  @complete="onSplashComplete"
  :min-duration="3000"
  :max-duration="6000"
/>
```

### Animations
Animations can be customized in the component's `<style>` section or by modifying the CSS classes.

## Translations

The splash screen supports multiple languages through the i18n system:

**English (en.json):**
```json
"splash": {
  "title": "Bill24 Admin Portal",
  "subtitle": "Management & Settlement Platform",
  "loading": "Initializing...",
  "version": "Version"
}
```

**Khmer (km.json):**
```json
"splash": {
  "title": "Bill24 វិបផតថលគ្រប់គ្រង",
  "subtitle": "វេទិកាគ្រប់គ្រង និងទូទាត់ការបង់ប្រាក់",
  "loading": "កំពុងចាប់ផ្តើម...",
  "version": "កំណែ"
}
```

## Plugin

The `splash-screen.client.ts` plugin provides global configuration for the splash screen system.

## Best Practices

1. **Performance**: Keep splash screen duration reasonable (2-5 seconds)
2. **Accessibility**: Ensure animations don't cause motion sickness
3. **Branding**: Maintain consistent Bill24 visual identity
4. **Responsiveness**: Test on various screen sizes
5. **Loading States**: Use splash screen to mask expensive initialization operations

## Development

To test the splash screen:

1. Refresh the application
2. The splash screen should appear immediately
3. Check browser console for initialization logs
4. Verify smooth transition to main app

To modify splash behavior, edit the `useSplashScreen` composable or component props in `app.vue`.
