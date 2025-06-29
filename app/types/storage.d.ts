/**
 * Types for the generic storage composable
 */
export interface StorageItem<T = any> {
  data: T
  expiresAt: number | null
  timestamp: number
}

export interface StorageItemWithMetadata<T = any> {
  data: T
  expiresAt: number | null
  timestamp: number
  isExpired: boolean
  timeUntilExpiration: number | null
}

export interface StorageComposable<T = any> {
  setItem: (key: string, data: T, expirationInSeconds?: number) => boolean
  getItem: (key: string) => T | null
  removeItem: (key: string) => boolean
  hasValidItem: (key: string) => boolean
  updateItem: (key: string, updater: (currentData: T | null) => T, expirationInSeconds?: number) => boolean
  getKeys: (pattern?: string) => string[]
  clearItems: (pattern?: string) => boolean
  getItemWithMetadata: (key: string) => StorageItemWithMetadata<T> | null
}
