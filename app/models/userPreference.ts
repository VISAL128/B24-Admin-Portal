export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: 'short' | 'medium' | 'long' | 'full'
  timeFormat: 'short' | 'medium' | 'long' | 'full' // '12h' | '24h'
  currency: string
}