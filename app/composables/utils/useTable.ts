/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from 'vue'
import { UButton } from '#components'

export const useTable = <_T>() => {
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const totalPage = ref(0)
  const sortState = ref<{ [columnId: string]: 'asc' | 'desc' | null }>({})

  const pagination = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPage: totalPage.value,
  }))

  /**
   * Creates a sortable header button for table columns
   * Cycles through: none -> asc -> desc -> none
   * @param column - The table column object with sorting methods
   * @param label - The display label for the header
   * @param alignment - Text alignment: 'left', 'center', or 'right'
   * @returns VNode with sortable button
   */
  const createSortableHeader = (
    column: any,
    label: string,
    alignment: 'left' | 'center' | 'right' = 'left',
    onSortChange?: (order: 'asc' | 'desc' | null) => void
  ) => {
    const alignmentClasses = {
      left: 'justify-start text-left',
      center: 'justify-center text-center',
      right: 'justify-end text-right',
    }

    const handleSort = () => {
      const columnId = column.id
      const current = sortState.value[columnId] || null
      if (current === null) {
        sortState.value[columnId] = 'asc'
        column.toggleSorting(false)
      } else if (current === 'asc') {
        sortState.value[columnId] = 'desc'
        column.toggleSorting(true)
      } else {
        sortState.value[columnId] = null
        column.clearSorting()
      }

      onSortChange?.(sortState.value[columnId])
    }

    const getIcon = () => {
      const columnId = column.id
      if (sortState.value[columnId] === 'asc') return 'i-solar:sort-from-top-to-bottom-bold'
      if (sortState.value[columnId] === 'desc') return 'i-solar:sort-from-bottom-to-top-outline'
      return 'i-lucide-arrow-up-down'
    }

    return h('div', { class: `w-full ${alignmentClasses[alignment]}` }, [
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: getIcon(),
        class: `w-auto tb-h-text gap-1.5 font-bold`,
        size: 'xs',
        onClick: handleSort,
      }),
    ])
  }

  /**
   * Creates a row number cell with proper pagination and sorting support
   * @param row - The table row object
   * @param table - The table instance
   * @param currentPage - Current page number (1-based) - optional for non-paginated tables
   * @param currentPageSize - Number of items per page - optional for non-paginated tables
   * @param alignment - Text alignment: 'left', 'center', or 'right'
   * @returns VNode with row number
   */
  const createRowNumberCell = (
    row: any,
    table: any,
    currentPage?: number,
    currentPageSize?: number,
    alignment: 'left' | 'center' | 'right' = 'left'
  ) => {
    const rowIndex = table.getSortedRowModel().rows.findIndex((r: any) => r.id === row.id)

    // Calculate display index based on whether pagination is used
    const displayIndex =
      currentPage && currentPageSize
        ? (currentPage - 1) * currentPageSize + rowIndex + 1
        : rowIndex + 1

    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    return h('div', { class: alignmentClasses[alignment] }, displayIndex)
  }

  return {
    pagination,
    createSortableHeader,
    createRowNumberCell,
  }
}
