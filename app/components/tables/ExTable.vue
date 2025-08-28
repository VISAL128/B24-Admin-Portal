<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <!-- Unified Card Container -->
  <div
    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-default shadow p-0 flex flex-col h-full overflow-auto"
  >
    <!-- Filter / Sort / Column Configuration -->
    <div class="flex justify-between flex-wrap items-start gap-4 flex-shrink-0 mb-2 pt-2 px-3">
      <!-- 🔍 Filter Buttons -->
      <div class="flex gap-2 flex-wrap items-center">
        <div class="flex flex-wrap items-center gap-2">
          <!-- <UInput v-model="search" :placeholder="t('table.search_placeholder')" class="w-64" /> -->
          <ExSearch
            v-model="search"
            :search-tooltip="props.searchTooltip"
            size="sm"
            class="w-64"
            @clear="debouncedFetchData"
            @keyup.enter="debouncedFetchData"
          />
          <template v-if="showDateFilter">
            <UiDateRangePicker
              v-model="modelValue"
              placeholder="Select date range..."
              size="md"
              variant="outline"
              color="primary"
            />
          </template>

          <UPopover
            v-if="showFilterButton"
            v-model:open="showColumnFilterPopup"
            @update:open="onFilterPopoverToggle"
          >
            <UTooltip :text="t('table.filters')" :delay-duration="200">
              <UButton variant="ghost" class="p-2 relative">
                <UIcon name="i-lucide:filter" size="sm" class="text-gray-900 dark:text-white" />
                <span
                  v-if="activeFilterCount > 0"
                  class="absolute -top-0.5 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {{ activeFilterCount }}
                </span>
              </UButton>
            </UTooltip>
            <template #content>
              <div
                class="rounded-lg shadow-md py-2 min-w-[260px] w-[320px] max-h-[70vh] flex flex-col"
              >
                <!-- Column Filters -->
                <div class="space-y-2 flex flex-col min-h-48 h-full">
                  <h4 class="flex flex-wrap text-sm font-medium px-2 text-gray-900 dark:text-white">
                    {{ t('table.filters') }}
                  </h4>
                  <div class="flex flex-col flex-1 gap-2">
                    <Divider />
                    <div class="px-2 flex flex-col flex-1 min-h-0 overflow-y-auto pr-1">
                      <template v-for="col in filteredColumns" :key="col.id">
                        <template v-if="col.enableColumnFilter">
                          <div class="space-y-1">
                            <!-- Filter Label -->
                            <label
                              :for="`filter-${col.id}`"
                              class="text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              {{ getTranslationHeaderById(col.id) || getColumnLabel(col) }}
                            </label>

                            <template v-if="'filterType' in col && col.filterType === 'status'">
                              <StatusSelection
                                :id="`filter-${col.id}`"
                                :model-value="selectedStatuses"
                                :multiple="true"
                                :available-statuses="[
                                  'all',
                                  ...(getColumnFilterOptions(col).map((status) =>
                                    status.value.toString()
                                  ) || []),
                                ]"
                                :include-all-statuses="false"
                                :placeholder="t('settlement.select_status')"
                                :searchable="false"
                                @update:model-value="
                                  (val) => {
                                    val = val as { label: string; value: string }[]
                                    selectedStatuses = val
                                    emit('filter-change', col.id, val.map((s) => s.value).join(','))
                                  }
                                "
                              />
                            </template>
                            <template v-else>
                              <USelectMenu
                                :id="`filter-${col.id}`"
                                :model-value="
                                  getSelectedFilterOption(col, columnFilters[col.id] || '')
                                "
                                :default-value="{ label: t('all'), value: '' }"
                                :items="[
                                  { label: t('all'), value: '' },
                                  ...getColumnFilterOptions(col),
                                ]"
                                option-attribute="label"
                                value-attribute="value"
                                size="sm"
                                class="w-full"
                                searchable
                                :search-input="true"
                                :search-placeholder="t('table.search_filter')"
                                @update:model-value="
                                  (val) => {
                                    columnFilters[col.id] = String(val?.value || '')
                                    emit('filter-change', col.id, columnFilters[col.id] || '')
                                  }
                                "
                              />
                            </template>
                          </div>
                        </template>
                      </template>
                    </div>
                    <Divider />
                  </div>
                  <div
                    class="flex flex-wrap justify-between px-2 sticky bottom-0 bg-default pt-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    <UButton
                      variant="link"
                      size="xs"
                      color="neutral"
                      class="underline"
                      :ui="{
                        ...appConfig.ui.button.slots,
                        leadingIcon: 'shrink-0 size-3 text-muted',
                      }"
                      @click="() => resetColumnFilters()"
                    >
                      <template #default>
                        {{ t('table.column_config.reset') }}
                      </template>
                    </UButton>
                    <UButton
                      size="sm"
                      :ui="appConfig.ui.button.slots"
                      @click="onApplyColumnFilters"
                    >
                      <template #default>
                        {{ t('table.column_config.apply') }}
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
              :disabled="isDateRangeExceedsWeek"
              checked-icon="material-symbols:sync"
              unchecked-icon="material-symbols:sync-disabled"
              size="sm"
              :class="isDateRangeExceedsWeek ? 'opacity-80 cursor-not-allowed' : ''"
            />
            <UTooltip
              :text="
                isDateRangeExceedsWeek
                  ? t('settlement.auto_refresh_disabled_long_range')
                  : `${t('settlement.auto_refresh_desc')} (${autoRefreshIntervalMs / 1000} ${t('seconds')})`
              "
              :delay-duration="200"
              placement="top"
            >
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

      <!-- ⚙️ Trailing Header -->
      <div class="flex justify-end items-center gap-2">
        <slot name="trailingHeader" />
        <ExportButton
          :data="filteredData"
          :headers="exportHeaders"
          :columns="filteredColumns"
          :export-options="resolvedExportOptions"
        />
        <div class="flex items-center gap-0">
          <!-- Column Configuration -->
          <UPopover>
            <template #default>
              <UTooltip
                key="column-config-tooltip"
                :text="t('table.column_config.tooltip')"
                :delay-duration="200"
                placement="top"
              >
                <UButton variant="ghost" class="p-2">
                  <UIcon
                    name="icon-park-outline:setting-config"
                    size="sm"
                    class="text-gray-900 dark:text-white"
                  />
                </UButton>
              </UTooltip>
            </template>

            <template #content>
              <div class="space-y-1 min-w-50">
                <div class="flex items-center justify-between px-2 pt-2">
                  <span class="text-sm font-medium">{{ t('table.column_config.columns') }}</span>
                </div>
                <Divider />
                <div class="flex flex-col gap-1 px-2">
                  <UCheckbox
                    v-for="col in columnConfig"
                    :id="col.id"
                    :key="col.id"
                    :label="getTranslationHeaderById(col.id)"
                    :model-value="columnVisibility[col.id] ?? true"
                    :ui="appConfig.ui.checkbox.slots"
                    variant="list"
                    class="text-sm px-2 py-1 w-full h-full rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    size="sm"
                    @update:model-value="
                      (value) => {
                        col.toggleVisibility(value as boolean)
                        columnVisibility[col.id] = value as boolean
                      }
                    "
                  />
                </div>
                <Divider />
                <div class="flex justify-end px-2 pb-2">
                  <UButton
                    variant="link"
                    size="xs"
                    color="neutral"
                    class="underline"
                    :ui="{
                      ...appConfig.ui.button.slots,
                      leadingIcon: 'shrink-0 size-3 text-muted',
                    }"
                    @click="onResetColumnVisibility"
                  >
                    <template #default>
                      {{ t('table.column_config.reset') }}
                    </template>
                  </UButton>
                </div>
              </div>
            </template>
          </UPopover>

          <!-- More Options Dropdown -->
          <UPopover>
            <template #default>
              <UTooltip :text="t('table.more_options')" :delay-duration="200" placement="top">
                <UButton variant="ghost" class="p-2">
                  <UIcon
                    name="material-symbols:more-vert"
                    size="sm"
                    class="text-gray-900 dark:text-white"
                  />
                </UButton>
              </UTooltip>
            </template>

            <template #content>
              <div class="py-1 min-w-40">
                <UButton
                  variant="ghost"
                  size="sm"
                  :icon="
                    isFullscreen
                      ? 'material-symbols:fullscreen-exit'
                      : 'material-symbols:fullscreen'
                  "
                  class="w-full justify-start px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="toggleFullscreen"
                >
                  {{ isFullscreen ? t('table.exit_fullscreen') : t('table.enter_fullscreen') }}
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </div>

    <!-- 📋 Main Table -->
    <UTable
      :key="tableKey"
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
      @select="onSelect"
    >
      <template #cell="{ row, column }">
        <div class="max-w-[200px] truncate whitespace-nowrap overflow-hidden">
          <span class="block">
            {{ (row.original as T)[column.id as keyof T] }}
          </span>
        </div>
      </template>

      <template #empty>
        <TableEmptyState class="h-full" />
      </template>
    </UTable>

    <!-- 📄 Pagination and Page Size -->
    <div
      class="flex items-center justify-between py-1 text-sm text-muted flex-shrink-0 mt-2 pb-2 px-3"
      :class="{
        'justify-between':
          (tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0,
        'justify-end': (tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length <= 0,
      }"
    >
      <div v-if="(tableRef?.tableApi?.getFilteredSelectedRowModel()?.rows ?? []).length > 0">
        <span>
          {{ tableRef?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ tableRef?.tableApi?.getFilteredRowModel().rows.length || 0 }} {{ t('row_selected') }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <USelectMenu
          v-model="pageSize"
          :items="DEFAULT_PAGE_SIZE_OPTIONS"
          size="sm"
          class="w-24"
          :search-input="false"
          @update:model-value="(val) => (pageSize = val)"
        />
        <UPagination
          :model-value="internalPage"
          :page-count="internalTotalPage"
          :items-per-page="pageSize.value"
          :total="internalTotal"
          size="sm"
          :ui="appConfig.ui.pagination.slots"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { CalendarDate } from '@internationalized/date'
import type { TableRow } from '@nuxt/ui'
import { computed, nextTick, onMounted, readonly, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { useTableConfig } from '~/composables/utils/useTableConfig'
// import type { ApiResponseDynamic } from '~/types/api'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type { QueryParams } from '~/models/baseModel'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, TABLE_CONSTANTS } from '~/utils/constants'
import { ColumnType, FilterOperatorPgwModule } from '~/utils/enumModel'
import appConfig from '~~/app.config'
import ExportButton from '../buttons/ExportButton.vue'

export interface ExportOptions {
  fileName?: string
  title?: string
  subtitle?: string
  currency?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
  exportBy?: string
  exportDate?: string
  filter?: Record<string, string>
}

const auth = useAuth()
const user = auth.user

// Use table configuration composable
const tableConfig = useTableConfig()

const defaultColumnVisibility = ref<Record<string, boolean>>({})

// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(props.tableId)
  if (savedConfig && Object.keys(savedConfig).length > 0) {
    return savedConfig
  }

  // If no saved config or empty, use current defaultColumnVisibility
  if (Object.keys(defaultColumnVisibility.value).length > 0) {
    return { ...defaultColumnVisibility.value }
  }

  // Fallback: create default visibility for all columns
  const defaultVisibility: Record<string, boolean> = {}
  columnsWithRowNumber.value.forEach((col) => {
    if (col.id) {
      defaultVisibility[col.id] = true
    }
  })
  return defaultVisibility
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
  const lastDay = new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  )

  return {
    start: `${firstDay.year}-${String(firstDay.month).padStart(2, '0')}-${String(firstDay.day).padStart(2, '0')}`,
    end: `${lastDay.year}-${String(lastDay.month).padStart(2, '0')}-${String(lastDay.day).padStart(2, '0')}`,
  }
}

// Initialize sorting from localStorage or defaults
// only sort if saved OR defaultSorting is provided; otherwise no sorting
const initializeSorting = (): Array<{ id: string; desc: boolean }> => {
  // If you want to ignore saved state entirely, comment these two lines out.
  const saved = tableConfig.getSortingState(props.tableId)
  if (saved?.length) return saved

  if (props.defaultSorting?.length) {
    const colIds = new Set((props.columns ?? []).map((c) => String(c.id ?? c.accessorKey ?? '')))
    const fromProp = props.defaultSorting.filter((s) => colIds.has(s.id))
    if (fromProp.length) return fromProp
  }

  // ⬇️ No fallback -> means no initial sorting
  return []
}

const columnVisibility = ref<Record<string, boolean>>({})
const columnFilters = ref<Record<string, string>>({})
const appliedColumnFilters = ref<Record<string, string>>({})
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
  if (import.meta.env.DEV)
    console.log(`DEV: 💾 Saved column filters for table ${props.tableId}:`, columnFilters.value)
}

const saveDateRange = () => {
  tableConfig.saveDateRange(props.tableId, dateRange.value)
  if (import.meta.env.DEV)
    console.log(`DEV: 💾 Saved date range for table ${props.tableId}:`, dateRange.value)
}

const saveSorting = () => {
  tableConfig.saveSortingState(props.tableId, sorting.value)
  if (import.meta.env.DEV)
    console.log(`DEV: 💾 Saved sorting for table ${props.tableId}:`, sorting.value)
}

watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(dateRange, saveDateRange, { deep: true })
watch(sorting, saveSorting, { deep: true })

// Create column config based on actual columns instead of table API
const columnConfig = computed(() => {
  const config = columnsWithRowNumber.value
    .filter((col) => col.enableHiding !== false && col.id !== 'select' && col.id !== 'row_number')
    .map((col) => ({
      id: col.id,
      getCanHide: () => col.enableHiding !== false,
      toggleVisibility: (visible: boolean) => {
        // Update our reactive state first
        if (col.id) {
          columnVisibility.value[col.id] = visible
        }

        // Force table to rebuild by updating the key
        nextTick(() => {
          // The table will rebuild automatically due to filteredColumns computed dependency
          // on columnVisibility.value
          if (import.meta.env.DEV) {
            console.log(`📊 Column visibility changed for '${col.id}': ${visible}`)
          }
        })
      },
    }))

  if (import.meta.env.DEV) {
    console.log(
      `📊 Column config for table ${props.tableId}:`,
      config.map((c) => c.id)
    )
  }

  return config
})

const getTranslationHeaderById = (id: string) => {
  return t(`table.${props.tableId}.columns.${id}`)
}

const search = ref('')
const startDate = ref('')
const endDate = ref('')
// const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const today = new Date()
const showDateFilter = computed(() => props.showDateFilter ?? true)

// Check if date range exceeds 7 days (a week)
const isDateRangeExceedsWeek = computed(() => {
  if (!startDate.value || !endDate.value) return false

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 7
})

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

// Get auto refresh interval from user preferences (in seconds)
const autoRefreshIntervalMs = computed(() => {
  const userPrefs = useUserPreferences()
  const currentPrefs = userPrefs.getPreferences()
  const intervalSeconds = currentPrefs?.autoRefreshInterval || 30
  return intervalSeconds * 1000 // Convert to milliseconds
})

const selectedStatuses = ref<{ label: string; value: string }[]>([{ label: 'all', value: '' }])
const appliedSelectedStatuses = ref<{ label: string; value: string }[]>([
  { label: 'all', value: '' },
])
const autoRefresh = ref(false)
const isRefreshing = ref(false)

const showColumnFilterPopup = ref(false)

const emit = defineEmits<{
  (e: 'filter-change', columnId: string, value: string): void
  (e: 'sort-change', columnId: string, direction: 'asc' | 'desc' | null): void
  (e: 'row-click', rowData: T): void
  (e: 'data-changed', result: TableFetchResult<T[]> & Record<string, unknown>): void
  (e: 'daterange-change', dateRange: { start: string; end: string }): void
  (e: 'fullscreen-toggle', isFullscreen: boolean): void
  (e: 'bank-filter-scroll', columnId: string): void
}>()

// Fullscreen state
const isFullscreen = ref(false)

// Internal state management
const internalData = ref<T[]>([])
const internalPage = ref(1)
const internalTotal = ref(0)
const internalTotalPage = ref(0)
const loading = ref(false)

// Table key to force rebuild when needed
const tableKey = computed(() => {
  // Include column visibility in the key to force table rebuild
  const visibilityHash = Object.entries(columnVisibility.value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')
  return `${props.tableId}-${visibilityHash}`
})

// Use internal data if no data prop is provided
const tableData = computed(() => internalData.value)

const onFilterPopoverToggle = (isOpen: boolean) => {
  if (isOpen) {
    // When popover opens, initialize with current applied filters (not saved filters)
    // This ensures the popup shows what's currently applied
    columnFilters.value = { ...appliedColumnFilters.value }
    selectedStatuses.value = [...appliedSelectedStatuses.value]

    if (import.meta.env.DEV) {
      console.log(
        `DEV: 📂 Loaded applied filters for popup in table ${props.tableId}:`,
        appliedColumnFilters.value
      )
    }
  }
}

const onApplyColumnFilters = async () => {
  // Update applied filters when apply is clicked
  appliedColumnFilters.value = { ...columnFilters.value }
  appliedSelectedStatuses.value = [...selectedStatuses.value]

  saveColumnFilters()
  showColumnFilterPopup.value = false
  if (props.fetchDataFn && mounted.value) {
    // Reset to first page when filters change
    internalPage.value = 1
    await fetchData()
  }
}

// Fetch data function
const fetchData = async (refresh = false) => {
  if (!props.fetchDataFn) return

  loading.value = true
  if (refresh) {
    isRefreshing.value = true
  }
  try {
    // Build sorts parameter from current sort state
    const sorts =
      sortState.value?.value.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? 'desc' : ('asc' as 'desc' | 'asc'),
      })) || []

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
        operator: FilterOperatorPgwModule.Equals,
        value,
      }))

    const result = await props.fetchDataFn({
      page: internalPage.value,
      page_size: pageSize.value.value,
      search: search.value,
      // start_date: props.showDateFilter ? formatDateForBackendRequest(startDate.value, 'yyyy/MM/dd') : undefined,
      // end_date: props.showDateFilter ? formatDateForBackendRequest(endDate.value, 'yyyy/MM/dd') : undefined,
      start_date: props.showDateFilter
        ? formatDateForBackendRequest(startDate.value, startDateFormatPattern.value)
        : undefined,
      end_date: props.showDateFilter
        ? formatDateForBackendRequest(endDate.value, endDateFormatPattern.value)
        : undefined,
      Statuses: selectedStatuses.value
        .filter((s) => s.value !== 'all' && s.value !== '')
        .map((s) => s.value),
      sorts: Array.from(sorts),
      sortAsString: sortingStr,
      filters: filters.length > 0 ? filters : [],
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
watch(
  sorting,
  async (_newSorting) => {
    if (props.fetchDataFn && mounted.value) {
      // Reset to first page when sort changes
      internalPage.value = 1
      await fetchData()
    }
  },
  { deep: true }
)

const { t } = useI18n()

const filteredData = computed(() => {
  const data = tableData.value as T[]
  return data
  // let result: T[] = data

  // for (const [key, val] of Object.entries(columnFilters.value)) {
  //   if (val) {
  //     result = result.filter((row) => String(row[key as keyof T]) === val)
  //   }
  // }

  // return result
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
  fetchDataFn?: (
    params?: QueryParams
  ) => Promise<(TableFetchResult<T[]> & Record<string, unknown>) | null | undefined>
  enabledAutoRefresh?: boolean
  searchTooltip?: string
  // New optional props to customize date formats sent to backend
  dateFormat?: string
  startDateFormat?: string
  endDateFormat?: string
  defaultSorting?: Array<{ id: string; desc: boolean }>
}>()

// Computed helpers for customizable date formats
const startDateFormatPattern = computed(
  () => props.startDateFormat || props.dateFormat || 'yyyy/MM/dd'
)
const endDateFormatPattern = computed(() => props.endDateFormat || props.dateFormat || 'yyyy/MM/dd')

// Watch for page size changes and refetch data
watch(pageSize, async (_newSize) => {
  internalPage.value = 1
  if (props.fetchDataFn && mounted.value) {
    await fetchData()
  }
})

const resolvedExportOptions = computed((): ExportOptions => {
  // Auto-generate export options from internal table state
  const timestamp = new Date().toISOString().split('T')[0]

  // Build automatic filter display from current table state
  const autoFilter: Record<string, string> = {}

  // ALWAYS show date range (even if it's "All Time")
  if (showDateFilter.value) {
    if (startDate.value && endDate.value) {
      const startDateFormatted = new Date(startDate.value).toLocaleDateString()
      const endDateFormatted = new Date(endDate.value).toLocaleDateString()
      autoFilter[t('date_range')] =
        startDateFormatted === endDateFormatted
          ? startDateFormatted
          : `${startDateFormatted} ${t('to')} ${endDateFormatted}`
    } else {
      autoFilter[t('date_range')] = t('all_time')
    }
  }

  // ALWAYS show search filter (even if it's "All")
  autoFilter[t('search')] = search.value?.trim() || t('all')

  // ALWAYS show status filters (even if it's "All")
  const activeStatuses = appliedSelectedStatuses.value.filter(
    (s) => s.value !== 'all' && s.value !== ''
  )
  if (activeStatuses.length > 0) {
    autoFilter[t('status.header')] = activeStatuses
      .map((status) => status.label || status.value.charAt(0).toUpperCase() + status.value.slice(1))
      .join(', ')
  } else {
    autoFilter[t('status.header')] = t('all')
  }

  // ALWAYS show ALL possible column filters (including those set to "All")
  const allFilterableColumns = filteredColumns.value.filter(
    (col) => col.enableColumnFilter === true
  )

  allFilterableColumns.forEach((column) => {
    if (column.id) {
      // Get the display name for this column
      let displayName = getTranslationHeaderById(column.id)
      if (displayName.includes('table.') && displayName.includes('.columns.')) {
        // Translation not found, use column label or formatted field name
        displayName = getColumnLabel(column)
      }

      // Get the current filter value (from applied filters)
      const currentValue = appliedColumnFilters.value[column.id]

      if (currentValue && currentValue.trim() !== '' && currentValue !== 'all') {
        // Show the actual filter value
        const displayValue = currentValue.charAt(0).toUpperCase() + currentValue.slice(1)
        autoFilter[displayName] = displayValue
      } else {
        // Show "All" for columns that have no filter applied
        autoFilter[displayName] = t('all')
      }
    }
  })

  // ALWAYS show sorting information (even if no sorting applied)
  if (sorting.value.length > 0) {
    const sortInfo = sorting.value
      .map((sort) => {
        const column = props.columns.find((col) => col.id === sort.id)
        const columnName = column ? getColumnLabel(column) : sort.id
        const direction = sort.desc ? t('descending') : t('ascending')
        return `${columnName} (${direction})`
      })
      .join(', ')
    autoFilter[t('sorting')] = sortInfo
  } else {
    autoFilter[t('sorting')] = t('none')
  }

  // Add page size information
  autoFilter[t('page_size')] = `${pageSize.value.value} ${t('records_per_page')}`

  // Add current page information if applicable
  if (internalTotalPage.value > 1) {
    autoFilter[t('current_page')] = `${internalPage.value} ${t('of')} ${internalTotalPage.value}`
  }

  // Use export options from props as base, but override with auto-generated values
  return {
    fileName:
      props.exportOptions?.fileName ??
      `${props.tableId.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_${timestamp}`,
    title:
      (props.exportOptions?.title ??
      t(`table.${props.tableId}.title`) !== `table.${props.tableId}.title`)
        ? t(`table.${props.tableId}.title`)
        : props.tableId.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    subtitle: props.exportOptions?.subtitle ?? '',
    currency: props.exportOptions?.currency,
    startDate: startDate.value,
    endDate: endDate.value,
    totalAmount: props.exportOptions?.totalAmount ?? 0,
    exportDate: new Date().toISOString(),
    exportBy: (user.value?.fullName as string) || (t('system') as string),
    filter: {
      ...autoFilter,
      // Allow props to override auto-generated filters if needed
      ...props.exportOptions?.filter,
    },
  }
})

const tableRef = useTemplateRef('tableRef')
const allColumnIds = computed(() =>
  columnsWithRowNumber.value.map((col) => col.id).filter((id): id is string => !!id)
)

// Computed property for sort menu items

// Computed property for active filter count
const activeFilterCount = computed(() => {
  // If filter popup is open, count based on current selections (columnFilters)
  // Otherwise, count based on applied filters (appliedColumnFilters)
  const filtersToCount = showColumnFilterPopup.value
    ? columnFilters.value
    : appliedColumnFilters.value
  const statusesToCount = showColumnFilterPopup.value
    ? selectedStatuses.value
    : appliedSelectedStatuses.value

  const columnFilterCount = Object.values(filtersToCount).filter(
    (val) => val !== '' && val !== 'all'
  ).length
  const sortFilterCount = selectedSortField.value ? 1 : 0
  return (
    columnFilterCount +
    sortFilterCount +
    (statusesToCount.filter((s) => s.value !== 'all' && s.value !== '').length > 0 ? 1 : 0)
  )
})

const exportHeaders = computed(() =>
  filteredColumns.value
    .filter((col) => {
      if (
        col.id === 'select' ||
        col.accessorKey === 'select' ||
        // col.id === 'row_number' ||
        // col.accessorKey === 'row_number' ||
        col.id === undefined
      ) {
        return false
      }
      return true
    })
    .map((col) => ({
      key: String(col.accessorKey || col.id),
      label:
        typeof col.header === 'string'
          ? col.header
          : (col.id ? String(getTranslationHeaderById(col.id)) : '')
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
  if (col.filterOptions)
    return col.filterOptions.filter((opt) => {
      if (typeof opt.value === 'string')
        return opt.value.trim() !== '' && opt.value.trim() !== 'all'
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

function getSelectedFilterOption(col: BaseTableColumn<T>, selectedValue: string) {
  if (!selectedValue) {
    return { label: t('all'), value: '' }
  }

  // Find the selected option from the column's filter options
  const options = getColumnFilterOptions(col)
  const selectedOption = options.find((option) => String(option.value) === selectedValue)

  if (selectedOption) {
    return selectedOption
  }

  // Fallback: create option with the selected value
  return { label: selectedValue, value: selectedValue }
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
  // Force reactivity by accessing columnVisibility state
  const _ = columnVisibility.value

  // Create a fresh copy of columns to avoid mutation issues
  const columns = columnsWithRowNumber.value.map((col) => ({ ...col }))

  console.log(`Processing columns: ${columns.map((col) => col.id).join(', ')}`)
  columns.forEach((col) => {
    if (
      col.id === 'select' ||
      col.accessorKey === 'select' ||
      col.id === 'row_number' ||
      col.accessorKey === 'row_number' ||
      col.id === undefined
    ) {
      // Skip selection column
      return
    }
    // If sorting is enabled, wrap header in sortable header function
    if (col.enableSorting) {
      col.header = ({ column }) =>
        createSortableHeader(
          column,
          col.headerText ? t(col.headerText) : getTranslationHeaderById(col.id),
          col.sortableHeaderAlignment || 'left'
        )
    } else {
      col.header = () => (col.headerText ? t(col.headerText) : getTranslationHeaderById(col.id))
    }
  })

  // re-build cells
  columns.forEach((col) => {
    if (col.type === ColumnType.DateTime && !col.cell) {
      col.cell = ({ row }) => useFormat().formatDateTime(row.getValue(col.id as string))
    }
    // else if (col.type === ColumnType.Amount && !col.cell) {
    //   col.cell = ({ row }) => {
    //     h(
    //       'div',
    //       { class: 'text-right' },
    //       formatAmountV2('12345',  DEFAULT_CURRENCY_CONFIG.code)
    //     )
    //   }
    // }
  })

  // Use columnVisibility ref directly instead of relying on table API
  const visibleColumnIds = Object.entries(columnVisibility.value)
    .filter(([_, isVisible]) => isVisible)
    .map(([columnId]) => columnId)

  // If no visible ids are selected, fallback to showing all
  if (visibleColumnIds.length === 0 && allColumnIds.value.length > 0) {
    return columns
  }

  return columns.filter((col) => {
    if (!col.id) return true
    return visibleColumnIds.includes(col.id)
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
    cell: ({ row, table }) =>
      createRowNumberCell(row, table, internalPage.value, pageSize.value.value),
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
  // Set up default column visibility first - include all columns that might be added
  defaultColumnVisibility.value = columnsWithRowNumber.value.reduce(
    (acc, col) => {
      if (col.id) {
        acc[col.id] = true // Default to visible
      }
      return acc
    },
    {} as Record<string, boolean>
  )

  // Initialize date range from localStorage or defaults
  const initialDateRange = initializeDateRange()
  dateRange.value = initialDateRange
  columnFilters.value = initializeColumnFilters()
  sorting.value = initializeSorting()

  // Initialize column visibility and ensure all columns are included
  const initialColumnVisibility = initializeColumnVisibility()

  // Merge with default to ensure all columns are present
  columnVisibility.value = {
    ...defaultColumnVisibility.value,
    ...initialColumnVisibility,
  }

  if (import.meta.env.DEV) {
    console.log(
      `📊 Initialized column visibility for table ${props.tableId}:`,
      columnVisibility.value
    )
    console.log(
      `📊 Default column visibility for table ${props.tableId}:`,
      defaultColumnVisibility.value
    )
  }

  // Parse the date strings to set calendar values and internal date values
  try {
    const startParts = initialDateRange.start.split('-').map(Number)
    const endParts = initialDateRange.end.split('-').map(Number)

    if (
      startParts.length === 3 &&
      endParts.length === 3 &&
      startParts.every((p) => !isNaN(p)) &&
      endParts.every((p) => !isNaN(p))
    ) {
      startDate.value = initialDateRange.start
      endDate.value = initialDateRange.end

      modelValue.value.start = new CalendarDate(startParts[0]!, startParts[1]!, startParts[2]!)
      modelValue.value.end = new CalendarDate(endParts[0]!, endParts[1]!, endParts[2]!)
    } else {
      // Fallback to current month if parsing fails
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      const firstDayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
      const lastDayCalendar = new CalendarDate(
        today.getFullYear(),
        today.getMonth() + 1,
        lastDayOfMonth
      )

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
    const lastDayCalendar = new CalendarDate(
      today.getFullYear(),
      today.getMonth() + 1,
      lastDayOfMonth
    )

    startDate.value = `${firstDayCalendar.year}-${String(firstDayCalendar.month).padStart(2, '0')}-${String(firstDayCalendar.day).padStart(2, '0')}`
    endDate.value = `${lastDayCalendar.year}-${String(lastDayCalendar.month).padStart(2, '0')}-${String(lastDayCalendar.day).padStart(2, '0')}`
    modelValue.value.start = firstDayCalendar
    modelValue.value.end = lastDayCalendar
  }
})

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Initialize auto-refresh state from table config
  const isAutoRefresh = tableConfig.getIsAutoRefresh(props.tableId)
  if (isAutoRefresh !== null) {
    autoRefresh.value = isAutoRefresh
  }

  // Initialize applied filters with current values
  appliedColumnFilters.value = { ...columnFilters.value }
  appliedSelectedStatuses.value = [...selectedStatuses.value]
  // columnFilters.value = initializeColumnFilters()
  // sorting.value = initializeSorting()

  if (import.meta.env.DEV) {
    console.log(
      `📊 Initialized column visibility for table ${props.tableId}:`,
      columnVisibility.value
    )
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
    }, autoRefreshIntervalMs.value)
  }

  mounted.value = true
})

// Watch for table API changes but don't sync column visibility
// as we manage it through our reactive state
watch(
  () => tableRef?.value?.tableApi,
  (tableApi) => {
    if (tableApi && import.meta.env.DEV) {
      console.log('📊 Table API available for table:', props.tableId)
    }
  },
  { immediate: true }
)

watch(autoRefresh, (val) => {
  if (val) {
    if (!autoRefreshInterval) {
      autoRefreshInterval = setInterval(() => {
        if (props.fetchDataFn) fetchData()
      }, autoRefreshIntervalMs.value)
    }
  } else {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }
  tableConfig.saveAutoRefresh(props.tableId, autoRefresh.value)
})

// Watch for date range changes and disable auto-refresh if range exceeds 7 days
watch(isDateRangeExceedsWeek, (exceedsWeek) => {
  if (exceedsWeek && autoRefresh.value) {
    autoRefresh.value = false
  }
})

// Watch for auto refresh interval changes and restart interval if needed
watch(autoRefreshIntervalMs, () => {
  if (autoRefresh.value && autoRefreshInterval) {
    // Clear existing interval and restart with new interval
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = setInterval(() => {
      if (props.fetchDataFn) fetchData()
    }, autoRefreshIntervalMs.value)
  }
})

onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
})

watch(modelValue, (val) => {
  // Convert CalendarDate directly to YYYY-MM-DD format without timezone conversion
  const start = val.start
    ? `${val.start.year}-${String(val.start.month).padStart(2, '0')}-${String(val.start.day).padStart(2, '0')}`
    : ''
  const end = val.end
    ? `${val.end.year}-${String(val.end.month).padStart(2, '0')}-${String(val.end.day).padStart(2, '0')}`
    : ''

  startDate.value = start
  endDate.value = end

  // Update the dateRange ref which will trigger localStorage save
  dateRange.value = { start, end }

  if (props.fetchDataFn && mounted.value) {
    fetchData()
  }
})

const onResetColumnVisibility = () => {
  // Reset to default visibility state
  columnVisibility.value = { ...defaultColumnVisibility.value }

  if (import.meta.env.DEV) {
    console.log('📊 Reset column visibility to defaults:', columnVisibility.value)
  }
}

const resetColumnFilters = () => {
  columnFilters.value = {}
  selectedStatuses.value = [{ label: 'all', value: '' }]
  emit('filter-change', '', '')
  showColumnFilterPopup.value = false
  onApplyColumnFilters()
}

const resetSorting = () => {
  sorting.value = []
  emit('sort-change', '', null)
}

// Fullscreen toggle function
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  emit('fullscreen-toggle', isFullscreen.value)
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
  isFullscreen: readonly(isFullscreen),
  toggleFullscreen,
})
</script>

<style scoped>
.single-line-headers :deep(th) {
  white-space: nowrap;
}
</style>
