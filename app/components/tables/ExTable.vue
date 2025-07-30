<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <!-- Unified Card Container -->
  <div
    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow p-0 flex flex-col h-full overflow-auto"
  >
    <!-- Filter / Sort / Column Configuration -->
    <div class="flex justify-between flex-wrap items-start gap-4 flex-shrink-0 mb-2 pt-2 px-3">
      <!-- 🔍 Filter Buttons -->
      <div class="flex gap-2 flex-wrap items-center">
        <div class="flex flex-wrap items-center gap-2">
          <!-- <UInput v-model="search" :placeholder="t('table.search_placeholder')" class="w-64" /> -->
          <ExSearch
            v-model="search"
            :placeholder="t('table.search_placeholder')"
            class="w-64"
            @search="debouncedFetchData"
          />
          <template v-if="showDateFilter">
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
                class="bg-gray hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700"
              >
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
            <UButton variant="ghost" class="p-2 relative">
              <UIcon name="i-lucide:filter" size="sm" class="text-gray-900 dark:text-white" />
              <span
                v-if="activeFilterCount > 0"
                class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ activeFilterCount }}
              </span>
            </UButton>
            <template #content>
              <div
                class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden p-4 min-w-[200px] space-y-4"
              >
                <!-- Column Filters -->
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Filters</h4>
                  <div class="space-y-2">
                    <template v-for="col in filteredColumns" :key="col.id">
                      <template v-if="col.enableColumnFilter">
                        <USelectMenu
                          :model-value="{
                            label: columnFilters[col.id] || getColumnLabel(col),
                            value: columnFilters[col.id] || '',
                          }"
                          :items="[{ label: t('all'), value: '' }, ...getColumnFilterOptions(col)]"
                          option-attribute="label"
                          value-attribute="value"
                          class="w-full"
                          :search-input="false"
                          @update:model-value="
                            (val) => {
                              columnFilters[col.id] = val?.value || ''
                              emit('filter-change', col.id, columnFilters[col.id] || '')
                            }
                          "
                        />
                      </template>
                    </template>
                  </div>
                </div>
                <!-- Sort Select Menu -->
                <!-- <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Sort By</h4>
                  <USelectMenu
                    :model-value="{
                      label: selectedSortLabel || t('sort_by'),
                      value: selectedSortField
                        ? `${selectedSortField}:${selectedSortDirection}`
                        : '',
                      icon: selectedSortField
                        ? selectedSortDirection === 'asc'
                          ? 'i-lucide-arrow-up'
                          : 'i-lucide-arrow-down'
                        : '',
                    }"
                    :items="sortMenuItems"
                    option-attribute="label"
                    value-attribute="value"
                    class="w-full"
                    :search-input="false"
                    @update:modelValue="handleSortMenuChange"
                  >
                    <template #item="{ item }">
                      <div class="flex items-center justify-between w-full">
                        <span>{{ item.label }}</span>
                        <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
                      </div>
                    </template>
                  </USelectMenu>
                </div> -->
              </div>
            </template>
          </UPopover>
        </div>
      </div>

      <!-- ⚙️ Column Configuration -->
      <div class="flex justify-end items-center gap-2">
        <ExportButton
          :data="filteredData"
          :headers="exportHeaders"
          :export-options="resolvedExportOptions"
        />

        <UPopover>
          <UTooltip
            key="column-config-tooltip"
            :text="t('settlement_history.column_config.tooltip')"
            :delay-duration="200"
            placement="top"
            ><UButton variant="ghost" class="p-2">
              <UIcon
                name="icon-park-outline:setting-config"
                size="sm"
                class="text-gray-900 dark:text-white"
              /> </UButton
          ></UTooltip>

          <template #content>
            <!-- <div
              class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden p-4 min-w-[200px] space-y-2"
            >
              <div
                v-for="option in columnOptions"
                :key="option.value"
                class="flex items-center gap-2"
              >
                <input
                  :id="`col-${option.value}`"
                  v-model="visibleColumnIds"
                  type="checkbox"
                  :value="option.value"
                />
                <label :for="`col-${option.value}`">{{ option.label }}</label>
              </div>
              <button
                class="mt-2 text-xs text-blue-600 underline"
                type="button"
                @click="resetColumns"
              >
                Reset Columns
              </button>
            </div> -->
            <div class="p-2 space-y-1 min-w-50">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">{{
                  t('table.column_config.columns')
                }}</span>
                <!-- <UButton variant="solid" class="text-muted" size="xs" @click="onResetColumnConfig">
                  {{ t('settlement_history.column_config.reset') }}
                </UButton> -->
                <UTooltip
                  :text="t('table.column_config.reset')"
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
                    @click="resetColumns"
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
                    // columnVisibility[col.id] = value as boolean
                    // saveColumnVisibility()
                  }
                "
              />
              </div>
            
          </template>
        </UPopover>
      </div>
    </div>

    <!-- 📋 Main Table -->
    <div class="flex-1 min-h-0 flex flex-col">
      <div class="flex-1 overflow-hidden">
        <UTable
          :key="filteredColumns.length + '-' + visibleColumnIds.join(',')"
          ref="tableRef"
          :data="filteredData"
          :columns="filteredColumns"
          :sort="sortState"
          sticky
          class="single-line-headers w-full h-full bg-white dark:bg-gray-800"
          :class="borderClass ? borderClass : 'border border-gray-200 dark:border-gray-700'"
          :ui="appConfig.ui.table.slots"
          @update:sort="handleSortChange"
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
            <TableEmptyState />
          </template>

          <template #footer />

          <slot />
        </UTable>
      </div>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import type { BaseTableColumn } from '~/components/tables/table'
import type { TableRow } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import ExportButton from '../buttons/ExportButton.vue'
import appConfig from '~~/app.config'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '~/utils/constants'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'

export interface ExportOptions {
  fileName?: string
  title?: string
  subtitle?: string
  currency?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
}

// const selectedSortFieldLabel = computed(() => {
//   return (
//     sortableColumnOptions.value.find((opt) => opt.value === selectedSortField.value)?.label ?? ''
//   )
// })

// const sortDirectionLabel = computed(() => {
//   return (
//     sortDirectionOptions.find((opt) => opt.value === selectedSortDirection.value)?.label ??
//     t('ascending')
//   )
// })

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

// const selectedSortLabel = computed(() => {
//   const col = sortableColumnOptions.value.find((c) => c.value === selectedSortField.value)
//   if (!col) return ''
//   const dir = selectedSortDirection.value === 'asc' ? t('ascending') : t('descending')
//   return `${col.label} (${dir})`
// })

const showAdvancedOptions = ref(false)

const emit = defineEmits<{
  (e: 'filter-change', columnId: string, value: string): void
  (e: 'sort-change', columnId: string, direction: 'asc' | 'desc' | null): void
  (e: 'row-click', rowData: T): void
}>()

// Internal state management
const internalData = ref<T[]>([])
const internalPage = ref(1)
const internalTotal = ref(0)
const internalTotalPage = ref(0)
const loading = ref(false)

// Use internal data if no data prop is provided
const tableData = computed(() => props.data || internalData.value)

// Fetch data function
const fetchData = async () => {
  if (!props.fetchDataFn) return

  loading.value = true
  try {
    const result = await props.fetchDataFn({
      page: internalPage.value,
      pageSize: pageSize.value.value,
      search: search.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })

    if (result) {
      internalData.value = result.records
      internalTotal.value = result.total_record
      internalTotalPage.value = result.total_page
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const sortState = ref<{ column: string; direction: 'asc' | 'desc' | null } | null>(null)

const { t } = useI18n()

// const filterPopoverOpen = ref<Record<string, boolean>>({})

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
  borderClass?: string
  tableId: string
  exportOptions?: ExportOptions
  showDateFilter?: boolean
  showRowNumber?: boolean
  fetchDataFn?: (params?: {
    page?: number
    pageSize?: number
    search?: string
    startDate?: string
    endDate?: string
  }) => Promise<{ records: T[]; total_record: number; total_page: number } | null | undefined>
}>()

watch(pageSize, async (_newSize) => {
  internalPage.value = 1
  if (props.fetchDataFn) {
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
    props.exportOptions?.totalAmount ??
    filteredData.value.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableRef = ref<any>(null)
const storageKey = computed(() => `base-table-columns:${props.tableId}`)
const allColumnIds = computed(() =>
  columnsWithRowNumber.value.map((col) => col.id).filter((id): id is string => !!id)
)

const visibleColumnIds = ref<string[]>([])

// const columnOptions = computed(() =>
//   columnsWithRowNumber.value
//     .filter((col) => !!col.id)
//     .map((col) => ({
//       label: getColumnLabel(col),
//       value: col.id!,
//     }))
// )

const debouncedFetchData = debounce(() => {
  if (props.fetchDataFn) {
    fetchData()
  }
})

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
  if (col.filterOptions) return col.filterOptions

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

const handleSortChange = (sort: { column: string; direction: 'asc' | 'desc' | null }) => {
  sortState.value = sort
  emit('sort-change', sort.column, sort.direction)
}

const handlePageChange = async (val: number) => {
  internalPage.value = val
  if (props.fetchDataFn) {
    await fetchData()
  }
}

const filteredColumns = computed(() => {
  const columns = columnsWithRowNumber.value

  // If no visible ids are selected, fallback to showing all
  if (visibleColumnIds.value.length === 0 && allColumnIds.value.length > 0) {
    return columns
  }

  return columns.filter((col) => {
    if (!col.id) return true
    return visibleColumnIds.value.includes(col.id)
  })
})

const columnFilters = ref<Record<string, string>>({})

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

  const rowNumberColumn = {
    id: 'row_number',
    header: '#',
    accessorKey: 'row_number',
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }: { row: { index: number } }) => {
      const currentPage = internalPage.value
      const currentPageSize = pageSize.value.value
      return (currentPage - 1) * currentPageSize + row.index + 1
    },
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

onMounted(() => {
  const saved = localStorage.getItem(storageKey.value)

  if (saved) {
    // ✅ Use only the user's saved config
    visibleColumnIds.value = JSON.parse(saved)
  } else {
    // ✅ First time only — show all columns
    visibleColumnIds.value = [...allColumnIds.value]
  }

  // Fetch initial data if fetchDataFn is provided
  if (props.fetchDataFn) {
    fetchData()
  }
})

watch(
  visibleColumnIds,
  (val) => {
    localStorage.setItem(storageKey.value, JSON.stringify(val))
  },
  { deep: true }
)

watch(search, () => {
  debouncedFetchData()
})

watch(modelValue, (val) => {
  const start = val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  const end = val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  startDate.value = start
  endDate.value = end
  if (props.fetchDataFn) {
    fetchData()
  }
})

const resetColumns = () => {
  tableRef.value?.tableApi?.resetColumnVisibility?.()
  visibleColumnIds.value = [...allColumnIds.value]
}

defineExpose({
  tableRef,
  tableApi: computed(() => tableRef.value?.tableApi),
  getSelectedRows: () => tableRef.value?.tableApi?.getFilteredSelectedRowModel().rows || [],
  getAllRows: () => tableRef.value?.tableApi?.getFilteredRowModel().rows || [],
  clearSelection: () => tableRef.value?.tableApi?.resetRowSelection?.(),
})
</script>

<style scoped>
.single-line-headers :deep(th) {
  white-space: nowrap;
}
</style>
