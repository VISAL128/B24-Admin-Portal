<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      <!-- Total Transaction -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Transaction</h3>
        <p class="text-xl font-bold">100</p>
      </div>
      
      <!-- Failed Transactions -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Failed Transactions</h3>
        <p class="text-xl font-bold">5</p>
      </div>
      
      <!-- Total Amount KHR -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Amount</h3>
        <p class="text-lg font-bold">
          <span class="text-xs font-medium">KHR</span> 4,000,000
        </p>
      </div>
      
      <!-- Total Amount USD -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Amount</h3>
        <p class="text-lg font-bold">
          <span class="text-xs font-medium">USD</span> 50
        </p>
      </div>
      
      <!-- Total Settlement -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Settlement</h3>
        <p class="text-lg font-bold">
          <span class="text-xs font-medium">KHR</span> 3,900
        </p>
      </div>
      
      <!-- Total Split USD -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Settlement</h3>
        <p class="text-lg font-bold">
          <span class="text-xs font-medium">USD</span> 10
        </p>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <BaseTable
        :data="filteredData"
        :columns="columns"
        table-id="transaction-history-table"
        border-class="border-gray-200 dark:border-gray-700"
        @filter-change="handleFilterChange"
        @row-click="(row) => navigateToDetails(row.id)"
        @search-change="(val) => (search = val)"
        @date-range-change="
          ({ start, end }) => {
            startDate = start
            endDate = end
            fetchTransactionHistory()
          }
        "
        :page="page"
        :page-size="pageSize.value"
        :total="total"
        :total-page="totalPage"
        @update:page="(val) => (page = val)"
        @update:pageSize="
          (val) => {
            pageSize.value = val
            page = 1
          }
        "
      >
        <template #empty>
          <TableEmptyState />
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
const showSidebar = ref(false)
const selectedRecord = ref<SettlementHistoryRecord | null>(null)

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
import TableEmptyState from '~/components/TableEmptyState.vue'
import BaseTable from '~/components/tables/BaseTable.vue'
import type { BaseTableColumn } from '~/components/tables/table'
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
import type { SettlementHistoryRecord } from '~/models/settlement'
import type { TransactionHistoryRecord } from '~/models/transaction'

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
      settled_by: `User ${i + 1}`,
      transaction_type: ['Wallet Top up', 'Deeplink / Checkout', 'Wallet Payment', 'QR Pay'][i % 4],
      sub_biller: subBillers[Math.floor(Math.random() * subBillers.length)],
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
    (item.settled_by ?? '').toLowerCase().includes(search.value.toLowerCase())
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

const handleViewDetails = (record: SettlementHistoryRecord) => async () => {
  if (record.success === 0 && record.failed === 0) {
    await notification.showWarning({
      title: t('no_transactions_found'),
      description: t('no_transactions_found_desc'),
    })
    return
  }
  selectedRecord.value = record
  showSidebar.value = true
}
const handleFilterChange = (columnId: string, value: string) => {
  console.log('Filter changed:', columnId, value)
  // Optional: trigger fetch or other logic
}

const columns: BaseTableColumn<any>[] = [
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
    enableHiding: false,
  },
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }) => h('div', { class: 'text-left' }, row.index + 1),
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    // header: ({ column }) =>
    //   createSortableHeader(column, t('date'), 'created_date', 'left', (order) => {
    //     // Call your API with the new sorting order
    //     console.log('Sort order for created_date:', order) // 'asc' | 'desc' | null
    //     // Trigger your own fetch with the column and direction
    //     sortBy.value = 'created_date'
    //     sortDirection.value = order
    //     fetchTransactionHistory()
    //   }),
    header: t('date'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
  },
  {
    id: 'bank_ref',
    accessorKey: 'bank_ref',
    header: t('bank_ref'),
  },
  {
    id: 'collection_bank',
    accessorKey: 'collection_bank',
    header: t('collection_bank'),
  },
  {
    id: 'settlement_bank',
    accessorKey: 'settlement_bank',
    header: t('settlement_bank'),
  },
  {
    id: 'settlement_type',
    accessorKey: 'settlement_type',
    header: t('settlement_type'),
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: () => h('div', { class: 'text-right' }, t('total_amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatAmount(row.original.total_amount, row.original.currency_id)
      ),
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    header: t('settlement.currency'),
    enableColumnFilter: true,
    filterOptions: [
      { label: 'USD', value: 'USD' },
      { label: 'KHR', value: 'KHR' },
    ],
    enableSorting: true,
  },
  {
    id: 'transaction_type',
    accessorKey: 'transaction_type',
    header: t('transaction_type'),
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
    header: t('sub_biller'),
    enableSorting: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('status.header'),
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: t('completed'), value: 'completed' },
      { label: t('pending'), value: 'pending' },
      { label: t('failed'), value: 'failed' },
    ],
    cell: ({ row }: any) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    // cell: ({ row }) => {
    //   // return h('span', {
    //   //   class: `text-sm font-medium`
    //   // }, `Total: ${row.original.total_Settled}`)

    //   const success = row.original.success
    //   const fail = row.original.fail
    //   const total = row.original.total_settled

    //   const UBadge = resolveComponent('UBadge')
    //   const Icon = resolveComponent('UIcon')

    //   return h('div', { class: 'flex gap-2 items-center' }, [
    //     // h(UBadge, { color: 'gray', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
    //     //   h(Icon, { name: 'i-lucide-sigma', class: 'w-4 h-4' }),
    //     //   h('span', {}, total)
    //     // ]),
    //     h(
    //       UBadge,
    //       {
    //         color: 'primary',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [
    //         // h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }),
    //         h('span', { class: 'text-sm' }, `${t('total')}: ${total}`),
    //       ]
    //     ),
    //     // Success and Fail badges
    //     h(
    //       UBadge,
    //       {
    //         color: 'success',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }), h('span', {}, success)]
    //     ),
    //     h(
    //       UBadge,
    //       {
    //         color: 'error',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, fail)]
    //     ),
    //   ])
    // },
  },
  // Add an action column for viewing details
  // {
  //   id: 'actions',
  //   header: t('actions'),
  //   cell: ({ row }) =>
  //     h('div', { class: 'flex items-center gap-2' }, [
  //       h(resolveComponent('UButton'), {
  //         color: 'primary',
  //         variant: 'ghost',
  //         icon: 'i-lucide-eye',
  //         size: 'sm',
  //         onClick: handleViewDetails(row.original),
  //         // title: translations.view_details
  //       }),
  //     ]),
  // },
]
</script>
