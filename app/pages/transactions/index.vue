<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Info Banner -->
    <div v-if="showInfoBanner"
      class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2">
      <div class="flex items-center space-x-2">
        <UIcon name="i-heroicons-light-bulb" class="text-warning w-4 h-4" />
        <span class="font-semibold text-xs">Tip</span>
        <span class="text-xs"> Apply filters to reflect changes in both the <strong>Transaction Summary</strong> and the <strong>Transaction</strong>.</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          size="xs"
          color="primary"
          @click="showInfoBanner = false"
        />
      </div>
    </div>
    <!-- Responsive Summary Cards -->
    <div class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
    <div
      v-for="card in summarys"
      :key="card.title"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2"
    >
      <!-- Title and Filter Label -->
      <div class="flex justify-between items-start">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ card.title }}</h3>
        <span class="text-xs font-medium text-primary whitespace-nowrap">
          {{ card.filterLabel }}
        </span>
      </div>

       <!-- Values -->
      <div class="flex flex-wrap justify-between gap-x-4">
        <div
          v-for="(val, idx) in card.values"
          :key="idx"
          class="text-md font-bold text-gray-900 dark:text-white flex items-baseline gap-1"
        >
          <span v-if="'currency' in val" class="text-xs font-medium">
            {{ val.currency }}
          </span>
          {{ useCurrency().formatAmount(val.value) }}
        </div>
      </div>

      <!-- Date Range -->
      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-1">
        <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-primary" />
        <span class="whitespace-nowrap">{{ card.dateRange }}</span>
      </div>
    </div>
  </div>

    <TablesExTable
    ref="table"
      :columns="columns"
      :table-id="TABLE_ID"
      :fetch-data-fn="fetchTransactionForTable"
      show-row-number
      show-date-filter
      enabled-auto-refresh
      enabled-repush
      @row-click="handleViewDetails"
    >
    <template #trailingHeader>
      <UTooltip :text="t('pages.transaction.repush_description')">
          <UButton 
            variant="outline"
            size="sm"
            @click="handleRepush()"> 
            {{ t('pages.transaction.repush') }}
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

import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, h, onMounted, ref, resolveComponent, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import StatusBadge from '~/components/StatusBadge.vue'
import BaseTable from '~/components/tables/BaseTable.vue'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import {
  exportToExcelStyled,
  exportToExcelWithUnicodeSupport,
  exportToPDFStyled,
  exportToPDFWithUnicodeSupport,
} from '~/composables/utils/exportUtils'
import { getPDFHeaders } from '~/composables/utils/pdfFonts'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type { TransactionHistoryRecord } from '~/models/transaction'

const showInfoBanner = ref(true)
const dateOptions = computed(() => {
  const todayDate = df.format(today)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31)

  return [
    { label: `${t('today')} <span class="text-xs">(${todayDate})</span>`, value: 'today' },
    {
      label: `${t('this_week')} <span class="text-xs">(${df.format(startOfWeek)} - ${df.format(endOfWeek)})</span>`,
      value: 'this_week',
    },
    {
      label: `${t('this_month')} <span class="text-xs">(${df.format(startOfMonth)} - ${df.format(endOfMonth)})</span>`,
      value: 'this_month',
    },
    {
      label: `${t('this_year')} <span class="text-xs">(${df.format(startOfYear)} - ${df.format(endOfYear)})</span>`,
      value: 'this_year',
    },
  ]
})

// Handle Repush Transaction
const handleRepush = () => {
    notification.showWarning({
      title: t('pages.transaction.info'),
      description: t('pages.transaction.info_des'),
    })
}

const summarys = [
  {
    title: 'Total Transaction',
    values: [{ value: 100 }],
    filterLabel: 'This month',
    dateRange: '01/08/2025 - 30/08/2025',
  },
  {
    title: 'Failed Transactions',
    values: [{ value: 5 }],
    filterLabel: 'This month',
    dateRange: '01/08/2025 - 30/08/2025',
  },
  {
    title: 'Total Amount',
    values: [
      { currency: 'KHR', value: 4000000 },
      { currency: 'USD', value: 157.75 },
    ],
    filterLabel: 'This month',
    dateRange: '01/08/2025 - 30/08/2025',
  },
  {
    title: 'Total Settlement',
    values: [
      { currency: 'KHR', value: 3900 },
      { currency: 'USD', value: 10 },
    ],
    filterLabel: 'This month',
    dateRange: '01/08/2025 - 30/08/2025',
  },
]


// Wrapper function for TablesExTable
const fetchTransactionForTable = async (params?: {
  page?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}) : Promise<TableFetchResult<TransactionHistoryRecord[]> | null>  => {
  loading.value = true
  try {
    const banks = ['ABA', 'ACLEDA', 'AMK'] as const
    const subBillers = [
      'Cambodia Electric Co.',
      'Smart Axiata',
      'Cellcard',
      'Ezecom',
      'Metfone',
      'Sabay Digital',
      'Foodpanda Cambodia',
      'Nham24',
      'Kerry Express',
      'J&T Express',
      'B-Hub Technology',
      'Phnom Penh Water Supply',
      'City Gas Cambodia',
      'Total Energies Cambodia',
      'ISPP International School',
    ]

    // Generate full dataset
    const fullData: TransactionHistoryRecord[] = Array.from({ length: 100 }, (_, i) => ({
      id: `txn-${i + 1}`,
      created_date: new Date(Date.now() - i * 86400000),
      bank_ref: `BANKREF-${i + 1000}`,
      collection_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_type: i % 2 === 0 ? 'Auto' : 'Manual',
      total_amount: 1000000 + i * 5000,
      currency_id: i % 2 === 0 ? 'USD' : 'KHR',
      status: [t('completed'), t('pending'), t('failed')][i % 3] as string,
      total_customer: i + 1,
      transaction_type: ['Wallet Top up', 'Deeplink / Checkout', 'Wallet Payment', 'QR Pay'][i % 4]!,
      sub_biller: subBillers[Math.floor(Math.random() * subBillers.length)]!,
    }))

    // Apply search filter if provided
    let filteredData = fullData
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredData = fullData.filter(item => 
        item.bank_ref.toLowerCase().includes(searchLower) ||
        item.collection_bank.toLowerCase().includes(searchLower) ||
        item.settlement_bank.toLowerCase().includes(searchLower) ||
        item.transaction_type.toLowerCase().includes(searchLower) ||
        item.sub_biller.toLowerCase().includes(searchLower) ||
        item.total_customer.toString().toLowerCase().includes(searchLower)
      )
    }

    // Apply date filter if provided
    if (params?.startDate && params?.endDate) {
      const startDate = new Date(params.startDate)
      const endDate = new Date(params.endDate)
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_date)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Calculate pagination
    const currentPage = params?.page || 1
    const currentPageSize = params?.pageSize || 10
    const totalRecords = filteredData.length
    const totalPages = Math.ceil(totalRecords / currentPageSize)
    
    // Apply pagination
    const startIndex = (currentPage - 1) * currentPageSize
    const endIndex = startIndex + currentPageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      total_record: totalRecords,
      total_page: totalPages,
    }
  } catch (error: unknown) {
    console.error('Error loading transaction data:', error)
    errorMsg.value = (error as Error).message || 'Failed to load transaction history.'
    errorHandler.handleApiError(error)
    return {
      data: [],
      total_record: 0,
      total_page: 0,
    }
  } finally {
    loading.value = false
  }
}

const { createSortableHeader, createRowNumberCell } = useTable()
const { t, locale } = useI18n()
const errorHandler = useErrorHandler()
const table = ref<InstanceType<typeof BaseTable> | null>(null)
const sortBy = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)
const selectedRows = computed(() => table.value?.getSelectedRows?.() ?? [])
const allRows = computed(() => table.value?.getAllRows() ?? [])
const router = useRouter()
const toast = useToast()
const notification = useNotification()

const TABLE_ID = 'transactions-history-table'

const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({
  label: '10',
  value: 10,
})
const total = ref(0)
const totalPage = ref(0)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const transactions = ref<TransactionHistoryRecord[]>([])
const loading = ref(false)
const errorMsg = ref('')

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

const userPreference = useUserPreferences().getPreferences()
const selectedDateFilter = ref({
  label: t('this_month'),
  value: 'this_month',
})

// ...existing code for watchers, functions, etc...
// Watch and convert modelValue to string ISO
watch(modelValue, (val) => {
  startDate.value =
    val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) ||
    new CalendarDate(today.getFullYear(), today.getMonth(), 1).toString()
  endDate.value =
    val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) ||
    new CalendarDate(today.getFullYear(), today.getMonth(), 30).toString()
  fetchTransactionHistory()
})

// Watch pagination
watch([page, pageSize.value], () => {
  fetchTransactionHistory()
})

watch(search, () => {
  page.value = 1 // Reset to first page on search
  fetchTransactionHistory()
})

const onDateFilterChange = (payload: { label: string; value: string }) => {
  if (!payload?.value) return
  const value = payload.value
  switch (value) {
    case 'today':
    case 'this_week':
    case 'this_month':
    case 'this_year':
      // your existing logic here...
      break
  }
}

// Fetch settlement data from API
const fetchTransactionHistory = async () => {
  loading.value = true
  try {
    const banks = ['ABA', 'ACLEDA', 'AMK'] as const
    const subBillers = [
      'Cambodia Electric Co.',
      'Smart Axiata',
      'Cellcard',
      'Ezecom',
      'Metfone',
      'Sabay Digital',
      'Foodpanda Cambodia',
      'Nham24',
      'Kerry Express',
      'J&T Express',
      'B-Hub Technology',
      'Phnom Penh Water Supply',
      'City Gas Cambodia',
      'Total Energies Cambodia',
      'ISPP International School',
    ]
    const fullData: TransactionHistoryRecord[] = Array.from({ length: 100 }, (_, i) => ({
      id: `txn-${i + 1}`,
      created_date: new Date(Date.now() - i * 86400000),
      bank_ref: `BANKREF-${i + 1000}`,
      collection_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_type: i % 2 === 0 ? 'Auto' : 'Manual',
      total_amount: 1000000 + i * 5000,
      currency_id: i % 2 === 0 ? 'USD' : 'KHR',
      status: [t('completed'), t('pending'), t('failed')][i % 3] as string,
      total_customer: i + 1,
      transaction_type: ['Wallet Top up', 'Deeplink / Checkout', 'Wallet Payment', 'QR Pay'][i % 4]!,
      sub_biller: subBillers[Math.floor(Math.random() * subBillers.length)]!,
    }))

    // ✅ Paging
    const pageStart = (page.value - 1) * pageSize.value.value
    const pageEnd = pageStart + pageSize.value.value
    const pagedData = fullData.slice(pageStart, pageEnd)

    transactions.value = pagedData
    total.value = fullData.length
    totalPage.value = Math.ceil(fullData.length / pageSize.value.value)
  } catch (error: any) {
    console.error('Error loading dummy data:', error.message)
    errorMsg.value = error.message || 'Failed to load transaction history.'
    errorHandler.handleApiError(error)
  } finally {
    loading.value = false
  }
}

const onPageSizeChange = () => {
  page.value = 1
  // fetchSettlementHistory()
}

// Filtered rows for table
const filteredData = computed(() =>
  transactions.value.filter((item) =>
    (item.total_customer.toString() ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

onBeforeMount(() => {
  // Get last day of current month
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  // Set default date range to current month
  startDate.value = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1).toString()
  endDate.value = new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    lastDayOfMonth
  ).toString()
  modelValue.value.start = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
  modelValue.value.end = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
})

// Initial load
onMounted(() => {
  fetchTransactionHistory()
})

const onGenerateSettlement = () => {
  router.push('/digital-wallet/settlement/generate')
}

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
  try {
    const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row: { original: any }) => row.original)
        : filteredData.value

    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }

    // Calculate total amount
    const totalAmount = dataToExport.reduce(
      (sum: number, item: { total_amount: number | string }) =>
        sum + (Number(item.total_amount) || 0),
      0
    )

    // Get current locale from the existing locale ref
    const currentLocale = locale.value as 'km' | 'en'

    // Create period string from date range
    const periodText = `${startDate.value} ${t('to')} ${endDate.value}`

    // Try the new Unicode-supported Excel export first, fallback to regular if it fails
    try {
      await exportToExcelWithUnicodeSupport(
        dataToExport,
        exportHeaders,
        `settlement-history-${new Date().toISOString().slice(0, 10)}.xlsx`,
        t('settlement_history_title'),
        t('settlement_history_subtitle', {
          date: new Date().toLocaleDateString(currentLocale === 'km' ? 'km-KH' : 'en-US'),
        }),
        {
          locale: currentLocale,
          t: t,
          currency: dataToExport[0]?.currency_id || 'USD',
          totalAmount: totalAmount,
          period: periodText,
        }
      )
    } catch (unicodeError) {
      console.warn('Unicode Excel export failed, falling back to standard Excel:', unicodeError)
      // Fallback to standard Excel export
      await exportToExcelStyled(
        dataToExport,
        exportHeaders,
        'settlement-history.xlsx',
        t('settlement_history_title'),
        t('settlement_history_subtitle', {
          date: new Date().toLocaleDateString(),
        })
      )
    }

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_excel', {
        count: dataToExport.length,
        selected: selectedRows.length > 0 ? t('selected') : '',
      }),
      color: 'success',
    })
  } catch (error) {
    console.error('Excel export error:', error)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_excel'),
      color: 'error',
    })
  }
}

const exportToPDFHandler = async () => {
  // ...existing export logic...
  try {
    const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row: { original: any }) => row.original)
        : filteredData.value
    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }

    // Calculate total amount
    const totalAmount = dataToExport.reduce(
      (sum: number, item: { total_amount: number | string }) =>
        sum + (Number(item.total_amount) || 0),
      0
    )

    // Get current locale from the existing locale ref
    const currentLocale = locale.value as 'km' | 'en'

    // Create period string from date range
    const periodText = `${startDate.value} to ${endDate.value}`

    try {
      await exportToPDFWithUnicodeSupport(
        dataToExport,
        pdfExportHeaders.value,
        `settlement-history-${new Date().toISOString().slice(0, 10)}.pdf`,
        'Transaction Report', // Let the function use dynamic titles
        'Transaction Report', // Let the function use dynamic titles
        periodText,
        {
          // company: 'WINGKH',
          // currency: dataToExport[0]?.currency_id || 'USD',
          totalAmount: totalAmount,
          locale: currentLocale,
          t: t, // Pass the translation function
        }
      )
    } catch (unicodeError) {
      console.warn('Unicode PDF export failed, falling back to standard PDF:', unicodeError)
      // Fallback to standard PDF export
      await exportToPDFStyled(
        dataToExport,
        pdfExportHeaders.value,
        'settlement-history.pdf',
        'Transaction Report', // Let the function use dynamic titles
        'Transaction Report', // Let the function use dynamic titles
        periodText,
        {
          company: 'WINGKH',
          currency: dataToExport[0]?.currency_id || 'USD',
          totalAmount: totalAmount,
          locale: currentLocale,
          t: t, // Pass the translation function
        }
      )
    }

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_pdf', {
        count: dataToExport.length,
        selected: selectedRows.length > 0 ? t('selected') : '',
      }),
      color: 'success',
    })
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

const handleExport = (item: { click: () => void }) => {
  if (item.click) {
    item.click()
  }
}

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
    id: 'created_date',
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('pages.transaction.created_date'), 'left'),
    cell: ({ row }) =>
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  {
    id: 'bank_ref',
    accessorKey: 'bank_ref',
    header: () => t('pages.transaction.bank_ref'),
    cell: ({ row }) => row.original.bank_ref || '-',
    enableSorting: true,
  },
  {
    id: 'collection_bank',
    accessorKey: 'collection_bank',
    header: () => t('collection_bank'),
    cell: ({ row }) => row.original.collection_bank || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlement_bank',
    accessorKey: 'settlement_bank',
    header: () => t('settlement_bank'),
    cell: ({ row }) => row.original.settlement_bank || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlement_type',
    accessorKey: 'settlement_type',
    header: () => t('settlement_type'),
    cell: ({ row }) => row.original.settlement_type || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Auto', value: 'Auto' },
      { label: 'Manual', value: 'Manual' },
    ],
  },
  {
    id: 'transaction_type',
    accessorKey: 'transaction_type',
    header: () => t('transaction_type'),
    cell: ({ row }) => row.original.transaction_type || '-',
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
    id: 'sub_biller',
    accessorKey: 'sub_biller',
    header: () => t('sub_biller'),
    cell: ({ row }) => row.original.sub_biller || '-',
    enableSorting: true,
  },
  {
    id: 'total_customer',
    accessorKey: 'total_customer',
    header : ({ column }) => createSortableHeader(column, t('pages.transaction.total_customer'), 'right'),
    cell: ({ row }) =>  h(
        'div',
        { class: 'text-right' },
        row.original.total_customer || '-',
      ),
  },
  {
    id: 'status',
    header: () => t('status.header'),
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
        useCurrency().formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
 
]
</script>
