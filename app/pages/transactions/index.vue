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
      show-date-filter
      enabled-auto-refresh
      enabled-repush
      @row-click="handleViewDetails"
      @fullscreen-toggle="handleFullscreenToggle"
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

        <!-- <USelectMenu
          v-model="selectedDateFilter"
          :items="dateOptions"
          class="w-auto min-w-[200px]"
          :search-input="false"
          @update:model-value="onDateFilterChange"
        >
          <template #item="{ item }">
            <span v-html="item.label" />
          </template>
          <template #default="{ modelValue }">
            <span v-if="modelValue" v-html="modelValue.label" />
          </template>
        </USelectMenu> -->
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
import StatusBadge from '~/components/StatusBadge.vue'
import TablesExTable from '~/components/tables/ExTable.vue'
import type { BaseTableColumn } from '~/components/tables/table'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'
import { useTransactionApi } from '~/composables/api/useTransactionApi'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useNotification } from '~/composables/useNotification'
import { getPDFHeaders } from '~/composables/utils/pdfFonts'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import type { QueryParams } from '~/models/baseModel'
import type { TransactionHistoryRecord } from '~/models/transaction'
import { TransactionType } from '~/utils/enumModel'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transaction_summary'

// Helper function to get the enum key from enum value
const getTransactionTypeKey = (value: string): string => {
  const entry = Object.entries(TransactionType).find(([key, val]) => val === value)
  return entry ? entry[0] : value
}

const pgwModuleApi = usePgwModuleApi()
const transactionApi = useTransactionApi()
const {getTransactionList} = useTransactionApi()
const { getTransactions } = usePgwModuleApi()

const showInfoBanner = ref(true)

// Handle Repush Transaction
const handleRepush = () => {
  notification.showWarning({
    title: t('pages.transaction.info'),
    description: t('pages.transaction.info_des'),
  })
}

const transactionSummary = ref<TransactionSummaryModel | null>(null)

// Reactive computed property that updates when transactionSummary changes
const summarys = computed(() => {
  return transactionSummary.value?.summarys || []
})

// Dynamic skeleton count based on expected number of summary cards
const skeletonCount = computed(() => {
  // If we have data, use the actual count
  // If no data yet, use a default of 4 (which matches your mock data structure)
  return transactionSummary.value?.summarys?.length || 4
})

const isLoading = ref(true)

// Fullscreen state for table
const isTableFullscreen = ref(false)

// Handle fullscreen toggle from ExTable
const handleFullscreenToggle = (fullscreen: boolean) => {
  isTableFullscreen.value = fullscreen
}

// Function to fetch transaction summary from API
const fetchTransactionSummary = async () => {
  try {
    isLoading.value = true
    const response = await transactionApi.getTransactionSummary()
    transactionSummary.value = response
    isLoading.value = false
    console.log('✅ Frontend: Transaction summary loaded successfully')
  } catch (error) {
    console.error('❌ Frontend: Error fetching transaction summary:', error)
    // Error handling is done automatically by executeV2 → errorHandler.handleApiError()
    // Keep loading state true to show skeleton cards when there's an error
    // isLoading.value remains true
  }
}

onMounted(async () => {
  // Fetch transaction summary
  await fetchTransactionSummary()
})

// Fetch function for TablesExTable following sub-billers structure
// const fetchTransactionList = async (params?: QueryParams): Promise<{
//   data: TransactionModel[]
//   total_record: number
//   total_page: number
// } | null> => {
//   try {
//     const response = await transactionApi.getTransactionList(params)

//     return {
//       data: response.data?.results || [],
//       total_record: response.data?.param?.rowCount || 0,
//       total_page: response.data?.param?.pageCount || 0,
//     }
//   } catch (error) {
//     errorHandler.handleApiError(error)
//     return null
//   }
// }

// const fetchTransactionList = async (params?: QueryParams): Promise<TransactionListTableFetchResult | undefined> => {
//   try {
//     isLoading.value = true
//     const response = await transactionApi.getTransactionList(params)
    
//     console.log('Fetched response:', response)
    
//     return {
//       data: response.data || [],
//       total_page: response.total_pages || 0,
//       total_record: response.total_records || 0,
//     }
//   } catch (error: unknown) {
//     // Show error notification to user
//     errorHandler.handleApiError(error)
//   }
//   finally {
//     isLoading.value = false
//   }
// }

// const fetchTransactionList = async (params?: QueryParams): Promise<{
//   data: TransactionHi[]
//   total_record: number
//   total_page: number
// } | null> => {
//   try {

//     const response = await getTransactionList(params)
//     return {
//       data: response.results || [],
//       total_record: response.param?.rowCount || 0,
//       total_page: response.param?.pageCount || 0,
//     }
//   } catch (error) {
//     errorHandler.handleApiError(error)
//     return null
//   }
// }

const fetchTransactionHistory = async (params?: QueryParams): Promise<{
  data: TransactionHistoryRecord[]
  total_record: number
  total_page: number
} | null> => {
  try {
  
    const response = await getTransactionList(params)
    console.log('Fetched transactions:', response)
    return {
      data: response.results || [],
      total_record: response.param?.rowCount || 0,
      total_page: response.param?.pageCount || 0,
    }
  } catch (error) {
    errorHandler.handleApiError(error)
    return null
  }
}


const { createSortableHeader, createRowNumberCell } = useTable()
const { t, locale } = useI18n()
const errorHandler = useErrorHandler()
const table = ref<any>(null)
const selectedRows = computed(() => table.value?.getSelectedRows() ?? [])
const allRows = computed(() => table.value?.getAllRows() ?? [])
const router = useRouter()
const toast = useToast()
const notification = useNotification()

const TABLE_ID = 'transaction-history-table'

// // Date range for filtering (still needed for manual date selection)
// const startDate = ref('')
// const endDate = ref('')
// const errorMsg = ref('')

// const df = new DateFormatter('en-US', { dateStyle: 'medium' })
// const today = new Date()
// const modelValue = shallowRef({
//   start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
//   end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
// })

// const userPreference = useUserPreferences().getPreferences()
// const selectedDateFilter = ref({
//   label: t('this_month'),
//   value: 'this_month',
// })

// // ...existing code for watchers, functions, etc...
// // Note: TablesExTable handles data fetching automatically, no manual watchers needed

// const onDateFilterChange = (payload: { label: string; value: string }) => {
//   if (!payload?.value) return
//   const value = payload.value
//   switch (value) {
//     case 'today':
//     case 'this_week':
//     case 'this_month':
//     case 'this_year':
//       // your existing logic here...
//       break
//   }
// }

// onBeforeMount(() => {
//   // Get last day of current month
//   const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
//   // Set default date range to current month
//   startDate.value = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1).toString()
//   endDate.value = new CalendarDate(
//     today.getFullYear(),
//     today.getMonth() + 1,
//     lastDayOfMonth
//   ).toString()
//   modelValue.value.start = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
//   modelValue.value.end = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
// })

// // Initial load handled in the main onMounted above

// const onGenerateSettlement = () => {
//   router.push('/digital-wallet/settlement/generate')
// }

// Handle navigation to details page
const navigateToDetails = (rowId: string) => {
  router.push(`/transactions/detail/${rowId}`)
}

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

const handleViewDetails = (record: TransactionHistoryRecord) => {
  // Navigate to transaction details page
  navigateToDetails(record.id)
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
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlementBank',
    accessorKey: 'settlementBank',
    header: () => t('page.transaction.settlement_bank'),
    cell: ({ row }) => row.original.settlementBank || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlementType',
    accessorKey: 'settlementType',
    header: () => t('pages.transaction.settlement_type'),
    cell: ({ row }) => row.original.settlementType || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Auto', value: 'Auto' },
      { label: 'Manual', value: 'Manual' },
    ],
  },
  {
    id: 'transactionType',
    accessorKey: 'transactionType',
    header: () => t('pages.transaction.transaction_type'),
    cell: ({ row }) => getTransactionTypeKey(row.original.transactionType) || '-',
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Wallet Top up', value: 'Wallet Top up' },
      { label: 'Deeplink / Checkout', value: 'Deeplink / Checkout' },
      { label: 'Wallet Payment', value: 'Wallet Payment' },
      { label: 'QR Pay', value: 'QR Pay' },
    ],
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
    cell: ({ row }) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    enableColumnFilter: true,
    filterType: 'select',
    filterOptions: [
      { label: t('completed'), value: t('completed') },
      { label: t('pending'), value: t('pending') },
      { label: t('failed'), value: t('failed') },
    ],
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
</script>
