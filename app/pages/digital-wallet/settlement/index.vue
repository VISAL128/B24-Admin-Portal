<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <!-- <div
      class="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-white dark:bg-gray-900 rounded shadow"
    >
      <StatusSelection
          v-model="selectedStatuses"
          :multiple="true"
          :available-statuses="availableStatuses"
          :include-all-statuses="false"
          :placeholder="t('settlement.select_status')"
          :searchable="false"
        />
    </div> -->
    <div
    class="flex flex-wrap items-center gap-2"
    >
      <div 
      v-for="(value, key) in summary"
      :key="key"
      class="flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 min-w-48">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{{ t(`settlement.${key}`) }}</h3>
        <AmountWithCurrency
          v-if="key === 'total_amount_khr' || key === 'total_amount_usd'"
          :amount="value"
          :currency="key === 'total_amount_khr' ? 'KHR' : 'USD'"
          variant="primary"
          />
        <p
        v-else
        class="text-primary font-bold">{{ value }}</p>
      </div>
    </div>
    <ExTable
      ref="table"
      :columns="columns"
      :table-id="TABLE_ID"
      :fetch-data-fn="fetchSettlementForTable"
      show-row-number
      show-date-filter
      enabled-auto-refresh
      @data-changed="handleDataChanged"
      @row-click="handleViewDetails"
    >
    <template #trailingHeader>
      <UButton color="primary" icon="i-lucide-play" size="sm" @click="onGenerateSettlement">
          {{ t('generate_settlement') }}
      </UButton>
    </template>
  </ExTable>
  </div>
</template>

<script setup lang="ts">
import { h, nextTick, onMounted, ref, resolveComponent, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { CalendarDate } from '@internationalized/date'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { useI18n } from 'vue-i18n'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { UButton } from '#components'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useTableConfig } from '~/composables/utils/useTableConfig'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { DEFAULT_PAGE_SIZE } from '~/utils/constants'
import { SettlementHistoryStatus } from '~/utils/enumModel'
import type { BaseTableColumn, SettlementHistoryTableFetchResult } from '~/components/tables/table'
import ExTable from '~/components/tables/ExTable.vue'
import type { QueryParams } from '~/models/baseModel'

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'settlement_menu', active: true }],
})

const { t } = useI18n()
const { getSettlementHistory } = useSupplierApi()
const { createSortableHeader } = useTable()
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()
const pref = useUserPreferences().getPreferences()
const { formatAmount } = useCurrency()
const { currentProfile } = useAuth()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = useTemplateRef<any>('table')
const router = useRouter()

const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({
  label: pref?.defaultPageSize ? pref?.defaultPageSize.toString() : DEFAULT_PAGE_SIZE.label,
  value: pref?.defaultPageSize || DEFAULT_PAGE_SIZE.value,
})

const summary = ref({
  total_amount_khr: 0,
  total_amount_usd: 0,
  total_settled: 0,
  success: 0,
  failed: 0,
})

// Initialize status filter from localStorage or defaults
const initializeStatusFilter = () => {
  const savedStatusValues = tableConfig.getStatusFilter(TABLE_ID)

  if (savedStatusValues && savedStatusValues.length > 0) {
    const filteredValues = savedStatusValues.filter((value) => {
      // If we have specific statuses, remove the "All" (empty string) option
      const hasSpecificStatuses = savedStatusValues.some((v) => v !== '')
      return hasSpecificStatuses ? value !== '' : true
    })

    selectedStatuses.value = filteredValues.map((value) => ({
      label: value === '' ? t('status.all') : getTranslatedStatusLabel(value),
      value,
    }))
  } else {
    // Default to "All" status when no saved values
    selectedStatuses.value = [
      {
        label: t('status.all'),
        value: '',
      },
    ]
  }
}

// Helper function to get translated status label
const getTranslatedStatusLabel = (statusValue: string): string => {
  if (statusValue === '') return t('status.all')

  switch (statusValue.toLowerCase()) {
    case 'pending':
      return t('status.pending')
    case 'processing':
      return t('status.processing')
    case 'completed':
      return t('status.completed')
    default:
      return statusValue
  }
}

const selectedStatuses = ref<{ label: string; value: string }[]>([
  {
    label: t('status.all'),
    value: '',
  },
])
const availableStatuses = ref<string[]>(Object.values(SettlementHistoryStatus))
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

// Define table ID and default column visibility
const TABLE_ID = 'settlement-history'
const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  row_number: true,
  created_date: true,
  total_amount: true,
  currency_id: true,
  created_by: true,
  total_settled: true,
  status: true,
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

// Save status filter changes to localStorage
const saveStatusFilter = () => {
  tableConfig.saveStatusFilter(
    TABLE_ID,
    selectedStatuses.value.map((status) => status.value)
  )
}

// Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(sortingState, saveSortingState, { deep: true })
watch(selectedStatuses, saveStatusFilter, { deep: true })

// Watch for language changes to update status label
const { locale } = useI18n()
watch(
  locale,
  () => {
    // Update the selected status labels when language changes
    selectedStatuses.value = selectedStatuses.value.map((status) => ({
      ...status,
      label: status.value === '' ? t('status.all') : getTranslatedStatusLabel(status.value),
    }))
  },
  { immediate: false }
)

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

let interval: ReturnType<typeof setInterval> | null = null

onBeforeUnmount(() => {
  // Clear interval on component unmount
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})

// Wrapper function for BaseTableV2
const fetchSettlementForTable = async (params?: QueryParams): Promise<SettlementHistoryTableFetchResult | null> => {
  try {
    const payload: SettlementHistoryQuery = {
      search: params?.search || undefined,
      page_size: params?.page_size || pageSize.value.value,
      page: params?.page || page.value,
      start_date: params?.start_date,
      end_date: params?.end_date,
      status: selectedStatuses.value.map((status) => status.value).filter((v) => v !== ''), // Use selected status values, filter out empty (all)
      supplier_id: currentProfile.value?.id || '', // Use current supplier ID
    }

    const data = await getSettlementHistory(payload)
    return {
      data: data?.records || [],
      total_record: data?.total_record || 0,
      total_page: data?.total_page || 0,
      sum_total_amount_khr: data?.sum_total_amount_khr || 0,
      sum_total_amount_usd: data?.sum_total_amount_usd || 0,
      sum_total_settled: data?.sum_total_settled || 0,
      sum_success: data?.sum_success || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
    return null
  }
}

// Handle search input

// Filtered rows for table

onBeforeMount(() => {
  // Get last day of current month
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  // Set default date range to current month
  modelValue.value.start = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
  modelValue.value.end = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
})

// Initial load
onMounted(() => {

  initializeStatusFilter()
  // fetchSettlementHistory()
})

const onGenerateSettlement = () => {
  router.push('/digital-wallet/settlement/generate')
}

// Handle navigation to details page
const navigateToDetails = (settlementId: string) => {
  router.push(`/digital-wallet/settlement/details/${settlementId}`)
}

const handleDataChanged = (result: SettlementHistoryTableFetchResult) => {
  // Update summary with the result data
  summary.value = {
    total_amount_khr: result.sum_total_amount_khr || 0,
    total_amount_usd: result.sum_total_amount_usd || 0,
    total_settled: result.sum_total_settled || 0,
    success: result.sum_success || 0,
    failed: result.sum_failed || 0
  }
}

const handleViewDetails = (rowData: SettlementHistoryRecord) => {
  navigateToDetails(rowData.id)
}

const columns: BaseTableColumn<SettlementHistoryRecord>[] = [
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
    enableColumnFilter: false,
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
    id: 'created_date',
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('settlement.settlement_date'), 'left'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
  
  {
    id: 'created_by',
    accessorKey: 'created_by',
    header: () => t('settled_by'),
    cell: ({ row }) => row.original.created_by || '-',
  },

  {
    id: 'total_settled',
    accessorKey: 'total_settled',
    header: ({ column }) => createSortableHeader(column, t('settlement.transaction')),
    cell: ({ row }) => {
      const success = row.original.success
      const failed = row.original.failed
      const total = row.original.total_settled

      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')

      return h('div', { class: 'flex gap-2 items-center' }, [
        h(
          UBadge,
          {
            color: 'primary',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [
            h('span', { class: 'text-xs h-4' }, `${t('total')}: ${total}`),
          ]
        ),
        // Success and Fail badges
        h(
          UBadge,
          {
            color: 'success',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }), h('span', {}, success)]
        ),
        h(
          UBadge,
          {
            color: 'error',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, failed)]
        ),
      ])
    },
    enableSorting: true,
  },
  {
    id: 'status',
    header: () => t('status.header'),
    cell: ({ row }) => statusCellBuilder(row.original.status, true),
    enableColumnFilter: true,
    filterType: 'select',
    filterOptions: availableStatuses.value.map((status) => ({
      label: getTranslatedStatusLabel(status),
      value: status,
    })),
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    header: () => t('settlement.currency'),
    cell: ({ row }) => h('div', { class: 'text-left' }, row.original.currency_id || '-'),
    enableColumnFilter: true,
    filterOptions: [
      { label: t('currency.usd'), value: 'USD' },
      { label: t('currency.khr'), value: 'KHR' },
    ],
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  
]
</script>
