<template>
  <div class="flex flex-col h-full w-full space-y-4 overflow-hidden">
    <!-- Header -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex flex-col flex-1 items-start justify-between gap-2 px-4 py-4">
        <h1 class="text-sm font-bold text-primary dark:text-white">
          {{ t('number_of_transaction') }}
        </h1>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ 100 }}
        </h1>
      </div>
      <div class="flex flex-col flex-1 items-start justify-between gap-2 px-4 py-4">
        <h1 class="text-sm font-semibold text-primary dark:text-white">
          {{ t('total_amount') }}
        </h1>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">KHR 1000000</h1>
      </div>
      <div class="flex flex-col flex-1 items-start justify-between gap-2 px-4 py-4">
        <h1 class="text-sm font-semibold text-primary dark:text-white">
          {{ t('total_settlement_amount') }}
        </h1>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">100</h1>
      </div>
      <div class="flex flex-col flex-1 items-start justify-between gap-2 px-4 py-4">
        <h1 class="text-sm font-semibold text-primary dark:text-white">
          {{ t('failed_transactions') }}
        </h1>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ 100 }}
        </h1>
      </div>
    </div>
    <div
      class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="search" :placeholder="t('search_by_settler')" class="w-64" />
        <UPopover>
          <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
            <template v-if="modelValue.start">
              <template v-if="modelValue.end">
                {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} -
                {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
              </template>
              <template v-else>
                {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
              </template>
            </template>
            <template v-else>
              {{ t('pick_a_date') }}
            </template>
          </UButton>

          <template #content>
            <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
          </template>
        </UPopover>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="primary" icon="i-lucide-play" @click="onGenerateSettlement">
          {{ t('generate_settlement') }}
        </UButton>

        <UDropdownMenu :items="exportItems" :content="{ align: 'end' }" @select="handleExport">
          <UButton icon="i-lucide-download" trailing-icon="i-lucide-chevron-down">{{
            t('export')
          }}</UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      :data="filteredData"
      :columns="columns"
      sticky
      class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable>

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
          :items="DEFAULT_PAGE_SIZE_OPTIONS"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'transactions', active: true }],
})
import { h, ref, computed, onMounted, shallowRef, watch, resolveComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { SettlementHistoryRecord, SettlementHistoryQuery, Supplier } from '~/models/settlement'
import { exportToExcelStyled } from '~/composables/utils/exportUtils'
import { useI18n } from 'vue-i18n'
import TableEmptyState from '~/components/TableEmptyState.vue'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { DEFAULT_PAGE_SIZE_OPTIONS } from '~/utils/constants'

const { t } = useI18n()
const { getSettlementHistory } = useSupplierApi()
const errorHandler = useErrorHandler()

const table = useTemplateRef('table')
const router = useRouter()
const toast = useToast()
const notification = useNotification()
const pref = useUserPreferences().getPreferences()

const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({
  label: pref?.defaultPageSize.toString() || DEFAULT_PAGE_SIZE.label,
  value: pref?.defaultPageSize || DEFAULT_PAGE_SIZE.value,
})
const total = ref(0)
const totalPage = ref(0)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const settlements = ref<SettlementHistoryRecord[]>([])
const loading = ref(false)
const errorMsg = ref('')

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

const userPreference = useUserPreferences().getPreferences()

// Watch and convert modelValue to string ISO
watch(modelValue, (val) => {
  startDate.value =
    val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) ||
    new CalendarDate(today.getFullYear(), today.getMonth(), 1).toString()
  endDate.value =
    val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) ||
    new CalendarDate(today.getFullYear(), today.getMonth(), 30).toString()
  fetchSettlementHistory()
})

// Watch pagination
watch([page, pageSize], () => {
  fetchSettlementHistory()
})

// Fetch settlement data from API
const fetchSettlementHistory = async () => {
  loading.value = true
  try {
    const payload: SettlementHistoryQuery = {
      name: search.value || undefined,
      page_size: pageSize.value.value,
      page: page.value,
      start_date: startDate.value,
      end_date: endDate.value,
      status: 'completed', // Optional filter if needed
    }

    const data = await getSettlementHistory(payload)
    settlements.value = data?.records ?? []
    total.value = data?.total_record ?? 0
    totalPage.value = data?.total_page ?? 0
  } catch (error: any) {
    console.error('Error loading settlement history:', error.message)
    errorMsg.value = error.message || 'Failed to load settlement history.'
    // Show error notification to user
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
  settlements.value.filter((item) =>
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
  fetchSettlementHistory()
})

const onGenerateSettlement = () => {
  router.push('/settlement/wallet-settlement/generate')
}

// Handle navigation to details page
const navigateToDetails = (settlementId: string) => {
  router.push(`/settlement/details/${settlementId}`)
}

const exportHeaders = [
  { key: 'settlementId', label: t('settlement_id') },
  { key: 'settlementDate', label: t('settlement_date') },
  { key: 'totalSupplier', label: t('total_supplier') },
  { key: 'totalAmount', label: t('total_amount') },
  { key: 'settledBy', label: t('settled_by') },
  { key: 'status', label: t('status') },
]

const exportToExcelHandler = async () => {
  try {
    const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
    const dataToExport =
      selectedRows.length > 0 ? selectedRows.map((row) => row.original) : filteredData.value
    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }
    await exportToExcelStyled(
      dataToExport,
      exportHeaders,
      'settlement-history.xlsx',
      t('settlement_history_title'),
      t('settlement_history_subtitle', {
        date: new Date().toLocaleDateString(),
      })
    )
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
      selectedRows.length > 0 ? selectedRows.map((row) => row.original) : filteredData.value
    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }
    await exportToPDF(dataToExport, exportHeaders, 'settlement-history.pdf')
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
  navigateToDetails(record.id)
}

const columns: TableColumn<SettlementHistoryRecord>[] = [
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
    accessorKey: 'created_date',
    header: t('transaction'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
  },
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
  {
    accessorKey: 'total_amount',
    header: () => h('div', { class: 'text-right' }, t('total_amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatAmount(row.original.total_amount, row.original.currency_id)
      ),
  },
  { accessorKey: 'currency_id', header: t('settlement.currency') },
  { accessorKey: 'created_by', header: t('settled_by') },
  {
    accessorKey: 'status', // optional if you need sorting/filtering
    header: t('status.header'),
    cell: ({ row }) => {
      // return h('span', {
      //   class: `text-sm font-medium`
      // }, `Total: ${row.original.total_Settled}`)

      const success = row.original.success
      const fail = row.original.failed
      const total = row.original.total_settled

      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')

      return h('div', { class: 'flex gap-2 items-center' }, [
        // h(UBadge, { color: 'gray', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
        //   h(Icon, { name: 'i-lucide-sigma', class: 'w-4 h-4' }),
        //   h('span', {}, total)
        // ]),
        h(
          UBadge,
          {
            color: 'primary',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [
            // h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }),
            h('span', { class: 'text-sm' }, `${t('total')}: ${total}`),
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
          () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, fail)]
        ),
      ])
    },
  },
  // Add an action column for viewing details
  {
    id: 'actions',
    header: t('actions'),
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(resolveComponent('UButton'), {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-lucide-eye',
          size: 'sm',
          onClick: handleViewDetails(row.original),
          // title: translations.view_details
        }),
      ]),
  },
]

function exportToPDF(
  dataToExport: SettlementHistoryRecord[],
  exportHeaders: { key: string; label: string }[],
  arg2: string
) {
  throw new Error('Function not implemented.')
}
</script>
