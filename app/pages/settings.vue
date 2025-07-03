<script setup lang="ts">
import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

definePageMeta({
  auth: true
})

const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()

useHead({
  title: `${t('settings.title')} - Bill24 Admin Portal`
})

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '24h' | '12h'
  currency: string
}

const isLoading = ref(false)
const isSaving = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)

// Initialize storage composable
const storage = useStorage<UserPreferences>()

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'USD'
}

// Load preferences from localStorage or use defaults
const loadPreferences = (): UserPreferences => {
  const stored = storage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)
  const basePreferences = stored ? { ...defaultPreferences, ...stored } : { ...defaultPreferences }
  
  // Sync language with current i18n locale
  basePreferences.language = locale.value
  
  // Sync theme with current color mode
  basePreferences.theme = colorMode.preference as 'light' | 'dark' | 'system'
  
  return basePreferences
}

const preferences = ref<UserPreferences>(loadPreferences())

// Make language options reactive to locale changes
const languageOptions = computed(() => [
  { value: 'en', label: t('settings.languages.en') },
  { value: 'km', label: t('settings.languages.km') },
])

// Make other options reactive to locale changes
const timezoneOptions = computed(() => [
  { value: 'UTC', label: t('settings.timezones.utc') },
  { value: 'Asia/Phnom_Penh', label: t('settings.timezones.cambodia') },
  { value: 'Asia/Bangkok', label: t('settings.timezones.thailand') },
  { value: 'Asia/Ho_Chi_Minh', label: t('settings.timezones.vietnam') }
])

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
]

const timeFormatOptions = computed(() => [
  { value: '24h', label: t('settings.time_format_24h') },
  { value: '12h', label: t('settings.time_format_12h') }
])

const currencyOptions = computed(() => [
  { value: 'USD', label: t('settings.currencies.usd') },
  { value: 'KHR', label: t('settings.currencies.khr') }
])

// Watch for language changes and update i18n locale
watch(() => preferences.value.language, (newLanguage) => {
  if (newLanguage !== locale.value) {
    setLocale(newLanguage as 'en' | 'km')
    // Also update localStorage for the language
    try {
      localStorage.setItem('user-lang', newLanguage)
    } catch (e) {
      console.error('Failed to save language preference:', e)
    }
  }
})

// Watch for theme changes and update color mode
watch(() => preferences.value.theme, (newTheme) => {
  if (newTheme !== colorMode.preference) {
    colorMode.preference = newTheme
  }
})

// Watch for i18n locale changes (from other parts of the app) and update preferences
watch(() => locale.value, (newLocale) => {
  if (newLocale !== preferences.value.language) {
    preferences.value.language = newLocale
  }
})

// Watch for color mode changes (from other parts of the app) and update preferences
watch(() => colorMode.preference, (newColorMode) => {
  if (newColorMode !== preferences.value.theme) {
    preferences.value.theme = newColorMode as 'light' | 'dark' | 'system'
  }
})

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
watch(preferences, () => {
  if (!isInitialLoad) {
    autoSavePreferences()
  }
}, { deep: true })

// Preview functions for selected formats
const getDatePreview = computed(() => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  
  switch (preferences.value.dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default:
      return `${day}/${month}/${year}`
  }
})

const getTimePreview = computed(() => {
  const now = new Date()
  
  if (preferences.value.timeFormat === '24h') {
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } else {
    const hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const period = hours >= 12 ? t('settings.pm') : t('settings.am')
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes} ${period}`
  }
})

const savePreferences = async () => {
  // Don't save if we're already saving
  if (isSaving.value) return
  
  isSaving.value = true
  showErrorMessage.value = false
  
  try {
    // Ensure the language preference is synchronized with current locale
    preferences.value.language = locale.value
    
    // Ensure the theme preference is synchronized with current color mode
    preferences.value.theme = colorMode.preference as 'light' | 'dark' | 'system'
    
    // Save to localStorage
    const success = storage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences.value)
    
    if (!success) {
      throw new Error('Failed to save preferences to localStorage')
    }

    // Save language preference separately for persistence
    try {
      localStorage.setItem('user-lang', preferences.value.language)
    } catch (e) {
      console.error('Failed to save language preference:', e)
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
  
  // Reset preferences to defaults
  preferences.value = { ...defaultPreferences }
  
  // Update language locale
  if (defaultPreferences.language === 'en' || defaultPreferences.language === 'km') {
    setLocale(defaultPreferences.language as 'en' | 'km')
  }
  
  // Update color mode theme
  colorMode.preference = defaultPreferences.theme
  
  // Clear from localStorage
  storage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)
  localStorage.removeItem('user-lang')
  
  // Save the reset preferences
  await savePreferences()
  
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

// Load preferences on component mount
onMounted(() => {
  isInitialLoad = true
  
  // Load saved language from localStorage first
  const savedLanguage = localStorage.getItem('user-lang')
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'km')) {
    setLocale(savedLanguage as 'en' | 'km')
  }
  
  // Load saved preferences (which includes theme)
  const savedPreferences = loadPreferences()
  preferences.value = savedPreferences
  
  // Apply the saved theme to color mode
  if (savedPreferences.theme) {
    colorMode.preference = savedPreferences.theme
  }
  
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
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Success Message -->
      <div 
        v-if="showSuccessMessage"
        class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center"
      >
        <svg class="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-green-800 dark:text-green-200 font-medium">{{ $t('settings.preferences_saved') }}</span>
      </div>

      <!-- Error Message -->
      <div 
        v-if="showErrorMessage"
        class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center"
      >
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="text-red-800 dark:text-red-200 font-medium">{{ $t('settings.preferences_save_error') }}</span>
      </div>

      <!-- User Preferences Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-[#211e1f] dark:text-white">{{ $t('settings.user_preferences') }}</h2>
              <p class="text-gray-600 dark:text-gray-300 mt-1">{{ $t('settings.user_preferences_desc') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('settings.auto_save_enabled') }}</p>
            </div>
            <div v-if="isSaving" class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ $t('settings.saving') }}
            </div>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Theme Selection -->
          <div>
            <label class="block text-sm font-medium text-[#211e1f] dark:text-white mb-3">{{ $t('settings.theme') }}</label>
            <div class="grid grid-cols-3 gap-3">
              <label 
                v-for="theme in ['light', 'dark', 'system']" 
                :key="theme"
                class="relative cursor-pointer"
              >
                <input
                  v-model="preferences.theme"
                  :value="theme"
                  type="radio"
                  class="sr-only"
                >
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-200"
                  :class="preferences.theme === theme 
                    ? 'border-[#3F83F8] bg-[#EAF6FC] dark:bg-[#43B3DE]/10' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'"
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
                        class="h-6 w-6 text-blue-600"
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

          <!-- Language & Region -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="language" class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                {{ $t('settings.language') }}
              </label>
              <select
                id="language"
                v-model="preferences.language"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="timezone" class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                {{ $t('settings.timezone') }}
              </label>
              <select
                id="timezone"
                v-model="preferences.timezone"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Format Preferences -->
          <div class="space-y-6">
            <h3 class="text-sm font-medium text-[#211e1f] dark:text-white">{{ $t('settings.format_preferences') }}</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="dateFormat" class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.date_format') }}
                </label>
                <select
                  id="dateFormat"
                  v-model="preferences.dateFormat"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option v-for="format in dateFormatOptions" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="timeFormat" class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.time_format') }}
                </label>
                <select
                  id="timeFormat"
                  v-model="preferences.timeFormat"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option v-for="format in timeFormatOptions" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="currency" class="block text-sm font-medium text-[#211e1f] dark:text-white mb-2">
                  {{ $t('settings.default_currency') }}
                </label>
                <select
                  id="currency"
                  v-model="preferences.currency"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option v-for="curr in currencyOptions" :key="curr.value" :value="curr.value">
                    {{ curr.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Preview Section -->
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-sm font-medium text-[#211e1f] dark:text-white mb-3">{{ $t('settings.preview') }}</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.preview_date') }}</span>
                  <div class="text-lg font-semibold text-[#211e1f] dark:text-white">
                    {{ getDatePreview }}
                  </div>
                </div>

                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.preview_time') }}</span>
                  <div class="text-lg font-semibold text-[#211e1f] dark:text-white">
                    {{ getTimePreview }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="resetToDefaults"
              :disabled="isSaving"
              class="bg-white dark:bg-gray-700 text-[#211e1f] dark:text-white px-6 py-2 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-[#43B3DE] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('settings.reset_to_defaults') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>