<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { FeeModel } from '~/models/settlement'
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'
import { useHelper } from '~/composables/utils/useHelper'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'settings.fee_config', to: '/settings/fee-config' },
    { label: 'edit_fee', active: true },
  ],
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const feeConfigApi = useFeeConfigApi()
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

// Form validation errors
const errors = reactive({
  code: '',
  name: '',
  fee_type: '',
  currency: '',
})

// Loading states
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
  label: t('KHR - Cambodian Riel'),
  value: 'KHR',
})

// Fetch existing fee config
const fetchFeeConfig = async () => {
  try {
    loading.value = true
    const feeId = route.params.id as string
    const response = await feeConfigApi.findFeeConfigById({ id: feeId })

    if (response) {
      feeModel.value = response

      // Set selections based on fetched data
      feeTypeSelection.value = (feeTypeOptions.find((opt) => opt.value === response.fee_type) ||
        feeTypeOptions[0]) ?? { label: t('fixed_fee'), value: 'fixed' }
      currencySelection.value = (currencyOptions.find((opt) => opt.value === response.currency) ||
        currencyOptions[0]) ?? { label: 'KHR - Cambodian Riel', value: 'KHR' }
    }
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
}

// // Add validation for end amount changes
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

// Add/Remove fee rows
const addSharingRow = () => {
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
    })
  }
}

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
      supplier_id: feeModel.value.supplier_id || '',
      id: feeModel.value.id || '',
    }
    await feeConfigApi.updateFeeConfig(feeData)

    toast.add({
      title: t('success'),
      description: t('fee_updated_successfully'),
      color: 'success',
    })

    router.push('/settings/fee-config')
  } catch (error) {
    console.error('Error updating fee:', error)
    toast.add({
      title: t('error'),
      description: t('failed_to_update_fee'),
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Event handlers
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

// Add new handler for formatted amount inputs
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

// Watch for changes
watch(
  feeTypeSelection,
  (newValue) => {
    feeModel.value.fee_type = newValue.value
  },
  { immediate: true }
)

watch(
  currencySelection,
  (newValue) => {
    feeModel.value.currency = newValue.value
  },
  { immediate: true }
)

onMounted(() => {
  fetchFeeConfig()
})
</script>

<template>
  <div class="container mx-auto max-w-full px-1">
    <LoadingSpinner v-if="loading" fullscreen />

    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <form class="space-y-8" @submit.prevent="saveFee">
          <!-- Header -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
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
                <h2 class="text-lg text-primary font-semibold dark:text-white">
                  {{ t('edit_fee') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ t('edit_fee_description') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('code') }}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <UInput
                v-model="feeModel.code"
                :placeholder="t('enter_fee_code')"
                :error="!!errors.code"
                required
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('fee_name') }}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <UInput
                v-model="feeModel.name"
                :placeholder="t('enter_fee_name')"
                :error="!!errors.name"
                required
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('fee_type') }}
              </label>
              <USelectMenu
                v-model="feeTypeSelection"
                :items="feeTypeOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('currency') }}
              </label>
              <USelectMenu
                v-model="currencySelection"
                :items="currencyOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-full"
              />
            </div>
          </div>

          <!-- Two Tables Side by Side -->
          <div class="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
            <!-- Charge Fee Table -->
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
                          class="px-4 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('start_amount') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('end_amount') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('fee_amount') }}
                        </th>
                        <th
                          v-if="feeModel.fee_type === 'percentage'"
                          class="px-4 py-3 text-center text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider w-16"
                        >
                          {{ t('actions') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                      <tr
                        v-for="(feeSharing, index) in feeModel.fee_type === 'fixed'
                          ? feeModel.fee_details.slice(0, 1)
                          : feeModel.fee_details"
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
                              @input="handleFeeAmountInput($event, index)"
                              @keypress="handleNumericKeyPress($event)"
                            />
                            <USelectMenu
                              v-if="feeModel.fee_type === 'percentage'"
                              :model-value="{
                                label:
                                  feeSharing.fee_rate > 0 || feeSharing.fee_type === 'percentage'
                                    ? '%'
                                    : feeModel.currency === 'KHR'
                                      ? '៛'
                                      : '$',
                                value:
                                  feeSharing.fee_rate > 0 || feeSharing.fee_type === 'percentage'
                                    ? 'percentage'
                                    : 'fixed',
                              }"
                              :items="[
                                { label: feeModel.currency === 'KHR' ? '៛' : '$', value: 'fixed' },
                                { label: '%', value: 'percentage' },
                              ]"
                              option-attribute="label"
                              value-attribute="value"
                              :search-input="false"
                              class="w-24"
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
                </div>
              </div>
            </div>

            <!-- Sharing Fee Table -->
            <div class="xl:col-span-2 space-y-4">
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

              <div
                class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th
                          class="px-4 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider"
                        >
                          {{ t('name') }}
                        </th>
                        <th
                          class="px-4 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider"
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
                            class="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
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
                            :model-value="
                              feeModel.fee_type === 'percentage'
                                ? sharing.value.toString()
                                : formatAmount(sharing.value, feeModel.currency, {
                                    showSymbol: false,
                                  })
                            "
                            type="text"
                            :placeholder="
                              feeModel.fee_type === 'percentage'
                                ? '10.5'
                                : formatAmount(1093, feeModel.currency, { showSymbol: false })
                            "
                            :trailing-icon="
                              feeModel.fee_type === 'percentage' ? 'i-lucide-percent' : undefined
                            "
                            class="w-full text-sm"
                            @input="handleSharingValueInput($event, index)"
                            @keypress="handleNumericKeyPress($event)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div
            class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <UButton color="primary" variant="outline" @click="router.back()">
              {{ t('cancel') }}
            </UButton>
            <UButton
              color="primary"
              type="submit"
              :loading="saving"
              :disabled="!isFormValid"
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
              {{ saving ? t('saving') : t('update') }}
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
