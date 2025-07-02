<template>
  <div class="flex flex-col h-full w-full space-y-4 overflow-hidden">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow">
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
          <UButton icon="i-lucide-download" trailing-icon="i-lucide-chevron-down">{{ t('export') }}</UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Table -->
    <UTable ref="table" :data="filteredData" :columns="columns" sticky class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable>

    <!-- Table Footer -->
    <div class="flex items-center justify-between px-1 py-1 text-sm text-muted">
      <span>
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
      </span>
      <div class="flex items-center gap-4">
        <USelect
          v-model="pageSize"
          :options="[10, 20, 50, 100]"
          class="w-24"
          @change="onPageSizeChange"
        />
        <UPagination
          v-model="page"
          :page-count="Math.ceil(total / pageSize)"
          :total="total"
        />
      </div>  
  </div>
</div>
</template>

<script setup lang="ts">

definePageMeta({
  auth: false,
});
import {
  h, ref, computed, onMounted, shallowRef, watch, resolveComponent
} from 'vue'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { SettlementHistoryRecord, SettlementHistoryQuery, Supplier } from '~/models/settlement'
import { exportToExcelStyled, exportToPDF } from '~/composables/utils/exportUtils'
import { useI18n } from 'vue-i18n'
import TableEmptyState from '~/components/TableEmptyState.vue'

const { t } = useI18n()
const { getSettlementHistory, getSuppliers } = useSupplierApi()
const { execute } = useApiExecutor()

const table = useTemplateRef('table')
const router = useRouter()
const { copy } = useClipboard()
const toast = useToast()

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const suppliers = ref<Supplier[]>([])
const settlements = ref<SettlementHistoryRecord[]>([])
const loading = ref(false)
const errorMsg = ref('')

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
})

// Watch and convert modelValue to string ISO
watch(modelValue, (val) => {
  startDate.value = val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || new CalendarDate(today.getFullYear(), today.getMonth(), 1).toString()
  endDate.value = val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || new CalendarDate(today.getFullYear(), today.getMonth(), 30).toString()
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
      page_size: pageSize.value,
      page: page.value,
      start_date: startDate.value,
      end_date: endDate.value,
      status: 'complete', // Optional filter if needed
    }

    const data = await getSettlementHistory(payload)
    settlements.value = data?.records ?? []
    total.value = data?.total_record ?? 0
  } catch (error: any) {
    console.error('Error loading settlement history:', error.message)
    errorMsg.value = error.message || 'Failed to load settlement history.'
  } finally {
    loading.value = false
  }
}

const onPageSizeChange = () => {
  page.value = 1
  fetchSettlementHistory()
}

// Filtered rows for table
const filteredData = computed(() =>
  settlements.value.filter(item =>
    (item.settled_by ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

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
  { key: 'status', label: t('status') }
]

const exportToExcelHandler = async () => {
  try {
    const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
    const dataToExport = selectedRows.length > 0 ? selectedRows.map(row => row.original) : filteredData.value
    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning'
      })
      return
    }
    await exportToExcelStyled(
      dataToExport,
      exportHeaders,
      'settlement-history.xlsx',
      t('settlement_history_title'),
      t('settlement_history_subtitle', { date: new Date().toLocaleDateString() })
    )
    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_excel', { count: dataToExport.length, selected: selectedRows.length > 0 ? t('selected') : '' }),
      color: 'success'
    })
  } catch (error) {
    console.error('Excel export error:', error)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_excel'),
      color: 'error'
    })
  }
}

const exportToPDFHandler = async () => {
  try {
    const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
    const dataToExport = selectedRows.length > 0 ? selectedRows.map(row => row.original) : filteredData.value
    if (dataToExport.length === 0) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning'
      })
      return
    }
    await exportToPDF(dataToExport, exportHeaders, 'settlement-history.pdf')
    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_pdf', { count: dataToExport.length, selected: selectedRows.length > 0 ? t('selected') : '' }),
      color: 'success'
    })
  } catch (error) {
    console.error('PDF export error:', error)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_pdf'),
      color: 'error'
    })
  }
}

const exportItems = ref<DropdownMenuItem[]>([
  { label: t('pdf'),
    icon: 'i-lucide-file-text',
    onSelect(){
      exportToPDFHandler()
    }
  },
  { 
    label: t('excel'),
    icon: 'i-lucide-file-spreadsheet',
    onSelect(){
      exportToExcelHandler()
    }
  }
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
    item.click();
  }
}

const columns: TableColumn<SettlementHistoryRecord>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  { accessorKey: 'settlement_id', header: t('Settlement ID') },
  {
    accessorKey: 'settlement_date',
    header: t('Settlement Date'),
    cell: ({ row }) =>
      new Date(row.getValue('settlement_date')).toLocaleDateString()
  },
  { accessorKey: 'total_supplier', header: t('Total Supplier') },
  {
    accessorKey: 'total_amount',
    header: 'Total Amount',
    cell: ({ row }) =>
      row.getValue('total_amount')
  },
  { accessorKey: 'currency', header: 'Currency' },
  { accessorKey: 'settled_by', header: 'Settled By' },
  {
    accessorKey: 'status', // optional if you need sorting/filtering
    header: 'Status',
    cell: ({ row }) => {
      const success = row.original.success
      const fail = row.original.fail
      const total = row.original.total_Settled

      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')

      return h('div', { class: 'flex gap-2 items-center' }, [
        h(UBadge, { color: 'gray', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
          h(Icon, { name: 'i-lucide-sigma', class: 'w-4 h-4' }),
          h('span', {}, total)
        ]),
        h(UBadge, { color: 'success', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
          h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }),
          h('span', {}, success)
        ]),
        h(UBadge, { color: 'error', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
          h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }),
          h('span', {}, fail)
        ])
      ])
    }
  },
  // Add an action column for viewing details
  {
    id: 'actions',
    header: translations.actions,
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h(resolveComponent('UButton'), {
        color: 'primary',
        variant: 'ghost',
        icon: 'i-lucide-eye',
        size: 'sm',
        onClick: () => navigateToDetails(row.original.settlement_id),
        title: translations.view_details
      }, () => translations.view)
    ])
  }
]
</script>
