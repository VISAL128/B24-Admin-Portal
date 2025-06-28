import type Keycloak from 'keycloak-js'

declare module '#app' {
  interface NuxtApp {
    $keycloak: Keycloak
    $isAuthenticated: Ref<boolean>
    $isKeycloakInitialized: Ref<boolean>
    $keycloakInitError: Ref<string | null>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $keycloak: Keycloak
    $isAuthenticated: Ref<boolean>
    $isKeycloakInitialized: Ref<boolean>
    $keycloakInitError: Ref<string | null>
  }
}

export {}