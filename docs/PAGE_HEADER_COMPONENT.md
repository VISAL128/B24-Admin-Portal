# PageHeader Component

The PageHeader component is a reusable header component designed for detail pages in the Bill24 Management Portal. It provides a consistent interface for page headers with navigation, title display, and action buttons.

## Features

- **Back Navigation**: Built-in back button with customizable text and behavior
- **Title & Subtitle**: Display page title and optional subtitle
- **Status Toggle Button**: Configurable status toggle button (activate/deactivate)
- **Custom Actions**: Support for multiple custom action buttons
- **Flexible Slots**: Left and right slots for custom content
- **TypeScript Support**: Full TypeScript support with proper interfaces

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Page title to display |
| `subtitle` | `string` | `undefined` | Page subtitle to display |
| `showBackButton` | `boolean` | `true` | Whether to show the back button |
| `backButtonText` | `string` | `undefined` | Custom text for back button (defaults to "Back") |
| `customBackHandler` | `() => void` | `undefined` | Custom back button handler |
| `showStatusButton` | `boolean` | `false` | Whether to show the status toggle button |
| `statusButtonConfig` | `StatusButtonConfig` | `undefined` | Configuration for status button |
| `actions` | `PageHeaderAction[]` | `[]` | Array of custom action buttons |

## Interfaces

### StatusButtonConfig
```typescript
interface StatusButtonConfig {
  text: string
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  icon: string
  loading?: boolean
}
```

### PageHeaderAction
```typescript
interface PageHeaderAction {
  text: string
  onClick: () => void
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link'
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@back` | `void` | Emitted when back button is clicked |
| `@status-toggle` | `void` | Emitted when status toggle button is clicked |

## Usage Examples

### Basic Usage
```vue
<template>
  <PageHeader 
    title="Bank Details"
    subtitle="Manage bank information and settings"
  />
</template>
```

### With Status Toggle Button
```vue
<template>
  <PageHeader 
    :title="bank?.name"
    :subtitle="bank?.name_kh"
    :show-status-button="!!bank && !loading"
    :status-button-config="statusButtonConfig"
    @status-toggle="toggleBankStatus"
  />
</template>

<script setup>
const statusButtonConfig = computed(() => {
  if (!bank.value) return undefined
  
  return {
    text: bank.value.active ? t('banks.deactivate_bank') : t('banks.activate_bank'),
    color: bank.value.active ? 'error' : 'success',
    icon: bank.value.active ? 'material-symbols:block' : 'material-symbols:play-circle-outline',
    loading: false,
  }
})
</script>
```

### With Custom Actions
```vue
<template>
  <PageHeader 
    title="User Profile"
    subtitle="Manage user account settings"
    :actions="headerActions"
  />
</template>

<script setup>
const headerActions = [
  {
    text: t('edit'),
    icon: 'i-lucide-edit',
    color: 'primary',
    onClick: () => editUser(),
  },
  {
    text: t('delete'),
    icon: 'i-lucide-trash',
    color: 'error',
    variant: 'outline',
    onClick: () => deleteUser(),
  },
]
</script>
```

### With Custom Slots
```vue
<template>
  <PageHeader title="Dashboard">
    <template #left>
      <UBadge color="success" variant="soft">
        {{ t('status.active') }}
      </UBadge>
    </template>
    
    <template #right>
      <UButton 
        icon="i-lucide-refresh-cw" 
        variant="ghost" 
        size="sm"
        @click="refresh"
      >
        {{ t('refresh') }}
      </UButton>
    </template>
  </PageHeader>
</template>
```

### Custom Back Handler
```vue
<template>
  <PageHeader 
    title="Settings"
    back-button-text="Back to Dashboard"
    :custom-back-handler="customBackHandler"
  />
</template>

<script setup>
const customBackHandler = () => {
  // Custom logic before navigation
  if (hasUnsavedChanges.value) {
    // Show confirmation dialog
    showUnsavedChangesDialog()
  } else {
    router.push('/dashboard')
  }
}
</script>
```

### Without Back Button
```vue
<template>
  <PageHeader 
    title="Welcome"
    subtitle="Bill24 Management Portal"
    :show-back-button="false"
  />
</template>
```

## Migration from Existing Headers

To migrate existing header code to use the PageHeader component:

### Before
```vue
<div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded shadow">
  <div class="flex items-center gap-2">
    <UButton variant="ghost" icon="i-lucide-arrow-left" size="sm" @click="$router.back()">
      {{ t('back') }}
    </UButton>
  </div>
  <div class="flex items-center gap-2">
    <UButton
      v-if="bank && !loading"
      :color="bank.active ? 'error' : 'success'"
      variant="soft"
      :icon="bank.active ? 'material-symbols:block' : 'material-symbols:play-circle-outline'"
      size="sm"
      @click="toggleStatus"
    >
      {{ bank.active ? t('banks.deactivate_bank') : t('banks.activate_bank') }}
    </UButton>
  </div>
</div>
```

### After
```vue
<PageHeader 
  :title="bank?.name"
  :subtitle="bank?.name_kh"
  :show-status-button="!!bank && !loading"
  :status-button-config="statusButtonConfig"
  @status-toggle="toggleStatus"
/>

<script setup>
const statusButtonConfig = computed(() => {
  if (!bank.value) return undefined
  
  return {
    text: bank.value.active ? t('banks.deactivate_bank') : t('banks.activate_bank'),
    color: bank.value.active ? 'error' : 'success',
    icon: bank.value.active ? 'material-symbols:block' : 'material-symbols:play-circle-outline',
  }
})
</script>
```

## Styling

The PageHeader component uses Tailwind CSS classes and follows the existing design system:
- White background with dark mode support
- Rounded corners with shadow
- Consistent padding and spacing
- Proper color schemes for different button states

## Best Practices

1. **Always provide a title** for better user experience
2. **Use subtitle for additional context** when helpful
3. **Keep action button text concise** but descriptive
4. **Use appropriate colors** for actions (success for positive, error for destructive)
5. **Consider loading states** for async operations
6. **Follow translation patterns** using the `t()` function
