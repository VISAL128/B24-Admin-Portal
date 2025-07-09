<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#43B3DE] to-white transition-all duration-500"
    :class="{ 'opacity-0': isFadingOut }"
  >
    <div class="text-center">
      <!-- Logo Section -->
      <div class="mb-8 animate-pulse">
        <img
          src="/images/Bill24 logo.png"
          alt="Bill24 Logo"
          class="mx-auto h-20 w-auto transition-transform duration-1000 ease-out"
          :class="{ 'scale-110': isAnimating }"
        />
      </div>

      <!-- App Title -->
      <h1 class="mb-4 text-3xl font-bold text-[#211e1f] animate-fade-in-up">
        {{ t('splash.title') }}
      </h1>

      <!-- Subtitle -->
      <p class="mb-8 text-lg text-[#211e1f]/80 animate-fade-in-up delay-200">
        {{ t('splash.subtitle') }}
      </p>

      <!-- Loading Animation -->
      <div class="flex items-center justify-center space-x-2">
        <div class="flex space-x-1">
          <div
            v-for="i in 3"
            :key="i"
            class="h-3 w-3 rounded-full bg-[#43B3DE] animate-bounce"
            :style="{ animationDelay: `${i * 0.2}s` }"
          ></div>
        </div>
        <span class="ml-3 text-[#211e1f]/60 text-sm animate-fade-in">
          {{ t('splash.loading') }}
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="mt-6 w-64 mx-auto">
        <div class="h-1 bg-[#211e1f]/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#43B3DE] rounded-full transition-all duration-1000 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Version Info -->
      <div class="mt-8 text-xs text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.version') }} 1.0.0
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Props
interface Props {
  minDuration?: number
  maxDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  minDuration: 2000,
  maxDuration: 5000
})

// Reactive state
const isVisible = ref(true)
const isFadingOut = ref(false)
const isAnimating = ref(false)
const progress = ref(0)

// Emits
const emit = defineEmits<{
  complete: []
}>()

// Animation and timing logic
onMounted(() => {
  // Start logo animation
  setTimeout(() => {
    isAnimating.value = true
  }, 500)

  // Progress bar animation
  const progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += Math.random() * 20
      if (progress.value > 100) progress.value = 100
    } else {
      clearInterval(progressInterval)
    }
  }, 200)

  // Hide splash screen after minimum duration
  setTimeout(() => {
    hideSplashScreen()
  }, props.minDuration)

  // Force hide after maximum duration
  setTimeout(() => {
    if (isVisible.value) {
      hideSplashScreen()
    }
  }, props.maxDuration)
})

const hideSplashScreen = () => {
  progress.value = 100
  isFadingOut.value = true
  
  setTimeout(() => {
    isVisible.value = false
    emit('complete')
  }, 500)
}

// Expose method to manually hide splash screen
defineExpose({
  hideSplashScreen
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-500 {
  animation-delay: 0.5s;
}
</style>
