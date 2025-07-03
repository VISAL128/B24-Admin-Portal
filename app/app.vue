<template>
  <UApp>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
const { t, locale } = useI18n()
const { initializeLanguage } = useLanguage()
const colorMode = useColorMode()

// Initialize language and theme on app startup
onMounted(() => {
  initializeLanguage()
  
  // Initialize theme from stored preferences
  const storage = useStorage()
  const storedPreferences = storage.getItem('user-preferences')
  if (storedPreferences?.theme) {
    colorMode.preference = storedPreferences.theme
  }
})
</script>