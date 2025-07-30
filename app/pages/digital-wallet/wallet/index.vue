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
    <div class="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-3 rounded">
      <!-- Selected Wallet Display -->
      <div v-if="walletTypes.length > 0 && walletBalanceItems.length > 0" class="mb-6">
        <!-- Main Wallet Card -->
        <div
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
      </div>

      <!-- Loading State for Main Wallet -->
      <div v-else-if="isWalletLoading || isLoadingWalletTypes" class="mb-6">
        <div
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
            <div
              v-if="!isLoadingSummary && !isLoadingWalletTypes"
              class="flex items-center justify-between mb-4"
            >
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
            <div v-if="!isLoadingSummary" class="flex items-center justify-between mb-4">
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
            <div v-if="!isLoadingSummary" class="flex items-center justify-between mb-4">
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
      <div v-if="walletTypes.length > 0 && selectedWalletType && !isWalletLoading" class="mt-8">
        <BaseTable
          :data="transactions"
          :columns="transactionColumns"
          table-id="wallet-transactions"
          border-class="border-gray-200 dark:border-gray-700"
          :page="currentPage"
          :page-size="pageSize"
          :total="totalTransactions"
          :total-page="Math.ceil(totalTransactions / pageSize)"
          @filter-change="handleTransactionFilterChange"
          @row-click="openTransactionDetail"
          @search-change="
            (val: string) => {
              transactionFilters.search = val
              debouncedSearch()
            }
          "
          @update:page="
            (val: number) => {
              currentPage = val
              loadTransactions(false)
            }
          "
          @update:page-size="
            (val: number) => {
              pageSize = val
              currentPage = 1
              loadTransactions(true)
            }
          "
        >
          <template #empty>
            <TableEmptyState />
          </template>
        </BaseTable>
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
import { useDebounceFn } from '@vueuse/core'
import type { BaseTableColumn } from '~/components/tables/table'
import type { WalletBalanceItem } from '~~/server/model/pgw_module_api/wallet'
import type { WalletSummaryData } from '~~/server/model/pgw_module_api/transactionSummary'
import type { WalletTransaction } from '~~/server/model/pgw_module_api/walletTransactions'
import BaseTable from '~/components/tables/BaseTable.vue'

// Define page meta
definePageMeta({
  title: 'Digital Wallet',
  description: 'Manage your wallet balances and transactions',
})

// Composables
const { formatCurrency } = useCurrency()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { getWalletTypes, getWalletBalance, getTopUpSummary, getFeeSummary, getWalletTransactions } =
  usePgwModuleApi()
const { t } = useI18n()

// Wallet store
const walletStore = useWalletStore()

// Reactive data
const isRefreshing = ref(false)
const isWalletLoading = ref(false)
const summaryDisplayCurrency = ref('KHR')
const isLoadingWalletTypes = ref(false)
const isLoadingSummary = ref(false)

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

// Transaction list state
const transactions = ref<WalletTransaction[]>([])
const isLoadingTransactions = ref(false)
const isLoadingMore = ref(false)
const hasMoreTransactions = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const totalTransactions = ref(0)

// Transaction filters
const transactionFilters = ref({
  type: '',
  status: '',
  search: '',
})

// Transaction list ref for infinite scroll

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

// Transaction helper methods
const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'top_up':
      return 'i-heroicons-arrow-down-circle'
    case 'settlement':
      return 'i-heroicons-banknotes'
    case 'transfer':
      return 'i-heroicons-arrow-right-circle'
    case 'payment':
      return 'i-heroicons-credit-card'
    default:
      return 'i-heroicons-document-text'
  }
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'top_up':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    case 'settlement':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'transfer':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'payment':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    case 'cancelled':
      return 'neutral'
    default:
      return 'neutral'
  }
}

const getAmountColor = (type: string, amount: number) => {
  if (type === 'top_up' && amount > 0) {
    return 'text-green-600 dark:text-green-400'
  } else if (type === 'payment' || type === 'transfer') {
    return 'text-red-600 dark:text-red-400'
  }
  return 'text-gray-900 dark:text-white'
}

const formatTransactionAmount = (amount: number, currency: string, type: string) => {
  const prefix = type === 'top_up' ? '+' : type === 'payment' || type === 'transfer' ? '-' : ''
  return `${prefix}${formatCurrency(amount, currency)}`
}

const formatTransactionDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

// Transaction Table Columns
const transactionColumns = computed<BaseTableColumn<WalletTransaction>[]>(() => [
  {
    id: 'type',
    accessorKey: 'transaction_type',
    header: t('wallet_page.transaction_type'),
    enableColumnFilter: true,
    filterOptions: [
      { label: t('wallet_page.transaction_types.all'), value: '' },
      { label: t('wallet_page.transaction_types.top_up'), value: 'top_up' },
      { label: t('wallet_page.transaction_types.settlement'), value: 'settlement' },
      { label: t('wallet_page.transaction_types.transfer'), value: 'transfer' },
      { label: t('wallet_page.transaction_types.payment'), value: 'payment' },
    ],
    cell: ({ row }) => {
      const transaction = row.original
      return h('div', { class: 'flex items-center space-x-3' }, [
        h(
          'div',
          {
            class: `w-8 h-8 rounded-lg flex items-center justify-center ${getTransactionTypeColor(transaction.transaction_type)}`,
          },
          [
            h('UIcon', {
              name: getTransactionTypeIcon(transaction.transaction_type),
              class: 'w-4 h-4',
            }),
          ]
        ),
        h(
          'span',
          { class: 'font-medium' },
          t(`wallet_page.transaction_types.${transaction.transaction_type}`)
        ),
      ])
    },
  },
  {
    id: 'details',
    header: t('wallet_page.transaction_details'),
    cell: ({ row }) => {
      const transaction = row.original
      return h('div', { class: 'space-y-1' }, [
        h(
          'div',
          { class: 'font-medium text-sm' },
          transaction.description || transaction.transaction_no
        ),
        h('div', { class: 'text-xs text-gray-500 space-x-2' }, [
          h('span', {}, transaction.transaction_no),
          transaction.counterparty_name && h('span', {}, ` • ${transaction.counterparty_name}`),
        ]),
      ])
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('wallet_page.status'),
    enableColumnFilter: true,
    filterOptions: [
      { label: t('wallet_page.transaction_statuses.all'), value: '' },
      { label: t('wallet_page.transaction_statuses.pending'), value: 'pending' },
      { label: t('wallet_page.transaction_statuses.completed'), value: 'completed' },
      { label: t('wallet_page.transaction_statuses.failed'), value: 'failed' },
      { label: t('wallet_page.transaction_statuses.cancelled'), value: 'cancelled' },
    ],
    cell: ({ row }) => {
      const transaction = row.original
      return h('UBadge', {
        label: t(`wallet_page.transaction_statuses.${transaction.status}`),
        color: getStatusColor(transaction.status),
        variant: 'subtle',
        size: 'xs',
      })
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: t('wallet_page.amount'),
    cell: ({ row }) => {
      const transaction = row.original
      return h('div', { class: 'text-right' }, [
        h(
          'div',
          {
            class: `font-semibold ${getAmountColor(transaction.transaction_type, transaction.amount)}`,
          },
          formatTransactionAmount(
            transaction.amount,
            transaction.currency,
            transaction.transaction_type
          )
        ),
        transaction.fee_amount &&
          h(
            'div',
            {
              class: 'text-xs text-gray-500',
            },
            `${t('wallet_page.fee_amount')}: ${formatCurrency(transaction.fee_amount, transaction.currency)}`
          ),
      ])
    },
  },
  {
    id: 'date',
    accessorKey: 'created_date',
    header: t('wallet_page.date'),
    cell: ({ row }) => {
      const transaction = row.original
      return h(
        'div',
        { class: 'text-sm text-gray-600' },
        formatTransactionDate(transaction.created_date)
      )
    },
  },
])

// Transaction filter handler
const handleTransactionFilterChange = (columnId: string, value: string) => {
  if (columnId === 'type') {
    transactionFilters.value.type = value
  } else if (columnId === 'status') {
    transactionFilters.value.status = value
  }
  loadTransactions(true)
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

    // Load data sequentially: wallet balance -> summary -> transactions
    await loadWalletBalance()
    await loadTransactionSummary()
    await loadTransactions(true)
  }
})

// Watch transaction filters
watch(
  () => transactionFilters.value.type,
  () => {
    loadTransactions(true)
  }
)

watch(
  () => transactionFilters.value.status,
  () => {
    loadTransactions(true)
  }
)

// Initialize data on component mount
onMounted(async () => {
  // Step 1: Load wallet types first
  await loadWalletTypes()

  // Step 2: Load wallet balance after wallet types are loaded
  if (selectedWalletType.value) {
    await loadWalletBalance()

    // Step 3: Load transaction summary after wallet balance is loaded
    await loadTransactionSummary()

    // Step 4: Finally load transactions
    await loadTransactions(true)
  }
})

// Methods
const refreshBalances = async () => {
  isRefreshing.value = true
  isWalletLoading.value = true

  // Temporarily pause auto-refresh during manual refresh
  const wasAutoRefreshEnabled = isAutoRefreshEnabled.value
  if (wasAutoRefreshEnabled) {
    stopCountdown()
  }

  try {
    // Load data sequentially: wallet balance -> summary -> transactions
    await loadWalletBalance()
    await loadTransactionSummary()
    await loadTransactions(true)
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  } finally {
    isRefreshing.value = false
    isWalletLoading.value = false

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

// Transaction methods
const loadTransactions = async (reset = false) => {
  if (!selectedWalletType.value) return

  const selectedWallet = walletTypes.value.find((type) => type.id === selectedWalletType.value)
  if (!selectedWallet) return

  try {
    if (reset) {
      isLoadingTransactions.value = true
      currentPage.value = 1
      transactions.value = []
    } else {
      isLoadingMore.value = true
    }

    const response = await getWalletTransactions({
      wallet_id: selectedWallet.walletId,
      page: currentPage.value,
      page_size: pageSize.value,
      transaction_type: (transactionFilters.value.type || undefined) as
        | 'top_up'
        | 'settlement'
        | 'transfer'
        | 'payment'
        | undefined,
      status: (transactionFilters.value.status || undefined) as
        | 'completed'
        | 'pending'
        | 'failed'
        | 'cancelled'
        | undefined,
      search: transactionFilters.value.search || undefined,
    })

    if (response.data?.transactions) {
      if (reset) {
        transactions.value = response.data.transactions
      } else {
        transactions.value.push(...response.data.transactions)
      }

      totalTransactions.value = response.data.total_count
      hasMoreTransactions.value = response.data.has_more

      if (response.data.has_more) {
        currentPage.value++
      }
    }
  } catch (error) {
    console.error('Failed to load transactions:', error)
    if (reset) {
      transactions.value = []
    }
  } finally {
    isLoadingTransactions.value = false
    isLoadingMore.value = false
  }
}

const openTransactionDetail = (transaction: WalletTransaction) => {
  // TODO: Implement transaction detail modal or navigation
  console.log('Open transaction detail:', transaction)
}

// Debounced search function
const debouncedSearch = useDebounceFn(() => {
  loadTransactions(true)
}, 500)

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
