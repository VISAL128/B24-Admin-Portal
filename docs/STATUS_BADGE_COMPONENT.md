# StatusBadge Component

The `StatusBadge` component is a reusable Vue component that wraps Nuxt UI's `UBadge` component to display status information with appropriate styling and internationalization support. It has been enhanced to work specifically with settlement status values and provides automatic color mapping based on status type.

## Features

- **Nuxt UI Integration**: Built on top of Nuxt UI's official Badge component
- **Type Safety**: Supports string status values with automatic color mapping
- **Internationalization**: Automatic translation support using the `useI18n` composable
- **Flexible Styling**: Multiple variants and sizes from Nuxt UI
- **Accessibility**: Proper color contrast and semantic meaning through colors
- **Settlement Status Support**: Optimized for settlement statuses: `pending`, `completed`, `failed`

## Props

| Prop             | Type                                   | Default     | Description                 |
| ---------------- | -------------------------------------- | ----------- | --------------------------- |
| `status`         | `string`                               | Required    | The status to display       |
| `variant`        | `'default' \| 'table' \| 'header'`     | `'default'` | Display variant             |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | Size of the badge           |
| `useTranslation` | `boolean`                              | `true`      | Whether to use translations |

## Settlement Status Values

The component specifically supports these settlement status string values:

- `'pending'` - Displays as warning color (yellow/orange)
- `'completed'` - Displays as success color (green)
- `'failed'` - Displays as error color (red)

## Color Mapping

The component automatically maps status values to Nuxt UI Badge colors:

| Status Values                                  | Badge Color | Visual Appearance   |
| ---------------------------------------------- | ----------- | ------------------- |
| `completed`, `success`, `active`               | `success`   | Green theme         |
| `failed`, `fail`, `error`                      | `error`     | Red theme           |
| `pending`, `unpaid`, `warning`                 | `warning`   | Yellow/Orange theme |
| `processing`, `in-progress`                    | `info`      | Blue theme          |
| `inactive`, `canceled`, `cancelled`, `expired` | `neutral`   | Gray theme          |
| `reversed`                                     | `warning`   | Yellow/Orange theme |

## Variant Mapping

Component variants are mapped to Nuxt UI Badge variants:

| Component Variant | Badge Variant | Description                            |
| ----------------- | ------------- | -------------------------------------- | ----------------- |
| `default`         | `solid`       | Solid background with contrasting text |
| `table`           | `soft`        | Subtle background for table contexts   |
| `header`          | `solid`       | Solid variant for headers              | ## Usage Examples |

### Basic Usage with Status Strings

```vue
<template>
  <div>
    <StatusBadge status="pending" />
    <StatusBadge status="completed" />
    <StatusBadge status="failed" />
  </div>
</template>
```

### Table Usage

```vue
<template>
  <table>
    <tbody>
      <tr>
        <td>Settlement #123</td>
        <td>
          <StatusBadge status="completed" variant="table" size="sm" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### Without Translation

```vue
<template>
  <StatusBadge status="pending" :use-translation="false" />
</template>
```

### Different Sizes

```vue
<template>
  <div class="flex items-center gap-2">
    <StatusBadge status="completed" size="xs" />
    <StatusBadge status="completed" size="sm" />
    <StatusBadge status="completed" size="md" />
    <StatusBadge status="completed" size="lg" />
    <StatusBadge status="completed" size="xl" />
  </div>
</template>
```

## Status Color Mapping

| Status                 | Background | Text Color | Theme   |
| ---------------------- | ---------- | ---------- | ------- |
| `completed`, `success` | Green      | Green      | Success |
| `pending`, `warning`   | Yellow     | Yellow     | Warning |
| `failed`, `error`      | Red        | Red        | Error   |
| `active`               | Green      | Green      | Success |
| `inactive`             | Gray       | Gray       | Neutral |

## Translation Keys

The component uses these translation keys when `useTranslation` is `true`:

- `status.pending` - For pending status
- `status.completed` - For completed status
- `status.failed` - For failed status
- `status.success` - For success status
- `status.error` - For error status
- `status.active` - For active status
- `status.inactive` - For inactive status

## Composable Helper

Use the `useStatusBadge` composable for additional utilities:

```vue
<script setup lang="ts">
import { useStatusBadge } from '~/composables/useStatusBadge'

const { isSuccessStatus, isPendingStatus, isFailedStatus, getSettlementStatusIcon } =
  useStatusBadge()

// Check status type
const status = 'completed'
const isSuccess = isSuccessStatus(status) // true

// Get icon for status
const iconName = getSettlementStatusIcon(status) // 'check-circle'
</script>
```

## Accessibility

The component maintains proper color contrast ratios for both light and dark themes, ensuring readability for all users.

## Browser Support

Works with all modern browsers that support CSS Grid and Flexbox.
