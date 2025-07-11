<template>
  <USlideover
    :open="isOpen"
    @close="close"
    title="Transaction Details"
    :description="`Transaction ID: ${transactionId}`"
    class="w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-none right-0"
  >
    <template #body>
      <div class="flex h-full flex-col">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <!-- Transaction Overview -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Transaction Overview
              </h3>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Transaction ID</label
                  >
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ transactionId }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Status</label
                  >
                  <UBadge color="success" variant="soft" size="lg" class="mt-1">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-2" />
                    Success
                  </UBadge>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Amount</label
                  >
                  <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    $100.00 USD
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Payment Method</label
                  >
                  <UBadge color="primary" variant="soft" class="mt-1">
                    <UIcon name="i-heroicons-credit-card" class="w-4 h-4 mr-2" />
                    Credit Card
                  </UBadge>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Created Date</label
                  >
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ new Date().toLocaleString() }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Merchant</label
                  >
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">Bill24 Demo Store</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Customer Email</label
                  >
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">customer@example.com</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Reference ID</label
                  >
                  <div class="mt-1 flex items-center space-x-2">
                    <p
                      class="text-sm text-gray-900 dark:text-white"
                      @click="copyToClipboard(`REF-${transactionId}-2024`)"
                    >
                      REF-{{ transactionId }}-2024
                    </p>
                    <!-- <UButton
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-clipboard-document"
                      @click="copyToClipboard(`REF-${transactionId}-2024`)"
                    /> -->
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Customer Details -->
          <!-- <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Customer Details</h3>
                <UBadge color="info" variant="soft" size="sm">
                  <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1" />
                  Bill24 Customer
                </UBadge>
              </div>
            </template>
            <UTable
              :rows="customerDetails"
              :columns="customerColumns as any"
              class="w-full"
              hover
              @click:row="(row: any) => onSelectCustomerDetail(row as CustomerDetail)"
            >
              <template #billNumber-data="{ row }">
                <div class="flex items-center">
                  <span>{{ (row as unknown as CustomerDetail).billNumber }}</span>
                  <UButton
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-eye"
                    class="ml-2 text-gray-500 hover:text-blue-600"
                    @click.stop="viewBillDetails(row as unknown as CustomerDetail)"
                  />
                </div>
              </template>
              <template #totalAmount-data="{ row }">
                <span class="font-medium text-green-600 dark:text-green-400">{{
                  (row as unknown as CustomerDetail).totalAmount
                }}</span>
              </template>
              <template #currency-data="{ row }">
                <UBadge color="neutral" variant="soft" size="xs">{{
                  (row as unknown as CustomerDetail).currency
                }}</UBadge>
              </template>
              <template #empty-state>
                <div class="flex flex-col items-center justify-center py-4">
                  <UIcon name="i-heroicons-information-circle" class="w-8 h-8 text-gray-400" />
                  <p class="mt-2 text-sm text-gray-500">No customer details available</p>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-between py-2 px-3 text-xs text-gray-500 border-t">
                  <span>Total: 2 records</span>
                  <span>Last updated: {{ new Date().toLocaleString() }}</span>
                </div>
              </template>
            </UTable>
          </UCard> -->

          <!-- Timeline -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Transaction Timeline
              </h3>
            </template>
            <div class="space-y-4">
              <!-- Each step -->
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
          </UCard>
        </div>

        <!-- Bottom Actions -->
        <div
          class="flex justify-end space-x-2 p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <UButton variant="outline" @click="exportTransaction">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-2" />
            Export Details
          </UButton>
          <UButton color="primary" @click="close">
            <UIcon name="i-heroicons-check" class="w-4 h-4 mr-2" />
            Done
          </UButton>
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
  isOpen.value = false
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

// Customer details handling
const selectedCustomerDetail = ref<CustomerDetail | null>(null)

const onSelectCustomerDetail = (row: CustomerDetail) => {
  selectedCustomerDetail.value = row
  notification.showInfo({
    title: 'Customer Detail Selected',
    description: `Selected bill ${row.billNumber}`,
    duration: 3000,
  })
}

const viewBillDetails = (row: CustomerDetail) => {
  notification.showInfo({
    title: 'View Bill Details',
    description: `Viewing details for bill ${row.billNumber}`,
    duration: 3000,
  })
}

// Define the customer detail type
interface CustomerDetail {
  customerCode: string
  billNumber: string
  totalAmount: string
  currency: string
}

// Customer details table
const customerColumns = [
  {
    key: 'customerCode',
    label: 'Customer Code',
    sortable: true,
  },
  {
    key: 'billNumber',
    label: 'Bill Number',
    sortable: true,
  },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    sortable: true,
  },
  {
    key: 'currency',
    label: 'Currency',
  },
]

const customerDetails: CustomerDetail[] = [
  {
    customerCode: 'CUST-001',
    billNumber: `BILL-${props.transactionId}-A`,
    totalAmount: '$75.50',
    currency: 'USD',
  },
  {
    customerCode: 'CUST-001',
    billNumber: `BILL-${props.transactionId}-B`,
    totalAmount: '$24.50',
    currency: 'USD',
  },
]

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
