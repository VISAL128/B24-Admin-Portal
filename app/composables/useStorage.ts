import type { StorageComposable } from '~/types/storage'

/**
 * Generic localStorage composable for managing any type of data with expiration support
 */
export const useStorage = <T = any>(): StorageComposable<T> => {
  /**
   * Store data in localStorage with optional expiration
   */
  const setItem = (key: string, data: T, expirationInSeconds?: number) => {
    if (!process.client) return false

    try {
      const expiresAt = expirationInSeconds 
        ? Date.now() + (expirationInSeconds * 1000)
        : null

      const dataToStore = {
        data,
        expiresAt,
        timestamp: Date.now()
      }

      localStorage.setItem(key, JSON.stringify(dataToStore))
      console.log(`💾 Data stored in localStorage with key: ${key}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to store data in localStorage with key ${key}:`, error)
      return false
    }
  }

  /**
   * Retrieve data from localStorage with expiration check
   */
  const getItem = (key: string): T | null => {
    if (!process.client) return null

    try {
      const storedData = localStorage.getItem(key)
      if (!storedData) return null

      const { data, expiresAt } = JSON.parse(storedData)
      
      // Check if data is expired
      if (expiresAt && expiresAt < Date.now()) {
        console.log(`⏰ Stored data with key ${key} is expired, removing from localStorage`)
        removeItem(key)
        return null
      }

      return data
    } catch (error) {
      console.error(`❌ Failed to retrieve data from localStorage with key ${key}:`, error)
      removeItem(key) // Clear corrupted data
      return null
    }
  }

  /**
   * Remove data from localStorage
   */
  const removeItem = (key: string) => {
    if (!process.client) return false

    try {
      localStorage.removeItem(key)
      console.log(`🗑️ Data removed from localStorage with key: ${key}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to remove data from localStorage with key ${key}:`, error)
      return false
    }
  }

  /**
   * Check if data exists and is not expired
   */
  const hasValidItem = (key: string): boolean => {
    if (!process.client) return false

    try {
      const storedData = localStorage.getItem(key)
      if (!storedData) return false

      const { expiresAt } = JSON.parse(storedData)
      
      // If no expiration set, consider it valid
      if (!expiresAt) return true
      
      return expiresAt > Date.now()
    } catch (error) {
      console.error(`❌ Failed to check validity of data with key ${key}:`, error)
      return false
    }
  }

  /**
   * Update existing data in localStorage
   */
  const updateItem = (key: string, updater: (currentData: T | null) => T, expirationInSeconds?: number) => {
    const currentData = getItem(key)
    const newData = updater(currentData)
    return setItem(key, newData, expirationInSeconds)
  }

  /**
   * Get all keys that match a pattern
   */
  const getKeys = (pattern?: string): string[] => {
    if (!process.client) return []

    try {
      const keys = Object.keys(localStorage)
      return pattern 
        ? keys.filter(key => key.includes(pattern))
        : keys
    } catch (error) {
      console.error('❌ Failed to get localStorage keys:', error)
      return []
    }
  }

  /**
   * Clear all items that match a pattern
   */
  const clearItems = (pattern?: string) => {
    if (!process.client) return false

    try {
      const keys = getKeys(pattern)
      keys.forEach(key => removeItem(key))
      console.log(`🗑️ Cleared ${keys.length} items from localStorage`)
      return true
    } catch (error) {
      console.error('❌ Failed to clear localStorage items:', error)
      return false
    }
  }

  /**
   * Get data with metadata (expiration info, timestamp)
   */
  const getItemWithMetadata = (key: string) => {
    if (!process.client) return null

    try {
      const storedData = localStorage.getItem(key)
      if (!storedData) return null

      const parsed = JSON.parse(storedData)
      
      return {
        data: parsed.data,
        expiresAt: parsed.expiresAt,
        timestamp: parsed.timestamp,
        isExpired: parsed.expiresAt ? parsed.expiresAt < Date.now() : false,
        timeUntilExpiration: parsed.expiresAt ? Math.max(0, parsed.expiresAt - Date.now()) : null
      }
    } catch (error) {
      console.error(`❌ Failed to retrieve metadata for key ${key}:`, error)
      return null
    }
  }

  return {
    setItem,
    getItem,
    removeItem,
    hasValidItem,
    updateItem,
    getKeys,
    clearItems,
    getItemWithMetadata
  }
}
