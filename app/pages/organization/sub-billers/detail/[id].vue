<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Tabs -->
    <UTabs variant="link" v-model="activeTab" :items="tabs" />

    <div
      v-if="activeTab === 'details'"
      class="flex justify-center"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-3xl w-full">
        <!-- Top Header Area with Blurred Background Image -->
        <div
          class="rounded-t-2xl px-8 py-6 flex flex-col items-center justify-center text-center space-y-4 relative bg-cover bg-center w-full"
          :style="{
            backgroundImage: `url('https://cdn.prod.website-files.com/66619549eba8f39855e63f8a/66de8d3fc334563cf4f6d9de_software-companies.jpeg')`,
          }"
        >
          <!-- Blur overlay covering entire header -->
          <div class="absolute inset-0 backdrop-blur-xs bg-black/20 dark:bg-black/40 w-full h-full"></div>
          
          <!-- Content (Avatar and Supplier Name) -->
          <div class="relative z-10 flex flex-col items-center">
            <!-- Perfect Circular Avatar -->
            <div class="w-24 h-24 border-3 border-white rounded-full overflow-hidden flex items-center justify-center bg-primary dark:bg-blue-900/30">
              <img
                v-if="supplierProfileImage"
                :src="supplierProfileImage"
                alt="Supplier"
                class="w-full h-full object-cover"
              />
              <span v-else class="leading-none text-3xl text-white font-semibold">
                {{ supplierInitials }}
              </span>
            </div>

            <!-- Supplier Name -->
            <h4 class="text-2xl font-medium text-white mt-4">
              {{ supplierData?.name ?? '-' }}
            </h4>
          </div>
        </div>

        <!-- Details Grid Section -->
        <div class="grid grid-cols-1 gap-8 px-8 pb-8">
          <!-- Left Column -->
          <div class="space-y-0">
            <div
              v-for="(field, index) in supplierOverviewFields"
              :key="index"
              :class="[
                'flex items-start py-4',
                index !== supplierOverviewFields.length - 1
                  ? 'border-b border-gray-200 dark:border-gray-700'
                  : '',
              ]"
            >
              <!-- Label -->
              <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">
                {{ field.label }}
              </span>

              <!-- Spacer & Value -->
              <div class="flex-1 text-right">
                <!-- Badge -->
                <TransactionTypeBadge
                  v-if="field.type === 'badge'"
                  :transaction-type="field.value"
                  size="sm"
                />

                <!-- Amount -->
                <span
                  v-else-if="field.type === 'amount'"
                  class="text-sm text-gray-900 dark:text-white"
                >
                  {{ field.value }}
                </span>

                <!-- Copyable Code -->
                <ClipboardBadge
                  v-else-if="field.type === 'code' && field.copyable"
                  :text="field.rawValue || field.value"
                  :copied-tooltip-text="$t('clipboard.copied')"
                />

                <!-- Regular Text -->
                <span
                  v-else
                  :class="[
                    'text-sm text-gray-900 dark:text-white',
                    field.type === 'code' ? 'font-mono break-all' : '',
                  ]"
                >
                  {{ field.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Wallet Tab -->
<div
  v-else-if="activeTab === 'wallet'"
  class="space-y-6"
>
  <!-- Wallet Cards -->
<!-- Wallet Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Actual Wallet Cards -->
  <div
    v-for="(wallet, index) in wallets"
    :key="wallet.walletId"
    :class="[
      'rounded-2xl text-white p-6 relative overflow-hidden shadow-lg flex flex-col justify-between h-52',
      getCardGradientByIndex(index)
    ]"
  >
    <!-- Top Section: Bank Info -->
    <div class="flex items-center justify-between mb-2">
      <div class="text-2xl font-semibold">
        {{ wallet.bankName }}
      </div>
      <UIcon name="i-heroicons-banknotes" class="w-5 h-5 opacity-70" />
    </div>

    <!-- Center Section: Balance -->
    <div class="flex-1 flex flex-col justify-center items-center text-center">
      <div class="text-sm opacity-80 tracking-wide uppercase">
        {{ t('wallet_page.current_balance') }}
      </div>
      <div class="text-3xl font-bold tracking-wide mt-1">
        {{ wallet.balance }} {{ wallet.currency }}
      </div>
    </div>

    <!-- Bottom Section: Account & Wallet Number -->
    <div class="flex items-center justify-between text-sm text-white opacity-90">
      <!-- Left: Bank Account -->
      <div class="flex flex-col">
        <span class="text-xs opacity-60">
          {{ t('wallet_page.bank_account_number') }}
        </span>
        <div class="flex items-center gap-2 font-mono mt-1">
          <span class="truncate">
            {{ wallet.accountNo }}
          </span>
          <button
            class="hover:text-yellow-300 transition"
            :title="t('wallet_page.copy_account_number')"
            @click="copyToClipboard(wallet.accountNo ?? '')"
          >
            <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right: Wallet Number -->
      <div class="flex flex-col items-end text-right">
        <span class="text-xs opacity-60">
          {{ t('wallet_page.wallet_number') }}
        </span>
        <div class="flex items-center gap-2 font-mono mt-1">
          <span class="truncate">
            {{ wallet.walletNo }}
          </span>
          <button
            class="hover:text-yellow-300 transition"
            :title="t('wallet_page.copy_wallet_number')"
            @click="copyToClipboard(wallet.walletNo ?? '')"
          >
            <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

<!-- Placeholder Card -->
<div
  v-if="wallets.length === 1"
  class="rounded-2xl border-1 border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center h-52 text-gray-400 dark:text-gray-500"
>
  <UIcon name="i-heroicons-banknotes" class="w-8 h-8 mb-2" />
  <span class="text-sm">
    {{ t('wallet_page.more_wallets_coming') }}
  </span>
</div>

</div>


  <!-- Transaction Table Below Wallet Cards -->
    <div class="overflow-x-auto">
          <TablesExTable
    ref="table"
      :columns="columns"
      table-id="sub-biller-transaction-table"
      :fetch-data-fn="fetchTransactionHistory"
      show-row-number
      show-date-filter
      enabled-auto-refresh
      enabled-repush
      @row-click="handleViewDetails"
    >
    <template #trailingHeader>
      <UTooltip :text="t('pages.transaction.repush_description')">
          <UButton 
            variant="outline"
            size="sm"
            @click="handleRepush()"> 
            {{ t('pages.transaction.repush') }}
            <template #trailing>
              <UIcon name="material-symbols:send-outline" class="w-4 h-4" />
            </template>
            
          </UButton>
        </UTooltip>
    </template>
    </TablesExTable>
      <!-- <BaseTable
        :data="transactions"
        :columns="columns"
        table-id="wallet-transaction-table"
        border-class="border-gray-200 dark:border-gray-700"
        @filter-change="handleFilterChange"
@row-click="(row: { original: TransactionHistoryRecord }) => console.log('Clicked:', row)"
        @search-change="(val) => (search = val)"
        @date-range-change="
          ({ start, end }) => {
            startDate = start
            endDate = end
            fetchTransactionHistory()
          }
        "
        :page="page"
        :page-size="pageSize.value"
        :total="total"
        :total-page="totalPage"
        @update:page="(val) => (page = val)"
        @update:pageSize="
          (val) => {
            pageSize.value = val
            page = 1
          }
        "
      >
        <template #empty>
          <TableEmptyState />
        </template>
      </BaseTable> -->
    </div>
</div>


  </div>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'
import { computed, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import type { Supplier } from '~/models/supplier'
import BaseTable from '~/components/tables/BaseTable.vue'
import type { BaseTableColumn, TableFetchResult } from '~/components/tables/table'
import type { TransactionHistoryRecord } from '~/models/transaction'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'
import type { SubBillerWallet} from "~/models/subBiller"
import { useTable } from '~/composables/utils/useTable'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'sub_biller', to: '/organization/sub-billers' },
    { label: 'details', active: true },
  ],
})

const { t } = useI18n()

const tabs = [
  { label: t('details'), value: 'details' },
  { label: t('wallet'), value: 'wallet' },
]

const activeTab = ref('details')
const route = useRoute()
const notification = useNotification()

const transactionId = computed(() => route.params.id as string)
const loading = ref(true)
const showDownloadModal = ref(false)
const page = ref(1)
const pageSize = ref<{ label: string; value: number }>({
  label: '10',
  value: 10,
})
const total = ref(0)
const totalPage = ref(0)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const transactions = ref<TransactionHistoryRecord[]>([])
const errorMsg = ref('')
const router = useRouter()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { createSortableHeader, createRowNumberCell } = useTable()

const getCardGradientByIndex = (index: number): string | undefined => {
  const gradients: string[] = [
    'bg-gradient-to-r from-blue-500 to-blue-500',
    'bg-gradient-to-r from-yellow-500 to-orange-500',
    'bg-gradient-to-r from-gray-500 to-gray-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-purple-500 to-indigo-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-red-500 to-orange-400',
    'bg-gradient-to-r from-teal-500 to-cyan-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-600',
  ]

  const safeIndex = index % gradients.length
  return gradients[safeIndex]
}

const handleViewDetails = (record: TransactionHistoryRecord) => {
  // Navigate to transaction details page
  navigateToDetails(record.id)
}

// Handle Repush Transaction
const handleRepush = () => {
    notification.showWarning({
      title: t('pages.transaction.info'),
      description: t('pages.transaction.info_des'),
    })
}

const navigateToDetails = (rowId: string) => {
  router.push(`/transactions/detail/${rowId}`)
}

const columns: BaseTableColumn<TransactionHistoryRecord>[] = [
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
      h(resolveComponent('UCheckbox'), {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('pages.transaction.created_date'), 'left'),
    cell: ({ row }) =>
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  {
    id: 'bank_ref',
    accessorKey: 'bank_ref',
    header: () => t('pages.transaction.bank_ref'),
    cell: ({ row }) => row.original.bank_ref || '-',
    enableSorting: true,
  },
  {
    id: 'collection_bank',
    accessorKey: 'collection_bank',
    header: () => t('collection_bank'),
    cell: ({ row }) => row.original.collection_bank || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlement_bank',
    accessorKey: 'settlement_bank',
    header: () => t('settlement_bank'),
    cell: ({ row }) => row.original.settlement_bank || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'ABA', value: 'ABA' },
      { label: 'ACLEDA', value: 'ACLEDA' },
      { label: 'AMK', value: 'AMK' },
    ],
  },
  {
    id: 'settlement_type',
    accessorKey: 'settlement_type',
    header: () => t('settlement_type'),
    cell: ({ row }) => row.original.settlement_type || '-',
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Auto', value: 'Auto' },
      { label: 'Manual', value: 'Manual' },
    ],
  },
  {
    id: 'transaction_type',
    accessorKey: 'transaction_type',
    header: () => t('transaction_type'),
    cell: ({ row }) => row.original.transaction_type || '-',
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: 'Wallet Top up', value: 'Wallet Top up' },
      { label: 'Deeplink / Checkout', value: 'Deeplink / Checkout' },
      { label: 'Wallet Payment', value: 'Wallet Payment' },
      { label: 'QR Pay', value: 'QR Pay' },
    ],
  },
  {
    id: 'sub_biller',
    accessorKey: 'sub_biller',
    header: () => t('sub_biller'),
    cell: ({ row }) => row.original.sub_biller || '-',
    enableSorting: true,
  },
  {
    id: 'total_customer',
    accessorKey: 'total_customer',
    header : ({ column }) => createSortableHeader(column, t('pages.transaction.total_customer'), 'right'),
    cell: ({ row }) =>  h(
        'div',
        { class: 'text-right' },
        row.original.total_customer || '-',
      ),
  },
  {
    id: 'status',
    header: () => t('status.header'),
    cell: ({ row }) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    enableColumnFilter: true,
    filterType: 'select',
    filterOptions: [
      { label: t('completed'), value: t('completed') },
      { label: t('pending'), value: t('pending') },
      { label: t('failed'), value: t('failed') },
    ],
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    header: () => t('settlement.currency'),
    cell: ({ row }) => h('div', { class: 'text-left' }, row.original.currency_id || '-'),
    enableColumnFilter: true,
    filterOptions: [
      { label: t('currency.usd'), value: 'USD' },
      { label: t('currency.khr'), value: 'KHR' },
    ],
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
 
]



const { getSubBillerById } = usePgwModuleApi()
const { getSubBillerWalletList } = usePgwModuleApi()

const supplierData = ref<Supplier | null>(null)

const fetchSubBillerById = async () => {
  try {
    const id = transactionId.value
    if (!id) return

    const response = await getSubBillerById(id)
    supplierData.value = response
  } catch (error) {
    console.error('Error fetching sub biller detail:', error)
    errorMsg.value = t('failed_to_load_data')
  }
}



const errorHandler = useErrorHandler()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    showSuccess({ title: t('wallet_page.copy_success_message') })
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const fetchWallets = async () => {
  try {
    const id = transactionId.value
    if (!id) return

    const response = await getSubBillerWalletList(id)
    wallets.value = response.data ?? []
  } catch (error) {
    console.error('Error fetching wallets:', error)
    errorMsg.value = t('failed_to_load_wallets')
  }
}


// const wallets = ref([
//   {
//     id: 'wallet-aba',
//     bankName: 'ABA Bank',
//     accountNumber: '000111222',
//     walletNumber: 'WLT-ABA-001',
//     currency: 'KHR',
//     balance: '1,000,000',
//   },
//   {
//     id: 'wallet-acleda',
//     bankName: 'Acleda Bank',
//     accountNumber: '999888777',
//     walletNumber: 'WLT-ACL-002',
//     currency: 'USD',
//     balance: '5,000',
//   },
// ])

const wallets = ref<SubBillerWallet[]>([])


// Push Back Transaction Data
const webhookHistoryData = ref([
  {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T10:30:00+07:00',
    status: 'Failed',
    retrying: false,
  },
  {
    id: 'pushback-002',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T11:00:00+07:00',
    status: 'Success',
    retrying: false,
  },
])

const retryPushBack = (id: string) => {
  const item = webhookHistoryData.value.find((x) => x.id === id)
  if (!item) return

  item.retrying = true
  notification.showInfo({
    title: 'Retry Push Back',
    description: `Retrying push back for ID ${id}...`,
  })

  setTimeout(() => {
    item.status = 'Success'
    item.retrying = false
    notification.showSuccess({
      title: 'Push Back Success',
      description: `Push back for ID ${id} has been resent successfully.`,
    })
  }, 1500)
}

const webhookColumns = [
  {
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }: any) =>
      h(
        'div',
        {
          class: 'relative inline-block group',
        },
        [
          h(
            'button',
            {
              class: `
                inline-flex items-center justify-center w-8 h-8 rounded transition-colors
                ${
                  row.original.retrying
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
                    : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                }
              `,
              disabled: row.original.retrying,
              onClick: () => retryPushBack(row.original.id),
              title: row.original.retrying ? 'Retrying...' : 'Retry Push Back',
            },
            [
              row.original.retrying
                ? h('svg', {
                    class: 'animate-spin h-4 w-4',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    innerHTML: `
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    `,
                  })
                : h('svg', {
                    class: 'w-4 h-4',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    'stroke-width': '1.5',
                    stroke: 'currentColor',
                    innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />`,
                  }),
            ]
          ),
        ]
      ),
    size: 80,
  },
  {
    id: 'date',
    header: () => 'Date',
    accessorKey: 'date',
    cell: ({ row }: any) => {
      const date = new Date(row.original.date)
      return h(
        'span',
        {},
        date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    },
    size: 180,
  },
  {
    id: 'status',
    header: () => 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'md',
      }),
    size: 120,
  },
]

const supplierInitials = computed(() => {
  const name = supplierData.value?.name?.trim() || ''
  if (!name) return 'SP'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const supplierProfileImage = computed(() => {
  try {
    const ext = supplierData.value?.extData ? JSON.parse(supplierData.value?.extData) : {}
    return ext.profileImage || 'https://cdn.prod.website-files.com/66619549eba8f39855e63f8a/66de8d3fc334563cf4f6d9de_software-companies.jpeg'
  } catch {
    return 'https://cdn.prod.website-files.com/66619549eba8f39855e63f8a/66de8d3fc334563cf4f6d9de_software-companies.jpeg'
  }
})


const fetchTransactionHistory = async (params?: {
  page?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}) : Promise<TableFetchResult<TransactionHistoryRecord[]> | null>  => {
  loading.value = true
  try {
    const banks = ['ABA', 'ACLEDA', 'AMK'] as const
    const subBillers = [
      'Cambodia Electric Co.',
      'Smart Axiata',
      'Cellcard',
      'Ezecom',
      'Metfone',
      'Sabay Digital',
      'Foodpanda Cambodia',
      'Nham24',
      'Kerry Express',
      'J&T Express',
      'B-Hub Technology',
      'Phnom Penh Water Supply',
      'City Gas Cambodia',
      'Total Energies Cambodia',
      'ISPP International School',
    ]

    // Generate full dataset
    const fullData: TransactionHistoryRecord[] = Array.from({ length: 100 }, (_, i) => ({
      id: `txn-${i + 1}`,
      created_date: new Date(Date.now() - i * 86400000),
      bank_ref: `BANKREF-${i + 1000}`,
      collection_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_bank: banks[Math.floor(Math.random() * banks.length)]!,
      settlement_type: i % 2 === 0 ? 'Auto' : 'Manual',
      total_amount: 1000000 + i * 5000,
      currency_id: i % 2 === 0 ? 'USD' : 'KHR',
      status: [t('completed'), t('pending'), t('failed')][i % 3] as string,
      total_customer: i + 1,
      transaction_type: ['Wallet Top up', 'Deeplink / Checkout', 'Wallet Payment', 'QR Pay'][i % 4]!,
      sub_biller: subBillers[Math.floor(Math.random() * subBillers.length)]!,
    }))

    // Apply search filter if provided
    let filteredData = fullData
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredData = fullData.filter(item => 
        item.bank_ref.toLowerCase().includes(searchLower) ||
        item.collection_bank.toLowerCase().includes(searchLower) ||
        item.settlement_bank.toLowerCase().includes(searchLower) ||
        item.transaction_type.toLowerCase().includes(searchLower) ||
        item.sub_biller.toLowerCase().includes(searchLower) ||
        item.total_customer.toString().toLowerCase().includes(searchLower)
      )
    }

    // Apply date filter if provided
    if (params?.startDate && params?.endDate) {
      const startDate = new Date(params.startDate)
      const endDate = new Date(params.endDate)
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_date)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Calculate pagination
    const currentPage = params?.page || 1
    const currentPageSize = params?.pageSize || 10
    const totalRecords = filteredData.length
    const totalPages = Math.ceil(totalRecords / currentPageSize)
    
    // Apply pagination
    const startIndex = (currentPage - 1) * currentPageSize
    const endIndex = startIndex + currentPageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      total_record: totalRecords,
      total_page: totalPages,
    }
  } catch (error: unknown) {
    console.error('Error loading transaction data:', error)
    errorMsg.value = (error as Error).message || 'Failed to load transaction history.'
    errorHandler.handleApiError(error)
    return {
      data: [],
      total_record: 0,
      total_page: 0,
    }
  } finally {
    loading.value = false
  }
}

const supplierOverviewFields = computed(() => [
  {
    label: 'Code',
    value: supplierData.value?.syncCode ?? '-',
    type: 'code',
    copyable: true,
    rawValue: supplierData.value?.syncCode,
  },
  {
    label: 'Phone',
    value: supplierData.value?.phone || '-',
    type: 'text',
  },
  {
    label: 'Email',
    value: supplierData.value?.email || '-',
    type: 'text',
  },
  {
    label: 'Address',
    value: supplierData.value?.address || '-',
    type: 'text',
  },
  {
    label: 'TIN',
    value: supplierData.value?.tinNumber || '-',
    type: 'text',
  },
  {
    label: 'Active',
    value: supplierData.value?.isActive ? 'Yes' : 'No',
    type: 'badge',
  },
  {
    label: 'Created Date',
    value: new Date(supplierData.value?.createdDate ?? '').toLocaleString('en-GB'),
    type: 'text',
  },
])


// Download functions
const download = async () => {
  showDownloadModal.value = true
}

onMounted(() => {
  fetchTransactionHistory()
  fetchSubBillerById()
  fetchWallets()
})
</script>


