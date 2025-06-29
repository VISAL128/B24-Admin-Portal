<template>
  <div class="flex flex-col h-full w-full space-y-4 overflow-hidden">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="search" placeholder="Search by settler..." class="w-64" />
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
              Pick a date
            </template>
          </UButton>

          <template #content>
            <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
          </template>
        </UPopover>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="primary" icon="i-lucide-play" @click="onGenerateSettlement">
          Generate Settlement
        </UButton>
        <UDropdownMenu :items="exportItems" :content="{ align: 'end' }">
          <UButton icon="i-lucide-download" trailing-icon="i-lucide-chevron-down">Export</UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Table -->
    <UTable ref="table" :data="filteredData" :columns="columns" sticky class="flex-1 overflow-auto" />

    <!-- Table Footer -->
    <div class="px-4 py-3.5 text-sm text-muted">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  h, ref, computed, onMounted, shallowRef, watch, resolveComponent
} from 'vue'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { TableColumn } from '@nuxt/ui'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { SettlementHistoryRecord, SettlementHistoryQuery, Supplier } from '~/models/settlement'
import {
  exportSettlementToPDF,
  exportSettlementToExcel
} from '~/composables/utils/exportUtils'

const { getSettlementHistory, getSuppliers } = useSupplierApi()
const { execute } = useApiExecutor()

const table = useTemplateRef('table')
const router = useRouter()
const { copy } = useClipboard()
const toast = useToast()

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const suppliers = ref<Supplier[]>([])
const settlements = ref<SettlementHistoryRecord[]>([])
const loading = ref(false)
const errorMsg = ref('')

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const modelValue = shallowRef({
  start: new CalendarDate(2024, 6, 1),
  end: new CalendarDate(2024, 6, 30)
})

// Watch and convert modelValue to string ISO
watch(modelValue, (val) => {
  startDate.value = val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  endDate.value = val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  fetchSettlementHistory()
})

// Fetch settlement data from API
const fetchSettlementHistory = async () => {
  loading.value = true
  try {
    const payload: SettlementHistoryQuery = {
      page: 1,
      limit: 100,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      // status: 'paid', // Optional filter if needed
    }

    const data = await getSettlementHistory(payload)
    settlements.value = data?.records ?? []
  } catch (error: any) {
    console.error('Error loading settlement history:', error.message)
    errorMsg.value = error.message || 'Failed to load settlement history.'
  } finally {
    loading.value = false
  }
}

// Filtered rows for table
const filteredData = computed(() =>
  settlements.value.filter(item =>
    item.settledBy.toLowerCase().includes(search.value.toLowerCase())
  )
)

// Initial load
onMounted(() => {
  fetchSettlementHistory()
})

const onGenerateSettlement = () => {
  router.push('/settlement/generatereport')
}

const exportItems = [
  { label: 'PDF', icon: 'i-lucide-file-text', click: () => exportSettlementToPDF(filteredData.value) },
  { label: 'Excel', icon: 'i-lucide-file-spreadsheet', click: () => exportSettlementToExcel(filteredData.value) }
]

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
  { accessorKey: 'settlementId', header: 'Settlement ID' },
  {
    accessorKey: 'settlementDate',
    header: 'Settlement Date',
    cell: ({ row }) =>
      new Date(row.getValue('settlementDate')).toLocaleDateString()
  },
  { accessorKey: 'totalSupplier', header: 'Total Supplier' },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) =>
      h('div', { class: 'text-right font-medium' }, `$${row.getValue('totalAmount')}`)
  },
  { accessorKey: 'settledBy', header: 'Settled By' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = {
        paid: 'success',
        failed: 'error',
        refunded: 'warning'
      }[row.getValue('status') as string]

      return h(resolveComponent('UBadge'), {
        color,
        variant: 'subtle',
        class: 'capitalize'
      }, () => row.getValue('status'))
    }
  }
]
</script>
