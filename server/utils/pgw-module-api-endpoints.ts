export const PGW_MODULE_API_ENDPOINTS = {
  // Bank endpoints
  BANK: {
    GET_BY_WALLET_SERVICE: '/get-current-bank-by-service-id/8',
    DETAILS: '/bank-details/{id}',
    LIST: '/bank/list',
    LIST_ACTIVATED: '/activated-banks',
    ACCOUNTS_BY_SBS_ID: '/get-accounts-by-supplier-bank-service-id/{sbs_id}',
    UPDATE_SBS_STATUS: '/update-supplier-bank-service-status',
  },
  // Transaction endpoints
  TRANSACTION: {
    SUMMARY: '/transaction/summary',
    GET_TRANSACTION_LIST: '/transaction/list/v2',
    GET_BY_ID: '/transaction/{id}/v2',
    ALLOCATION: '/transaction/allocation',
    ALLOCATION_BY_ID: '/transaction/{id}/allocations',
    ALLOCATION_DETAILS: '/transaction/{id}/allocations/{allocation_id}',
  },
}
