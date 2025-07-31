<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <ExTable
      :table-id="TABLE_ID"
      :columns="columns"
      :column-visibility="columnVisibility"
      :search-tooltip="t('banks.search_placeholder')"
      :fetch-data-fn="fetchBanks"
      show-row-number
      show-date-filter
      @row-click="handleViewDetails"
      />
  </div>
</template>

<script setup lang="ts">
import { h, nextTick, onMounted, ref, resolveComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBankApi } from '~/composables/api/useBankApi'
import type { BankQuery, Bank } from '~/models/bank'
import { useI18n } from 'vue-i18n'
import { useTable } from '~/composables/utils/useTable'
import { useTableConfig } from '~/composables/utils/useTableConfig'
import type { BaseTableColumn } from '~/components/tables/table'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import ExTable from '~/components/tables/ExTable.vue'

definePageMeta({
  auth: true,
  breadcrumbs: [
    {
      label: 'navigation.banks',
      active: true,
    },
  ],
})

const { t } = useI18n()
const { getBanks } = useBankApi()
const { createSortableHeader } = useTable()
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()
const pref = useUserPreferences().getPreferences()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = useTemplateRef<any>('table')
const router = useRouter()

// Filter states
const selectedStatuses = ref<{ label: string; value: string }[]>([])
const selectedCountry = ref<{ label: string; value: string } | null>(null)
const selectedCurrency = ref<{ label: string; value: string } | null>(null)

// Define table ID and default column visibility
const TABLE_ID = 'banks-list'
const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  row_number: true,
  bank_code: true,
  bank_name: true,
  bank_short_name: true,
  swift_code: true,
  country_code: true,
  currency_code: true,
  is_settlement_bank: true,
  is_collection_bank: true,
  is_active: true,
  created_at: true,
  select: true,
}

// Use table configuration composable
const tableConfig = useTableConfig()

// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(TABLE_ID)
  return savedConfig || DEFAULT_COLUMN_VISIBILITY
}

const columnVisibility = ref<Record<string, boolean>>(initializeColumnVisibility())

// Initialize sorting state from localStorage or defaults
const initializeSortingState = (): Array<{ id: string; desc: boolean }> => {
  const savedSorting = tableConfig.getSortingState(TABLE_ID)
  return savedSorting || []
}

const sortingState = ref<Array<{ id: string; desc: boolean }>>(initializeSortingState())

// Save column visibility changes to localStorage
const saveColumnVisibility = () => {
  tableConfig.saveColumnConfig(TABLE_ID, columnVisibility.value)
}

// Save sorting state changes to localStorage
const saveSortingState = () => {
  tableConfig.saveSortingState(TABLE_ID, sortingState.value)
}

// Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(sortingState, saveSortingState, { deep: true })

// Initialize table column visibility from saved configuration
const initializeTableColumnVisibility = () => {
  if (table?.value?.tableApi) {
    Object.entries(columnVisibility.value).forEach(([columnId, isVisible]) => {
      const column = table.value.tableApi.getColumn(columnId)
      if (column) {
        column.toggleVisibility(isVisible)
      }
    })
  }
}

// Initialize table sorting state from saved configuration
const initializeTableSortingState = () => {
  if (table?.value?.tableApi && sortingState.value.length > 0) {
    // Apply saved sorting state
    table.value.tableApi.setSorting(sortingState.value)
  }
}

// Watch for table API changes to initialize column visibility and sorting
watch(
  () => table?.value?.tableApi,
  (newApi) => {
    if (newApi) {
      // Small delay to ensure table is fully initialized
      nextTick(() => {
        initializeTableColumnVisibility()
        initializeTableSortingState()
      })
    }
  },
  { immediate: true }
)

// Fetch banks data from API
const fetchBanks = async (params?: {
    page?: number
    pageSize?: number
    search?: string
    startDate?: string
    endDate?: string
  }) => {
  try {
    const payload: BankQuery = {
      search: params?.search || '',
      page_size: params?.pageSize || pref?.defaultPageSize || DEFAULT_PAGE_SIZE.value,
      page: params?.page || 1,
      is_active: selectedStatuses.value.some((s) => s.value === 'active')
        ? true
        : selectedStatuses.value.some((s) => s.value === 'inactive')
          ? false
          : undefined,
      country_code: selectedCountry.value?.value || undefined,
      currency_code: selectedCurrency.value?.value || undefined,
    }

    const data = await getBanks(payload)
    return data
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
  }
}

// Handle search input

// Filtered rows for table

// Initial load
onMounted(() => {
  // fetchBanks()
})

const navigateToDetails = (bankId: string) => {
  router.push(`/organization/banks/${bankId}`)
}


const handleViewDetails = (rowData: Bank) => {
  navigateToDetails(rowData.id)
}

const columns: BaseTableColumn<Bank>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(resolveComponent('UCheckbox'), {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(
        'div',
        {
          class: 'flex h-full w-full',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h(resolveComponent('UCheckbox'), {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value),
            'aria-label': 'Select row',
          }),
        ]
      ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      class: {
        td() {
          return 'text-center cursor-pointer'
        },
      },
    },
  },
  {
    id: 'bank_name',
    accessorKey: 'bank_name',
    header: ({ column }) => createSortableHeader(column, t('table.banks-list.columns.bank_name')),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.bank_name),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'currency',
    accessorKey: 'currency',
    header: () => t('table.banks-list.columns.currency'),
    cell: ({ row }) => row.original.currency,
    size: 80,
  },
  {
    id: 'activated_date',
    accessorKey: 'activated_date',
    header: () => t('table.banks-list.columns.activated_date'),
    type: ColumnType.DateTime,
    size: 150,
  },
  {
    id: 'is_settlement_bank',
    accessorKey: 'is_settlement_bank',
    header: () => t('table.banks-list.columns.is_settlement_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.is_settlement_bank ? 'yes' : 'no'),
    size: 120,
  },
  {
    id: 'is_collection_bank',
    accessorKey: 'is_collection_bank',
    header: () => t('table.banks-list.columns.is_collection_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.is_collection_bank ? 'yes' : 'no'),
    size: 120,
  }
]
</script>
