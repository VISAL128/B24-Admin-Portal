<template>
  <div
    class="flex flex-col min-h-full w-full space-y-6 p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900 overflow-y-auto"
  >
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('wallet_page.title', 'Digital Wallet') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
          {{ t('wallet_page.subtitle', 'Manage your wallet balances and transactions') }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Wallet Type Switcher -->
        <USelectMenu
          v-model="selectedWalletType"
          :options="walletTypes"
          option-attribute="name"
          value-attribute="id"
          class="min-w-40 transition-all duration-300"
        >
          <template #default="{ open }">
            <UButton
              variant="outline"
              size="sm"
              class="justify-between transition-all duration-300 hover:scale-105 hover:shadow-md"
              :class="isWalletLoading ? 'animate-pulse' : ''"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full transition-colors duration-300"
                  :class="{
                    'bg-blue-500': selectedWalletType === 'personal',
                    'bg-green-500': selectedWalletType === 'business',
                    'bg-yellow-500': selectedWalletType === 'savings',
                    'bg-purple-500': selectedWalletType === 'investment',
                  }"
                />
                {{
                  t(
                    selectedWalletTypeData?.nameKey || 'wallet_page.personal_wallet',
                    selectedWalletTypeData?.name || 'Personal Wallet'
                  )
                }}
              </div>
              <UIcon
                name="i-heroicons-chevron-down-20-solid"
                :class="[open && 'rotate-180', 'transition-transform duration-300']"
              />
            </UButton>
          </template>
        </USelectMenu>

        <UButton
          icon="i-material-symbols-light-refresh"
          variant="ghost"
          size="sm"
          :loading="isRefreshing"
          @click="refreshBalances"
        >
          <span class="hidden sm:inline">{{ t('wallet_page.refresh', 'Refresh') }}</span>
        </UButton>
        <UButton
          icon="i-material-symbols-light-history"
          color="neutral"
          variant="solid"
          size="sm"
          @click="navigateToHistory"
        >
          <span class="hidden sm:inline">{{ t('wallet_page.view_history', 'View History') }}</span>
        </UButton>
      </div>
    </div>

    <!-- Wallet Balance Cards -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <!-- KHR Wallet Card -->
      <UCard
        class="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg"
        :class="isWalletLoading ? 'animate-pulse' : ''"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="p-2 bg-blue-500 rounded-lg transition-transform duration-300"
                :class="isWalletLoading ? 'animate-spin' : ''"
              >
                <Icon
                  name="i-material-symbols-light-account-balance-wallet"
                  class="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h3
                  class="font-semibold text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {{ t('wallet_page.khr_wallet', 'KHR Wallet') }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {{ selectedWalletTypeData?.name || 'Personal Wallet' }} -
                  {{ t('wallet_page.primary_account', 'Primary Account') }}
                </p>
              </div>
            </div>
            <UBadge color="primary" variant="subtle" class="transition-all duration-300">{{
              t('wallet_page.active', 'Active')
            }}</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Balance Display -->
          <div class="text-center transition-all duration-500 ease-in-out">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">
              {{ t('wallet_page.available_balance', 'Available Balance') }}
            </p>
            <div class="relative">
              <p
                :key="'khr-' + selectedWalletType + '-' + walletBalances.khr"
                :class="isWalletLoading ? 'scale-110 animate-bounce' : 'scale-100'"
                class="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-500 transform"
              >
                {{ formatCurrency(walletBalances.khr, 'KHR') }}
              </p>
              <!-- Loading overlay -->
              <div
                v-if="isWalletLoading"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
              />
            </div>
          </div>

          <!-- Account Details -->
          <div
            class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
          >
            <div class="flex justify-between text-sm transition-colors duration-300">
              <span class="text-gray-600 dark:text-gray-400">{{
                t('wallet_page.account_number', 'Account Number')
              }}</span>
              <span
                :key="'khr-acc-' + selectedWalletType"
                class="font-mono text-gray-900 dark:text-white transition-all duration-300"
                >****{{ khrAccountNumber.slice(-4) }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-colors duration-300">
              <span class="text-gray-600 dark:text-gray-400">{{
                t('wallet_page.last_transaction', 'Last Transaction')
              }}</span>
              <span class="text-gray-900 dark:text-white transition-colors duration-300">{{
                lastTransactionDate
              }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- USD Wallet Card -->
      <UCard
        class="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg"
        :class="isWalletLoading ? 'animate-pulse' : ''"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="p-2 bg-green-500 rounded-lg transition-transform duration-300"
                :class="isWalletLoading ? 'animate-spin' : ''"
              >
                <Icon
                  name="i-material-symbols-light-account-balance-wallet"
                  class="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h3
                  class="font-semibold text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {{ t('wallet_page.usd_wallet', 'USD Wallet') }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {{ selectedWalletTypeData?.name || 'Personal Wallet' }} -
                  {{ t('wallet_page.secondary_account', 'Secondary Account') }}
                </p>
              </div>
            </div>
            <UBadge color="success" variant="subtle" class="transition-all duration-300">{{
              t('wallet_page.active', 'Active')
            }}</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Balance Display -->
          <div class="text-center transition-all duration-500 ease-in-out">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">
              {{ t('wallet_page.available_balance', 'Available Balance') }}
            </p>
            <div class="relative">
              <p
                :key="'usd-' + selectedWalletType + '-' + walletBalances.usd"
                :class="isWalletLoading ? 'scale-110 animate-bounce' : 'scale-100'"
                class="text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-500 transform"
              >
                {{ formatCurrency(walletBalances.usd, 'USD') }}
              </p>
              <!-- Loading overlay -->
              <div
                v-if="isWalletLoading"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
              />
            </div>
          </div>

          <!-- Account Details -->
          <div
            class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
          >
            <div class="flex justify-between text-sm transition-colors duration-300">
              <span class="text-gray-600 dark:text-gray-400">{{
                t('wallet_page.account_number', 'Account Number')
              }}</span>
              <span
                :key="'usd-acc-' + selectedWalletType"
                class="font-mono text-gray-900 dark:text-white transition-all duration-300"
                >****{{ usdAccountNumber.slice(-4) }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-colors duration-300">
              <span class="text-gray-600 dark:text-gray-400">{{
                t('wallet_page.last_transaction', 'Last Transaction')
              }}</span>
              <span class="text-gray-900 dark:text-white transition-colors duration-300">{{
                lastTransactionDate
              }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Transaction Summary Section -->
    <UCard class="transition-all duration-500 ease-in-out">
      <template #header>
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300"
          >
            {{ t('wallet_page.transaction_summary', 'Transaction Summary') }}
          </h2>
          <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {{ selectedWalletTypeData?.name || 'Personal Wallet' }}
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <!-- Today Summary -->
        <div
          :key="'today-' + selectedWalletType"
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-3">
            <h3
              class="font-semibold text-blue-900 dark:text-blue-100 transition-colors duration-300"
            >
              {{ t('wallet_page.today', 'Today') }}
            </h3>
            <div
              class="p-2 bg-blue-500 rounded-lg transition-transform duration-300 hover:rotate-12"
            >
              <Icon name="i-material-symbols-light-today" class="w-5 h-5 text-white" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.date', 'Date')
              }}</span>
              <span
                :key="'today-date-' + selectedWalletType"
                class="font-medium text-blue-900 dark:text-blue-100 transition-all duration-500"
                >{{ summaryData.today.date }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                :key="'today-trans-' + selectedWalletType"
                class="font-medium text-blue-900 dark:text-blue-100 transition-all duration-500"
                >{{ summaryData.today.totalTransactions }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                :key="'today-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.today.totalReceived, summaryData.today.currency) }}
              </span>
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                :key="'today-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.today.totalSettlement, summaryData.today.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- This Week Summary -->
        <div
          :key="'week-' + selectedWalletType"
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-3">
            <h3
              class="font-semibold text-green-900 dark:text-green-100 transition-colors duration-300"
            >
              {{ t('wallet_page.this_week', 'This Week') }}
            </h3>
            <div
              class="p-2 bg-green-500 rounded-lg transition-transform duration-300 hover:rotate-12"
            >
              <Icon name="i-material-symbols-light-calendar-view-week" class="w-5 h-5 text-white" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.period', 'Period')
              }}</span>
              <span
                :key="'week-date-' + selectedWalletType"
                class="font-medium text-green-900 dark:text-green-100 text-xs transition-all duration-500"
                >{{ summaryData.week.date }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                :key="'week-trans-' + selectedWalletType"
                class="font-medium text-green-900 dark:text-green-100 transition-all duration-500"
                >{{ summaryData.week.totalTransactions }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                :key="'week-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.week.totalReceived, summaryData.week.currency) }}
              </span>
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                :key="'week-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.week.totalSettlement, summaryData.week.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- This Month Summary -->
        <div
          :key="'month-' + selectedWalletType"
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-3">
            <h3
              class="font-semibold text-purple-900 dark:text-purple-100 transition-colors duration-300"
            >
              {{ t('wallet_page.this_month', 'This Month') }}
            </h3>
            <div
              class="p-2 bg-purple-500 rounded-lg transition-transform duration-300 hover:rotate-12"
            >
              <Icon name="i-material-symbols-light-calendar-month" class="w-5 h-5 text-white" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.period', 'Period')
              }}</span>
              <span
                :key="'month-date-' + selectedWalletType"
                class="font-medium text-purple-900 dark:text-purple-100 text-xs transition-all duration-500"
                >{{ summaryData.month.date }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                :key="'month-trans-' + selectedWalletType"
                class="font-medium text-purple-900 dark:text-purple-100 transition-all duration-500"
                >{{ summaryData.month.totalTransactions }}</span
              >
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                :key="'month-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.month.totalReceived, summaryData.month.currency) }}
              </span>
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                :key="'month-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500"
              >
                {{ formatCurrency(summaryData.month.totalSettlement, summaryData.month.currency) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'

// Define page meta
definePageMeta({
  title: 'Digital Wallet',
  description: 'Manage your wallet balances and transactions',
})

// Composables
const { t } = useI18n()
const { formatCurrency } = useCurrency()

// Reactive data
const isRefreshing = ref(false)
const isWalletLoading = ref(false)

// Wallet types
const walletTypes = ref([
  { id: 'personal', name: 'Personal Wallet', nameKey: 'wallet_page.personal_wallet' },
  { id: 'business', name: 'Business Wallet', nameKey: 'wallet_page.business_wallet' },
  { id: 'savings', name: 'Savings Wallet', nameKey: 'wallet_page.savings_wallet' },
  { id: 'investment', name: 'Investment Wallet', nameKey: 'wallet_page.investment_wallet' },
])

// Selected wallet type (single source of truth)
const selectedWalletType = ref('personal')

// Wallet balances for different types (static demo data with distinct values)
const walletBalancesData = ref({
  personal: {
    khr: 2450000, // 2,450,000 KHR
    usd: 580.5, // $580.50
  },
  business: {
    khr: 45750000, // 45,750,000 KHR (much higher for business)
    usd: 11240.75, // $11,240.75
  },
  savings: {
    khr: 18920000, // 18,920,000 KHR (moderate savings)
    usd: 4675.3, // $4,675.30
  },
  investment: {
    khr: 125600000, // 125,600,000 KHR (highest for investment)
    usd: 30840.25, // $30,840.25
  },
})

// Computed wallet balances based on selected type
const walletBalances = computed(() => ({
  khr:
    walletBalancesData.value[selectedWalletType.value as keyof typeof walletBalancesData.value]
      ?.khr || 0,
  usd:
    walletBalancesData.value[selectedWalletType.value as keyof typeof walletBalancesData.value]
      ?.usd || 0,
}))

// Computed wallet type data
const selectedWalletTypeData = computed(
  () =>
    walletTypes.value.find((type) => type.id === selectedWalletType.value) || walletTypes.value[0]
)

// Account details for different wallet types
const accountDetails = ref({
  personal: {
    khr: '85512345678901',
    usd: '85587654321098',
  },
  business: {
    khr: '85523456789012',
    usd: '85598765432109',
  },
  savings: {
    khr: '85534567890123',
    usd: '85509876543210',
  },
  investment: {
    khr: '85545678901234',
    usd: '85510987654321',
  },
})

// Computed account numbers based on selected type
const khrAccountNumber = computed(
  () =>
    accountDetails.value[selectedWalletType.value as keyof typeof accountDetails.value]?.khr || ''
)
const usdAccountNumber = computed(
  () =>
    accountDetails.value[selectedWalletType.value as keyof typeof accountDetails.value]?.usd || ''
)
const lastTransactionDate = ref('2024-01-15')

// Transaction summary data by wallet type (static demo data with distinct values)
const summaryDataByType = ref({
  personal: {
    today: {
      date: '2025-01-15',
      totalTransactions: 3,
      totalReceived: 24500.0,
      totalSettlement: 195000.0,
      currency: 'KHR',
    },
    week: {
      date: '2025-01-13 to 2025-01-19',
      totalTransactions: 18,
      totalReceived: 185200.0,
      totalSettlement: 425500.0,
      currency: 'KHR',
    },
    month: {
      date: '2025-01-01 to 2025-01-31',
      totalTransactions: 67,
      totalReceived: 725000.0,
      totalSettlement: 1250000.0,
      currency: 'KHR',
    },
  },
  business: {
    today: {
      date: '2025-01-15',
      totalTransactions: 45,
      totalReceived: 2850000.0,
      totalSettlement: 4125000.0,
      currency: 'KHR',
    },
    week: {
      date: '2025-01-13 to 2025-01-19',
      totalTransactions: 234,
      totalReceived: 15750000.0,
      totalSettlement: 22500000.0,
      currency: 'KHR',
    },
    month: {
      date: '2025-01-01 to 2025-01-31',
      totalTransactions: 892,
      totalReceived: 45750000.0,
      totalSettlement: 68250000.0,
      currency: 'KHR',
    },
  },
  savings: {
    today: {
      date: '2025-01-15',
      totalTransactions: 2,
      totalReceived: 95000.0,
      totalSettlement: 125000.0,
      currency: 'KHR',
    },
    week: {
      date: '2025-01-13 to 2025-01-19',
      totalTransactions: 8,
      totalReceived: 485000.0,
      totalSettlement: 625000.0,
      currency: 'KHR',
    },
    month: {
      date: '2025-01-01 to 2025-01-31',
      totalTransactions: 28,
      totalReceived: 1850000.0,
      totalSettlement: 2450000.0,
      currency: 'KHR',
    },
  },
  investment: {
    today: {
      date: '2025-01-15',
      totalTransactions: 8,
      totalReceived: 4250000.0,
      totalSettlement: 6850000.0,
      currency: 'KHR',
    },
    week: {
      date: '2025-01-13 to 2025-01-19',
      totalTransactions: 34,
      totalReceived: 18500000.0,
      totalSettlement: 28750000.0,
      currency: 'KHR',
    },
    month: {
      date: '2025-01-01 to 2025-01-31',
      totalTransactions: 156,
      totalReceived: 82500000.0,
      totalSettlement: 125000000.0,
      currency: 'KHR',
    },
  },
})

// Computed summary data based on selected wallet type
const summaryData = computed(
  () =>
    summaryDataByType.value[selectedWalletType.value as keyof typeof summaryDataByType.value] ||
    summaryDataByType.value.personal
)

// Watch for wallet type changes to trigger animations
watch(selectedWalletType, async (newType, oldType) => {
  if (newType !== oldType) {
    isWalletLoading.value = true
    // Simulate API call delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800))
    isWalletLoading.value = false
  }
})

// Methods
const refreshBalances = async () => {
  isRefreshing.value = true
  isWalletLoading.value = true
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))
  isRefreshing.value = false
  isWalletLoading.value = false
}

const navigateToHistory = () => {
  // Navigate to transaction history page
  console.log('Navigate to transaction history')
}
</script>

<style scoped>
/* Custom animations for wallet switching */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Enhanced transition effects */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Wallet card hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .hover\:shadow-lg:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }
}

/* Loading pulse animation enhancement */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Bounce animation for balance updates */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Spin animation for loading icons */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
