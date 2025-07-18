<template>
  <USlideover
    v-model:open="openSlideover"
    :title="'Transaction'"
    :dismissible="true"
    side="right"
    :close="false"
    @close="closeSlideover"
    class="w-full sm:w-[90vw] md:w-[50vw] lg:w-[70vw] max-w-none right-0"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction</h3>
        <div class="flex items-center gap-2">
          <!-- Status Transaction  -->
          <StatusBadge :status="transactionData.status" variant="table" size="sm" />
          <UButton variant="outline" @click="download" size="sm" square>
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </UButton>

          <UButton variant="outline" @click="closeSlideover" size="sm" square>
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <div class="flex-shrink-0">
          <!-- Transaction Detail Section -->
          <div class="px-4 sm:px-0">
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <div
                class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
              >
                <UIcon name="i-material-symbols-receipt-long" class="w-5 h-5 text-primary" />
              </div>
              Transaction Detail
            </h4>
          </div>
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
        </div>
        <!-- Separator Line -->
        <div
          class="border-b border-dashed border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0 mt-4"
        ></div>
        <!-- Customer Details Table -->
        <div class="px-4 sm:px-0 mt-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <div
              class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
            >
              <UIcon name="i-heroicons-users" class="w-5 h-5 text-primary" />
            </div>
            Customer Information
          </h4>
          <UTable
            :data="customerDetails"
            :columns="customerColumns"
            class="w-full"
            :ui="{
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

        <!-- Separator Line -->
        <div
          class="border-b border-dashed border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0 mt-4"
        ></div>
        <!-- Transaction Allocation Table -->
        <div class="px-4 sm:px-0 mt-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <div
              class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
            >
              <UIcon name="i-material-symbols-receipt-long" class="w-5 h-5 text-primary" />
            </div>
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

        <!-- Separator Line -->
        <div
          class="border-b border-dashed border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0 mt-4"
        ></div>

        <!-- Repush Transaction Table -->
        <div class="px-4 sm:px-0 mt-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <div
              class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-primary" />
            </div>
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
      </div>
    </template>
  </USlideover>

  <!-- Download Modal - Using teleport to body -->
  <Teleport to="body">
    <UModal v-model="showDownloadModal" prevent-close>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Download Options</h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="showDownloadModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Choose what you would like to download:
          </p>

          <div class="space-y-3">
            <!-- Transaction Details Option -->
            <div
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Transaction Details
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    Complete transaction information including customer details and allocation data
                  </p>
                </div>
                <UButton size="sm" @click="exportTransaction" class="ml-3">
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
                  Download
                </UButton>
              </div>
            </div>

            <!-- Receipt Option -->
            <div
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Receipt</h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    Simple receipt format with basic transaction information
                  </p>
                </div>
                <UButton variant="outline" size="sm" @click="downloadReceiptAsImage" class="ml-3">
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
                  Download
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="neutral" variant="ghost" @click="showDownloadModal = false">
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </Teleport>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'
import { computed, h, ref } from 'vue'
import CopyableText from '~/components/CopyableText.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'

interface Props {
  modelValue: boolean
  transactionId?: string
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  transactionId: '',
})

const emit = defineEmits<Emits>()

const openSlideover = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeSlideover = () => {
  emit('update:modelValue', false)
}

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
                inline-flex items-center justify-center w-8 h-8 rounded transition-colors
                ${
                  row.original.retrying
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
                    : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                }
              `,
              disabled: row.original.retrying,
              onClick: () => retryWebhook(row.original.id),
              title: row.original.retrying ? 'Retrying...' : 'Repush Transaction',
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
      h(
        'div',
        {
          class:
            'inline-block border border-gray-200 dark:border-gray-700 rounded-md p-1 bg-gray-50 dark:bg-gray-800',
        },
        [
          h(CopyableText, {
            text: row.original.url,
            displayText: row.original.url,
            textClass: 'hover:underline text-sm truncate block',
            fontClass: '',
            notificationTitle: 'URL Copied!',
          }),
        ]
      ),
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
            class:
              'inline-block border border-gray-200 dark:border-gray-700 rounded-md p-1 bg-gray-50 dark:bg-gray-800',
          },
          [
            h(CopyableText, {
              text: row.original.payload,
              displayText: row.original.payload,
              textClass: 'hover:underline text-sm truncate block',
              fontClass: '',
              notificationTitle: 'Payload Copied!',
            }),
          ]
        ),
      ])
    },
    size: 250,
  },
]

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
const showDownloadModal = ref(false)

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

const download = async () => {
  showDownloadModal.value = true
}

const exportTransaction = async () => {
  try {
    showDownloadModal.value = false
    notification.showInfo({
      title: 'Generating Export',
      description: 'Please wait while we capture the transaction details...',
    })

    // Create a temporary div with simple styling
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '800px'
    tempDiv.style.height = 'auto'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.color = 'black'

    // Simple HTML with basic inline styles only
    tempDiv.innerHTML = `
      <div style="background: white; padding: 30px; color: black; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #333; font-size: 24px;">Transaction Details</h1>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Bill24 Payment System</p>
        </div>

        <!-- Transaction Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
          <!-- Left Column -->
          <div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Transaction No:</span><br>
              <span style="color: #0066cc; font-family: monospace; font-weight: bold;">${transactionData.transactionNo}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Amount:</span><br>
              <span style="color: #333; font-weight: bold;">${transactionData.transactionAmount.toFixed(2)} ${transactionData.currency}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Type:</span><br>
              <span style="background: #e6f3ff; color: #0066cc; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${transactionData.transactionType}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Date:</span><br>
              <span style="color: #333;">${transactionData.date}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="color: #666; font-size: 14px;">Settlement Amount:</span><br>
              <span style="color: #333; font-weight: bold;">${transactionData.settlementAmount.toFixed(2)} ${transactionData.currency}</span>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Customer Fee:</span><br>
              <span style="color: #333; font-weight: bold;">${transactionData.customerFee.toFixed(2)} ${transactionData.currency}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Supplier Fee:</span><br>
              <span style="color: #333; font-weight: bold;">${transactionData.supplierFee.toFixed(2)} ${transactionData.currency}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Bank Reference:</span><br>
              <span style="color: #0066cc; font-family: monospace; font-weight: bold;">${transactionData.bankReference}</span>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ccc;">
              <span style="color: #666; font-size: 14px;">Settlement Bank:</span><br>
              <span style="color: #333;">${transactionData.settlementBank}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="color: #666; font-size: 14px;">Account Number:</span><br>
              <span style="color: #0066cc; font-family: monospace; font-weight: bold;">${maskAccountNumber(transactionData.accountNumber)}</span>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div style="text-align: center; margin: 30px 0;">
          <span style="
            display: inline-block;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            ${
              transactionData.status === 'Success'
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
                : transactionData.status === 'Failed'
                  ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
                  : 'background: #f8f9fa; color: #495057; border: 1px solid #dee2e6;'
            }
          ">
            Status: ${transactionData.status}
          </span>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 20px; color: #666; font-size: 12px;">
          <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `

    // Add to DOM
    document.body.appendChild(tempDiv)

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Capture with minimal options
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      backgroundColor: 'white',
      scale: 2,
    })

    // Clean up
    document.body.removeChild(tempDiv)

    // Download
    const link = document.createElement('a')
    link.download = `${transactionData.transactionNo}-transaction-details.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notification.showSuccess({
      title: 'Export Complete',
      description: 'Transaction details exported successfully',
    })
  } catch (error) {
    console.error('Error exporting transaction:', error)
    notification.showError({
      title: 'Export Failed',
      description: 'Failed to export transaction details. Please try again.',
    })
  }
}

const downloadReceiptAsImage = async () => {
  try {
    showDownloadModal.value = false
    notification.showInfo({
      title: 'Generating Receipt',
      description: 'Please wait while we capture the receipt...',
    })

    // Create a simple receipt with basic styling
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '400px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.color = 'black'

    tempDiv.innerHTML = `
      <div style="background: white; padding: 25px; text-align: center; color: black; font-family: Arial, sans-serif;">
        <h2 style="margin: 0 0 25px 0; color: black; font-size: 20px;">Bill24 Receipt</h2>
        
        <div style="border-bottom: 1px dashed #999; padding-bottom: 15px; margin-bottom: 15px; text-align: left;">
          <div style="margin: 8px 0; color: black;">
            <strong>Transaction:</strong> ${transactionData.transactionNo}
          </div>
          <div style="margin: 8px 0; color: black;">
            <strong>Amount:</strong> ${transactionData.transactionAmount.toFixed(2)} ${transactionData.currency}
          </div>
          <div style="margin: 8px 0; color: black;">
            <strong>Date:</strong> ${transactionData.date}
          </div>
          <div style="margin: 8px 0; color: black;">
            <strong>Status:</strong> ${transactionData.status}
          </div>
        </div>
        
        <div style="font-size: 12px; color: #666; margin-top: 20px;">
          Thank you for using Bill24
        </div>
      </div>
    `

    document.body.appendChild(tempDiv)
    await new Promise((resolve) => setTimeout(resolve, 200))

    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      backgroundColor: 'white',
      scale: 2,
    })

    document.body.removeChild(tempDiv)

    const link = document.createElement('a')
    link.download = `${transactionData.transactionNo}-receipt.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notification.showSuccess({
      title: 'Receipt Downloaded',
      description: 'Receipt has been downloaded successfully',
    })
  } catch (error) {
    console.error('Error downloading receipt:', error)
    notification.showError({
      title: 'Download Failed',
      description: 'Failed to download receipt. Please try again.',
    })
  }
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
