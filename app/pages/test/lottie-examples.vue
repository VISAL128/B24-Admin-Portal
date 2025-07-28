<template>
  <div class="space-y-8 p-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('Lottie Animation Examples') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('Examples of how to use the LottieJson component') }}
      </p>
    </div>

    <!-- Example with JSON data -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t('Animation from JSON Data') }}</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('Load animation from a JSON object directly') }}
        </p>

        <LottieJson
          :animation-data="sampleAnimationData"
          width="200px"
          height="200px"
          :loop="true"
          :autoplay="true"
          class="border border-gray-200 dark:border-gray-700 rounded-lg"
          @ready="onAnimationReady"
          @complete="onAnimationComplete"
          @error="onAnimationError"
        />

        <div class="flex gap-2">
          <UButton size="sm" variant="outline" @click="playAnimation">
            <UIcon name="i-lucide-play" class="mr-1" />
            {{ t('Play') }}
          </UButton>
          <UButton size="sm" variant="outline" @click="pauseAnimation">
            <UIcon name="i-lucide-pause" class="mr-1" />
            {{ t('Pause') }}
          </UButton>
          <UButton size="sm" variant="outline" @click="stopAnimation">
            <UIcon name="i-lucide-stop-circle" class="mr-1" />
            {{ t('Stop') }}
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Example with external file -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t('Animation from External File') }}</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('Load animation from an external JSON file') }}
        </p>

        <LottieJson
          path="/animations/sample-animation.json"
          width="200px"
          height="200px"
          :loop="false"
          :autoplay="false"
          renderer="svg"
          class="border border-gray-200 dark:border-gray-700 rounded-lg"
        />

        <UAlert
          icon="i-lucide-info"
          color="info"
          variant="soft"
          title="Note"
          description="Place your Lottie JSON files in the public/animations/ directory"
        />
      </div>
    </UCard>

    <!-- Responsive example -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t('Responsive Animation') }}</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('Animation that adapts to container size') }}
        </p>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <LottieJson
            :animation-data="sampleAnimationData"
            width="100%"
            height="150px"
            :loop="true"
            :autoplay="true"
            :speed="0.5"
            class="w-full"
          />
        </div>
      </div>
    </UCard>

    <!-- Usage code example -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t('Usage Examples') }}</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('Code examples for using the LottieJson component') }}
        </p>

        <UTabs :items="codeExamples" class="w-full">
          <template #item="{ item }">
            <pre
              class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
            ><code>{{ item.content }}</code></pre>
          </template>
        </UTabs>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '#i18n'

const { t } = useI18n()

definePageMeta({
  title: 'Lottie Animation Examples',
})

// Sample animation data (simple loading spinner)
const sampleAnimationData = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Simple Spinner',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
            { t: 59, s: [360] },
          ],
        },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [60, 60] },
              p: { a: 0, k: [0, 0] },
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.2, 0.5, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 8 },
              lc: 2,
              lj: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
}

// Reference to animation instance
const animationRef = ref()

// Animation control methods
const playAnimation = () => {
  animationRef.value?.play()
}

const pauseAnimation = () => {
  animationRef.value?.pause()
}

const stopAnimation = () => {
  animationRef.value?.stop()
}

// Event handlers
const onAnimationReady = (animation: unknown) => {
  console.log('Animation ready:', animation)
  animationRef.value = animation
}

const onAnimationComplete = () => {
  console.log('Animation completed')
  useNotification().showSuccess({
    title: 'Animation Complete',
    description: 'The Lottie animation has finished playing.',
  })
}

const onAnimationError = (error: Error) => {
  console.error('Animation error:', error)
  useNotification().showError({
    title: 'Animation Error',
    description: error.message,
  })
}

// Code examples for documentation
const codeExamples = [
  {
    label: 'Basic Usage',
    content: `<LottieJson
  :animation-data="animationData"
  width="200px"
  height="200px"
  :loop="true"
  :autoplay="true"
/>`,
  },
  {
    label: 'External File',
    content: `<LottieJson
  path="/animations/my-animation.json"
  width="100%"
  height="300px"
  :loop="false"
  renderer="svg"
/>`,
  },
  {
    label: 'With Events',
    content: `<LottieJson
  :animation-data="animationData"
  width="200px"
  height="200px"
  @ready="onReady"
  @complete="onComplete"
  @error="onError"
/>`,
  },
  {
    label: 'Control Methods',
    content: `// Get reference to component
const lottieRef = ref()

// Control methods
lottieRef.value?.play()
lottieRef.value?.pause()
lottieRef.value?.stop()
lottieRef.value?.setSpeed(2)
lottieRef.value?.goToAndPlay(30)`,
  },
]
</script>
