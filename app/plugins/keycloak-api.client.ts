// export default defineNuxtPlugin(() => {
//   const config = useRuntimeConfig()

//   // Create API instance with automatic token handling
//   const api = $fetch.create({
//     baseURL: config.public.keycloakUrl,
//     onRequest({ options }) {
//       // Get auth state safely
//       try {
//         const { getToken, isAuthenticated } = useAuth()
        
//         // Only add token if user is authenticated
//         if (isAuthenticated.value) {
//           const token = getToken()
//           if (token) {
//             // Use Headers constructor to properly handle headers
//             const headers = new Headers(options.headers)
//             headers.set('Authorization', `Bearer ${token}`)
//             options.headers = headers
//           }
//         }
//       } catch (error) {
//         // Ignore auth errors during API setup
//         console.debug('Auth not available during API request setup:', error)
//       }
//     },
//     onResponseError({ response }) {
//       // Handle 401 responses
//       if (response.status === 401) {
//         try {
//           const { refreshAuthToken, isAuthenticated } = useAuth()
          
//           if (isAuthenticated.value) {
//             console.log('Received 401, attempting token refresh...')
//             // Try to refresh token
//             refreshAuthToken().catch((error) => {
//               console.error('Token refresh failed on API error:', error)
//             })
//           }
//         } catch (error) {
//           console.debug('Auth not available during error handling:', error)
//         }
//       }
//     }
//   })

//   // Create a secured API instance for admin operations
//   const adminApi = $fetch.create({
//     baseURL: config.public.keycloakUrl + `/admin/realms/${config.public.keycloakRealm}`,
//     onRequest({ options }) {
//       try {
//         const { getToken } = useAuth()
//         const token = getToken()
        
//         if (token) {
//           // Use Headers constructor to properly handle headers
//           const headers = new Headers(options.headers)
//           headers.set('Authorization', `Bearer ${token}`)
//           headers.set('Content-Type', 'application/json')
//           options.headers = headers
//         } else {
//           throw new Error('No authentication token available for admin API')
//         }
//       } catch (error) {
//         console.error('Failed to setup admin API request:', error)
//         throw error
//       }
//     },
//     onResponseError({ response }) {
//       if (response.status === 401) {
//         try {
//           const { refreshAuthToken } = useAuth()
//           console.error('Admin API authentication failed')
//           refreshAuthToken()
//         } catch (error) {
//           console.debug('Auth not available during admin API error handling:', error)
//         }
//       }
//     }
//   })

//   return {
//     provide: {
//       api,
//       adminApi
//     }
//   }
// })