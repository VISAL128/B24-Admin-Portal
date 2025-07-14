<template>
        <div
        class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow"
      >
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
        </div>
      </div>
  <!-- Unified Card Container -->
  <div
    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow p-4 space-y-4"
  >
    <!-- Filter / Sort / Column Configuration -->
    <div class="flex justify-between flex-wrap items-start gap-4">
      <!-- 🔍 Filter Buttons -->
      <div class="flex gap-2 flex-wrap items-center">
        <template v-for="col in filteredColumns" :key="col.id">
          <template v-if="col.enableColumnFilter">
            <UPopover v-model:open="filterPopoverOpen[col.id]">
              <UButton variant="outline" class="w-40 justify-between">
                {{ columnFilters[col.id] || getColumnLabel(col) }}
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4 ml-auto" />
              </UButton>
              <template #content>
                <div
                  class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden p-2 space-y-1"
                >
                  <div
                    v-for="option in [
                      { label: t('all'), value: '' },
                      ...getColumnFilterOptions(col),
                    ]"
                    :key="option.value"
                    @click="
                      () => {
                        columnFilters[col.id] = option.value
                        emit('filter-change', col.id, option.value)
                        filterPopoverOpen[col.id] = false
                      }
                    "
                    :class="[
                      'px-3 py-2 rounded cursor-pointer text-sm',
                      columnFilters[col.id] === option.value
                        ? 'bg-primary text-white dark:bg-primary dark:text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    ]"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </template>

        <!-- 🧭 Sort Popover -->
        <UPopover>
          <UButton
            variant="outline"
            class="flex items-center justify-between gap-2 whitespace-nowrap"
          >
            {{ selectedSortLabel || t('sort_by') }}
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
          </UButton>

          <template #content>
            <div
              class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden p-2 w-64 space-y-1"
            >
              <div
                @click="clearSort"
                class="px-3 py-2 rounded cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {{ t('clear') }}
              </div>

              <div
                v-for="item in sortableColumnOptions"
                :key="item.value"
                @click="toggleSort(item.value)"
                class="flex justify-between items-center px-3 py-2 rounded cursor-pointer text-sm"
                :class="[
                  selectedSortField === item.value
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
              >
                <span>{{ item.label }}</span>
                <span>
                  <UIcon
                    v-if="selectedSortField === item.value && selectedSortDirection === 'asc'"
                    name="i-lucide-arrow-up"
                    class="w-4 h-4"
                  />
                  <UIcon
                    v-else-if="selectedSortField === item.value && selectedSortDirection === 'desc'"
                    name="i-lucide-arrow-down"
                    class="w-4 h-4"
                  />
                </span>
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <!-- ⚙️ Column Configuration -->
      <div class="flex justify-end">
        <UPopover>
          <UButton
            icon="i-lucide:settings"
            variant="outline"
            class="flex items-center justify-between gap-2 whitespace-nowrap"
          >
            Columns Configuration
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
    <UTable
      :key="filteredColumns.length + '-' + visibleColumnIds.join(',')"
      ref="tableRef"
      :data="filteredData"
      :columns="filteredColumns"
      :sort="sortState"
      @update:sort="handleSortChange"
      sticky
      class="flex-1 overflow-auto"
      :class="borderClass"
      @select=onSelect
    >

      <template #empty>
        <slot name="empty">
          <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            No data available.
          </div>
        </slot>
      </template>

      <slot />
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { BaseTableColumn } from '~/components/tables/table'
import type { TableRow } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
  import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

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

const emit = defineEmits<{
  (e: 'filter-change', columnId: string, value: string): void
  (e: 'sort-change', columnId: string, direction: 'asc' | 'desc' | null): void
  (e: 'row-click', rowData: any): void
    (e: 'search-change', value: string): void        // ✅ Add this
  (e: 'date-range-change', value: { start: string; end: string }): void // ✅ Add this
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
}>()

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

function toggleSort(columnId: string) {
  if (selectedSortField.value === columnId) {
    // Toggle direction
    selectedSortDirection.value = selectedSortDirection.value === 'asc' ? 'desc' : 'asc'
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
  emit('search-change', val)
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
