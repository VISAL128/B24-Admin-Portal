export interface SupplierProfile {
  id: string
  code: string
  name: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  nameKh: string
  shortName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  addressKh?: string | null
  tinNumber?: string | null
  userId?: string | null
  parentId?: string | null
  supplierTypeId?: string | null
  syncCode?: string | null
  bgwCode?: string | null
  scope: string
  isActive: boolean
  isValidUnicodeName: boolean
  createdBy: string
  createdDate: string // ISO string format (e.g., 2025-07-02T09:25:24.893821)
  updatedBy?: string | null
  updatedDate?: string | null
  paymentWidgetSetting?: string | null // JSON string
  paymentWidgetSettingPreview?: string | null
  directDebitResponse?: string | null
  checkoutPageConfig?: any | null // Unknown structure
  extData?: string | null // JSON string
}
