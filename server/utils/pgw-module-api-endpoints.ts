export const PGW_MODULE_API_ENDPOINTS = {
    // Bank endpoints
    BANK: {
        GET_BY_WALLET_SERVICE: '/get-current-bank-by-service-id/8',
        DETAILS: '/get-bank-details-by-id/{id}',
        LIST: '/bank/list',
    },
    // Transaction endpoints
    TRANSACTION: {
        SUMMARY: '/transaction/summary',
        GET_TRANSACTION_LIST: '/transaction/list/v2',
        ALLOCATION: '/transaction/allocation',
        ALLOCATION_DETAILS: '/transaction/allocation/details/{id}',
    }
}