<script setup lang="ts">
import { CalendarDateTime, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { StepperItem, TableColumn } from '@nuxt/ui'
import { onMounted, ref } from 'vue'
import EmptyState from '~/components/TableEmptyState.vue'
import SumTranDataUnderTable from '~/components/tables/SumTranDataUnderTable.vue'
import TableShimmer from '~/components/tables/TableShimmer.vue'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import type { CurrencyConfig } from '~/composables/utils/useCurrency'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type {
  ConfirmSettlementRequest,
  ConfirmSettlementResponse,
  Cpo,
  InitQuerySettlement,
  Settlement,
  SettlementInquiryResponse,
  TransactionAllocation,
} from '~/models/settlement'
import type { SupplierProfile } from '~/models/supplier'
import appConfig from '~~/app.config'

const UButton = resolveComponent('UButton')

const supplierApi = useSupplierApi()
const auth = useAuth()
const { t, locale: i18nLocale } = useI18n()

// Load user preferences for time format
const userPreferences = useUserPreferences().getPreferences()
const { createSortableHeader, createRowNumberCell } = useTable<Settlement>()

const isLoadingCpoList = ref(false)
const isLoadingInquiry = ref(false)

// Create a CalendarDate for today in the local time zone
const today = new Date()
const now = new CalendarDateTime(today.getFullYear(), today.getMonth() + 1, today.getDate(), 23, 59)
const cutOffDatetime = shallowRef(now) // Default with time

// Create computed properties that sync with cutOffDatetime
// Generate hour options based on user preference
const getHourOptions = computed(() => {
  if (userPreferences?.hour12) {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 1 // Start from 1 to 12
      return {
        label: hour.toString().padStart(2, '0'),
        value: hour,
      }
    })
  } else {
    return Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i,
    }))
  }
})

// Generate minute options (same for both formats)
const getMinuteOptions = computed(() => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i,
  }))
})

// Generate second options (same for both formats)
const getSecondOptions = computed(() => {
  return Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i,
  }))
})

// AM/PM options for 12-hour format
const getPeriodOptions = computed(() => {
  return [
    { label: t('settlement.generate.form.time_format.am'), value: 'AM' },
    { label: t('settlement.generate.form.time_format.pm'), value: 'PM' },
  ]
})

// Handle hour selection based on format
const cutOffDateHour = computed({
  get: () => {
    if (userPreferences?.hour12 || false) {
      const hour24 = cutOffDatetime.value.hour
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      return {
        label: hour12.toString().padStart(2, '0'),
        value: hour12,
      }
    } else {
      return {
        label: cutOffDatetime.value.hour.toString().padStart(2, '0'),
        value: cutOffDatetime.value.hour,
      }
    }
  },
  set: (hour: { label: string; value: number }) => {
    if (userPreferences?.hour12 || false) {
      // Convert 12-hour to 24-hour format
      const period = cutOffDatePeriod.value.value
      let hour24 = hour.value
      if (period === 'AM' && hour.value === 12) {
        hour24 = 0
      } else if (period === 'PM' && hour.value !== 12) {
        hour24 = hour.value + 12
      }
      cutOffDatetime.value = cutOffDatetime.value.set({ hour: hour24 })
    } else {
      cutOffDatetime.value = cutOffDatetime.value.set({ hour: hour.value })
    }
  },
})

// Handle minute selection
const cutOffDateMinute = computed({
  get: () => ({
    label: cutOffDatetime.value.minute.toString().padStart(2, '0'),
    value: cutOffDatetime.value.minute,
  }),
  set: (minute: { label: string; value: number }) => {
    cutOffDatetime.value = cutOffDatetime.value.set({ minute: minute.value })
  },
})

// Handle second selection
const cutOffDateSecond = computed({
  get: () => ({
    label: cutOffDatetime.value.second.toString().padStart(2, '0'),
    value: cutOffDatetime.value.second,
  }),
  set: (second: { label: string; value: number }) => {
    cutOffDatetime.value = cutOffDatetime.value.set({ second: second.value })
  },
})

// Handle AM/PM selection for 12-hour format
const cutOffDatePeriod = computed({
  get: () => {
    const hour = cutOffDatetime.value.hour
    const period = hour >= 12 ? 'PM' : 'AM'
    const labelPeriod = t(`settlement.generate.form.time_format.${period.toLowerCase()}`)
    return { label: labelPeriod, value: period }
  },
  set: (period: { label: string; value: string }) => {
    const currentHour = cutOffDatetime.value.hour
    let newHour = currentHour

    if (period.value === 'AM' && currentHour >= 12) {
      newHour = currentHour - 12
    } else if (period.value === 'PM' && currentHour < 12) {
      newHour = currentHour + 12
    }

    cutOffDatetime.value = cutOffDatetime.value.set({ hour: newHour })
  },
})

// Format time display based on user preference
const formatTimeDisplay = computed(() => {
  if (!cutOffDatetime.value) return ''

  const date = cutOffDatetime.value.toDate(getLocalTimeZone())
  // Get locale base on current language
  const locale = i18nLocale.value || 'en-US'

  if (userPreferences?.hour12 || false) {
    return new DateFormatter(locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: true,
    }).format(date)
  } else {
    return new DateFormatter(locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: false,
    }).format(date)
  }
})

const items = computed<StepperItem[]>(() => [
  {
    value: 'Reconciliation',
    title: t('settlement.generate.steps.reconciliation.title'),
    description: t('settlement.generate.steps.reconciliation.description'),
    icon: 'i-lucide-check-square',
  },
  {
    value: 'Confirmation',
    title: t('settlement.generate.steps.confirmation.title'),
    description: t('settlement.generate.steps.confirmation.description'),
    icon: 'i-lucide-check-circle',
  },
])

const defaultSupplier = auth.currentProfile

const selectedSupplier = ref<{ label: string; value: SupplierProfile }>({
  label: `${defaultSupplier.value?.code} - ${defaultSupplier.value?.name}`,
  value: defaultSupplier.value!,
})

const cpoList = ref<Cpo[]>([])
const selectedCurrency = ref<{ label: string; value: CurrencyConfig } | undefined>(undefined)
const defaultCurrency: CurrencyConfig = {
  code: 'KHR',
  symbol: '៛',
  name: 'Cambodian Riel',
  decimals: 0,
  locale: 'km-KH',
}

const isConfirmModalShow = ref(false)
const openCutoffDateSelect = ref(false)
const isProcessWithMockupDate = false

// Store original date/time values for cancel functionality
const originalCutOffDatetime = ref<CalendarDateTime | null>(null)

// Helper function to restore original datetime values
const restoreOriginalDateTime = () => {
  if (originalCutOffDatetime.value) {
    cutOffDatetime.value = new CalendarDateTime(
      originalCutOffDatetime.value.year,
      originalCutOffDatetime.value.month,
      originalCutOffDatetime.value.day,
      originalCutOffDatetime.value.hour,
      originalCutOffDatetime.value.minute,
      originalCutOffDatetime.value.second
    )
  }
  originalCutOffDatetime.value = null
}

// Add currency options computed property
const currencyOptions = computed(() =>
  useCurrency().getAllCurrencies.value.map((currency) => ({
    label:
      currency.code === 'USD'
        ? t('settlement.generate.form.currency_options.usd_label')
        : currency.code === 'KHR'
          ? t('settlement.generate.form.currency_options.khr_label')
          : currency.name,
    value: currency,
  }))
)

// Set default currency based on user preferences
const setDefaultCurrency = () => {
  if (!selectedCurrency.value && (currencyOptions.value.length || 0) > 0) {
    // Try to find currency from user preferences
    const preferredCurrency = currencyOptions.value.find(
      (option) => option.value.code === userPreferences?.currency
    )

    if (preferredCurrency) {
      selectedCurrency.value = preferredCurrency
    } else {
      // Fall back to default currency if user preference currency is not available
      const fallbackCurrency = currencyOptions.value.find(
        (option) => option.value.code === defaultCurrency.code
      )
      selectedCurrency.value = fallbackCurrency || currencyOptions.value[0]
    }
  }
}

// Auto-load all CPOs (no manual selection needed)
const selectedCpo = ref<Cpo[]>([])

// Remove unused table configurations for sub biller selection
// const columns: TableColumn<Cpo>[] = []
// const rowPinning = ref({ top: [], bottom: [] })
// const sorting = ref([{ id: 'type', desc: false }])

const cpoSettlementColumns: TableColumn<Settlement>[] = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row }) => row.index + 1,
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  {
    accessorKey: 'cpo.code',
    header: () => t('settlement.generate.form.biller_code'),
    size: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const cpo = getCpoById(row.original.party_id)
      return cpo ? cpo.code : row.original.cpo.code
    },
  },
  {
    accessorKey: 'cpo.name',
    header: () => t('settlement.generate.form.biller_name'),
    size: 200,
    maxSize: 250,
    cell: ({ row }) => {
      const cpo = getCpoById(row.original.party_id)
      return cpo ? cpo.name : row.original.cpo.name
    },
  },

  {
    accessorKey: 'settlement_bank_id',
    header: () => t('settlement.generate.form.settle_to_bank'),
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: 'total_transactions',
    header: () => t('settlement.generate.form.total_transactions'),
    size: 80,
    cell: ({ row }) => {
      const transactions = row.original.transaction_allocations || []
      return transactions.length > 0 ? transactions.length : '-'
    },
  },

  {
    accessorKey: 'currency',
    header: () => t('settlement.generate.form.currency'),
    size: 80,
    maxSize: 80,
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, t('settlement.generate.form.amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatAmount(row.original.amount, row.original.currency || 'USD')
      ),
    size: 140,
    maxSize: 140,
  },
  {
    id: 'actions',
    header: () => t('settlement.generate.form.actions'),
    cell: ({ row }) => {
      const isCurrentlyViewing = selectedCpoSettlement.value?.party_id === row.original.party_id
      return h(resolveComponent('UButton'), {
        size: 'xs',
        color: isCurrentlyViewing ? 'neutral' : 'primary',
        variant: 'ghost',
        icon: 'i-lucide-eye',
        onClick: () => handleViewCpo(row.original),
      })
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
    maxSize: 100,
  },
]

const tranDetailsSorting = ref([
  {
    id: 'transaction_date',
    desc: true,
  },
])

const exportHeaders = computed(() =>
  cpoSettlementTransactionColumns
    .filter((col) => col.id !== 'row_number')
    .map((col) => ({
      key: String(col.id || ''),
      label:
        typeof col.header === 'string'
          ? col.header
          : (col.id ? String(col.id) : '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()),
    }))
)

const resolvedExportOptions = computed(() => ({
  fileName: `transaction-history-${Date.now()}`,
  title: `transaction-history-${Date.now()}`,
  subtitle: '',
  currency: selectedCpoSettlement.value?.currency,
  startDate: '',
  endDate: '',
  totalAmount: selectedCpoSettlement.value?.amount || 0,
}))

const cpoSettlementTransactionColumns: TableColumn<TransactionAllocation>[] = [
  {
    id: 'row_number',
    header: () => '#',
    // cell: ({ row }) => h('div', { class: 'text-left' }, row.index + 1)
    cell: ({ row, table }) => createRowNumberCell(row, table),
    size: 30,
    maxSize: 30,
    enableSorting: false,
  },
  {
    id: 'transaction_date',
    accessorKey: 'transaction_date',
    header: ({ column }) => createSortableHeader(column, t('settlement.generate.form.date')),
    size: 150,
    maxSize: 150,
    cell: ({ row }) => {
      return row.original.transaction_date
        ? useFormat().formatDateTime(row.original.transaction_date, {})
        : '-'
    },
    enableSorting: true,
    // sortDescFirst: true,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, t('settlement.generate.form.amount')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        useCurrency().formatCurrency(row.original.amount, row.original.currency_id || 'USD')
      ),
    size: 150,
    maxSize: 150,
  },
]

const stepper = ref<{
  next: () => void
  prev: () => void
  hasNext?: boolean
  hasPrev?: boolean
} | null>(null)
const listInquirySettlement = ref<SettlementInquiryResponse>()
const confirmSettlementResponse = ref<ConfirmSettlementResponse | null>(null)
const selectedCpoSettlement = ref<Settlement | null>(null)
function handleRowClick(_row: SettlementInquiryResponse) {
  // selectedCpo.value = row;
}

function handleViewCpo(cpo: Settlement) {
  // Replace with your logic, e.g., open a modal or navigate
  // alert(`View CPO: ${cpo.id} (${cpo.amount})`);
  selectedCpoSettlement.value = cpo
}

onMounted(async () => {
  // Set default currency based on user preferences
  setDefaultCurrency()
  // Auto-load CPOs with default supplier
  await loadSubBillers()
  // Auto-fetch inquiry settlement data after currency and CPOs are loaded
  if (selectedCurrency.value && selectedCpo.value.length > 0) {
    await fetchInquirySettlementCpo()
  }
})

// Watch for currency options changes to set default currency
watch(
  currencyOptions,
  () => {
    setDefaultCurrency()
  },
  { immediate: true }
)

// Watch for currency or cutoff date changes to auto-refresh settlement data
watch(
  selectedCurrency,
  async () => {
    if (selectedCurrency.value && cutOffDatetime.value && selectedCpo.value.length > 0) {
      await fetchInquirySettlementCpo()
    }
  },
  { deep: true }
)

// Update loadSubBillers to auto-load all CPOs
const loadSubBillers = async () => {
  isLoadingCpoList.value = true
  // Reset CPO list and selection when suppliers change
  cpoList.value = []
  selectedCpo.value = []

  // Use default supplier to get all CPOs
  const result = await supplierApi.getListCPOApi({
    parent_supplier_ids: [selectedSupplier.value.value.id],
  })

  // Prevent error if result is undefined
  if (result) {
    cpoList.value = result
    // Auto-select all CPOs by default
    selectedCpo.value = [...result]
  } else {
    cpoList.value = []
  }

  isLoadingCpoList.value = false
}

// Fetch inquiry settlement CPOs
const fetchInquirySettlementCpo = async () => {
  try {
    isLoadingInquiry.value = true
    const request: InitQuerySettlement = {
      parties:
        selectedCpo.value?.map((cpo) => ({
          id: cpo.id,
          type: '2',
        })) || [],
      main_supplier_id: selectedSupplier.value?.value.id || '',
      cutoff_date: cutOffDatetime.value
        ? cutOffDatetime.value.toDate('UTC').toISOString()
        : new Date().toISOString(),
      currency: selectedCurrency.value?.value.code || defaultCurrency.code,
    }

    const response = await supplierApi.getInquirySettlement(request)
    if (isProcessWithMockupDate) await new Promise((resolve) => setTimeout(resolve, 2000))
    listInquirySettlement.value = response || undefined
  } catch (error) {
    console.error('Failed to fetch CPOs:', error)
  } finally {
    isLoadingInquiry.value = false
  }
}

const router = useRouter()
const onConfirm = () => {
  router.push('/digital-wallet/settlement')
}

// Handle submit settlement function
const handleSubmitSettlement = async () => {
  try {
    const payload: ConfirmSettlementRequest = {
      settlement_token: listInquirySettlement.value?.token || '',
    }
    const response = await supplierApi.confirmSettlementAPI(payload)
    if (isProcessWithMockupDate) await new Promise((resolve) => setTimeout(resolve, 2000))
    // Check if response is valid
    if (response.error) {
      console.error('Error confirming settlement:', response.error)
      alert(`Error confirming settlement: ${response.error}`)
      return
    }
    if (response.data) {
      // Handle successful settlement submission
      console.log('Settlement submitted successfully:', response)
      confirmSettlementResponse.value = response.data // Store the response
      isConfirmModalShow.value = false // Close confirmation modal
      // Process to next step
      stepper.value?.next()
    } else {
      // Handle error in submission
      console.error('Settlement submission failed:', response)
    }
  } catch (error) {
    console.error('Failed to submit settlement:', error)
  }
}

// Get Cpo by cpo id
const getCpoById = (cpoId: string): Cpo | undefined => {
  return cpoList.value.find((cpo) => cpo.id === cpoId)
}

// Handle cutoff date confirmation
const onCutOffDateConfimed = async () => {
  // Clear original value to indicate confirmation
  originalCutOffDatetime.value = null
  openCutoffDateSelect.value = false
  // Auto-refresh settlement data when cutoff date is confirmed
  if (selectedCurrency.value && cutOffDatetime.value && selectedCpo.value.length > 0) {
    await fetchInquirySettlementCpo()
  }
}

// Handle cutoff date cancellation - restore original values
const onCutOffDateCancelled = () => {
  restoreOriginalDateTime()
  openCutoffDateSelect.value = false
}

// Watch for popup open/close to store/restore original values
watch(openCutoffDateSelect, (isOpen, wasOpen) => {
  if (isOpen && !wasOpen) {
    // Store original value when popup opens
    originalCutOffDatetime.value = cutOffDatetime.value
  } else if (!isOpen && wasOpen && originalCutOffDatetime.value) {
    // If popup closes and we still have an original value, it means the user
    // didn't confirm the changes (clicked outside, pressed ESC, etc.)
    restoreOriginalDateTime()
  }
})

definePageMeta({
  auth: true,
  middleware: ['auth'],
  breadcrumbs: [
    { label: 'settlement_menu', to: '/digital-wallet/settlement' },
    { label: 'generate_settlement', active: true },
  ],
})
</script>
<template>
  <div class="w-full h-full flex flex-col gap-3">
    <!-- PageHeader - Commented out since breadcrumb back button provides navigation -->
    <!-- <PageHeader
      :title="$t('pages.generate_settlement.title')"
      :subtitle="$t('pages.generate_settlement.description')"
    /> -->
    <div
      class="bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex-1 overflow-auto"
    >
      <UStepper ref="stepper" disabled :items="items" class="flex-1 h-full">
        <template #content="{ item }">
          <div class="flex flex-col h-full gap-2">
            <div class="flex-1 h-full overflow-y-auto">
              <!-- Step 1: Reconciliation with Cutoff Date and Currency Selection -->
              <div v-if="item.value === 'Reconciliation'" class="flex flex-col h-full gap-4">
                <!-- Cutoff Date and Currency Selection -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
                  <!-- Cutoff Date -->
                  <div>
                    <h1 class="text-sm mb-2 font-semibold">
                      {{ t('settlement.generate.form.select_cutoff_date') }}
                    </h1>
                    <UPopover v-model:open="openCutoffDateSelect" class="w-full">
                      <UButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-calendar"
                        size="sm"
                        class="w-full justify-start"
                      >
                        {{
                          cutOffDatetime
                            ? formatTimeDisplay
                            : t('settlement.generate.form.select_date')
                        }}
                      </UButton>
                      <template #content>
                        <div class="p-4 space-y-4 lg:min-w-96 sm:min-w-80">
                          <UCalendar v-model="cutOffDatetime" :max-value="now" />
                          <Divider />
                          <div>
                            <label class="block text-sm font-semibold mb-2">
                              {{ t('settlement.generate.form.select_time') }}
                            </label>
                            <div class="flex gap-2">
                              <USelectMenu
                                v-model="cutOffDateHour"
                                :items="getHourOptions"
                                :placeholder="t('settlement.generate.form.hour')"
                                class="flex-1"
                                size="sm"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-model="cutOffDateMinute"
                                :items="getMinuteOptions"
                                :placeholder="t('settlement.generate.form.minute')"
                                class="flex-1"
                                size="sm"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-model="cutOffDateSecond"
                                :items="getSecondOptions"
                                :placeholder="t('settlement.generate.form.second')"
                                class="flex-1"
                                size="sm"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-if="userPreferences?.hour12 || false"
                                v-model="cutOffDatePeriod"
                                :items="getPeriodOptions"
                                :placeholder="t('settlement.generate.form.am/pm')"
                                class="flex-1"
                                size="sm"
                                :search-input="false"
                              />
                            </div>
                          </div>
                          <Divider />
                          <!-- Action Buttons Footer -->
                          <div class="flex justify-end gap-2">
                            <UButton
                              variant="outline"
                              color="neutral"
                              size="sm"
                              @click="onCutOffDateCancelled"
                            >
                              {{ t('cancel') }}
                            </UButton>
                            <UButton size="sm" @click="onCutOffDateConfimed">
                              {{ t('confirm') }}
                            </UButton>
                          </div>
                        </div>
                      </template>
                    </UPopover>
                  </div>

                  <!-- Currency Selector -->
                  <div>
                    <h1 class="text-sm mb-2 font-semibold">
                      {{ t('settlement.generate.form.select_currency') }}
                    </h1>
                    <USelectMenu
                      v-model="selectedCurrency"
                      :items="currencyOptions"
                      option-attribute="value"
                      :placeholder="t('settlement.generate.form.choose_currency')"
                      class="w-full"
                      size="sm"
                      :search-input="false"
                    >
                      <template #leading>
                        <span class="mr-2 text-gray-500 font-medium">
                          {{ selectedCurrency?.value.symbol || '' }}
                        </span>
                      </template>
                    </USelectMenu>
                  </div>
                </div>

                <!-- Load Settlement Button or Auto-loading indicator -->
                <div class="flex justify-between items-center flex-shrink-0">
                  <div class="flex items-center gap-3">
                    <h3 class="text-sm font-semibold">
                      {{ t('settlement.generate.steps.reconciliation.title') }}
                    </h3>
                    <UButton
                      v-if="selectedCurrency && cutOffDatetime"
                      size="sm"
                      color="primary"
                      variant="outline"
                      icon="material-symbols:sync"
                      :loading="isLoadingInquiry"
                      @click="fetchInquirySettlementCpo"
                    >
                      {{ t('settlement.refresh') }}
                    </UButton>
                  </div>
                </div>
                <!-- Summary -->
                <CardsSummaryCards
                  :is-loading="isLoadingInquiry"
                  :skeleton-count="3"
                  :cards="[
                    {
                      title: t('settlement.generate.form.total_biller'),
                      values: [
                        {
                          value: listInquirySettlement?.settlements?.length || 0,
                        },
                      ],
                      dateRange: useFormat().formatDateTime(cutOffDatetime.toString()),
                      filterLabel: '',
                    },
                    {
                      title: t('settlement.generate.form.total_transactions'),
                      values: [
                        {
                          value:
                            listInquirySettlement?.settlements?.reduce(
                              (acc, curr) => acc + (curr.transaction_allocations?.length || 0),
                              0
                            ) || 0,
                        },
                      ],
                      dateRange: useFormat().formatDateTime(cutOffDatetime.toString()),
                      filterLabel: '',
                    },
                    {
                      title: t('settlement.generate.form.total_amount'),
                      values: [
                        {
                          value:
                            listInquirySettlement?.settlements?.reduce(
                              (acc, curr) => acc + (curr.amount || 0),
                              0
                            ) || 0,
                          currency: selectedCurrency?.value.code || defaultCurrency.code,
                        },
                      ],
                      dateRange: useFormat().formatDateTime(cutOffDatetime.toString()),
                      filterLabel: '',
                    },
                  ]"
                />
                <!-- Settlement List and Transaction Details -->
                <div class="flex flex-1 sm:flex-col lg:flex-row gap-6 min-h-0">
                  <!-- Master Table -->
                  <div
                    class="flex-2 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg min-h-0 bg-default"
                  >
                    <div class="h-full overflow-auto">
                      <!-- Table Skeleton -->
                      <TableShimmer v-if="isLoadingInquiry" :rows="5" :show-row-number="true" />
                      <!-- Actual Table -->
                      <UTable
                        v-else
                        ref="table"
                        :loading="false"
                        :data="listInquirySettlement?.settlements || []"
                        :columns="cpoSettlementColumns"
                        :ui="appConfig.ui.table.slots"
                        sticky
                        class="min-w-[800px] w-full h-full"
                        @row:click="handleRowClick"
                      >
                        <template #empty>
                          <EmptyState />
                        </template>
                      </UTable>
                    </div>
                  </div>

                  <!-- Detail Table -->
                  <Transition
                    name="slide-left"
                    enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-300 ease-in"
                    enter-from-class="transform translate-x-full opacity-0"
                    enter-to-class="transform translate-x-0 opacity-100"
                    leave-from-class="transform translate-x-0 opacity-100"
                    leave-to-class="transform translate-x-full opacity-0"
                    class="flex flex-col flex-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-h-0"
                  >
                    <div
                      v-if="
                        selectedCpoSettlement?.transaction_allocations &&
                        (selectedCpoSettlement.transaction_allocations.length || 0) > 0
                      "
                      class="flex flex-col h-full min-h-0 max-h-full"
                    >
                      <!-- Fixed Header -->
                      <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex justify-between items-center">
                          <h3 class="text-lg font-semibold">
                            {{ t('settlement.generate.form.transaction_history') }}
                          </h3>
                          <div class="flex gap-4">
                            <ButtonsExportButton
                              :data="selectedCpoSettlement.transaction_allocations"
                              :headers="exportHeaders"
                              :export-options="resolvedExportOptions"
                            />
                            <UButton
                              icon="i-lucide-x"
                              size="xs"
                              color="gray"
                              variant="ghost"
                              class="hover:bg-gray-100 transition-colors duration-200"
                              @click="selectedCpoSettlement = null"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Scrollable Table Container -->
                      <UTable
                        ref="table"
                        v-model:sorting="tranDetailsSorting"
                        :data="selectedCpoSettlement.transaction_allocations"
                        :columns="cpoSettlementTransactionColumns"
                        :ui="appConfig.ui.table.slots"
                        sticky
                        class="flex h-64 w-full animate-fade-in min-h-0 overflow-auto"
                      />

                      <!-- Fixed Footer -->
                      <div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
                        <SumTranDataUnderTable
                          :total-transactions="
                            selectedCpoSettlement.transaction_allocations?.length || 0
                          "
                          :amount="selectedCpoSettlement.amount"
                          :currency="selectedCpoSettlement.currency"
                        />
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Step 2: Settlement Request Success -->
              <div
                v-if="item.value === 'Confirmation'"
                class="flex flex-1 items-center justify-center h-full"
              >
                <div
                  class="w-10/12 h-10/12 bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow-sm items-center justify-center content-center"
                >
                  <UIcon name="i-lucide-check-circle" class="text-success text-6xl mb-4" />
                  <h2 class="text-2xl font-bold text-success mb-2">
                    {{ t('settlement.generate.form.settlement_request_successful') }}
                  </h2>
                  <p class="text-success mb-6">
                    {{ t('settlement.generate.form.settlement_request_message') }}
                  </p>
                  <UButton
                    color="primary"
                    class="w-24 justify-center"
                    size="md"
                    @click="onConfirm()"
                  >
                    {{
                      t('settlement.generate.form.done') ||
                      t('settlement.generate.form.back_to_list')
                    }}
                  </UButton>
                </div>
              </div>
            </div>
            <!-- Navigation Buttons -->
            <div class="flex-shrink-0 flex flex-row items-center justify-end">
              <div class="flex flex-col sm:flex-row justify-end gap-3">
                <UButton
                  v-if="item.title === t('settlement.generate.steps.reconciliation.title')"
                  :disabled="(listInquirySettlement?.settlements?.length || 0) === 0"
                  loading-auto
                  size="sm"
                  @click="isConfirmModalShow = true"
                >
                  {{ t('settlement.generate.form.confirm_settlement') }}
                </UButton>

                <!-- Show confirm modal to confirm settlement -->
                <UModal
                  v-if="item.title === t('settlement.generate.steps.reconciliation.title')"
                  transition
                  :open="isConfirmModalShow"
                  :close="false"
                  :title="t('settlement.generate.form.confirm_settlement_title')"
                >
                  <template #body>
                    <div class="flex flex-col items-center text-center py-6">
                      <!-- Icon with circle background using Bill24 colors -->
                      <div
                        class="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10"
                      >
                        <UIcon
                          name="i-material-symbols:help-outline-rounded"
                          class="text-3xl text-primary"
                        />
                      </div>

                      <!-- Question text -->
                      <h4 class="text-lg font-semibold mb-1">
                        {{ t('settlement.generate.form.confirm_settlement_message') }}
                      </h4>

                      <!-- Description text -->
                      <p class="max-w-md text-sm leading-relaxed" style="color: #b2aaa3">
                        {{ t('settlement.generate.form.confirm_settlement_description') }}
                      </p>
                    </div>
                  </template>
                  <template #footer>
                    <div class="flex justify-end gap-3 w-full">
                      <UButton
                        variant="outline"
                        size="sm"
                        style="border-color: #d0c8c1"
                        class="w-16 justify-center"
                        @click="isConfirmModalShow = false"
                      >
                        {{ t('settlement.generate.form.confirm_settlement_buttons.no') }}
                      </UButton>
                      <UButton
                        color="primary"
                        variant="solid"
                        size="sm"
                        loading-auto
                        @click="handleSubmitSettlement"
                      >
                        {{ t('settlement.generate.form.confirm_settlement_buttons.yes') }}
                      </UButton>
                    </div>
                  </template>
                </UModal>
              </div>
            </div>
          </div>
        </template>
      </UStepper>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* Enhanced master table animations */
.master-table-container {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

.master-table-container.with-detail {
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
}

.master-table-container.full-width {
  box-shadow: none;
}

/* Bill24 color for highlight effect */
.master-table-container:after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 3px;
  background-color: #43b3de;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.master-table-container.with-detail:after {
  opacity: 0.5;
}

/* Add smooth flex transitions */
.flex-2,
.flex-\[2\] {
  transition: flex 0.5s ease-in-out;
}
</style>
