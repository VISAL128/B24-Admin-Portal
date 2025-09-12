<template>
  <div class="flex flex-col h-full w-full space-y-3 overflow-hidden">
    <ExTable
      :table-id="TABLE_ID"
      :columns="columns"
      :search-tooltip="t('suppliers.search_placeholder')"
      :fetch-data-fn="fetchSuppliers"
      show-row-number
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import ExTable from '~/components/tables/ExTable.vue'
import type { SupplierResponseModel } from '~/models/supplier'
import type { QueryParams } from '~/models/baseModel'
import { useSupplierApi } from '~/composables/api/useSupplierApi'

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

const errorHandler = useErrorHandler()
// const { statusCellBuilder } = useStatusBadge()

// const router = useRouter()
const { getSupplierList } = useSupplierApi()
const isLoading = ref(false)
const bankData = ref<SupplierResponseModel[]>([])

// Define table ID
const TABLE_ID = 'suppliers-list-table'

// Fetch suppliers data from API
const fetchSuppliers = async (
  param?: QueryParams
): Promise<TableFetchResult<SupplierResponseModel[]> | undefined> => {
  try {
    isLoading.value = true
    const data = await getSupplierList(param)

    console.log('Fetched supplier data:', data)
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

const columns: BaseTableColumn<SupplierResponseModel>[] = [
  {
    id: 'logo',
    accessorKey: 'logo',
    header: () => t('table.suppliers-list-table.columns.logo'),
    cell: ({ row }) => {
      const UAvatar = resolveComponent('UAvatar')
      const defaultLogo = '/images/icon/default-supplier.png'
      // If bank logo is available, display it
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UAvatar, {
          src: row.original.logo || defaultLogo,
          size: 'lg',
        }),
      ])
    },
    enableSorting: false,
    size: 50,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => t('table.suppliers-list-table.columns.code'),
    cell: ({ row }) => h('div', { class: 'font-medium justify-center' }, row.original.code || '-'),
    enableSorting: true,
    size: 150,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => t('table.suppliers-list-table.columns.name'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name || '-'),
    enableSorting: true,
    size: 100,
  },
  {
    id: 'nameKh',
    accessorKey: 'name_kh',
    header: () => t('table.suppliers-list-table.columns.nameKh'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.nameKh || '-'),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => t('table.suppliers-list-table.columns.phone'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.phone || '-'),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => t('table.suppliers-list-table.columns.email'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.email || '-'),
    enableSorting: true,
    size: 200,
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: () => t('table.suppliers-list-table.columns.address'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.address || '-'),
    enableSorting: true,
    size: 200,
  },
]
</script>
