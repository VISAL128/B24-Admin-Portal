<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Transaction Detail Section -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div
            class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
          >
            <UIcon name="material-symbols:receipt-long" class="w-4 h-4 text-primary" />
          </div>
          <h4 class="text-base font-medium text-gray-900 dark:text-white">Transaction</h4>
        </div>
        <div class="flex items-center space-x-2">
          <StatusBadge :status="transactionData.status" variant="subtle" size="lg" />
          <UButton color="primary" variant="outline" icon="i-lucide-download" @click="download">
          </UButton>
        </div>
      </div>

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
            <span v-else-if="field.type === 'amount'" class="text-sm text-gray-900 dark:text-white">
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
            <span v-else-if="field.type === 'amount'" class="text-sm text-gray-900 dark:text-white">
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

    <!-- Customer Information Table -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
        >
          <UIcon name="material-symbols:list-alt" class="w-4 h-4 text-primary" />
        </div>
        Transaction Detail
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

    <!-- Transaction Allocation Table -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
        >
          <UIcon name="i-material-symbols-receipt-long" class="w-4 h-4 text-primary" />
        </div>
        Transaction Allocation
      </h4>
      <UTable
        :data="transactionAllocateData"
        :columns="transactionAllocateColumns"
        class="w-full"
        :ui="{
          td: 'px-2 py-3 whitespace-nowrap align-top',
          th: 'px-2 py-3 whitespace-nowrap text-left',
          thead: 'whitespace-nowrap',
          tbody: 'whitespace-nowrap',
          tr: 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
        }"
        @select="onTransactionAllocationSelect"
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
            <span v-else-if="column.id === 'outstandingAmount'" class="text-orange-600 font-medium">
              {{ row.original[column.id].toFixed(2) }}
            </span>
            <span v-else class="text-gray-900 dark:text-white">
              {{ row.original[column.id] }}
            </span>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Push Back Transaction History Table -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-primary" />
        </div>
        Push Back Transaction History
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
          tr: 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
        }"
        @select="onRowSelect"
      />
    </div>

    <!-- Download Modal -->
    <UModal
      v-model:open="showDownloadModal"
      :title="t('download_options')"
      :transition="true"
      :close="{
        class: 'rounded-full',
        onClick: () => {
          showDownloadModal = false
        },
      }"
    >
      <template #body>
        <div class="space-y-4 py-6">
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {{ t('transaction_details') }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ t('transaction_details_description') }}
                </p>
              </div>
              <UButton size="sm" @click="exportTransaction" class="ml-3">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
                {{ t('download') }}
              </UButton>
            </div>
          </div>
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {{ t('receipt') }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ t('receipt_description') }}
                </p>
              </div>
              <UButton variant="outline" size="sm" @click="downloadReceiptAsImage" class="ml-3">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
                {{ t('download') }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            :label="t('cancel')"
            color="neutral"
            variant="outline"
            class="w-24 justify-center"
            @click="showDownloadModal = false"
          />
        </div>
        i
      </template>
    </UModal>

    <!-- Push Back Transaction Detail Slideover -->
    <USlideover
      v-model:open="showPushBackDetail"
      side="right"
      :overlay="true"
      :title="'Push Back Transaction Detail'"
      @close="closeSlideover"
    >
      <template #body>
        <div class="space-y-4" v-if="selectedPushBackTransaction">
          <!-- Transaction ID Section -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Transaction ID:</span
                  >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    getSelectedPushBackDetail()?.transactionId
                  }}</span>
                </div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Repush Date:</span
                  >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    formatDate(getSelectedPushBackDetail()?.date || '')
                  }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Repush Status:</span
                  >
                  <StatusBadge
                    :status="getSelectedPushBackDetail()?.status || 'Unknown'"
                    variant="subtle"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Biller Configuration Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Biller Configuration:
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  getSelectedPushBackDetail()?.billerConfiguration.type
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">URL:</span>
                <CopyableText
                  :text="getSelectedPushBackDetail()?.billerConfiguration.url || ''"
                  :display-text="getSelectedPushBackDetail()?.billerConfiguration.url || ''"
                  text-class="text-sm text-primary dark:text-primary"
                  font-class="font-mono break-all"
                />
              </div>
            </div>
          </div>

          <!-- Payload Sent Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Payload Sent:
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <pre class="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">{{
                JSON.stringify(getSelectedPushBackDetail()?.payload, null, 2)
              }}</pre>
            </div>
          </div>

          <!-- Response Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Response:
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Status Code:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  getSelectedPushBackDetail()?.response.statusCode
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Message:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  getSelectedPushBackDetail()?.response.message
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Transaction Allocation Detail Slideover -->
    <USlideover
      v-model:open="showTransactionAllocationDetail"
      side="right"
      :overlay="true"
      :title="'Transaction Allocation Detail'"
      @close="closeAllocationSlideover"
    >
      <template #body>
        <div class="space-y-4" v-if="selectedTransactionAllocation">
          <!-- Customer & Transaction Summary Card -->
          <UCard>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Customer
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ getSelectedAllocationDetail()?.transaction?.customer_name || 'John Doe' }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ getSelectedAllocationDetail()?.transaction?.customer_code || 'CUST-001' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Biller
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{
                    getSelectedAllocationDetail()?.transaction?.biller_name || 'Charge Station A'
                  }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ getSelectedAllocationDetail()?.transaction?.biller_code || 'BS-001' }}
                </p>
              </div>
            </div>

            <!-- Amount Summary -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Transaction Amount</span>
                <span class="text-lg font-bold text-blue-600"
                  >{{
                    getSelectedAllocationDetail()?.transaction?.transactionAmount?.toFixed(2) ||
                    '50.00'
                  }}
                  {{ getSelectedAllocationDetail()?.transaction?.currency || 'USD' }}</span
                >
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Settlement Count</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white"
                  >{{
                    getSelectedAllocationDetail()?.transaction?.settlement_count || '1'
                  }}
                  settlement(s)</span
                >
              </div>
            </div>
          </UCard>

          <!-- Settlement Details Section -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-building-library" class="w-4 h-4 text-blue-600" />
              </div>
              <h4 class="text-base font-medium text-gray-900 dark:text-white">
                Settlement Details
              </h4>
            </div>

            <!-- Settlement Cards -->
            <div
              v-for="(settlement, index) in getSelectedAllocationDetail()?.settlement || [
                mockSettlement,
              ]"
              :key="index"
              class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
            >
              <!-- Settlement Information -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">ចំនួនរៀល:</span>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                    (settlement.amount || 25.0).toLocaleString()
                  }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">ធនាគារ:</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                    settlement.bank || 'ACLEDA'
                  }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">លេខយោងធនាគារ:</span>
                  <CopyableText
                    :text="settlement.bank_ref || 'FT12937HDGT36467H'"
                    :display-text="settlement.bank_ref || 'FT12937HDGT36467H'"
                    text-class="text-sm text-gray-900 dark:text-white font-mono"
                    font-class="font-mono"
                  />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">កាលបរិច្ឆេទបញ្ជូន:</span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{
                    settlement.date || '10 កុម្ភៈ 2025 02:43'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'
import { computed, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import CopyableText from '~/components/CopyableText.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'transactions', to: '/transactions' },
    { label: 'transaction_details', active: true },
  ],
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { copy } = useClipboard()
const notification = useNotification()

const transactionId = computed(() => route.params.id as string)
const loading = ref(true)
const showDownloadModal = ref(false)
const showPushBackDetail = ref(false)
const selectedPushBackTransaction = ref<any>(null)
const showTransactionAllocationDetail = ref(false)
const selectedTransactionAllocation = ref<any>(null)

// Customer Details Data
interface CustomerDetail {
  id: string
  customerName: string
  customerCode: string
  billNumber: string
  amount: string
  currency: string
  [key: string]: any
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

// Transaction Allocation Data
interface TransactionAllocateData {
  id: string
  customer: string
  transactionAmount: number
  billerName: string
  amount: number
  outstandingAmount: number
  currency: string
  date: string
  [key: string]: any
}

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
    header: () => ' Allocation Party',
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

// Push Back Detail Data - for slideover
const pushBackDetailData = ref({
  'pushback-001': {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T10:30:00+07:00',
    status: 'Failed',
    billerConfiguration: {
      type: 'Webhook',
      url: 'https://example.com/webhook',
      exchange: null,
      routingKey: null,
    },
    payload: {
      transaction_id: 'TXN-20240722001',
      status: 'failed',
      amount: 10.5,
      currency: 'USD',
      customer: {
        name: 'John Doe',
        phone: '012345678',
      },
    },
    response: {
      statusCode: 500,
      message: 'Internal Server Error',
    },
    headers: {
      'Content-Type': 'application/json',
    },
    retrying: false,
    allowPushBack: true,
  },
  'pushback-002': {
    id: 'pushback-002',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T11:00:00+07:00',
    status: 'Success',
    billerConfiguration: {
      type: 'Webhook',
      url: 'https://example.com/webhook',
      exchange: null,
      routingKey: null,
    },
    payload: {
      transaction_id: 'TXN-20240722001',
      status: 'success',
      amount: 10.5,
      currency: 'USD',
      customer: {
        name: 'John Doe',
        phone: '012345678',
      },
    },
    response: {
      statusCode: 200,
      message: 'Success',
    },
    headers: {
      'Content-Type': 'application/json',
    },
    retrying: false,
    allowPushBack: true,
  },
})

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

// Transaction data
const transactionData = {
  transactionNo: transactionId.value || 'TX000001',
  date: '15/07/2025 10:03 am',
  transactionType: 'Deeplink / Checkout',
  currency: 'USD',
  status: 'failed',
  transactionAmount: 150.75,
  settlementAmount: 148.25,
  customerFee: 0.0,
  supplierFee: 2.5,
  bankReference: 'AC0123243253',
  settlementBank: 'ACLEDA',
  accountNumber: 'BANK-12345678',
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber
  const lastFour = accountNumber.slice(-4)
  const maskedPart = '*'.repeat(accountNumber.length - 4)
  return `${maskedPart}${lastFour}`
}

// Transaction overview fields
const transactionOverviewFields = computed(() => [
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
const leftColumnFields = computed(() => transactionOverviewFields.value.slice(0, 5))
const rightColumnFields = computed(() => transactionOverviewFields.value.slice(5))

// Download functions
const download = async () => {
  showDownloadModal.value = true
}

// Push Back Transaction Detail function
const onRowSelect = (row: any) => {
  selectedPushBackTransaction.value = row.original
  showPushBackDetail.value = true
}

const closeSlideover = () => {
  showPushBackDetail.value = false
  selectedPushBackTransaction.value = null
}

// Helper function to get selected push back detail
const getSelectedPushBackDetail = () => {
  if (!selectedPushBackTransaction.value || !selectedPushBackTransaction.value.id) return null
  const id = selectedPushBackTransaction.value.id as string
  return pushBackDetailData.value[id as keyof typeof pushBackDetailData.value]
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Transaction Allocation Detail function
const onTransactionAllocationSelect = (row: any) => {
  selectedTransactionAllocation.value = row.original
  showTransactionAllocationDetail.value = true
}

const closeAllocationSlideover = () => {
  showTransactionAllocationDetail.value = false
  selectedTransactionAllocation.value = null
}

// Mock data for transaction allocation detail
const mockTransactionAllocationDetail = {
  transaction: {
    id: '1',
    customer_name: 'John Doe',
    customer_code: 'CUST-001',
    transactionAmount: 50.0,
    biller_name: 'Charge Station A',
    biller_code: 'BS-001',
    currency: 'USD',
    date: '15/07/2025 10:30 am',
    settlement_count: 1,
  },
  settlement: [
    {
      amount: 25.0,
      receivedAmount: 25.0,
      outstandingAmount: 25.0,
      currency: 'USD',
      date: '15/07/2025 10:30 am',
      status: 'Completed',
      bank: 'Bank of America',
      bank_ref: 'BA-123456789',
    },
  ],
}

const mockSettlement = {
  amount: 25.0,
  receivedAmount: 25.0,
  outstandingAmount: 25.0,
  currency: 'USD',
  date: '15/07/2025 10:30 am',
  status: 'Completed',
  bank: 'Bank of America',
  bank_ref: 'BA-123456789',
}

// Helper function to get selected transaction allocation detail
const getSelectedAllocationDetail = () => {
  // For now, return mock data. In real implementation, this would be based on selectedTransactionAllocation
  return mockTransactionAllocationDetail
}

const exportTransaction = async () => {
  try {
    showDownloadModal.value = false
    notification.showInfo({
      title: 'Generating Export',
      description: 'Please wait while we capture the transaction details...',
    })

    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '800px'
    tempDiv.style.height = 'auto'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.color = 'black'

    tempDiv.innerHTML = `
      <div style="background: white; padding: 30px; color: black; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #333; font-size: 24px;">Transaction Details</h1>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Bill24 Payment System</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
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
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 10px 20px; border-radius: 6px; font-weight: bold; ${
            transactionData.status === 'Success'
              ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
              : transactionData.status === 'Failed'
                ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
                : 'background: #f8f9fa; color: #495057; border: 1px solid #dee2e6;'
          }">Status: ${transactionData.status}</span>
        </div>
        <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 20px; color: #666; font-size: 12px;">
          <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
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
          <div style="margin: 8px 0; color: black;"><strong>Transaction:</strong> ${transactionData.transactionNo}</div>
          <div style="margin: 8px 0; color: black;"><strong>Amount:</strong> ${transactionData.transactionAmount.toFixed(2)} ${transactionData.currency}</div>
          <div style="margin: 8px 0; color: black;"><strong>Date:</strong> ${transactionData.date}</div>
          <div style="margin: 8px 0; color: black;"><strong>Status:</strong> ${transactionData.status}</div>
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 20px;">Thank you for using Bill24</div>
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

onMounted(() => {
  loading.value = false
})
</script>

<style scoped>
/* Ensure modal is visible and has a high z-index */
.u-modal {
  z-index: 1000;
}
</style>
