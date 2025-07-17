<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { ref, watch } from 'vue'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useStatusColor } from '~/composables/utils/useStatusColor'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import SumTranDataUnderTable from '~/components/tables/SumTranDataUnderTable.vue'
import type {
  SettlementHistoryDetail,
  // SettlementHistoryQuery,
  SettlementHistoryDetailQuery,
  TransactionAllocation,
} from '~/models/settlement'
import { useTable } from '~/composables/utils/useTable'

const { t } = useI18n()
const format = useFormat()
const { getStatusBackgroundColor } = useStatusColor()
const userPreferences = useUserPreferences().getPreferences()
const { createRowNumberCell, createSortableHeader } = useTable()
const clipboard = ref(useClipboard())

interface Props {
  settlementHistorys: SettlementHistoryDetail[]
  settlementId: string
  totalPage: number
  total: number
  currentQuery: SettlementHistoryDetailQuery
  onSearchSubmit?: (query: SettlementHistoryDetailQuery) => void
  currency?: string
}
const props = defineProps<Props>()
const settlementHistoryQuery = ref({
  settlement_history_id: props.settlementId,
  search: props.currentQuery.search || '',
  page: props.currentQuery.page || 1,
  page_size: props.currentQuery.page_size || 10,
})

// Watch for changes in the parent's currentQuery and sync with local state
watch(
  () => props.currentQuery,
  (newQuery) => {
    settlementHistoryQuery.value = {
      settlement_history_id: newQuery.settlement_history_id || props.settlementId,
      search: newQuery.search || '',
      page: newQuery.page || 1,
      page_size: newQuery.page_size || 10,
    }
  },
  { deep: true, immediate: true }
)
// const pageSize = ref<{ label: string; value: number }>(
//   props.currentQuery.page_size
//     ? { label: props.currentQuery.page_size.toString(), value: props.currentQuery.page_size }
//     : APP_CONSTANTS.DEFAULT_PAGE_SIZE
// )
// const onPageSizeChange = () => {
//   settlementHistoryQuery.value.page = 1
//   settlementHistoryQuery.value.page_size = pageSize.value?.value || 10
//   // Emit the search event with the updated query
//   props.onSearchSubmit?.(settlementHistoryQuery.value)
// }
// function onPageUpdate(page: number) {
//   settlementHistoryQuery.value.page = page
//   // Emit the search event with the updated query
//   props.onSearchSubmit?.(settlementHistoryQuery.value)
// }

const handleSearchSubmit = () => {
  settlementHistoryQuery.value.page = 1
  props.onSearchSubmit?.(settlementHistoryQuery.value)
}

const openSlideover = ref(false)
const openSliderWithData = ref<SettlementHistoryDetail | null>(null)

// This function is search locally in the table
// const filteredSettlementHistorys = computed(() => {
//   const searchTerm = (settlementHistoryQuery.value.search || '').toLowerCase()
//   if (searchTerm) {
//     return props.settlementHistorys.filter((item) => {
//       return (
//         item.supplier.name.toLowerCase().includes(searchTerm) ||
//         item.cpo?.code?.toLowerCase().includes(searchTerm) ||
//         item.cpo?.name?.toLowerCase().includes(searchTerm) ||
//         item.settle_amount.toString().includes(searchTerm) ||
//         item.status.toLowerCase().includes(searchTerm)
//       )
//     })
//   }
//   return props.settlementHistorys
// })

const columns = ref<TableColumn<SettlementHistoryDetail>[]>([
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }) => h('div', { class: 'text-left' }, row.index + 1),
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  // {
  //   accessorKey: 'supplier.name',
  //   header: () => t('settlement.supplier'),
  //   size: 150,
  //   maxSize: 150,
  // },
  {
    accessorKey: 'cpo.code',
    header: () => t('settlement.sub_biller.code'),
    cell: ({ row }) => row.original.cpo?.code || 'N/A',
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: 'cpo.name',
    header: () => t('settlement.sub_biller.name'),
    cell: ({ row }) => row.original.cpo?.name || 'N/A',
    size: 200,
    maxSize: 200,
  },
  {
    accessorKey: 'settle_amount',
    header: () => h('div', { class: 'text-right' }, t('settlement.amount')),
    cell: ({ row }) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.settle_amount)),
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: 'tran_date',
    header: () => t('transaction_date'),
    cell: ({ row }) => {
      return h('div', { class: 'text-sm' }, [
        format.formatDateTime(row.original.tran_date, {
          dateStyle: userPreferences?.dateFormat || 'medium',
          timeStyle: userPreferences?.timeFormat || 'short',
        }),
      ])
    },
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: 'settlement_bank_name',
    header: () => t('settlement.generate.form.bank'),
    cell: ({ row }) => {
      return h('div', { class: 'text-sm' }, row.original.settlement_bank_name || '-')
    },
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: 'status',
    header: () => t('settlement.status'),
    cell: ({ row }) => {
      const status = row.original.status
      const colorClass = getStatusBackgroundColor(status)
      return h(
        'span',
        { class: `px-2 py-1 rounded-full text-xs font-medium ${colorClass}` },
        status
      )
    },
    size: 120,
    maxSize: 120,
  },
])

const onRowSelect = (row: TableRow<SettlementHistoryDetail>) => {
  openSlideover.value = true
  openSliderWithData.value = row.original
}

const closeSlideover = () => {
  openSlideover.value = false
  openSliderWithData.value = null
}

const sorting = ref([
  {
    id: 'transaction_date',
    desc: true,
  },
])

function onCopy(value: string) {
  clipboard.value.copy(value)
}
// Transaction allocations table columns
const allocationColumns = ref<TableColumn<TransactionAllocation>[]>([
  // Row number
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }) => createRowNumberCell(row, table),
    size: 30,
  },
  {
    accessorKey: 'transaction_date',
    header: ({ column }) => createSortableHeader(column, t('transaction_date')),
    cell: ({ row }) => {
      return format.formatDateTime(row.original.transaction_date, {
        dateStyle: userPreferences?.dateFormat || 'medium',
        timeStyle: userPreferences?.timeFormat || 'short',
      })
    },
    enableSorting: true,
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, t('settlement.amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium' },
        useCurrency().formatAmount(row.original.amount)
      ),
  },
])
</script>
<template>
  <UCard>
    <template #header>
      <div class="flex flex-row justify-baseline items-center gap-4">
        <h2 class="text-lg font-semibold">{{ $t('settlement.history') }}</h2>
        <UInput
          v-model="settlementHistoryQuery.search"
          :placeholder="$t('settlement.search_placeholder')"
          class="w-64"
          icon="i-lucide-search"
          @keyup.enter="handleSearchSubmit"
        />
      </div>
    </template>
    <UTable
      ref="table"
      :data="props.settlementHistorys"
      :columns="columns"
      sticky
      class="w-full h-full"
      :style="{ maxHeight: '400px', minHeight: '300px' }"
      @select="onRowSelect"
    />
    <USlideover
      v-model:open="openSlideover"
      :title="t('settlement.title')"
      side="right"
      @close="closeSlideover"
    >
      <template #body>
        <div v-if="openSliderWithData" class="flex flex-col h-full">
          <!-- Settlement Summary -->
          <div class="border-b pb-4 flex-shrink-0">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">{{
                  t('settlement.sub_biller.code')
                }}</label>
                <p class="text-sm font-bold">{{ openSliderWithData.cpo?.code || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">{{
                  t('settlement.sub_biller.name')
                }}</label>
                <p class="text-sm font-bold">{{ openSliderWithData.cpo?.name || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">{{ t('bank_ref') }}</label>
                <div class="flex items-start gap-2">
                  <p class="text-sm font-bold break-all flex-1 min-w-0">
                    {{ openSliderWithData.bank_ref_id || '-' }}
                  </p>
                  <UIcon
                    v-if="!clipboard.isCopied"
                    name="i-lucide-copy"
                    class="cursor-pointer text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                    @click="onCopy(openSliderWithData.bank_ref_id)"
                  />
                  <UIcon v-else name="i-lucide-check" class="text-green-500 flex-shrink-0 mt-0.5" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">
                  {{ t('bank') }}
                </label>
                <p class="text-sm font-bold">
                  {{ openSliderWithData.settlement_bank_name || '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Transaction Allocations Table -->
          <div class="flex-1 flex flex-col mt-2 gap-2 min-h-0">
            <h3 class="text-lg font-semibold flex-shrink-0">
              {{ t('settlement.transaction_allocations') }}
            </h3>
            <div
              v-if="
                openSliderWithData.tran_allocates && openSliderWithData.tran_allocates.length > 0
              "
              class="flex flex-col gap-2 flex-1 min-h-0"
            >
              <div class="flex-shrink-0">
                <SumTranDataUnderTable
                  :total-transactions="openSliderWithData.tran_allocates.length"
                  :amount="
                    openSliderWithData.tran_allocates.reduce(
                      (sum, allocation) => sum + allocation.amount,
                      0
                    )
                  "
                  :currency="props.currency"
                />
              </div>
              <div class="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                <UTable
                  v-model:sorting="sorting"
                  :data="openSliderWithData.tran_allocates"
                  :columns="allocationColumns"
                  sticky
                  class="h-full"
                />
              </div>
            </div>
            <div v-else class="flex-1 flex items-center justify-center text-gray-500">
              <p>{{ t('settlement.no_transaction_allocations') }}</p>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
    <!-- <template #footer>
      <div v-if="false" class="flex items-center gap-4">
        <USelectMenu
          v-model="pageSize"
          :items="APP_CONSTANTS.DEFAULT_PAGE_SIZE_OPTIONS"
          class="w-24"
          :search-input="false"
          @change="onPageSizeChange"
        />
        <UPagination
          v-model="settlementHistoryQuery.page"
          :page-size-options="[10, 25, 50, 100]"
          :page-count="totalPage"
          :items-per-page="settlementHistoryQuery.page_size"
          :total="total"
          @update:page="onPageUpdate"
        />
      </div>
    </template> -->
  </UCard>
</template>
