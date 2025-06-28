// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/ui', '@nuxt/icon', 'nuxt-charts'],
  app: {
    head: {
      title: 'Bill24 Admin Portal',
      meta: [
        { name: 'description', content: 'Bill24 Admin Portal' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
      // duration: 300
    }
  }
})