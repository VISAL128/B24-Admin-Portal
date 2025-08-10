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
      @fullscreen-toggle="(val) => isTableFullscreen = val"
      />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref, resolveComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useBankApi } from '~/composables/api/useBankApi'
import type { Bank } from '~/models/bank'
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
const summarys = ref<SummaryCard[]>([])

// Define table ID
const TABLE_ID = 'banks-list'

// Fetch banks data from API
const fetchBanks = async (params?: QueryParams): Promise<BankListTableFetchResult | undefined> => {
  try {
     isLoading.value = true
    const data = await getBanks(params) 
    summarys.value = [
      {
        title: t('banks.total_banks'),
        values: [{
          value: data.data.length
        }],
        filterLabel: '',
        dateRange: ''
      },
      {
        title: t('banks.active_banks'),
        values: [{
          value: data.data.filter(bank => bank.active).length
        }],
        filterLabel: '',
        dateRange: ''
      },
      {
        title: t('banks.inactive_banks'),
        values: [{
          value: data.data.filter(bank => !bank.active).length
        }],
        filterLabel: '',
        dateRange: ''
      }
    ]
    return {
      data: data.data,
      total_page: data.total_pages || 0,
      total_record: data.total_records || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // fetchBanks()
})

const navigateToDetails = (bankId: string) => {
  router.push(`/organization/banks/${bankId}`)
}

const handleViewDetails = (rowData: Bank) => {
  navigateToDetails(rowData.id)
}

const columns: BaseTableColumn<Bank>[] = [
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
            src: row.original.logo,
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
    id: 'activated_date',
    accessorKey: 'activated_date',
    header: () => t('table.banks-list.columns.activated_date'),
    type: ColumnType.DateTime,
    size: 150,
  },
  {
    id: 'is_settlement_bank',
    accessorKey: 'is_settlement_bank',
    header: () => t('table.banks-list.columns.is_settlement_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.is_settlement_bank ? 'yes' : 'no'),
    size: 120,
  },
  {
    id: 'is_collection_bank',
    accessorKey: 'is_collection_bank',
    header: () => t('table.banks-list.columns.is_collection_bank'),
    cell: ({ row }) => statusCellBuilder(row.original.is_collection_bank ? 'yes' : 'no'),
    size: 120,
  },
  {
    id: 'active',
    accessorKey: 'active',
    header: () => t('table.banks-list.columns.status'),
    cell: ({ row }) => statusCellBuilder(row.original.active === BankServiceStatus.Active ? 'active' : 'inactive'),
    filterOptions: [
      { label: getTranslatedStatusLabel('active'), value: BankServiceStatus.Active },
      { label: getTranslatedStatusLabel('inactive'), value: BankServiceStatus.Inactive }
    ],
    filterType: 'select',
    enableColumnFilter: true,
    size: 100,
  }
]
</script>
