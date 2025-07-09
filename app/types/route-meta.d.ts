// Types for route meta permission system
declare module 'vue-router' {
  interface RouteMeta {
    permissionOptions?: {
      roles?: string[]
      permissions?: string[]
      resource?: string
      action?: string
      requireAll?: boolean
    }
    requiresPermission?: {
      roles?: string[]
      permissions?: string[]
      resource?: string
      action?: string
      requireAll?: boolean
    }
  }
}

export {}
