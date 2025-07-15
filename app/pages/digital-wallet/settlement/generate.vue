<script setup lang="ts">
import type { StepperItem, TableColumn } from '@nuxt/ui'
import { ref, onMounted } from 'vue'
import { useFormat } from '~/composables/utils/useFormat'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type {
  Cpo,
  SettlementInquiryResponse,
  Settlement,
  TransactionAllocation,
  ConfirmSettlementRequest,
  ConfirmSettlementResponse,
  InitQuerySettlement,
} from '~/models/settlement'
import type { CurrencyConfig } from '~/composables/utils/useCurrency'
import { CalendarDateTime, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
import { useCurrency } from '~/composables/utils/useCurrency'
import EmptyState from '~/components/TableEmptyState.vue'
import SumTranDataUnderTable from '~/components/tables/SumTranDataUnderTable.vue'
import type { SupplierProfile } from '~/models/supplier'
import { useTable } from '~/composables/utils/useTable'

const UButton = resolveComponent('UButton')

const supplierApi = useSupplierApi()
const auth = useAuth()
const { t, locale: i18nLocale } = useI18n()

// Load user preferences for time format
const userPreferences = useUserPreferences().getPreferences()
const { createSortableHeader, createRowNumberCell } = useTable<Settlement>()

const isLoadingCpoList = ref(false)

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
    value: 'Supplier',
    title: t('settlement.generate.steps.supplier.title'),
    description: t('settlement.generate.steps.supplier.description'),
    icon: 'i-lucide-users',
  },
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

const selectedSuppliers = ref<{ label: string; value: SupplierProfile }[]>([selectedSupplier.value])

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
const isProcessWithMockupDate = false

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

// Step 2 reconciliation
const selectedCpo = ref<Cpo[]>([])
const selectedCpoIds = ref<Set<string>>(new Set())

// Add search functionality
const searchQuery = ref('')

// Add computed property for filtered CPO list
const filteredCpoList = computed(() => {
  if (!searchQuery.value.trim()) {
    return cpoList.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return cpoList.value.filter(
    (cpo) =>
      cpo.code.toLowerCase().includes(query) ||
      cpo.name.toLowerCase().includes(query) ||
      cpo.email?.includes(query) ||
      cpo.address?.includes(query)
  )
})

// Add methods to handle selection
const isRowSelected = (cpo: Cpo) => {
  return selectedCpoIds.value.has(cpo.id)
}

const toggleRowSelection = (cpo: Cpo) => {
  if (selectedCpoIds.value.has(cpo.id)) {
    selectedCpoIds.value.delete(cpo.id)
    selectedCpo.value = selectedCpo.value.filter((item) => item.id !== cpo.id)
  } else {
    selectedCpoIds.value.add(cpo.id)
    selectedCpo.value.push(cpo)
  }
}

const toggleAllSelection = (selectAll: boolean) => {
  if (selectAll) {
    selectedCpoIds.value = new Set(cpoList.value.map((cpo) => cpo.id))
    selectedCpo.value = [...cpoList.value]
  } else {
    selectedCpoIds.value.clear()
    selectedCpo.value = []
  }
}

const isAllSelected = computed(() => {
  return (
    (cpoList.value.length || 0) > 0 && selectedCpoIds.value.size === (cpoList.value.length || 0)
  )
})

const isSomeSelected = computed(() => {
  return selectedCpoIds.value.size > 0 && selectedCpoIds.value.size < (cpoList.value.length || 0)
})

const columns: TableColumn<Cpo>[] = [
  {
    id: 'select',
    header: () =>
      h(resolveComponent('UCheckbox'), {
        modelValue: isSomeSelected.value ? 'indeterminate' : isAllSelected.value,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => toggleAllSelection(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(resolveComponent('UCheckbox'), {
        modelValue: isRowSelected(row.original),
        'onUpdate:modelValue': () => toggleRowSelection(row.original),
        'aria-label': 'Select row',
      }),
    enableSorting: false,
    enableHiding: false,
    // size: 40,
    // maxSize: 40
  },
  // {
  //   id: 'row_number',
  //   header: () => '#',
  //   cell: ({ row }) => h('div', { class: 'text-left' }, row.index + 1),
  //   size: 30,
  //   maxSize: 50,
  //   enableSorting: false,
  // },
  // {
  //   accessorKey: "parent_supplier.code",
  //   header: () => t("settlement.generate.form.supplier_code"),
  //   size: 120,
  //   maxSize: 120,
  // },
  // {
  //   accessorKey: "parent_supplier.name",
  //   header: () => t("settlement.generate.form.supplier_name"),
  //   size: 180,
  //   maxSize: 200,
  // },
  {
    accessorKey: 'code',
    header: () => t('settlement.generate.form.biller_code'),
    size: 120,
    maxSize: 120,
  },
  {
    accessorKey: 'name',
    header: () => t('settlement.generate.form.biller_name'),
    size: 200,
    maxSize: 250,
  },
  {
    accessorKey: 'type',
    header: () => {
      return t('settlement.generate.form.type')
      // const isSorted = column.getIsSorted()

      // return h(UButton, {
      //   color: 'neutral',
      //   variant: 'ghost',
      //   label: t('settlement.generate.form.type'),
      //   icon: isSorted
      //     ? isSorted === 'asc'
      //       ? 'i-solar:sort-from-top-to-bottom-bold'
      //       : 'i-solar:sort-from-bottom-to-top-outline'
      //     : 'i-lucide-arrow-up-down',
      //   class: '-mx-2.5',
      //   onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      // })
    },
    size: 130,
    maxSize: 130,
    sortDescFirst: true,
    sortingFn: (a, b) => {
      const typeA = a.original.type
      const typeB = b.original.type
      if (typeA === 'CSMS') return -1 // CSMS first
      if (typeB === 'CSMS') return 1 // CSMS first
      if (typeA === 'CPO' && typeB === 'CSMS') return -1 // CPO before CSMS
      if (typeB === 'CPO' && typeA === 'CSMS') return 1 // CPO before CSMS
      return typeA.localeCompare(typeB) // Default alphabetical sorting
    },
  },
  // {
  //   accessorKey: 'email',
  //   header: () => t('settlement.generate.form.email'),
  //   size: 200,
  //   maxSize: 250,
  // },
  // {
  //   accessorKey: "address",
  //   header: () => t("settlement.generate.form.address"),
  //   size: 200,
  //   maxSize: 300,
  // },
]

const rowPinning = ref({
  top: [],
  bottom: [],
})

const sorting = ref([
  {
    id: 'type',
    desc: false,
  },
])

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
    accessorKey: 'currency',
    header: () => t('settlement.generate.form.currency'),
    size: 80,
    maxSize: 80,
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
const currentStepIndex = ref(0)

// Computed property to validate if current step can proceed
const canProceedToNext = computed(() => {
  const currentStepTitle = items.value[currentStepIndex.value]?.title
  // Check if can proceed to Reconcile
  if (currentStepTitle === t('settlement.generate.steps.supplier.title')) {
    return (
      (selectedSuppliers.value.length || 0) > 0 &&
      cutOffDatetime.value !== null &&
      selectedCurrency.value !== undefined &&
      (selectedCpo.value.length || 0) > 0
    )
  }
  return true // Allow proceeding for other steps
})
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

onMounted(() => {
  // Set default currency based on user preferences
  setDefaultCurrency()
  // Auto-load CPOs with default supplier
  handleSupplierMenuChanged()
})

// Watch for currency options changes to set default currency
watch(
  currencyOptions,
  () => {
    setDefaultCurrency()
  },
  { immediate: true }
)

// Remove supplier-related reactive variables
// const supplierKeys = ref<Supplier[]>([])
// const isLoadingSupplier = ref(false)
// const selectedSuppliers = ref<{ label: string; value: Supplier }[]>([])
// const selectedSupplier = ref<{ label: string; value: Supplier } | undefined>(undefined)

// Remove supplier fetching logic
// const fetchSuppliers = async () => {
//   try {
//     isLoadingSupplier.value = true
//     supplierKeys.value = await supplierApi.getSuppliers()
//     if (isProcessWithMockupDate) {
//       // Simulate loading delay
//       await new Promise((resolve) => setTimeout(resolve, 2000))
//     }
//     await new Promise((resolve) => setTimeout(resolve, 2000))
//   } catch (error) {
//     console.error('Failed to fetch suppliers:', error)
//   } finally {
//     isLoadingSupplier.value = false
//   }
// }

// Update handleSupplierMenuChanged to work with default supplier
const handleSupplierMenuChanged = async () => {
  isLoadingCpoList.value = true
  // Reset CPO list and selection when suppliers change
  cpoList.value = []
  selectedCpo.value = []
  selectedCpoIds.value.clear()
  searchQuery.value = '' // Clear search when supplier changes

  // Use default supplier instead of checking selectedSupplier
  const result = await supplierApi.getListCPOApi({
    parent_supplier_ids: [selectedSupplier.value.value.id],
  })

  // Prevent error if result is undefined
  if (result) {
    cpoList.value = result
  } else {
    cpoList.value = []
  }

  // Auto-select all CPOs by default
  if ((cpoList.value.length || 0) > 0) {
    toggleAllSelection(true)
    selectedCpo.value = [...cpoList.value]
  }

  isLoadingCpoList.value = false
}

// Fetch inquiry settlement CPOs
const fetchInquirySettlementCpo = async () => {
  try {
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
    listInquirySettlement.value = response
  } catch (error) {
    console.error('Failed to fetch CPOs:', error)
  } finally {
    // Optionally handle loading state or errors
  }
}

const onReconciliationNext = async () => {
  await fetchInquirySettlementCpo()
  stepper.value?.next()
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

// Clear reconciliation data when going back to supplier selection
const clearReconciliationData = () => {
  listInquirySettlement.value = undefined
  selectedCpoSettlement.value = null
  confirmSettlementResponse.value = null
}

// Handle back navigation from reconciliation step
const handleBackToSupplierSelection = () => {
  clearReconciliationData()
  stepper.value?.prev()
}

// Get Cpo by cpo id
const getCpoById = (cpoId: string): Cpo | undefined => {
  return cpoList.value.find((cpo) => cpo.id === cpoId)
}

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'settlement_menu', to: '/digital-wallet/settlement' },
    { label: 'generate_settlement', active: true },
  ],
})

// function useWindowSize(): { height: Ref<number> } {
//   if (typeof window === 'undefined') {
//     return { height: ref(0) } // Return 0 if not in browser context
//   }
//   const height = ref(window.innerHeight)

//   const updateHeight = () => {
//     height.value = window.innerHeight
//   }

//   onMounted(() => {
//     window.addEventListener('resize', updateHeight)
//     updateHeight()
//   })

//   onUnmounted(() => {
//     window.removeEventListener('resize', updateHeight)
//   })

//   return { height }
// }

// function onCpoListTableSelect(row: TableRow<Cpo>, e?: Event) {
//   row.toggleSelected(!row.getIsSelected())
//   // Add row data to selectedCpo
//   if (row.getIsSelected()) {
//     selectedCpo.value.push(row.original)
//   } else {
//     selectedCpo.value = selectedCpo.value.filter(cpo => cpo.id !== row.original.id)
//   }
// }
</script>
<template>
  <div
    class="w-full h-full bg-white rounded-lg p-6 shadow-lg dark:bg-gray-800 dark:text-gray-200 flex flex-col"
  >
    <UStepper ref="stepper" disabled :items="items" class="flex-1">
      <template #content="{ item }">
        <div class="flex flex-col h-full">
          <div class="flex-1 h-full overflow-y-auto">
            <!-- Step 1: Sub Biller Selection -->
            <div v-if="item.value === 'Supplier'" class="h-[calc(100vh-320px)]">
              <div class="flex flex-col gap-4">
                <!-- <template #header>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
                    <div>
                      <h1 class="text-sm mb-2 font-semibold">
                        {{ t('settlement.generate.form.select_cutoff_date') }}
                      </h1>
                      <UPopover class="w-full">
                        <UButton
                          color="neutral"
                          variant="subtle"
                          icon="i-lucide-calendar"
                          class="w-full justify-start"
                        >
                          {{
                            cutOffDatetime
                              ? formatTimeDisplay
                              : t('settlement.generate.form.select_date')
                          }}
                        </UButton>
                        <template #content>
                          <div class="p-4 space-y-4">
                            <UCalendar v-model="cutOffDatetime" />
                            <div class="border-t pt-4">
                              <label class="block text-sm font-semibold mb-2">
                                {{ t('settlement.generate.form.select_time') }}
                              </label>
                              <div class="flex gap-2">
                                <USelectMenu
                                  v-model="cutOffDateHour"
                                  :items="getHourOptions"
                                  :placeholder="t('settlement.generate.form.hour')"
                                  class="flex-1"
                                  :search-input="false"
                                />
                                <USelectMenu
                                  v-model="cutOffDateMinute"
                                  :items="getMinuteOptions"
                                  :placeholder="t('settlement.generate.form.minute')"
                                  class="flex-1"
                                  :search-input="false"
                                />
                                <USelectMenu
                                  v-model="cutOffDateSecond"
                                  :items="getSecondOptions"
                                  :placeholder="t('settlement.generate.form.second')"
                                  class="flex-1"
                                  :search-input="false"
                                />
                                <USelectMenu
                                  v-if="userPreferences?.hour12 || false"
                                  v-model="cutOffDatePeriod"
                                  :items="getPeriodOptions"
                                  :placeholder="t('settlement.generate.form.am/pm')"
                                  class="flex-1"
                                  :search-input="false"
                                />
                              </div>
                            </div>
                          </div>
                        </template>
                      </UPopover>
                    </div>
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
                </template> -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
                  <!-- Cutoff Date -->
                  <div>
                    <h1 class="text-sm mb-2 font-semibold">
                      {{ t('settlement.generate.form.select_cutoff_date') }}
                    </h1>
                    <UPopover class="w-full">
                      <UButton
                        color="neutral"
                        variant="subtle"
                        icon="i-lucide-calendar"
                        class="w-full justify-start"
                      >
                        {{
                          cutOffDatetime
                            ? formatTimeDisplay
                            : t('settlement.generate.form.select_date')
                        }}
                      </UButton>
                      <template #content>
                        <div class="p-4 space-y-4">
                          <UCalendar v-model="cutOffDatetime" />
                          <div class="border-t pt-4">
                            <label class="block text-sm font-semibold mb-2">
                              {{ t('settlement.generate.form.select_time') }}
                            </label>
                            <div class="flex gap-2">
                              <USelectMenu
                                v-model="cutOffDateHour"
                                :items="getHourOptions"
                                :placeholder="t('settlement.generate.form.hour')"
                                class="flex-1"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-model="cutOffDateMinute"
                                :items="getMinuteOptions"
                                :placeholder="t('settlement.generate.form.minute')"
                                class="flex-1"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-model="cutOffDateSecond"
                                :items="getSecondOptions"
                                :placeholder="t('settlement.generate.form.second')"
                                class="flex-1"
                                :search-input="false"
                              />
                              <USelectMenu
                                v-if="userPreferences?.hour12 || false"
                                v-model="cutOffDatePeriod"
                                :items="getPeriodOptions"
                                :placeholder="t('settlement.generate.form.am/pm')"
                                class="flex-1"
                                :search-input="false"
                              />
                            </div>
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
                <!-- Cpo List Table -->
                <div class="flex flex-col flex-1 min-h-0">
                  <div
                    class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 flex-shrink-0"
                  >
                    <h1 class="text-sm font-semibold flex-shrink-0">
                      {{ t('settlement.generate.form.biller_list') }} ({{
                        filteredCpoList.length || 0
                      }})
                      <span
                        v-if="
                          searchQuery && (filteredCpoList.length || 0) !== (cpoList.length || 0)
                        "
                        class="text-gray-500"
                      >
                        of {{ cpoList.length || 0 }}
                      </span>
                    </h1>

                    <!-- Search Input -->
                    <div class="w-full sm:w-64 flex-shrink-0">
                      <UInput
                        v-model="searchQuery"
                        icon="i-lucide-search"
                        :placeholder="t('settlement.generate.form.search_biller')"
                        class="w-full"
                        :trailing="searchQuery ? true : false"
                      >
                        <template v-if="searchQuery" #trailing>
                          <UButton
                            icon="i-lucide-x"
                            size="xs"
                            color="gray"
                            variant="ghost"
                            @click="searchQuery = ''"
                          />
                        </template>
                      </UInput>
                    </div>
                  </div>

                  <!-- Table Container with proper responsive overflow handling -->
                  <div
                    class="flex-1 min-h-0 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div class="h-full overflow-auto">
                      <UTable
                        ref="table"
                        v-model:sorting="sorting"
                        v-model:row-pinning="rowPinning"
                        :data="filteredCpoList"
                        :columns="columns"
                        :loading="isLoadingCpoList"
                        :loading-animation="TABLE_CONSTANTS.LOADING_ANIMATION"
                        :loading-color="TABLE_CONSTANTS.LOADING_COLOR"
                        sticky
                        class="min-w-[800px] w-full"
                        @row:click="(row: Cpo) => toggleRowSelection(row)"
                      >
                        <template #empty>
                          <EmptyState />
                        </template>
                      </UTable>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Reconciliation -->
            <div v-if="item.value === 'Reconciliation'">
              <div class="flex flex-col lg:flex-row gap-6 mb-4 mt-4 h-[calc(100vh-320px)]">
                <!-- Master Table -->
                <div
                  class="flex-2 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg min-h-0"
                >
                  <div class="overflow-x-auto h-full">
                    <UTable
                      ref="table"
                      :data="listInquirySettlement?.settlements || []"
                      :columns="cpoSettlementColumns"
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
                >
                  <div
                    v-if="
                      selectedCpoSettlement?.transaction_allocations &&
                      (selectedCpoSettlement.transaction_allocations.length || 0) > 0
                    "
                    class="lg:w-1/3 lg:flex-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col min-h-0 max-h-full"
                  >
                    <!-- Fixed Header -->
                    <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                      <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">
                          {{ t('settlement.generate.form.transaction_history') }}
                        </h3>
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

                    <!-- Scrollable Table Container -->
                    <div class="flex-1 min-h-0 overflow-hidden">
                      <div class="h-full overflow-auto">
                        <UTable
                          ref="table"
                          v-model:sorting="tranDetailsSorting"
                          :data="selectedCpoSettlement.transaction_allocations"
                          :columns="cpoSettlementTransactionColumns"
                          sticky
                          class="w-full animate-fade-in"
                        />
                      </div>
                    </div>

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

            <!-- Step 3: Settlement Request Success -->
            <div
              v-if="item.value === 'Confirmation'"
              class="flex flex-1 items-center justify-center mt-6"
            >
              <div
                class="w-10/12 h-10/12 bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow-sm items-center justify-center content-center"
              >
                <UIcon name="i-lucide-check-circle" class="text-green-500 text-6xl mb-4" />
                <h2 class="text-2xl font-bold text-green-700 mb-2">
                  {{ t('settlement.generate.form.settlement_request_successful') }}
                </h2>
                <p class="text-green-700 mb-6">
                  {{ t('settlement.generate.form.settlement_request_message') }}
                </p>
                <UButton color="primary" size="lg" @click="onConfirm()">
                  {{
                    t('settlement.generate.form.done') || t('settlement.generate.form.back_to_list')
                  }}
                </UButton>
              </div>
            </div>
          </div>
          <!-- Navigation Buttons -->
          <div
            class="flex-shrink-0 flex flex-row items-center"
            :class="item.value === 'Supplier' ? 'justify-between' : 'justify-end'"
          >
            <div v-if="item.value === 'Supplier'">
              <p class="text-sm text-gray-500">
                {{ selectedCpo.length || 0 }} of {{ cpoList.length || 0 }} {{ t('row_selected') }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <UButton
                v-if="item.title === t('settlement.generate.steps.reconciliation.title')"
                :disabled="!stepper?.hasPrev"
                @click="handleBackToSupplierSelection"
              >
                {{ t('settlement.generate.form.back') }}
              </UButton>

              <UButton
                v-if="item.title === t('settlement.generate.steps.supplier.title')"
                :disabled="!stepper?.hasNext || !canProceedToNext"
                loading-auto
                @click="onReconciliationNext"
              >
                {{ t('settlement.generate.form.reconcile_settle') }}
              </UButton>
              <!-- Show confirm modal to confirm settlement -->
              <UModal
                v-if="
                  item.title === t('settlement.generate.steps.reconciliation.title') //&& showConfirmModal
                "
                transition
                :open="isConfirmModalShow"
                :close="false"
                :title="t('settlement.generate.form.confirm_settlement_title')"
                :body="t('settlement.generate.form.confirm_settlement_body')"
              >
                <UButton
                  :disabled="(listInquirySettlement?.settlements?.length || 0) === 0"
                  :label="t('settlement.generate.form.confirm_settlement')"
                  @click="isConfirmModalShow = true"
                />

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
                      style="border-color: #d0c8c1"
                      class="w-16 justify-center"
                      @click="isConfirmModalShow = false"
                    >
                      {{ t('settlement.generate.form.confirm_settlement_buttons.no') }}
                    </UButton>
                    <UButton
                      color="primary"
                      variant="solid"
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
