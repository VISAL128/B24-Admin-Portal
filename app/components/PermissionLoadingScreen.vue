<template>
  <div class="min-h-screen bg-gradient-to-b from-[#43B3DE] to-white flex items-center justify-center">
    <div class="text-center">
      <!-- Bill24 Logo -->
      <div class="mb-8">
        <img 
          src="/images/Bill24 logo.png" 
          alt="Bill24 Logo" 
          class="h-20 mx-auto mb-4"
        >
        <h1 class="text-2xl font-bold text-[#211e1f] mb-2">
          Bill24 Admin Portal
        </h1>
      </div>

      <!-- Loading Animation -->
      <div class="mb-6">
        <div class="w-16 h-16 border-4 border-[#43B3DE] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Loading Message -->
      <div class="space-y-2">
        <h2 class="text-lg font-medium text-[#211e1f]">
          {{ message }}
        </h2>
        <p class="text-gray-600 text-sm">
          Please wait while we verify your permissions...
        </p>
      </div>

      <!-- Progress Dots -->
      <div class="flex justify-center mt-6 space-x-2">
        <div 
          v-for="i in 3" 
          :key="i"
          :class="[
            'w-2 h-2 rounded-full transition-all duration-500',
            i <= currentStep ? 'bg-[#43B3DE]' : 'bg-gray-300'
          ]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Checking permissions...'
})

// Animated progress dots
const currentStep = ref(1)

onMounted(() => {
  const interval = setInterval(() => {
    currentStep.value = currentStep.value >= 3 ? 1 : currentStep.value + 1
  }, 500)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
