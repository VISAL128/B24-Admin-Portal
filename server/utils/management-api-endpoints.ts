/**
 * Management API Endpoints Configuration
 * Centralized endpoint definitions for the management API
 */

export const MANAGEMENT_API_ENDPOINTS = {
  // Authentication
  AUTH: {
    AUTHORIZE: '/security/authorize',
  },

  // Settlement endpoints
  SETTLEMENT: {
    WALLET_INQUIRY: '/settlement/wallet/inquiry',
    WALLET_SUBMIT: '/settlement/wallet/submit',
    HISTORY: '/dynamic/settlement-history',
    HISTORY_DETAILS: '/dynamic/settlement-history-details',
  },

  // Dynamic/Supplier endpoints
  DYNAMIC: {
    SUPPLIERS_CSMS: '/dynamic/suppliers-csms',
    SUPPLIERS_CPO: '/dynamic/suppliers-cpo',
  },

  // Fee configuration endpoints
  FEE_CONFIG: {
    LIST: '/get_list_fee_config',
    CREATE: '/create_fee_config',
    UPDATE: '/update_fee_config',
    FIND_BY_ID: '/find_fee_config_by_id',
  },
} as const

// Type helper for endpoint values
export type ManagementApiEndpoint =
  (typeof MANAGEMENT_API_ENDPOINTS)[keyof typeof MANAGEMENT_API_ENDPOINTS][keyof (typeof MANAGEMENT_API_ENDPOINTS)[keyof typeof MANAGEMENT_API_ENDPOINTS]]
