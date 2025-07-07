export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  dateFormat: 'short' | 'medium' | 'long' | 'full'
  timeFormat: 'short' | 'medium' | 'long' | 'full' // '12h' | '24h'
  hour12: boolean
  currency: string
}