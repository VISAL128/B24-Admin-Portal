<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Tabs -->
    <UTabs variant="link" v-model="activeTab" :items="tabs" />

    <!-- Transaction Info Tab -->
    <div
      v-if="activeTab === 'details'"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="flex items-center gap-4">
          <!-- Perfect Circular Avatar -->
          <div class="w-20 h-20 relative">
            <div
              class="absolute inset-0 rounded-full bg-blue-300 dark:bg-blue-900/30 overflow-hidden flex items-center justify-center text-primary text-lg font-semibold"
            >
              <img
                v-if="supplierProfileImage"
                :src="supplierProfileImage"
                alt="Supplier"
                class="w-full h-full object-cover"
              />
              <span v-else class="leading-none text-3xl text-white">
                {{ supplierInitials }}
              </span>
            </div>
          </div>
          <h4 class="text-2xl font-medium text-gray-900 dark:text-white">
            {{ supplierData.name }}
          </h4>
        </div>
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

            <!-- Spacer -->
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

    <div
      v-else-if="activeTab === 'wallet'"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center mb-4">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
        >
          <UIcon name="mdi:webhook" class="w-4 h-4 text-primary" />
        </div>
        <h4 class="text-base font-medium text-gray-900 dark:text-white">
          {{ $t('wallet') }}
        </h4>
      </div>

      <!-- Table Component for Pushback Logs -->
      <DataTable :columns="webhookColumns" :data="webhookHistoryData" />
    </div>

    <!-- Transaction Tab -->
    <div
      v-else-if="activeTab === 'transactions'"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center mb-4">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-2"
        >
          <UIcon name="material-symbols:credit-card" class="w-4 h-4 text-primary" />
        </div>
        <h4 class="text-base font-medium text-gray-900 dark:text-white">
          {{ $t('transactions') }}
        </h4>
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
  { label: t('transactions'), value: 'transactions' }, // ✅ New tab
]

const activeTab = ref('details')
const route = useRoute()
const notification = useNotification()

const transactionId = computed(() => route.params.id as string)
const loading = ref(true)
const showDownloadModal = ref(false)

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

const supplierData: Supplier = {
  id: 'SUP-001',
  code: 'SUP12345',
  name: 'ACME Corporation',
  nameKh: 'ក្រុមហ៊ុន អេសស៊ីអិមអ៊ី',
  shortName: 'ACME',
  phone: '+85512345678',
  email: 'info@acme.com',
  address: '123 Street, Phnom Penh',
  addressKh: 'ផ្លូវ ១២៣ ភ្នំពេញ',
  tinNumber: 'KHM123456789',
  userId: 'user-001',
  parentId: null,
  supplierTypeId: 'type-01',
  syncCode: null,
  bgwCode: null,
  scope: 'international',
  isActive: true,
  isValidUnicodeName: true,
  createdBy: 'admin',
  createdDate: '2025-07-02T09:25:24.893821',
  updatedBy: null,
  updatedDate: null,
  paymentWidgetSetting: null,
  paymentWidgetSettingPreview: null,
  directDebitResponse: null,
  checkoutPageConfig: null,
  extData: null,
}

const supplierInitials = computed(() => {
  const name = supplierData.name?.trim() || ''
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
    const ext = supplierData.extData ? JSON.parse(supplierData.extData) : {}
    return ext.profileImage || null
  } catch {
    return null
  }
})

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber
  const lastFour = accountNumber.slice(-4)
  const maskedPart = '*'.repeat(accountNumber.length - 4)
  return `${maskedPart}${lastFour}`
}

const supplierOverviewFields = computed(() => [
  {
    label: 'Code',
    value: supplierData.code,
    type: 'code',
    copyable: true,
    rawValue: supplierData.code,
  },
  {
    label: 'Phone',
    value: supplierData.phone || '-',
    type: 'text',
  },
  {
    label: 'Email',
    value: supplierData.email || '-',
    type: 'text',
  },
  {
    label: 'Address',
    value: supplierData.address || '-',
    type: 'text',
  },
  {
    label: 'TIN',
    value: supplierData.tinNumber || '-',
    type: 'text',
  },
  {
    label: 'Active',
    value: supplierData.isActive ? 'Yes' : 'No',
    type: 'badge',
  },
  {
    label: 'Created Date',
    value: new Date(supplierData.createdDate).toLocaleString('en-GB'),
    type: 'text',
  },
])

// Download functions
const download = async () => {
  showDownloadModal.value = true
}

onMounted(() => {
  loading.value = false
})
</script>

<style scoped>
/* Style for unselected tabs */
:deep(.u-tab:not(.u-tab--active)) {
  border: 1px solid #e5e7eb; /* Light gray border for light mode */
  border-radius: 4px; /* Optional: Add rounded corners */
}

/* Dark mode support */
.dark :deep(.u-tab:not(.u-tab--active)) {
  border: 1px solid #374151; /* Dark gray border for dark mode */
}
</style>
