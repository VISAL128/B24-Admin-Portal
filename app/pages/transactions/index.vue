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


import type { DropdownMenuItem } from '@nuxt/ui'
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
import { getPDFHeaders } from '~/composables/utils/pdfFonts'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import type { ActivatedBankResponse } from '~/models/bank'
import type { QueryParams, TransactionQueryParams } from '~/models/baseModel'
import type { TransactionHistoryRecord } from '~/models/transaction'
import { SettlementType, TransactionStatus, TransactionType, TranTypeGroup } from '~/utils/enumModel'
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

const {getTransactionList, getTransactionSummary} = useTransactionApi()
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
  tranTypesByGroup
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
    title: titleMapping[summary.title] || summary.title // Use mapped translation or fallback to original
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
const fetchTransactionSummary = async (params?: { FromDate?: string; ToDate?: string; PeriodType?: number }) => {
  try {
    isLoading.value = true
    const response = await getTransactionSummary(params, locale.value)
    transactionSummary.value = response
    isLoading.value = false
    console.log('✅ Frontend: Transaction summary loaded successfully')
  } catch (error) {
    console.error('❌ Frontend: Error fetching transaction summary:', error)
    // Keep loading state true to show skeleton cards when there's an error
  }
}

// Function to fetch bank data from API with fixed pageSize of 100
const fetchBankData =  async (params?: QueryParams): Promise<BankListTableFetchResult | undefined> => {
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




// New handler: get the exact dates used by the table fetch and apply to summary
const handleDataChanged = (result: Record<string, any>) => {
  const FromDate = toYMD(result?.start_date)
  const ToDate = toYMD(result?.end_date)
  if (FromDate || ToDate) {
    fetchTransactionSummary({ FromDate, ToDate, PeriodType: 4 })
  }
}

onMounted(async () => {
  console.log('🔄 Component mounted, loading data...')
  
  // Default monthly summary (PeriodType=4) custom date range for the current month
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  const FromDate = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`
  const ToDate = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`

  // Load both transaction summary and bank data
  await Promise.all([
    fetchTransactionSummary({ FromDate, ToDate, PeriodType: 4 }),
    fetchBankData() // Load bank data
  ])
  
  console.log('✅ All data loaded, bank data:', bankData.value)
})

const fetchTransactionHistory = async (params?: TransactionQueryParams): Promise<{
  data: TransactionHistoryRecord[]
  total_record: number
  total_page: number
} | null> => {
  try {
    // Extract transactionType from filters and move to Types parameter
    let cleanedFilters = params?.filters || []
    let transactionTypes: string[] = []
    
    // Find and extract transactionType filters
    if (cleanedFilters.length > 0) {
      cleanedFilters = cleanedFilters.filter(filter => {
        if (filter.field === 'transactionType') {
          // Extract transaction type group values and convert to actual transaction types
          if (Array.isArray(filter.value)) {
            filter.value.forEach(groupName => {
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
    
    const response = await getTransactionList({
      ...params,
      statuses: params?.statuses || [], // Pass statuses as array
      Types: transactionTypes, // Pass transaction types directly as Types parameter
      filters: cleanedFilters, // Pass cleaned filters without transactionType
    }, locale.value) // Pass current locale
    
    console.log('Fetched transactions with Types:', transactionTypes, 'and filters:', cleanedFilters)
    return {
      data: response.results || [],
      total_record: response.param?.rowCount || 0,
      total_page: response.param?.pageCount || 0,
      // pass through the dates used for this fetch so parent can sync summary
      start_date: params?.start_date,
      end_date: params?.end_date,
    } as any
  } catch (error) {
    errorHandler.handleApiError(error)
    return null
  }
}


const { createSortableHeader, createRowNumberCell } = useTable()
const { transactionStatusCellBuilder, getTransactionStatusTranslationKey , statusCellBuilder} = useStatusBadge()
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
      const displayName = key === 'DeeplinkCheckout' 
        ? 'Deeplink/Checkout' 
        : key.replace(/([A-Z])/g, ' $1').trim()
      
      return {
        label: displayName,
        value: key // Use the enum key as value for filtering
      }
    })
)

// Build settlement type filter options from SettlementType enum
const settlementTypeFilterOptions = computed(() =>
  Object.values(SettlementType).map((type) => ({
    label: type,
    value: type
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
      value: bank.id || bank.code || bank.name as string | number
    }))
  console.log('🏦 Generated filter options:', options)
  return options
})


const exportHeaders = [
  { key: 'currency_id', label: t('settlement.currency') },
  { key: 'created_date', label: t('settlement_history_details.settlement_date') },
  { key: 'total_supplier', label: t('settlement_history_details.total_supplier') },
  { key: 'created_by', label: t('settled_by') },
  { key: 'total_amount', label: t('total_amount') },
  // { key: "status", label: t("status") },
]

// Dynamic headers for PDF that support both languages
const pdfExportHeaders = computed(() => getPDFHeaders(t))

const exportToExcelHandler = async () => {
  // ...existing export logic...
  // try {
  //   const selectedRows = table.value?.getSelectedRows() || []
  //   const dataToExport =
  //     selectedRows.length > 0
  //       ? selectedRows.map((row: { original: any }) => row.original)
  //       : allRows.value

  //   if (dataToExport.length === 0) {
  //     toast.add({
  //       title: t('no_data_to_export'),
  //       description: t('please_ensure_there_is_data_to_export'),
  //       color: 'warning',
  //     })
  //     return
  //   }

  //   // Calculate total amount
  //   const totalAmount = dataToExport.reduce(
  //     (sum: number, item: { total_amount: number | string }) =>
  //       sum + (Number(item.total_amount) || 0),
  //     0
  //   )

  //   // Get current locale from the existing locale ref
  //   const currentLocale = locale.value as 'km' | 'en'

  //   // Create period string from date range
  //   const periodText = `${startDate.value} ${t('to')} ${endDate.value}`

  //   // Try the new Unicode-supported Excel export first, fallback to regular if it fails
  //   try {
  //     await exportToExcelWithUnicodeSupport(
  //       dataToExport,
  //       exportHeaders,
  //       `settlement-history-${new Date().toISOString().slice(0, 10)}.xlsx`,
  //       t('settlement_history_title'),
  //       t('settlement_history_subtitle', {
  //         date: new Date().toLocaleDateString(currentLocale === 'km' ? 'km-KH' : 'en-US'),
  //       }),
  //       {
  //         locale: currentLocale,
  //         t: t,
  //         currency: dataToExport[0]?.currency_id || 'USD',
  //         totalAmount: totalAmount,
  //         period: periodText,
  //       }
  //     )
  //   } catch (unicodeError) {
  //     console.warn('Unicode Excel export failed, falling back to standard Excel:', unicodeError)
  //     // Fallback to standard Excel export
  //     await exportToExcelStyled(
  //       dataToExport,
  //       exportHeaders,
  //       'settlement-history.xlsx',
  //       t('settlement_history_title'),
  //       t('settlement_history_subtitle', {
  //         date: new Date().toLocaleDateString(),
  //       })
  //     )
  //   }

  //   toast.add({
  //     title: t('export_successful'),
  //     description: t('exported_records_to_excel', {
  //       count: dataToExport.length,
  //       selected: selectedRows.length > 0 ? t('selected') : '',
  //     }),
  //     color: 'success',
  //   })
  // } catch (error) {
  //   console.error('Excel export error:', error)
  //   toast.add({
  //     title: t('export_failed'),
  //     description: t('failed_to_export_to_excel'),
  //     color: 'error',
  //   })
  // }
}

const exportToPDFHandler = async () => {
  // ...existing export logic...
  try {
    // const selectedRows = table.value?.getSelectedRows() || []
    // const dataToExport =
    //   selectedRows.length > 0
    //     ? selectedRows.map((row: { original: any }) => row.original)
    //     : allRows.value
    // if (dataToExport.length === 0) {
    //   toast.add({
    //     title: t('no_data_to_export'),
    //     description: t('please_ensure_there_is_data_to_export'),
    //     color: 'warning',
    //   })
    //   return
    // }

    // // Calculate total amount
    // const totalAmount = dataToExport.reduce(
    //   (sum: number, item: { total_amount: number | string }) =>
    //     sum + (Number(item.total_amount) || 0),
    //   0
    // )

    // // Get current locale from the existing locale ref
    // const currentLocale = locale.value as 'km' | 'en'

    // // Create period string from date range
    // const periodText = `${startDate.value} to ${endDate.value}`

    // try {
    //   await exportToPDFWithUnicodeSupport(
    //     dataToExport,
    //     pdfExportHeaders.value,
    //     `settlement-history-${new Date().toISOString().slice(0, 10)}.pdf`,
    //     'Transaction Report', // Let the function use dynamic titles
    //     'Transaction Report', // Let the function use dynamic titles
    //     periodText,
    //     {
    //       // company: 'WINGKH',
    //       // currency: dataToExport[0]?.currency_id || 'USD',
    //       totalAmount: totalAmount,
    //       locale: currentLocale,
    //       t: t, // Pass the translation function
    //     }
    //   )
    // } catch (unicodeError) {
    //   console.warn('Unicode PDF export failed, falling back to standard PDF:', unicodeError)
    //   // Fallback to standard PDF export
    //   await exportToPDFStyled(
    //     dataToExport,
    //     pdfExportHeaders.value,
    //     'settlement-history.pdf',
    //     'Transaction Report', // Let the function use dynamic titles
    //     'Transaction Report', // Let the function use dynamic titles
    //     periodText,
    //     {
    //       company: 'WINGKH',
    //       currency: dataToExport[0]?.currency_id || 'USD',
    //       totalAmount: totalAmount,
    //       locale: currentLocale,
    //       t: t, // Pass the translation function
    //     }
    //   )
    // }

    // toast.add({
    //   title: t('export_successful'),
    //   description: t('exported_records_to_pdf', {
    //     count: dataToExport.length,
    //     selected: selectedRows.length > 0 ? t('selected') : '',
    //   }),
    //   color: 'success',
    // })
  } catch (error) {
    console.error('PDF export error:', error)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_pdf'),
      color: 'error',
    })
  }
}

const exportItems = ref<DropdownMenuItem[]>([
  {
    label: t('pdf'),
    icon: 'i-lucide-file-text',
    onSelect() {
      exportToPDFHandler()
    },
  },
  {
    label: t('excel'),
    icon: 'i-lucide-file-spreadsheet',
    onSelect() {
      exportToExcelHandler()
    },
  },
])

// Add translation keys
const translations = {
  actions: 'Actions',
  view: 'View',
  view_details: 'View Details',
  // Add more translations as needed
}

// const handleExport = (item: { click: () => void }) => {
//   if (item.click) {
//     item.click()
//   }
// }

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
    header: ({ column }) => createSortableHeader(column, t('pages.transaction.created_date'), 'left'),
    cell: ({ row }) =>
      useFormat().formatDateTime(row.original.date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  {
    id: 'bankReference',
    accessorKey: 'bankReference',
    header: () => t('pages.transaction.bank_ref'),
    cell: ({ row }) => copyCell(row.original.bankReference, t),
    enableSorting: true,
  },
  {
    id: 'collectionBank',
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
    id: 'settlementBank',
    accessorKey: 'settlementBank',
    header: () => t('pages.transaction.settlement_bank'),
    cell: ({ row }) => {
      const UAvatar = resolveComponent('UAvatar')
      if (row.original.settlementBank) {
        // If bank logo is available, display it
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, {
            src: row.original.settlementBankLogo,
            size: 'xs',
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
            h('div', { 
              class: `w-6 h-6 rounded-full flex items-center justify-center ${getTranTypeGroupIconStyle(group)}`
            }, [
              h(resolveComponent('UIcon'), {
                name: getTranTypeGroupIcon(group),
                class: `w-3 h-3 ${getTranTypeGroupIconColor(group)}`
              })
            ]),
            h('span', { class: 'text-sm' }, displayText)
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
    accessorKey: 'subSupplier',
    header: () => t('pages.transaction.sub_biller'),
    cell: ({ row }) => row.original.subBiller || '-',
    enableSorting: true,
  },
  {
    id: 'numberOfCustomer',
    accessorKey: 'numberOfCustomer',
    header : ({ column }) => createSortableHeader(column, t('pages.transaction.total_customer'), 'right'),
    cell: ({ row }) =>  h(
        'div',
        { class: 'text-right' },
        row.original.countTotalCustomer || '-',
      ),
  },
  {
    id: 'status',
    header: () => t('pages.transaction.status'),
    // cell: ({ row }) => transactionStatusCellBuilder(row.original.status, true),
    cell: ({row}) => statusCellBuilder(row.original.status, true),
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
    cell: ({ row }) => h('div', { class: 'text-left' }, row.original.currency || '-'),
    enableColumnFilter: true,
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
    size: 50,
    maxSize: 150,
  },
  ]
  
  
  return cols
})
</script>