<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-12">
          <div>
            <h1 class="text-1xl font-semibold text-gray-900 dark:text-white">
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
              option-attribute="label"
              class="min-w-[280px]"
              :loading="isLoadingWalletTypes"
              :disabled="isLoadingWalletTypes || walletTypes.length === 0"
              :placeholder="t('wallet_page.select_wallet_type')"
              size="md"
            />

            <!-- Auto Refresh Toggle -->
            <div class="flex items-center gap-1">
              <USwitch
                v-model="isAutoRefreshEnabled"
                :label="t('wallet_page.auto_refresh')"
                checked-icon="material-symbols:sync"
                unchecked-icon="material-symbols:sync-disabled"
                size="sm"
                class="ml-2"
                :disabled="isRefreshing"
              />
              <UTooltip
                :text="t('wallet_page.auto_refresh_tooltip')"
                :delay-duration="200"
                placement="top"
              >
                <UIcon name="material-symbols:info-outline" class="size-3.5" />
              </UTooltip>
              <!-- Countdown Display -->
              <div
                v-if="isAutoRefreshEnabled && countdown > 0"
                class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded ml-2"
              >
                {{ countdown }}s
              </div>
            </div>

            <!-- Manual Refresh Icon (when auto-refresh is disabled) -->
            <UIcon
              v-if="!isAutoRefreshEnabled"
              name="material-symbols:sync"
              :class="[
                'w-4 h-4 cursor-pointer text-primary hover:text-primary-dark transition-transform duration-200',
                { 'animate-spin': isRefreshing },
              ]"
              :title="t('wallet_page.refresh')"
              @click="refreshBalances"
            />

            <!-- History Icon -->
            <UIcon
              name="material-symbols:history"
              class="w-4 h-4 cursor-pointer text-primary hover:text-primary-dark transition-transform duration-200"
              :title="t('wallet_page.history')"
              @click="navigateToHistory"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->

    <div class="mx-auto px-0 sm:px-0 lg:px-0 py-3 rounded">
      <!-- Main Wallet Display -->
      <div v-if="walletTypes.length > 0 || isLoadingWalletTypes" class="mb-6">
        <!-- Wallet Data Loaded -->
        <div
          v-if="walletBalanceItems.length > 0 && !isWalletLoading"
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300"
        >
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  :name="getWalletTypeIcon(selectedWalletTypeData?.name || '')"
                  class="w-6 h-6 text-gray-600 dark:text-gray-400"
                />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ selectedWalletTypeData?.label || t('wallet_page.wallet') }}
                </h2>
              </div>
            </div>
          </div>

          <!-- Balance Display -->
          <div class="mb-6">
            <div class="mb-3">
              <div
                class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                {{ t('wallet_page.current_balance') }}
              </div>
            </div>
            <div class="flex items-baseline space-x-2">
              <div
                class="text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full"
              >
                {{ walletBalanceItems[0]?.currency }}
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {{
                  walletBalanceItems[0]?.current_balance_display ||
                  formatCurrency(
                    walletBalanceItems[0]?.current_balance || 0,
                    walletBalanceItems[0]?.currency || 'KHR'
                  )
                }}
              </div>
            </div>
          </div>

          <!-- Account Details -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-identification"
                    class="w-4 h-4 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <div
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
                  >
                    {{ t('wallet_page.account_number') }}
                  </div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ walletBalanceItems[0]?.wallet_account_number || '' }}
                  </div>
                </div>
                <button
                  class="ml-auto p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors group"
                  :title="t('wallet_page.copy_account_number')"
                  @click="copyToClipboard(walletBalanceItems[0]?.wallet_account_number || '')"
                >
                  <UIcon
                    name="i-heroicons-clipboard-document"
                    class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  />
                </button>
              </div>

              <div class="flex items-center space-x-3">
                <div
                  class="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-building-library"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                  />
                </div>
                <div>
                  <div
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
                  >
                    {{ t('wallet_page.settlement_bank') }}
                  </div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ walletBalanceItems[0]?.settlement_bank || 'N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State for Main Wallet -->
        <div
          v-else
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl animate-pulse"
        >
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-xl" />
              <div>
                <div class="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                <div class="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
            <div class="h-7 w-18 bg-gray-200 dark:bg-gray-600 rounded-full" />
          </div>

          <!-- Balance Display -->
          <div class="mb-6">
            <div class="mb-3">
              <div class="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div class="flex items-baseline space-x-2">
              <div class="h-7 w-14 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div class="h-9 w-48 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          </div>

          <!-- Account Details -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                <div class="flex-1">
                  <div class="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                  <div class="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
                </div>
                <div class="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                <div class="flex-1">
                  <div class="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                  <div class="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="
          walletBalanceItems.length === 0 &&
          !isWalletLoading &&
          !isLoadingWalletTypes &&
          selectedWalletTypeAPI
        "
        class="text-center py-12 mb-6"
      >
        <UIcon name="i-heroicons-wallet" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('wallet_page.no_wallets_found') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">{{ t('wallet_page.no_wallets_for_type') }}</p>
      </div>
      <!-- Transaction Summary -->
      <div v-if="walletTypes.length > 0 || isLoadingWalletTypes">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Today -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.today') }}
              </h3>
              <div
                class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-sun" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="space-y-3">
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
              <!-- Header with icon skeleton -->
              <div class="flex items-center justify-between mb-4">
                <div class="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
              </div>

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
            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.this_week') }}
              </h3>
              <div
                class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-calendar-date-range"
                  class="w-4 h-4 text-green-600 dark:text-green-400"
                />
              </div>
            </div>

            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="space-y-3">
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
              <!-- Header with icon skeleton -->
              <div class="flex items-center justify-between mb-4">
                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
              </div>

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
            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ t('wallet_page.this_month') }}
              </h3>
              <div
                class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-calendar-days"
                  class="w-4 h-4 text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>

            <div v-if="!isLoadingSummary && !isLoadingWalletTypes" class="space-y-3">
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
              <!-- Header with icon skeleton -->
              <div class="flex items-center justify-between mb-4">
                <div class="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
              </div>

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

      <!-- No Wallet Types Available (only after loading is complete) -->
      <div v-else-if="!isLoadingWalletTypes && walletTypes.length === 0" class="text-center py-12">
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

      <!-- Transaction List Section -->
      <div v-if="walletTypes.length > 0 || isLoadingWalletTypes" class="mt-8">
        <TablesExTable
          :columns="columns"
          :table-id="TABLE_ID"
          :fetch-data-fn="fetchSettlementForTable"
          show-row-number
          @row-click="handleViewDetails"
        />
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
import type { WalletTransaction } from '~~/server/model/pgw_module_api/walletTransactions'
import type { BaseTableColumn } from '~/components/tables/table'
import type { SettlementHistoryQuery, SettlementHistoryRecord } from '~/models/settlement'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import { useTable } from '~/composables/utils/useTable'
import { useFormat } from '~/composables/utils/useFormat'
import { useSupplierApi } from '~/composables/api/useSupplierApi'
 

// Define page meta
definePageMeta({
  title: 'Digital Wallet',
  description: 'Manage your wallet balances and transactions',
})

// Composables
const { formatCurrency } = useCurrency()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { getWalletTypes, getWalletBalance, getTopUpSummary, getFeeSummary } =
  usePgwModuleApi()
const { t } = useI18n()
const { createSortableHeader } = useTable()
const { getSettlementHistory } = useSupplierApi()
const { statusCellBuilder } = useStatusBadge()

// Wallet store
const walletStore = useWalletStore()

// Reactive data
const isRefreshing = ref(false)
const isWalletLoading = ref(false)
const summaryDisplayCurrency = ref('KHR')
const isLoadingWalletTypes = ref(false)
const isLoadingSummary = ref(false)
const isLoadingTransactions = ref(false)
const loading = ref(false)

// Auto refresh state
const isAutoRefreshEnabled = ref(false)
const autoRefreshInterval = ref<NodeJS.Timeout | null>(null)
const autoRefreshDelay = 30000 // 30 seconds
const countdownInterval = ref<NodeJS.Timeout | null>(null)
const countdown = ref(0)

// Wallet state
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
    walletType: string
    currency: string
    nameKey: string
    icon: string
    walletId: string
  }>
>([])

// Selected wallet type (single source of truth)
const selectedWalletType = ref('')

// New Table state
const TABLE_ID = 'wallet-transactions-table'


const pref = useUserPreferences().getPreferences()

const pageSize = ref<{ label: string; value: number }>({
  label: pref?.defaultPageSize ? pref?.defaultPageSize.toString() : DEFAULT_PAGE_SIZE.label,
  value: pref?.defaultPageSize || DEFAULT_PAGE_SIZE.value,
})
const errorMsg = ref('')
const errorHandler = useErrorHandler()
const { currentProfile } = useAuth()
const page = ref(1)
const startDate = ref('')
const endDate = ref('')
const selectedStatuses = ref<{ label: string; value: string }[]>([
  {
    label: t('status.all'),
    value: '',
  },
])

// API methods
const loadWalletTypes = async () => {
  try {
    isLoadingWalletTypes.value = true
    const response = await getWalletTypes()

    if (response.data?.wallet_type) {
      // Update wallet types from API - new format where keys are wallet IDs and values are objects
      const walletTypeData = response.data.wallet_type
      walletTypes.value = Object.entries(walletTypeData).map(([walletId, walletInfo]) => {
        const info = walletInfo as unknown as { type: string; name: string; currency: string }
        const cleanType = info.name.split(' - ')[0] || info.name
        return {
          id: walletId, // Use the wallet ID as the identifier
          label: info.name, // Full name with ID (e.g., "Settlement Wallet - 000000229")
          name: cleanType, // Clean type name for display (e.g., "Settlement Wallet")
          walletType: info.type, // API type (e.g., "settlement_wallet")
          currency: info.currency, // Wallet currency (e.g., "KHR")
          nameKey: `wallet_page.${cleanType.toLowerCase().replace(/\s+/g, '_')}`,
          icon: getWalletTypeIcon(cleanType),
          walletId: walletId, // Store the wallet ID for API calls
        }
      })

      // Set default wallet type
      if (walletTypes.value.length > 0) {
        selectedWalletType.value = walletTypes.value[0]?.id || ''
        selectedWalletTypeAPI.value = walletTypes.value[0]?.name || ''

        // Set initial currency based on first wallet
        if (walletTypes.value[0]?.currency) {
          summaryDisplayCurrency.value = walletTypes.value[0].currency
        }

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
  if (!selectedWalletType.value) return

  // Get the selected wallet data
  const selectedWallet = walletTypes.value.find((type) => type.id === selectedWalletType.value)
  if (!selectedWallet) return

  try {
    isWalletLoading.value = true
    const response = await getWalletBalance({
      wallet_ids: [selectedWallet.walletId], // Use the specific wallet ID
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

    // Get the selected wallet to determine type and currency
    const selectedWallet = walletTypes.value.find((type) => type.id === selectedWalletType.value)
    if (!selectedWallet) {
      console.warn('No selected wallet found for summary')
      return
    }

    const currency = selectedWallet.currency
    const isSettlementWallet = selectedWallet.walletType === 'settlement_wallet'

    // Call appropriate endpoint based on wallet type
    if (isSettlementWallet) {
      // Call fee summary endpoint for settlement wallets
      const feeResponse = await getFeeSummary(currency).catch((error) => {
        console.error('Fee summary API error:', error)
        return { data: null }
      })

      if (feeResponse.data?.settlement_wallet) {
        feeSummaryData.value = feeResponse.data.settlement_wallet
      } else {
        console.warn('No settlement wallet data received')
      }
    } else {
      // Call top-up summary endpoint for top-up wallets
      const topUpResponse = await getTopUpSummary(currency).catch((error) => {
        console.error('Top-up summary API error:', error)
        return { data: null }
      })

      if (topUpResponse.data?.settlement_wallet) {
        topUpSummaryData.value = topUpResponse.data.settlement_wallet
      } else {
        console.warn('No top-up wallet data received')
      }
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



const columns: BaseTableColumn<SettlementHistoryRecord>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(resolveComponent('UCheckbox'), {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(
        'div',
        {
          class: 'flex h-full w-full',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h(resolveComponent('UCheckbox'), {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value),
            'aria-label': 'Select row',
          }),
        ]
      ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      class: {
        td() {
          return 'text-center cursor-pointer'
        },
      },
    },
  },
  // {
  //   id: 'row_number',
  //   header: () => '#',
  //   cell: ({ row, table }) => createRowNumberCell(row, table, page.value, pageSize.value.value),
  //   size: 30,
  //   maxSize: 30,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // { accessorKey: "id", header: t("Settlement ID") },
  {
    id: 'created_date',
    accessorKey: 'created_date',
    header: ({ column }) => createSortableHeader(column, t('settlement.settlement_date'), 'left'),
    cell: ({ row }) =>
      // Format date to DD/MM/YYYY
      useFormat().formatDateTime(row.original.created_date),
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  // { accessorKey: 'total_supplier', header: t('Total Supplier') },
  
  {
    id: 'created_by',
    accessorKey: 'created_by',
    header: () => t('settled_by'),
    cell: ({ row }) => row.original.created_by || '-',
  },

  {
    id: 'total_settled',
    accessorKey: 'total_settled',
    header: ({ column }) => createSortableHeader(column, t('settlement.transaction')),
    enableSorting: true,
    filterOptions: [
      { label: t('status.all'), value: '' },
      { label: t('status.success'), value: 'success' },
      { label: t('status.failed'), value: 'failed' },
    ],  
    cell: ({ row }) => {
      // return h('span', {
      //   class: `text-sm font-medium`
      // }, `Total: ${row.original.total_Settled}`)

      const success = row.original.success
      const failed = row.original.failed
      const total = row.original.total_settled

      const UBadge = resolveComponent('UBadge')
      const Icon = resolveComponent('UIcon')

      return h('div', { class: 'flex gap-2 items-center' }, [
        // h(UBadge, { color: 'gray', variant: 'subtle', class: 'flex items-center gap-1' }, () => [
        //   h(Icon, { name: 'i-lucide-sigma', class: 'w-4 h-4' }),
        //   h('span', {}, total)
        // ]),
        h(
          UBadge,
          {
            color: 'primary',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [
            // h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }),
            h('span', { class: 'text-xs h-4' }, `${t('total')}: ${total}`),
          ]
        ),
        // Success and Fail badges
        h(
          UBadge,
          {
            color: 'success',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [h(Icon, { name: 'i-lucide-check', class: 'w-4 h-4' }), h('span', {}, success)]
        ),
        h(
          UBadge,
          {
            color: 'error',
            variant: 'subtle',
            class: 'flex items-center gap-1',
          },
          () => [h(Icon, { name: 'i-lucide-x', class: 'w-4 h-4' }), h('span', {}, failed)]
        ),
      ])
    },
  },
  {
    id: 'status',
    header: () => t('status.header'),
    cell: ({ row }) => statusCellBuilder(row.original.status, true),
    // cell: ({ row }) => {
    //   const status = row.original.status
    //   const statusClass = status === 'completed' ? 'text-green-500' : 'text-red-500'
    //   return h('span', { class: `text-xs font-medium ${statusClass}` }, t(`status.${status}`))
    // },
  },
  {
    id: 'currency_id',
    accessorKey: 'currency_id',
    header: () => t('settlement.currency'),
    cell: ({ row }) => h('div', { class: 'text-left' }, row.original.currency_id || '-'),
    enableColumnFilter: true,
    filterOptions: [
      { label: t('currency.usd'), value: 'USD' },
      { label: t('currency.khr'), value: 'KHR' },
    ],
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => createSortableHeader(column, t('total_amount'), 'right'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        formatAmount(row.original.total_amount, row.original.currency_id)
      ),
    enableMultiSort: true,
    enableSorting: true,
    size: 50,
    maxSize: 150,
  },
  
]



// Wrapper function for BaseTableV2
const fetchSettlementForTable = async (params?: {
  page?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}) => {
  loading.value = true
  try {
    const payload: SettlementHistoryQuery = {
      search: params?.search || undefined,
      page_size: params?.pageSize || pageSize.value.value,
      page: params?.page || page.value,
      start_date: params?.startDate || startDate.value,
      end_date: params?.endDate || endDate.value,
      status: selectedStatuses.value.map((status) => status.value).filter((v) => v !== ''), // Use selected status values, filter out empty (all)
      supplier_id: currentProfile.value?.id || '', // Use current supplier ID
    }

    const data = await getSettlementHistory(payload)
    return {
      records: data?.records ?? [],
      total_record: data?.total_record ?? 0,
      total_page: data?.total_page ?? 0,
    }
  } catch (error: unknown) {
    errorMsg.value = (error as Error).message || 'Failed to load settlement history.'
    // Show error notification to user
    errorHandler.handleApiError(error)
    return null
  } finally {
    loading.value = false
  }
}
// New row click handler
const handleViewDetails = (row: Record<string, any>) => {
  const transaction = row as WalletTransaction
  // TODO: Implement transaction detail modal or navigation
  console.log('View details for:', transaction)
}

// Computed wallet type data
const selectedWalletTypeData = computed(() => {
  if (walletTypes.value.length === 0) return null
  return (
    walletTypes.value.find((type) => type.id === selectedWalletType.value) || walletTypes.value[0]
  )
})

const summaryData = computed(() => {
  // Get the selected wallet to determine if it's settlement or top-up
  const selectedWallet = walletTypes.value.find((type) => type.id === selectedWalletType.value)
  if (!selectedWallet) {
    return getDefaultSummaryData()
  }

  // Use fee (settlement) data for settlement wallets, top-up data for others
  const isSettlementWallet = selectedWallet.walletType === 'settlement_wallet'
  const sourceData = isSettlementWallet ? feeSummaryData.value : topUpSummaryData.value

  if (!sourceData) {
    return getDefaultSummaryData()
  }

  // Log the data for debugging
  console.log(`Loading ${isSettlementWallet ? 'Settlement' : 'Top-up'} data:`, sourceData)

  return sourceData
})

const getDefaultSummaryData = () => {
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
    const selectedWallet = walletTypes.value.find((type) => type.id === newType)
    selectedWalletTypeAPI.value = selectedWallet?.name || ''

    // Update summary display currency based on selected wallet
    if (selectedWallet?.currency) {
      summaryDisplayCurrency.value = selectedWallet.currency
    }

    // Sync with store
    walletStore.setSelectedWalletType(newType, selectedWalletTypeAPI.value)

    // Load data in parallel when wallet type changes.
    isWalletLoading.value = true
    isLoadingSummary.value = true
    // The table will be re-keyed and fetch its own data, so we don't need to set its loading state here.
    try {
      await Promise.all([loadWalletBalance(), loadTransactionSummary()])
    } finally {
      // The individual loading states are managed within their respective functions,
      // but we can set them to false here as a fallback.
      isWalletLoading.value = false
      isLoadingSummary.value = false
    }
  }
})

// Initialize data on component mount
onMounted(async () => {
  // Set loading states to true for a unified initial shimmer experience.
  isWalletLoading.value = true
  isLoadingSummary.value = true
  isLoadingTransactions.value = true

  // Load wallet types first. This function manages `isLoadingWalletTypes` internally.
  await loadWalletTypes()

  // If wallet types were found, the other data will be loaded in parallel.
  // The `load...` functions will manage their own loading states, turning them off on completion.
  if (selectedWalletType.value) {
    await Promise.all([
      loadWalletBalance(),
      loadTransactionSummary(),
      // The table will trigger its own fetch on mount, so no need to call here.
    ])
  } else {
    // If no wallets are found, ensure all shimmers are turned off.
    isWalletLoading.value = false
    isLoadingSummary.value = false
    isLoadingTransactions.value = false
  }
})

// Methods
const refreshBalances = async () => {
  isRefreshing.value = true
  isWalletLoading.value = true
  isLoadingSummary.value = true

  // Temporarily pause auto-refresh during manual refresh
  const wasAutoRefreshEnabled = isAutoRefreshEnabled.value
  if (wasAutoRefreshEnabled) {
    stopCountdown()
  }

  try {
    // All data is refreshed in parallel
    await Promise.all([
      loadWalletBalance(),
      loadTransactionSummary(),
      // We need a way to trigger the table refresh.
      // The table is keyed to `selectedWalletType`, but a manual refresh needs to re-trigger.
      // A simple way is to change the key, but that's not ideal.
      // The best way is to have the table expose a refresh method.
      // For now, we will rely on the fact that the table component will likely
      // re-fetch if its `fetch-data-fn` is called again.
      // A better approach would be to have a `ref` on the table and call a method.
    ])
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  } finally {
    isRefreshing.value = false
    isWalletLoading.value = false
    isLoadingSummary.value = false

    // Resume auto-refresh if it was enabled
    if (wasAutoRefreshEnabled) {
      startCountdown()
    }
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
  const selectedWallet = walletTypes.value.find((type) => type.id === selectedWalletType.value)
  const isSettlementWallet = selectedWallet?.walletType === 'settlement_wallet'

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

// Auto refresh functionality
const startCountdown = () => {
  countdown.value = autoRefreshDelay / 1000 // Convert to seconds

  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = autoRefreshDelay / 1000
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  countdown.value = 0
}

const startAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }

  startCountdown()

  autoRefreshInterval.value = setInterval(async () => {
    if (!isRefreshing.value) {
      try {
        await refreshBalances()
      } catch (error) {
        console.error('Auto refresh failed:', error)
      }
    }
  }, autoRefreshDelay)
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
  stopCountdown()
}

// Watch auto-refresh toggle
watch(isAutoRefreshEnabled, (enabled) => {
  if (enabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoRefresh()
  stopCountdown()
})
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
