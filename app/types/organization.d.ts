export interface Organization {
  tenantId: string
  tenant: string
  tenantCode: string
  isSuperUser: boolean
  status: string
  lastAccessDate: string // ISO date string
  type: string
  verified: boolean
  attributes: unknown[] // Array of unknown attributes
  userId: string
}
