<script setup lang="ts">
import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

definePageMeta({
  auth: true
})

useHead({
  title: 'Settings - Bill24 Admin Portal'
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
  return stored ? { ...defaultPreferences, ...stored } : { ...defaultPreferences }
}

const preferences = ref<UserPreferences>(loadPreferences())

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ (Khmer)' },
]

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Phnom_Penh', label: 'Cambodia (ICT)' },
  { value: 'Asia/Bangkok', label: 'Thailand (ICT)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Vietnam (ICT)' }
]

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
]

const timeFormatOptions = [
  { value: '24h', label: '24-hour (13:30)' },
  { value: '12h', label: '12-hour (1:30 PM)' }
]

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'KHR', label: 'KHR - Cambodian Riel' }
]

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
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes} ${period}`
  }
})

const savePreferences = async () => {
  isSaving.value = true
  showErrorMessage.value = false
  
  try {
    // Save to localStorage
    const success = storage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences.value)
    
    if (!success) {
      throw new Error('Failed to save preferences to localStorage')
    }

    // Simulate API call to save preferences to backend
    // await new Promise(resolve => setTimeout(resolve, 1000))
    
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
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

const resetToDefaults = () => {
  preferences.value = { ...defaultPreferences }
  // Also clear from localStorage
  storage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES)
}

// Load preferences on component mount
onMounted(() => {
  preferences.value = loadPreferences()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Page Header -->
    <div class="bg-gradient-to-b from-[#43B3DE] to-white px-6 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-2">Settings</h1>
        <p class="text-white/80">Manage your account preferences and settings</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Success Message -->
      <div 
        v-if="showSuccessMessage"
        class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
      >
        <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-green-800 font-medium">Preferences saved successfully!</span>
      </div>

      <!-- Error Message -->
      <div 
        v-if="showErrorMessage"
        class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
      >
        <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="text-red-800 font-medium">Failed to save preferences. Please try again.</span>
      </div>

      <!-- User Preferences Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-[#211e1f]">User Preferences</h2>
          <p class="text-gray-600 mt-1">Customize your experience with Bill24 Admin Portal</p>
        </div>

        <form @submit.prevent="savePreferences" class="p-6 space-y-6">
          <!-- Theme Selection -->
          <div>
            <label class="block text-sm font-medium text-[#211e1f] mb-3">Theme</label>
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
                    ? 'border-[#43B3DE] bg-[#EAF6FC]' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="text-sm font-medium text-[#211e1f] capitalize">{{ theme }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Language & Region -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="language" class="block text-sm font-medium text-[#211e1f] mb-2">
                Language
              </label>
              <select
                id="language"
                v-model="preferences.language"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors"
              >
                <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="timezone" class="block text-sm font-medium text-[#211e1f] mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                v-model="preferences.timezone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors"
              >
                <option v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Format Preferences -->
          <div class="space-y-6">
            <h3 class="text-sm font-medium text-[#211e1f]">Format Preferences</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="dateFormat" class="block text-sm font-medium text-[#211e1f] mb-2">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  v-model="preferences.dateFormat"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors"
                >
                  <option v-for="format in dateFormatOptions" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="timeFormat" class="block text-sm font-medium text-[#211e1f] mb-2">
                  Time Format
                </label>
                <select
                  id="timeFormat"
                  v-model="preferences.timeFormat"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors"
                >
                  <option v-for="format in timeFormatOptions" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="currency" class="block text-sm font-medium text-[#211e1f] mb-2">
                  Default Currency
                </label>
                <select
                  id="currency"
                  v-model="preferences.currency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43B3DE] focus:border-[#43B3DE] transition-colors"
                >
                  <option v-for="curr in currencyOptions" :key="curr.value" :value="curr.value">
                    {{ curr.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Preview Section -->
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 class="text-sm font-medium text-[#211e1f] mb-3">Preview</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-xs text-gray-500">Date:</span>
                  <div class="text-lg font-semibold text-[#211e1f]">
                    {{ getDatePreview }}
                  </div>
                </div>

                <div>
                  <span class="text-xs text-gray-500">Time:</span>
                  <div class="text-lg font-semibold text-[#211e1f]">
                    {{ getTimePreview }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 sm:flex-none bg-[#43B3DE] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#43B3DE]/90 focus:ring-2 focus:ring-[#43B3DE] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSaving">Save Preferences</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </span>
            </button>
            <button
              type="button"
              @click="resetToDefaults"
              :disabled="isSaving"
              class="flex-1 sm:flex-none bg-white text-[#211e1f] px-6 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#43B3DE] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>