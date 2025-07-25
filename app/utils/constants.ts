import type { UserPreferences } from '~/models/userPreference'
import type { CurrencyConfig } from '../composables/utils/useCurrency'

export const APP_CONSTANTS = {
  DEFAULT_TITLE: 'Bill24 Payment Portal',
}

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'user-preferences',
  SESSION_DATA: 'session-data',
  CACHE: 'cache',
}

export const DEFAULT_PAGE_SIZE = { label: '25', value: 25 }
export const DEFAULT_PAGE_SIZE_OPTIONS = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  dateFormat: 'short',
  timeFormat: 'short',
  hour12: true,
  currency: 'KHR',
  defaultPageSize: DEFAULT_PAGE_SIZE.value,
}

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  code: 'KHR',
  symbol: '៛',
  name: 'Cambodian Riel',
  decimals: 0,
  locale: 'km-KH',
}

export const DEFAULT_LANGUAGE = 'en'

export type TableLoadingAnimationType =
  | 'elastic'
  | 'carousel'
  | 'carousel-inverse'
  | 'swing'
  | undefined

export type TableLoadingColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | undefined

export const TABLE_CONSTANTS = {
  LOADING_ANIMATION: 'elastic' as TableLoadingAnimationType,
  LOADING_COLOR: 'primary' as TableLoadingColorType,
}

export const RoutePath = {
  GenerateSettlement: '/digital-wallet/settlement/generate',
  Settlement: '/digital-wallet/settlement',
}
