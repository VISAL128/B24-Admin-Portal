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

// Filtered rows for table
const filteredData = computed(() =>
  feeList.value.filter((item) =>
    (item.name ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

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
  { accessorKey: 'currency', header: () => t('currency') },
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
          () => [h('span', { class: 'text-sm' }, t(`${feeType}`))]
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
              h('span', { class: 'text-sm' }, `${detail.name} : `),
              h(
                'span',
                {
                  class: `text-sm font-semibold ${detail.value > 0 ? 'text-color-primary' : 'text-gray-500'}`,
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
          size: 'sm',
          loading: viewingFeeId.value === row.original.id,
          onClick: handleViewFee(row.original),
          // title: translations.view_details
        }),
        h(resolveComponent('UButton'), {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-lucide-edit',
          size: 'sm',
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
      class="flex flex-wrap items-end justify-end gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded shadow"
    >
      <div class="flex items-end gap-2">
        <UButton color="primary" :loading="isCreating" @click="onCreateFeeConfig">
          {{ t('create_new') }}
        </UButton>
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
      sticky
      class="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <template #empty>
        <TableEmptyState />
      </template>
    </UTable>
  </div>
</template>
