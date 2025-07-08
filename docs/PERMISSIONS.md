# Permission System Documentation

This document explains how to use the Bill24 Admin Portal permission system to protect routes and features based on user roles and permissions.

## Overview

The permission system consists of:
- A `no-permission.vue` page that displays when users lack access
- A `permission.ts` middleware for route protection
- A `usePermissions` composable for permission checking
- A `permissions.client.ts` plugin for global access
- Internationalization support for error messages

## Usage Examples

### 1. Protecting Routes with Middleware

Use the permission middleware in your page components to protect entire routes:

```vue
<script setup>
// Protect route requiring admin role
definePageMeta({
  middleware: [
    'auth',
    ['permission', { 
      roles: ['admin'], 
      resource: 'User Management',
      action: 'view'
    }]
  ]
})

// Protect route requiring specific permissions
definePageMeta({
  middleware: [
    'auth',
    ['permission', { 
      permissions: ['settlement:read', 'settlement:write'],
      resource: 'Settlement Management',
      action: 'manage',
      requireAll: true // User must have ALL permissions
    }]
  ]
})

// Protect route requiring either admin role OR specific permission
definePageMeta({
  middleware: [
    'auth',
    ['permission', { 
      roles: ['admin'],
      permissions: ['user:manage'],
      resource: 'User Settings',
      requireAll: false // User needs admin role OR user:manage permission
    }]
  ]
})
</script>
```

### 2. Using the Permissions Composable

Use the `usePermissions` composable for reactive permission checking in components:

```vue
<template>
  <div>
    <!-- Show admin-only content -->
    <div v-if="isAdmin">
      <button @click="deleteUser">Delete User</button>
    </div>

    <!-- Show manager-level content -->
    <div v-if="isManager">
      <button @click="editUser">Edit User</button>
    </div>

    <!-- Show content based on specific permission -->
    <div v-if="canViewReports">
      <NuxtLink to="/reports">View Reports</NuxtLink>
    </div>

    <!-- Show content if user has any of the required roles -->
    <div v-if="hasAnyManagerRole">
      <button @click="approveSettlement">Approve Settlement</button>
    </div>
  </div>
</template>

<script setup>
const { 
  isAdmin, 
  isManager, 
  hasRole, 
  hasPermission, 
  hasAccess,
  redirectToNoPermission 
} = usePermissions()

// Check for specific permission
const canViewReports = computed(() => hasPermission('reports:read'))

// Check for multiple roles
const hasAnyManagerRole = computed(() => hasRole(['manager', 'senior_manager'], false))

// Check complex access requirements
const canManageUsers = computed(() => hasAccess({
  roles: ['admin'],
  permissions: ['user:create', 'user:update'],
  requireAll: false // Admin role OR both permissions
}))

// Handle permission-based redirects
const handleRestrictedAction = () => {
  if (!hasPermission('settlement:approve')) {
    redirectToNoPermission({
      type: 'permission',
      resource: 'Settlement Approval',
      action: 'approve',
      requiredPermissions: ['settlement:approve']
    })
    return
  }
  
  // Proceed with action
  approveSettlement()
}
</script>
```

### 3. Using Global Permission Helpers

Access permissions globally through the provided plugin:

```vue
<template>
  <div>
    <!-- Using $permissions in template -->
    <button v-if="$permissions.isAdmin()" @click="adminAction">
      Admin Action
    </button>
  </div>
</template>

<script setup>
// Access through nuxtApp
const { $permissions } = useNuxtApp()

// Check permissions in script
if ($permissions.hasRole(['admin', 'manager'])) {
  console.log('User has management access')
}
</script>
```

### 4. Redirecting to No-Permission Page

There are several ways to redirect users to the no-permission page:

```typescript
// Method 1: Using the composable
const { redirectToNoPermission } = usePermissions()

redirectToNoPermission({
  type: 'role',
  resource: 'User Management',
  action: 'delete',
  requiredRoles: ['admin']
})

// Method 2: Direct navigation with query parameters
navigateTo({
  path: '/no-permission',
  query: {
    type: 'permission',
    resource: 'Settlement Reports',
    action: 'generate',
    permissions: 'reports:generate,settlement:read'
  }
})

// Method 3: Simple redirect (uses default messages)
navigateTo('/no-permission')
```

## Permission Types and Query Parameters

The no-permission page supports different permission types and contextual information:

### Query Parameters

- `type`: Type of permission issue (`role`, `permission`, `feature`, `resource`, `action`, `general`)
- `resource`: Name of the resource being accessed
- `action`: Action being performed
- `permissions`: Comma-separated list of required permissions/roles
- `info`: Additional context information

### Permission Types

1. **Role**: User lacks required role
2. **Permission**: User lacks specific permission
3. **Feature**: Feature is not available for user's account
4. **Resource**: Access to specific resource denied
5. **Action**: Specific action not permitted
6. **General**: Generic permission denial

## Configuration Options

### Middleware Options

```typescript
interface PermissionOptions {
  roles?: string[]           // Required roles
  permissions?: string[]     // Required permissions
  resource?: string          // Resource name for context
  action?: string           // Action being performed
  requireAll?: boolean      // If true, user must have ALL roles/permissions
}
```

### User Info Structure

```typescript
interface UserInfo {
  email?: string
  username?: string
  roles?: string[]
  permissions?: string[]
}
```

## Internationalization

The permission system supports multiple languages. Messages are stored in:
- `i18n/locales/en.json` - English translations
- `i18n/locales/km.json` - Khmer translations

All permission-related messages are under the `no_permission` key.

## Best Practices

1. **Always use both auth and permission middleware** for protected routes
2. **Provide meaningful resource and action context** for better user experience
3. **Use reactive permission checking** in templates for dynamic UI
4. **Handle permission failures gracefully** with proper error messages
5. **Log permission denials** for audit and security purposes
6. **Keep permission logic simple** and avoid complex nested conditions
7. **Use consistent role and permission naming** across the application

## Security Considerations

1. **Never rely solely on client-side permission checking** for security
2. **Always validate permissions on the server side** for API calls
3. **Log all permission denials** for security monitoring
4. **Regularly audit user roles and permissions**
5. **Use principle of least privilege** when assigning permissions

## Troubleshooting

### Common Issues

1. **Permission middleware not working**
   - Ensure `auth` middleware is also applied
   - Check that `permissionOptions` is properly set in route meta

2. **User info not available**
   - Verify localStorage contains valid user data
   - Check that authentication is working properly

3. **Reactive permissions not updating**
   - Ensure user info is updated when roles change
   - Check that the `usePermissions` composable is properly initialized

### Debugging

Enable debug logging by setting up console.log statements in the middleware and composable to track permission checks.
