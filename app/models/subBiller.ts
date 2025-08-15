import type { Supplier } from '~/models/supplier'

export interface SubBillerQuery {
  Search?: string
  PageIndex?: number
  PageSize?: number
}

export interface SubBillerListResponse {
  param: PaginationParam
  result: Supplier[]
}

export interface PaginationParam {
  pageIndex: number
  pageSize: number
  pageCount: number
  rowCount: number
  sorts: string
  filter: string
}


export interface SubBillerWallet {
  walletId?: string;
  name?: string;
  nameKh?: string;
  walletNo?: string;
  activateDate?: string; // ISO date string (e.g., "2025-08-04T10:00:00Z")
  accountNo?: string;
  accountName?: string;
  currency?: string;
  balance?: number;
  bankName?: string;
  bankNameKh?: string;
  createdAt?: string; // ISO date string
}


export interface WalletListResponse {
  code: string
  message: string
  message_kh: string
  data: SubBillerWallet[]
}

export interface DeactivateSubBillerReq {
  subBillerId: string
}
