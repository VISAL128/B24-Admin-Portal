import type { UserPreferences } from '~/models/userPreference'

export const APP_CONSTANTS = {
  DEFAULT_TITLE: 'Bill24 Admin Portal',
  DEFAULT_PAGE_SIZE_OPTIONS: [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ],
}

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'user-preferences',
  SESSION_DATA: 'session-data',
  CACHE: 'cache',
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  dateFormat: 'short',
  timeFormat: 'short',
  hour12: true,
  currency: 'KHR',
}

export const DEFAULT_CURRENCY_CONFIG = {
  code: 'KHR',
  symbol: '៛',
  name: 'Cambodian Riel',
  decimals: 0,
  locale: 'km-KH',
}

export const DEFAULT_LANGUAGE = 'en'
