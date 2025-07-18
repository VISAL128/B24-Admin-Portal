<template>
  <div class="flex flex-col h-full w-full space-y-4">
    <!-- Summary Cards -->
    <!-- Summary Card Section with Date Filter -->
    <div
      class="flex flex-col rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold text-2xl dark:text-white">
          {{ t('transaction_summary') }}
        </h2>
        <USelectMenu
          v-model="selectedDateFilter"
          :items="[
            { label: t('today'), value: 'today' },
            { label: t('this_week'), value: 'this_week' },
            { label: t('this_month'), value: 'this_month' },
            { label: t('this_year'), value: 'this_year' },
          ]"
          class="w-40"
          :search-input="false"
          @update:model-value="onDateFilterChange"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
        <!-- Your existing 4 cards as-is -->
        <div class="bg-white dark:bg-gray-900 rounded-md p-4 h-full">
          <h2 class="text-sm text-primary dark:text-white">{{ t('number_of_transaction') }}</h2>
          <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ 100 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-md p-4 h-full">
          <h2 class="text-sm text-primary dark:text-white">{{ t('total_amount') }}</h2>
          <p
            class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white inline-flex items-baseline gap-1"
          >
            <span class="text-sm">KHR</span><span>1,000,000</span>
          </p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-md p-4 h-full">
          <h2 class="text-sm text-primary dark:text-white">{{ t('total_settlement_amount') }}</h2>
          <p
            class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white inline-flex items-baseline gap-1"
          >
            <span class="text-sm">KHR</span><span>1,000,000</span>
          </p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-md p-4 h-full">
          <h2 class="text-sm text-primary dark:text-white">{{ t('failed_transactions') }}</h2>
          <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ 100 }}</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <!-- <UTable
        ref="table"
        :data="filteredData"
        :columns="columns"
        sticky
        class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <template #empty>
          <TableEmptyState />
        </template>
      </UTable> -->
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
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </BaseTable>

    <!-- Table Footer -->
    <div class="flex items-center justify-between px-1 py-1 text-sm text-muted">
      <span>
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
        {{ t('row_selected') }}
      </span>
      <div class="flex items-center gap-4">
        <!-- <USelect
            v-model="pageSize"
            :options="[{label: '10', value: 10}, {label: '25', value: 25}, {label: '50', value: 50}, {label: '100', value: 100}]"
            class="w-24"
            @change="onPageSizeChange"
          /> -->
        <USelectMenu
          v-model="pageSize"
          :items="[
            { label: '10', value: 10 },
            { label: '25', value: 25 },
            { label: '50', value: 50 },
            { label: '100', value: 100 },
          ]"
          class="w-24"
          :search-input="false"
          @change="onPageSizeChange"
        />
        <UPagination
          v-model="page"
          :page-size-options="[10, 25, 50, 100]"
          :page-count="totalPage"
          :items-per-page="pageSize.value"
          :total="total"
          v-on:update:page="page = $event"
        />
      </div>
    </div>
    <TransactionDetailDrawer
      :model-value="showTransactionDrawer"
      :transaction-id="selectedTransactionId ?? ''"
      @update:modelValue="(val) => (showTransactionDrawer = val)"
    />
  </div>
</template>

<script setup lang="ts">
const showSidebar = ref(false)
const selectedRecord = ref<SettlementHistoryRecord | null>(null)

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'transactions', active: true }],
})
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, h, onMounted, ref, resolveComponent, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TableEmptyState from '~/components/TableEmptyState.vue'
import BaseTable from '~/components/tables/BaseTable.vue'
import type { BaseTableColumn } from '~/components/tables/table'
import TransactionDetailDrawer from '~/components/TransactionDetailDrawer.vue'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import {
  exportToExcelStyled,
  exportToExcelWithUnicodeSupport,
  exportToPDFStyled,
  exportToPDFWithUnicodeSupport,
} from '~/composables/utils/exportUtils'
import { getPDFHeaders } from '~/composables/utils/pdfFonts'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type { SettlementHistoryRecord } from '~/models/settlement'
import type { TransactionHistoryRecord } from '~/models/transaction'

const dateToCalendarDate = (date: Date): CalendarDate =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
const showTransactionDrawer = ref(false)
const selectedTransactionId = ref<string | null>(null)
const { t, locale } = useI18n()
const { getSettlementHistory } = useSupplierApi()
const errorHandler = useErrorHandler()
const table = ref<InstanceType<typeof BaseTable> | null>(null)

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
watch([page, pageSize], () => {
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
    const banks = ['ABA', 'Acleda', 'AMK'] as const
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
      status: ['completed', 'pending', 'failed'][i % 3] as string,
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
    lastDayOfMonth // Use last day of month
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
  selectedTransactionId.value = rowId
  showTransactionDrawer.value = true
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
  if (record.success === 0 && record.fail === 0) {
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
  // { accessorKey: "id", header: t("Settlement ID") },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    header: t('date'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
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
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
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

  // { id: 'created_by', accessorKey: 'created_by', header: t('settled_by') },
  {
    id: 'status',
    accessorKey: 'status', // optional if you need sorting/filtering
    header: t('status.header'),
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: t('completed'), value: 'completed' },
      { label: t('pending'), value: 'pending' },
      { label: t('failed'), value: 'failed' },
    ],
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
