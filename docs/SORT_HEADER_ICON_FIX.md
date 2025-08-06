# Sort Header Icon Synchronization Fix

## Problem
The sorting icons in table headers created with `createSortableHeader` were not reflecting the initialized sorting state from localStorage. When a table loaded with saved sorting state, the header icons remained in their default state (unsorted) instead of showing the correct sort direction.

## Root Cause
The `createSortableHeader` function in `useTable` composable maintained its own internal `sortState` that was separate from the table's actual sorting state managed by the `ExTable` component. When sorting was initialized from localStorage in `ExTable`, the `createSortableHeader`'s internal state wasn't updated to reflect this initial state.

## Solution

### 1. Updated `useTable` composable (`app/composables/utils/useTable.ts`)

Made the `useTable` composable accept an optional external sorting state:

```typescript
export const useTable = <_T>(externalSortState?: Ref<Array<{ id: string; desc: boolean }>>) => {
  // ... existing code

  const createSortableHeader = (
    column: any,
    label: string,
    alignment: 'left' | 'center' | 'right' = 'left',
    onSortChange?: (order: 'asc' | 'desc' | null) => void
  ) => {
    // Get current sort state - prefer external state if available
    const getCurrentSortState = (columnId: string): 'asc' | 'desc' | null => {
      if (externalSortState?.value) {
        const sortItem = externalSortState.value.find(s => s.id === columnId)
        if (sortItem) {
          return sortItem.desc ? 'desc' : 'asc'
        }
        return null
      }
      return sortState.value[columnId] || null
    }

    // Set sort state - update external state if available
    const setSortState = (columnId: string, value: 'asc' | 'desc' | null) => {
      if (externalSortState?.value) {
        // Update external sorting state
        if (value === null) {
          externalSortState.value = externalSortState.value.filter(s => s.id !== columnId)
        } else {
          const existingIndex = externalSortState.value.findIndex(s => s.id === columnId)
          const newSortItem = { id: columnId, desc: value === 'desc' }
          
          if (existingIndex >= 0) {
            externalSortState.value[existingIndex] = newSortItem
          } else {
            externalSortState.value = [newSortItem]
          }
        }
      } else {
        // Fallback to internal state
        sortState.value[columnId] = value
      }
    }

    const getIcon = () => {
      const columnId = column.id
      const currentSort = getCurrentSortState(columnId)
      if (currentSort === 'asc') return 'i-solar:sort-from-top-to-bottom-bold'
      if (currentSort === 'desc') return 'i-solar:sort-from-bottom-to-top-outline'
      return 'i-lucide-arrow-up-down'
    }

    // ... rest of the function
  }
}
```

### 2. Updated `ExTable` component (`app/components/tables/ExTable.vue`)

Pass the sorting state to the `useTable` composable:

```typescript
// Initialize sorting state before useTable
const sorting = ref<Array<{ id: string; desc: boolean }>>([])

// Initialize useTable with sorting state for synchronized sort icons
const { createRowNumberCell, createSortableHeader } = useTable<T>(sorting)
```

### 3. Made `filteredColumns` reactive to sorting changes

Updated the computed property to depend on the sorting state:

```typescript
const filteredColumns = computed(() => {
  // Force reactivity by accessing sorting state
  const currentSorting = sorting.value
  const columns = columnsWithRowNumber.value

  columns.forEach((col) => {
    if(col.enableSorting) {
      col.header = ({ column }) => createSortableHeader(column, getTranslationHeaderById(col.id))
    }
  })
  
  // ... rest of the computation
})
```

## Benefits

1. **Synchronized Icons**: Sort header icons now correctly reflect the initialized sorting state from localStorage
2. **Backward Compatibility**: The `externalSortState` parameter is optional, so existing code using `useTable()` continues to work
3. **Reactive Updates**: Icons automatically update when sorting state changes
4. **Consistent State**: Single source of truth for sorting state

## Testing

The fix ensures that:
- When a table loads with saved sorting state, header icons show the correct sort direction
- Clicking sort headers updates both the table data and the icon state
- Multiple sortable columns can be used simultaneously
- The change is backward compatible with existing implementations

## Files Modified

1. `app/composables/utils/useTable.ts` - Enhanced to accept external sorting state
2. `app/components/tables/ExTable.vue` - Pass sorting state to useTable composable

## Impact

This fix resolves the issue where table headers would show incorrect sorting icons when tables were initialized with saved sorting state from localStorage, improving user experience by providing accurate visual feedback about the current sort state.
