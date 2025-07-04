<template>
  <div class="flex flex-col items-center justify-center" :class="containerClass">
    <!-- Spinner -->
    <div :class="spinnerClass" 
         class="border-4 border-t-transparent rounded-full animate-spin">
    </div>
    
    <!-- Loading text -->
    <p v-if="message" :class="textClass" class="mt-4 font-medium">
      {{ message || 'Loading...' }}
    </p>
    
    <!-- Optional description -->
    <p v-if="description" class="mt-2 text-sm text-gray-500 text-center max-w-sm">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullscreen: false
})

const containerClass = computed(() => {
  return props.fullscreen ? 'min-h-screen' : 'py-8'
})

const spinnerClass = computed(() => {
  const baseClasses = 'border-primary'
  
  switch (props.size) {
    case 'sm':
      return `${baseClasses} w-6 h-6`
    case 'lg':
      return `${baseClasses} w-16 h-16`
    default:
      return `${baseClasses} w-12 h-12`
  }
})

const textClass = computed(() => {
  const baseClasses = 'text-gray-700'
  
  switch (props.size) {
    case 'sm':
      return `${baseClasses} text-sm`
    case 'lg':
      return `${baseClasses} text-xl`
    default:
      return `${baseClasses} text-base`
  }
})
</script>
