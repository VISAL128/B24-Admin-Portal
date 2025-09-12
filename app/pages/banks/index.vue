<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <ExTable
      :table-id="TABLE_ID"
      :columns="columns"
      :search-tooltip="t('banks.search_placeholder')"
      :fetch-data-fn="fetchBanks"
      show-row-number
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useBankApi } from '~/composables/api/useBankApi'
import type { BankResponseModel } from '~/models/bank'
import { useI18n } from 'vue-i18n'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import ExTable from '~/components/tables/ExTable.vue'
import type { QueryParams } from '~/models/baseModel'

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
const { getBankList } = useBankApi()
const errorHandler = useErrorHandler()
// const { statusCellBuilder } = useStatusBadge()

// const router = useRouter()
const isLoading = ref(false)
const bankData = ref<BankResponseModel[]>([])

// Define table ID
const TABLE_ID = 'banks-list-table'

// Fetch banks data from API
const fetchBanks = async (
  param?: QueryParams
): Promise<TableFetchResult<BankResponseModel[]> | undefined> => {
  try {
    isLoading.value = true
    const data = await getBankList(param)

    console.log('Fetched bank data:', data)
    bankData.value = data.data.result || []
    return {
      data: data.data.result || [],
      total_page: data.data.param.pageCount || 0,
      total_record: data.data.param.rowCount || 0,
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

// const navigateToDetails = (bankId: string) => {
//   router.push(`/organization/banks/${bankId}`)
// }

// const handleViewDetails = (rowData: BankResponseModel) => {
//   navigateToDetails(rowData.id)
// }

const columns: BaseTableColumn<BankResponseModel>[] = [
  // {
  //   id: 'logo',
  //   accessorKey: 'logo',
  //   header: () => t('table.banks-list-table.columns.logo'),
  //   cell: ({ row }) => {
  //     const UAvatar = resolveComponent('UAvatar')
  //     const defaultLogo = '/images/icon/default-bank.png'
  //     return h('div', { class: 'flex items-center gap-2' }, [
  //       h(UAvatar, {
  //         src: row.original.logo || defaultLogo,
  //         size: 'lg',
  //         style: {
  //           border: '1px solid #1a9bb580',
  //           borderRadius: '50%',
  //           objectFit: 'cover',
  //           boxShadow: '0 0 3px rgba(26, 155, 181, 0.6)', // shadow with same color
  //         },
  //       }),
  //     ])
  //   },
  //   enableSorting: false,
  //   size: 50,
  // },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => t('table.banks-list-table.code'),
    //cell: ({ row }) => h('div', { class: 'font-medium justify-center' }, row.original.code || '-'),
    cell: ({ row }) => {
      const UAvatar = resolveComponent('UAvatar')
      const defaultLogo = '/images/icon/default-bank.png'
      if (row.original.name) {
        // If bank logo is available, display it
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, {
            src: row.original.logo || defaultLogo,
            size: 'lg',
            style: {
              border: '1px solid #DDDDDD80',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 0 3px #DDDDDD99', // shadow with same color
            },
          }),
          h('div', { class: '' }, row.original.name || '-'),
        ])
      }
      return h('div', { class: '' }, row.original.name || '-')
    },
    enableSorting: true,
    enableHiding: false,
    size: 150,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => t('table.banks-list-table.columns.name'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name || '-'),
    enableSorting: true,
    enableHiding: false,
    size: 200,
  },
  {
    id: 'nameKh',
    accessorKey: 'name_kh',
    header: () => t('table.banks-list-table.columns.nameKh'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name_kh || '-'),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'scope',
    accessorKey: 'scope',
    header: () => t('table.banks-list-table.columns.scope'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.scope || '-'),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'hubScope',
    accessorKey: 'hubScope',
    header: () => t('table.banks-list-table.columns.hubScope'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.hubScope || '-'),
    enableSorting: true,
    size: 200,
  },
  // {
  //   id: 'select',
  //   header: ({ table }) =>
  //     h(resolveComponent('UCheckbox'), {
  //       modelValue: table.getIsSomePageRowsSelected()
  //         ? 'indeterminate'
  //         : table.getIsAllPageRowsSelected(),
  //       'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
  //         table.toggleAllPageRowsSelected(!!value),
  //       'aria-label': 'Select all',
  //     }),
  //   cell: ({ row }) =>
  //     h(
  //       'div',
  //       {
  //         class: 'flex h-full w-full',
  //         onClick: (e: Event) => e.stopPropagation(),
  //       },
  //       [
  //         h(resolveComponent('UCheckbox'), {
  //           modelValue: row.getIsSelected(),
  //           'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
  //             row.toggleSelected(!!value),
  //           'aria-label': 'Select row',
  //         }),
  //       ]
  //     ),
  //   enableSorting: false,
  //   enableHiding: false,
  //   meta: {
  //     class: {
  //       td() {
  //         return 'text-center cursor-pointer'
  //       },
  //     },
  //   },
  // },
  // {
  //   id: 'name',
  //   accessorKey: 'name',
  //   // header: ({ column }) => createSortableHeader(column, t('table.banks-list.columns.bank_name')),
  //   // cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name),
  //   cell: ({ row }) => {
  //     const UAvatar = resolveComponent('UAvatar')
  //     if (row.original.name) {
  //       // If bank logo is available, display it
  //       return h('div', { class: 'flex items-center gap-2' }, [
  //         h(UAvatar, {
  //           src: row.original.logoUrl,
  //           size: '3xs',
  //         }),
  //         h('div', { class: '' }, row.original.name || '-'),
  //       ])
  //     }
  //     return h('div', { class: '' }, row.original.name || '-')
  //   },
  //   enableSorting: true,
  //   size: 200,
  //   // enableColumnFilter: true,
  //   // filterOptions: [
  //   //   { label: 'AC', value: 'ACLEDA' },
  //   //   { label: 'ABA', value: 'ABA' }
  //   // ]
  // },
  // {
  //   id: 'nameKh',
  //   accessorKey: 'nameKh',
  //   header: () => t('table.banks-list.columns.bank_name_kh'),
  //   cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.nameKh),
  //   enableSorting: true,
  //   size: 200,
  // },
  // {
  //   id: 'connectedServices',
  //   accessorKey: 'connected_services',
  //   header: () => t('table.banks-list.columns.connected_services'),
  //   cell: ({ row }) => {
  //     const services = row.original.connectedServices || []
  //     const UTooltip = resolveComponent('UTooltip')

  //     if (services.length === 0) {
  //       return h('div', { class: 'text-sm text-gray-500 dark:text-gray-400' }, '-')
  //     }

  //     const serviceNames = services.map((service) => service.serviceName).join(', ')

  //     return h(
  //       UTooltip,
  //       {
  //         text: serviceNames,
  //         placement: 'top',
  //       },
  //       {
  //         default: () =>
  //           h(
  //             'div',
  //             {
  //               class: 'text-sm text-primary cursor-help underline decoration-dotted',
  //             },
  //             services.length === 1
  //               ? t('banks.connected_services_single', { count: services.length })
  //               : t('banks.connected_services_multiple', { count: services.length })
  //           ),
  //       }
  //     )
  //   },
  //   exportValue: (row) => {
  //     const services = row.connectedServices || []
  //     return services.map((service) => service.serviceName).join(', ')
  //   },
  //   size: 200,
  // },
  // {
  //   id: 'is_settlement_bank',
  //   accessorKey: 'isSettlementBank',
  //   header: () => t('table.banks-list.columns.is_settlement_bank'),
  //   cell: ({ row }) => statusCellBuilder(row.original.isSettlementBank ? 'yes' : 'no'),
  //   exportValue: (row) => t(row.isSettlementBank ? 'yes' : 'no') as string,
  //   size: 120,
  // },
  // {
  //   id: 'is_collection_bank',
  //   accessorKey: 'isCollectionBank',
  //   header: () => t('table.banks-list.columns.is_collection_bank'),
  //   cell: ({ row }) => statusCellBuilder(row.original.isCollectionBank ? 'yes' : 'no'),
  //   exportValue: (row) => t(row.isCollectionBank ? 'yes' : 'no') as string,
  //   size: 120,
  // },
]
</script>
