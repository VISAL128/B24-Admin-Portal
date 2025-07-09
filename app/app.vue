<template>
  <UApp>
    <!-- Splash Screen -->
    <SplashScreen 
      v-if="showSplash" 
      @complete="onSplashComplete"
      :min-duration="2000"
      :max-duration="5000"
    />
    
    <!-- Main App Content -->
    <div v-show="!showSplash">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>
<script setup lang="ts">
const { t, locale } = useI18n()
const { initializeLanguage } = useLanguage()
const colorMode = useColorMode()

// Splash screen management
const { showSplash, onSplashComplete, checkAppReadiness } = useSplashScreen()

// Initialize language and theme on app startup
onMounted(async () => {
  initializeLanguage()
  
  // Initialize theme from stored preferences
  const storage = useStorage()
  const storedPreferences = storage.getItem('user-preferences')
  if (storedPreferences?.theme) {
    colorMode.preference = storedPreferences.theme
  }

  // Check app readiness for splash screen
  await checkAppReadiness()
})
</script>