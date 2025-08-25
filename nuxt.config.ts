// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',
  debug: process.env.NODE_ENV === 'development',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxt/icon',
    'nuxt-charts',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'nuxt-oidc-auth',
    '@nuxt/eslint',
  ],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'km', name: 'Khmer', file: 'km.json' },
    ],
    // langDir: 'i18n/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en',
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Bill24 Payment Portal',
      meta: [{ name: 'description', content: 'Bill24 Payment Portal' }],
    },
  },
  oidc: {
    providers: {
      keycloak: {
        baseUrl:
          process.env.KEYCLOAK_URL + '/realms/' + process.env.KEYCLOAK_REALM ||
          'http://localhost:8080/realms/nuxt-oidc-test',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'b24-admin-portal',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'CLIENT_SECRET',
        redirectUri:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/auth/keycloak/callback'
            : process.env.KEYCLOAK_REDIRECT_URI ||
              'https://admin-staging.bill24.io/auth/keycloak/callback',
        exposeAccessToken: true,
        logoutRedirectUri:
          process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.BASE_URL,
        // pkce: true,
        additionalAuthParameters: {
          origin: 'b24',
        },
        sessionConfiguration: {
          singleSignOut: true,
        },
      },
    },
  },
  sourcemap: {
    server: true,
    client: true,
  },
  runtimeConfig: {
    managementApiUrl: process.env.MANAGEMENT_API_URL || 'https://managementapi-staging.bill24.io',
    pgwModuleApiUrl: process.env.PGW_MODULE_API_URL || 'https://staging.bill24.io:22043',
    mtcApiUrl: process.env.MTC_API_URL || 'https://mtc-stg.oone.bz',
    // Public runtime config
    public: {
      appVersion: process.env.APP_VERSION || 'v1.0.1',
      userProfileUrl:
        process.env.KEYCLOAK_URL + '/realms/' + process.env.KEYCLOAK_REALM + '/account' || '',
    },
  },
  // ssr: false, // Important: OIDC works better with SPA mode
  // UI Theme Configuration for Bill24
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'],
      transitions: true,
    },
  },
})
