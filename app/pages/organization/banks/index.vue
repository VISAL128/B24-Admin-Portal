<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <!-- Header -->
    <CardsSummaryCards
      v-show="!isTableFullscreen"
      :cards="summarys"
      :is-loading="isLoading"
      :skeleton-count="3"
    />
    <ExTable
      :table-id="TABLE_ID"
      :columns="columns"
      :search-tooltip="t('banks.search_placeholder')"
      :fetch-data-fn="fetchBanks"
      show-row-number
      @row-click="handleViewDetails"
      @fullscreen-toggle="(val) => (isTableFullscreen = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref, resolveComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBankApi } from '~/composables/api/useBankApi'
import type { ActivatedBankResponse } from '~/models/bank'
import { useI18n } from 'vue-i18n'
import type { BankListTableFetchResult, BaseTableColumn } from '~/components/tables/table'
import ExTable from '~/components/tables/ExTable.vue'
import type { QueryParams } from '~/models/baseModel'
import type { SummaryCard } from '~/components/cards/SummaryCards.vue'

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
const errorHandler = useErrorHandler()
const { statusCellBuilder } = useStatusBadge()

const router = useRouter()
const isTableFullscreen = ref(false)
const isLoading = ref(false)
const bankData = ref<ActivatedBankResponse[]>([])

const summarys = computed<SummaryCard[]>(() => [
  {
    title: t('banks.total_banks'),
    values: [
      {
        value: bankData.value.length,
      },
    ],
    filterLabel: '',
    dateRange: '',
  },
  {
    title: t('banks.settlement'),
    values: [
      {
        value: bankData.value.filter((_bank) => _bank.isSettlementBank).length,
      },
    ],
    filterLabel: '',
    dateRange: '',
  },
  {
    title: t('banks.collection'),
    values: [
      {
        value: bankData.value.filter((_bank) => _bank.isCollectionBank).length,
      },
    ],
    filterLabel: '',
    dateRange: '',
  },
])

// Define table ID
const TABLE_ID = 'banks-list-b24'

// Fetch banks data from API
const fetchBanks = async (params?: QueryParams): Promise<BankListTableFetchResult | undefined> => {
  try {
    isLoading.value = true
    const data = await getBanks(params)
    bankData.value = data.data
    return {
      data: data.data,
      total_page: data.total_pages || 0,
      total_record: data.total_records || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // fetchBanks()
})

const navigateToDetails = (bankId: string) => {
  router.push(`/organization/banks/${bankId}`)
}

const handleViewDetails = (rowData: ActivatedBankResponse) => {
  navigateToDetails(rowData.id)
}

const columns: BaseTableColumn<ActivatedBankResponse>[] = [
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
    id: 'name',
    accessorKey: 'name',
    // header: ({ column }) => createSortableHeader(column, t('table.banks-list.columns.bank_name')),
    // cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name),
    cell: ({ row }) => {
      const UAvatar = resolveComponent('UAvatar')
      if (row.original.name) {
        // If bank logo is available, display it
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, {
            src: row.original.logoUrl,
            size: '3xs',
          }),
          h('div', { class: '' }, row.original.name || '-'),
        ])
      }
      return h('div', { class: '' }, row.original.name || '-')
    },
    enableSorting: true,
    size: 200,
    // enableColumnFilter: true,
    // filterOptions: [
    //   { label: 'AC', value: 'ACLEDA' },
    //   { label: 'ABA', value: 'ABA' }
    // ]
  },
  {
    id: 'nameKh',
    accessorKey: 'nameKh',
    header: () => t('table.banks-list.columns.bank_name_kh'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.nameKh),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'connectedServices',
    accessorKey: 'connected_services',
    header: () => t('table.banks-list.columns.connected_services'),
    cell: ({ row }) => {
      const services = row.original.connectedServices || []
      const UTooltip = resolveComponent('UTooltip')

      if (services.length === 0) {
        return h('div', { class: 'text-sm text-gray-500 dark:text-gray-400' }, '-')
      }

      const serviceNames = services.map((service) => service.serviceName).join(', ')

      return h(
        UTooltip,
        {
          text: serviceNames,
          placement: 'top',
        },
        {
          default: () =>
            h(
              'div',
              {
                class: 'text-sm text-primary cursor-help underline decoration-dotted',
              },
              services.length === 1
                ? t('banks.connected_services_single', { count: services.length })
                : t('banks.connected_services_multiple', { count: services.length })
            ),
        }
      )
    },
    exportValue: (row) => {
      const services = row.connectedServices || []
      return services.map((service) => service.serviceName).join(', ')
    },
    size: 200,
  },
  {
    id: 'is_settlement_bank',
    accessorKey: 'isSettlementBank',
    header: () => t('table.banks-list.columns.is_settlement_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.isSettlementBank ? 'yes' : 'no'),
    exportValue: (row) => t(row.isSettlementBank ? 'yes' : 'no') as string,
    size: 120,
  },
  {
    id: 'is_collection_bank',
    accessorKey: 'isCollectionBank',
    header: () => t('table.banks-list.columns.is_collection_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.isCollectionBank ? 'yes' : 'no'),
    exportValue: (row) => t(row.isCollectionBank ? 'yes' : 'no') as string,
    size: 120,
  },
  // {
  //   id: 'active',
  //   accessorKey: 'active',
  //   header: () => t('table.banks-list.columns.status'),
  //   cell: () => statusCellBuilder('active'),
  //   filterOptions: [
  //     { label: getTranslatedStatusLabel('active'), value: BankServiceStatus.Active },
  //     { label: getTranslatedStatusLabel('inactive'), value: BankServiceStatus.Inactive },
  //   ],
  //   filterType: 'select',
  //   enableColumnFilter: true,
  //   size: 100,
  // },
]
</script>
