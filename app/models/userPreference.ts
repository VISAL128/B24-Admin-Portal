export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'short' | 'medium' | 'long' | 'full'
  timeFormat: 'short' | 'medium' | 'long' | 'full'
  hour12: boolean
  currency: string
  defaultPageSize: number
  autoRefreshInterval: number // in seconds
}
