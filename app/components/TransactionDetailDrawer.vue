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
      <div class="flex items-center gap-3 px-4 py-1 sm:px-0">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-left"
          @click="close"
          aria-label="Close transaction details"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        />
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Transaction No:
            <span
              class="text-primary dark:text-primary cursor-pointer hover:underline font-mono"
              @click="copyToClipboard(transactionId)"
              >{{ transactionId }}</span
            >
          </p>
        </div>
      </div>
    </template>
    <template #body>
      <div class="flex h-full flex-col">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 md:space-y-6">
          <!-- Top Section: Amount and Status -->
          <div class="px-4 sm:px-0 mb-6">
            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <!-- Transaction Amount -->
              <div class="text-left">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Transaction Amount
                </p>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-gray-900 dark:text-white">
                    ${{ transactionData.transactionAmount.toFixed(2) }}
                  </span>
                  <span class="text-lg font-medium text-gray-600 dark:text-gray-400">
                    {{ transactionData.currency }}
                  </span>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center">
                <UBadge
                  :color="getStatusBadgeColor(transactionData.status)"
                  variant="soft"
                  size="lg"
                  class="px-3 py-1"
                >
                  <UIcon :name="getStatusIcon(transactionData.status)" class="w-4 h-4 mr-2" />
                  {{ transactionData.status }}
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Transaction Overview Section -->
          <div class="px-4 sm:px-0">
            <!-- Transaction Overview Title -->
            <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4">
              Transaction Overview
            </h4>

            <!-- Divider Line -->
            <div class="border-b border-gray-200 dark:border-gray-700 mb-6"></div>

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
                  <UBadge
                    v-if="field.type === 'badge'"
                    :color="field.badgeColor"
                    variant="soft"
                    size="sm"
                  >
                    {{ field.value }}
                  </UBadge>

                  <!-- Amount Type -->
                  <span
                    v-else-if="field.type === 'amount'"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ field.value }}
                  </span>

                  <!-- Copyable Code Type -->
                  <span
                    v-else-if="field.type === 'code' && field.copyable"
                    class="text-sm text-primary dark:text-primary cursor-pointer hover:underline font-mono break-all"
                    @click="copyToClipboard(field.rawValue || field.value)"
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
                  <UBadge
                    v-if="field.type === 'badge'"
                    :color="field.badgeColor"
                    variant="soft"
                    size="sm"
                  >
                    {{ field.value }}
                  </UBadge>

                  <!-- Amount Type -->
                  <span
                    v-else-if="field.type === 'amount'"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ field.value }}
                  </span>

                  <!-- Copyable Code Type -->
                  <span
                    v-else-if="field.type === 'code' && field.copyable"
                    class="text-sm text-primary dark:text-primary cursor-pointer hover:underline font-mono break-all"
                    @click="copyToClipboard(field.rawValue || field.value)"
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
            </div>
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

        <!-- Bottom Actions -->
        <div
          class="flex justify-end p-3 sm:p-4 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <UButton variant="outline" @click="exportTransaction">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-2" />
            Export Details
          </UButton>
          <!-- <UButton color="primary" @click="close">
            <UIcon name="i-heroicons-check" class="w-4 h-4 mr-2" />
            Done
          </UButton> -->
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
  date: '7/11/2025, 2:09:11 PM',
  transactionType: 'Deeplink / Checkout',
  currency: 'USD',
  status: 'Success',
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

// Helper function to get transaction type badge color
const getTransactionTypeBadgeColor = (
  type: string
): 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info' | 'neutral' => {
  switch (type) {
    case 'Wallet Top up':
      return 'info'
    case 'Deeplink / Checkout':
      return 'primary'
    case 'Wallet Payment':
      return 'success'
    case 'QR Pay':
      return 'secondary'
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
  // Transaction details (Amount and Status now displayed prominently at the top)
  {
    label: 'Transaction No',
    value: transactionData.transactionNo,
    type: 'code',
    copyable: true,
    rawValue: transactionData.transactionNo,
  },
  {
    label: 'Date',
    value: transactionData.date,
    type: 'text',
  },
  {
    label: 'Transaction Type',
    value: transactionData.transactionType,
    type: 'badge',
    badgeColor: getTransactionTypeBadgeColor(transactionData.transactionType),
  },
  {
    label: 'Currency',
    value: transactionData.currency,
    type: 'text',
  },
  {
    label: 'Settlement Amount',
    value: `$${transactionData.settlementAmount.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Customer Fee',
    value: `$${transactionData.customerFee.toFixed(2)} ${transactionData.currency}`,
    type: 'amount',
  },
  {
    label: 'Supplier Fee',
    value: `$${transactionData.supplierFee.toFixed(2)} ${transactionData.currency}`,
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
    value: transactionData.accountNumber,
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
</script>
