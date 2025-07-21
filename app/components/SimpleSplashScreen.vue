<template>
  <div
    class="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#bfe9f9] to-white transition-all duration-500"
    :class="{ 'opacity-0': isFadingOut }"
  >
    <!-- Main Content - Centered -->
    <div class="flex-1 flex items-center justify-center">
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
              class="h-3 w-3 rounded-full bg-primary animate-bounce"
              :style="{ animationDelay: `${i * 0.2}s` }"
            />
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6 w-64 mx-auto">
          <div class="h-1 bg-[#211e1f]/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Progress Description -->
        <div class="mt-3 text-sm text-[#211e1f]/70 animate-fade-in">
          {{ t(`splash.progress.${currentStep}`) }}
        </div>
      </div>
    </div>

    <!-- Version Info - Fixed at Bottom -->
    <div class="flex flex-col flex-shrink-0 items-center justify-center pb-6">
      <span class="text-sm text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.powered_by') }}
        <ULink href="https://www.bill24.io">{{ t('splash.bill24') }}</ULink>
      </span>
      <div class="text-xs text-[#211e1f]/50 animate-fade-in delay-500">
        {{ t('splash.version') }} {{ config.public.appVersion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { t } = useI18n()
const { currentStep, progress: splashProgress } = useSplashScreen()
const isFadingOut = ref(false)
const isAnimating = ref(false)

// Use progress from composable
const progress = computed(() => splashProgress.value)

// Animation and timing logic
onMounted(() => {
  // Start logo animation
  setTimeout(() => {
    isAnimating.value = true
  }, 500)
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
