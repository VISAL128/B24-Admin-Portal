/**
 * Logout API endpoint for the Bill24 Admin Portal
 * 
 * This endpoint handles the logout process by:
 * 1. Clearing all OIDC cookies and session data
 * 2. Redirecting to Keycloak logout URL 
 * 3. Keycloak will then redirect back to the specified redirect URL
 */

export default defineEventHandler(async (event) => {
  try {
    console.log('🚪 [LOGOUT]: Processing logout request...')
    
    const query = getQuery(event)
    const redirectUrl = query.redirect || '/get-started'
    
    // Get OIDC configuration
    const { config } = useRuntimeConfig().openidConnect
    
    // Clear all OIDC cookies
    const cookiesToClear = [
      config.secret,
      config.cookiePrefix + 'access_token',
      config.cookiePrefix + 'refresh_token',
      config.cookiePrefix + 'user_info',
      config.cookiePrefix + 'id_token'
    ]
    
    cookiesToClear.forEach(cookieName => {
      deleteCookie(event, cookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })
    
    // Clear any additional auth cookies
    const cookie = config.cookie
    if (cookie) {
      for (const [key] of Object.entries(cookie)) {
        deleteCookie(event, config.cookiePrefix + key)
      }
    }
    
    console.log('✅ [LOGOUT]: All authentication cookies cleared')
    
    // Construct Keycloak logout URL
    const { op } = useRuntimeConfig().openidConnect
    const keycloakLogoutUrl = `${op.issuer}/protocol/openid-connect/logout`
    
    // Add redirect parameter to bring user back to our app
    const fullRedirectUrl = `${process.env.BASE_URL || 'http://localhost:3000'}${redirectUrl}`
    const logoutUrlWithRedirect = `${keycloakLogoutUrl}?redirect_uri=${encodeURIComponent(fullRedirectUrl)}`
    
    console.log(`🔄 [LOGOUT]: Redirecting to Keycloak logout: ${logoutUrlWithRedirect}`)
    
    // Redirect to Keycloak logout, which will then redirect back to our app
    await sendRedirect(event, logoutUrlWithRedirect, 302)
    
  } catch (error) {
    console.error('❌ [LOGOUT]: Logout failed:', error)
    
    // Fallback: redirect to get-started page even if logout process fails
    await sendRedirect(event, '/get-started', 302)
  }
})
