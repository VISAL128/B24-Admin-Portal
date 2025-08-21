# ConfirmDialog Component

A reusable confirmation dialog component for consistent user interactions across the Bill24 Management Portal.

## Features

- ✅ Fully customizable title, message, and button text
- ✅ Support for destructive actions with appropriate styling
- ✅ Loading states and disabled states
- ✅ Slot support for custom content
- ✅ Internationalization support
- ✅ TypeScript support with proper type definitions
- ✅ Consistent with Nuxt UI design system

## Basic Usage

```vue
<template>
  <div>
    <UButton @click="showDialog = true">Delete Item</UButton>

    <ConfirmDialog
      v-model="showDialog"
      :destructive="true"
      message="Are you sure you want to delete this item? This action cannot be undone."
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
const showDialog = ref(false)

const handleDelete = () => {
  // Perform delete action
  console.log('Item deleted')
}
</script>
```

## Props

| Prop                   | Type            | Default        | Description                          |
| ---------------------- | --------------- | -------------- | ------------------------------------ |
| `modelValue`           | `boolean`       | -              | Controls dialog visibility (v-model) |
| `title`                | `string`        | Auto-generated | Dialog title                         |
| `message`              | `string`        | -              | Main message content                 |
| `additionalInfo`       | `string`        | -              | Additional information text          |
| `confirmButtonText`    | `string`        | Auto-generated | Confirm button text                  |
| `cancelButtonText`     | `string`        | "Cancel"       | Cancel button text                   |
| `confirmButtonColor`   | `ButtonColor`   | Auto-generated | Confirm button color                 |
| `cancelButtonColor`    | `ButtonColor`   | "neutral"      | Cancel button color                  |
| `confirmButtonVariant` | `ButtonVariant` | "solid"        | Confirm button variant               |
| `cancelButtonVariant`  | `ButtonVariant` | "outline"      | Cancel button variant                |
| `showCancelButton`     | `boolean`       | `true`         | Show/hide cancel button              |
| `loading`              | `boolean`       | `false`        | Show loading state                   |
| `disabled`             | `boolean`       | `false`        | Disable confirm button               |
| `destructive`          | `boolean`       | `false`        | Use destructive styling              |

## Events

| Event               | Description                             |
| ------------------- | --------------------------------------- |
| `confirm`           | Emitted when user clicks confirm button |
| `cancel`            | Emitted when user clicks cancel button  |
| `update:modelValue` | Emitted to update v-model value         |

## Slots

| Slot             | Description                        |
| ---------------- | ---------------------------------- |
| `default`        | Custom content area                |
| `additionalInfo` | Custom additional information area |

## Examples

### Simple Confirmation

```vue
<ConfirmDialog
  v-model="showDialog"
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  @confirm="handleConfirm"
/>
```

### Destructive Action

```vue
<ConfirmDialog
  v-model="showDeleteDialog"
  :destructive="true"
  message="This will permanently delete the selected items."
  @confirm="handleDelete"
/>
```

### Custom Content with Slots

```vue
<ConfirmDialog v-model="showDialog" title="Custom Content" @confirm="handleConfirm">
  <div class="space-y-2">
    <p>Please review the following details:</p>
    <ul class="list-disc list-inside">
      <li>Item 1 will be updated</li>
      <li>Item 2 will be removed</li>
    </ul>
  </div>
  
  <template #additionalInfo>
    <p class="text-sm text-orange-600">
      ⚠️ This action may take several minutes to complete.
    </p>
  </template>
</ConfirmDialog>
```

### Loading State

```vue
<ConfirmDialog
  v-model="showDialog"
  :loading="isProcessing"
  confirm-button-text="Processing..."
  message="Please wait while we process your request."
  @confirm="handleAsyncAction"
/>
```

### Custom Button Styling

```vue
<ConfirmDialog
  v-model="showDialog"
  confirm-button-color="success"
  confirm-button-text="Save Changes"
  cancel-button-text="Discard"
  message="Do you want to save your changes?"
  @confirm="handleSave"
  @cancel="handleDiscard"
/>
```

## Migration from RepushConfirmDialog

The new `ConfirmDialog` component can replace the existing `RepushConfirmDialog`:

### Before:

```vue
<RepushConfirmDialog v-model="showRepushDialog" @confirm="handleRepush" />
```

### After:

```vue
<ConfirmDialog
  v-model="showRepushDialog"
  title="Repush Transaction"
  message="Are you sure you want to repush this transaction?"
  confirm-button-text="OK"
  @confirm="handleRepush"
/>
```

## Translation Keys Used

The component uses the following translation keys from the i18n files:

- `confirm` - Default confirm button text
- `cancel` - Default cancel button text
- `delete` - Confirm button text for destructive actions
- `confirmation` - Default dialog title
- `confirm_button.title` - Dialog title for destructive actions

Make sure these keys exist in your locale files.
