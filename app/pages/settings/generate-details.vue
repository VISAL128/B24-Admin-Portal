<script setup lang="ts">
import { DEFAULT_PAGE_SIZE_OPTIONS, LOCAL_STORAGE_KEYS } from '~/utils/constants'
import type { UserPreferences } from '~/models/userPreference'
import { useFormat } from '~/composables/utils/useFormat'

definePageMeta({
  auth: true,
})

const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()

useHead({
  title: `${t('settings.title')} - Bill24 Payment Portal`,
})

const isSaving = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)

// Initialize storage composable
const storage = useStorage<UserPreferences>()

type Option = { label: string; value: string }
type OptionNumber = { label: string; value: number }
type DateAndTimeOption = { label: string; value: 'short' | 'medium' | 'long' | 'full' }

const selectedLanguage = ref<Option>({ label: t('settings.languages.en'), value: 'en' })
const selectedDateFormat = ref<DateAndTimeOption>({
  label: t('settings.date_format_short'),
  value: 'short',
})
const selectedTimeFormat = ref<DateAndTimeOption>({
  label: t('settings.time_format_short'),
  value: 'short',
})
const selectedHourFormat = ref<Option>({ label: t('settings.hour_format_12h'), value: '12h' })
const selectedCurrency = ref<Option>({ label: t('settings.currencies.usd'), value: 'USD' })
const selectedPageSize = ref<OptionNumber>(DEFAULT_PAGE_SIZE)
const autoRefreshInterval = ref<number>(30)

// Load preferences from localStorage or use defaults
const loadPreferences = (): UserPreferences => {
  const stored = storage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)
  return stored || DEFAULT_USER_PREFERENCES
  // const basePreferences = stored
  //   ? { ...DEFAULT_USER_PREFERENCES, ...stored }
  //   : { ...DEFAULT_USER_PREFERENCES }

  // // Sync theme with current color mode
  // basePreferences.theme = colorMode.preference as 'light' | 'dark' | 'system'
  // basePreferences.dateFormat = selectedDateFormat.value.value || 'short'
  // basePreferences.timeFormat = selectedTimeFormat.value.value || 'short'
  // return basePreferences
}

const preferences = ref<UserPreferences>(loadPreferences())

// Make language options reactive to locale changes
const languageOptions = computed<Option[]>(() => [
  { value: 'en', label: t('settings.languages.en') },
  { value: 'km', label: t('settings.languages.km') },
])

const dateFormatOptions = computed(() => [
  { value: 'short', label: t('settings.date_format_short') },
  { value: 'medium', label: t('settings.date_format_medium') },
  { value: 'long', label: t('settings.date_format_long') },
  { value: 'full', label: t('settings.date_format_full') },
])

const timeFormatOptions = computed(() => [
  { value: 'short', label: t('settings.time_format_short') },
  { value: 'medium', label: t('settings.time_format_medium') },
  { value: 'long', label: t('settings.time_format_long') },
  { value: 'full', label: t('settings.time_format_full') },
  // { value: '24h', label: t('settings.time_format_24h') },
  // { value: '12h', label: t('settings.time_format_12h') }
])

const hourFormatOptions = computed(() => [
  { value: '12h', label: t('settings.hour_format_12h') },
  { value: '24h', label: t('settings.hour_format_24h') },
])

const currencyOptions = computed(() => [
  { value: 'KHR', label: t('settings.currencies.khr') },
  { value: 'USD', label: t('settings.currencies.usd') },
])

const pageSizeOptions = computed(() => DEFAULT_PAGE_SIZE_OPTIONS)

// Watch for theme changes and update color mode
watch(
  () => preferences.value.theme,
  (newTheme) => {
    if (newTheme !== colorMode.preference) {
      colorMode.preference = newTheme
    }
  }
)

watch(
  () => colorMode.preference,
  (newTheme) => {
    // Update preferences when color mode changes
    if (preferences.value.theme !== newTheme) {
      preferences.value.theme = newTheme as 'light' | 'dark' | 'system'
      savePreferences()
    }
  }
)

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

// Auto-save preferences when any preference changes (except during initial load)
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

// Preview functions for selected formats
const getDatePreview = computed(() => {
  const now = new Date()
  return useFormat().formatDate(now, {
    dateStyle: preferences.value.dateFormat,
  })

  // switch (preferences.value.dateFormat) {
  //   case 'DD/MM/YYYY':
  //     return `${day}/${month}/${year}`
  //   case 'MM/DD/YYYY':
  //     return `${month}/${day}/${year}`
  //   case 'YYYY-MM-DD':
  //     return `${year}-${month}-${day}`
  //   default:
  //     return `${day}/${month}/${year}`
  // }
})

const getTimePreview = computed(() => {
  const now = new Date()
  return useFormat().formatTime(now, {
    timeStyle: preferences.value.timeFormat,
    hour12: preferences.value.hour12,
  })

  // if (preferences.value.timeFormat === '24h') {
  //   const hours = String(now.getHours()).padStart(2, '0')
  //   const minutes = String(now.getMinutes()).padStart(2, '0')
  //   return `${hours}:${minutes}`
  // } else {
  //   const hours = now.getHours()
  //   const minutes = String(now.getMinutes()).padStart(2, '0')
  //   const period = hours >= 12 ? t('settings.pm') : t('settings.am')
  //   const displayHours = hours % 12 || 12
  //   return `${displayHours}:${minutes} ${period}`
  // }
})

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
  selectedLanguage.value = {
    label: t('settings.languages.en'),
    value: DEFAULT_LANGUAGE,
  }

  selectedDateFormat.value = {
    label: t('settings.date_format_short'),
    value: DEFAULT_USER_PREFERENCES.dateFormat,
  }

  selectedTimeFormat.value = {
    label: t('settings.time_format_short'),
    value: DEFAULT_USER_PREFERENCES.timeFormat,
  }

  selectedHourFormat.value = {
    label: DEFAULT_USER_PREFERENCES.hour12
      ? t('settings.hour_format_12h')
      : t('settings.hour_format_24h'),
    value: DEFAULT_USER_PREFERENCES.hour12 ? '12h' : '24h',
  }

  selectedCurrency.value = {
    label:
      DEFAULT_USER_PREFERENCES.currency === 'USD'
        ? t('settings.currencies.usd')
        : t('settings.currencies.khr'),
    value: DEFAULT_USER_PREFERENCES.currency,
  }

  selectedPageSize.value = {
    label: DEFAULT_USER_PREFERENCES.defaultPageSize.toString(),
    value: DEFAULT_USER_PREFERENCES.defaultPageSize,
  }

  autoRefreshInterval.value = DEFAULT_USER_PREFERENCES.autoRefreshInterval

  // Force reactivity update by triggering a re-render
  nextTick(() => {
    // Trigger computed properties to recalculate
    const _datePreview = getDatePreview.value
    const _timePreview = getTimePreview.value

    // Force update language-dependent labels
    initializeSelectedOptions(preferences.value)
  })
}

// Initialize selected options based on current preferences
const initializeSelectedOptions = (loadedPref: UserPreferences) => {
  // Find the matching option objects for each preference
  selectedLanguage.value = {
    label: locale.value === 'en' ? t('settings.languages.en') : t('settings.languages.km'),
    value: locale.value,
  }

  selectedCurrency.value = {
    label:
      loadedPref.currency === 'USD' ? t('settings.currencies.usd') : t('settings.currencies.khr'),
    value: loadedPref.currency,
  }

  selectedDateFormat.value = {
    label:
      dateFormatOptions.value.find((option) => option.value === loadedPref.dateFormat)?.label ||
      t('settings.date_format_short'),
    value: loadedPref.dateFormat,
  }

  selectedTimeFormat.value = {
    label:
      timeFormatOptions.value.find((option) => option.value === loadedPref.timeFormat)?.label ||
      t('settings.time_format_short'),
    value: loadedPref.timeFormat,
  }

  selectedHourFormat.value = {
    label: loadedPref.hour12 ? t('settings.hour_format_12h') : t('settings.hour_format_24h'),
    value: loadedPref.hour12 ? '12h' : '24h',
  }

  selectedPageSize.value = {
    label: loadedPref.defaultPageSize
      ? loadedPref.defaultPageSize.toString()
      : DEFAULT_PAGE_SIZE.label,
    value: loadedPref.defaultPageSize ? loadedPref.defaultPageSize : DEFAULT_PAGE_SIZE.value,
  }

  autoRefreshInterval.value = loadedPref.autoRefreshInterval || 30
}

// Watch for changes in selected options and update preferences/i18n
watch(selectedLanguage, (newValue) => {
  if (newValue && newValue.value !== locale.value) {
    setLocale(newValue.value as 'en' | 'km')
  }
})

watch(selectedDateFormat, (newValue) => {
  if (newValue && preferences.value.dateFormat !== newValue.value) {
    preferences.value.dateFormat = newValue.value
  }
})

watch(selectedTimeFormat, (newValue) => {
  if (newValue && preferences.value.timeFormat !== newValue.value) {
    preferences.value.timeFormat = newValue.value
  }
})

watch(selectedHourFormat, (newValue) => {
  if (newValue && preferences.value.hour12 !== (newValue.value === '12h')) {
    preferences.value.hour12 = newValue.value === '12h'
  }
})

watch(selectedCurrency, (newValue) => {
  if (newValue && preferences.value.currency !== newValue.value) {
    preferences.value.currency = newValue.value
  }
})

watch(selectedPageSize, (newValue) => {
  if (newValue && preferences.value.defaultPageSize !== newValue.value) {
    preferences.value.defaultPageSize = newValue.value
  }
})

watch(autoRefreshInterval, (newValue) => {
  if (newValue && preferences.value.autoRefreshInterval !== newValue) {
    // Ensure the value is within valid range
    const validValue = Math.max(30, Math.min(300, newValue))
    if (validValue !== newValue) {
      autoRefreshInterval.value = validValue
    }
    preferences.value.autoRefreshInterval = validValue
  }
})

// Watch for preference changes and update selected options (for reset functionality)
watch(
  () => preferences.value,
  (newValue) => {
    initializeSelectedOptions(newValue)
  },
  { deep: true }
)

// Watch for locale changes and update all labels
watch(locale, () => {
  // Re-initialize all selected options with new language labels
  initializeSelectedOptions(preferences.value)
})

// Load preferences on component mount
onMounted(() => {
  isInitialLoad = true

  // Load saved preferences (which includes theme)
  const savedPreferences = loadPreferences()
  preferences.value = savedPreferences

  // Apply the saved theme to color mode
  if (savedPreferences.theme) {
    colorMode.preference = savedPreferences.theme
  }

  // Initialize selected options based on loaded preferences
  initializeSelectedOptions(savedPreferences)

  // Enable auto-save after initial load
  setTimeout(() => {
    isInitialLoad = false
  }, 100)
})
</script>

<template>
  <div class="max-h-screen">
    <!-- Page Header -->
    <!-- <div class="bg-gradient-to-b from-[#43B3DE] to-white px-6 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-2">Settings</h1>
        <p class="text-white/80">Manage your account preferences and settings</p>
      </div>
    </div> -->

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6">
      <!-- Success Message -->
      <div
        v-if="showSuccessMessage"
        class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center"
      >
        <svg
          class="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-green-800 dark:text-green-200 font-medium">{{
          $t('settings.preferences_saved')
        }}</span>
      </div>

      <!-- Error Message -->
      <div
        v-if="showErrorMessage"
        class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center"
      >
        <svg
          class="w-5 h-5 text-red-600 dark:text-red-400 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-red-800 dark:text-red-200 font-medium">{{
          $t('settings.preferences_save_error')
        }}</span>
      </div>

      <!-- User Preferences Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-primary dark:text-white">
                {{ $t('settings.user_preferences') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mt-1">
                {{ $t('settings.user_preferences_desc') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ $t('settings.auto_save_enabled') }}
              </p>
            </div>
            <div v-if="isSaving" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ $t('settings.saving') }}
            </div>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Theme Selection -->
          <ClientOnly>
            <div>
              <label class="block text-md font-bold text-primary dark:text-white mb-3">{{
                $t('settings.theme')
              }}</label>
              <div class="grid grid-cols-3 gap-3">
                <label
                  v-for="theme in ['light', 'dark', 'system']"
                  :key="theme"
                  class="relative cursor-pointer"
                >
                  <input v-model="preferences.theme" :value="theme" type="radio" class="sr-only" />
                  <div
                    class="border-2 rounded-lg p-4 text-center transition-all duration-200"
                    :class="
                      preferences.theme === theme
                        ? 'border-primary bg-[#EAF6FC] dark:bg-[#43B3DE]/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    "
                  >
                    <div class="flex flex-col items-center space-y-2">
                      <!-- Theme Icons -->
                      <div class="h-8 w-8 flex items-center justify-center">
                        <UIcon
                          v-if="theme === 'light'"
                          name="i-heroicons-sun"
                          class="h-6 w-6 text-yellow-500"
                        />
                        <UIcon
                          v-else-if="theme === 'dark'"
                          name="i-heroicons-moon"
                          class="h-6 w-6 text-primary"
                        />
                        <UIcon
                          v-else
                          name="i-heroicons-computer-desktop"
                          class="h-6 w-6 text-gray-600 dark:text-gray-400"
                        />
                      </div>
                      <div class="text-sm font-medium text-[#211e1f] dark:text-white capitalize">
                        {{ $t(`settings.theme_${theme}`) }}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {{ $t('settings.theme_description') }}
              </p>
            </div>
          </ClientOnly>

          <!-- Language & Region -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                {{ $t('settings.language') }}
              </label>
              <USelectMenu
                v-model="selectedLanguage"
                :items="languageOptions"
                placeholder="Select language"
                :search-input="false"
                class="w-full"
              />
            </div>

            <!-- <div>
              <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                {{ $t('settings.timezone') }}
              </label>
              <USelectMenu
                v-model="selectedTimezone"
                :items="timezoneOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select timezone"
                :search-input="false"
                class="w-full"
              />
            </div> -->
          </div>

          <!-- Format Preferences -->
          <div class="space-y-6">
            <h3 class="text-md font-bold text-primary dark:text-white">
              {{ $t('settings.format_preferences') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.date_format') }}
                </label>
                <USelectMenu
                  v-model="selectedDateFormat"
                  :items="dateFormatOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select date format"
                  :search-input="false"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.time_format') }}
                </label>
                <USelectMenu
                  v-model="selectedTimeFormat"
                  :items="timeFormatOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select time format"
                  :search-input="false"
                  class="w-full"
                />
              </div>
              <!-- AM/PM Selection -->
              <div>
                <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.hour_format') }}
                </label>
                <USelectMenu
                  v-model="selectedHourFormat"
                  :items="hourFormatOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select hour format"
                  :search-input="false"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.default_currency') }}
                </label>
                <USelectMenu
                  v-model="selectedCurrency"
                  :items="currencyOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select currency"
                  :search-input="false"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.default_page_size') }}
                </label>
                <USelectMenu
                  v-model="selectedPageSize"
                  :items="pageSizeOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select page size"
                  :search-input="false"
                  class="w-full"
                />
                <!-- <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ $t('settings.default_page_size_description') }}
                </p> -->
              </div>

              <div>
                <div class="flex items-start gap-1">
                  <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                    {{ $t('settings.auto_refresh_interval') }}
                  </label>
                  <UTooltip
                    :text="$t('settings.auto_refresh_interval_description')"
                    :delay-duration="300"
                  >
                    <UIcon
                      name="material-symbols-help-outline"
                      class="size-3 text-gray-400 dark:text-gray-500 cursor-pointer"
                    />
                  </UTooltip>
                </div>
                <UInputNumber
                  v-model="autoRefreshInterval"
                  :min="30"
                  :max="300"
                  placeholder="30-300"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-xs text-gray-400 dark:text-gray-500 pr-3">
                      {{ $t('settings.seconds') }}
                    </span>
                  </template></UInputNumber
                >
              </div>
            </div>

            <!-- Preview Section -->
            <div
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <h4 class="text-sm font-medium text-primary dark:text-white mb-3">
                {{ $t('settings.preview') }}
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{
                    $t('settings.preview_date')
                  }}</span>
                  <div class="text-lg font-semibold text-[#211e1f] dark:text-white">
                    {{ getDatePreview }}
                  </div>
                </div>

                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{
                    $t('settings.preview_time')
                  }}</span>
                  <div class="text-lg font-semibold text-[#211e1f] dark:text-white">
                    {{ getTimePreview }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton
              :loading="isSaving"
              :disabled="isSaving"
              variant="outline"
              @click="resetToDefaults"
            >
              {{ $t('settings.reset_to_defaults') }}
            </UButton>
            <!-- <button
              type="button"
              @click="resetToDefaults"
              :disabled="isSaving"
              class="bg-white dark:bg-gray-700 text-[#211e1f] dark:text-white px-6 py-2 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-[#43B3DE] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('settings.reset_to_defaults') }}
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
