<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex flex-wrap items-center gap-2">
        <ExSearch
          v-model="search"
          :placeholder="t('settlement.search_placeholder')"
          class="w-64"
          size="sm"
          @input="onSearchInput"
        />
        <UPopover>
          <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-calendar">
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
        <StatusSelection
          v-model="selectedStatus"
          :multiple="false"
          :available-statuses="availableStatuses"
          :include-all-statuses="false"
          :placeholder="t('settlement.select_status')"
          :searchable="false"
        />
        <div class="flex items-center gap-1">
          <USwitch
            v-model="autoRefresh"
            :label="t('settlement.auto_refresh')"
            checked-icon="material-symbols:sync"
            unchecked-icon="material-symbols:sync-disabled"
            size="sm"
            class="ml-2"
          />
          <UTooltip :text="t('settlement.auto_refresh_desc')" placement="top">
            <UIcon name="material-symbols:info-outline" class="size-3.5" />
          </UTooltip>
        </div>
        <UIcon
          v-if="!autoRefresh"
          name="material-symbols:sync"
          :class="[
            'w-4 h-4 cursor-pointer text-primary hover:text-primary-dark transition-transform duration-200',
            { 'animate-spin': isRefreshing },
          ]"
          :title="t('settlement.refresh')"
          @click="fetchSettlementHistory(true)"
        />
      </div>
      <div class="flex items-center gap-2">
        <UButton color="primary" icon="i-lucide-play" size="sm" @click="onGenerateSettlement">
          {{ t('generate_settlement') }}
        </UButton>

        <!-- <UDropdownMenu
          size="sm"
          :items="exportItems"
          :content="{ align: 'end' }"
          @select="handleExport"
        >
          <UButton icon="i-lucide-download" size="sm" trailing-icon="i-lucide-chevron-down">{{
            t('export')
          }}</UButton>
        </UDropdownMenu> -->
        <ExportButton :data="filteredData" :headers="exportHeaders" />
        <LazyUPopover>
          <UButton variant="ghost" class="p-2 relative">
            <UIcon name="icon-park-outline:setting-config" class="text-gray-900 dark:text-white" />
          </UButton>
          <template #content>
            <div class="p-2 space-y-1 min-w-50">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">{{
                  t('settlement_history.column_config.columns')
                }}</span>
                <UButton variant="link" class="text-muted" size="sm" @click="onResetColumnConfig">
                  {{ t('settlement_history.column_config.reset') }}
                </UButton
                >
              </div>
              <Divider />
              <div
                v-for="col in columnConfig"
                :key="col.id"
                class="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div class="flex items-center gap-2">
                  <UCheckbox
                    :id="col.id"
                    :label="getTranslationHeaderById(col.id)"
                    :model-value="col.getIsVisible()"
                    class="text-sm"
                    size="sm"
                    @update:model-value="(value) => col.toggleVisibility(value as boolean)"
                  />
                </div>
              </div>
            </div>
          </template>
        </LazyUPopover>
      </div>
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      :column-visibility="columnVisibility"
      :data="filteredData"
      :columns="columns"
      :loading="loading"
      :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
      :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
      :ui="appConfig.ui.table.slots"
      sticky
      class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      @select="handleViewDetails"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable>

    <!-- Table Footer -->
    <div
      class="flex items-center px-1 py-1 text-sm text-muted"
      :class="{
        'justify-between': (table?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0,
        'justify-end': (table?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length <= 0,
      }"
    >
      <div v-if="(table?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0">
        <span class="text-xxs">
          {{ (table?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length || 0 }} of
          {{ (table?.tableApi?.getFilteredRowModel()?.rows ?? []).length || 0 }}
          {{ t('row_selected') }}
        </span>
      </div>
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
          size="sm"
          :search-input="false"
          @change="onPageSizeChange"
        />
        <UPagination
          v-model="page"
          :page-size-options="[10, 25, 50, 100]"
          :page-count="totalPage"
          :items-per-page="pageSize.value"
          :total="total"
          size="sm"
          :ui="appConfig.ui.pagination.slots"
          show-edges
          @update:page="page = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, resolveComponent, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { useI18n } from 'vue-i18n'
import TableEmptyState from '~/components/TableEmptyState.vue'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { UButton } from '#components'
import appConfig from '~~/app.config'
import ExportButton from '~/components/buttons/ExportButton.vue'
import ExSearch from '~/components/ExSearch.vue'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, TABLE_CONSTANTS } from '~/utils/constants'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { useCurrency } from '~/composables/utils/useCurrency'

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'settlement_menu', active: true }],
})

const { t } = useI18n()
const { getSettlementHistory } = useSupplierApi()
const { createSortableHeader, createRowNumberCell } = useTable()
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()
const pref = useUserPreferences().getPreferences()
const { formatAmount } = useCurrency()
const { currentProfile } = useAuth()

const table = useTemplateRef('table')
const router = useRouter()

const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({
  label: pref?.defaultPageSize ? pref?.defaultPageSize.toString() : DEFAULT_PAGE_SIZE.label,
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
const isRefreshing = ref(false)
const autoRefresh = ref(true)
const selectedStatus = ref<{ label: string; value: string }>({
  label: t('status.all'),
  value: '',
}) // Default status
const availableStatuses = ref<string[]>(Object.values(SettlementHistoryStatus))

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

const columnConfig = computed<Column<SettlementHistoryRecord>[]>(
  (): Column<SettlementHistoryRecord>[] => {
    return (
      table?.value?.tableApi
        ?.getAllColumns()
        .filter((column: Column<SettlementHistoryRecord>) => column.getCanHide()) ?? []
    )
  }
)

// const columnsVisibility = ref<Column<SettlementHistoryRecord>[]>(
//   table?.value?.tableApi?.getAllColumns().filter((column: Column<SettlementHistoryRecord>) => column.getCanHide()) ?? [])

const onResetColumnConfig = () => {
  table?.value?.tableApi?.resetColumnVisibility()
}

// const onColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
//   if (table.value?.tableApi) {
//     table.value.tableApi(columnId, isVisible)
//   }
// }

const columnVisibility = ref<Record<string, boolean>>({
  id: false,
  row_number: true,
  created_date: true,
  total_amount: true,
  currency_id: true,
  created_by: true,
  total_settled: true,
  status: true,
  select: true,
})

const getTranslationHeaderById = (id: string) => {
  return t(`settlement_history.columns.${id}`)
}

let interval: ReturnType<typeof setInterval> | null = null

watch(autoRefresh, (val) => {
  if (val) {
    // Start auto-refresh every 5 seconds
    interval = setInterval(() => {
      fetchSettlementHistory(true)
    }, 5000)
  } else {
    // Clear interval when auto-refresh is turned off
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
})

onBeforeUnmount(() => {
  // Clear interval on component unmount
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})

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

// Watch pagination and status changes
watch([page, pageSize, selectedStatus], () => {
  fetchSettlementHistory()
})

// Fetch settlement data from API
const fetchSettlementHistory = async (refreshAction: boolean = false) => {
  loading.value = true
  if (refreshAction) {
    isRefreshing.value = true
  }
  try {
    const payload: SettlementHistoryQuery = {
      search: search.value || undefined,
      page_size: pageSize.value.value,
      page: page.value,
      start_date: startDate.value,
      end_date: endDate.value,
      status: selectedStatus.value.value || '', // Use selected status value or default to completed
      supplier_id: currentProfile.value?.id || '', // Use current supplier ID
    }

    const data = await getSettlementHistory(payload)
    settlements.value = data?.records ?? []
    total.value = data?.total_record ?? 0
    totalPage.value = data?.total_page ?? 0
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to load settlement history.'
    // Show error notification to user
    errorHandler.handleApiError(error)
  } finally {
    loading.value = false
    // Add a small delay to ensure the animation completes
    setTimeout(() => {
      isRefreshing.value = false
    }, 200)
  }
}

const onPageSizeChange = () => {
  page.value = 1
  // fetchSettlementHistory()
}

// Handle search input
const onSearchInput = (_value: string) => {
  // Optional: add debounced search logic here if needed
  // For now, the filtering is handled in computed filteredData
}

// Filtered rows for table
const filteredData = computed(() =>
  settlements.value.filter((item) =>
    (item.created_by ?? '').toLowerCase().includes(search.value.toLowerCase())
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
  if (autoRefresh.value) {
    // Start auto-refresh if enabled
    interval = setInterval(() => {
      fetchSettlementHistory(true)
    }, 5000)
  }
  fetchSettlementHistory()
})

const onGenerateSettlement = () => {
  router.push('/digital-wallet/settlement/generate')
}

// Handle navigation to details page
const navigateToDetails = (settlementId: string) => {
  router.push(`/digital-wallet/settlement/details/${settlementId}`)
}

const exportHeaders = [
  { key: 'currency_id', label: t('settlement.currency') },
  { key: 'created_date', label: t('settlement_history_details.settlement_date') },
  { key: 'total_supplier', label: t('settlement_history_details.total_supplier') },
  { key: 'created_by', label: t('settled_by') },
  { key: 'total_amount', label: t('total_amount') },
  // { key: "status", label: t("status") },
]

const handleViewDetails = (row: TableRow<SettlementHistoryRecord>) => {
  // if (row.original.success === 0 && row.original.fail === 0) {
  //   notification.showWarning({
  //     title: t('no_transactions_found'),
  //     description: t('no_transactions_found_desc'),
  //   })
  //   return
  // }
  navigateToDetails(row.original.id)
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
      h(
        'div',
        {
          class: 'flex h-full w-full',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h(resolveComponent('UCheckbox'), {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value),
            'aria-label': 'Select row',
          }),
        ]
      ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      class: {
        td() {
          return 'text-center cursor-pointer'
        },
      },
    },
  },
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }) => createRowNumberCell(row, table, page.value, pageSize.value.value),
    size: 30,
    maxSize: 30,
    enableSorting: false,
    enableHiding: false,
  },
  // { accessorKey: "id", header: t("Settlement ID") },
  {
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('settlement.settlement_date')),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  {
    accessorKey: 'currency_id',
    header: () => t('settlement.currency'),
    cell: ({ row }) => row.original.currency_id || '-',
  },
  {
    accessorKey: 'created_by',
    header: () => t('settled_by'),
    cell: ({ row }) => row.original.created_by || '-',
  },

  {
    accessorKey: 'total_settled',
    header: ({ column }) => createSortableHeader(column, t('settlement.transaction')),
    cell: ({ row }) => {
      // return h('span', {
      //   class: `text-sm font-medium`
      // }, `Total: ${row.original.total_Settled}`)

      const success = row.original.success
      const failed = row.original.failed
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
            h('span', { class: 'text-xs h-4' }, `${t('total')}: ${total}`),
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
          () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, failed)]
        ),
      ])
    },
  },
  {
    id: 'status',
    header: () => t('status.header'),
    cell: ({ row }) => statusCellBuilder(row.original.status, true),
    // cell: ({ row }) => {
    //   const status = row.original.status
    //   const statusClass = status === 'completed' ? 'text-green-500' : 'text-red-500'
    //   return h('span', { class: `text-xs font-medium ${statusClass}` }, t(`status.${status}`))
    // },
  },
  // Add an action column for viewing details
  // {
  //   id: 'actions',
  //   header: () => t('actions'),
  //   cell: ({ row }) =>
  //     h('div', { class: 'flex items-center gap-2' }, [
  //       h(resolveComponent('UButton'), {
  //         color: 'primary',
  //         variant: 'ghost',
  //         icon: 'i-lucide-eye',
  //         size: 'sm',
  //         onClick: handleViewDetails,
  //         // title: translations.view_details
  //       }),
  //     ]),
  // },
]
</script>
