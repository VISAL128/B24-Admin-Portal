export interface SettlementParty {
    id: string;
    type: string; // 2 for supplier
}
export interface SettlementInquiryRequest {
    parties: Array<SettlementParty>;
    main_supplier_id: string;
    currency: string;
    cutoff_date: string; // ISO date string
}

export interface TransactionAllocation {
    id: string;
    amount: number;
    currency_id: string;
}

export interface Settlement {
    id: string;
    party_id: string;
    party_type: number; // 2 for CPO
    amount: number;
    settlement_bank_id: string;
    settlement_account_id?: string; // Optional, if not provided, it can be null
    currency: string;
    transaction_allocations: Array<TransactionAllocation>;
}

export interface SettlementInquiryResponse {
    token: string;
    settlements: Array<Settlement>;
}