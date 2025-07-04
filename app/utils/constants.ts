import type { UserPreferences } from "~/models/userPreference"

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
  // AUTHENTICATED_DATA: 'authenticated-data',
  LOCALE : 'locale',
  THEME: 'theme',
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'USD'
}