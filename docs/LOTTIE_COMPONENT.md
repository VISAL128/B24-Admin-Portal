# LottieJson Component

A Vue 3 component for displaying Lottie animations in the Bill24 Management Portal.

## Features

- 🎨 Display Lottie animations from JSON data or external files
- 🎮 Full animation control (play, pause, stop, speed, etc.)
- 📱 Responsive design with customizable dimensions
- 🔄 Support for looping and autoplay
- 🎯 Multiple renderer options (SVG, Canvas, HTML)
- 🌐 Internationalization support
- ⚡ Dynamic loading with graceful fallback
- 📦 TypeScript support

## Installation

First, install the required lottie-web dependency:

```bash
npm install lottie-web
# or
yarn add lottie-web
# or
pnpm add lottie-web
```

## Basic Usage

### With Animation Data

```vue
<template>
  <LottieJson
    :animation-data="myAnimationData"
    width="200px"
    height="200px"
    :loop="true"
    :autoplay="true"
  />
</template>

<script setup>
import { ref } from 'vue'

const myAnimationData = ref({
  // Your Lottie JSON animation data here
})
</script>
```

### With External File

```vue
<template>
  <LottieJson
    path="/animations/my-animation.json"
    width="300px"
    height="300px"
    :loop="false"
    :autoplay="true"
  />
</template>
```

## Props

| Prop                  | Type                          | Default  | Description                       |
| --------------------- | ----------------------------- | -------- | --------------------------------- |
| `animationData`       | `object \| null`              | `null`   | Lottie animation JSON data        |
| `path`                | `string \| null`              | `null`   | Path to external Lottie JSON file |
| `width`               | `string \| number`            | `'100%'` | Animation width                   |
| `height`              | `string \| number`            | `'100%'` | Animation height                  |
| `loop`                | `boolean`                     | `true`   | Whether to loop the animation     |
| `autoplay`            | `boolean`                     | `true`   | Whether to autoplay the animation |
| `speed`               | `number`                      | `1`      | Animation speed (1 = normal)      |
| `class`               | `string \| null`              | `null`   | CSS classes for container         |
| `renderer`            | `'svg' \| 'canvas' \| 'html'` | `'svg'`  | Renderer type                     |
| `preserveAspectRatio` | `boolean`                     | `true`   | Whether to preserve aspect ratio  |

## Events

| Event          | Payload                          | Description                    |
| -------------- | -------------------------------- | ------------------------------ |
| `ready`        | `animation: LottieAnimationItem` | Fired when animation is ready  |
| `complete`     | -                                | Fired when animation completes |
| `loopComplete` | -                                | Fired when a loop completes    |
| `enterFrame`   | -                                | Fired on each frame            |
| `segmentStart` | -                                | Fired when segment starts      |
| `error`        | `error: Error`                   | Fired when an error occurs     |

## Methods

You can access these methods using a template ref:

```vue
<template>
  <LottieJson ref="lottieRef" :animation-data="animationData" />
  <button @click="playAnimation">Play</button>
</template>

<script setup>
import { ref } from 'vue'

const lottieRef = ref()

const playAnimation = () => {
  lottieRef.value?.play()
}
</script>
```

### Available Methods

- `play()` - Play the animation
- `pause()` - Pause the animation
- `stop()` - Stop the animation
- `goToAndStop(value, isFrame?)` - Go to frame/time and stop
- `goToAndPlay(value, isFrame?)` - Go to frame/time and play
- `setSpeed(speed)` - Set animation speed
- `setDirection(direction)` - Set direction (1 or -1)
- `playSegments(segments, forceFlag?)` - Play specific segments

## Examples

### Animation Control

```vue
<template>
  <div>
    <LottieJson
      ref="lottieRef"
      :animation-data="animationData"
      width="200px"
      height="200px"
      :autoplay="false"
      @ready="onReady"
      @complete="onComplete"
    />

    <div class="controls">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="stop">Stop</button>
      <button @click="setSpeed(2)">2x Speed</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lottieRef = ref()
const animationData = ref(/* your animation data */)

const play = () => lottieRef.value?.play()
const pause = () => lottieRef.value?.pause()
const stop = () => lottieRef.value?.stop()
const setSpeed = (speed) => lottieRef.value?.setSpeed(speed)

const onReady = (animation) => {
  console.log('Animation ready:', animation)
}

const onComplete = () => {
  console.log('Animation completed')
}
</script>
```

### Responsive Animation

```vue
<template>
  <div class="container">
    <LottieJson
      :animation-data="animationData"
      width="100%"
      height="300px"
      :loop="true"
      :autoplay="true"
      class="responsive-animation"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
}

.responsive-animation {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
</style>
```

## Fallback Behavior

If the `lottie-web` package is not installed, the component will display a helpful fallback message with installation instructions. This ensures graceful degradation.

## File Organization

Place your Lottie JSON files in the `public/animations/` directory:

```
public/
  animations/
    loading-spinner.json
    success-checkmark.json
    error-animation.json
```

Then reference them in your component:

```vue
<LottieJson path="/animations/loading-spinner.json" />
```

## TypeScript Support

The component is fully typed and provides excellent TypeScript support:

```typescript
import type { LottieAnimationItem } from './path/to/LottieJson.vue'

const handleReady = (animation: LottieAnimationItem) => {
  // Full type safety
  animation.play()
  animation.setSpeed(1.5)
}
```

## Troubleshooting

### Animation Not Showing

1. **Check lottie-web installation**: Make sure `lottie-web` is installed
2. **Verify animation data**: Ensure your JSON data is valid Lottie format
3. **Check file paths**: Verify external file paths are correct
4. **Container size**: Ensure the container has explicit dimensions

### Performance Tips

1. **Use SVG renderer** for better performance and quality
2. **Optimize JSON files** using Lottie optimization tools
3. **Use external files** instead of inline data for large animations
4. **Implement lazy loading** for animations not immediately visible

## Browser Support

The component supports all modern browsers that support:

- ES6 modules
- Dynamic imports
- SVG/Canvas rendering

## Contributing

When contributing to the LottieJson component, please:

1. Follow the project's TypeScript and Vue 3 conventions
2. Add appropriate translations to both `en.json` and `km.json`
3. Test with and without the `lottie-web` package installed
4. Update this documentation for any new features
