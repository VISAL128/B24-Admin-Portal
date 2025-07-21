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
import { avatar } from '#build/ui'

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

// Handle navigation to details page
const navigateToDetails = (feeId: string) => {
  router.push(`/settings/fee-config/${feeId}`)
}

const handleViewDetails = (fee: FeeModel) => async () => {
  // if (record.success === 0 && record.fail === 0) {
  //   await notification.showWarning({
  //     title: t('no_transactions_found'),
  //     description: t('no_transactions_found_desc'),
  //   })
  //   return
  // }
  navigateToDetails(fee.id)
}

const onCreateFeeConfig = () => {
  router.push('/settings/fee-config/create')
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
              color: detail.value > 0 ? 'green' : 'gray',
              variant: 'outline',
              avatar: {
                src: 'https://github.com/nuxt.png',
              },
              class: 'flex items-center gap-1',
            },
            () => [
              h('span', { class: 'text-sm' }, `${detail.party_name} : `),
              h(
                'span',
                {
                  class: `text-sm font-semibold ${detail.value > 0 ? 'text-color-primary' : 'text-gray-500'}`,
                },
                `${detail.value}${row.original.fee_type === 'percentage' ? '%' : ''}`
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
          onClick: handleViewDetails(row.original),
          // title: translations.view_details
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
        <UButton color="primary" @click="onCreateFeeConfig">
          {{ t('create_new') }}
        </UButton>
      </div>
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      :data="filteredData"
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
