/**
 * Example usage of the generic useStorage composable
 */

// Example 2: Cache with expiration
export const useCache = <T = any>(defaultExpirationInSeconds: number = 3600) => {
  const storage = useStorage<T>()

  const set = (key: string, data: T, customExpirationInSeconds?: number) => {
    return storage.setItem(key, data, customExpirationInSeconds || defaultExpirationInSeconds)
  }

  const get = (key: string): T | null => {
    return storage.getItem(key)
  }

  const remove = (key: string) => {
    return storage.removeItem(key)
  }

  const clearAll = () => {
    return storage.clearItems()
  }

  const isValid = (key: string) => {
    return storage.hasValidItem(key)
  }

  return {
    set,
    get,
    remove,
    clearAll,
    isValid
  }
}

// Example 3: Session storage (short-lived data)
export const useSessionData = () => {
  interface SessionData {
    sessionId: string
    userId: string
    lastActivity: number
    permissions: string[]
  }

  const storage = useStorage<SessionData>()
  const SESSION_KEY = 'session-data'
  const SESSION_DURATION = 30 * 60 // 30 minutes

  const createSession = (sessionData: SessionData) => {
    return storage.setItem(SESSION_KEY, sessionData, SESSION_DURATION)
  }

  const getSession = (): SessionData | null => {
    return storage.getItem(SESSION_KEY)
  }

  const updateLastActivity = () => {
    return storage.updateItem(SESSION_KEY, (currentSession) => {
      if (!currentSession) return null as any
      return {
        ...currentSession,
        lastActivity: Date.now()
      }
    }, SESSION_DURATION)
  }

  const destroySession = () => {
    return storage.removeItem(SESSION_KEY)
  }

  const isSessionValid = () => {
    return storage.hasValidItem(SESSION_KEY)
  }

  return {
    createSession,
    getSession,
    updateLastActivity,
    destroySession,
    isSessionValid
  }
}
