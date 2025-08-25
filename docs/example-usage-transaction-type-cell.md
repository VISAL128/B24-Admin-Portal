# Transaction Type Cell Reusable Function Usage Examples

## Basic Usage in Table Cells

```typescript
import { useTransactionTypeIcon } from '~/composables/useTransactionTypeIcon'

const { createTransactionTypeCell } = useTransactionTypeIcon()

// In table column definition
{
  id: 'transactionType',
  header: () => t('pages.transaction.transaction_type'),
  cell: ({ row }) => createTransactionTypeCell(h, resolveComponent, row.original.transactionType),
  enableSorting: true,
  enableColumnFilter: true,
  filterOptions: transactionTypeGroupFilterOptions.value,
}
```

## Custom Options Usage

```typescript
// With custom styling
cell: ({ row }) => createTransactionTypeCell(h, resolveComponent, row.original.transactionType, {
  showIcon: true,
  textSize: 'text-base font-medium',
  iconSize: 'w-4 h-4',
  containerClass: 'flex items-center gap-3'
})

// Without icon (text only)
cell: ({ row }) => createTransactionTypeCell(h, resolveComponent, row.original.transactionType, {
  showIcon: false
})
```

## Usage in Transaction Detail Page

```vue
<template>
  <div class="transaction-detail">
    <!-- Transaction Type with Icon -->
    <div class="field">
      <label>Transaction Type:</label>
      <div v-html="transactionTypeDisplay"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue'
import { useTransactionTypeIcon } from '~/composables/useTransactionTypeIcon'

const { createTransactionTypeCell, getTransactionTypeGroupDisplayText } = useTransactionTypeIcon()

// For HTML rendering with icon
const transactionTypeDisplay = computed(() => 
  createTransactionTypeCell(h, resolveComponent, transactionData.value.transactionType)
)

// For text-only display
const transactionTypeText = computed(() => 
  getTransactionTypeGroupDisplayText(transactionData.value.transactionType)
)
</script>
```

## Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showIcon` | boolean | `true` | Whether to show the icon |
| `textSize` | string | `'text-sm'` | CSS class for text size |
| `iconSize` | string | `'w-3 h-3'` | CSS class for icon size |
| `containerClass` | string | `'flex items-center gap-2'` | CSS class for container |

## Helper Functions

- `createTransactionTypeCell()` - Full cell with icon and text
- `getTransactionTypeGroupDisplayText()` - Text-only display name
- `getTranTypeGroupIcon()` - Icon name only
- `getTranTypeGroupIconStyle()` - Background style only
- `getTranTypeGroupIconColor()` - Icon color only
