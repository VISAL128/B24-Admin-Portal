<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Info Banner -->
    <!-- <InfoBanner
      v-show="!isTableFullscreen"
      :title="t('pages.transaction.tip')"
      :message="t('pages.transaction.tip_message')"
    /> -->
    <!-- Transaction Summary Cards -->

    <SummaryCards
      v-show="!isTableFullscreen"
      :cards="summarys"
      :is-loading="isLoading"
      :skeleton-count="skeletonCount"
    />
    <TablesExTable
      ref="table"
      :columns="columns"
      :table-id="TABLE_ID"
      :fetch-data-fn="fetchTransactionHistory"
      show-row-number
      date-format="dd/MM/yyyy"
      show-date-filter
      enabled-auto-refresh
      enabled-repush
      @row-click="handleViewDetails"
      @fullscreen-toggle="handleFullscreenToggle"
      @data-changed="handleDataChanged"
    >
      <template #trailingHeader>
        <!-- Repush Button - Only show when rows are selected -->
        <UTooltip v-if="selectedRows.length > 0" :text="t('pages.transaction.repush_description')">
          <UButton variant="outline" size="sm" @click="handleRepush()">
            {{ t('pages.transaction.repush') }} ({{ selectedRows.length }})
            <template #trailing>
              <UIcon name="material-symbols:send-outline" class="w-4 h-4" />
            </template>
          </UButton>
        </UTooltip>
      </template>
    </TablesExTable>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, resolveComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SummaryCards from '~/components/cards/SummaryCards.vue'
import TablesExTable from '~/components/tables/ExTable.vue'
import type { BankListTableFetchResult, BaseTableColumn } from '~/components/tables/table'
import { useBankApi } from '~/composables/api/useBankApi'
import { useTransactionApi } from '~/composables/api/useTransactionApi'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useNotification } from '~/composables/useNotification'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { useTransactionTypeIcon } from '~/composables/useTransactionTypeIcon'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import type { ActivatedBankResponse } from '~/models/bank'
import type { QueryParams, TransactionQueryParams } from '~/models/baseModel'
import type { TransactionHistoryRecord } from '~/models/transaction'
import {
  SettlementType,
  TransactionStatus,
  TransactionType,
  TranTypeGroup,
} from '~/utils/enumModel'
import { copyCell } from '~/utils/helper'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transaction_summary'
const availableStatuses = ref<string[]>(Object.values(TransactionStatus))

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'transactions', to: '/transactions' }],
})
// Helper function to get the enum key from enum value
const getTransactionTypeKey = (value: string): string => {
  const entry = Object.entries(TransactionType).find(([key, val]) => val === value)
  return entry ? entry[0] : value
}

const { getTransactionList, getTransactionSummary } = useTransactionApi()
const { getBanks } = useBankApi()

const showInfoBanner = ref(true)
const isLoading = ref(true)
// Fullscreen state for table
const isTableFullscreen = ref(false)

const {
  getTranTypeGroupIcon,
  getTranTypeGroupIconStyle,
  getTranTypeGroupIconColor,
  groupByTranType,
  tranTypesByGroup,
} = useTransactionTypeIcon()

// Helper function to convert group names to transaction types
const getTransactionTypesByGroupName = (groupName: string): string[] => {
  // Find the TranTypeGroup enum value by name
  const groupValue = TranTypeGroup[groupName as keyof typeof TranTypeGroup]
  if (typeof groupValue === 'number') {
    return tranTypesByGroup(groupValue as TranTypeGroup)
  }
  return []
}

// Handle Repush Transaction
const handleRepush = () => {
  notification.showWarning({
    title: t('pages.transaction.info'),
    description: t('pages.transaction.info_des'),
  })
}

const transactionSummary = ref<TransactionSummaryModel | null>(null)
const bankData = ref<ActivatedBankResponse[]>([])
const bankDataLoading = ref(false)
// Reactive computed property that updates when transactionSummary changes
const summarys = computed(() => {
  const rawSummary = transactionSummary.value?.summarys || []

  // Manual mapping for summary card titles with translations
  const titleMapping: Record<string, string> = {
    'Total Transaction': t('pages.transaction.summary.total_transaction'),
    'Total Amount': t('pages.transaction.summary.total_amount'),
    'Failed Transactions': t('pages.transaction.summary.failed_transaction'),
    'Total Settlement': t('pages.transaction.summary.total_settlement'),
    // Add more mappings as needed
  }

  // Map the summary data with translated titles
  return rawSummary.map((summary: any) => ({
    ...summary,
    title: titleMapping[summary.title] || summary.title, // Use mapped translation or fallback to original
  }))
})

// Dynamic skeleton count based on expected number of summary cards
const skeletonCount = computed(() => {
  // If we have data, use the actual count
  // If no data yet, use a default of 4 (which matches your mock data structure)
  return transactionSummary.value?.summarys?.length || 4
})

// Handle fullscreen toggle from ExTable
const handleFullscreenToggle = (fullscreen: boolean) => {
  isTableFullscreen.value = fullscreen
}

// Helper: Normalize various date string formats to YYYY-MM-DD
const toYMD = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined
  // Handle separators
  if (dateStr.includes('/')) {
    const [a, b, c] = dateStr.split('/')
    if (!a || !b || !c) return undefined
    // dd/MM/yyyy or yyyy/MM/dd
    if (a.length === 4) {
      // yyyy/MM/dd
      return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
    } else {
      // dd/MM/yyyy
      return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
    }
  }
  if (dateStr.includes('-')) {
    const [a, b, c] = dateStr.split('-')
    if (!a || !b || !c) return undefined
    // dd-MM-yyyy or yyyy-MM-dd
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
    return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
  }
  // Fallback to Date parsing
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return undefined
}

// Function to fetch transaction summary from API
// This function is called whenever the table data/filters change to keep summary in sync
const fetchTransactionSummary = async (params?: TransactionQueryParams) => {
  try {
    isLoading.value = true
    console.log('📊 Fetching transaction summary with params:', params)
    const response = await getTransactionSummary(params, locale.value)
    transactionSummary.value = response
    isLoading.value = false
    console.log('✅ Frontend: Transaction summary loaded successfully and synced with table filters')
  } catch (error) {
    console.error('❌ Frontend: Error fetching transaction summary:', error)
    isLoading.value = false
    // Keep loading state false to show skeleton cards when there's an error
  }
}

// Function to fetch bank data from API with fixed pageSize of 100
const fetchBankData = async (
  params?: QueryParams
): Promise<BankListTableFetchResult | undefined> => {
  // Prevent multiple concurrent calls
  if (bankDataLoading.value) {
    return
  }

  try {
    bankDataLoading.value = true
    const data = await getBanks()
    bankData.value = data.data
    return {
      data: data.data,
      total_page: data.total_pages || 0,
      total_record: data.total_records || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
  } finally {
    bankDataLoading.value = false
  }
}

// New handler: get the exact parameters used by the table fetch and apply to summary
const handleDataChanged = (result: Record<string, any>) => {
  console.log('📊 Table data changed, syncing summary with filters:', result)
  
  // Extract the exact same parameters that were used for the table fetch
  const start_date = result?.start_date
  const end_date = result?.end_date
  const search = result?.search
  const page = result?.page || 1
  const page_size = result?.page_size || 25
  
  // Extract status filters (already formatted by ExTable)
  const statuses: string[] = result?.Statuses || []
  
  // Check if Types are already processed by fetchTransactionHistory
  let transactionTypes: string[] = result?.Types || []
  console.log('🎯 Direct Types from result:', transactionTypes)
  
  // Extract filters from the table
  let tableFilters = result?.filters || []

  // Process transaction type filters only if Types are not already provided
  if (transactionTypes.length === 0 && tableFilters.length > 0) {
    console.log('🔍 Processing table filters for transaction types:', tableFilters)
    tableFilters = tableFilters.filter((filter: any) => {
      if (filter.field === 'transactionType') {
        console.log('🎯 Found transaction type filter:', filter)
        // Extract transaction type group values and convert to actual transaction types
        if (Array.isArray(filter.value)) {
          filter.value.forEach((groupName: string) => {
            console.log('📋 Processing group name:', groupName)
            const types = getTransactionTypesByGroupName(String(groupName))
            console.log('📋 Group name', groupName, 'converted to types:', types)
            transactionTypes.push(...types)
          })
        } else {
          console.log('📋 Processing single group name:', filter.value)
          const types = getTransactionTypesByGroupName(String(filter.value))
          console.log('📋 Single group name', filter.value, 'converted to types:', types)
          transactionTypes.push(...types)
        }
        return false // Remove from filters array
      }
      return true // Keep other filters
    })
  }

  console.log('🎯 Final extracted transaction types for summary:', transactionTypes)

  // Build comprehensive query params that match what the table used
  const queryParams: TransactionQueryParams = {
    start_date,
    end_date,
    search,
    page, // Use the same page as ExTable
    page_size, // Use the same page_size as ExTable
    Statuses: statuses.length > 0 ? statuses : undefined,
    Types: transactionTypes.length > 0 ? transactionTypes : undefined,
    filters: tableFilters.length > 0 ? tableFilters : [],
    // Include sorting if needed
    sorts: result?.sorts,
    sortAsString: result?.sortAsString
  }
  
  // Remove undefined values to clean up the request
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key as keyof TransactionQueryParams] === undefined) {
      delete queryParams[key as keyof TransactionQueryParams]
    }
  })

  console.log('📊 Syncing summary with exact table parameters (including pagination):', queryParams)
  fetchTransactionSummary(queryParams)
}

onMounted(async () => {
  console.log('🔄 Component mounted, loading data...')

  // Set initial loading state for summary cards
  isLoading.value = true

  // Load bank data first
  await fetchBankData()

  // The ExTable will automatically call fetchData() on mount which will trigger
  // handleDataChanged and load the summary with the correct filters
  // However, set a timeout fallback in case the table takes too long to initialize
  setTimeout(() => {
    if (isLoading.value && !transactionSummary.value) {
      console.log('⚠️ Table initialization took too long, loading default summary')
      // Load default monthly summary as fallback
      const now = new Date()
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const pad = (n: number) => String(n).padStart(2, '0')
      const start_date = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`
      const end_date = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`
      
      fetchTransactionSummary({ 
        start_date, 
        end_date,
        filters: []
      })
    }
  }, 3000) // 3 second timeout
  
  console.log('✅ Initial setup complete, waiting for table to load data')
})

const fetchTransactionHistory = async (
  params?: TransactionQueryParams
): Promise<{
  data: TransactionHistoryRecord[]
  total_record: number
  total_page: number
} | null> => {
  try {
    // Extract transactionType from filters and move to Types parameter
    let cleanedFilters = params?.filters || []
    const transactionTypes: string[] = []

    // Find and extract transactionType filters
    if (cleanedFilters.length > 0) {
      cleanedFilters = cleanedFilters.filter((filter) => {
        if (filter.field === 'transactionType') {
          // Extract transaction type group values and convert to actual transaction types
          if (Array.isArray(filter.value)) {
            filter.value.forEach((groupName) => {
              const types = getTransactionTypesByGroupName(String(groupName))
              transactionTypes.push(...types)
            })
          } else {
            const types = getTransactionTypesByGroupName(String(filter.value))
            transactionTypes.push(...types)
          }
          return false // Remove from filters array
        }
        return true // Keep other filters
      })
    }

    const response = await getTransactionList(
      {
        ...params,
        Statuses: params?.Statuses || [], // Pass statuses as array
        Types: transactionTypes, // Pass transaction types directly as Types parameter
        filters: cleanedFilters, // Pass cleaned filters without transactionType
      },
      locale.value
    ) // Pass current locale

    console.log(
      'Fetched transactions with Types:',
      transactionTypes,
      'and filters:',
      cleanedFilters
    )
    return {
      data: response.results || [],
      total_record: response.param?.rowCount || 0,
      total_page: response.param?.pageCount || 0,
      // Pass through all the query parameters used for this fetch so the summary can sync
      start_date: params?.start_date,
      end_date: params?.end_date,
      search: params?.search,
      page: params?.page,
      page_size: params?.page_size,
      Statuses: params?.Statuses || [],
      Types: transactionTypes,
      filters: cleanedFilters,
      sorts: params?.sorts,
      sortAsString: params?.sortAsString
    } as any
  } catch (error) {
    errorHandler.handleApiError(error)
    return null
  }
}

const { createSortableHeader, createRowNumberCell } = useTable()
const { transactionStatusCellBuilder, getTransactionStatusTranslationKey, statusCellBuilder } =
  useStatusBadge()
const { t, locale } = useI18n()
const errorHandler = useErrorHandler()
const table = ref<any>(null)
const selectedRows = computed(() => table.value?.getSelectedRows() ?? [])
const allRows = computed(() => table.value?.getAllRows() ?? [])
const router = useRouter()
const toast = useToast()
const notification = useNotification()

const TABLE_ID = 'transaction-history-table'

// Navigation to Transaction Detail Page
const navigateToDetails = (transactionId: string) => {
  router.push(`/transactions/detail/${transactionId}`)
}

// Build transaction type group filter options from TranTypeGroup enum
const transactionTypeGroupFilterOptions = computed(() =>
  Object.entries(TranTypeGroup)
    .filter(([key, value]) => typeof value === 'number') // Only get numeric enum values
    .map(([key, value]) => {
      // Special case for DeeplinkCheckout display name
      const displayName =
        key === 'DeeplinkCheckout' ? 'Deeplink/Checkout' : key.replace(/([A-Z])/g, ' $1').trim()

      return {
        label: displayName,
        value: key, // Use the enum key as value for filtering
      }
    })
)

// Build settlement type filter options from SettlementType enum
const settlementTypeFilterOptions = computed(() =>
  Object.values(SettlementType).map((type) => ({
    label: type,
    value: type,
  }))
)

// Build bank filter options from API data
const bankFilterOptions = computed(() => {
  console.log('🏦 Bank data for filters:', bankData.value)
  console.log('🏦 Bank data length:', bankData.value.length)
  const options = bankData.value
    //.filter(bank => bank.active === 'ACTIVE')
    .map((bank) => ({
      label: bank.name || bank.nameKh || 'Unknown Bank',
      value: bank.id || bank.code || (bank.name as string | number),
    }))
  console.log('🏦 Generated filter options:', options)
  return options
})

const handleViewDetails = (transaction: TransactionHistoryRecord) => {
  // Navigate to transaction details page
  navigateToDetails(transaction.id)
}

const columns = computed((): BaseTableColumn<TransactionHistoryRecord>[] => {
  const cols: BaseTableColumn<TransactionHistoryRecord>[] = [
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
        h(resolveComponent('UCheckbox'), {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          'aria-label': 'Select row',
        }),
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: ({ column }) =>
        createSortableHeader(column, t('pages.transaction.created_date'), 'left'),
      cell: ({ row }) => useFormat().formatDateTime(row.original.date),
      enableSorting: true,
      enableHiding: false,
      size: 50,
      maxSize: 150,
    },
    {
      id: 'bankReference',
      accessorKey: 'bankReference',
      header: () => t('pages.transaction.bank_ref'),
      cell: ({ row }) => copyCell(row.original.bankReference, t),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'collectionBankId',
      accessorKey: 'collectionBank',
      header: () => t('pages.transaction.collection_bank'),
      cell: ({ row }) => {
        const UAvatar = resolveComponent('UAvatar')
        if (row.original.collectionBank) {
          // If bank logo is available, display it
          return h('div', { class: 'flex items-center gap-2' }, [
            h(UAvatar, {
              src: row.original.collectionBankLogo,
              size: '2xs',
            }),
            h('div', { class: '' }, row.original.collectionBank || '-'),
          ])
        }
        return h('div', { class: '' }, row.original.collectionBank || '-')
      },
      enableColumnFilter: true,
      filterType: 'select',
      get filterOptions() {
        return bankFilterOptions.value
      },
    },
    {
      id: 'settlementBankId',
      accessorKey: 'settlementBank',
      header: () => t('pages.transaction.settlement_bank'),
      cell: ({ row }) => {
        const UAvatar = resolveComponent('UAvatar')
        if (row.original.settlementBank) {
          // If bank logo is available, display it
          return h('div', { class: 'flex items-center gap-2' }, [
            h(UAvatar, {
              src: row.original.settlementBankLogo,
              size: '2xs',
            }),
            h('div', { class: '' }, row.original.settlementBank || '-'),
          ])
        }
        return h('div', { class: '' }, row.original.settlementBank || '-')
      },
      enableColumnFilter: true,
      filterType: 'select',
      get filterOptions() {
        return bankFilterOptions.value
      },
    },
    {
      id: 'settlementType',
      accessorKey: 'settlementType',
      header: () => t('pages.transaction.settlement_type'),
      cell: ({ row }) => row.original.settlementType || '-',
      enableColumnFilter: true,
      filterOptions: settlementTypeFilterOptions.value,
    },
    {
      id: 'transactionType',
      accessorKey: 'transactionType',
      header: () => t('pages.transaction.transaction_type'),
      cell: ({ row }) => {
        const group = groupByTranType(row.original.transactionType as TransactionType)
        if (group !== null) {
          // Convert enum number to readable string and format it nicely
          const groupName = TranTypeGroup[group]
          if (groupName) {
            // Get display text
            let displayText = ''
            if (groupName === 'DeeplinkCheckout') {
              displayText = 'Deeplink/Checkout'
            } else {
              // Convert camelCase to readable format (e.g., "PayBill" → "Pay Bill")
              displayText = groupName.replace(/([A-Z])/g, ' $1').trim()
            }

            // Create element with icon and text
            return h('div', { class: 'flex items-center gap-2' }, [
              h(
                'div',
                {
                  class: `w-6 h-6 rounded-full flex items-center justify-center ${getTranTypeGroupIconStyle(group)}`,
                },
                [
                  h(resolveComponent('UIcon'), {
                    name: getTranTypeGroupIcon(group),
                    class: `w-3 h-3 ${getTranTypeGroupIconColor(group)}`,
                  }),
                ]
              ),
              h('span', { class: 'text-sm' }, displayText),
            ])
          }
        }
        return row.original.transactionType || '-'
      },
      enableSorting: true,
      enableColumnFilter: true,
      filterOptions: transactionTypeGroupFilterOptions.value,
    },
    {
      id: 'subSupplier',
      accessorKey: 'subBiller',
      header: () => t('pages.transaction.sub_biller'),
      cell: ({ row }) => row.original.subBiller || '-',
      enableSorting: true,
    },
    {
      id: 'numberOfCustomer',
      accessorKey: 'countTotalCustomer',
      header: ({ column }) =>
        createSortableHeader(column, t('pages.transaction.total_customer'), 'right'),
      cell: ({ row }) => h('div', { class: 'text-right' }, row.original.countTotalCustomer || '-'),
    },
    {
      id: 'status',
      header: () => t('pages.transaction.status'),
      // cell: ({ row }) => transactionStatusCellBuilder(row.original.status, true),
      cell: ({ row }) => statusCellBuilder(row.original.status, true),
      enableColumnFilter: true,
      filterType: 'status',
      filterOptions: availableStatuses.value.map((status) => ({
        label: getFilterTranslateTransactionStatusLabel(status, t),
        value: status,
      })),
    },
    {
      id: 'currency',
      accessorKey: 'currency',
      header: () => t('pages.transaction.currency'),
      cell: ({ row }) =>
        h('div', { class: 'text-left' }, row.original.currency || row.original.currencyId || '-'),
      enableColumnFilter: true,
      enableHiding: false,
      exportValue: (row) => row.currency || row.currencyId || '-',
      filterOptions: [
        { label: t('currency.usd'), value: 'USD' },
        { label: t('currency.khr'), value: 'KHR' },
      ],
    },
    {
      id: 'transactionAmount',
      accessorKey: 'transactionAmount',
      header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
      cell: ({ row }) =>
        h(
          'div',
          { class: 'text-right' },
          useCurrency().formatAmount(row.original.transactionAmount, row.original.currency)
        ),
      enableMultiSort: true,
      enableSorting: true,
      enableHiding: false,
      size: 50,
      maxSize: 150,
    },
  ]

  return cols
})
</script>
