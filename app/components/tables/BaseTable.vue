<template>
  <div class="space-y-2">
    <!-- Column Toggle UI -->
    <div class="flex justify-end">
      <UPopover>
        <UButton
          icon="i-lucide:settings"
          variant="outline"
          size="sm"
          class="flex items-center gap-2"
        >
          Columns Configuration
        </UButton>
        <template #content>
          <div class="p-4 min-w-[200px] space-y-2">
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

    <!-- Main Table -->
<UTable
  :key="filteredColumns.length + '-' + visibleColumnIds.join(',')"
  ref="tableRef"
  :data="data"
  :columns="filteredColumns"
  sticky
  class="flex-1 overflow-auto rounded-lg border bg-white dark:bg-gray-800"
  :class="borderClass"
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
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  data: any[]
  columns: TableColumn<any>[]
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

function getColumnLabel(col: TableColumn<any>): string {
  if (typeof col.header === 'string') return col.header
  if (typeof col.header === 'function' && col.id) {
    return col.id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
  return 'Unnamed'
}

const filteredColumns = computed(() => {
  const columns = props.columns

  // If no visible ids are selected, fallback to showing all
  if (
    visibleColumnIds.value.length === 0 &&
    allColumnIds.value.length > 0
  ) {
    return columns
  }

  return columns.filter((col) => {
    if (!col.id) return true
    return visibleColumnIds.value.includes(col.id)
  })
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
})



watch(
  visibleColumnIds,
  (val) => {
    localStorage.setItem(storageKey.value, JSON.stringify(val))
  },
  { deep: true }
)

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
