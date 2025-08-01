<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { FeeModel, SharingSupplier, AlloCateDetail } from '~/models/settlement'
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'
import { useHelper } from '~/composables/utils/useHelper'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'settings.fee_config', to: '/settings/fee-config' },
    { label: 'create_new_fee', active: true },
  ],
})

// declare available
const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { formatAmount } = useHelper()

const feeModel = ref<FeeModel>({
  code: '',
  name: '',
  fee_type: '',
  currency: '',
  fee_details: [],
  allocate_details: [],
  allocation_rule_id: '',
  supplier_id: '',
  id: '',
})
const feeConfigApi = useFeeConfigApi()
const auth = useAuth()
const defaultSupplier = auth.currentProfile

// Form validation errors
const errors = reactive({
  code: '',
  name: '',
  fee_type: '',
  currency: '',
})

// Loading state
const loading = ref(true)
const saving = ref(false)

// Options
const feeTypeOptions = [
  { label: t('fixed_fee'), value: 'fixed' },
  { label: t('percentage_fee'), value: 'percentage' },
]

const currencyOptions = [
  { label: 'KHR - Cambodian Riel', value: 'KHR' },
  { label: 'USD - US Dollar', value: 'USD' },
]

const feeTypeSelection = ref<{ label: string; value: string }>({
  label: t('fixed_fee'),
  value: 'fixed',
})

const currencySelection = ref<{ label: string; value: string }>({
  label: 'KHR - Cambodian Riel',
  value: 'KHR',
})

// Form validation
const isFormValid = computed(() => {
  return (
    feeModel.value.code.trim() !== '' &&
    feeModel.value.name.trim() !== '' &&
    feeModel.value.fee_type !== '' &&
    feeModel.value.currency !== '' &&
    feeModel.value.fee_details.length > 0
  )
})

// Validation function
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!feeModel.value.code.trim()) {
    errors.code = t('code_required')
    isValid = false
  }

  if (!feeModel.value.name.trim()) {
    errors.name = t('name_required')
    isValid = false
  }

  if (!feeModel.value.fee_type) {
    errors.fee_type = t('fee_type_required')
    isValid = false
  }

  if (!feeModel.value.currency) {
    errors.currency = t('currency_required')
    isValid = false
  }

  return isValid
}

// Add sharing rule
const addSharingRow = () => {
  // Only allow adding rows for percentage fee type and limit to 10 records
  if (feeModel.value.fee_type === 'percentage') {
    if (feeModel.value.fee_details.length >= 10) {
      toast.add({
        title: t('validation_error'),
        description: t('maximum_10_fee_details_allowed'),
        color: 'error',
      })
      return
    }

    feeModel.value?.fee_details.push({
      start_amount: 0,
      end_amount: 0,
      fee_amount: 0,
      fee_rate: 0,
      fee_type: 'percentage',
    })
  }
}

// Remove sharing rule
const removeSharingRow = (index: number) => {
  feeModel.value?.fee_details.splice(index, 1)
}

// Save fee
const saveFee = async () => {
  if (!validateForm()) {
    return
  }

  if (feeModel.value?.fee_details.length === 0) {
    toast.add({
      title: t('validation_error'),
      description: t('at_least_one_fee_detail_required'),
      color: 'error',
    })
    return
  }

  saving.value = true
  try {
    // Prepare data for API
    const feeData: FeeModel = {
      code: feeModel.value.code,
      name: feeModel.value.name,
      fee_type: feeModel.value.fee_type,
      currency: feeModel.value.currency,
      fee_details: feeModel.value.fee_details,
      allocate_details: feeModel.value.allocate_details,
      allocation_rule_id: feeModel.value.allocation_rule_id,
      supplier_id: defaultSupplier.value?.id || '',
      id: feeModel.value.id || '',
    }
    console.log('Saving fee:', feeData)

    // Simulate API call
    const result = await feeConfigApi.createFeeConfig(feeData)
    if (result !== null && result.id !== '' && result.code !== '') {
      toast.add({
        title: t('success'),
        description: t('fee_created_successfully'),
        color: 'success',
      })

      // Navigate back to fee config page
      router.push('/settings/fee-config')
    } else {
      toast.add({
        title: t('error'),
        description: t('fee_already_exists'),
        color: 'error',
      })
      return
    }
  } catch (error) {
    console.error('Error saving fee:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_create_fee'),
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Watch for fee type selection changes
watch(
  feeTypeSelection,
  (newValue) => {
    feeModel.value.fee_type = newValue.value

    // Reset fee details when changing fee type
    if (newValue.value === 'fixed') {
      // For fixed fee, only one row with unlimited end amount
      feeModel.value.fee_details = [
        {
          start_amount: 0,
          end_amount: 0, // null represents unlimited
          fee_amount: 0,
          fee_rate: 0,
          fee_type: 'fixed',
        },
      ]
    } else {
      // For percentage fee, start with one empty row
      feeModel.value.fee_details = [
        {
          start_amount: 0,
          end_amount: 0,
          fee_amount: 0,
          fee_rate: 0,
          fee_type: 'percentage',
        },
      ]
    }
  },
  { immediate: true }
)

// Watch for currency selection changes
watch(
  currencySelection,
  (newValue) => {
    feeModel.value.currency = newValue.value
  },
  { immediate: true }
)

// Sharing value input handler
const handleSharingValueInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remove any non-numeric characters except decimal point
  value = value.replace(/[^0-9.]/g, '')

  const numValue = parseFloat(value)
  const allocateDetail = feeModel.value.allocate_details[index]

  if (!isNaN(numValue) && allocateDetail) {
    // Validation based on fee type
    if (feeModel.value.fee_type === 'percentage') {
      // For percentage, limit to 100
      if (numValue > 100) {
        toast.add({
          title: t('validation_error'),
          description: t('percentage_cannot_exceed_100'),
          color: 'error',
        })
        target.value = '100'
        allocateDetail.value = 100
        return
      }
    }

    allocateDetail.value = numValue
  } else if (value === '' && allocateDetail) {
    allocateDetail.value = 0
  }
}

// Fetch existing fee config
const fetchSharingSuppliers = async (): Promise<SharingSupplier[]> => {
  try {
    loading.value = true
    const result = await feeConfigApi.getAllSharingSupplier()
    return result
  } catch (error) {
    console.error('Error fetching fee config:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_load_fee_config'),
      color: 'error',
    })
    router.back()
  } finally {
    loading.value = false
  }
  return []
}

// Initialize with one sharing rule
onMounted(async () => {
  // Fetch existing sharing suppliers
  const sharingSuppliers = await fetchSharingSuppliers()
  const getAllocateList: AlloCateDetail[] = sharingSuppliers.map((sup) => ({
    editable: true,
    party_id: sup.id,
    name: sup.name,
    party_type: 1,
    value: 50, // Default sharing value
  }))

  // Set default Sharing fee and currency
  feeModel.value.allocate_details = [
    {
      editable: true,
      party_id: defaultSupplier.value?.id || '3904u39fu39u090f3f3',
      name: `${defaultSupplier.value?.name || 'Default Supplier'} (${t('you')})`,
      party_type: 1,
      value: 50,
    },
  ]

  // Add additional allocate details from sharing suppliers
  feeModel.value.allocate_details.push(...getAllocateList)

  // Initialize based on default fee type
  if (feeModel.value.fee_type === 'fixed') {
    feeModel.value.fee_details = [
      {
        start_amount: 0,
        end_amount: 0, // null represents unlimited
        fee_amount: 0,
        fee_rate: 0,
        fee_type: 'fixed',
      },
    ]
  } else {
    feeModel.value?.fee_details.push({
      start_amount: 0,
      end_amount: 1000,
      fee_amount: 10,
      fee_rate: 5,
      fee_type: 'percentage',
    })
  }
})

// Add handler for formatted amount inputs
const handleAmountInput = (event: Event, index: number, field: 'start_amount' | 'end_amount') => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remove all non-numeric characters except decimal point and minus sign
  value = value.replace(/[^\d.-]/g, '')

  // Ensure only one decimal point
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  // Ensure minus sign only at the beginning
  if (value.includes('-')) {
    const minusCount = (value.match(/-/g) || []).length
    if (minusCount > 1 || value.indexOf('-') !== 0) {
      value = value.replace(/-/g, '')
      if (value.charAt(0) !== '-') {
        value = '-' + value
      }
    }
  }

  // Update the input value to reflect filtered value
  target.value = value

  const numValue = parseFloat(value) || 0

  const feeDetail = feeModel.value.fee_details[index]
  if (feeDetail) {
    feeDetail[field] = numValue
  }
}

// Add handler for preventing non-numeric input in real-time
const handleNumericKeyPress = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  const input = event.target as HTMLInputElement
  const currentValue = input.value

  // Allow: backscape, delete, tab, escape, enter
  if (
    [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (event.keyCode === 65 && event.ctrlKey === true) ||
    (event.keyCode === 67 && event.ctrlKey === true) ||
    (event.keyCode === 86 && event.ctrlKey === true) ||
    (event.keyCode === 88 && event.ctrlKey === true)
  ) {
    return
  }

  // Ensure that it is a number or decimal point and stop the keypress
  if ((char < '0' || char > '9') && char !== '.') {
    event.preventDefault()
    return
  }

  // Only allow one decimal point
  if (char === '.' && currentValue.indexOf('.') !== -1) {
    event.preventDefault()
  }
}

// Event handler for fee amount/rate input
const handleFeeAmountInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remove any non-numeric characters except decimal point
  value = value.replace(/[^0-9.]/g, '')

  const numValue = parseFloat(value)
  const feeDetail = feeModel.value.fee_details[index]

  if (!isNaN(numValue) && feeDetail) {
    // Determine if this row is using percentage or fixed based on which field has a value
    const isPercentageType =
      feeDetail.fee_rate > 0 || (feeDetail.fee_amount === 0 && feeDetail.fee_rate === 0)

    if (isPercentageType && (feeDetail.fee_type == null || feeDetail.fee_type === 'percentage')) {
      // For percentage, limit to 100 and update fee_rate
      if (numValue > 100) {
        toast.add({
          title: t('validation_error'),
          description: t('percentage_cannot_exceed_100'),
          color: 'error',
        })
        target.value = '100'
        feeDetail.fee_rate = 100
        return
      }
      feeDetail.fee_rate = numValue
      feeDetail.fee_amount = 0 // Clear the other field
    } else {
      // For fixed value, update fee_amount
      if (
        (feeModel.value.fee_type === 'fixed' ||
          (feeDetail.fee_type !== null && feeDetail.fee_type === 'fixed')) &&
        feeDetail.end_amount > 0 &&
        numValue >= feeDetail.end_amount
      ) {
        toast.add({
          title: t('validation_error'),
          description: t('fee_amount_cannot_exceed_end_amount'),
          color: 'error',
        })
        target.value = String(feeDetail.end_amount - 1)
        feeDetail.fee_amount = feeDetail.end_amount - 1
        return
      }
      feeDetail.fee_amount = numValue
      feeDetail.fee_rate = 0 // Clear the other field
    }
  } else if (value === '' && feeDetail) {
    // Clear both fields when input is empty
    feeDetail.fee_amount = 0
  }
}

// Add validation for end amount changes
// const handleEndAmountInput = (event: Event, index: number) => {
//   const target = event.target as HTMLInputElement
//   const numValue = parseFloat(target.value)
//   const feeDetail = feeModel.value.fee_details[index]

//   if (!isNaN(numValue) && feeDetail) {
//     feeDetail.end_amount = numValue

//     // Check if fee amount is now >= end amount for fixed type
//     if (feeModel.value.fee_type === 'fixed' && feeDetail.fee_amount >= numValue) {
//       toast.add({
//         title: t('validation_error'),
//         description: t('fee_amount_adjusted_due_to_end_amount_change'),
//         color: 'warning',
//       })
//       feeDetail.fee_amount = Math.max(0, numValue - 1)
//     }
//   }
// }

// Handle fee detail type change (fixed/percentage)
const handleFeeDetailTypeChange = (index: number, value: string) => {
  const feeDetail = feeModel.value.fee_details[index]
  if (feeDetail) {
    // Store the current value before switching
    const currentValue = feeDetail.fee_amount || feeDetail.fee_rate || 0
    feeDetail.fee_type = value
    // If switching to percentage, move value to fee_rate and clear fee_amount
    if (value === 'percentage') {
      feeDetail.fee_rate = currentValue
      feeDetail.fee_amount = 0
    }
    // If switching to fixed, move value to fee_amount and clear fee_rate
    else if (value === 'fixed') {
      feeDetail.fee_amount = currentValue
      feeDetail.fee_rate = 0
    }
  }
}
</script>

<template>
  <div class="container mx-auto max-w-full px-1">
    <LoadingSpinner v-if="loading" fullscreen />
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <form class="space-y-8" @submit.prevent="saveFee">
          <!-- Basic Information Section -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-lucide-arrow-left"
                    size="xl"
                    class="mr-4 bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    @click="router.back()"
                  />
                  <div>
                    <h2
                      class="text-lg text-primary font-semibold dark:text-white flex items-center"
                    >
                      {{ t('title_create_fee') }}
                    </h2>
                    <p class="text-xxs text-gray-500 dark:text-gray-400 mt-1">
                      {{ t('description_create_fee') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Code Field -->
              <div class="space-y-2">
                <label
                  class="flex items-center text-xxs font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('code') }}
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <UInput
                  v-model="feeModel.code"
                  :placeholder="t('enter_fee_code')"
                  :error="!!errors.code"
                  required
                  size="sm"
                  class="transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent w-full"
                />
              </div>

              <!-- Name Field -->
              <div class="space-y-2">
                <label
                  class="flex items-center text-xxs font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('fee_name') }}
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <UInput
                  v-model="feeModel.name"
                  :placeholder="t('enter_fee_name')"
                  :error="!!errors.name"
                  required
                  size="sm"
                  class="transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent w-full"
                />
                <p
                  v-if="errors.name"
                  class="text-xxs text-red-600 dark:text-red-400 flex items-center"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ errors.name }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Fee Type -->
              <div class="space-y-2">
                <label
                  class="flex items-center text-xxs font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('fee_type') }}
                  <!-- <span class="text-red-500 ml-1">*</span> -->
                </label>
                <USelectMenu
                  v-model="feeTypeSelection"
                  :items="feeTypeOptions"
                  :placeholder="t('select_fee_type')"
                  :search-input="false"
                  option-attribute="label"
                  value-attribute="value"
                  size="sm"
                  class="transition-all duration-200 w-full"
                />
                <p
                  v-if="errors.fee_type"
                  class="text-xxs text-red-600 dark:text-red-400 flex items-center"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ errors.fee_type }}
                </p>
              </div>

              <!-- Currency -->
              <div class="space-y-2">
                <label
                  class="flex items-center text-xxs font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t('currency.label') }}
                  <!-- <span class="text-red-500 ml-1">*</span> -->
                </label>
                <USelectMenu
                  v-model="currencySelection"
                  :items="currencyOptions"
                  :placeholder="t('select_currency')"
                  :search-input="false"
                  option-attribute="label"
                  value-attribute="value"
                  size="sm"
                  class="transition-all duration-200 w-full"
                />
                <p
                  v-if="errors.currency"
                  class="text-xxs text-red-600 dark:text-red-400 flex items-center"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ errors.currency }}
                </p>
              </div>
            </div>
          </div>

          <!-- Two Tables Side by Side -->
          <div class="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
            <!-- Add New Fee Table - 60% -->
            <div class="xl:col-span-3 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-primary dark:text-white">
                  {{ t('charge_fee') }}
                </h3>
                <UButton
                  v-if="feeModel.fee_type === 'percentage'"
                  color="primary"
                  variant="outline"
                  icon="i-lucide-plus"
                  size="sm"
                  :disabled="feeModel.fee_details.length >= 10"
                  class="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  @click="addSharingRow"
                >
                  {{ t('add_fee') }}
                </UButton>
              </div>

              <div
                class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th
                          class="px-4 py-3 text-left text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('start_amount') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('end_amount') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('fee_amount') }}
                        </th>
                        <th
                          v-if="feeModel.fee_type === 'percentage'"
                          class="px-4 py-3 text-center text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider w-16"
                        >
                          {{ t('actions') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                      <tr
                        v-for="(feeSharing, index) in feeModel.fee_details"
                        :key="index"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td class="px-4 py-3">
                          <UInput
                            :model-value="
                              formatAmount(feeSharing.start_amount, feeModel.currency, {
                                showSymbol: false,
                              })
                            "
                            type="text"
                            :readonly="feeModel.fee_type === 'fixed' && index === 0"
                            class="w-full"
                            size="sm"
                            @input="handleAmountInput($event, index, 'start_amount')"
                            @keypress="!readonly && handleNumericKeyPress($event)"
                          />
                        </td>
                        <td class="px-4 py-3">
                          <UInput
                            v-if="feeModel.fee_type === 'percentage'"
                            :model-value="
                              formatAmount(feeSharing.end_amount, feeModel.currency, {
                                showSymbol: false,
                              })
                            "
                            type="text"
                            class="w-full"
                            size="sm"
                            @input="handleAmountInput($event, index, 'end_amount')"
                            @keypress="handleNumericKeyPress($event)"
                          />
                          <div v-else class="px-3 py-2 text-gray-600 dark:text-gray-400 italic">
                            {{ t('unlimited') }}
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <div class="flex gap-2 items-center">
                            <UInput
                              :model-value="
                                feeSharing.fee_rate > 0
                                  ? feeSharing.fee_rate.toString()
                                  : formatAmount(feeSharing.fee_amount, feeModel.currency, {
                                      showSymbol: false,
                                    })
                              "
                              type="text"
                              :placeholder="
                                feeSharing.fee_rate > 0
                                  ? '10.5'
                                  : formatAmount(1093, feeModel.currency, { showSymbol: false })
                              "
                              class="flex-1"
                              size="sm"
                              @input="handleFeeAmountInput($event, index)"
                            />
                            <USelectMenu
                              v-if="feeModel.fee_type === 'percentage'"
                              :model-value="{
                                label:
                                  feeSharing.fee_type === 'percentage'
                                    ? '%'
                                    : feeModel.currency === 'KHR'
                                      ? '៛'
                                      : '$',
                                value:
                                  feeSharing.fee_type === 'percentage' ? 'percentage' : 'fixed',
                              }"
                              :items="[
                                { label: feeModel.currency === 'KHR' ? '៛' : '$', value: 'fixed' },
                                { label: '%', value: 'percentage' },
                              ]"
                              option-attribute="label"
                              value-attribute="value"
                              :search-input="false"
                              class="w-24"
                              size="sm"
                              @update:model-value="handleFeeDetailTypeChange(index, $event.value)"
                            />
                          </div>
                        </td>
                        <td v-if="feeModel.fee_type === 'percentage'" class="px-4 py-3 text-center">
                          <UButton
                            color="error"
                            icon="i-lucide-trash-2"
                            size="sm"
                            variant="ghost"
                            @click="removeSharingRow(index)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Empty State for Fee Details -->
                  <div v-if="feeModel.fee_details.length === 0" class="p-8">
                    <TableEmptyState />
                  </div>
                </div>
              </div>
            </div>
            <!-- Vertical Divider -->
            <!-- <div class="hidden xl:flex xl:col-span-0 justify-center items-stretch min-h-full w-1">
              <div class="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
            </div> -->

            <!-- Fee Sharing Configuration Table - 40% -->
            <div class="xl:col-span-2 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-primary dark:text-white">
                    {{ t('sharing_fee') }}
                  </h3>
                  <UTooltip text="The fee value is set to match the charge fees">
                    <UIcon
                      name="i-lucide-info"
                      class="w-4 h-4 text-gray-600 hover:text-primary cursor-help transition-colors duration-200"
                    />
                  </UTooltip>
                </div>
              </div>

              <div
                class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th
                          class="px-4 py-3 text-left text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('name') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-xxs font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('fee_amount') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                      <tr
                        v-for="(sharing, index) in feeModel.allocate_details"
                        :key="index"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td class="px-4 py-3">
                          <div
                            class="px-3 py-1.5 text-xxs bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <span v-if="sharing.name.includes('(')">
                              {{ sharing.name.split('(')[0] }}
                              <span class="font-bold">({{ sharing.name.split('(')[1] }}</span>
                            </span>
                            <span v-else>{{ sharing.name }}</span>
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <UInput
                            v-model="sharing.value"
                            size="sm"
                            type="number"
                            :step="feeModel.fee_type === 'percentage' ? '0.01' : '0.01'"
                            :max="feeModel.fee_type === 'percentage' ? 100 : undefined"
                            :placeholder="feeModel.fee_type === 'percentage' ? '10.5' : '1093'"
                            :trailing-icon="
                              feeModel.fee_type === 'percentage' ? 'i-lucide-percent' : undefined
                            "
                            class="w-full text-xxs"
                            @input="handleSharingValueInput($event, index)"
                            @keypress="handleNumericKeyPress"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Empty State for Sharing Configuration -->
                  <div v-if="feeModel.allocate_details.length === 0" class="p-8">
                    <TableEmptyState />
                  </div>
                </div>
              </div>
              <!-- Note about Set value fee of Charge fees -->
              <!-- <div class="text-xxs text-gray-500 dark:text-gray-400 mt-2">
                <p><strong>Note:</strong> The fee value is set to match the charge fees.</p>
              </div> -->
            </div>
          </div>

          <!-- Form Actions -->
          <div
            class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <UButton
              color="primary"
              variant="outline"
              size="xs"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              @click="router.back()"
            >
              {{ t('cancel') }}
            </UButton>
            <UButton
              color="primary"
              type="submit"
              :loading="saving"
              :disabled="!isFormValid"
              size="xs"
              class="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <template v-if="!saving" #leading>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </template>
              {{ saving ? t('saving') : t('save') }}
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS animations and transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
