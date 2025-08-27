export interface TenantAccess {
  tenantId: string
  tenant: string
  tenantCode: string
  superUser: boolean
}

export interface ModuleResponse {
  id: number
  code: string
  name: string
  description: string
  note: string
  activate: boolean
  currentTenantAccessible: boolean
  launchUrl: string
  landingPageUrl: string | null
  icon: string | null
  roles: unknown[]
  attributes: unknown | null
  canAccessByTenants: TenantAccess[]
  availableExtraGrants: unknown[]
  features: unknown | null
}

export interface OrganizationListResponse {
  success: boolean
  data: ModuleResponse
  message: string
}

export interface SwitchTenantRequest {
  toTenantId: string
}

export interface SwitchTenantResponse {
  success: boolean
  message?: string
}
