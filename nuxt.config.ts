// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',
  debug: true,
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 3000
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxt/icon',
    'nuxt-charts',
    '@nuxtjs/tailwindcss',
    'nuxt-openid-connect',
    '@nuxtjs/i18n'
  ],
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
  openidConnect: {
    addPlugin: true,
    op: {
      issuer: process.env.KEYCLOAK_URL + "/realms/" + process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID || "b24-admin-portal",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "SECRET_KEY",
      callbackUrl: process.env.KEYCLOAK_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/get-started`,
      scope: ["openid", "email", "profile", "address"],
    },
    config: {
      debug: process.env.NODE_ENV === 'development',
      response_type: "code",
      secret: "oidc._sessionid",
      cookie: { loginName: "" },
      cookiePrefix: "oidc._",
      cookieEncrypt: true,
      cookieEncryptKey: process.env.KEYCLOAK_COOKIE_ENCRYPT_KEY || "bfnuxt9c2470cb477d907b1e0917oidc",
      cookieEncryptIV: process.env.KEYCLOAK_COOKIE_ENCRYPT_IV || "ab83667c72eec9e4",
      cookieEncryptALGO: process.env.KEYCLOAK_COOKIE_ENCRYPT_ALGO || "aes-256-cbc",
      cookieMaxAge: process.env.KEYCLOAK_COOKIE_MAX_AGE ? Number(process.env.KEYCLOAK_COOKIE_MAX_AGE) : 24 * 60 * 60,
      cookieFlags: {
        access_token: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },},
  sourcemap: {
    server: true,
    client: true
  },
  runtimeConfig: {
    // Server-side runtime config
    openidConnect: {
      op: {
        issuer: process.env.KEYCLOAK_URL + "/realms/" + process.env.KEYCLOAK_REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID || "b24-admin-portal",
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "SECRET_KEY",
        callbackUrl: process.env.KEYCLOAK_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/get-started`,
      },
      config: {
        cookieFlags: {
          access_token: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          }
        }
      }
    },
    // Public runtime config
    public: {
      appVersion: process.env.APP_VERSION || 'v1.0.0'
    }
  },
  ssr: false, // Important: OIDC works better with SPA mode
  plugins: [
    // { src: '~/plugins/keycloak.client.ts', mode: 'client' },
    // { src: '~/plugins/keycloak-api.client.ts', mode: 'client' }
  ],
  // i18n config moved to i18n.config.ts
  // build: {
  //   transpile: ['@nuxtjs/keycloak'],
  //   extend (config: any, ctx: any) {
  //       if (ctx.isDev) {
  //         config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
  //       }
  //   }
  // },
  // UI Theme Configuration for Bill24
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral'
      ]
    }
  },
})