<script setup lang="ts">
import { h, ref, computed, onMounted, resolveComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import type { TableColumn } from '@nuxt/ui'
import type { FeeModel } from '~/models/settlement'
import { useI18n } from 'vue-i18n'
import TableEmptyState from '~/components/TableEmptyState.vue'
import { useTable } from '~/composables/utils/useTable'
import { UButton } from '#components'
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'
import appConfig from '~~/app.config'
import { useTableConfig } from '~/composables/utils/useTableConfig'

definePageMeta({
  auth: false,
  breadcrumbs: [{ label: 'settings.fee_config', active: true }],
})

const { t } = useI18n()
useSupplierApi()
const { createRowNumberCell } = useTable()
const errorHandler = useErrorHandler()

const table = useTemplateRef('table')
const router = useRouter()
// const toast = useToast()
// const notification = useNotification()

const search = ref('')
const feeList = ref<FeeModel[]>([])
const loading = ref(false)
const errorMsg = ref('')

// Add loading state for create button
const isCreating = ref(false)

// Add loading states for view and edit actions
const viewingFeeId = ref<string | null>(null)
const editingFeeId = ref<string | null>(null)

// Fetch fee config data from API
const fetchFeeConfig = async () => {
  loading.value = true
  try {
    const data = await useFeeConfigApi().getListFeeConfig({ search: '' })
    feeList.value = data || []
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to load settlement history.'
    // Show error notification to user
    errorHandler.handleApiError(error)
  } finally {
    loading.value = false
  }
}

const TABLE_ID = 'settlement-history'
const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  row_number: true,
  code: true,
  fee_name: true,
  Currency: true,
  fee_type: true,
  sharing_fee: true,
}

const columnConfig = computed((): any[] => {
  return (
    table?.value?.tableApi
      ?.getAllColumns()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((column: any) => column.getCanHide()) ?? []
  )
})

const getTranslationHeaderById = (id: string) => {
  return t(`fee_configs.columns.${id}`)
}

// Filtered rows for table
const filteredData = computed(() =>
  feeList.value.filter((item) =>
    (item.name ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

// Use table configuration composable
const tableConfig = useTableConfig()

// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(TABLE_ID)
  return savedConfig || DEFAULT_COLUMN_VISIBILITY
}

const columnVisibility = ref<Record<string, boolean>>(initializeColumnVisibility())

// Initialize sorting state from localStorage or defaults
// const initializeSortingState = (): Array<{ id: string; desc: boolean }> => {
//   const savedSorting = tableConfig.getSortingState(TABLE_ID)
//   return savedSorting || []
// }

// const sortingState = ref<Array<{ id: string; desc: boolean }>>(initializeSortingState())

// Save column visibility changes to localStorage
const saveColumnVisibility = () => {
  tableConfig.saveColumnConfig(TABLE_ID, columnVisibility.value)
}

// // Save sorting state changes to localStorage
// const saveSortingState = () => {
//   tableConfig.saveSortingState(TABLE_ID, sortingState.value)
// }

// // Save status filter changes to localStorage
// const saveStatusFilter = () => {
//   tableConfig.saveStatusFilter(
//     TABLE_ID,
//     selectedStatuses.value.map((status) => status.value)
//   )
// }

// Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })

onBeforeMount(() => {
  // Get last day of current month
})

// Initial load
onMounted(() => {
  fetchFeeConfig()
})

// Handle navigation to crud page

const handleEditFee = (fee: FeeModel) => async () => {
  editingFeeId.value = fee.id
  try {
    await router.push(`/settings/fee-config/${fee.id}/edit`)
  } catch (error) {
    errorHandler.handleApiError(error)
  } finally {
    // Reset loading after a short delay to prevent flash
    setTimeout(() => {
      editingFeeId.value = null
    }, 500)
  }
}

const exportHeaders = [
  { key: 'currency_id', label: t('settlement.currency') },
  { key: 'created_date', label: t('fee_configs_details.settlement_date') },
  { key: 'total_supplier', label: t('fee_configs_details.total_supplier') },
  { key: 'created_by', label: t('settled_by') },
  { key: 'total_amount', label: t('total_amount') },
  // { key: "status", label: t("status") },
]

const onResetColumnVisibility = () => {
  // Reset table API columns
  table?.value?.tableApi?.resetColumnVisibility()
  columnVisibility.value = { ...DEFAULT_COLUMN_VISIBILITY }
}

const onSearchInput = (_value: string) => {
  // Optional: add debounced search logic here if needed
  // For now, the filtering is handled in computed filteredData
}

const handleViewFee = (fee: FeeModel) => async () => {
  viewingFeeId.value = fee.id
  try {
    await router.push(`/settings/fee-config/${fee.id}/view`)
  } catch (error) {
    errorHandler.handleApiError(error)
  } finally {
    // Reset loading after a short delay to prevent flash
    setTimeout(() => {
      viewingFeeId.value = null
    }, 500)
  }
}
const onCreateFeeConfig = async () => {
  isCreating.value = true
  try {
    await router.push('/settings/fee-config/create')
  } catch (error) {
    errorHandler.handleApiError(error)
  } finally {
    // Reset loading after a short delay to prevent flash
    setTimeout(() => {
      isCreating.value = false
    }, 500)
  }
}

const columns: TableColumn<FeeModel>[] = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }) => createRowNumberCell(row, table),
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  {
    accessorKey: 'code',
    header: () => t('code'),
  },
  {
    accessorKey: 'name',
    header: () => t('fee_name'),
  },
  { accessorKey: 'currency', header: () => t('currency.label') },
  {
    accessorKey: 'fee_type',
    header: () => t('fee_type'),
    cell: ({ row }) => {
      const feeType = row.original.fee_type === 'percentage' ? t('percentage_fee') : t('fixed_fee')
      return h('div', { class: 'flex gap-2 items-center' }, [
        h(
          resolveComponent('UBadge'),
          {
            color: 'primary',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [h('span', { class: 'text-xs' }, t(`${feeType}`))]
        ),
      ])
    },
  },
  {
    accessorKey: 'sharing',
    header: () => t('sharing_fee'),
    cell: ({ row }) => {
      const allocateDetails = row.original.allocate_details || []

      return h('div', { class: 'flex gap-2 items-center flex-wrap' }, [
        ...allocateDetails.map((detail) =>
          h(
            resolveComponent('UBadge'),
            {
              // color: detail.value > 0 ? 'success' : 'primary',
              variant: 'outline',
              // avatar: {
              //   src: 'https://github.com/nuxt.png',
              // },
              class: 'flex items-center gap-1',
            },
            () => [
              h('span', { class: 'text-xs' }, `${detail.name} : `),
              h(
                'span',
                {
                  class: `text-xs font-semibold ${detail.value > 0 ? 'text-color-primary' : 'text-gray-500'}`,
                },
                `${detail.value}${row.original.fee_type === 'percentage' ? '%' : row.original.currency === 'KHR' ? '៛' : '$'}`
              ),
            ]
          )
        ),
      ])
    },
  },
  // Add an action column for viewing details
  {
    id: 'actions',
    header: () => t('actions'),
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(resolveComponent('UButton'), {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-lucide-eye',
          size: 'xs',
          loading: viewingFeeId.value === row.original.id,
          onClick: handleViewFee(row.original),
          // title: translations.view_details
        }),
        h(resolveComponent('UButton'), {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-lucide-edit',
          size: 'xs',
          loading: editingFeeId.value === row.original.id,
          onClick: handleEditFee(row.original),
          // title: translations.edit
        }),
      ]),
  },
]
</script>

<template>
  <div class="flex flex-col h-full w-full space-y-4 overflow-hidden">
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
      </div>
      <div class="flex items-center gap-2">
        <UButton color="primary" size="sm" :loading="isCreating" @click="onCreateFeeConfig">
          {{ t('create_new') }}
        </UButton>
        <ExportButton :data="filteredData" :headers="exportHeaders" />
        <UPopover>
          <UTooltip
            key="column-config-tooltip"
            :text="t('fee_configs.column_config.tooltip')"
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
                  t('fee_configs.column_config.columns')
                }}</span>
                <!-- <UButton variant="solid" class="text-muted" size="xs" @click="onResetColumnConfig">
                  {{ t('fee_configs.column_config.reset') }}
                </UButton> -->
                <UTooltip
                  :text="t('fee_configs.column_config.reset')"
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
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      :data="filteredData"
      :loading="loading"
      :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
      :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
      :columns="columns"
      :ui="appConfig.ui.table.slots"
      sticky
      class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable>
  </div>
</template>
