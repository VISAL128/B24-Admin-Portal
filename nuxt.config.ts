// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/ui', '@nuxt/icon', 'nuxt-charts', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
   i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'km', name: 'Khmer', file: 'km.json' }
    ]
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Bill24 Admin Portal',
      meta: [
        { name: 'description', content: 'Bill24 Admin Portal' }
      ]
    },
  },
  runtimeConfig: {
    public: {
      keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      keycloakRealm: process.env.KEYCLOAK_REALM || 'your-realm',
      keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || 'your-client-id',
      appVersion: process.env.APP_VERSION || 'v1.0.0'
    }
  },
  ssr: false, // Important: Keycloak works better with SPA mode
  plugins: [
    { src: '~/plugins/keycloak.client.ts', mode: 'client' },
    { src: '~/plugins/keycloak-api.client.ts', mode: 'client' }
  ],
  // i18n config moved to i18n.config.ts
})