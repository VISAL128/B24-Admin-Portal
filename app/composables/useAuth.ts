/**
 * Authentication composable for Bill24 Payment Portal
 *
 * This composable provides a clean interface for authentication operations
 * using the nuxt-openid-connect module. It bridges the gap between the
 * OIDC module and the application's authentication needs.
 *
 * Key features:
 * - Reactive authentication state
 * - User information management
 * - Role-based access control
 * - Automatic token management via OIDC
 */

import type { SupplierProfile } from '~/models/supplier'

interface RealmAccess {
  roles: string[]
}

interface ResourceAccess {
  [resourceName: string]: {
    roles: string[]
  }
}

interface _KeycloakJwtPayload {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string[]
  sub: string
  typ: string
  azp: string
  sid: string
  acr: string
  'allowed-origins': string[]
  realm_access: RealmAccess
  resource_access: ResourceAccess
  scope: string
  active_org: ActiveOrg
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  picture?: string
  email: string
}

interface ActiveOrg {
  role: string[]
  name: string
  id: string
  attributes: Record<string, string>
}

interface UserInfo {
  sub?: string
  preferred_username?: string
  email?: string
  given_name?: string
  family_name?: string
  realm_access?: {
    roles: string[]
  }
  roles?: string[]
  picture?: string
  [key: string]: unknown
}

export const useAuth = () => {
  const oidc = useOidcAuth()
  const cookie = useCookie('profile')
  const { clearProfileData } = useProfileValidation()

  // Core reactive state - derive user directly from OIDC
  const user = computed(() => {
    if (!oidc.loggedIn || !oidc.user) return null
    return extractUserInfo()
  })

  const currentProfile = computed<SupplierProfile | null>(() => {
    if (!oidc.loggedIn || !cookie.value) return null
    return cookie.value as unknown as SupplierProfile
  })

  const hasValidProfile = computed(() => {
    return !!currentProfile.value && Object.keys(currentProfile.value).length > 0
  })

  // Save profile to cookie for persistence
  const setProfileToCookie = (profile: SupplierProfile) => {
    cookie.value = JSON.stringify(profile)
  }

  // Computed properties derived from OIDC state
  const isAuthenticated = computed(() => oidc.loggedIn)
  /**
   * Extract user information from OIDC user object
   */
  const extractUserInfo = (): UserInfo | null => {
    if (!oidc.user) return null

    const oidcUser = (oidc.user.value?.userInfo || oidc.user.value || {}) as UserInfo
    return {
      id: oidcUser.sub || '',
      username: oidcUser.preferred_username || oidcUser.email || '',
      email: oidcUser.email || '',
      firstName: oidcUser.given_name || '',
      lastName: oidcUser.family_name || '',
      fullName:
        `${oidcUser.given_name || ''} ${oidcUser.family_name || ''}`.trim() ||
        oidcUser.preferred_username ||
        oidcUser.email ||
        '',
      roles: ['admin'], //oidcUser.realm_access?.roles || oidcUser.roles || [],
      picture: oidcUser.picture || '',
    }
  }

  /**
   * Initiate login flow
   */
  const login = async (): Promise<void> => {
    try {
      oidc.login()
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  /**
   * Logout and clean up all authentication data
   */
  const logout = async (): Promise<void> => {
    try {
      // Clear profile data before logout using the dedicated method
      clearProfileData()
      // Perform OIDC logout
      await oidc.logout()

      // await navigateTo('/', { replace: true })
    } catch (error) {
      console.error('❌ Logout failed:', error)

      // Even if OIDC logout fails, ensure profile data is cleared
      try {
        clearProfileData()
      } catch (cleanupError) {
        console.error('❌ Failed to clear profile data during logout:', cleanupError)
      }

      throw error
    }
  }

  /**
   * Get current user information
   */
  const getUserInfo = (): UserInfo | null => {
    return user.value
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    const userInfo = getUserInfo()
    return userInfo?.roles?.includes(role) || false
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    const userInfo = getUserInfo()
    if (!userInfo?.roles) return false
    return roles.some((role) => userInfo.roles?.includes(role))
  }

  const getToken = (): string | null => {
    return oidc.user.value?.accessToken || null
  }

  // Watch for authentication state changes and sync to localStorage
  watch(
    () => [oidc, oidc.user],
    () => {
      // syncToLocalStorage()
    },
    { immediate: true, deep: true }
  )

  return {
    // State
    isAuthenticated,
    user: readonly(user),
    currentProfile: readonly(currentProfile),
    setProfileToCookie,
    hasValidProfile: readonly(hasValidProfile),

    // Methods
    login,
    logout,
    getUserInfo,
    hasRole,
    hasAnyRole,
    getToken,
  }
}
