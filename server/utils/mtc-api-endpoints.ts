export const mtcApiEndpoints = {
  getModuleByCode: (moduleCode: string = 'pgw') => `/v1/Module/ByCode/${moduleCode}`,
  switchTenant: '/v1/Tenant/SwitchTenant',
}
