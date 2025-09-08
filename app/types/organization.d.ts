export interface Organization {
  tenantId: string
  tenant: string
  tenantCode: string
  isSuperUser: boolean
  status: string
  lastAccessDate: string // ISO date string
  type: string
  verified: boolean
  attributes: OrganizationAttribute[]
  userId: string
}
export interface OrganizationAttribute {
  value: string
  valueDisplayName: string
  code: 'LOGO'
  name: string
  valueTypeCode: string
}
