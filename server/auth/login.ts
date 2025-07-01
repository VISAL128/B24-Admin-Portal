/**
 * Login API endpoint for the Bill24 Admin Portal
 * 
 * This endpoint handles the login initialization by:
 * 1. Constructing the proper Keycloak authorization URL
 * 2. Including the redirect URL for post-login navigation
 * 3. Redirecting the user to Keycloak for authentication
 */

export default defineEventHandler(async (event) => {
  try {
    console.log('🔐 [LOGIN]: Processing login request...')
    
    const query = getQuery(event)
    // Ensure redirectUrl is always a string
    const redirectRaw = query.redirect
    const redirectUrl = typeof redirectRaw === 'string'
      ? redirectRaw
      : redirectRaw != null
        ? String(redirectRaw)
        : '/'
    
    // Get OIDC configuration
    const { op } = useRuntimeConfig().openidConnect
    
    // Generate state parameter for security
    const state = generateRandomString(32)
    
    // Store state and redirect URL in cookie for callback validation
    setCookie(event, 'oidc_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutes
    })
    
    setCookie(event, 'oidc_redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutes
    })
    
    // Construct Keycloak authorization URL
    const authUrl = new URL(`${op.issuer}/protocol/openid-connect/auth`)
    
    authUrl.searchParams.set('client_id', op.clientId)
    authUrl.searchParams.set('redirect_uri', op.callbackUrl)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', op.scope.join(' '))
    authUrl.searchParams.set('state', state)
    
    console.log(`🔄 [LOGIN]: Redirecting to Keycloak: ${authUrl.toString()}`)
    
    // Redirect to Keycloak for authentication
    await sendRedirect(event, authUrl.toString(), 302)
    
  } catch (error) {
    console.error('❌ [LOGIN]: Login initialization failed:', error)
    
    // Fallback: redirect to auth error page
    await sendRedirect(event, '/auth-error?error=login_failed', 302)
  }
})

/**
 * Generate a random string for state parameter
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return result
}
