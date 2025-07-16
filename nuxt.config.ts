// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',
  debug: process.env.NODE_ENV === 'development',
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
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
      title: 'Bill24 Admin Portal',
      meta: [{ name: 'description', content: 'Bill24 Admin Portal' }],
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
        logoutRedirectUri: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
  },
  // openidConnect: {
  //   addPlugin: true,
  //   op: {
  //     issuer: process.env.KEYCLOAK_URL + "/realms/" + process.env.KEYCLOAK_REALM,
  //     clientId: process.env.KEYCLOAK_CLIENT_ID || "b24-admin-portal",
  //     clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "SECRET_KEY",
  //     callbackUrl: 'http://localhost:3000/oidc/callback', //process.env.KEYCLOAK_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/oidc/callback`,
  //     scope: ["openid", "email", "profile", "address"],
  //   },
  //   config: {
  //     debug: process.env.NODE_ENV === 'development',
  //     response_type: "code",
  //     secret: "oidc._sessionid",
  //     cookie: { loginName: "" },
  //     cookiePrefix: "oidc._",
  //     cookieEncrypt: true,
  //     cookieEncryptKey: process.env.KEYCLOAK_COOKIE_ENCRYPT_KEY || "bfnuxt9c2470cb477d907b1e0917oidc",
  //     cookieEncryptIV: process.env.KEYCLOAK_COOKIE_ENCRYPT_IV || "ab83667c72eec9e4",
  //     cookieEncryptALGO: process.env.KEYCLOAK_COOKIE_ENCRYPT_ALGO || "aes-256-cbc",
  //     cookieMaxAge: process.env.KEYCLOAK_COOKIE_MAX_AGE ? Number(process.env.KEYCLOAK_COOKIE_MAX_AGE) : 24 * 60 * 60,
  //     cookieFlags: {
  //       access_token: {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //       },
  //     },
  //   },},
  sourcemap: {
    server: true,
    client: true,
  },
  runtimeConfig: {
    management_api_url: process.env.MANAGEMENT_API_URL || 'https://managementapi-staging.bill24.io',
    pgw_module_api_url: process.env.PGW_MODULE_API_URL || 'https://staging.bill24.io:22043',
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
