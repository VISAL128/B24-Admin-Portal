<template>
  <div class="flex flex-col items-center justify-center text-gray-400 w-full">
    <div class="mb-1">
      <!-- Show external/local SVG if provided -->
      <img
        v-if="iconUrl"
        :src="iconUrl"
        alt="Empty icon"
        class="w-14 h-14 object-contain"
      >

      <!-- Show UIcon if no iconUrl -->
      <UIcon
        v-else
        :name="icon"
        class="text-4xl"
      />
    </div>
    <div class="text-center text-base">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">

defineProps({
  message: {
    type: String,
    default: () => useI18n().t('table.empty_state_message'),
  },
  icon: {
    type: String,
    default: 'i-lucide-database-off',
  },
  iconUrl: {
    type: String,
    default: '/images/svg/empty_box.svg',
  },
});
</script>
