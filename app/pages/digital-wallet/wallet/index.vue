<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('wallet_page.wallets') }}
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Wallet Type Selector -->
            <USelectMenu
              v-if="walletTypes.length > 0 || isLoadingWalletTypes"
              v-model="selectedWalletType"
              :items="walletTypes"
              value-key="id"
              option-attribute="name"
              class="w-48"
              :loading="isLoadingWalletTypes"
              :disabled="isLoadingWalletTypes || walletTypes.length === 0"
              :placeholder="t('wallet_page.select_wallet_type')"
            />

            <UButton
              variant="outline"
              color="neutral"
              icon="i-heroicons-arrow-path"
              :loading="isRefreshing"
              @click="refreshBalances"
            >
              {{ t('wallet_page.refresh') }}
            </UButton>

            <UButton
              variant="outline"
              color="neutral"
              icon="i-heroicons-clock"
              @click="navigateToHistory"
            >
              {{ t('wallet_page.history') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Wallet Cards -->
      <div v-if="walletTypes.length > 0 || isLoadingWalletTypes" class="mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Individual Wallet Cards -->
          <div
            v-for="(wallet, index) in walletBalanceItems"
            :key="`wallet-${wallet.wallet_account_number}-${index}`"
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
          >
            <!-- Wallet Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getCurrencyIconClass(wallet.currency)"
                >
                  <UIcon name="i-heroicons-wallet" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    <!-- {{ wallet.currency }} {{ t('wallet_page.wallet') }} -->
                    {{ wallet.wallet_type }}
                  </h3>
                  <!-- <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ wallet.wallet_type }}
                  </p> -->
                </div>
              </div>
              <UBadge
                :color="wallet.currency === 'USD' ? 'success' : 'primary'"
                variant="subtle"
                size="xs"
              >
                {{ t('wallet_page.active') }}
              </UBadge>
            </div>

            <!-- Balance -->
            <div class="mb-4">
              <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium mr-1">{{
                  wallet.currency
                }}</span>
                {{
                  wallet.current_balance_display ||
                  formatCurrency(wallet.current_balance, wallet.currency)
                }}
              </div>
            </div>

            <!-- Account Details -->
            <div class="space-y-3 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400 font-medium">{{
                  t('wallet_page.account')
                }}</span>
                <div class="flex items-center space-x-2">
                  <span
                    class="font-mono text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border"
                  >
                    {{ formatAccountNumber(wallet.wallet_account_number) }}
                  </span>
                  <UButton
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-clipboard"
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="copyToClipboard(wallet.wallet_account_number)"
                  />
                </div>
              </div>
              <div v-if="wallet.settlement_bank" class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400 font-medium">{{
                  t('wallet_page.settlement_bank')
                }}</span>
                <span class="text-gray-900 dark:text-white font-medium">{{
                  wallet.settlement_bank
                }}</span>
              </div>
            </div>
          </div>

          <!-- Loading Skeleton Cards -->
          <template v-if="isWalletLoading && walletBalanceItems.length === 0">
            <div
              v-for="n in 3"
              :key="`skeleton-${n}`"
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
                  <div>
                    <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                    <div class="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
                <div class="h-5 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div class="mb-4">
                <div class="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <div class="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="flex items-center space-x-2">
                    <div class="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div class="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
                <div class="flex justify-between">
                  <div class="h-3 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div
          v-if="
            walletBalanceItems.length === 0 &&
            !isWalletLoading &&
            !isLoadingWalletTypes &&
            selectedWalletTypeAPI
          "
          class="text-center py-12"
        >
          <UIcon name="i-heroicons-wallet" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ t('wallet_page.no_wallets_found') }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400">{{ t('wallet_page.no_wallets_for_type') }}</p>
        </div>
      </div>

      <!-- Transaction Summary -->
      <div v-if="walletTypes.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('wallet_page.transaction_summary') }}
          </h2>
          <div class="flex items-center space-x-4">
            <UBadge variant="subtle" color="neutral">
              {{ selectedWalletTypeData?.name || t('wallet_page.wallet') }}
            </UBadge>
            <UButton
              variant="ghost"
              size="sm"
              :disabled="isLoadingSummary"
              @click="toggleSummaryCurrency"
            >
              {{ summaryDisplayCurrency }}
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 ml-1" />
            </UButton>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Today -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.today') }}
              </h3>
              <div
                class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-sun" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div v-if="!isLoadingSummary" class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ currentSummaryData.today.totalTransactions }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('wallet_page.transactions') }}
                </div>
              </div>

              <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.received')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.today.totalReceived,
                        currentSummaryData.today.currency
                      )
                    }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.settlement')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.today.totalSettlement,
                        currentSummaryData.today.currency
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-else class="space-y-3">
              <div>
                <div class="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                <div class="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div class="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <!-- This Week -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.this_week') }}
              </h3>
              <div
                class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-calendar-date-range"
                  class="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>

            <div v-if="!isLoadingSummary" class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ currentSummaryData.week.totalTransactions }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('wallet_page.transactions') }}
                </div>
              </div>

              <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.received')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.week.totalReceived,
                        currentSummaryData.week.currency
                      )
                    }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.settlement')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.week.totalSettlement,
                        currentSummaryData.week.currency
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-else class="space-y-3">
              <div>
                <div class="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                <div class="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div class="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <!-- This Month -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.this_month') }}
              </h3>
              <div
                class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-calendar-days"
                  class="w-4 h-4 text-green-600 dark:text-green-400"
                />
              </div>
            </div>

            <div v-if="!isLoadingSummary" class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ currentSummaryData.month.totalTransactions }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('wallet_page.transactions') }}
                </div>
              </div>

              <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.received')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.month.totalReceived,
                        currentSummaryData.month.currency
                      )
                    }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{
                    t('wallet_page.settlement')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      formatCurrency(
                        currentSummaryData.month.totalSettlement,
                        currentSummaryData.month.currency
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-else class="space-y-3">
              <div>
                <div class="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                <div class="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div class="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
                <div class="flex justify-between">
                  <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Wallet Types Available -->
      <div v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('wallet_page.no_wallet_types') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ t('wallet_page.no_wallets_message') }}
        </p>
        <UButton
          variant="outline"
          color="neutral"
          icon="i-heroicons-arrow-path"
          :loading="isLoadingWalletTypes"
          @click="loadWalletTypes"
        >
          {{ t('wallet_page.retry') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'
import { useWalletStore } from '~/stores/wallet'
import type { WalletBalanceItem } from '~~/server/model/pgw_module_api/wallet'
import type { WalletSummaryData } from '~~/server/model/pgw_module_api/transactionSummary'

// Define page meta
definePageMeta({
  title: 'Digital Wallet',
  description: 'Manage your wallet balances and transactions',
})

// Composables
const { formatCurrency } = useCurrency()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { getWalletTypes, getWalletBalance, getTopUpSummary, getFeeSummary } = usePgwModuleApi()
const { t } = useI18n()

// Wallet store
const walletStore = useWalletStore()

// Reactive data
const isRefreshing = ref(false)
const isWalletLoading = ref(false)
const summaryDisplayCurrency = ref('KHR')
const isLoadingWalletTypes = ref(false)
const isLoadingSummary = ref(false)

// Wallet state
const topUpWalletIds = ref<string[]>([])
const settlementWalletIds = ref<string[]>([])
const walletBalanceItems = ref<WalletBalanceItem[]>([])
const selectedWalletTypeAPI = ref<string>('')

// Transaction summary state
const topUpSummaryData = ref<WalletSummaryData | null>(null)
const feeSummaryData = ref<WalletSummaryData | null>(null)

// Wallet types - will be populated from API only
const walletTypes = ref<
  Array<{
    id: string
    label: string
    name: string
    nameKey: string
    icon: string
  }>
>([])

// Selected wallet type (single source of truth)
const selectedWalletType = ref('')

// API methods
const loadWalletTypes = async () => {
  try {
    isLoadingWalletTypes.value = true
    const response = await getWalletTypes()

    if (response.data?.wallet_type) {
      // Update wallet types from API
      walletTypes.value = response.data.wallet_type.map((type: string) => ({
        id: type.toLowerCase().replace(/\s+/g, '_'),
        label: type,
        name: type,
        nameKey: `wallet_page.${type.toLowerCase().replace(/\s+/g, '_')}`,
        icon: getWalletTypeIcon(type),
      }))

      // Store wallet IDs separately for balance fetching
      topUpWalletIds.value = response.data.topup_wallet_ids || []
      settlementWalletIds.value = response.data.settlement_wallet_ids || []

      // Set default wallet type
      if (walletTypes.value.length > 0) {
        selectedWalletType.value = walletTypes.value[0]?.id || ''
        selectedWalletTypeAPI.value = walletTypes.value[0]?.name || ''

        // Sync with store
        walletStore.setSelectedWalletType(selectedWalletType.value, selectedWalletTypeAPI.value)
      }
    }
  } catch (error) {
    console.error('Failed to load wallet types:', error)
  } finally {
    isLoadingWalletTypes.value = false
  }
}

const loadWalletBalance = async () => {
  if (!selectedWalletTypeAPI.value) return

  // Determine which wallet IDs to use based on wallet type
  const walletTypeLower = selectedWalletTypeAPI.value.toLowerCase()
  const isSettlementWallet = walletTypeLower.includes('settlement')
  const walletIdsToUse = isSettlementWallet ? settlementWalletIds.value : topUpWalletIds.value

  if (walletIdsToUse.length === 0) {
    console.warn(`No ${isSettlementWallet ? 'settlement' : 'top-up'} wallet IDs available`)
    walletBalanceItems.value = []
    return
  }

  try {
    isWalletLoading.value = true
    const response = await getWalletBalance({
      wallet_ids: walletIdsToUse,
      wallet_type: selectedWalletTypeAPI.value,
      page: 1,
      page_size: 50,
    })

    if (response.data?.wallet_balances) {
      walletBalanceItems.value = response.data.wallet_balances
    } else {
      walletBalanceItems.value = []
    }
  } catch (error) {
    console.error('Failed to load wallet balance:', error)
    walletBalanceItems.value = []
  } finally {
    isWalletLoading.value = false
  }
}

const loadTransactionSummary = async () => {
  try {
    isLoadingSummary.value = true

    // Load both top-up and fee summaries in parallel
    const [topUpResponse, feeResponse] = await Promise.all([
      getTopUpSummary().catch((error) => {
        console.error('Top-up summary API error:', error)
        return { data: null }
      }),
      getFeeSummary().catch((error) => {
        console.error('Fee summary API error:', error)
        return { data: null }
      }),
    ])

    // Handle top-up summary response
    if (topUpResponse.data?.settlement_wallet) {
      topUpSummaryData.value = topUpResponse.data.settlement_wallet
    } else {
      console.warn('No top-up wallet data received')
    }

    // Handle fee summary response
    if (feeResponse.data?.settlement_wallet) {
      feeSummaryData.value = feeResponse.data.settlement_wallet
    } else {
      console.warn('No settlement wallet data received')
    }
  } catch (error) {
    console.error('Failed to load transaction summary:', error)
  } finally {
    isLoadingSummary.value = false
  }
}

const getWalletTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'personal wallet':
      return 'i-heroicons-user'
    case 'business wallet':
      return 'i-heroicons-building-office'
    case 'savings wallet':
      return 'i-heroicons-banknotes'
    case 'investment wallet':
      return 'i-heroicons-chart-bar'
    case 'settlement wallet':
      return 'i-heroicons-credit-card'
    default:
      return 'i-heroicons-wallet'
  }
}

// Utility methods for wallet display
const formatAccountNumber = (accountNumber: string) => {
  if (!accountNumber) return ''
  return accountNumber.length > 8
    ? `${accountNumber.slice(0, 4)}•••${accountNumber.slice(-4)}`
    : accountNumber
}

const getCurrencyIconClass = (currency: string) => {
  switch (currency) {
    case 'KHR':
      return 'bg-gradient-to-r from-blue-500 to-indigo-600'
    case 'USD':
      return 'bg-gradient-to-r from-emerald-500 to-teal-600'
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
}

// Computed wallet type data
const selectedWalletTypeData = computed(() => {
  if (walletTypes.value.length === 0) return null
  return (
    walletTypes.value.find((type) => type.id === selectedWalletType.value) || walletTypes.value[0]
  )
})

// Toggle summary currency display
const toggleSummaryCurrency = () => {
  summaryDisplayCurrency.value = summaryDisplayCurrency.value === 'KHR' ? 'USD' : 'KHR'
}

const summaryData = computed(() => {
  const walletTypeLower = selectedWalletType.value.toLowerCase()

  // Use top-up data for personal, business, savings, investment wallets
  // Use fee (settlement) data for settlement wallets
  const isSettlementWallet = walletTypeLower.includes('settlement')
  const sourceData = isSettlementWallet ? feeSummaryData.value : topUpSummaryData.value

  if (!sourceData) {
    // Return default/empty data if no API data is available yet
    const now = new Date()
    const isoString = now.toISOString()
    const currentDate = isoString.split('T')[0] || '2024-01-01'
    const monthStart = currentDate.substring(0, 7) + '-01'

    return {
      khr: {
        today: {
          date: currentDate,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'KHR',
        },
        week: {
          date: `${currentDate} - ${currentDate}`,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'KHR',
        },
        month: {
          date: monthStart,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'KHR',
        },
      },
      usd: {
        today: {
          date: currentDate,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'USD',
        },
        week: {
          date: `${currentDate} - ${currentDate}`,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'USD',
        },
        month: {
          date: monthStart,
          totalTransactions: 0,
          totalReceived: 0,
          totalSettlement: 0,
          currency: 'USD',
        },
      },
    }
  }

  // Log the data for debugging
  console.log(`Loading ${isSettlementWallet ? 'Settlement' : 'Top-up'} data:`, sourceData)

  return sourceData
})

// Computed property for current summary data based on selected currency
const currentSummaryData = computed(() => {
  const currentCurrency = summaryDisplayCurrency.value.toLowerCase() as 'khr' | 'usd'
  const data = summaryData.value

  // Check if data has the API structure (today/week/month with nested currencies)
  const hasApiStructure = data && 'today' in data && 'week' in data && 'month' in data

  if (hasApiStructure) {
    // API data structure
    return {
      today: {
        date: data.today?.date || new Date().toISOString().split('T')[0],
        totalTransactions: data.today?.[currentCurrency]?.total_transactions || 0,
        totalReceived: data.today?.[currentCurrency]?.total_received || 0,
        totalSettlement: data.today?.[currentCurrency]?.total_settlement || 0,
        currency: summaryDisplayCurrency.value,
      },
      week: {
        date:
          data.week?.date ||
          `${new Date().toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
        totalTransactions: data.week?.[currentCurrency]?.total_transactions || 0,
        totalReceived: data.week?.[currentCurrency]?.total_received || 0,
        totalSettlement: data.week?.[currentCurrency]?.total_settlement || 0,
        currency: summaryDisplayCurrency.value,
      },
      month: {
        date: data.month?.date || new Date().toISOString().substring(0, 7) + '-01',
        totalTransactions: data.month?.[currentCurrency]?.total_transactions || 0,
        totalReceived: data.month?.[currentCurrency]?.total_received || 0,
        totalSettlement: data.month?.[currentCurrency]?.total_settlement || 0,
        currency: summaryDisplayCurrency.value,
      },
    }
  } else if (data && currentCurrency in data) {
    // Fallback data structure (organized by currency first)
    interface FallbackCurrencyData {
      today?: {
        date: string
        totalTransactions: number
        totalReceived: number
        totalSettlement: number
        currency: string
      }
      week?: {
        date: string
        totalTransactions: number
        totalReceived: number
        totalSettlement: number
        currency: string
      }
      month?: {
        date: string
        totalTransactions: number
        totalReceived: number
        totalSettlement: number
        currency: string
      }
    }
    const currencyData = (data as Record<string, FallbackCurrencyData>)[currentCurrency]
    return {
      today: currencyData?.today || {
        date: new Date().toISOString().split('T')[0],
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
      week: currencyData?.week || {
        date: `${new Date().toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
      month: currencyData?.month || {
        date: new Date().toISOString().substring(0, 7) + '-01',
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
    }
  } else {
    // Default empty data
    return {
      today: {
        date: new Date().toISOString().split('T')[0],
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
      week: {
        date: `${new Date().toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
      month: {
        date: new Date().toISOString().substring(0, 7) + '-01',
        totalTransactions: 0,
        totalReceived: 0,
        totalSettlement: 0,
        currency: summaryDisplayCurrency.value,
      },
    }
  }
})

// Watch for wallet type changes to trigger animations and reload balance
watch(selectedWalletType, async (newType, oldType) => {
  if (newType !== oldType) {
    selectedWalletTypeAPI.value = selectedWalletTypeData.value?.name || ''

    // Sync with store
    walletStore.setSelectedWalletType(newType, selectedWalletTypeAPI.value)

    await Promise.all([loadWalletBalance(), loadTransactionSummary()])
  }
})

// Initialize data on component mount
onMounted(async () => {
  await loadWalletTypes()
  await loadWalletBalance()
  // Load transaction summary for the first time
  if (selectedWalletType.value) {
    await loadTransactionSummary()
  }
})

// Methods
const refreshBalances = async () => {
  isRefreshing.value = true
  isWalletLoading.value = true

  try {
    await Promise.all([loadWalletBalance(), loadTransactionSummary()])
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  } finally {
    isRefreshing.value = false
    isWalletLoading.value = false
  }
}

const navigateToHistory = () => {
  // Set the wallet type filter in the store
  if (selectedWalletType.value && selectedWalletTypeAPI.value) {
    walletStore.setupTransactionHistoryFilter({
      walletType: selectedWalletTypeAPI.value,
      period: 'this_month',
    })
  }

  // Check if it's a settlement wallet type
  const walletTypeLower = selectedWalletTypeAPI.value.toLowerCase()
  const isSettlementWallet = walletTypeLower.includes('settlement')

  // Navigate to appropriate page based on wallet type
  if (isSettlementWallet) {
    navigateTo('/digital-wallet/settlement')
  } else {
    navigateTo('/transactions')
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    showSuccess({ title: t('wallet_page.copy_success_message') })
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}
</script>

<style scoped>
/* Clean styling for the Stripe-inspired design */
.hover\:shadow-md:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
