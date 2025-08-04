<script setup lang="ts">
const props = defineProps<{
  retrying: boolean
  id: string | number
}>()

const emit = defineEmits<{
  (e: 'retry', id: string | number): void
}>()

const handleClick = () => {
  if (!props.retrying) {
    emit('retry', props.id)
  }
}
</script>


<template>
  <div class="relative inline-block group">
    <button
      class="inline-flex items-center justify-center w-6 h-6 rounded transition-colors"
      :class="retrying
        ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
        : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
      "
      :disabled="retrying"
      :title="retrying ? 'Retrying...' : 'Retry Push Back'"
      @click="handleClick"
    >
      <UIcon
        :name="retrying ? 'material-symbols:sync-outline' : 'material-symbols:send-outline'"
        :class="[
          'w-4 h-4',
          { 'animate-spin': retrying }
        ]"
      />
    </button>
  </div>
</template>
