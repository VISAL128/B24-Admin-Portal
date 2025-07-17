# No Permission System

This feature provides a comprehensive permission system for the Bill24 Payment Portal, ensuring that users only have access to resources they are authorized to use.

## What's Included

### 1. No Permission Page (`/no-permission`)

- Beautiful, branded error page that displays when users lack permissions
- Supports multiple permission error types (role, permission, feature, resource, action)
- Provides contextual information about why access was denied
- Includes user information and request tracking
- Offers options to go back, return home, or request access
- Fully internationalized (English and Khmer)

### 2. Permission Middleware (`middleware/permission.ts`)

- Protects routes based on user roles and permissions
- Configurable permission checking (requireAll vs requireAny)
- Automatic redirection to no-permission page
- Contextual error information

### 3. Permission Composable (`composables/usePermissions.ts`)

- Reactive permission checking throughout the app
- Helper functions for common permission patterns
- User info management
- Permission-based navigation

### 4. Permission Plugin (`plugins/permissions.client.ts`)

- Global permission helpers available in all components
- Automatic initialization of user permissions
- Provides `$permissions` global object

### 5. Demo Page (`/test/permissions`)

- Interactive demonstration of the permission system
- Mock user switching for testing
- Examples of role and permission-based access control

## Quick Start

### 1. Protect a Route

```vue
<script setup>
definePageMeta({
  middleware: [
    'auth',
    [
      'permission',
      {
        roles: ['admin'],
        resource: 'User Management',
      },
    ],
  ],
})
</script>
```

### 2. Check Permissions in Components

```vue
<template>
  <button v-if="isAdmin" @click="deleteUser">Delete User</button>
</template>

<script setup>
const { isAdmin } = usePermissions()
</script>
```

### 3. Handle Permission Failures

```vue
<script setup>
const { redirectToNoPermission } = usePermissions()

const handleRestrictedAction = () => {
  redirectToNoPermission({
    type: 'permission',
    resource: 'User Data',
    action: 'delete',
    requiredPermissions: ['user:delete'],
  })
}
</script>
```

## Features

✅ **Multi-language Support** - English and Khmer translations  
✅ **Brand Consistent** - Uses Bill24 color scheme and styling  
✅ **Contextual Errors** - Detailed information about permission requirements  
✅ **Audit Trail** - Logs permission denials for security monitoring  
✅ **Flexible Configuration** - Support for roles, permissions, and complex access rules  
✅ **Responsive Design** - Works on all device sizes  
✅ **Request Tracking** - Unique request IDs for support purposes  
✅ **User Information** - Shows current user roles and permissions  
✅ **Action Options** - Go back, home, or request access

## Navigation URLs

- **No Permission Page**: `/no-permission`
- **Demo Page**: `/test/permissions`

## Permission Types

1. **Role-based**: User lacks required role(s)
2. **Permission-based**: User lacks specific permission(s)
3. **Feature-based**: Feature not available for user's account level
4. **Resource-based**: Access to specific resource denied
5. **Action-based**: Specific action not permitted

## Query Parameters

The no-permission page accepts these query parameters for context:

- `type` - Permission error type
- `resource` - Resource name
- `action` - Action being performed
- `permissions` - Required permissions (comma-separated)
- `info` - Additional context information

## Example Usage

Visit `/test/permissions` to see the system in action. You can switch between different user types (guest, user, manager, admin) and see how the permission system responds to different access attempts.

## Security Notes

- This is a client-side permission system for UI/UX purposes
- Always validate permissions on the server side for actual security
- Permission denials are logged for audit purposes
- User information is stored in localStorage for persistence
