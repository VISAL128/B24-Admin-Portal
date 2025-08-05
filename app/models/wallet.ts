// Defines the structure for a single wallet transaction record.
export interface WalletTransaction {
  transaction_id: string;
  transaction_date: string;
  currency: 'KHR' | 'USD';
  amount: number;
  settlement_amount: number;
  status: 'success' | 'pending' | 'canceled' | 'failed' | 'expire' | 'reversed';
  transaction_type: 'Top-up' | 'Settlement';
  bank_ref_id: string;
  description: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

// Defines the structure for the parameters in the API response.
interface ResponseParams {
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  rowCount?: number;
  sorts?: string;
  // Other potential properties can be added here.
}

// Defines the common structure for the data part of the API response.
interface WalletTransactionData {
  param: ResponseParams;
  result: WalletTransaction[];
}

// Defines the structure for the Top-Up Wallet API response.
export interface TopUpWalletApiResponse {
  param: ResponseParams;
  result: {
    code: string;
    message: string;
    message_kh: string;
    data: WalletTransactionData;
  };
}

// Defines the structure for the Settlement Wallet API response.
export interface SettlementWalletApiResponse {
  code: string;
  message: string;
  message_kh: string;
  data: WalletTransactionData;
}

// A union type to represent either of the possible API responses.
export type WalletApiResponse = TopUpWalletApiResponse | SettlementWalletApiResponse;
