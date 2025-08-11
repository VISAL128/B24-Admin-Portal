<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { ref, watch } from 'vue'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import ClipboardBadge from '../buttons/ClipboardBadge.vue'
import type {
  SettlementHistoryDetail,
  // SettlementHistoryQuery,
  SettlementHistoryDetailQuery,
  TransactionAllocation,
} from '~/models/settlement'
import { useTable } from '~/composables/utils/useTable'
import appConfig from '~~/app.config'

const { t } = useI18n()
const format = useFormat()
const userPreferences = useUserPreferences().getPreferences()
const { createRowNumberCell, createSortableHeader } = useTable()
const { statusCellBuilder } = useStatusBadge()

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

const handleSearchSubmit = () => {
  settlementHistoryQuery.value.page = 1
  props.onSearchSubmit?.(settlementHistoryQuery.value)
}

const openSlideover = ref(false)
const openSliderWithData = ref<SettlementHistoryDetail | null>(null)

const sortingHistory = ref([
  {
    id: 'tran_date',
    desc: true,
  },
])

const cellClassForRowSelected = 'font-bold'

const columns = ref<TableColumn<SettlementHistoryDetail>[]>([
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }) => createRowNumberCell(row, table),
    size: 30,
    maxSize: 30,
    enableSorting: false,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  // {
  //   accessorKey: 'supplier.name',
  //   header: () => t('settlement.supplier'),
  //   size: 150,
  //   maxSize: 150,
  // },
  {
    accessorKey: 'cpo.code',
    header: ({ column }) => createSortableHeader(column, t('settlement.biller.code')),
    cell: ({ row }) => row.original.cpo?.code || 'N/A',
    size: 50,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'cpo.name',
    header: ({ column }) => createSortableHeader(column, t('settlement.biller.name')),
    cell: ({ row }) => row.original.cpo?.name || 'N/A',
    size: 100,
    maxSize: 200,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'party_type',
    header: () => t('settlement.type'),
    cell: ({ row }) => {
      const partyType = row.original.party_type || 'N/A'
      return h('span', { class: 'text-sm' }, partyType)
    },
    size: 50,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'settle_amount',
    header: ({ column }) => createSortableHeader(column, t('settlement.amount'), 'right'),
    cell: ({ row }) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.settle_amount)),
    size: 150,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'currency',
    header: () => h('p', { class: 'w-full' }, t('settlement.currency')),
    cell: () => h('span', { class: '' }, props.currency || 'N/A'),
    size: 10,
    maxSize: 30,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'tran_date',
    header: ({ column }) => createSortableHeader(column, t('transaction_date')),
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
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'total_transactions',
    header: () => t('settlement.transaction_allocations'),
    cell: ({ row }) => {
      return row.original.tran_allocates.length || 0
    },
    size: 150,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'settlement_bank_name',
    header: () => t('settlement.generate.form.bank'),
    cell: ({ row }) => {
      const UAvatar = resolveComponent('UAvatar')
      if (row.original.settlement_bank_logo) {
        // If settlement bank logo is available, display it
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, {
            src: row.original.settlement_bank_logo,
            size: '3xs',
          }),
          h('div', { class: '' }, row.original.settlement_bank_name || '-'),
        ])
      }
      return h('div', { class: '' }, row.original.settlement_bank_name || '-')
    },
    size: 150,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'bank_ref_id',
    header: () => t('bank_ref'),
    cell: ({ row }) => {
      return h(
        'div',
        {
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h(ClipboardBadge, {
            text: row.original.bank_ref_id || '-',
            copiedTooltipText: t('clipboard.copied'),
          }),
        ]
      )
    },
    size: 150,
    maxSize: 150,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
  {
    accessorKey: 'status',
    header: () => t('settlement.status'),
    cell: ({ row }) => statusCellBuilder(row.original.status, true),
    // cell: ({ row }) => {
    //   return h(StatusBadgeV2, {
    //     status: row.original.status,
    //     variant: 'subtle',
    //     size: 'md',
    //   })
    // },
    size: 120,
    maxSize: 120,
    meta: {
      class: {
        td(cell) {
          return cell.row.getIsSelected() ? cellClassForRowSelected : ''
        },
      },
    },
  },
])

const table = useTemplateRef('table')

const onRowSelect = (row: TableRow<SettlementHistoryDetail>) => {
  openSlideover.value = true
  openSliderWithData.value = row.original
  row.toggleSelected() // Toggle the row selection state
}

const closeSlideover = () => {
  openSlideover.value = false
  openSliderWithData.value = null
  table.value?.tableApi.resetRowSelection() // Clear selected rows when closing
}

const sorting = ref([
  {
    id: 'transaction_date',
    desc: true,
  },
])

// function onCopy(value: string) {
//   clipboard.value.copy(value)
// }
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
      return h('span', { class: 'text-sm' }, [
        format.formatDateTime(row.original.transaction_date, {
          dateStyle: userPreferences?.dateFormat || 'medium',
          timeStyle: userPreferences?.timeFormat || 'short',
        }),
      ])
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

const labelClass = 'text-xs font-medium text-gray-500 dark:text-gray-400'
const valueClass = 'text-sm font-bold'
</script>
<template>
  <UCard
    class="max-h-full flex flex-1 flex-col"
    :ui="{
      ...appConfig.ui.card.slots,
      header: 'p-3 sm:px-4 flex flex-shrink-0',
      body: 'p-0 sm:p-0 flex-1 flex overflow-hidden',
    }"
  >
    <template #header>
      <div class="flex flex-row items-center w-full justify-between">
        <p class="text-md font-bold">{{ $t('settlement.settlement_list') }}</p>
        <ExSearch
          v-model="settlementHistoryQuery.search"
          :placeholder="$t('settlement.search_placeholder')"
          :ui="appConfig.ui.input.slots"
          @clear="handleSearchSubmit"
          @keyup.enter="handleSearchSubmit"
        />
      </div>
    </template>
    <UTable
      ref="table"
      :data="props.settlementHistorys"
      :sorting="sortingHistory"
      :columns="columns"
      sticky
      class="w-full h-full overflow-auto"
      :style="{ maxHeight: 'h-full', minHeight: '300px' }"
      :ui="appConfig.ui.table.slots"
      @select="onRowSelect"
    />
    <USlideover
      v-model:open="openSlideover"
      :title="t('settlement.settlement_transaction')"
      side="right"
      :overlay="false"
      :description="t('settlement.settlement_details_description')"
      @after:leave="closeSlideover"
    >
      <template #body>
        <div v-if="openSliderWithData" class="flex flex-col h-full">
          <!-- Settlement Summary -->
          <UCard class="shadow-sm mb-4" :ui="appConfig.ui.card.slots">
            <div class="flex-shrink-0">
              <div
                class="grid grid-cols-2 gap-4 border-b border-gray-300 dark:border-gray-600 pb-4"
              >
                <div>
                  <label :class="labelClass">{{ t('settlement.sub_biller.code') }}</label>
                  <p :class="valueClass">{{ openSliderWithData.cpo?.code || 'N/A' }}</p>
                </div>
                <div>
                  <label :class="labelClass">{{ t('settlement.sub_biller.name') }}</label>
                  <p :class="valueClass">{{ openSliderWithData.cpo?.name || 'N/A' }}</p>
                </div>
                <div>
                  <label :class="labelClass">{{ t('settlement.status') }}</label>
                  <div :class="valueClass">
                    <StatusBadgeV2 :status="openSliderWithData.status" variant="subtle" size="md" />
                    <!-- <StatusBadge :status="openSliderWithData.status" size="sm" /> -->
                  </div>
                </div>
                <div>
                  <label :class="labelClass">{{ t('settlement.currency') }}</label>
                  <p :class="valueClass">{{ props.currency || 'N/A' }}</p>
                </div>
                <div>
                  <label :class="labelClass">
                    {{ t('bank') }}
                  </label>
                  <p :class="valueClass">
                    {{ openSliderWithData.settlement_bank_name || '-' }}
                  </p>
                </div>
                <div>
                  <p :class="labelClass">{{ t('bank_ref') }}</p>
                  <ClipboardBadge
                    :text="openSliderWithData.bank_ref_id"
                    :copied-tooltip-text="t('clipboard.copied')"
                    class="mt-2"
                  />
                  <!-- <div class="flex flex-wrap items-start gap-1">
                    <p class="break-all min-w-0" :class="valueClass">
                      {{ openSliderWithData.bank_ref_id || '-' }}
                    </p>
                    <UIcon
                      v-if="!clipboard.isCopied"
                      name="i-lucide-copy"
                      class="cursor-pointer text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                      @click="onCopy(openSliderWithData.bank_ref_id)"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-check"
                      class="text-green-500 flex-shrink-0 mt-0.5"
                    />
                  </div> -->
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label :class="labelClass">
                    {{ t('settlement.generate.form.total_transactions') }}
                  </label>
                  <p class="text-lg font-bold">
                    {{ openSliderWithData.tran_allocates.length || 0 }}
                  </p>
                </div>
                <div>
                  <label :class="labelClass">
                    {{ t('settlement.generate.form.total_amount') }}
                  </label>
                  <AmountWithCurrency
                    :amount="
                      openSliderWithData.tran_allocates.reduce(
                        (sum, allocation) => sum + allocation.amount,
                        0
                      )
                    "
                    :currency="props.currency"
                    variant="primary"
                    size="lg"
                  />
                </div>
              </div></div
          ></UCard>

          <!-- Transaction Allocations Table -->
          <div class="flex-1 flex flex-col mt-4 gap-2 min-h-0">
            <h4 class="text-md font-semibold flex-shrink-0">
              {{ t('settlement.transaction_allocations') }}
            </h4>
            <div
              v-if="
                openSliderWithData.tran_allocates && openSliderWithData.tran_allocates.length > 0
              "
              class="flex flex-col gap-2 flex-1 min-h-0"
            >
              <!-- <div class="flex-shrink-0">
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
              </div> -->
              <div
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 shadow-sm"
              >
                <UTable
                  v-model:sorting="sorting"
                  :data="openSliderWithData.tran_allocates"
                  :columns="allocationColumns"
                  :ui="{ ...appConfig.ui.table.slots, td: 'cursor-auto' }"
                  sticky
                  class="w-full h-full overflow-auto"
                />
              </div>
            </div>
            <div v-else class="flex-1 flex text-sm items-center justify-center text-gray-500">
              <p>{{ t('settlement.no_transaction_allocations') }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #close>
        <div class="flex justify-end w-52">
          <UTooltip :text="t('close')" :kbds="['esc']">
            <UButton variant="ghost">
              <UIcon
              name="material-symbols:close"
              size="20"
              class="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="closeSlideover"
            />
            </UButton>
          </UTooltip>
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
