/**
 * Splash Screen Plugin
 * Handles splash screen initialization and lifecycle
 */
export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!import.meta.client) return

  // Add any splash screen related global configuration here
  const splashConfig = {
    minDuration: 2000,
    maxDuration: 5000,
    enableAnimations: true
  }

  // Make splash config available globally if needed
  return {
    provide: {
      splashConfig
    }
  }
})
