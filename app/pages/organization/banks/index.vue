<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex flex-wrap items-center gap-2">
        <ExSearch
          v-model="search"
          :placeholder="t('banks.search_placeholder')"
          class="w-64"
          size="sm"
          @input="onSearchInput"
        />

        <!-- Status filter -->
        <StatusSelection
          v-model="selectedStatuses"
          :options="statusOptions"
          :placeholder="t('status.all')"
          :multiple="true"
          :searchable="false"
          size="sm"
          class="w-48"
        />

        <!-- Country filter -->
        <USelectMenu
          v-model="selectedCountry"
          :options="countryOptions"
          :searchable="false"
          :placeholder="t('banks.filter_country')"
          size="sm"
          class="w-32"
        />

        <!-- Currency filter -->
        <USelectMenu
          v-model="selectedCurrency"
          :options="currencyOptions"
          :searchable="false"
          :placeholder="t('banks.filter_currency')"
          size="sm"
          class="w-32"
        />
      </div>
      <div class="flex items-center gap-2">
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
              </div>
              <Divider />
              <UCheckbox
                v-for="col in columnConfig"
                :id="col.id"
                :key="col.id"
                :model-value="col.getIsVisible()"
                :label="getTranslationHeaderById(col.id)"
                size="sm"
                class="w-full"
                @change="col.toggleVisibility()"
              />
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- Table -->
    <UTable
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
import { computed, h, nextTick, onMounted, ref, resolveComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBankApi } from '~/composables/api/useBankApi'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { BankQuery, Bank } from '~/models/bank'
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
import { useTableConfig } from '~/composables/utils/useTableConfig'

definePageMeta({
  auth: true,
  breadcrumbs: [
    {
      label: 'navigation.banks',
      active: true,
    },
  ],
})

const { t } = useI18n()
const { getBanks } = useBankApi()
const { createSortableHeader, createRowNumberCell } = useTable()
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()
const pref = useUserPreferences().getPreferences()

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
const banks = ref<Bank[]>([])
const loading = ref(false)
const isRefreshing = ref(false)

// Filter states
const selectedStatuses = ref<{ label: string; value: string }[]>([])
const selectedCountry = ref<{ label: string; value: string } | null>(null)
const selectedCurrency = ref<{ label: string; value: string } | null>(null)

// Status options
const statusOptions = [
  { label: t('status.active'), value: 'active' },
  { label: t('status.inactive'), value: 'inactive' },
]

// Country options (can be expanded)
const countryOptions = [
  { label: 'All Countries', value: '' },
  { label: 'Cambodia', value: 'KH' },
  { label: 'Thailand', value: 'TH' },
  { label: 'Vietnam', value: 'VN' },
]

// Currency options
const currencyOptions = [
  { label: 'All Currencies', value: '' },
  { label: 'USD', value: 'USD' },
  { label: 'KHR', value: 'KHR' },
]

// Define table ID and default column visibility
const TABLE_ID = 'banks-list'
const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  row_number: true,
  bank_code: true,
  bank_name: true,
  bank_short_name: true,
  swift_code: true,
  country_code: true,
  currency_code: true,
  is_settlement_bank: true,
  is_collection_bank: true,
  is_active: true,
  created_at: true,
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

// Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })
watch(sortingState, saveSortingState, { deep: true })

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

// Listen to sorting state changes from the table and save them
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onSortingChange = (updater: any) => {
  if (table?.value?.tableApi) {
    const currentSorting = table.value.tableApi.getState().sorting
    const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater
    sortingState.value = newSorting
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

const getTranslationHeaderById = (id: string) => {
  return t(`banks.${id}`)
}

// Watch pagination and filter changes
watch([page, pageSize, selectedStatuses, selectedCountry, selectedCurrency], () => {
  fetchBanks()
})

// Fetch banks data from API
const fetchBanks = async (refreshAction: boolean = false) => {
  loading.value = true
  if (refreshAction) {
    isRefreshing.value = true
  }
  try {
    const payload: BankQuery = {
      search: search.value || undefined,
      page_size: pageSize.value.value,
      page: page.value,
      is_active: selectedStatuses.value.some((s) => s.value === 'active')
        ? true
        : selectedStatuses.value.some((s) => s.value === 'inactive')
          ? false
          : undefined,
      country_code: selectedCountry.value?.value || undefined,
      currency_code: selectedCurrency.value?.value || undefined,
    }

    const data = await getBanks(payload)
    banks.value = data?.records ?? []
    total.value = data?.total_record ?? 0
    totalPage.value = data?.total_page ?? 0
  } catch (error: unknown) {
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
}

// Handle search input
const onSearchInput = (_value: string) => {
  // Optional: add debounced search logic here if needed
  // For now, the filtering is handled in computed filteredData
}

// Filtered rows for table
const filteredData = computed(() =>
  banks.value.filter(
    (item) =>
      (item.bank_name ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
      (item.bank_code ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
      (item.swift_code ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

// Initial load
onMounted(() => {
  fetchBanks()
})

const navigateToDetails = (bankId: string) => {
  router.push(`/organization/banks/${bankId}`)
}

const exportHeaders = [
  { key: 'bank_code', label: t('banks.bank_code') },
  { key: 'bank_name', label: t('banks.bank_name') },
  { key: 'bank_short_name', label: t('banks.bank_short_name') },
  { key: 'swift_code', label: t('banks.swift_code') },
  { key: 'country_code', label: t('banks.country_code') },
  { key: 'currency_code', label: t('banks.currency_code') },
  { key: 'is_settlement_bank', label: t('banks.is_settlement_bank') },
  { key: 'is_collection_bank', label: t('banks.is_collection_bank') },
  { key: 'is_active', label: t('banks.is_active') },
]

const handleViewDetails = (row: TableRow<Bank>) => {
  navigateToDetails(row.original.id)
}

const columns: TableColumn<Bank>[] = [
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
  {
    accessorKey: 'bank_code',
    header: ({ column }) => createSortableHeader(column, t('banks.bank_code')),
    cell: ({ row }) => row.original.bank_code,
    enableSorting: true,
    size: 80,
  },
  {
    accessorKey: 'bank_name',
    header: ({ column }) => createSortableHeader(column, t('banks.bank_name')),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.bank_name),
    enableSorting: true,
    size: 200,
  },
  {
    accessorKey: 'bank_short_name',
    header: () => t('banks.bank_short_name'),
    cell: ({ row }) => row.original.bank_short_name,
    size: 100,
  },
  {
    accessorKey: 'swift_code',
    header: () => t('banks.swift_code'),
    cell: ({ row }) => row.original.swift_code || '-',
    size: 100,
  },
  {
    accessorKey: 'country_code',
    header: () => t('banks.country_code'),
    cell: ({ row }) => row.original.country_code,
    size: 80,
  },
  {
    accessorKey: 'currency_code',
    header: () => t('banks.currency_code'),
    cell: ({ row }) => row.original.currency_code,
    size: 80,
  },
  {
    accessorKey: 'is_settlement_bank',
    header: () => t('banks.is_settlement_bank'),
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h(
        UBadge,
        {
          color: row.original.is_settlement_bank ? 'success' : 'gray',
          variant: 'subtle',
        },
        () => t(row.original.is_settlement_bank ? 'yes' : 'no')
      )
    },
    size: 120,
  },
  {
    accessorKey: 'is_collection_bank',
    header: () => t('banks.is_collection_bank'),
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h(
        UBadge,
        {
          color: row.original.is_collection_bank ? 'success' : 'gray',
          variant: 'subtle',
        },
        () => t(row.original.is_collection_bank ? 'yes' : 'no')
      )
    },
    size: 120,
  },
  {
    id: 'is_active',
    header: () => t('banks.is_active'),
    cell: ({ row }) => statusCellBuilder(row.original.is_active ? 'active' : 'inactive', true),
    size: 80,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => createSortableHeader(column, t('banks.created_at')),
    cell: ({ row }) => useFormat().formatDateTime(row.original.created_at),
    enableSorting: true,
    size: 150,
  },
]
</script>
