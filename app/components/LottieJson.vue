<template>
  <div ref="lottieContainer" :class="containerClass" :style="containerStyle">
    <!-- Fallback content if lottie-web is not available -->
    <div
      v-if="!lottieLoaded && !loading"
      class="flex flex-col items-center justify-center h-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
    >
      <UIcon name="i-lucide-play-circle" class="w-12 h-12 text-gray-400 mb-2" />
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
        {{ t('lottie.library_not_found') }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
        {{ t('lottie.install_instruction') }}
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-full">
      <UIcon name="i-lucide-loader-circle" class="animate-spin w-6 h-6 text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from '#i18n'

const { t } = useI18n()

// Define types for lottie without requiring the package
interface LottieAnimationItem {
  play: () => void
  pause: () => void
  stop: () => void
  destroy: () => void
  goToAndStop: (value: number, isFrame?: boolean) => void
  goToAndPlay: (value: number, isFrame?: boolean) => void
  setSpeed: (speed: number) => void
  setDirection: (direction: 1 | -1) => void
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void
  addEventListener: (event: string, callback: () => void) => void
}

interface LottieInstance {
  loadAnimation: (config: LottieConfig) => LottieAnimationItem
}

interface LottieConfig {
  container: HTMLElement
  renderer: 'svg' | 'canvas' | 'html'
  loop: boolean
  autoplay: boolean
  animationData?: object
  path?: string
  rendererSettings?: {
    preserveAspectRatio: string
  }
}

interface LottieJsonProps {
  /** Lottie animation data (JSON object) */
  animationData?: object | null
  /** Path to the Lottie JSON file */
  path?: string | null
  /** Animation width */
  width?: string | number
  /** Animation height */
  height?: string | number
  /** Whether to loop the animation */
  loop?: boolean
  /** Whether to autoplay the animation */
  autoplay?: boolean
  /** Animation speed (1 = normal speed) */
  speed?: number
  /** CSS classes for the container */
  class?: string | null
  /** Renderer type: 'svg', 'canvas', or 'html' */
  renderer?: 'svg' | 'canvas' | 'html'
  /** Whether to preserve aspect ratio */
  preserveAspectRatio?: boolean
}

const props = withDefaults(defineProps<LottieJsonProps>(), {
  animationData: null,
  path: null,
  loop: true,
  autoplay: true,
  speed: 1,
  class: null,
  renderer: 'svg',
  preserveAspectRatio: true,
  width: '100%',
  height: '100%',
})

const emit = defineEmits<{
  complete: []
  loopComplete: []
  enterFrame: []
  segmentStart: []
  ready: [animation: LottieAnimationItem]
  error: [error: Error]
}>()

const lottieContainer = ref<HTMLElement>()
const loading = ref(false)
const lottieLoaded = ref(false)
let animationInstance: LottieAnimationItem | null = null
let lottie: LottieInstance | null = null

// Computed styles
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const containerClass = computed(() => ['lottie-container', props.class])

// Load Lottie library dynamically
const loadLottie = async () => {
  loading.value = true
  try {
    // Try to import lottie-web - this will fail gracefully if not installed
    const lottieModule = await import('lottie-web' as string).catch(() => null)
    if (lottieModule) {
      lottie = lottieModule.default as LottieInstance
      lottieLoaded.value = true
      return true
    } else {
      console.warn('lottie-web package not found. Please install it: npm install lottie-web')
      lottieLoaded.value = false
      return false
    }
  } catch (error) {
    console.error('Failed to load lottie-web:', error)
    lottieLoaded.value = false
    emit('error', new Error('Failed to load lottie-web library'))
    return false
  } finally {
    loading.value = false
  }
}

// Initialize animation
const initAnimation = async () => {
  if (!lottieContainer.value || !lottie) return

  // Clean up previous animation
  destroyAnimation()

  try {
    const config: LottieConfig = {
      container: lottieContainer.value,
      renderer: props.renderer,
      loop: props.loop,
      autoplay: props.autoplay,
      rendererSettings: {
        preserveAspectRatio: props.preserveAspectRatio ? 'xMidYMid meet' : 'none',
      },
    }

    // Use either animationData or path
    if (props.animationData) {
      config.animationData = props.animationData
    } else if (props.path) {
      config.path = props.path
    } else {
      throw new Error('Either animationData or path must be provided')
    }

    animationInstance = lottie.loadAnimation(config)

    // Set speed
    if (props.speed !== 1) {
      animationInstance.setSpeed(props.speed)
    }

    // Add event listeners
    animationInstance.addEventListener('complete', () => emit('complete'))
    animationInstance.addEventListener('loopComplete', () => emit('loopComplete'))
    animationInstance.addEventListener('enterFrame', () => emit('enterFrame'))
    animationInstance.addEventListener('segmentStart', () => emit('segmentStart'))
    animationInstance.addEventListener('DOMLoaded', () => emit('ready', animationInstance!))

    emit('ready', animationInstance)
  } catch (error) {
    console.error('Failed to initialize Lottie animation:', error)
    emit('error', error instanceof Error ? error : new Error('Animation initialization failed'))
  }
}

// Destroy animation
const destroyAnimation = () => {
  if (animationInstance) {
    animationInstance.destroy()
    animationInstance = null
  }
}

// Public methods
const play = () => {
  animationInstance?.play()
}

const pause = () => {
  animationInstance?.pause()
}

const stop = () => {
  animationInstance?.stop()
}

const goToAndStop = (value: number, isFrame?: boolean) => {
  animationInstance?.goToAndStop(value, isFrame)
}

const goToAndPlay = (value: number, isFrame?: boolean) => {
  animationInstance?.goToAndPlay(value, isFrame)
}

const setSpeed = (speed: number) => {
  animationInstance?.setSpeed(speed)
}

const setDirection = (direction: 1 | -1) => {
  animationInstance?.setDirection(direction)
}

const playSegments = (segments: [number, number] | [number, number][], forceFlag?: boolean) => {
  animationInstance?.playSegments(segments, forceFlag)
}

// Expose methods
defineExpose({
  play,
  pause,
  stop,
  goToAndStop,
  goToAndPlay,
  setSpeed,
  setDirection,
  playSegments,
  animationInstance: computed(() => animationInstance),
})

// Watch for prop changes
watch(
  [() => props.animationData, () => props.path],
  () => {
    if (lottie) {
      initAnimation()
    }
  },
  { deep: true }
)

watch(
  () => props.speed,
  (newSpeed) => {
    if (animationInstance && newSpeed) {
      animationInstance.setSpeed(newSpeed)
    }
  }
)

// Lifecycle
onMounted(async () => {
  const loaded = await loadLottie()
  if (loaded) {
    initAnimation()
  }
})

onUnmounted(() => {
  destroyAnimation()
})
</script>

<style scoped>
.lottie-container {
  display: inline-block;
  overflow: hidden;
}

.lottie-container svg,
.lottie-container canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
