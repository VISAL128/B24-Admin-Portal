<template>
  <!-- Main Content Area -->
  <main class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Fee Configuration -->
    <div class="space-y-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-green-600" />
            <div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Fee Configuration</h2>
              <p class="text-gray-600 dark:text-gray-300">
                Configure fees for Bill24, Supplier (CSMS), and CPO entities
              </p>
            </div>
          </div>
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-rotate-ccw"
            @click="resetAllFees"
          >
            Reset All
          </UButton>
        </div>

        <!-- Fee Configuration List -->
        <div class="space-y-4 mb-8">
          <!-- Header -->
          <div
            class="grid grid-cols-12 gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
          >
            <div class="col-span-3">Entity</div>
            <div class="col-span-3">Fee Type</div>
            <div class="col-span-3">KHR Value</div>
            <div class="col-span-3">USD Value</div>
          </div>

          <!-- Fee Configuration Rows -->
          <div
            v-for="(config, key) in feeConfigs"
            :key="key"
            class="grid grid-cols-12 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <!-- Entity Name -->
            <div class="col-span-3 flex items-center space-x-3">
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm',
                  getEntityColor(config.entity),
                ]"
              >
                <UIcon :name="getEntityIcon(config.entity)" class="w-4 h-4" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ getEntityLabel(config.entity) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ config.entity === 'supplier' ? 'CSMS' : config.entity.toUpperCase() }}
                </div>
              </div>
            </div>

            <!-- Fee Type Selection -->
            <div class="col-span-3 flex items-center">
              <USelect
                v-model="config.type"
                :options="feeTypeOptions"
                option-value="value"
                option-label="label"
                placeholder="Select type"
                class="w-full"
                @change="validateFeeConfig(key)"
              />
            </div>

            <!-- KHR Value Input -->
            <div class="col-span-3 flex items-center">
              <UInput
                v-model="config.khrValue"
                type="number"
                :placeholder="config.type === 'fixed' ? '0' : '0.0'"
                :step="config.type === 'fixed' ? '1' : '0.01'"
                :min="0"
                :max="config.type === 'percentage' ? 100 : undefined"
                class="w-full"
                @input="validateFeeConfig(key)"
              >
                <template #trailing>
                  <span class="text-gray-500 text-sm">
                    {{ config.type === 'percentage' ? '%' : 'KHR' }}
                  </span>
                </template>
              </UInput>
            </div>

            <!-- USD Value Input -->
            <div class="col-span-3 flex items-center">
              <UInput
                v-model="config.usdValue"
                type="number"
                :placeholder="config.type === 'fixed' ? '0.00' : '0.0'"
                :step="config.type === 'fixed' ? '0.01' : '0.01'"
                :min="0"
                :max="config.type === 'percentage' ? 100 : undefined"
                class="w-full"
                @input="validateFeeConfig(key)"
              >
                <template #trailing>
                  <span class="text-gray-500 text-sm">
                    {{ config.type === 'percentage' ? '%' : 'USD' }}
                  </span>
                </template>
              </UInput>
            </div>
          </div>
        </div>

        <!-- Fee Summary Preview -->
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fee Summary Preview
          </h3>

          <!-- USD Preview -->
          <div class="mb-6">
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Example calculation based on a $100.00 USD transaction:
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-blue-600">Bill24</span>
                  <span class="font-bold">{{ calculatePreviewFee('bill24', 'USD', 100) }}</span>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-green-600">Supplier</span>
                  <span class="font-bold">{{ calculatePreviewFee('supplier', 'USD', 100) }}</span>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-purple-600">CPO</span>
                  <span class="font-bold">{{ calculatePreviewFee('cpo', 'USD', 100) }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between text-lg font-semibold">
                <span>Total Fees (USD):</span>
                <span class="text-red-600">{{ calculateTotalFees(100, 'USD') }}</span>
              </div>
              <div
                class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
              >
                <span>Net Amount (USD):</span>
                <span>{{ calculateNetAmount(100, 'USD') }}</span>
              </div>
            </div>
          </div>

          <!-- KHR Preview -->
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Example calculation based on a 400,000 KHR transaction:
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-blue-600">Bill24</span>
                  <span class="font-bold">{{ calculatePreviewFee('bill24', 'KHR', 400000) }}</span>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-green-600">Supplier</span>
                  <span class="font-bold">{{
                    calculatePreviewFee('supplier', 'KHR', 400000)
                  }}</span>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-purple-600">CPO</span>
                  <span class="font-bold">{{ calculatePreviewFee('cpo', 'KHR', 400000) }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between text-lg font-semibold">
                <span>Total Fees (KHR):</span>
                <span class="text-red-600">{{ calculateTotalFees(400000, 'KHR') }}</span>
              </div>
              <div
                class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
              >
                <span>Net Amount (KHR):</span>
                <span>{{ calculateNetAmount(400000, 'KHR') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between mt-8">
          <UButton
            :loading="isSaving"
            :disabled="isSaving"
            variant="outline"
            @click="resetToDefaults"
          >
            {{ $t('settings.reset_to_defaults') }}
          </UButton>
          <div class="flex items-center space-x-3">
            <UButton color="primary" variant="outline" @click="previewChanges">
              Preview Changes
            </UButton>
            <UButton
              color="primary"
              :disabled="!isValidConfiguration"
              :loading="isSaving"
              @click="saveFeeConfiguration"
            >
              Save Configuration
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserPreferences } from '~/models/userPreference'
// import { useFormat } from '~/composables/utils/useFormat'

definePageMeta({
  auth: true,
})

const { t, locale, setLocale } = useI18n()
type Option = { label: string; value: string }
const selectedLanguage = ref<Option>({ label: t('settings.languages.en'), value: 'en' })
const storage = useStorage<UserPreferences>()

const loadPreferences = (): UserPreferences => {
  const stored = storage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)
  return stored || DEFAULT_USER_PREFERENCES
}
const preferences = ref<UserPreferences>(loadPreferences())
const colorMode = useColorMode()

const isSaving = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)

watch(selectedLanguage, (newValue) => {
  if (newValue && newValue.value !== locale.value) {
    setLocale(newValue.value as 'en' | 'km')
  }
})
// Fee Configuration
const feeConfigs = ref([
  {
    entity: 'bill24',
    type: 'percentage',
    khrValue: '2.5',
    usdValue: '2.5',
  },
  {
    entity: 'supplier',
    type: 'fixed',
    khrValue: '12000',
    usdValue: '3.00',
  },
  {
    entity: 'cpo',
    type: 'percentage',
    khrValue: '1.0',
    usdValue: '1.0',
  },
])

// Options
const feeTypeOptions = [
  { value: 'fixed', label: 'Fixed Fee' },
  { value: 'percentage', label: 'Percentage Fee' },
]

// Helper Functions
const getEntityColor = (entity: string) => {
  switch (entity) {
    case 'bill24':
      return 'bg-blue-600'
    case 'supplier':
      return 'bg-green-600'
    case 'cpo':
      return 'bg-purple-600'
    default:
      return 'bg-gray-600'
  }
}

const getEntityIcon = (entity: string) => {
  switch (entity) {
    case 'bill24':
      return 'i-lucide-building-2'
    case 'supplier':
      return 'i-lucide-users'
    case 'cpo':
      return 'i-lucide-zap'
    default:
      return 'i-lucide-circle'
  }
}

const getEntityLabel = (entity: string) => {
  switch (entity) {
    case 'bill24':
      return 'Bill24 Fee'
    case 'supplier':
      return 'Supplier (CSMS) Fee'
    case 'cpo':
      return 'CPO Fee'
    default:
      return 'Unknown'
  }
}

// Validation
const validateFeeConfig = (index: number) => {
  const config = feeConfigs.value[index]
  if (!config) return false

  const khrValue = parseFloat(config.khrValue)
  const usdValue = parseFloat(config.usdValue)

  // Validate KHR value
  if (!config.khrValue || isNaN(khrValue)) {
    return false
  }

  if (khrValue < 0) {
    return false
  }

  if (config.type === 'percentage' && khrValue > 100) {
    return false
  }

  if (config.type === 'fixed' && khrValue > 999999999) {
    return false
  }

  // Validate USD value
  if (!config.usdValue || isNaN(usdValue)) {
    return false
  }

  if (usdValue < 0) {
    return false
  }

  if (config.type === 'percentage' && usdValue > 100) {
    return false
  }

  if (config.type === 'fixed' && usdValue > 999999) {
    return false
  }

  return true
}

// Debounced auto-save functionality
let saveTimeout: NodeJS.Timeout | null = null

const autoSavePreferences = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  saveTimeout = setTimeout(async () => {
    await savePreferences()
  }, 500) // 500ms delay to debounce rapid changes
}

const savePreferences = async () => {
  // Don't save if we're already saving
  if (isSaving.value) return

  isSaving.value = true
  showErrorMessage.value = false

  try {
    // Ensure the theme preference is synchronized with current color mode
    preferences.value.theme = colorMode.preference as 'light' | 'dark' | 'system'

    // Save to localStorage
    const success = storage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences.value)

    if (!success) {
      throw new Error('Failed to save preferences to localStorage')
    }

    // Show brief success message only for manual operations (like reset)
    // Auto-saves are silent to avoid being intrusive
  } catch (error) {
    console.error('Failed to save preferences:', error)
    showErrorMessage.value = true
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  } finally {
    isSaving.value = false
  }
}

let isInitialLoad = true
watch(
  preferences,
  () => {
    if (!isInitialLoad) {
      autoSavePreferences()
    }
  },
  { deep: true }
)

const resetToDefaults = async () => {
  // Temporarily disable auto-save during reset
  isInitialLoad = true

  setLocale(DEFAULT_LANGUAGE) // Reset to default language

  // Reset preferences to defaults
  preferences.value = { ...DEFAULT_USER_PREFERENCES }

  // Update color mode theme
  colorMode.preference = DEFAULT_USER_PREFERENCES.theme

  // Clear from localStorage
  storage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)

  // Save the reset preferences
  await savePreferences()

  // Refresh UI to reflect default values
  refreshUIAfterReset()
  // initializeSelectedOptions(preferences.value)

  // Re-enable auto-save after a brief delay
  setTimeout(() => {
    isInitialLoad = false
  }, 100)

  // Show success message for manual reset operation
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// Function to refresh UI elements after reset
const refreshUIAfterReset = () => {
  // Force refresh of all selected options to match default values
  // selectedLanguage.value = {
  //   label: t('settings.languages.en'),
  //   value: DEFAULT_LANGUAGE,
  // }
  // selectedDateFormat.value = {
  //   label: t('settings.date_format_short'),
  //   value: DEFAULT_USER_PREFERENCES.dateFormat,
  // }
  // selectedTimeFormat.value = {
  //   label: t('settings.time_format_short'),
  //   value: DEFAULT_USER_PREFERENCES.timeFormat,
  // }
  // selectedHourFormat.value = {
  //   label: DEFAULT_USER_PREFERENCES.hour12
  //     ? t('settings.hour_format_12h')
  //     : t('settings.hour_format_24h'),
  //   value: DEFAULT_USER_PREFERENCES.hour12 ? '12h' : '24h',
  // }
  // selectedCurrency.value = {
  //   label:
  //     DEFAULT_USER_PREFERENCES.currency === 'USD'
  //       ? t('settings.currencies.usd')
  //       : t('settings.currencies.khr'),
  //   value: DEFAULT_USER_PREFERENCES.currency,
  // }
  // // Force reactivity update by triggering a re-render
  // nextTick(() => {
  //   // Trigger computed properties to recalculate
  //   const _datePreview = getDatePreview.value
  //   const _timePreview = getTimePreview.value
  //   // Force update language-dependent labels
  //   initializeSelectedOptions(preferences.value)
  // })
}

const isValidConfiguration = computed(() => {
  return feeConfigs.value.every(
    (config) =>
      config.khrValue &&
      !isNaN(parseFloat(config.khrValue)) &&
      config.usdValue &&
      !isNaN(parseFloat(config.usdValue))
  )
})

// Fee Calculations
const calculatePreviewFee = (entity: string, currency: string, amount: number) => {
  const config = feeConfigs.value.find((c) => c.entity === entity)
  if (!config) return formatCurrency(0, currency)

  const value = parseFloat(currency === 'KHR' ? config.khrValue : config.usdValue)
  if (isNaN(value)) return formatCurrency(0, currency)

  let fee = 0
  if (config.type === 'fixed') {
    fee = value
  } else {
    fee = (amount * value) / 100
  }

  return formatCurrency(fee, currency)
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(amount)
}

const calculateTotalFees = (amount: number, currency: string) => {
  let totalFees = 0

  feeConfigs.value.forEach((config) => {
    const value = parseFloat(currency === 'KHR' ? config.khrValue : config.usdValue)
    if (!isNaN(value)) {
      if (config.type === 'fixed') {
        totalFees += value
      } else {
        totalFees += (amount * value) / 100
      }
    }
  })

  return formatCurrency(totalFees, currency)
}

const calculateNetAmount = (amount: number, currency: string) => {
  let totalFees = 0

  feeConfigs.value.forEach((config) => {
    const value = parseFloat(currency === 'KHR' ? config.khrValue : config.usdValue)
    if (!isNaN(value)) {
      if (config.type === 'fixed') {
        totalFees += value
      } else {
        totalFees += (amount * value) / 100
      }
    }
  })

  const netAmount = amount - totalFees
  return formatCurrency(netAmount, currency)
}

// Actions
const resetAllFees = () => {
  feeConfigs.value.forEach((config) => {
    config.type = 'percentage'
    config.khrValue = '0'
    config.usdValue = '0'
  })
}

const previewChanges = () => {
  // Show preview modal or navigate to preview page
  console.log('Preview changes:', feeConfigs.value)
}

const saveFeeConfiguration = async () => {
  if (!isValidConfiguration.value) return

  isSaving.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Here you would make actual API call to save configuration
    console.log('Saving fee configuration:', feeConfigs.value)

    // Show success notification
    // toast.success('Fee configuration saved successfully!')
  } catch (error) {
    console.error('Error saving fee configuration:', error)
    // toast.error('Failed to save fee configuration')
  } finally {
    isSaving.value = false
  }
}
</script>
