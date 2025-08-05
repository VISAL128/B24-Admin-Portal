<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <!-- Unified Card Container -->
  <div
    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-default shadow p-0 flex flex-col h-full overflow-auto">
    <!-- Filter / Sort / Column Configuration -->
    <div class="flex justify-between flex-wrap items-start gap-4 flex-shrink-0 mb-2 pt-2 px-3">
      <!-- 🔍 Filter Buttons -->
      <div class="flex gap-2 flex-wrap items-center">
        <div class="flex flex-wrap items-center gap-2">
          <!-- <UInput v-model="search" :placeholder="t('table.search_placeholder')" class="w-64" /> -->
          <ExSearch
v-model="search" :search-tooltip="props.searchTooltip" size="sm" class="w-64"
            @clear="debouncedFetchData" @keyup.enter="debouncedFetchData" />
          <template v-if="showDateFilter">
            <UPopover>
              <UButton
color="neutral" variant="subtle" size="sm" icon="material-symbols:calendar-month-outline-rounded"
                class="bg-gray hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700">
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
          </template>

          <UPopover v-if="showFilterButton" v-model:open="showAdvancedOptions">
            <UTooltip :text="t('table.filters')" :delay-duration="200">
              <UButton variant="ghost" class="p-2 relative">
                <UIcon name="i-lucide:filter" size="sm" class="text-gray-900 dark:text-white" />
                <span
v-if="activeFilterCount > 0"
                  class="absolute -top-0.5 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {{ activeFilterCount }}
                </span>
              </UButton>
            </UTooltip>
            <template #content>
              <div
                class="rounded-lg shadow-md overflow-hidden py-2 min-w-[200px] space-y-4 min-h-48 max-h-96">
                <!-- Column Filters -->
                <div class="space-y-2 flex flex-col min-h-48 h-full">
                  <h4 class="flex flex-wrap text-sm font-medium px-2 text-gray-900 dark:text-white">{{
                    t('table.filters') }}</h4>
                  <div class="flex flex-col flex-1 gap-2">
                    <Divider />
                    <div class="space-y-2 px-2 flex flex-col flex-1 min-h-0">
                      <template v-for="col in filteredColumns" :key="col.id">
                        <template v-if="col.enableColumnFilter">
                          <template v-if="'filterType' in col && col.filterType === 'status'">
                            <StatusSelection
:model-value="selectedStatuses" :multiple="true"
                              :available-statuses="col.filterValues || []" :include-all-statuses="false"
                              :placeholder="t('settlement.select_status')" :searchable="false" />
                          </template>
                          <template v-else>
                            <USelectMenu
:model-value="{
                              label: columnFilters[col.id] ? t(`dynamic_filter.${col.id}.${columnFilters[col.id]}`) : t(`table.${props.tableId}.columns.${col.id}`) || getColumnLabel(col),
                              value: columnFilters[col.id] || '',
                            }" :default-value="{ label: t('all'), value: '' }"
                              :items="[{ label: t('all'), value: '' }, ...getColumnFilterOptions(col)]"
                              option-attribute="label" value-attribute="value" size="sm" class="w-full"
                              :search-input="false" @update:model-value="
                                (val) => {
                                  columnFilters[col.id] = String(val?.value || '')
                                  emit('filter-change', col.id, columnFilters[col.id] || '')
                                }
                              " />
                          </template>

                        </template>
                      </template>
                    </div>
                    <Divider />
                  </div>
                  <div class="flex flex-wrap justify-end px-2">
                    <UButton
variant="link" size="xs" color="neutral" class="underline" :ui="{
                      ...appConfig.ui.button.slots,
                      leadingIcon: 'shrink-0 size-3 text-muted',
                    }" @click="() => resetColumnFilters()">

                      <template #default>
                        {{ t('table.column_config.reset') }}
                      </template>
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UPopover>
          <!-- Auto Refresh -->
          <div v-if="props.enabledAutoRefresh" class="flex items-center gap-1">
            <USwitch
              v-model="autoRefresh"
              :label="t('settlement.auto_refresh')"
              checked-icon="material-symbols:sync"
              unchecked-icon="material-symbols:sync-disabled"
              size="sm"
            />
            <UTooltip :text="t('settlement.auto_refresh_desc')" :delay-duration="200" placement="top">
              <UIcon name="material-symbols:info-outline" class="size-3.5" />
            </UTooltip>
          </div>
        <UTooltip v-if="props.enabledAutoRefresh && !autoRefresh" :text="t('settlement.refresh')">
          <UButton variant="ghost" class="p-2 relative" @click="fetchData(true)">
            <UIcon
              name="material-symbols:sync"
              :class="[
                'w-4 h-4 cursor-pointer text-primary hover:text-primary-dark transition-transform duration-200',
                { 'animate-spin': isRefreshing },
              ]"
            />
          </UButton>
        </UTooltip>
        </div>
      </div>

      <!-- ⚙️ Column Configuration -->
      <div class="flex justify-end items-center gap-2">
        <slot name="trailingHeader"/>
        <ExportButton :data="filteredData" :headers="exportHeaders" :export-options="resolvedExportOptions" />

        <UPopover>
          <template #default>
            <UTooltip
key="column-config-tooltip" :text="t('table.column_config.tooltip')" :delay-duration="200"
              placement="top">
              <UButton variant="ghost" class="p-2">
                <UIcon name="icon-park-outline:setting-config" size="sm" class="text-gray-900 dark:text-white" />
              </UButton>
            </UTooltip>
          </template>

          <template #content>
            <div class="space-y-1 min-w-50">
              <div class="flex items-center justify-between px-2 pt-2">
                <span class="text-sm font-medium">{{
                  t('table.column_config.columns')
                  }}</span>
              </div>
              <Divider />
              <div class="flex flex-col gap-1 px-2">
                <UCheckbox
v-for="col in columnConfig" :id="col.id" :key="col.id"
                  :label="getTranslationHeaderById(col.id)" :model-value="col.getIsVisible()"
                  :ui="appConfig.ui.checkbox.slots" variant="list"
                  class="text-sm px-2 py-1 w-full h-full rounded hover:bg-gray-100 dark:hover:bg-gray-700" size="sm"
                  @update:model-value="
                    (value) => {
                      col.toggleVisibility(value as boolean)
                      columnVisibility[col.id] = value as boolean
                    }
                  " />
              </div>
              <Divider />
              <div class="flex justify-end px-2 pb-2">
                <UButton
variant="link" size="xs" color="neutral" class="underline" :ui="{
                  ...appConfig.ui.button.slots,
                  leadingIcon: 'shrink-0 size-3 text-muted',
                }" @click="onResetColumnVisibility">
                  <template #default>
                    {{ t('table.column_config.reset') }}
                  </template>
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- 📋 Main Table -->
    <UTable
          :key="props.tableId" 
          ref="tableRef" 
          v-model:sorting="sorting"
          :data="filteredData" 
          :columns="filteredColumns"
          :loading="loading"
          :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
          :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
          sticky
          class="single-line-headers w-full h-full bg-default border-y border-gray-200 dark:border-gray-700"
          :ui="{ ...appConfig.ui.table.slots, tbody: 'bg-default' }"
          @update:sorting="handleSortChange"
          @select="onSelect">
          <template #cell="{ row, column }">
            <div class="max-w-[200px] truncate whitespace-nowrap overflow-hidden">
              <span class="block">
                {{ (row.original as T)[column.id as keyof T] }}
              </span>
            </div>
          </template>

          <template #empty>
            <TableEmptyState />
          </template>
        </UTable>

    <!-- 📄 Pagination and Page Size -->
    <div
class="flex items-center justify-between py-1 text-sm text-muted flex-shrink-0 mt-2 pb-2 px-3" :class="{
      'justify-between':
        (tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0,
      'justify-end': (tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length <= 0,
    }">
      <div v-if="(tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0">
        <span>
          {{ tableRef?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ tableRef?.tableApi?.getFilteredRowModel().rows.length || 0 }} {{ t('row_selected') }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <USelectMenu
v-model="pageSize" :items="DEFAULT_PAGE_SIZE_OPTIONS" size="sm" class="w-24" :search-input="false"
          @update:model-value="(val) => (pageSize = val)" />
        <UPagination
:model-value="internalPage" :page-count="internalTotalPage" :items-per-page="pageSize.value"
          :total="internalTotal" size="sm" :ui="appConfig.ui.pagination.slots" @update:page="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, onMounted, watch } from 'vue'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import type { TableRow } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { useTableConfig } from '~/composables/utils/useTableConfig'
import { useTable } from '~/composables/utils/useTable'
import { useFormat } from '~/composables/utils/useFormat'
// import type { ApiResponseDynamic } from '~/types/api'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, TABLE_CONSTANTS } from '~/utils/constants'
import appConfig from '~~/app.config'
import ExportButton from '../buttons/ExportButton.vue'
import type { QueryParams } from '~/models/baseModel'
import { ColumnType } from '~/utils/enumModel'

export interface ExportOptions {
  fileName?: string
  title?: string
  subtitle?: string
  currency?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
}

// Use table configuration composable
const tableConfig = useTableConfig()

const defaultColumnVisibility = ref<Record<string, boolean>>({})

// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(props.tableId)
  return savedConfig || defaultColumnVisibility.value
}

// Initialize column filters from localStorage or defaults
const initializeColumnFilters = (): Record<string, string> => {
  const savedFilters = tableConfig.getColumnFilters(props.tableId)
  return savedFilters || {}
}

// Initialize date range from localStorage or defaults
const initializeDateRange = (): { start: string; end: string } => {
  const savedDateRange = tableConfig.getDateRange(props.tableId)
  if (savedDateRange) {
    return savedDateRange
  }
  
  // Default to current month
  const today = new Date()
  const firstDay = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
  const lastDay = new CalendarDate(today.getFullYear(), today.getMonth() + 1, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
  
  return {
    start: `${firstDay.year}-${String(firstDay.month).padStart(2, '0')}-${String(firstDay.day).padStart(2, '0')}`,
    end: `${lastDay.year}-${String(lastDay.month).padStart(2, '0')}-${String(lastDay.day).padStart(2, '0')}`
  }
}

// Initialize sorting from localStorage or defaults
const initializeSorting = (): Array<{ id: string; desc: boolean }> => {
  const savedSorting = tableConfig.getSortingState(props.tableId)
  return savedSorting || []
}

const columnVisibility = ref<Record<string, boolean>>({})
const columnFilters = ref<Record<string, string>>({})
const dateRange = ref<{ start: string; end: string }>({ start: '', end: '' })
const sorting = ref<Array<{ id: string; desc: boolean }>>([])
const mounted = ref(false)

// Initialize useTable with sorting state for synchronized sort icons
const { createRowNumberCell, createSortableHeader } = useTable<T>(sorting)

const saveColumnVisibility = () => {
  tableConfig.saveColumnConfig(props.tableId, columnVisibility.value)
}

const saveColumnFilters = () => {
  tableConfig.saveColumnFilters(props.tableId, columnFilters.value)
  if (import.meta.env.DEV) console.log(`💾 Saved column filters for table ${props.tableId}:`, columnFilters.value)
}

const saveDateRange = () => {
  tableConfig.saveDateRange(props.tableId, dateRange.value)
  if (import.meta.env.DEV) console.log(`💾 Saved date range for table ${props.tableId}:`, dateRange.value)
}

const saveSorting = () => {
  tableConfig.saveSortingState(props.tableId, sorting.value)
  if (import.meta.env.DEV) console.log(`💾 Saved sorting for table ${props.tableId}:`, sorting.value)
}

watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(columnFilters, saveColumnFilters, { deep: true })
watch(dateRange, saveDateRange, { deep: true })
watch(sorting, saveSorting, { deep: true })

// Watch column filters for data fetching when using fetchDataFn
watch(columnFilters, async (_newFilters) => {
  if (props.fetchDataFn && mounted.value) {
    // Reset to first page when filters change
    internalPage.value = 1
    await fetchData()
  }
}, { deep: true })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columnConfig = computed((): any[] => {
  return (
    tableRef?.value?.tableApi
      ?.getAllColumns()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((column: any) => column.getCanHide()) ?? []
  )
})

const getTranslationHeaderById = (id: string) => {
  return t(`table.${props.tableId}.columns.${id}`)
}

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const showDateFilter = computed(() => props.showDateFilter ?? true)
const modelValue = shallowRef({
  start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
})
const selectedSortField = ref<string | null>(null)
const pref = useUserPreferences().getPreferences()
const pageSize = ref<{ label: string; value: number }>({
  label: pref?.defaultPageSize ? pref?.defaultPageSize.toString() : DEFAULT_PAGE_SIZE.label,
  value: pref?.defaultPageSize || DEFAULT_PAGE_SIZE.value,
})

const selectedStatuses = ref<{ label: string; value: string }[]>([
  { label: 'all', value: '' },
])
const autoRefresh = ref(false)
const isRefreshing = ref(false)

const showAdvancedOptions = ref(false)

const emit = defineEmits<{
  (e: 'filter-change', columnId: string, value: string): void
  (e: 'sort-change', columnId: string, direction: 'asc' | 'desc' | null): void
  (e: 'row-click', rowData: T): void
  (e: 'data-changed', result: TableFetchResult<T[]> & Record<string, unknown>): void
  (e: 'daterange-change', dateRange: { start: string; end: string }): void
}>()

// Internal state management
const internalData = ref<T[]>([])
const internalPage = ref(1)
const internalTotal = ref(0)
const internalTotalPage = ref(0)
const loading = ref(false)

// Use internal data if no data prop is provided
const tableData = computed(() => internalData.value)


// Fetch data function
const fetchData = async (refresh = false) => {
  if (!props.fetchDataFn) return

  loading.value = true
  if (refresh) {
    isRefreshing.value = true
  }
  try {
    // Build sorts parameter from current sort state
    const sorts = sortState.value?.value.map((sort) => ({
      field: sort.id,
      direction: sort.desc ? 'desc' : 'asc' as 'desc' | 'asc'
    })) || []

    // sorts.push(
    //   {
    //     field: 'created_at',
    //     direction: 'desc' // Default sort by created_at
    //   }
    // )

    // Convert to direct sorting string
    let sortingStr = ''
    if (sorts.length > 0) {
      sorts.forEach((sort: { field: string; direction: 'asc' | 'desc' }) => {
        sortingStr += `${sort.field}${sort.direction === 'asc' ? '+' : '-'};`
      })
      if (sortingStr.endsWith(';')) {
        sortingStr = sortingStr.slice(0, -1) // Remove trailing semicolon
      }
    }

    // Build filters parameter from current column filters
    const filters = Object.entries(columnFilters.value)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([field, value]) => ({
        field,
        operator: 'eq' as const,
        value
      }))

    const result = await props.fetchDataFn({
      page: internalPage.value,
      page_size: pageSize.value.value,
      search: search.value,
      start_date: startDate.value,
      end_date: endDate.value,
      sorts: Array.from(sorts),
      sortAsString: sortingStr,
      filters: filters.length > 0 ? filters : undefined,
    })

    if (result) {
      // Use helper function to extract data in a standardized way
      // const { data, total, totalPages } = extractApiResponseData(result)

      internalData.value = result.data as T[]
      internalTotal.value = result.total_record
      internalTotalPage.value = result.total_page

      // Emit data-changed event with the current data
      emit('data-changed', result)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
    // Add a small delay to ensure the animation completes
    setTimeout(() => {
      isRefreshing.value = false
    }, 200)
  }
}

const debouncedFetchData = debounce(() => {
  if (props.fetchDataFn) {
    fetchData()
  }
})

// Convert Nuxt UI sorting format to our internal format for compatibility
const sortState = computed(() => {
  if (sorting.value.length === 0) return null
  return sorting
})

// Watch sorting changes for data fetching when using fetchDataFn
watch(sorting, async (_newSorting) => {
  if (props.fetchDataFn && mounted.value) {
    // Reset to first page when sort changes
    internalPage.value = 1
    await fetchData()
  }
}, { deep: true })

const { t } = useI18n()

const filteredData = computed(() => {
  const data = tableData.value as T[]
  let result: T[] = data

  for (const [key, val] of Object.entries(columnFilters.value)) {
    if (val) {
      result = result.filter((row) => String(row[key as keyof T]) === val)
    }
  }

  return result
})

const showFilterButton = computed(() => {
  return props.columns.some((col) => col.enableColumnFilter === true)
})

const props = defineProps<{
  data?: T[]
  columns: BaseTableColumn<T>[]
  tableId: string
  exportOptions?: ExportOptions
  showDateFilter?: boolean
  showRowNumber?: boolean
  fetchDataFn?: (params?: QueryParams) => Promise<TableFetchResult<T[]> & Record<string, unknown> | null | undefined>
  enabledAutoRefresh?: boolean
  searchTooltip?: string
}>()

watch(pageSize, async (_newSize) => {
  internalPage.value = 1
  if (props.fetchDataFn && mounted.value) {
    await fetchData()
  }
})

const resolvedExportOptions = computed(() => ({
  fileName: props.exportOptions?.fileName ?? `${props.tableId}-export`,
  title: props.exportOptions?.title ?? props.tableId,
  subtitle: props.exportOptions?.subtitle ?? '',
  currency: props.exportOptions?.currency,
  startDate: props.exportOptions?.startDate ?? startDate.value,
  endDate: props.exportOptions?.endDate ?? endDate.value,
  totalAmount:
    props.exportOptions?.totalAmount
}))

 
const tableRef = useTemplateRef('tableRef')
const allColumnIds = computed(() =>
  columnsWithRowNumber.value.map((col) => col.id).filter((id): id is string => !!id)
)

// Computed property for sort menu items

// Computed property for active filter count
const activeFilterCount = computed(() => {
  const columnFilterCount = Object.values(columnFilters.value).filter((val) => val !== '').length
  const sortFilterCount = selectedSortField.value ? 1 : 0
  return columnFilterCount + sortFilterCount
})

const exportHeaders = computed(() =>
  filteredColumns.value.map((col) => ({
    key: String(col.accessorKey || col.id || ''),
    label:
      typeof col.header === 'string'
        ? col.header
        : (col.id ? String(col.id) : '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
  }))
)

// Handler for sort menu changes

// Reuse the existing toggleSort function

function debounce<T extends unknown[]>(fn: (...args: T) => void, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

function onSelect(row: TableRow<T>, _e?: Event) {
  emit('row-click', row.original)
}

function getColumnFilterOptions(col: BaseTableColumn<T>) {
  if (col.filterOptions) return col.filterOptions.filter((opt) => {
    if (typeof opt.value === 'string') return opt.value.trim() !== '' && opt.value.trim() !== 'all'
    if (typeof opt.value === 'number') return opt.value !== 0
  })

  const key = col.accessorKey ?? col.id
  if (!key) return []

  const data = tableData.value as T[]
  const values = Array.from(
    new Set(data.map((row) => row[key as keyof T]).filter((v) => v !== undefined && v !== null))
  )

  return values.map((v) => ({
    label: String(v),
    value: String(v),
  }))
}

function getColumnLabel(col: BaseTableColumn<T>): string {
  if (typeof col.header === 'string') return col.header
  if (typeof col.header === 'function' && col.id) {
    return col.id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
  return 'Unnamed'
}

const handleSortChange = (newSorting: Array<{ id: string; desc: boolean }>) => {
  console.log('🔄 handleSortChange called with:', newSorting)
  sorting.value = newSorting
  
  // Emit sort-change event for compatibility
  if (newSorting.length > 0) {
    const firstSort = newSorting[0]!
    emit('sort-change', firstSort.id, firstSort.desc ? 'desc' : 'asc')
  } else {
    emit('sort-change', '', null)
  }
  
  // Reset to first page when sort changes
  internalPage.value = 1
  
  // Trigger data fetch when sort changes and fetchDataFn is available
  if (props.fetchDataFn && mounted.value) {
    fetchData()
  } else {
    console.log('⚠️ No fetchDataFn available, skipping server-side sort')
  }
}

const handlePageChange = async (val: number) => {
  internalPage.value = val
  if (props.fetchDataFn && mounted.value) {
    await fetchData()
  }
}

const filteredColumns = computed(() => {
  // Force reactivity by accessing sorting state
  const currentSorting = sorting.value
  const columns = columnsWithRowNumber.value

  columns.forEach((col) => {
    if(col.enableSorting) {
      col.header = ({ column }) => createSortableHeader(column, getTranslationHeaderById(col.id))
    }
  })
  
  // Debug: Log which columns have sorting enabled
  if (import.meta.env.DEV) {
    const sortableColumns = columns.filter(col => col.enableSorting)
    console.log('🔧 Sortable columns:', sortableColumns.map(col => ({ id: col.id, enableSorting: col.enableSorting })))
    console.log('🔧 Current sorting state:', currentSorting)
  }
  
  // re-build cells
  columns.forEach((col) => {
    if (col.type === ColumnType.DateTime && !col.cell) {
      col.cell = ({ row }) => useFormat().formatDateTime(row.getValue(col.id as string))
    }
  })
  const visibleColumnIds = computed(() =>
    columnConfig.value
      .filter((col) => col.getIsVisible())
      .map((col) => col.id)
      .filter((id): id is string => !!id)
  )

  // If no visible ids are selected, fallback to showing all
  if (visibleColumnIds.value.length === 0 && allColumnIds.value.length > 0) {
    return columns
  }

  return columns.filter((col) => {
    if (!col.id) return true
    return visibleColumnIds.value.includes(col.id)
  })
})

// Add this computed property to detect if there's a selection column
const hasSelectionColumn = computed(() => {
  return props.columns.some((col) => col.id === 'select' || col.accessorKey === 'select')
})

// Computed property for columns with row numbers
const columnsWithRowNumber = computed(() => {
  // If showRowNumber is false, return columns as-is
  if (!props.showRowNumber) {
    return props.columns
  }

  const rowNumberColumn: BaseTableColumn<T> = {
    id: 'row_number',
    header: '#',
    accessorKey: 'row_number',
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => createRowNumberCell(row, table, internalPage.value, pageSize.value.value),
    // cell: ({ row }: { row: { index: number } }) => {
    //   const currentPage = internalPage.value
    //   const currentPageSize = pageSize.value.value
    //   return (currentPage - 1) * currentPageSize + row.index + 1
    // },
  }

  if (hasSelectionColumn.value) {
    // If there's a selection column, insert row number as second column
    const columns = [...props.columns]
    columns.splice(1, 0, rowNumberColumn)
    return columns
  } else {
    // If no selection column, row number goes first
    return [rowNumberColumn, ...props.columns]
  }
})

onBeforeMount(() => {
  // Initialize date range from localStorage or defaults
  const initialDateRange = initializeDateRange()
  dateRange.value = initialDateRange
  columnFilters.value = initializeColumnFilters()
  sorting.value = initializeSorting()
  
  // Parse the date strings to set calendar values and internal date values
  try {
    const startParts = initialDateRange.start.split('-').map(Number)
    const endParts = initialDateRange.end.split('-').map(Number)
    
    if (startParts.length === 3 && endParts.length === 3 && 
        startParts.every(p => !isNaN(p)) && endParts.every(p => !isNaN(p))) {
      startDate.value = initialDateRange.start
      endDate.value = initialDateRange.end
      
      modelValue.value.start = new CalendarDate(startParts[0]!, startParts[1]!, startParts[2]!)
      modelValue.value.end = new CalendarDate(endParts[0]!, endParts[1]!, endParts[2]!)
    } else {
      // Fallback to current month if parsing fails
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      const firstDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
      const lastDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
      
      startDate.value = `${firstDayCalendar.year}-${String(firstDayCalendar.month).padStart(2, '0')}-${String(firstDayCalendar.day).padStart(2, '0')}`
      endDate.value = `${lastDayCalendar.year}-${String(lastDayCalendar.month).padStart(2, '0')}-${String(lastDayCalendar.day).padStart(2, '0')}`
      modelValue.value.start = firstDayCalendar
      modelValue.value.end = lastDayCalendar
    }
  } catch (error) {
    console.warn('Failed to parse saved date range, using defaults:', error)
    // Fallback to current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const firstDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
    const lastDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
    
    startDate.value = `${firstDayCalendar.year}-${String(firstDayCalendar.month).padStart(2, '0')}-${String(firstDayCalendar.day).padStart(2, '0')}`
    endDate.value = `${lastDayCalendar.year}-${String(lastDayCalendar.month).padStart(2, '0')}-${String(lastDayCalendar.day).padStart(2, '0')}`
    modelValue.value.start = firstDayCalendar
    modelValue.value.end = lastDayCalendar
  }
})


let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  defaultColumnVisibility.value = props.columns.reduce((acc, col) => {
    if (col.id) {
      acc[col.id] = true // Default to visible
    }
    return acc
  }, {} as Record<string, boolean>)
  
  // Initialize auto-refresh state from table config
  const isAutoRefresh = tableConfig.getIsAutoRefresh(props.tableId)
  if (isAutoRefresh !== null) {
    autoRefresh.value = isAutoRefresh
  }

  columnVisibility.value = initializeColumnVisibility()
  // columnFilters.value = initializeColumnFilters()
  // sorting.value = initializeSorting()

  if (import.meta.env.DEV) {
    console.log(`📊 Initialized column visibility for table ${props.tableId}:`, columnVisibility.value)
    console.log(`📊 Initialized column filters for table ${props.tableId}:`, columnFilters.value)
    console.log(`📊 Initialized date range for table ${props.tableId}:`, dateRange.value)
    console.log(`📊 Initialized sorting for table ${props.tableId}:`, sorting.value)
  }

  // Fetch initial data if fetchDataFn is provided
  if (props.fetchDataFn) {
    fetchData()
  }

  // Auto-refresh logic
  if (autoRefresh.value) {
    autoRefreshInterval = setInterval(() => {
      if (props.fetchDataFn) fetchData()
    }, 5000)
  }

  mounted.value = true
})

watch(autoRefresh,
  (val) => {
    if (val) {
      if (!autoRefreshInterval) {
        autoRefreshInterval = setInterval(() => {
          if (props.fetchDataFn) fetchData()
        }, 5000)
      }
    } else {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
        autoRefreshInterval = null
      }
    }
    tableConfig.saveAutoRefresh(props.tableId, autoRefresh.value)
  }
)

onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
})

watch(modelValue, (val) => {
  // Convert CalendarDate directly to YYYY-MM-DD format without timezone conversion
  const start = val.start ? `${val.start.year}-${String(val.start.month).padStart(2, '0')}-${String(val.start.day).padStart(2, '0')}` : ''
  const end = val.end ? `${val.end.year}-${String(val.end.month).padStart(2, '0')}-${String(val.end.day).padStart(2, '0')}` : ''
  
  startDate.value = start
  endDate.value = end
  
  // Update the dateRange ref which will trigger localStorage save
  dateRange.value = { start, end }

  if (props.fetchDataFn && mounted.value) {
    fetchData()
  }
})

const onResetColumnVisibility = () => {
  // Reset table API columns
  tableRef?.value?.tableApi?.resetColumnVisibility()
  columnVisibility.value = { ...defaultColumnVisibility.value }
}

const resetColumnFilters = () => {
  columnFilters.value = {}
  emit('filter-change', '', '')
}

const resetSorting = () => {
  sorting.value = []
  emit('sort-change', '', null)
}

const _resetDateRange = () => {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
  const lastDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, lastDayOfMonth)
  
  const defaultStart = `${firstDayCalendar.year}-${String(firstDayCalendar.month).padStart(2, '0')}-${String(firstDayCalendar.day).padStart(2, '0')}`
  const defaultEnd = `${lastDayCalendar.year}-${String(lastDayCalendar.month).padStart(2, '0')}-${String(lastDayCalendar.day).padStart(2, '0')}`
  
  dateRange.value = { start: defaultStart, end: defaultEnd }
  startDate.value = defaultStart
  endDate.value = defaultEnd
  modelValue.value.start = firstDayCalendar
  modelValue.value.end = lastDayCalendar
  emit('daterange-change', dateRange.value)
}

defineExpose({
  tableRef,
  tableApi: computed(() => tableRef.value?.tableApi),
  getSelectedRows: () => tableRef.value?.tableApi?.getFilteredSelectedRowModel().rows || [],
  getAllRows: () => tableRef.value?.tableApi?.getFilteredRowModel().rows || [],
  clearSelection: () => tableRef.value?.tableApi?.resetRowSelection?.(),
  getCurrentData: () => tableData.value as T[],
  getFilteredData: () => filteredData.value,
  resetSorting,
})
</script>

<style scoped>
.single-line-headers :deep(th) {
  white-space: nowrap;
}
</style>
