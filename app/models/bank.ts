import type { BankServiceStatus } from '#imports'
import type { PaginationParam } from './subBiller'

export interface Bank {
  id: string
  bank_id: string
  name: string
  name_kh?: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  logo?: string
  active: BankServiceStatus
  activated_date: string
}

export interface BankAccount {
  id: string
  bank_id: string
  code: string
  name: string
  title: string
  account_type_id: string
  status: string
  currency_id: string
  is_default: boolean
  created_date?: string
  updated_date?: string
}

export interface BankService {
  supplierBankServiceId: string
  name: string
  nameKh: string
  code: string
  subTitle: string
  subTitleKh: string
  description: string
  descriptionKh: string
  status: BankServiceStatus
  activatedDate: string
  accounts: BankAccount[]
}

export interface BankListResponse {
  records: Bank[]
  total_record: number
  total_page: number
  current_page: number
  page_size: number
}

export interface BankDetailsResponse {
  services: BankService[]
  isUtility: boolean
  isSettlementBank: boolean
  isCollectionBank: boolean
  code: string
  name: string
  nameKh: string
  logoUrl: string
  id: string
}

export interface ActivatedBankResponse {
  id: string
  code: string
  name: string
  nameKh: string
  logoUrl?: string
  isSettlementBank: boolean
  isCollectionBank: boolean
  connectedServices: ConnectedService[]
}

export interface ConnectedService {
  serviceName: string
  activatedDate: string
}

export interface BankListQuery {
  param: PaginationParam
  result: BankResponseModel[]
}

export interface BankResponseModel {
  id: string
  logo: string
  code: string
  name: string
  name_kh: string
  scope: string
  hubScope: string
}
