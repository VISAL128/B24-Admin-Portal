# Storage Composables Documentation

This document describes the refactored storage system that provides a generic, reusable localStorage management solution.

## Overview

The storage system has been refactored into two main composables:

1. **`useStorage<T>()`** - Generic localStorage composable for any data type
2. **`useLocalStorage()`** - Specialized wrapper for Keycloak authentication data

## Generic Storage Composable (`useStorage`)

### Features

- **Type-safe**: Full TypeScript support with generics
- **Expiration support**: Automatic data expiration with configurable timeouts
- **Error handling**: Robust error handling with console logging
- **Metadata support**: Access to storage metadata (timestamps, expiration info)
- **Batch operations**: Clear multiple items with pattern matching
- **Update operations**: Safe update of existing data

### Basic Usage

```typescript
// Create a typed storage instance
const storage = useStorage<UserPreferences>()

// Store data with optional expiration (in seconds)
storage.setItem('user-prefs', { theme: 'dark', lang: 'en' }, 3600) // 1 hour

// Retrieve data (returns null if expired or not found)
const prefs = storage.getItem('user-prefs')

// Remove data
storage.removeItem('user-prefs')

// Check if data exists and is valid
const isValid = storage.hasValidItem('user-prefs')

// Update existing data
storage.updateItem('user-prefs', (current) => ({ 
  ...current, 
  theme: 'light' 
}), 3600)
```

### Advanced Features

```typescript
// Get data with metadata
const metadata = storage.getItemWithMetadata('user-prefs')
if (metadata) {
  console.log('Data:', metadata.data)
  console.log('Expires at:', new Date(metadata.expiresAt))
  console.log('Is expired:', metadata.isExpired)
  console.log('Time until expiration:', metadata.timeUntilExpiration)
}

// Pattern-based operations
storage.getKeys('user-') // Get all keys starting with 'user-'
storage.clearItems('cache-') // Clear all items starting with 'cache-'
```

## Keycloak Storage Composable (`useLocalStorage`)

This is a specialized wrapper around `useStorage` that maintains the same API as before but now uses the generic storage underneath.

### Usage (Unchanged API)

```typescript
const { 
  storeKeycloakData, 
  getStoredKeycloakData, 
  clearKeycloakData,
  isStoredTokenValid,
  updateStoredTokens,
  getStoredUser,
  getStoredToken,
  getStoredRefreshToken
} = useLocalStorage()

// API remains the same as before
storeKeycloakData(keycloakInstance)
const user = getStoredUser()
const isValid = isStoredTokenValid()
```

## Example Implementations

### User Preferences Storage

```typescript
export const useUserPreferences = () => {
  interface UserPreferences {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }

  const storage = useStorage<UserPreferences>()
  const PREFERENCES_KEY = 'user-preferences'

  const savePreferences = (preferences: UserPreferences) => {
    return storage.setItem(PREFERENCES_KEY, preferences)
  }

  const getPreferences = () => {
    return storage.getItem(PREFERENCES_KEY)
  }

  return { savePreferences, getPreferences }
}
```

### Cache with Expiration

```typescript
export const useCache = <T>(defaultTTL: number = 3600) => {
  const storage = useStorage<T>()

  const set = (key: string, data: T, ttl?: number) => {
    return storage.setItem(key, data, ttl || defaultTTL)
  }

  const get = (key: string) => {
    return storage.getItem(key)
  }

  return { set, get }
}
```

## Type Definitions

```typescript
interface StorageComposable<T = any> {
  setItem: (key: string, data: T, expirationInSeconds?: number) => boolean
  getItem: (key: string) => T | null
  removeItem: (key: string) => boolean
  hasValidItem: (key: string) => boolean
  updateItem: (key: string, updater: (currentData: T | null) => T, expirationInSeconds?: number) => boolean
  getKeys: (pattern?: string) => string[]
  clearItems: (pattern?: string) => boolean
  getItemWithMetadata: (key: string) => StorageItemWithMetadata<T> | null
}
```

## Benefits of Refactoring

1. **Reusability**: The generic composable can be used for any data type
2. **Type Safety**: Full TypeScript support with proper typing
3. **Consistency**: Unified API across different storage needs
4. **Maintainability**: Single source of truth for localStorage logic
5. **Extensibility**: Easy to add new features to all storage users
6. **Testing**: Easier to test with a single, well-defined interface
7. **Error Handling**: Centralized error handling and logging

## Migration Notes

- **No breaking changes**: The `useLocalStorage` API remains exactly the same
- **Enhanced features**: The underlying storage now has better error handling and metadata support
- **Performance**: Improved performance with better expiration handling
- **Debugging**: Better console logging for storage operations

## Best Practices

1. **Use type generics**: Always specify the data type when using `useStorage<T>()`
2. **Set appropriate expiration**: Consider data sensitivity when setting expiration times
3. **Handle null returns**: Always check for null when retrieving data
4. **Use meaningful keys**: Use descriptive, namespaced keys to avoid conflicts
5. **Clear expired data**: Regularly clean up expired data for better performance
