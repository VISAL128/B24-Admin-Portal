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
    :key="wallet.id"
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
            {{ wallet.accountNumber }}
          </span>
          <button
            class="hover:text-yellow-300 transition"
            :title="t('wallet_page.copy_account_number')"
            @click="copyToClipboard(wallet.accountNumber)"
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
            {{ wallet.walletNumber }}
          </span>
          <button
            class="hover:text-yellow-300 transition"
            :title="t('wallet_page.copy_wallet_number')"
            @click="copyToClipboard(wallet.walletNumber)"
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
      <BaseTable
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
      </BaseTable>
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
import type { BaseTableColumn } from '~/components/tables/table'
import type { TransactionHistoryRecord } from '~/models/transaction'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'

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

const handleFilterChange = (columnId: string, value: string) => {
  console.log('Filter changed:', columnId, value)
  // Optional: trigger fetch or other logic
}

const navigateToDetails = (rowId: string) => {
  router.push(`/transactions/detail/${rowId}`)
}

const columns: BaseTableColumn<any>[] = [
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
    enableHiding: false,
  },
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }) => h('div', { class: 'text-left' }, row.index + 1),
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    // header: ({ column }) =>
    //   createSortableHeader(column, t('date'), 'created_date', 'left', (order) => {
    //     // Call your API with the new sorting order
    //     console.log('Sort order for created_date:', order) // 'asc' | 'desc' | null
    //     // Trigger your own fetch with the column and direction
    //     sortBy.value = 'created_date'
    //     sortDirection.value = order
    //     fetchTransactionHistory()
    //   }),
    header: t('date'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
  },
  {
    id: 'bank_ref',
    accessorKey: 'bank_ref',
    header: t('bank_ref'),
  },
  {
    id: 'collection_bank',
    accessorKey: 'collection_bank',
    header: t('collection_bank'),
  },
  {
    id: 'settlement_bank',
    accessorKey: 'settlement_bank',
    header: t('settlement_bank'),
  },
  {
    id: 'settlement_type',
    accessorKey: 'settlement_type',
    header: t('settlement_type'),
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: () => h('div', { class: 'text-right' }, t('total_amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatAmount(row.original.total_amount, row.original.currency_id)
      ),
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    header: t('settlement.currency'),
    enableColumnFilter: true,
    filterOptions: [
      { label: 'USD', value: 'USD' },
      { label: 'KHR', value: 'KHR' },
    ],
    enableSorting: true,
  },
  {
    id: 'transaction_type',
    accessorKey: 'transaction_type',
    header: t('transaction_type'),
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
    header: t('sub_biller'),
    enableSorting: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('status.header'),
    enableSorting: true,
    enableColumnFilter: true,
    filterOptions: [
      { label: t('completed'), value: 'completed' },
      { label: t('pending'), value: 'pending' },
      { label: t('failed'), value: 'failed' },
    ],
    cell: ({ row }: any) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    // cell: ({ row }) => {
    //   // return h('span', {
    //   //   class: `text-sm font-medium`
    //   // }, `Total: ${row.original.total_Settled}`)

    //   const success = row.original.success
    //   const fail = row.original.fail
    //   const total = row.original.total_settled

    //   const UBadge = resolveComponent('UBadge')
    //   const Icon = resolveComponent('UIcon')

    //   return h('div', { class: 'flex gap-2 items-center' }, [
    //     // h(UBadge, { color: 'gray', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
    //     //   h(Icon, { name: 'i-lucide-sigma', class: 'w-4 h-4' }),
    //     //   h('span', {}, total)
    //     // ]),
    //     h(
    //       UBadge,
    //       {
    //         color: 'primary',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [
    //         // h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }),
    //         h('span', { class: 'text-sm' }, `${t('total')}: ${total}`),
    //       ]
    //     ),
    //     // Success and Fail badges
    //     h(
    //       UBadge,
    //       {
    //         color: 'success',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }), h('span', {}, success)]
    //     ),
    //     h(
    //       UBadge,
    //       {
    //         color: 'error',
    //         variant: 'subtle',
    //         class: 'flex items-center gap-1',
    //       },
    //       () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, fail)]
    //     ),
    //   ])
    // },
  },
  // Add an action column for viewing details
  // {
  //   id: 'actions',
  //   header: t('actions'),
  //   cell: ({ row }) =>
  //     h('div', { class: 'flex items-center gap-2' }, [
  //       h(resolveComponent('UButton'), {
  //         color: 'primary',
  //         variant: 'ghost',
  //         icon: 'i-lucide-eye',
  //         size: 'sm',
  //         onClick: handleViewDetails(row.original),
  //         // title: translations.view_details
  //       }),
  //     ]),
  // },
]



const { getSubBillerById } = usePgwModuleApi()
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

const wallets = ref([
  {
    id: 'wallet-aba',
    bankName: 'ABA Bank',
    accountNumber: '000111222',
    walletNumber: 'WLT-ABA-001',
    currency: 'KHR',
    balance: '1,000,000',
  },
  // {
  //   id: 'wallet-acleda',
  //   bankName: 'Acleda Bank',
  //   accountNumber: '999888777',
  //   walletNumber: 'WLT-ACL-002',
  //   currency: 'USD',
  //   balance: '5,000',
  // },
])



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


const fetchTransactionHistory = async () => {
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
      settled_by: `User ${i + 1}`,
      transaction_type: ['Wallet Top up', 'Deeplink / Checkout', 'Wallet Payment', 'QR Pay'][i % 4],
      sub_biller: subBillers[Math.floor(Math.random() * subBillers.length)],
    }))

    // ✅ Paging
    const pageStart = (page.value - 1) * pageSize.value.value
    const pageEnd = pageStart + pageSize.value.value
    const pagedData = fullData.slice(pageStart, pageEnd)

    transactions.value = pagedData
    total.value = fullData.length
    totalPage.value = Math.ceil(fullData.length / pageSize.value.value)
  } catch (error: any) {
    console.error('Error loading dummy data:', error.message)
    errorMsg.value = error.message || 'Failed to load transaction history.'
    errorHandler.handleApiError(error)
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
    fetchSubBillerById() // <-- Add this line
})
</script>


