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
          v-if="walletTypes.length > 0 || isLoadingWalletTypes"
          v-model="selectedWalletType"
          :items="walletTypes"
          value-key="id"
          class="min-w-40 transition-all duration-300"
          :loading="isLoadingWalletTypes"
          :disabled="isLoadingWalletTypes || walletTypes.length === 0"
          :search-input="{
            placeholder: 'Search wallet types...',
            icon: 'i-heroicons-magnifying-glass',
          }"
        >
          <template #default>
            <UButton
              variant="outline"
              size="sm"
              class="justify-between transition-all duration-300 hover:scale-105 hover:shadow-md"
              :class="{ 'animate-pulse': isWalletLoading || isLoadingWalletTypes }"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full transition-colors duration-300"
                  :class="walletTypeColors.indicator"
                />
                <UIcon
                  v-if="selectedWalletTypeData?.icon"
                  :name="selectedWalletTypeData.icon"
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                <UIcon
                  v-else-if="isLoadingWalletTypes"
                  name="i-heroicons-arrow-path"
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                <span v-if="isLoadingWalletTypes">
                  {{ t('wallet_page.loading_wallet_types', 'Loading wallet types...') }}
                </span>
                <span v-else>
                  {{
                    t(
                      selectedWalletTypeData?.nameKey || 'wallet_page.wallet',
                      selectedWalletTypeData?.name || 'Wallet'
                    )
                  }}
                </span>
              </div>
              <UIcon
                name="i-heroicons-chevron-down-20-solid"
                class="transition-transform duration-300"
              />
            </UButton>
          </template>
        </USelectMenu>

        <!-- No Wallet Types Message -->
        <div
          v-else
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-40"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-500" />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('wallet_page.no_wallet_types', 'No wallet types available') }}
          </span>
        </div>

        <UButton
          icon="i-material-symbols-light-refresh"
          variant="ghost"
          size="sm"
          :loading="isRefreshing"
          @click="refreshBalances"
        >
          <span class="hidden sm:inline">{{ t('wallet_page.refresh', 'Refresh') }}</span>
        </UButton>
        <!-- <UButton
          icon="i-material-symbols-light-history"
          color="neutral"
          variant="solid"
          size="sm"
          @click="navigateToHistory"
        >
          <span class="hidden sm:inline">{{ t('wallet_page.view_history', 'View History') }}</span>
        </UButton> -->
      </div>
    </div>

    <!-- Wallet Balance Cards -->
    <div v-if="walletTypes.length > 0 || isLoadingWalletTypes" class="w-full">
      <!-- Horizontal Scroll Container -->
      <div class="relative">
        <!-- Left gradient overlay -->
        <div
          v-if="walletBalanceItems.length > 1"
          class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-50 to-transparent dark:from-neutral-900 z-10 pointer-events-none gradient-overlay"
        />

        <!-- Right gradient overlay -->
        <div
          v-if="walletBalanceItems.length > 1"
          class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent dark:from-neutral-900 z-10 pointer-events-none gradient-overlay"
        />

        <!-- Wallet Cards Container -->
        <div
          ref="walletContainer"
          class="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
          @scroll="handleScroll"
        >
          <!-- Individual Wallet Cards -->
          <div
            v-for="(wallet, index) in walletBalanceItems"
            :key="`wallet-${wallet.wallet_account_number}-${index}`"
            class="flex-shrink-0 w-80 md:w-96 snap-start"
          >
            <UCard
              class="relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg h-full border-0 shadow-sm"
              :class="[
                isWalletLoading ? 'animate-pulse' : '',
                getCurrencyCardClass(wallet.currency),
              ]"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 rounded-lg transition-transform duration-300 relative"
                      :class="[getCurrencyIconClass(wallet.currency)]"
                    >
                      <Icon
                        name="i-material-symbols-light-account-balance-wallet"
                        class="w-6 h-6 text-white"
                      />
                      <!-- Loading spinner overlay -->
                      <div
                        v-if="isWalletLoading"
                        class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
                      >
                        <div
                          class="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <h3
                        class="font-semibold text-gray-900 dark:text-white transition-colors duration-300"
                      >
                        <span v-if="!isWalletLoading">
                          {{
                            t(
                              `wallet_page.${wallet.currency.toLowerCase()}_wallet`,
                              `${wallet.currency} Wallet`
                            )
                          }}
                        </span>
                        <div
                          v-else
                          class="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                        />
                      </h3>
                      <div
                        class="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300"
                      >
                        <span v-if="!isWalletLoading">
                          {{ wallet.wallet_type }} - {{ t('wallet_page.account', 'Account') }}
                          {{ wallet.wallet_account_number }}
                        </span>
                        <div
                          v-else
                          class="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  <UBadge
                    v-if="!isWalletLoading"
                    :color="getCurrencyBadgeColor(wallet.currency)"
                    variant="subtle"
                    class="transition-all duration-300"
                  >
                    {{ t('wallet_page.active', 'Active') }}
                  </UBadge>
                  <div v-else class="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </template>

              <div class="space-y-4">
                <!-- Balance Display -->
                <div class="text-center transition-all duration-500 ease-in-out">
                  <div
                    class="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300"
                  >
                    <span v-if="!isWalletLoading">
                      {{ t('wallet_page.available_balance', 'Available Balance') }}
                    </span>
                    <div
                      v-else
                      class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"
                    />
                  </div>
                  <div class="relative">
                    <div
                      v-if="!isWalletLoading"
                      :key="`${wallet.currency}-${selectedWalletType}-${wallet.current_balance}`"
                      class="text-3xl font-bold transition-all duration-500 transform flex items-center justify-center gap-2"
                      :style="{ color: getCurrencyTextColor(wallet.currency) }"
                    >
                      <span class="text-2xl font-medium opacity-80">{{ wallet.currency }}</span>
                      {{
                        wallet.current_balance_display ||
                        formatCurrency(wallet.current_balance, wallet.currency)
                      }}
                    </div>
                    <div
                      v-else
                      class="h-10 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"
                    />
                  </div>
                </div>

                <!-- Account Details -->
                <div
                  class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                >
                  <div
                    class="flex justify-between items-center text-sm transition-colors duration-300"
                  >
                    <div class="text-gray-600 dark:text-gray-400">
                      <span v-if="!isWalletLoading">
                        {{ t('wallet_page.account_number', 'Account Number') }}
                      </span>
                      <div
                        v-else
                        class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="!isWalletLoading"
                        class="font-mono text-gray-900 dark:text-white transition-all duration-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {{ formatAccountNumber(wallet.wallet_account_number) }}
                      </span>
                      <div
                        v-else
                        class="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                      <UButton
                        v-if="!isWalletLoading"
                        icon="i-heroicons-clipboard-document"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        class="hover:bg-gray-200 dark:hover:bg-gray-600"
                        @click="copyToClipboard(wallet.wallet_account_number)"
                      />
                    </div>
                  </div>
                  <div class="flex justify-between text-sm transition-colors duration-300">
                    <div class="text-gray-600 dark:text-gray-400">
                      <span v-if="!isWalletLoading">
                        {{ t('wallet_page.wallet_type', 'Wallet Type') }}
                      </span>
                      <div
                        v-else
                        class="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                    </div>
                    <div class="text-gray-900 dark:text-white transition-colors duration-300">
                      <span v-if="!isWalletLoading">
                        {{ wallet.wallet_type }}
                      </span>
                      <div
                        v-else
                        class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                    </div>
                  </div>
                  <div
                    v-if="wallet.settlement_bank || isWalletLoading"
                    class="flex justify-between text-sm transition-colors duration-300"
                  >
                    <div class="text-gray-600 dark:text-gray-400">
                      <span v-if="!isWalletLoading">
                        {{ t('wallet_page.settlement_bank', 'Settlement Bank') }}
                      </span>
                      <div
                        v-else
                        class="h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                    </div>
                    <div class="text-gray-900 dark:text-white transition-colors duration-300">
                      <span v-if="!isWalletLoading">
                        {{ wallet.settlement_bank }}
                      </span>
                      <div
                        v-else
                        class="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Loading Skeleton Cards -->
          <template v-if="isWalletLoading && walletBalanceItems.length === 0">
            <div
              v-for="n in 3"
              :key="`skeleton-${n}`"
              class="flex-shrink-0 w-80 md:w-96 snap-start"
            >
              <UCard
                class="relative overflow-hidden h-full border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30"
              >
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-gray-300 dark:bg-gray-600 animate-pulse">
                        <div class="w-6 h-6" />
                      </div>
                      <div>
                        <div class="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        <div
                          class="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-1"
                        />
                      </div>
                    </div>
                    <div class="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </template>

                <div class="space-y-4">
                  <!-- Balance Display Skeleton -->
                  <div class="text-center">
                    <div
                      class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto mb-2"
                    />
                    <div
                      class="h-10 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"
                    />
                  </div>

                  <!-- Account Details Skeleton -->
                  <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      <div class="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div class="flex justify-between">
                      <div class="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      <div class="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </template>

          <!-- Empty State - Only show when not loading and no data -->
          <div
            v-if="
              walletBalanceItems.length === 0 &&
              !isWalletLoading &&
              !isLoadingWalletTypes &&
              selectedWalletTypeAPI
            "
            class="flex-shrink-0 w-80 md:w-96 snap-start"
          >
            <UCard class="h-full flex items-center justify-center">
              <div class="text-center space-y-4 py-8">
                <div class="flex justify-center">
                  <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <UIcon
                      name="i-heroicons-wallet"
                      class="w-8 h-8 text-gray-400 dark:text-gray-600"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ t('wallet_page.no_wallets_title', 'No Wallets Found') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{
                      t(
                        'wallet_page.no_wallets_for_type',
                        'No wallets available for this wallet type.'
                      )
                    }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Scroll Indicators -->
        <div v-if="walletBalanceItems.length > 1" class="flex justify-center mt-4 space-x-2">
          <div
            v-for="(wallet, index) in walletBalanceItems"
            :key="`indicator-${index}`"
            class="w-2 h-2 rounded-full cursor-pointer scroll-indicator"
            :class="{
              'bg-blue-500 dark:bg-blue-400 w-6': index === currentScrollIndex,
              'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500':
                index !== currentScrollIndex,
            }"
            @click="scrollToWallet(index)"
          />
        </div>

        <!-- Scroll Hint Text -->
        <div v-if="walletBalanceItems.length > 1" class="text-center mt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('wallet_page.scroll_hint', 'Swipe or scroll to view more wallets') }}
          </p>
        </div>
      </div>
    </div>

    <!-- No Wallet Types Available Message -->
    <div v-else class="flex flex-col items-center justify-center py-12 px-4">
      <UCard class="max-w-md w-full">
        <div class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <UIcon name="i-heroicons-wallet" class="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('wallet_page.no_wallets_title', 'No Wallets Available') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{
                t(
                  'wallet_page.no_wallets_message',
                  'No wallet types are currently available. Please contact your administrator or try again later.'
                )
              }}
            </p>
          </div>
          <UButton
            icon="i-material-symbols-light-refresh"
            variant="outline"
            size="sm"
            :loading="isLoadingWalletTypes"
            @click="loadWalletTypes"
          >
            {{ t('wallet_page.retry', 'Retry') }}
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Transaction Summary Section -->
    <UCard v-if="walletTypes.length > 0" class="transition-all duration-500 ease-in-out">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300"
            >
              {{ t('wallet_page.transaction_summary', 'Transaction Summary') }}
            </h2>
            <UBadge
              :color="walletTypeColors.badge"
              variant="subtle"
              class="transition-all duration-300"
            >
              {{ selectedWalletTypeData?.name || 'Wallet' }}
            </UBadge>
            <!-- Loading indicator for summary -->
            <UIcon
              v-if="isLoadingSummary"
              name="i-heroicons-arrow-path"
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
            />
          </div>
          <div class="flex items-center gap-2">
            <UButton
              :icon="
                currentSummaryData.today.currency === 'KHR'
                  ? 'i-heroicons-currency-dollar'
                  : 'i-heroicons-banknotes'
              "
              variant="ghost"
              size="xs"
              class="text-xs"
              :disabled="isLoadingSummary"
              @click="toggleSummaryCurrency"
            >
              {{ currentSummaryData.today.currency }}
            </UButton>
            <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {{ formatCurrency(0, currentSummaryData.today.currency).replace(/[\d.,]/g, '') }}
            </div>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <!-- Today Summary -->
        <div
          :key="'today-' + selectedWalletType"
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
          :class="{ 'animate-pulse': isLoadingSummary }"
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
                v-if="!isLoadingSummary"
                :key="'today-date-' + selectedWalletType"
                class="font-medium text-blue-900 dark:text-blue-100 transition-all duration-500"
                >{{ currentSummaryData.today.date }}</span
              >
              <div v-else class="h-4 w-20 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'today-trans-' + selectedWalletType"
                class="font-medium text-blue-900 dark:text-blue-100 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.today.currency }}</span>
                {{ currentSummaryData.today.totalTransactions }}
              </span>
              <div v-else class="h-4 w-16 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'today-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.today.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.today.totalReceived,
                    currentSummaryData.today.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-blue-700 dark:text-blue-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'today-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.today.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.today.totalSettlement,
                    currentSummaryData.today.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <!-- This Week Summary -->
        <div
          :key="'week-' + selectedWalletType"
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
          :class="{ 'animate-pulse': isLoadingSummary }"
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
                v-if="!isLoadingSummary"
                :key="'week-date-' + selectedWalletType"
                class="font-medium text-green-900 dark:text-green-100 text-xs transition-all duration-500"
                >{{ currentSummaryData.week.date }}</span
              >
              <div v-else class="h-4 w-32 bg-green-300 dark:bg-green-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'week-trans-' + selectedWalletType"
                class="font-medium text-green-900 dark:text-green-100 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.week.currency }}</span>
                {{ currentSummaryData.week.totalTransactions }}
              </span>
              <div v-else class="h-4 w-16 bg-green-300 dark:bg-green-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'week-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.week.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.week.totalReceived,
                    currentSummaryData.week.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-green-300 dark:bg-green-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-green-700 dark:text-green-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'week-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.week.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.week.totalSettlement,
                    currentSummaryData.week.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-green-300 dark:bg-green-600 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <!-- This Month Summary -->
        <div
          :key="'month-' + selectedWalletType"
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 transition-all duration-500 ease-in-out transform hover:scale-105"
          :class="{ 'animate-pulse': isLoadingSummary }"
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
                v-if="!isLoadingSummary"
                :key="'month-date-' + selectedWalletType"
                class="font-medium text-purple-900 dark:text-purple-100 text-xs transition-all duration-500"
                >{{ currentSummaryData.month.date }}</span
              >
              <div v-else class="h-4 w-32 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.transactions', 'Transactions')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'month-trans-' + selectedWalletType"
                class="font-medium text-purple-900 dark:text-purple-100 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.month.currency }}</span>
                {{ currentSummaryData.month.totalTransactions }}
              </span>
              <div v-else class="h-4 w-16 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.received', 'Received')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'month-received-' + selectedWalletType"
                class="font-semibold text-green-600 dark:text-green-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.month.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.month.totalReceived,
                    currentSummaryData.month.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
            </div>
            <div class="flex justify-between text-sm transition-all duration-300">
              <span class="text-purple-700 dark:text-purple-300">{{
                t('wallet_page.settlement', 'Settlement')
              }}</span>
              <span
                v-if="!isLoadingSummary"
                :key="'month-settlement-' + selectedWalletType"
                class="font-semibold text-orange-600 dark:text-orange-400 transition-all duration-500 flex items-center gap-1"
              >
                <span class="text-xs opacity-75">{{ currentSummaryData.month.currency }}</span>
                {{
                  formatCurrency(
                    currentSummaryData.month.totalSettlement,
                    currentSummaryData.month.currency
                  )
                }}
              </span>
              <div v-else class="h-4 w-24 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'
import type { WalletBalanceItem } from '~~/server/model/pgw_module_api/wallet'
import type { WalletSummaryData } from '~~/server/model/pgw_module_api/transactionSummary'

// Define page meta
definePageMeta({
  title: 'Digital Wallet',
  description: 'Manage your wallet balances and transactions',
})

// Composables
const { t } = useI18n()
const { formatCurrency } = useCurrency()
const { copy } = useClipboard()
const { showSuccess } = useNotification()
const { getWalletTypes, getWalletBalance, getTopUpSummary, getFeeSummary } = usePgwModuleApi()

// Reactive data
const isRefreshing = ref(false)
const isWalletLoading = ref(false)
const summaryDisplayCurrency = ref('KHR')
const isLoadingWalletTypes = ref(false)
const currentScrollIndex = ref(0)
const isLoadingSummary = ref(false)

// Wallet state
const walletIds = ref<string[]>([])
const walletBalanceItems = ref<WalletBalanceItem[]>([])
const selectedWalletTypeAPI = ref<string>('')
const walletContainer = ref<HTMLElement | null>(null)

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

      // Store wallet IDs for balance fetching
      walletIds.value = [...response.data!.topup_wallet_ids, ...response.data.settlement_wallet_ids]

      // Set default wallet type
      if (walletTypes.value.length > 0) {
        selectedWalletType.value = walletTypes.value[0]?.id || ''
        selectedWalletTypeAPI.value = walletTypes.value[0]?.name || ''
      }
    }
  } catch (error) {
    console.error('Failed to load wallet types:', error)
  } finally {
    isLoadingWalletTypes.value = false
  }
}

const loadWalletBalance = async () => {
  if (!selectedWalletTypeAPI.value || walletIds.value.length === 0) return

  try {
    isWalletLoading.value = true
    const response = await getWalletBalance({
      wallet_ids: walletIds.value,
      wallet_type: selectedWalletTypeAPI.value,
      page: 1,
      page_size: 50,
    })

    if (response.data?.wallet_balances) {
      walletBalanceItems.value = response.data.wallet_balances
    }
  } catch (error) {
    console.error('Failed to load wallet balance:', error)
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

// Selected wallet type (single source of truth)
const selectedWalletType = ref('')

// Utility methods for wallet display
const formatAccountNumber = (accountNumber: string) => {
  if (!accountNumber) return ''
  return accountNumber.length > 8
    ? `${accountNumber.slice(0, 4)}•••${accountNumber.slice(-4)}`
    : accountNumber
}

const getCurrencyCardClass = (currency: string) => {
  switch (currency) {
    case 'KHR':
      return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 border-blue-200 dark:border-blue-600'
    case 'USD':
      return 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-800/30 border-emerald-200 dark:border-emerald-600'
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-600'
  }
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

const getCurrencyBadgeColor = (currency: string) => {
  switch (currency) {
    case 'KHR':
      return 'primary'
    case 'USD':
      return 'success'
    default:
      return 'neutral'
  }
}

const getCurrencyTextColor = (currency: string) => {
  switch (currency) {
    case 'KHR':
      return '#3b82f6'
    case 'USD':
      return '#10b981'
    default:
      return '#6b7280'
  }
}

// Computed wallet type data
const selectedWalletTypeData = computed(() => {
  if (walletTypes.value.length === 0) return null
  return (
    walletTypes.value.find((type) => type.id === selectedWalletType.value) || walletTypes.value[0]
  )
})

// Computed colors for wallet types
const walletTypeColors = computed(() => {
  const colors = {
    personal_wallet: {
      indicator: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      card: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 border-blue-200 dark:border-blue-600',
      icon: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      usdCard:
        'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-gray-800/30 border-slate-200 dark:border-slate-600',
      usdIcon: 'bg-gradient-to-r from-slate-500 to-gray-600',
      badge: 'primary' as const,
      textColor: '#3b82f6',
      usdTextColor: '#64748b',
    },
    business_wallet: {
      indicator: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      card: 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-800/30 border-emerald-200 dark:border-emerald-600',
      icon: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      usdCard:
        'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/30 border-teal-200 dark:border-teal-600',
      usdIcon: 'bg-gradient-to-r from-teal-500 to-cyan-600',
      badge: 'success' as const,
      textColor: '#10b981',
      usdTextColor: '#0891b2',
    },
    settlement_wallet: {
      indicator: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      card: 'bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/30 border-indigo-200 dark:border-indigo-600',
      icon: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      usdCard:
        'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 border-purple-200 dark:border-purple-600',
      usdIcon: 'bg-gradient-to-r from-purple-500 to-pink-600',
      badge: 'secondary' as const,
      textColor: '#6366f1',
      usdTextColor: '#7c3aed',
    },
    default: {
      indicator: 'bg-gray-400',
      card: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-600',
      icon: 'bg-gradient-to-r from-gray-500 to-gray-600',
      usdCard:
        'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-600',
      usdIcon: 'bg-gradient-to-r from-gray-500 to-gray-600',
      badge: 'neutral' as const,
      textColor: '#6b7280',
      usdTextColor: '#6b7280',
    },
  }

  if (walletTypes.value.length === 0) {
    return colors.default
  }

  return colors[selectedWalletType.value as keyof typeof colors] || colors.personal_wallet
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
      today: {
        date: currentDate,
        total_transactions: 0,
        khr: { total_received: 0, total_settlement: 0, total_transactions: 0 },
        usd: { total_received: 0, total_settlement: 0, total_transactions: 0 },
      },
      week: {
        date: `${currentDate} to ${currentDate}`,
        total_transactions: 0,
        khr: { total_received: 0, total_settlement: 0, total_transactions: 0 },
        usd: { total_received: 0, total_settlement: 0, total_transactions: 0 },
      },
      month: {
        date: `${monthStart} to ${currentDate}`,
        total_transactions: 0,
        khr: { total_received: 0, total_settlement: 0, total_transactions: 0 },
        usd: { total_received: 0, total_settlement: 0, total_transactions: 0 },
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

  return {
    today: {
      ...data.today,
      totalTransactions: data.today[currentCurrency]?.total_transactions || 0,
      totalReceived: data.today[currentCurrency]?.total_received || 0,
      totalSettlement: data.today[currentCurrency]?.total_settlement || 0,
      currency: summaryDisplayCurrency.value,
    },
    week: {
      ...data.week,
      totalTransactions: data.week[currentCurrency]?.total_transactions || 0,
      totalReceived: data.week[currentCurrency]?.total_received || 0,
      totalSettlement: data.week[currentCurrency]?.total_settlement || 0,
      currency: summaryDisplayCurrency.value,
    },
    month: {
      ...data.month,
      totalTransactions: data.month[currentCurrency]?.total_transactions || 0,
      totalReceived: data.month[currentCurrency]?.total_received || 0,
      totalSettlement: data.month[currentCurrency]?.total_settlement || 0,
      currency: summaryDisplayCurrency.value,
    },
  }
})

// Watch for wallet type changes to trigger animations and reload balance
watch(selectedWalletType, async (newType, oldType) => {
  if (newType !== oldType) {
    isWalletLoading.value = true
    // Update the API wallet type
    const walletType = walletTypes.value.find((type) => type.id === newType)
    if (walletType) {
      selectedWalletTypeAPI.value = walletType.name
      await Promise.all([loadWalletBalance(), loadTransactionSummary()])
    }
    // Simulate API call delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800))
    isWalletLoading.value = false
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
    // Reload wallet types, balances, and transaction summary
    await loadWalletTypes()
    await Promise.all([loadWalletBalance(), loadTransactionSummary()])
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  } finally {
    // Simulate API call delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 1500))
    isRefreshing.value = false
    isWalletLoading.value = false
  }
}

// const navigateToHistory = () => {
//   // Navigate to transaction history page
//   console.log('Navigate to transaction history')
// }

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    showSuccess({
      title: t('wallet_page.copy_success', 'Copied!'),
      description: t('wallet_page.copy_success_message', 'Account number copied to clipboard'),
    })
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const scrollToWallet = (index: number) => {
  const container = document.querySelector('.overflow-x-auto')
  const walletCards = container?.querySelectorAll('.snap-start')

  if (container && walletCards && walletCards[index]) {
    currentScrollIndex.value = index
    walletCards[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }
}

const handleScroll = () => {
  if (!walletContainer.value) return

  const container = walletContainer.value
  const walletCards = container.querySelectorAll('.snap-start')
  const containerRect = container.getBoundingClientRect()

  // Find which wallet card is currently most visible
  let mostVisibleIndex = 0
  let maxVisibleArea = 0

  walletCards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect()
    const visibleWidth =
      Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left)
    const visibleArea = Math.max(0, visibleWidth)

    if (visibleArea > maxVisibleArea) {
      maxVisibleArea = visibleArea
      mostVisibleIndex = index
    }
  })

  if (mostVisibleIndex !== currentScrollIndex.value) {
    currentScrollIndex.value = mostVisibleIndex
  }
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

/* Horizontal scroll styling - Clean, no scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scroll-padding: 0 1rem;
}

/* Smooth scroll indicator transitions */
.scroll-indicator {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-indicator:hover {
  transform: scale(1.2);
}

/* Gradient overlay improvements */
.gradient-overlay {
  transition: opacity 0.3s ease;
}

/* Enhanced transition effects */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Wallet card hover effects - Clean shadows */
.hover\:shadow-lg:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .hover\:shadow-lg:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }

  .shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
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
    opacity: 0.5;
  }
}

/* Skeleton shimmer animation */
.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* Loading spinner */
.loading-spinner {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Snap scroll effects */
.snap-x {
  scroll-snap-type: x mandatory;
}

.snap-start {
  scroll-snap-align: start;
}

/* Smooth scroll behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
