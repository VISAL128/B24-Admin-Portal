# ExTable with Persistent Configuration Usage

## Overview

The `ExTable` component now includes persistent table configuration using the `useTableWithConfig` composable. This allows users to:

- Save column visibility preferences
- Persist page size settings
- Store sorting state
- Maintain filter selections

All configurations are stored in localStorage and automatically restored when the user returns to the table.

## Basic Usage

```vue
<template>
  <div class="h-full">
    <TablesExTable
      :data="tableData"
      :columns="tableColumns"
      table-id="my-unique-table"
      :show-row-number="true"
      :show-date-filter="true"
      :export-options="exportOptions"
      @row-click="handleRowClick"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { BaseTableColumn } from '~/components/tables/table'

interface MyDataType {
  id: string
  name: string
  status: string
  created_date: string
  amount: number
}

// Define columns
const tableColumns: BaseTableColumn<MyDataType>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    id: 'created_date',
    header: 'Created Date',
    accessorKey: 'created_date',
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.original.created_date)
      return date.toLocaleDateString()
    },
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    enableSorting: true,
    cell: ({ row }) => {
      return formatCurrency(row.original.amount)
    },
  },
]

// Sample data
const tableData = ref<MyDataType[]>([
  {
    id: '1',
    name: 'John Doe',
    status: 'active',
    created_date: '2024-01-15',
    amount: 1500.00
  },
  // ... more data
])

// Export options
const exportOptions = {
  fileName: 'my-table-export',
  title: 'My Data Export',
  subtitle: 'Generated on ' + new Date().toLocaleDateString(),
}

// Event handlers
const handleRowClick = (rowData: MyDataType) => {
  console.log('Row clicked:', rowData)
}

const handleFilterChange = (columnId: string, value: string) => {
  console.log('Filter changed:', columnId, value)
}

const handleSortChange = (columnId: string, direction: 'asc' | 'desc' | null) => {
  console.log('Sort changed:', columnId, direction)
}
</script>
```

## Key Props

### Required Props

- `table-id`: **Required** - Unique identifier for the table. This is used to store configuration in localStorage.
- `columns`: Array of column definitions

### Optional Props

- `data`: Table data (if not using fetchDataFn)
- `show-row-number`: Show row numbers (default: false)
- `show-date-filter`: Show date range filter (default: true)
- `export-options`: Configuration for export functionality
- `fetchDataFn`: Function for server-side data fetching

## Configuration Persistence

The table automatically persists the following configurations:

### Column Visibility
- Users can show/hide columns using the column configuration menu
- Visibility state is saved per table ID
- Restored automatically on page reload

### Page Size
- User's selected page size is saved
- Restored on page reload
- Falls back to user preferences or default if not set

### Sorting State
- Column sorting preferences are saved
- Restored automatically when returning to the table

### Filter State
- Column filter selections are preserved
- Maintained across browser sessions

## Advanced Usage with Server-Side Data

```vue
<template>
  <TablesExTable
    table-id="server-data-table"
    :columns="columns"
    :fetch-data-fn="fetchTableData"
    :show-row-number="true"
    @row-click="handleRowClick"
  />
</template>

<script setup lang="ts">
// Server-side data fetching function
const fetchTableData = async (params?: {
  page?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}) => {
  try {
    const response = await $fetch('/api/my-data', {
      query: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search || '',
        startDate: params?.startDate || '',
        endDate: params?.endDate || '',
      }
    })
    
    return {
      records: response.data,
      total_record: response.total,
      total_page: response.totalPages
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}
</script>
```

## Migration from Old Implementation

If you're migrating from the old localStorage-based implementation:

1. **Update imports**: Make sure you're using the latest `ExTable` component
2. **Add table-id prop**: This is now required for configuration persistence
3. **Remove manual localStorage logic**: The component handles this automatically
4. **Update column definitions**: Ensure all columns have unique `id` properties

### Before (Old Implementation)
```vue
<template>
  <UTable
    :data="data"
    :columns="columns"
    @update:sorting="handleSort"
  />
</template>

<script setup>
// Manual localStorage handling
const columnVisibility = ref({})
const savedConfig = localStorage.getItem('my-table-config')
if (savedConfig) {
  columnVisibility.value = JSON.parse(savedConfig)
}

watch(columnVisibility, (val) => {
  localStorage.setItem('my-table-config', JSON.stringify(val))
})
</script>
```

### After (New Implementation)
```vue
<template>
  <TablesExTable
    table-id="my-table"
    :data="data"
    :columns="columns"
    @sort-change="handleSort"
  />
</template>

<script setup>
// Configuration is handled automatically!
// No manual localStorage code needed
</script>
```

## Technical Details

The component uses two composables for configuration management:

1. **`useTableConfig`**: Low-level localStorage operations
2. **`useTableWithConfig`**: Higher-level table-specific configuration management

### Storage Structure

Configurations are stored in localStorage under the key `TABLE_COLUMN_CONFIG` with this structure:

```json
{
  "my-table-id": {
    "columnVisibility": {
      "column1": true,
      "column2": false,
      "column3": true
    },
    "pageSize": 25,
    "sortingState": [
      { "id": "created_date", "desc": true }
    ],
    "statusFilter": ["active", "pending"],
    "autoRefresh": true
  }
}
```

## Best Practices

1. **Use descriptive table IDs**: Choose IDs that clearly identify the table's purpose
2. **Provide meaningful column IDs**: Ensure all columns have unique, descriptive ID properties
3. **Test configuration reset**: Verify the reset functionality works as expected
4. **Handle migration gracefully**: When changing table structure, consider backward compatibility

## Troubleshooting

### Configuration Not Saving
- Ensure `table-id` prop is provided and unique
- Check that columns have unique `id` properties
- Verify localStorage is available and not blocked

### Configuration Not Loading
- Check browser's localStorage for the expected keys
- Ensure the `table-id` matches exactly
- Clear localStorage if structure has changed significantly

### Performance Issues
- Consider debouncing configuration saves for frequent changes
- Use pagination for large datasets
- Implement virtual scrolling for very large tables
