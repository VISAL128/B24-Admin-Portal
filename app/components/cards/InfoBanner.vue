<template>
  <div
    v-if="isVisible"
    class="flex items-center justify-between rounded-lg px-4 py-2"
    :class="[backgroundClasses, borderClasses, textClasses]"
  >
    <div class="flex items-center space-x-2">
      <UIcon :name="icon" :class="iconClasses" />
      <span class="font-semibold text-xs">{{ title }}</span>
      <span class="text-xs" v-html="message"></span>
    </div>
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-x-mark"
        variant="ghost"
        size="xs"
        :color="buttonColor"
        @click="isVisible = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  icon: {
    type: String,
    default: 'i-heroicons-light-bulb'
  },
  iconClasses: {
    type: String,
    default: 'text-warning w-4 h-4'
  },
  title: {
    type: String,
    default: 'Tip'
  },
  message: {
    type: String,
    default: 'Apply filters to reflect changes.'
  },
  backgroundClasses: {
    type: String,
    default: 'bg-gray-50 dark:bg-gray-800'
  },
  borderClasses: {
    type: String,
    default: 'border border-gray-200 dark:border-gray-700'
  },
  textClasses: {
    type: String,
    default: 'text-sm text-gray-700 dark:text-gray-200'
  },
  buttonColor: {
    type: String,
    default: 'primary'
  }
})

const isVisible = ref(true)
</script>