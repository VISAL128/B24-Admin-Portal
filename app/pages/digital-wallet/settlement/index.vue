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
    <!-- <div
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
    </div> -->
    <CardsSummaryCards 
      v-show="!isTableFullscreen" 
      :cards="summarys" 
      :is-loading="isLoading" 
      :skeleton-count="summarys.length" 
    />
    <ExTable
      ref="table"
      :columns="columns"
      :table-id="TABLE_ID"
      :fetch-data-fn="fetchSettlementForTable"
      show-row-number
      show-date-filter
      enabled-auto-refresh
      :search-tooltip="t('search_by_settler')"
      @data-changed="handleDataChanged"
      @row-click="handleViewDetails"
      @fullscreen-toggle="(isFullScreen) => isTableFullscreen = isFullScreen"
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
import { h, ref, resolveComponent, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { CalendarDate } from '@internationalized/date'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { useI18n } from 'vue-i18n'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { UButton } from '#components'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { DEFAULT_PAGE_SIZE } from '~/utils/constants'
import { SettlementHistoryStatus } from '~/utils/enumModel'
import type { BaseTableColumn, SettlementHistoryTableFetchResult } from '~/components/tables/table'
import ExTable from '~/components/tables/ExTable.vue'
import type { QueryParams } from '~/models/baseModel'
import type { SummaryCard } from '~/components/cards/SummaryCards.vue'

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

const isTableFullscreen = ref(false)
const isLoading = ref(false)
const dateRangeFilterDisplay = ref('')

const availableStatuses = ref<string[]>(Object.values(SettlementHistoryStatus))
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

const summarys = ref<SummaryCard[]>([
  {
    key: 'total_amount',
    title: t('settlement.total_amount'),
    values: [{ value: 0, currency: 'KHR' }, { value: 0, currency: 'USD' }],
    filterLabel: '',
    dateRange: '',
  },
  {
    key: 'total_settled',
    title: t('settlement.total_settled'),
    values: [{ value: 0 }],
    filterLabel: '',
    dateRange: '',
  },
  {
    key: 'success',
    title: t('settlement.success'),
    values: [{ value: 0 }],
    filterLabel: '',
    dateRange: '',
  },
  {
    key: 'failed',
    title: t('settlement.failed'),
    values: [{ value: 0 }],
    filterLabel: '',
    dateRange: '',
  }
])

// Define table ID
const TABLE_ID = 'settlement-history'

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
    isLoading.value = true
    dateRangeFilterDisplay.value = `${params?.start_date} - ${params?.end_date}`

    const payload: SettlementHistoryQuery = {
      search: params?.search || undefined,
      page_size: params?.page_size || pageSize.value.value,
      page: params?.page || page.value,
      start_date: params?.start_date ? formatDateForBackendRequest(params?.start_date, 'yyyy/MM/dd') : undefined,
      end_date: params?.end_date ? formatDateForBackendRequest(params?.end_date, 'yyyy/MM/dd') : undefined,
      status: params?.statuses || [],
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
      sum_failed: data?.sum_failed || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
    return null
  } finally {
    isLoading.value = false
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

const onGenerateSettlement = () => {
  router.push('/digital-wallet/settlement/generate')
}

// Handle navigation to details page
const navigateToDetails = (settlementId: string) => {
  router.push(`/digital-wallet/settlement/details/${settlementId}`)
}

const handleDataChanged = (result: SettlementHistoryTableFetchResult) => {
      console.log('Data changed:', result)
  // Update summary with the result data
      summarys.value = summarys.value.map((card) => {
        card.dateRange = dateRangeFilterDisplay.value
        if (card.title === t('settlement.total_amount')) {
          return {
            ...card,
            values: [
              { value: result.sum_total_amount_khr || 0, currency: 'KHR' },
              { value: result.sum_total_amount_usd || 0, currency: 'USD' },
            ],
          }
        } else if (card.title === t('settlement.total_settled')) {
          return { ...card, values: [{ value: result.sum_total_settled || 0 }] }
        } else if (card.title === t('settlement.success')) {
          return { ...card, values: [{ value: result.sum_success || 0 }] }
        } else if (card.key === 'failed') {
          return { ...card, values: [{ value: result.sum_failed || 0 }] }
        }
        return card
      })
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
    enableHiding: true,
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
    filterType: 'status',
    filterOptions: availableStatuses.value.map((status) => ({
      label: getTranslatedStatusLabel(status),
      value: status,
    })),
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
    sortableHeaderAlignment: 'right',
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
    size: 50
  }
  
]
</script>
