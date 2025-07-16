<template>
  <USlideover
    :open="isOpen"
    @close="close"
    :ui="{
      close: 'hidden',
    }"
    dismissible
    class="w-full sm:w-[90vw] md:w-[50vw] lg:w-[50vw] max-w-none right-0"
  >
    <template #header>
      <div class="flex items-center justify-between w-full px-4 py-1">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Status Transaction  -->
          <StatusBadge :status="transactionData.status" variant="table" size="sm" />
          <UButton variant="outline" @click="exportTransaction" size="sm" square>
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </UButton>
          <UButton variant="outline" @click="close" size="sm" square>
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="flex h-full flex-col">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 md:space-y-6">
          <!-- Transaction Overview Section -->
          <div class="px-4 sm:px-0">
            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column -->
              <div class="space-y-0">
                <div
                  v-for="(field, index) in leftColumnFields"
                  :key="index"
                  :class="[
                    'flex justify-between items-start py-3',
                    index < leftColumnFields.length - 1
                      ? 'border-b border-dotted border-gray-200 dark:border-gray-700'
                      : '',
                  ]"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                    {{ field.label }}
                  </span>

                  <!-- Badge Type -->
                  <TransactionTypeBadge
                    v-if="field.type === 'badge'"
                    :transaction-type="field.value"
                    size="sm"
                  />

                  <!-- Amount Type -->
                  <span
                    v-else-if="field.type === 'amount'"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ field.value }}
                  </span>

                  <!-- Copyable Code Type -->
                  <CopyableText
                    v-else-if="field.type === 'code' && field.copyable"
                    :text="field.rawValue || field.value"
                    :display-text="field.value"
                    text-class="text-sm text-primary dark:text-primary"
                    font-class="font-mono break-all"
                  />

                  <!-- Grey Text -->
                  <span
                    v-else-if="field.type === 'grey-text'"
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ field.value }}
                  </span>

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

              <!-- Right Column -->
              <div class="space-y-0">
                <div
                  v-for="(field, index) in rightColumnFields"
                  :key="index"
                  :class="[
                    'flex justify-between items-start py-3',
                    index < rightColumnFields.length - 1
                      ? 'border-b border-dotted border-gray-200 dark:border-gray-700'
                      : '',
                  ]"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                    {{ field.label }}
                  </span>

                  <!-- Badge Type -->
                  <TransactionTypeBadge
                    v-if="field.type === 'badge'"
                    :transaction-type="field.value"
                    size="sm"
                  />

                  <!-- Amount Type -->
                  <span
                    v-else-if="field.type === 'amount'"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ field.value }}
                  </span>

                  <!-- Copyable Code Type -->
                  <CopyableText
                    v-else-if="field.type === 'code' && field.copyable"
                    :text="field.rawValue || field.value"
                    :display-text="field.value"
                    text-class="text-sm text-primary dark:text-primary"
                    font-class="font-mono break-all"
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

          <!-- Customer Details Table -->
          <div class="px-4 sm:px-0">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UIcon name="i-heroicons-users" class="w-5 h-5 mr-2 text-primary" />
              Customer Information
            </h4>

            <!-- <UTable
              :data="customerDetails"
              :columns="customerColumns"
              class="w-full"
              :ui="{
                td: 'px-2 py-3 whitespace-nowrap',
                th: 'px-2 py-3 whitespace-nowrap',
                thead: 'whitespace-nowrap',
                tbody: 'whitespace-nowrap',
              }"
            /> -->
            <UTable
              :data="customerDetails"
              :columns="customerColumns"
              class="w-full"
              :ui="{
                // td: 'px-2 py-3 whitespace-nowrap ',
                // th: 'px-2 py-3 whitespace-nowrap',
                td: 'px-2 py-3 whitespace-nowrap align-top',
                th: 'px-2 py-3 whitespace-nowrap text-left',
                thead: 'whitespace-nowrap',
                tbody: 'whitespace-nowrap',
              }"
            >
              <template #cell="{ column, row }">
                <div
                  :class="{
                    'text-left': ['customerName', 'customerCode', 'billNumber'].includes(column.id),
                    'text-right': ['amount'].includes(column.id),
                    'text-center': ['currency'].includes(column.id),
                  }"
                  class="w-full"
                >
                  {{ row.original[column.id] }}
                </div>
              </template>
            </UTable>
          </div>

          <!-- Transaction Allocation Table -->
          <div class="px-4 sm:px-0">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 mr-2 text-primary" />
              Transaction Allocation
            </h4>

            <UTable
              :data="transactionAllocateData"
              :columns="transactionAllocateColumns"
              class="w-full"
              :ui="{
                // thead: 'whitespace-nowrap',
                // th: 'text-left whitespace-nowrap',
                // td: 'whitespace-nowrap align-top',
                td: 'px-2 py-3 whitespace-nowrap align-top',
                th: 'px-2 py-3 whitespace-nowrap text-left',
                thead: 'whitespace-nowrap',
                tbody: 'whitespace-nowrap',
              }"
            >
              <template #cell="{ column, row }">
                <div
                  :class="{
                    'text-left': ['date', 'customer', 'billerName', 'currency'].includes(column.id),
                    'text-right': ['transactionAmount', 'amount', 'outstandingAmount'].includes(
                      column.id
                    ),
                    'text-center': false,
                  }"
                  class="w-full"
                >
                  <span
                    v-if="column.id === 'transactionAmount'"
                    class="text-gray-900 dark:text-white font-medium"
                  >
                    {{ row.original[column.id].toFixed(2) }}
                  </span>
                  <span v-else-if="column.id === 'amount'" class="text-blue-600 font-medium">
                    {{ row.original[column.id].toFixed(2) }}
                  </span>
                  <span
                    v-else-if="column.id === 'outstandingAmount'"
                    class="text-orange-600 font-medium"
                  >
                    {{ row.original[column.id].toFixed(2) }}
                  </span>
                  <span v-else class="text-gray-900 dark:text-white">
                    {{ row.original[column.id] }}
                  </span>
                </div>
              </template>
            </UTable>
          </div>

          <!-- Repush Transaction Table -->
          <div class="px-4 sm:px-0">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2 text-primary" />
              Repush Transaction History
            </h4>
            <UTable
              :data="webhookHistoryData"
              :columns="webhookColumns"
              class="w-full"
              :ui="{
                thead: 'whitespace-nowrap',
                th: 'text-left whitespace-nowrap px-3 py-3',
                td: 'whitespace-nowrap align-top px-3 py-3',
                tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
              }"
            />
          </div>

          <!-- Timeline -->
          <!-- <UCard>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Transaction Timeline
              </h3>
            </template>
            <div class="space-y-4">
              <div v-for="(item, index) in timeline" :key="index" class="relative flex items-start">
                <div
                  class="relative z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border-2 rounded-full"
                  :class="item.border"
                >
                  <UIcon :name="item.icon" :class="item.color + ' w-4 h-4'" />
                </div>
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.title }}
                    </h4>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.time }}</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </UCard> -->
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import CopyableText from '~/components/CopyableText.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'

interface CustomerDetail {
  id: string
  customerName: string
  customerCode: string
  billNumber: string
  amount: string
  currency: string
  [key: string]: any // 👈 Add this
}

interface TransactionAllocateData {
  id: string
  customer: string
  transactionAmount: number
  billerName: string
  amount: number
  outstandingAmount: number
  currency: string
  date: string
  [key: string]: any // 👈 Add this for dynamic property access
}

const customerDetails: CustomerDetail[] = [
  {
    id: '1',
    customerName: 'John Doe',
    customerCode: 'CUST-001',
    billNumber: 'BILL-TX000001-A',
    amount: '1,200.00',
    currency: 'USD',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    customerCode: 'CUST-002',
    billNumber: 'BILL-TX000001-B',
    amount: '800.00',
    currency: 'USD',
  },
]
const customerColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }: any) => h('div', { class: 'text-left font-medium' }, row.index + 1),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'customerName',
    header: () => 'Name',
    accessorKey: 'customerName',
    size: 200,
    minSize: 180,
  },
  {
    id: 'customerCode',
    header: () => 'Code',
    accessorKey: 'customerCode',
    size: 150,
    minSize: 120,
  },
  {
    id: 'billNumber',
    header: () => 'Bill Number',
    accessorKey: 'billNumber',
    size: 180,
    minSize: 160,
  },
  {
    id: 'amount',
    header: () => 'Amount',
    accessorKey: 'amount',
    cell: ({ row }: any) => h('span', { class: 'font-medium' }, row.original.amount),
    size: 120,
    minSize: 100,
  },
  {
    id: 'currency',
    header: () => 'Currency',
    accessorKey: 'currency',
    size: 80,
    minSize: 70,
  },
] as any[]
const transactionAllocateData: TransactionAllocateData[] = [
  {
    id: '1',
    customer: 'John Doe',
    transactionAmount: 50.0,
    billerName: 'Charge Station A',
    amount: 25.0,
    outstandingAmount: 25.0,
    currency: 'USD',
    date: '15/07/2025 10:30 am',
  },
  {
    id: '2',
    customer: 'John Doe',
    transactionAmount: 50.0,
    billerName: 'EV Plus (Station B)',
    amount: 25.0,
    outstandingAmount: 20.0,
    currency: 'USD',
    date: '15/07/2025 12:00 pm',
  },
]

const transactionAllocateColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }: any) => h('div', { class: 'text-left font-medium' }, row.index + 1),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'date',
    header: () => 'Date',
    accessorKey: 'date',
    size: 160,
    minSize: 140,
  },
  {
    id: 'customer',
    header: () => 'Customer',
    accessorKey: 'customer',
    size: 180,
    minSize: 160,
  },
  {
    id: 'transactionAmount',
    header: () => 'Amount',
    accessorKey: 'transactionAmount',
    size: 140,
    minSize: 120,
  },
  {
    id: 'billerName',
    header: () => 'Sub Biller',
    accessorKey: 'billerName',
    size: 160,
    minSize: 150,
  },
  {
    id: 'amount',
    header: () => 'Received Amount',
    accessorKey: 'amount',
    size: 120,
    minSize: 100,
  },
  {
    id: 'outstandingAmount',
    header: () => 'Outstanding Amount',
    accessorKey: 'outstandingAmount',
    size: 140,
    minSize: 120,
  },
  {
    id: 'currency',
    header: () => 'Currency',
    accessorKey: 'currency',
    size: 80,
    minSize: 70,
  },
]

const webhookHistoryData = ref([
  {
    id: '1',
    date: '05/02/2024 2:30 pm',
    status: 'Failed',
    url: 'https://example.com/webhook',
    payload: JSON.stringify(
      {
        transaction_id: '9876543210',
        status: 'failed',
      },
      null,
      2
    ),
    retrying: false,
  },
  {
    id: '2',
    date: '06/02/2024 9:15 am',
    status: 'Success',
    url: 'https://example.com/webhook',
    payload: JSON.stringify(
      {
        transaction_id: '9876543210',
        status: 'success',
      },
      null,
      2
    ),
    retrying: false,
  },
  {
    id: '3',
    date: '06/02/2024 9:45 am',
    status: 'Failed',
    url: 'https://example.com/webhook',
    payload: JSON.stringify(
      {
        transaction_id: '9876543210',
        status: 'failed',
      },
      null,
      2
    ),
    retrying: false,
  },
])

const retryWebhook = (id: string) => {
  const item = webhookHistoryData.value.find((x) => x.id === id)
  if (!item) return

  item.retrying = true
  notification.showInfo({
    title: 'Retry Webhook',
    description: `Retrying webhook for ID ${id}...`,
  })

  // Simulate retry delay
  setTimeout(() => {
    item.status = 'Success'
    item.retrying = false
    notification.showSuccess({
      title: 'Webhook Success',
      description: `Webhook for ID ${id} has been resent successfully.`,
    })
  }, 1500)
}

const webhookColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }: any) => h('div', { class: 'text-left font-medium' }, row.index + 1),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
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
                inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md
                transition-colors duration-200
                ${
                  row.original.retrying
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                    : row.original.status === 'Failed'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                }
              `,
              disabled: row.original.retrying,
              onClick: () => retryWebhook(row.original.id),
            },
            [
              row.original.retrying
                ? h('svg', {
                    class: 'animate-spin h-3 w-3',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    innerHTML: `
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    `,
                  })
                : h('svg', {
                    class: 'w-3 h-3 transform',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    'stroke-width': '1.5',
                    stroke: 'currentColor',
                    innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />`,
                  }),
            ]
          ),
          // Tooltip
          h(
            'div',
            {
              class:
                'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50',
            },
            'Repush Transaction'
          ),
        ]
      ),
    size: 80,
  },
  {
    id: 'date',
    header: () => 'Date',
    accessorKey: 'date',
    size: 150,
  },
  {
    id: 'status',
    header: () => 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) =>
      h(StatusBadge, {
        status: row.original.status,
        variant: 'table',
        size: 'sm',
      }),
    size: 100,
  },
  {
    id: 'url',
    header: () => 'Webhook URL',
    accessorKey: 'url',
    cell: ({ row }: any) =>
      h(CopyableText, {
        text: row.original.url,
        displayText: row.original.url,
        textClass: 'text-primary hover:underline text-sm truncate block max-w-[200px]',
        fontClass: '',
        notificationTitle: 'URL Copied!',
      }),
    size: 200,
  },
  {
    id: 'payload',
    header: () => 'Payload Data',
    accessorKey: 'payload',
    cell: ({ row }: any) => {
      const parsedPayload = JSON.parse(row.original.payload)
      return h('div', { class: 'space-y-1' }, [
        h(
          'div',
          {
            class: 'text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors',
          },
          [
            h('span', { class: 'font-medium' }, 'Transaction ID: '),
            h('span', { class: 'font-mono' }, parsedPayload.transaction_id),
          ]
        ),
        h(
          'div',
          {
            class: 'text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors',
          },
          [
            h('span', { class: 'font-medium' }, 'Status: '),
            h(StatusBadge, {
              status: parsedPayload.status,
              variant: 'table',
              size: 'sm',
            }),
          ]
        ),
        h(CopyableText, {
          text: row.original.payload,
          displayText: 'Click to copy full payload',
          textClass: 'text-xs text-gray-400 italic',
          fontClass: '',
          notificationTitle: 'Payload Copied!',
        }),
      ])
    },
    size: 250,
  },
]

interface Props {
  modelValue: boolean
  transactionId?: string
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  transactionId: 'X001',
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const close = () => {
  emit('update:modelValue', false)
}

const { copy } = useClipboard()
const notification = useNotification()

const refIdCopied = ref(false)

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    notification.showSuccess({
      title: 'Copied!',
      description: `${text} has been copied to clipboard.`,
    })

    // For reference ID, show visual feedback
    if (text.includes('REF-')) {
      refIdCopied.value = true
      setTimeout(() => {
        refIdCopied.value = false
      }, 2000)
    }
  } catch (error) {
    notification.showError({
      title: 'Error',
      description: 'Failed to copy to clipboard',
    })
  }
}

const exportTransaction = () => {
  notification.showSuccess({
    title: 'Export Started',
    description: `Exporting transaction ${props.transactionId}...`,
  })
}

// Transaction data
const transactionData = {
  transactionNo: props.transactionId || 'TX000001',
  date: '15/07/2025 10:03 am',
  transactionType: 'Deeplink / Checkout',
  currency: 'USD',
  status: 'Failed',
  transactionAmount: 150.75,
  settlementAmount: 148.25,
  customerFee: 0.0,
  supplierFee: 2.5,
  bankReference: 'AC0123243253',
  settlementBank: 'ACLEDA',
  accountNumber: 'BANK-12345678',
}

// Helper function to get status badge color
const getStatusBadgeColor = (
  status: string
): 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info' | 'neutral' => {
  switch (status) {
    case 'Success':
      return 'success'
    case 'Failed':
      return 'error'
    case 'Unpaid':
      return 'warning'
    case 'Canceled':
      return 'neutral'
    case 'Expired':
      return 'neutral'
    case 'Reversed':
      return 'warning'
    default:
      return 'neutral'
  }
}

// Helper function to get status icon
const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'Success':
      return 'i-heroicons-check-circle'
    case 'Failed':
      return 'i-heroicons-x-circle'
    case 'Unpaid':
      return 'i-heroicons-clock'
    case 'Canceled':
      return 'i-heroicons-no-symbol'
    case 'Expired':
      return 'i-heroicons-calendar-x'
    case 'Reversed':
      return 'i-heroicons-arrow-uturn-left'
    default:
      return 'i-heroicons-question-mark-circle'
  }
}

// Transaction overview fields
const transactionOverviewFields = computed(() => [
  // LEFT COLUMN - Priority/Important Information
  {
    label: 'Transaction No',
    value: transactionData.transactionNo,
    type: 'code',
    copyable: true,
    rawValue: transactionData.transactionNo,
  },
  {
    label: 'Transaction Amount',
    value: `${transactionData.transactionAmount.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Transaction Type',
    value: transactionData.transactionType,
    type: 'badge',
  },
  {
    label: 'Date',
    value: transactionData.date,
    type: 'text',
  },
  {
    label: 'Settlement Amount',
    value: `${transactionData.settlementAmount.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  // RIGHT COLUMN - Secondary/Administrative Information
  {
    label: 'Customer Fee',
    value: `${transactionData.customerFee.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Supplier Fee',
    value: `${transactionData.supplierFee.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Bank Reference',
    value: transactionData.bankReference,
    type: 'code',
    copyable: true,
    rawValue: transactionData.bankReference,
  },
  {
    label: 'Settlement Bank',
    value: transactionData.settlementBank,
    type: 'text',
  },
  {
    label: 'Account Number',
    value: maskAccountNumber(transactionData.accountNumber),
    type: 'code',
    copyable: true,
    rawValue: transactionData.accountNumber,
  },
])

// Split fields into left and right columns
// Split fields into left and right columns
const leftColumnFields = computed(() => transactionOverviewFields.value.slice(0, 5))
const rightColumnFields = computed(() => transactionOverviewFields.value.slice(5))

// Dummy timeline data
const timeline = [
  {
    title: 'Transaction Completed',
    description: 'Payment processed successfully',
    time: new Date().toLocaleString(),
    icon: 'i-heroicons-check',
    color: 'text-green-600',
    border: 'border-green-300 dark:border-green-600',
  },
  {
    title: 'Payment Processing',
    description: 'Payment submitted to gateway',
    time: new Date(Date.now() - 30000).toLocaleString(),
    icon: 'i-heroicons-arrow-path',
    color: 'text-blue-600',
    border: 'border-blue-300 dark:border-blue-600',
  },
  {
    title: 'Transaction Created',
    description: 'Transaction initiated by customer',
    time: new Date(Date.now() - 60000).toLocaleString(),
    icon: 'i-heroicons-plus',
    color: 'text-gray-600',
    border: 'border-gray-300 dark:border-gray-600',
  },
]

// Helper function to mask account number like credit card
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber
  const lastFour = accountNumber.slice(-4)
  const maskedPart = '*'.repeat(accountNumber.length - 4)
  return `${maskedPart}${lastFour}`
}
</script>
