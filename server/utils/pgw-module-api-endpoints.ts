export const PGW_MODULE_API_ENDPOINTS = {
  // Bank endpoints
  BANK: {
    GET_BY_WALLET_SERVICE: '/get-current-bank-by-service-id/8',
    DETAILS: '/supplier-bank-service/{id}/details',
    LIST: '/bank/list',
    ACCOUNTS_BY_SBS_ID: '/get-accounts-by-supplier-bank-service-id/{sbs_id}',
  },
  // Transaction endpoints
  TRANSACTION: {
    SUMMARY: '/transaction/summary',
    GET_TRANSACTION_LIST: '/transaction/list/v2',
    ALLOCATION: '/transaction/allocation',
    ALLOCATION_DETAILS: '/transaction/allocation/details/{id}',
  },
}
