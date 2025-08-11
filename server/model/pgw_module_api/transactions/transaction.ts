import { SettlementType, TransactionStatus, TransactionType, VoidPaymentRequestStatus } from "~/utils/enumModel";

export interface PaginationParam {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  rowCount: number;
  sorts: string;                           
  filter: string;                          
  currentPageToken: string | null;
}

export interface TransactionModel {
  id: string;
  transactionNo: string;
  transactionType: TransactionType | string;

  transactionAmount: number;
  transactionAmountDisplay: string;

  settlementType: SettlementType | '' | null;

  settlementAmount: string;        
  totalAmount: number;
  totalAmountDisplay: string;

  currencyId: string;
  currency: string;
  currencyFormat: string;
  roundDigit: number;

  status: TransactionStatus | string;
  date: string;

  bankReference: string | null;

  collectionBankCode: string | null;
  collectionBankId: string | null;
  collectionBank: string | null;
  collectionBankLogo: string | null;

  settlementBankCode: string | null;
  settlementBankId: string | null;
  settlementBank: string | null;
  settlementBankLogo: string | null;

  subBiller: string | null;
  subBillerNameKh: string | null;

  biller: string | null;
  billerNameKh: string | null;
  billerId: string | null;
  billerCode: string | null;

  countTotalCustomer: number;

  voidPaymentRequestStatus: VoidPaymentRequestStatus | string | null;

  customerFee: number;
  billerFee: number;

  walletId: string | null;
  walletAccount: string | null;
  walletAccountDisplay: string | null;

  extData: string | null;
  description: string | null;
}

// ---- List response
export interface TransactionListResponse {
  param: PaginationParam;
  results: TransactionModel[];
}