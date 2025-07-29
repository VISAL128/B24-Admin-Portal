<template>
  <!-- Unified Card Container -->
  <div
    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow p-6 space-y-4"
  >
    <!-- Filter / Sort / Column Configuration -->
    <div class="flex justify-between flex-wrap items-start gap-4">
      <!-- 🔍 Filter Buttons -->
      <div class="flex gap-2 flex-wrap items-center">
        <div class="flex flex-wrap items-center gap-2">
          <UInput v-model="search" :placeholder="t('table.search_placeholder')" class="w-64" />
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

          <UPopover v-model:open="showAdvancedOptions">
            <UButton variant="ghost" class="p-2 relative">
              <UIcon name="i-lucide:filter" class="w-4 h-4 text-gray-900 dark:text-white" />
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
                          @update:modelValue="
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
                <div class="space-y-2">
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
                </div>
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
          <UButton variant="ghost" class="p-2">
            <UIcon name="i-lucide:settings" class="w-4 h-4 text-gray-900 dark:text-white" />
          </UButton>
          <template #content>
            <div
              class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden p-4 min-w-[200px] space-y-2"
            >
              <div
                v-for="option in columnOptions"
                :key="option.value"
                class="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :id="`col-${option.value}`"
                  :value="option.value"
                  v-model="visibleColumnIds"
                />
                <label :for="`col-${option.value}`">{{ option.label }}</label>
              </div>
              <button
                class="mt-2 text-xs text-blue-600 underline"
                @click="resetColumns"
                type="button"
              >
                Reset Columns
              </button>
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- 📋 Main Table -->
    <div class="overflow-x-auto max-w-full">
      <UTable
        :key="filteredColumns.length + '-' + visibleColumnIds.join(',')"
        ref="tableRef"
        :data="filteredData"
        :columns="filteredColumns"
        :sort="sortState"
        @update:sort="handleSortChange"
        sticky
        class="min-w-[800px] single-line-headers"
        :class="borderClass"
        @select="onSelect"
        :ui="{
          td: 'px-2 py-3 whitespace-nowrap align-top',
          th: 'px-2 py-3 whitespace-nowrap text-left',
          thead: 'whitespace-nowrap',
          tbody: 'whitespace-nowrap',
        }"
      >
        <template #cell="{ row, column }">
          <div class="max-w-[200px] truncate whitespace-nowrap overflow-hidden">
            <span class="block">
              {{ (row.original as any)[column.id] }}
            </span>
          </div>
        </template>

        <template #empty>
          <slot name="empty">
            <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              No data available.
            </div>
          </slot>
        </template>

        <slot />
      </UTable>
      <div class="flex items-center justify-between px-1 py-1 text-sm text-muted">
        <span>
          {{ tableRef?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ tableRef?.tableApi?.getFilteredRowModel().rows.length || 0 }} {{ t('row_selected') }}
        </span>
        <div class="flex items-center gap-4">
          <USelectMenu
            :model-value="{ label: String(props.pageSize ?? 10), value: props.pageSize ?? 10 }"
            :items="[
              { label: '10', value: 10 },
              { label: '25', value: 25 },
              { label: '50', value: 50 },
              { label: '100', value: 100 },
            ]"
            class="w-24"
            :search-input="false"
            @update:modelValue="(val) => emit('update:pageSize', val.value)"
          />
          <UPagination
            :model-value="props.page"
            :page-count="props.totalPage"
            :items-per-page="props.pageSize"
            :total="props.total"
            @update:page="(val) => emit('update:page', val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ExportOptions {
  fileName?: string
  title?: string
  subtitle?: string
  currency?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
}

import { ref, computed, onMounted, watch } from 'vue'
import type { BaseTableColumn } from '~/components/tables/table'
import type { TableRow } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import ExportButton from '../buttons/ExportButton.vue'

const selectedSortFieldLabel = computed(() => {
  return (
    sortableColumnOptions.value.find((opt) => opt.value === selectedSortField.value)?.label ?? ''
  )
})

const sortDirectionLabel = computed(() => {
  return (
    sortDirectionOptions.find((opt) => opt.value === selectedSortDirection.value)?.label ??
    t('ascending')
  )
})

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
const selectedSortDirection = ref<'asc' | 'desc'>('asc')

const selectedSortLabel = computed(() => {
  const col = sortableColumnOptions.value.find((c) => c.value === selectedSortField.value)
  if (!col) return ''
  const dir = selectedSortDirection.value === 'asc' ? t('ascending') : t('descending')
  return `${col.label} (${dir})`
})

const showAdvancedOptions = ref(false)

const emit = defineEmits<{
  (e: 'filter-change', columnId: string, value: string): void
  (e: 'sort-change', columnId: string, direction: 'asc' | 'desc' | null): void
  (e: 'row-click', rowData: any): void
  (e: 'search-change', value: string): void
  (e: 'date-range-change', value: { start: string; end: string }): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
}>()

const sortState = ref<{ column: string; direction: 'asc' | 'desc' | null } | null>(null)

const { t } = useI18n()

const filterPopoverOpen = ref<Record<string, boolean>>({})

const filteredData = computed(() => {
  let result = props.data

  for (const [key, val] of Object.entries(columnFilters.value)) {
    if (val) {
      result = result.filter((row) => String(row[key]) === val)
    }
  }

  return result
})

const props = defineProps<{
  data: any[]
  columns: BaseTableColumn<any>[]
  borderClass?: string
  tableId: string
  exportOptions?: ExportOptions
  page?: number
  pageSize?: number
  total?: number
  totalPage?: number
  showDateFilter?: boolean
}>()

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

const tableRef = ref<any>(null)
const storageKey = computed(() => `base-table-columns:${props.tableId}`)
const allColumnIds = computed(() =>
  props.columns.map((col) => col.id).filter((id): id is string => !!id)
)

const visibleColumnIds = ref<string[]>([])

const columnOptions = computed(() =>
  props.columns
    .filter((col) => !!col.id)
    .map((col) => ({
      label: getColumnLabel(col),
      value: col.id!,
    }))
)

const debouncedEmitSearch = debounce((val: string) => {
  emit('search-change', val)
})

const sortDirectionOptions = [
  { label: t('ascending'), value: 'asc' },
  { label: t('descending'), value: 'desc' },
]

const sortableColumnOptions = computed(() =>
  props.columns
    .filter((col) => col.enableSorting)
    .map((col) => ({
      label: getColumnLabel(col),
      value: col.id,
    }))
)

// Interface for sort menu items to ensure consistent typing
interface SortMenuItem {
  label: string
  value: string
  icon?: string
}

// Computed property for sort menu items
const sortMenuItems = computed<SortMenuItem[]>(() => {
  return [
    { label: t('clear'), value: '' }, // No icon for clear option
    ...sortableColumnOptions.value.map((col) => ({
      label: col.label,
      value: col.value,
      icon:
        selectedSortField.value === col.value
          ? selectedSortDirection.value === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : undefined,
    })),
  ]
})

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
function handleSortMenuChange(val: { value: string }) {
  if (!val?.value) {
    // Clear sort
    clearSort()
    return
  }

  const columnId = val.value
  toggleSort(columnId)
}

// Reuse the existing toggleSort function
function toggleSort(columnId: string) {
  if (selectedSortField.value === columnId) {
    // Toggle direction or clear if already descending
    if (selectedSortDirection.value === 'asc') {
      selectedSortDirection.value = 'desc'
    } else {
      clearSort()
      return
    }
  } else {
    // Set new column and default to asc
    selectedSortField.value = columnId
    selectedSortDirection.value = 'asc'
  }

  sortState.value = {
    column: selectedSortField.value,
    direction: selectedSortDirection.value,
  }

  emit('sort-change', selectedSortField.value, selectedSortDirection.value)
}

function debounce(fn: (...args: any[]) => void, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

function onSortFieldChange(value: string) {
  if (!value || !selectedSortDirection.value) return
  sortState.value = {
    column: value,
    direction: selectedSortDirection.value,
  }
  emit('sort-change', value, selectedSortDirection.value)
}

function onSelect<T = any>(row: TableRow<T>, e?: Event) {
  emit('row-click', row.original)
}

function onSortDirectionChange(value: 'asc' | 'desc') {
  if (!selectedSortField.value) return
  sortState.value = {
    column: selectedSortField.value,
    direction: value,
  }
  emit('sort-change', selectedSortField.value, value)
}

function clearSort() {
  sortState.value = null
  selectedSortField.value = null
  selectedSortDirection.value = 'asc'
  emit('sort-change', '', null)
}

function getColumnLabel(col: BaseTableColumn<any>): string {
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

const filteredColumns = computed(() => {
  const columns = props.columns

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

function getColumnFilterOptions(col: BaseTableColumn<any>) {
  if (col.filterOptions) return col.filterOptions

  const key = col.accessorKey ?? col.id
  if (!key) return []

  const values = Array.from(
    new Set(props.data.map((row) => row[key]).filter((v) => v !== undefined && v !== null))
  )

  return values.map((v) => ({
    label: String(v),
    value: String(v),
  }))
}

onMounted(() => {
  const saved = localStorage.getItem(storageKey.value)

  if (saved) {
    // ✅ Use only the user's saved config
    visibleColumnIds.value = JSON.parse(saved)
  } else {
    // ✅ First time only — show all columns
    visibleColumnIds.value = [...allColumnIds.value]
  }
})

watch(
  visibleColumnIds,
  (val) => {
    localStorage.setItem(storageKey.value, JSON.stringify(val))
  },
  { deep: true }
)

watch(search, (val) => {
  debouncedEmitSearch(val)
})

watch(modelValue, (val) => {
  const start = val.start?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  const end = val.end?.toDate(getLocalTimeZone()).toISOString().slice(0, 10) || ''
  emit('date-range-change', { start, end })
})

const resetColumns = () => {
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
