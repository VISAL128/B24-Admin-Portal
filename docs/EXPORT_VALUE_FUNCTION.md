# ExportValue Function Usage

The `exportValue` property has been added to the `BaseTableColumn` type to allow custom value transformation when exporting data to Excel or PDF.

## Overview

The `exportValue` function allows you to define custom logic for how a column's data should be exported, which is particularly useful when:

1. The display value in the table is different from what should be exported
2. You need to format complex data structures for export
3. You want to export calculated or derived values
4. You need to handle nested objects or arrays

## Implementation

### 1. Table Column Type Definition

```typescript
export type BaseTableColumn<T> = TableColumn<T> & {
  // ... other properties
  /**
   * Function to export the value of the column for a given row
   * This is used for exporting data (e.g. CSV export)
   */
  exportValue?: (row: T) => string | number | boolean | null | undefined
}
```

### 2. Updated Components

- **ExTable.vue**: Passes column configuration to ExportButton
- **ExportButton.vue**: Uses `exportValue` function when available to transform data
- **exportUtils.ts**: Receives pre-transformed data from ExportButton

## Usage Examples

### Example 1: Connected Services (Current Implementation)

```typescript
{
  id: 'connectedServices',
  accessorKey: 'connected_services',
  header: () => t('table.banks-list.columns.connected_services'),
  cell: ({ row }) => {
    // Complex display logic for UI
    const services = row.original.connectedServices || []
    if (services.length === 0) {
      return h('div', { class: 'text-sm text-gray-500' }, '-')
    }
    // Show count with tooltip
    return h(UTooltip, {
      text: services.map(s => s.serviceName).join(', ')
    }, {
      default: () => h('div', {},
        services.length === 1
          ? t('banks.connected_services_single', { count: services.length })
          : t('banks.connected_services_multiple', { count: services.length })
      )
    })
  },
  exportValue: (row) => {
    // Simple export logic - just the service names
    const services = row.connectedServices || []
    return services.map((service) => service.serviceName).join(', ')
  },
  size: 200,
}
```

### Example 2: Status with Translation

```typescript
{
  id: 'status',
  accessorKey: 'status',
  header: () => t('status'),
  cell: ({ row }) => statusCellBuilder(row.original.status),
  exportValue: (row) => {
    // Export translated status
    return t(`status.${row.status}`)
  }
}
```

### Example 3: Formatted Amounts

```typescript
{
  id: 'amount',
  accessorKey: 'amount',
  header: () => t('amount'),
  cell: ({ row }) => {
    // Display with currency symbol
    return h('span', {}, `$${row.original.amount.toLocaleString()}`)
  },
  exportValue: (row) => {
    // Export just the number for calculations
    return row.amount
  }
}
```

### Example 4: Date Formatting

```typescript
{
  id: 'createdDate',
  accessorKey: 'created_date',
  header: () => t('created_date'),
  cell: ({ row }) => {
    // Display relative time
    return h('span', {}, formatRelativeTime(row.original.created_date))
  },
  exportValue: (row) => {
    // Export full ISO date
    return new Date(row.created_date).toISOString()
  }
}
```

### Example 5: Complex Objects

```typescript
{
  id: 'user',
  accessorKey: 'user',
  header: () => t('user'),
  cell: ({ row }) => {
    // Display user avatar and name
    const user = row.original.user
    return h('div', { class: 'flex items-center gap-2' }, [
      h(UAvatar, { src: user.avatar }),
      h('span', {}, user.name)
    ])
  },
  exportValue: (row) => {
    // Export full user info
    const user = row.user
    return `${user.name} (${user.email})`
  }
}
```

## Data Flow

1. **Table Display**: Uses `cell` function for rendering in the UI
2. **Export Request**: User clicks export button
3. **Data Transformation**: ExportButton processes each row:
   - If column has `exportValue` function → uses custom transformation
   - If no `exportValue` function → uses original row data
4. **Export Processing**: Transformed data is passed to export utilities
5. **File Generation**: Excel/PDF is generated with transformed values

## Benefits

1. **Separation of Concerns**: Display logic separate from export logic
2. **Flexibility**: Can export different format than what's displayed
3. **Performance**: Export transformation only happens during export
4. **Maintainability**: Clear and explicit export behavior
5. **Type Safety**: Full TypeScript support with proper typing

## Migration

Existing tables will continue to work without changes. The `exportValue` function is optional:

- **Without exportValue**: Exports the raw data from `row[accessorKey]`
- **With exportValue**: Exports the result of the custom function

This maintains backward compatibility while providing new functionality.
