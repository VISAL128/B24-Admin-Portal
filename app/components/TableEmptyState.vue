<template>
  <div class="flex flex-col items-center justify-center py-10 text-gray-400">
    <UIcon name="i-lucide-database-off" class="text-4xl mb-2" />
    <div>{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: 'No data available.',
  },
});
</script>
