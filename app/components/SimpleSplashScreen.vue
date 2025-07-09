<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white"
    :class="{ 'opacity-0 transition-opacity duration-500': isFadingOut }"
  >
    <div class="text-center">
      <!-- Simple Logo -->
      <div class="mb-6">
        <img
          src="/images/Bill24 logo.png"
          alt="Bill24 Logo"
          class="mx-auto h-16 w-auto animate-pulse"
        />
      </div>

      <!-- Loading Text -->
      <p class="text-[#43B3DE] text-lg font-medium">
        {{ t('splash.loading') }}
      </p>

      <!-- Simple Loading Dots -->
      <div class="flex justify-center mt-4">
        <div class="flex space-x-1">
          <div
            v-for="i in 3"
            :key="i"
            class="h-2 w-2 rounded-full bg-[#43B3DE] animate-bounce"
            :style="{ animationDelay: `${i * 0.2}s` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Props
interface Props {
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1500
})

// Reactive state
const isVisible = ref(true)
const isFadingOut = ref(false)

// Emits
const emit = defineEmits<{
  complete: []
}>()

// Auto-hide after duration
onMounted(() => {
  setTimeout(() => {
    isFadingOut.value = true
    setTimeout(() => {
      isVisible.value = false
      emit('complete')
    }, 500)
  }, props.duration)
})

// Expose method to manually hide
defineExpose({
  hide: () => {
    isFadingOut.value = true
    setTimeout(() => {
      isVisible.value = false
      emit('complete')
    }, 500)
  }
})
</script>
