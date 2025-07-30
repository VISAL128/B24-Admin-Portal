<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Main Layout: Left and Right Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <!-- Left Section: Transaction Detail (50% width) -->
      <div class="lg:col-span-1">
        <div
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <!-- Transaction Detail Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
                >
                  <UIcon name="material-symbols:receipt-long" class="w-4 h-4 text-primary" />
                </div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">Transaction</h4>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <StatusBadge :status="transactionData.status" variant="subtle" size="sm" />
              <UButton
                color="primary"
                variant="outline"
                icon="i-heroicons-eye"
                size="sm"
                @click="download"
              >
              </UButton>
            </div>
          </div>

          <!-- Transaction Data Display Box -->
          <div
            class="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4"
          >
            <!-- Single Column Layout for Transaction Fields -->
            <div class="space-y-0">
              <div
                v-for="(field, index) in allFields"
                :key="index"
                :class="[
                  'flex justify-between items-center py-3',
                  index < allFields.length - 1
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
                  class="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ field.value }}
                </span>

                <!-- Copyable Code Type -->
                <!-- <ClipboacrdBadge
                  v-else-if="field.type === 'code' && field.copyable"
                  :text="field.rawValue || field.value"
                  :copied-tooltip-text="$t('clipboard.copied')"
                /> -->

                <ClipboardBadge
                  v-else-if="field.type === 'code' && field.copyable"
                  :text="field.rawValue"
                  :copied-tooltip-text="$t('clipboard.copied')"
                  class="mt-1"
                />

                <!-- Regular Text -->
                <span
                  v-else
                  :class="[
                    'text-sm font-medium text-gray-900 dark:text-white',
                    field.type === 'code' ? 'font-mono break-all' : '',
                  ]"
                >
                  {{ field.value }}
                </span>
              </div>

              <!-- Supplier Section at the end -->
              <div
                class="flex justify-between items-center py-3 border-t border-dotted border-gray-200 dark:border-gray-700"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400">Biller Name</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  transactionData.biller
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Settlement Bank & Push Back Transaction (50% width) -->
      <div class="space-y-3 flex flex-col h-full">
        <!-- Settlement Bank Section -->
        <div
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-2"
                >
                  <UIcon name="i-heroicons-building-library" class="w-4 h-4 text-green-600" />
                </div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">Settlement Bank</h4>
              </div>
            </div>
            <!-- <div class="flex items-center space-x-2">
              <StatusBadge :status="transactionData.status" variant="subtle" size="sm" />
            </div> -->
          </div>
          <!-- Horizontal line below header -->
          <hr class="border-gray-200 dark:border-gray-700 mb-2 -mx-4" />

          <div class="space-y-3">
            <!-- Bank Name -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Bank Name</span>
              <div class="flex items-center space-x-2">
                <UAvatar
                  src="https://b24-upload.s3.ap-southeast-1.amazonaws.com/banklogo2024/AC.png"
                  alt="ACLEDA Bank"
                  size="sm"
                />
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ transactionData.settlementBank }}
                </span>
              </div>
            </div>

            <!-- Bank Reference -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Account Number</span>
              <ClipboardBadge
                :text="maskAccountNumber(transactionData.accountNumber)"
                :copied-tooltip-text="$t('clipboard.copied')"
                class="mt-1"
              />
            </div>

            <!-- Settlement Amount -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Settlement Amount</span>
              <span class="text-lg font-bold text-blue-600">
                {{ useCurrency().formatAmount(transactionData.settlementAmount) }}
                {{ transactionData.currency }}
              </span>
            </div>
          </div>
        </div>

        <!-- Push Back Transaction Section -->
        <div
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1 flex flex-col"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-orange-600" />
            </div>
            <h4 class="text-base font-medium text-gray-900 dark:text-white">
              Push Back Transaction
            </h4>
          </div>

          <!-- Push Back Transaction History Table -->
          <div class="flex-1">
            <UTable
              :data="webhookHistoryData"
              :columns="webhookColumns"
              class="w-full"
              sortable
              v-model:sort="webhookSorting"
              :ui="{
                td: 'px-2 py-3 whitespace-nowrap align-top text-sm',
                th: 'px-2 py-3 whitespace-nowrap text-left text-sm',
                thead: 'whitespace-nowrap',
                tbody: 'whitespace-nowrap',
                tr: 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
              }"
              @select="onRowSelect"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Information Table -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
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
        sortable
        v-model:sort="customerSorting"
        :ui="{
          td: 'px-2 py-3 whitespace-nowrap align-top text-sm',
          th: 'px-2 py-3 whitespace-nowrap text-left text-sm',
          thead: 'whitespace-nowrap',
          tbody: 'whitespace-nowrap',
        }"
      />
    </div>

    <!-- Transaction Allocation Table -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
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
        sortable
        v-model:sort="transactionAllocationSorting"
        :ui="{
          td: 'px-2 py-3 whitespace-nowrap align-top text-sm',
          th: 'px-2 py-3 whitespace-nowrap text-left text-sm',
          thead: 'whitespace-nowrap',
          tbody: 'whitespace-nowrap',
          tr: 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
        }"
        @select="onTransactionAllocationSelect"
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
                    format.formatDateTime(getSelectedPushBackDetail()?.date, {
                      dateStyle: userPreferences?.dateFormat || 'medium',
                      timeStyle: userPreferences?.timeFormat || 'short',
                    })
                  }}</span>
                </div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Repush Status:</span
                  >
                  <StatusBadge

                    :status="getSelectedPushBackDetail()?.status || 'Unknown'"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                 <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Total Repush:</span
                  >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    getSelectedPushBackDetail()?.totalRepush || '0'
                  }}</span>
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
                <ClipboardBadge
                  :text="getSelectedPushBackDetail()?.billerConfiguration.url || ''"
                  :copied-tooltip-text="$t('clipboard.copied')"
                  class="mt-2"
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
            <CopyableCodeBlock
              :content="getSelectedPushBackDetail()?.payload"
              success-message="Payload copied to clipboard"
            />
          </div>

          <!-- Response Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Response:
            </h3>
            <CopyableCodeBlock
              :content="getSelectedPushBackDetail()?.response"
              success-message="Response copied to clipboard"
            >
              <div class="space-y-2">
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
            </CopyableCodeBlock>
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
                    useCurrency().formatAmount(
                      getSelectedAllocationDetail()?.transaction?.transactionAmount
                    ) || '50.00'
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
                  <ClipboardBadge
                    :text="settlement.bank_ref || ''"
                    :copied-tooltip-text="$t('clipboard.copied')"
                    class="mt-2"
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
import { computed, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue'
import CopyableCodeBlock from '~/components/CopyableCodeBlock.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'transactions', to: '/transactions' },
    { label: 'details', active: true },
  ],
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { copy } = useClipboard()
const notification = useNotification()
const { createRowNumberCell, createSortableHeader } = useTable()
const format = useFormat()
const userPreferences = useUserPreferences().getPreferences()

const isTransactionSelected = ref(false)
const transactionId = computed(() => route.params.id as string)
const loading = ref(true)
const showDownloadModal = ref(false)
const showPushBackDetail = ref(false)
const selectedPushBackTransaction = ref<any>(null)
const showTransactionAllocationDetail = ref(false)
const selectedTransactionAllocation = ref<any>(null)

// Sorting state for tables
const customerSorting = ref([])
const transactionAllocationSorting = ref([])
const webhookSorting = ref([{ id: 'date', desc: true }])

// Customer Details Data
interface CustomerDetail {
  id: string
  customerName: string
  customerCode: string
  billNumber: string
  amount: number
  currency: string
  [key: string]: any
}

const customerDetails: CustomerDetail[] = [
  {
    id: '1',
    customerName: 'So Sorphorn',
    customerCode: 'CUST-001',
    billNumber: 'BILL-TX000001A',
    amount: 150,
    currency: 'USD',
  },
]

const customerColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'customerName',
    header: ({ column }: any) => createSortableHeader(column, 'Name', 'left'),
    accessorKey: 'customerName',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customerName),
    size: 200,
    minSize: 180,
    enableSorting: true,
  },
  {
    id: 'customerCode',
    header: ({ column }: any) => createSortableHeader(column, 'Code', 'left'),
    accessorKey: 'customerCode',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customerCode),
    size: 150,
    minSize: 120,
    enableSorting: true,
  },
  {
    id: 'billNumber',
    header: ({ column }: any) => createSortableHeader(column, 'Bill Number', 'left'),
    accessorKey: 'billNumber',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.billNumber),
    size: 180,
    minSize: 160,
    enableSorting: true,
  },
  {
    id: 'currency',
    header: () => h('div', { class: 'text-left' }, 'Currency'),
    accessorKey: 'currency',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.currency),
    size: 80,
    minSize: 70,
    enableSorting: true,
  },
  {
    id: 'amount',
    header: ({ column }: any) => createSortableHeader(column, 'Amount', 'right'),
    accessorKey: 'amount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.amount)),
    size: 120,
    minSize: 100,
    enableSorting: true,
  }
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
    customer: 'So Sorphorn',
    transactionAmount: 150.0,
    billerName: 'Charge Station A',
    amount: 75.0,
    outstandingAmount: 75.0,
    currency: 'USD',
    date: '2025-07-15T10:30:00+07:00',
    status: 'pending',
  },
  {
    id: '2',
    customer: 'So Sorphorn',
    transactionAmount: 150.0,
    billerName: 'Oone Go EV Charger',
    amount: 75.0,
    outstandingAmount: 75.0,
    currency: 'USD',
    date: '2025-07-15T12:00:00+07:00',
    status: 'pending',
  },
]

const transactionAllocateColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'date',
    header: ({ column }: any) => createSortableHeader(column, 'Date', 'left'),
    accessorKey: 'date',
    cell: ({ row }: any) => {
      try {
        return h('div', { class: 'text-sm text-left' }, [
          format.formatDateTime(row.original.date, {
            dateStyle: userPreferences?.dateFormat || 'medium',
            timeStyle: userPreferences?.timeFormat || 'short',
          }),
        ])
      } catch (error) {
        // Fallback to original date string if formatting fails
        return h('div', { class: 'text-sm' }, [row.original.date])
      }
    },
    size: 160,
    minSize: 140,
    enableSorting: true,
  },
  {
    id: 'customer',
    header: ({ column }: any) => createSortableHeader(column, 'Customer', 'left'),
    accessorKey: 'customer',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customer),
    size: 180,
    minSize: 160,
    enableSorting: true,
  },
  {
    id: 'billerName',
    header: ({ column }: any) => createSortableHeader(column, 'Allocation Party', 'left'),
    accessorKey: 'billerName',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.billerName),
    size: 160,
    minSize: 150,
    enableSorting: true,
  },
  {
    id: 'status',
    header: ({column}: any) => h('div', { class: 'text-left' }, 'Status'),
    accessorKey: 'status',
    enableSorting: false,
    cell: ({ row }: any) =>
      h(StatusBadge, {
        class: 'text-left',
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    size: 120,
  },
  {
    id: 'currency',
    header: () => h('div', { class: 'text-left' }, 'Currency'),
    accessorKey: 'currency',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.currency),
    size: 80,
    minSize: 70,
    enableSorting: true,
  },
  {
    id: 'amount',
    header: ({ column }: any) => createSortableHeader(column, 'Received Amount', 'right'),
    accessorKey: 'amount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.amount)),
    size: 120,
    minSize: 100,
    enableSorting: true,
  },
  {
    id: 'outstandingAmount',
    header: ({ column }: any) => createSortableHeader(column, 'Outstanding Amount', 'right'),
    accessorKey: 'outstandingAmount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.outstandingAmount)),
    size: 140,
    minSize: 120,
    enableSorting: true,
  },
]

// Push Back Transaction Data
const webhookHistoryData = ref([
  {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T10:30:00+07:00',
    type: 'webhook',
    status: 'Failed',
    totalRepush: 1,
    retrying: false,
  }
])

// Push Back Detail Data - for slideover
const pushBackDetailData = ref({
  'pushback-001': {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    totalRepush: 1,
    date: '2024-07-22T10:30:00+07:00',
    status: 'Failed',
    billerConfiguration: {
      type: 'webhook',
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
  }
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
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-left' }, 'Actions'),
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
                inline-flex items-center justify-center w-6 h-6 rounded transition-colors
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
                    class: 'w-3 h-3',
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
    enableSorting: false,
  },
  {
    id: 'date',
    header: ({ column }: any) => createSortableHeader(column, 'Date', 'left'),
    accessorKey: 'date',
    enableSorting: true,
    cell: ({ row }: any) => {
      return h('div', { class: 'text-sm text-left' }, [
        format.formatDateTime(row.original.date, {
          dateStyle: userPreferences?.dateFormat || 'medium',
          timeStyle: userPreferences?.timeFormat || 'short',
        }),
      ])
    },
    size: 100,
  },
   {
    id: 'total_repush',
    header: () => h('div', { class: 'text-right' }, 'Total Repush'),
    accessorKey: 'total_repush',
    enableSorting: false,
    cell:  ({ row }: any) =>
      h('div', { class: 'text-right' },row.original.totalRepush),
    size: 50,
  },
  {
    id: 'type',
    header: () => h('div', { class: 'text-left' }, 'Type'),
    accessorKey: 'type',
    enableSorting: false,
    cell:  ({ row }: any) =>
      h('div', { class: 'text-left' },row.original.type),
    size: 100,
  },
  {
    id: 'status',
    header: () => h('div', { class: 'text-left' }, 'Status'),
    accessorKey: 'status',
    enableSorting: false,
    cell: ({ row }: any) =>
      h(StatusBadge, {
        class: 'text-left',
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    size: 100,
  },
]

// Transaction data
const transactionData = {
  transactionNo: transactionId.value || 'TXN-20250729001',
  date: '2025-07-15T12:00:00+07:00',
  transactionType: 'Wallet Payment',
  currency: 'USD',
  status: 'success',
  transactionAmount: 150,
  settlementAmount: 147, // 150 - 3 fee
  customerFee: 0.0,
  supplierFee: 3.0,
  bankReference: 'AC0123243253',
  settlementBank: 'ACLEDA',
  accountNumber: 'BANK-12345678',
  biller: 'Charge Station A',
  transactionReference: 'DC0123243253',
  settlementStatus: 'success',
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
    value: `${useCurrency().formatAmount(transactionData.transactionAmount)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Transaction Type',
    value: transactionData.transactionType,
    type: 'badge',
  },
  {
    label: 'Date',
    value: format.formatDateTime(transactionData.date, {
      dateStyle: userPreferences?.dateFormat || 'medium',
      timeStyle: userPreferences?.timeFormat || 'short',
    }),
    type: 'text',
  },
  {
    label: 'Customer Fee',
    value: `${useCurrency().formatAmount(transactionData.customerFee)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Supplier Fee',
    value: `${useCurrency().formatAmount(transactionData.supplierFee)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Bank Reference',
    value: `${transactionData.transactionReference}`,
    type: 'code',
    copyable: true,
    rawValue: transactionData.transactionReference,
  },
])

// Show all fields in a single column
const allFields = computed(() => transactionOverviewFields.value)

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
