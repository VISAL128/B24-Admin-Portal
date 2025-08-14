<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Info Banner -->
    <InfoBanner
      v-show="!isTableFullscreen"
      :title="t('pages.transaction.tip')"
      :message="t('pages.transaction.tip_message')"
    />
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
definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'transactions', to: '/transactions' }],
})

import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, h, onMounted, ref, resolveComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import InfoBanner from '~/components/cards/InfoBanner.vue'
import SummaryCards from '~/components/cards/SummaryCards.vue'
import TablesExTable from '~/components/tables/ExTable.vue'
import type { BaseTableColumn } from '~/components/tables/table'
import { useBankApi } from '~/composables/api/useBankApi'
import { useTransactionApi } from '~/composables/api/useTransactionApi'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useNotification } from '~/composables/useNotification'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { getPDFHeaders } from '~/composables/utils/pdfFonts'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import type { Bank } from '~/models/bank'
import type { TransactionQueryParams } from '~/models/baseModel'
import type { TransactionHistoryRecord } from '~/models/transaction'
import { SettlementType, TransactionStatus, TransactionType } from '~/utils/enumModel'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transaction_summary'

// Helper function to get the enum key from enum value
const getTransactionTypeKey = (value: string): string => {
  const entry = Object.entries(TransactionType).find(([key, val]) => val === value)
  return entry ? entry[0] : value
}

const {getTransactionList, getTransactionSummary} = useTransactionApi()
const { getTBanks } = useBankApi()

const showInfoBanner = ref(true)
const isLoading = ref(true)
// Fullscreen state for table
const isTableFullscreen = ref(false)


// Handle Repush Transaction
const handleRepush = () => {
  notification.showWarning({
    title: t('pages.transaction.info'),
    description: t('pages.transaction.info_des'),
  })
}

const transactionSummary = ref<TransactionSummaryModel | null>(null)
const bankData = ref<Bank[]>([])

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

// Function to fetch bank data from API
const fetchBankData = async () => {
  try {
    const response = await getTBanks()
    if (response.code === 'SUCCESS' && response.data) {
      bankData.value = response.data
      console.log('✅ Frontend: Bank data loaded successfully', response.data)
    }
  } catch (error) {
    console.error('❌ Frontend: Error fetching bank data:', error)
    // Fallback to hardcoded options if API fails
    // bankData.value = [
    //   { id: '1', bank_id: 'ABA', name: 'ABA Bank', is_settlement_bank: true, is_collection_bank: true, active: BankServiceStatus.ACTIVE, activated_date: '' },
    //   { id: '2', bank_id: 'ACLEDA', name: 'ACLEDA Bank', is_settlement_bank: true, is_collection_bank: true, active: BankServiceStatus.ACTIVE, activated_date: '' },
    //   { id: '3', bank_id: 'AMK', name: 'AMK Bank', is_settlement_bank: true, is_collection_bank: true, active: BankServiceStatus.ACTIVE, activated_date: '' }
    // ]
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
    fetchBankData()
  ])
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
          // Extract transaction type values and add to Types array
          if (Array.isArray(filter.value)) {
            transactionTypes.push(...filter.value)
          } else {
            transactionTypes.push(String(filter.value))
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
const { transactionStatusCellBuilder, getTransactionStatusTranslationKey } = useStatusBadge()
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

// Build status filter options from TransactionStatus enum
const getTranslatedTransactionStatusLabel = (status: string) => {
  const key = getTransactionStatusTranslationKey(status)
  const translated = t(key)
  return translated !== key ? translated : status.charAt(0).toUpperCase() + status.slice(1)
}

const transactionStatusFilterOptions = computed(() =>
  Object.values(TransactionStatus).map((status) => ({
    label: getTranslatedTransactionStatusLabel(status),
    value: status
  }))
)

// Build transaction type filter options from TransactionType enum
const transactionTypeFilterOptions = computed(() =>
  Object.entries(TransactionType).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to readable format
    value: value
  }))
)

// Build settlement type filter options from SettlementType enum
const settlementTypeFilterOptions = computed(() =>
  Object.values(SettlementType).map((type) => ({
    label: type,
    value: type
  }))
)

// Build bank filter options from API data
const bankFilterOptions = computed(() =>
  bankData.value
    //.filter(bank => bank.active === 'ACTIVE')
    .map((bank) => ({
      label: bank.name || bank.name_kh || 'Unknown Bank',
      value: bank.bank_id || bank.id || bank.name
    }))
)

// Build collection bank filter options (only banks that can be used for collection)
const collectionBankFilterOptions = computed(() =>
  bankData.value
   // .filter(bank => bank.active === BankServiceStatus.ACTIVE && bank.is_collection_bank)
    .map((bank) => ({
      label: bank.name || bank.name_kh || 'Unknown Bank',
      value: bank.bank_id || bank.id || bank.name
    }))
)

// Build settlement bank filter options (only banks that can be used for settlement)
const settlementBankFilterOptions = computed(() =>
  bankData.value
    //.filter(bank => bank.active === BankServiceStatus.ACTIVE && bank.is_settlement_bank)
    .map((bank) => ({
      label: bank.name || bank.name_kh || 'Unknown Bank',
      value: bank.bank_id || bank.id || bank.name
    }))
)

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
const handleFilterChange = (columnId: string, value: string) => {
  console.log('Filter changed:', columnId, value)
  // Optional: trigger fetch or other logic
}

const columns: BaseTableColumn<TransactionHistoryRecord>[] = [
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
    cell: ({ row }) => row.original.bankReference || '-',
    enableSorting: true,
  },
  {
    id: 'collectionBank',
    accessorKey: 'collectionBank',
    header: () => t('pages.transaction.collection_bank'),
    cell: ({ row }) => row.original.collectionBank || '-',
    enableColumnFilter: true,
    filterOptions: collectionBankFilterOptions.value,
  },
  {
    id: 'settlementBank',
    accessorKey: 'settlementBank',
    header: () => t('page.transaction.settlement_bank'),
    cell: ({ row }) => row.original.settlementBank || '-',
    enableColumnFilter: true,
    filterOptions: settlementBankFilterOptions.value,
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
    cell: ({ row }) => getTransactionTypeKey(row.original.transactionType) || '-',
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: transactionTypeFilterOptions.value,
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
    cell: ({ row }) => transactionStatusCellBuilder(row.original.status, true),
    enableColumnFilter: true,
    filterType: 'status',
    filterOptions: transactionStatusFilterOptions.value,
  },
  // {
  //   id: 'status',
  //   header: () => t('pages.transaction.status'),
  //   cell: ({ row }) =>
  //     h(StatusBadge, {
  //       status: row.original.status,
  //       variant: 'subtle',
  //       size: 'sm',
  //     }),
  //   enableColumnFilter: true,
  //   filterType: 'status',
  //   filterOptions: transactionStatusFilterOptions.value,
  // },
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
</script>
