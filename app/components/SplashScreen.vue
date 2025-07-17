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
          />
        </div>
        <!-- <span class="ml-3 text-[#211e1f]/60 text-sm animate-fade-in">
          {{ t('splash.loading') }}
        </span> -->
      </div>

      <!-- Progress Bar -->
      <div class="mt-6 w-64 mx-auto">
        <div class="h-1 bg-[#211e1f]/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#43B3DE] rounded-full transition-all duration-1000 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Progress Description -->
      <div class="mt-3 text-sm text-[#211e1f]/70 animate-fade-in">
        {{ t(`splash.progress.${currentStep}`) }}
      </div>

      <!-- Version Info -->
      <div class="mt-8 text-xs text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.version') }} {{ config.public.appVersion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { t } = useI18n()
const { checkAppReadiness, currentStep, progress: splashProgress, showSplash } = useSplashScreen()

// Reactive state
const isVisible = ref(true)
const isFadingOut = ref(false)
const isAnimating = ref(false)
const isAppReady = ref(false)

// Use progress from composable
const progress = computed(() => splashProgress.value)

// Watch for showSplash changes from composable
watch(showSplash, (newValue) => {
  if (!newValue) {
    hideSplashScreen()
  }
})

// Emits
const emit = defineEmits<{
  complete: []
}>()

// Check app readiness and handle completion
const checkAppReadinessWithProgress = async () => {
  try {
    // Check app readiness (progress is managed in the composable)
    const ready = await checkAppReadiness()

    if (ready) {
      isAppReady.value = true
      // Hide splash screen immediately when ready
      hideSplashScreen()
    }
    // If not ready, it means we were redirected to profile error page
    // No need to hide splash screen as we're navigating away
  } catch (error) {
    console.error('App readiness check failed:', error)
    // Error handling is done in the composable (redirect to profile-error)
  }
}

// Animation and timing logic
onMounted(() => {
  // Start logo animation
  setTimeout(() => {
    isAnimating.value = true
  }, 500)

  // Start app readiness check
  checkAppReadinessWithProgress()
})

const hideSplashScreen = () => {
  isFadingOut.value = true

  setTimeout(() => {
    isVisible.value = false
    emit('complete')
  }, 500)
}

// Expose method to manually hide splash screen
defineExpose({
  hideSplashScreen,
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
