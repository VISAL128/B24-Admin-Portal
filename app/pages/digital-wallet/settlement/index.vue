<!-- eslint-disable @typescript-eslint/no-unused-vars -->
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
          v-model="selectedStatuses"
          :multiple="true"
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
          <UTooltip :text="t('settlement.auto_refresh_desc')" :delay-duration="200" placement="top">
            <UIcon name="material-symbols:info-outline" class="size-3.5" />
          </UTooltip>
        </div>
        <UTooltip v-if="!autoRefresh" :text="t('settlement.refresh')">
          <UIcon
            name="material-symbols:sync"
            :class="[
              'w-4 h-4 cursor-pointer text-primary hover:text-primary-dark transition-transform duration-200',
              { 'animate-spin': isRefreshing },
            ]"
            @click="fetchSettlementHistory(true)"
          />
        </UTooltip>
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
        <UPopover>
          <UTooltip
            key="column-config-tooltip"
            :text="t('settlement_history.column_config.tooltip')"
            :delay-duration="200"
            placement="top"
          >
            <UButton variant="ghost" class="p-2 relative">
              <UIcon
                name="icon-park-outline:setting-config"
                class="text-gray-900 dark:text-white"
              />
            </UButton>
          </UTooltip>
          <template #content>
            <div class="p-2 space-y-1 min-w-50">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">{{
                  t('settlement_history.column_config.columns')
                }}</span>
                <!-- <UButton variant="solid" class="text-muted" size="xs" @click="onResetColumnConfig">
                  {{ t('settlement_history.column_config.reset') }}
                </UButton> -->
                <UTooltip
                  :text="t('settlement_history.column_config.reset')"
                  :delay-duration="500"
                  :open-delay="500"
                  :close-delay="200"
                  placement="top"
                  :default-open="false"
                >
                  <UButton
                    variant="ghost"
                    class="text-muted hover:text-primary"
                    size="sm"
                    @click="onResetColumnVisibility"
                  >
                    <UIcon
                      name="material-symbols:replay-rounded"
                      size="sm"
                      class="text-muted hover:text-primary"
                    />
                  </UButton>
                </UTooltip>
              </div>
              <Divider />
              <!-- <UButton
                v-for="col in columnConfig"
                :key="col.id"
                size="sm"
                variant="ghost"
                class="w-full text-left flex items-center"
                @click="
                  (event) => {
                    col.toggleVisibility(!col.getIsVisible())
                    columnVisibility[col.id] = !col.getIsVisible()
                    saveColumnVisibility()
                  }
                "
              >
                <UCheckbox
                  :id="col.id"
                  :label="getTranslationHeaderById(col.id)"
                  :model-value="col.getIsVisible()"
                  class="text-sm"
                  size="sm"
                  @update:model-value="
                    (value) => {
                      col.toggleVisibility(value as boolean)
                      columnVisibility[col.id] = value as boolean
                      saveColumnVisibility()
                    }
                  "
                />
              </UButton> -->
              <UCheckbox
                v-for="col in columnConfig"
                :id="col.id"
                :key="col.id"
                :label="getTranslationHeaderById(col.id)"
                :model-value="col.getIsVisible()"
                class="text-sm px-2 py-1 w-full h-full rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                size="sm"
                @update:model-value="
                  (value) => {
                    col.toggleVisibility(value as boolean)
                    columnVisibility[col.id] = value as boolean
                    // saveColumnVisibility()
                  }
                "
              />
              <!-- <div
                v-for="col in columnConfig"
                :key="col.id"
                class="flex items-center justify-between rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UCheckbox
                  :id="col.id"
                  as="button"
                  :label="getTranslationHeaderById(col.id)"
                  :model-value="col.getIsVisible()"
                  class="text-sm px-2 py-1 w-full h-full"
                  size="sm"
                  @update:model-value="
                    (value) => {
                      col.toggleVisibility(value as boolean)
                      columnVisibility[col.id] = value as boolean
                      // saveColumnVisibility()
                    }
                  "
                />
              </div> -->
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- Table -->
    <!-- <UTable
      ref="table"
      :column-visibility="columnVisibility"
      :sorting="sortingState"
      :data="filteredData"
      :columns="columns"
      :loading="loading"
      :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
      :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
      :ui="appConfig.ui.table.slots"
      sticky
      class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      @select="handleViewDetails"
      @update:sorting="onSortingChange"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable> -->
    <TablesExTable
      :columns="columns"
      :table-id="TABLE_ID"
      :fetch-data-fn="fetchSettlementForTable"
      show-row-number
      @row-click="handleViewDetails"
    />

    <!-- Table Footer -->
    <!-- <div
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
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, resolveComponent, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { useI18n } from 'vue-i18n'
// import TableEmptyState from '~/components/TableEmptyState.vue'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { UButton } from '#components'
import ExportButton from '~/components/buttons/ExportButton.vue'
import ExSearch from '~/components/ExSearch.vue'
import { DEFAULT_PAGE_SIZE } from '~/utils/constants'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useTableConfig } from '~/composables/utils/useTableConfig'
import { SettlementHistoryStatus } from '~/utils/enumModel'
import type { BaseTableColumn } from '~/components/tables/table'

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'settlement_menu', active: true }],
})

const { t } = useI18n()
const { getSettlementHistory } = useSupplierApi()
const { createSortableHeader } = useTable()
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()
const pref = useUserPreferences().getPreferences()
const { formatAmount } = useCurrency()
const { currentProfile } = useAuth()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = useTemplateRef<any>('table')
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
const autoRefresh = ref(false)

// Initialize status filter from localStorage or defaults
const initializeStatusFilter = () => {
  const savedStatusValues = tableConfig.getStatusFilter(TABLE_ID)

  if (savedStatusValues && savedStatusValues.length > 0) {
    // Create the status objects with current language translation
    // Filter out empty string if there are specific statuses to avoid "All" + specific status conflict
    const filteredValues = savedStatusValues.filter((value) => {
      // If we have specific statuses, remove the "All" (empty string) option
      const hasSpecificStatuses = savedStatusValues.some((v) => v !== '')
      return hasSpecificStatuses ? value !== '' : true
    })

    selectedStatuses.value = filteredValues.map((value) => ({
      label: value === '' ? t('status.all') : getTranslatedStatusLabel(value),
      value,
    }))
  } else {
    // Default to "All" status when no saved values
    selectedStatuses.value = [
      {
        label: t('status.all'),
        value: '',
      },
    ]
  }
}

// Helper function to get translated status label
const getTranslatedStatusLabel = (statusValue: string): string => {
  if (statusValue === '') return t('status.all')

  switch (statusValue.toLowerCase()) {
    case 'pending':
      return t('status.pending')
    case 'processing':
      return t('status.processing')
    case 'completed':
      return t('status.completed')
    default:
      return statusValue
  }
}

const selectedStatuses = ref<{ label: string; value: string }[]>([
  {
    label: t('status.all'),
    value: '',
  },
])
const availableStatuses = ref<string[]>(Object.values(SettlementHistoryStatus))

const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})

// Define table ID and default column visibility
const TABLE_ID = 'settlement-history'
const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  row_number: true,
  created_date: true,
  total_amount: true,
  currency_id: true,
  created_by: true,
  total_settled: true,
  status: true,
  select: true,
}

// Use table configuration composable
const tableConfig = useTableConfig()

// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(TABLE_ID)
  return savedConfig || DEFAULT_COLUMN_VISIBILITY
}

const columnVisibility = ref<Record<string, boolean>>(initializeColumnVisibility())

// Initialize sorting state from localStorage or defaults
const initializeSortingState = (): Array<{ id: string; desc: boolean }> => {
  const savedSorting = tableConfig.getSortingState(TABLE_ID)
  return savedSorting || []
}

const sortingState = ref<Array<{ id: string; desc: boolean }>>(initializeSortingState())

// Save column visibility changes to localStorage
const saveColumnVisibility = () => {
  tableConfig.saveColumnConfig(TABLE_ID, columnVisibility.value)
}

// Save sorting state changes to localStorage
const saveSortingState = () => {
  tableConfig.saveSortingState(TABLE_ID, sortingState.value)
}

// Save status filter changes to localStorage
const saveStatusFilter = () => {
  tableConfig.saveStatusFilter(
    TABLE_ID,
    selectedStatuses.value.map((status) => status.value)
  )
}

// Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(sortingState, saveSortingState, { deep: true })
watch(selectedStatuses, saveStatusFilter, { deep: true })

// Watch for language changes to update status label
const { locale } = useI18n()
watch(
  locale,
  () => {
    // Update the selected status labels when language changes
    selectedStatuses.value = selectedStatuses.value.map((status) => ({
      ...status,
      label: status.value === '' ? t('status.all') : getTranslatedStatusLabel(status.value),
    }))
  },
  { immediate: false }
)

// Initialize table column visibility from saved configuration
const initializeTableColumnVisibility = () => {
  if (table?.value?.tableApi) {
    Object.entries(columnVisibility.value).forEach(([columnId, isVisible]) => {
      const column = table.value.tableApi.getColumn(columnId)
      if (column) {
        column.toggleVisibility(isVisible)
      }
    })
  }
}

// Initialize table sorting state from saved configuration
const initializeTableSortingState = () => {
  if (table?.value?.tableApi && sortingState.value.length > 0) {
    // Apply saved sorting state
    table.value.tableApi.setSorting(sortingState.value)
  }
}

// Watch for table API changes to initialize column visibility and sorting
watch(
  () => table?.value?.tableApi,
  (newApi) => {
    if (newApi) {
      // Small delay to ensure table is fully initialized
      nextTick(() => {
        initializeTableColumnVisibility()
        initializeTableSortingState()
      })
    }
  },
  { immediate: true }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columnConfig = computed((): any[] => {
  return (
    table?.value?.tableApi
      ?.getAllColumns()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((column: any) => column.getCanHide()) ?? []
  )
})

const onResetColumnVisibility = () => {
  // Reset table API columns
  table?.value?.tableApi?.resetColumnVisibility()
  columnVisibility.value = { ...DEFAULT_COLUMN_VISIBILITY }
}

const getTranslationHeaderById = (id: string) => {
  return t(`settlement_history.columns.${id}`)
}

let interval: ReturnType<typeof setInterval> | null = null

watch(autoRefresh, (val) => {
  if (val) {
    // Start auto-refresh every 30 seconds
    interval = setInterval(() => {
      fetchSettlementHistory(true)
    }, 30000)
  } else {
    // Clear interval when auto-refresh is turned off
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
  // Save auto-refresh state to table config
  tableConfig.saveAutoRefresh(TABLE_ID, val)
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
watch([page, pageSize, selectedStatuses], () => {
  fetchSettlementHistory()
})

// Fetch settlement data from API
const fetchSettlementHistory = async (
  refreshAction: boolean = false,
  params?: { page?: number; pageSize?: number }
) => {
  loading.value = true
  if (refreshAction) {
    isRefreshing.value = true
  }
  try {
    const payload: SettlementHistoryQuery = {
      search: search.value || undefined,
      page_size: params?.pageSize || pageSize.value.value,
      page: params?.page || page.value,
      start_date: startDate.value,
      end_date: endDate.value,
      status: selectedStatuses.value.map((status) => status.value).filter((v) => v !== ''), // Use selected status values, filter out empty (all)
      supplier_id: currentProfile.value?.id || '', // Use current supplier ID
    }

    const data = await getSettlementHistory(payload)
    settlements.value = data?.records ?? []
    total.value = data?.total_record ?? 0
    totalPage.value = data?.total_page ?? 0
    return data?.records
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

// Wrapper function for BaseTableV2
const fetchSettlementForTable = async (params?: {
  page?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}) => {
  loading.value = true
  try {
    const payload: SettlementHistoryQuery = {
      search: params?.search || undefined,
      page_size: params?.pageSize || pageSize.value.value,
      page: params?.page || page.value,
      start_date: params?.startDate || startDate.value,
      end_date: params?.endDate || endDate.value,
      status: selectedStatuses.value.map((status) => status.value).filter((v) => v !== ''), // Use selected status values, filter out empty (all)
      supplier_id: currentProfile.value?.id || '', // Use current supplier ID
    }

    const data = await getSettlementHistory(payload)
    return {
      records: data?.records ?? [],
      total_record: data?.total_record ?? 0,
      total_page: data?.total_page ?? 0,
    }
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to load settlement history.'
    // Show error notification to user
    errorHandler.handleApiError(error)
    return null
  } finally {
    loading.value = false
  }
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
  // Initialize auto-refresh state from table config
  const isAutoRefresh = tableConfig.getIsAutoRefresh(TABLE_ID)
  if (isAutoRefresh !== null) {
    autoRefresh.value = isAutoRefresh
  }

  initializeStatusFilter()
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

const handleViewDetails = (rowData: SettlementHistoryRecord) => {
  // if (rowData.success === 0 && rowData.fail === 0) {
  //   notification.showWarning({
  //     title: t('no_transactions_found'),
  //     description: t('no_transactions_found_desc'),
  //   })
  //   return
  // }
  navigateToDetails(rowData.id)
}

const columns: BaseTableColumn<SettlementHistoryRecord>[] = [
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
  // {
  //   id: 'row_number',
  //   header: () => '#',
  //   cell: ({ row, table }) => createRowNumberCell(row, table, page.value, pageSize.value.value),
  //   size: 30,
  //   maxSize: 30,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // { accessorKey: "id", header: t("Settlement ID") },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('settlement.settlement_date'), 'left'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
  
  {
    id: 'created_by',
    accessorKey: 'created_by',
    header: () => t('settled_by'),
    cell: ({ row }) => row.original.created_by || '-',
  },

  {
    id: 'total_settled',
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
        formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  
]
</script>
