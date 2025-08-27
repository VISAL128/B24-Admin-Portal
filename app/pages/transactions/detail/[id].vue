<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Page Header -->
    <!-- <div class="flex-shrink-0">
      <PageHeader :title="t('pages.transaction_detail.title')" :subtitle="t('pages.transaction_detail.subtitle')" />
    </div> -->

    <!-- Main Layout: Left and Right Sections -->
    <!-- Scrollable content wrapper -->
    <div class="flex-1 overflow-auto space-y-3 pr-1">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3"> 
      <!-- Left Section: Transaction Detail (50% width) -->
      <div class="lg:col-span-1 flex flex-col h-full">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex-1 flex flex-col">
          <!-- Header -->
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
              <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                <UIcon name="material-symbols:credit-card-clock-outline" class="w-4 h-4 text-primary" />
              </div>
              {{ t('pages.transaction.title') }}
            </h4>
            
            <!-- Actions Right -->
            <!-- <div class="flex items-center gap-2">
              <UButton
                variant="outline"
                icon="material-symbols:history"
                size="sm"
                @click="handleVoidPaymentRequest"
                :loading="isVoidRequesting"
                :disabled="isVoidRequesting"
              >
                {{ isVoidRequesting ? 'Processing...' : 'Void Payment History' }}
              </UButton>
            </div> -->
          </div>
          <!-- Transaction Content -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4 flex-1 flex flex-col">
            <!-- Loading State -->
            <div v-if="loading || apiError" class="space-y-3 flex-1 flex flex-col">
              <div v-if="loading" v-for="n in 9" :key="`skeleton-${n}`" class="flex justify-between items-center py-3 animate-pulse">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              </div>
              
              <!-- Error State -->
              <div v-if="apiError && !loading" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-red-500 mb-2">
                    <UIcon name="material-symbols:error-outline" class="w-12 h-12 mx-auto" />
                  </div>
                  <p class="text-red-600 dark:text-red-400 font-medium">{{ apiError }}</p>
                  <UButton
                    variant="outline"
                    color="error"
                    size="sm"
                    class="mt-3"
                    @click="fetchTransactionData"
                  >
                    Retry
                  </UButton>
                </div>
              </div>
            </div>
            
            <!-- Actual Data -->
            <div v-else class="space-y-0">
              <div
                v-for="(field, index) in allFields"
                :key="index"
                :class="[
                  'flex justify-between items-center py-3',
                  index < allFields.length - 1 ? 'border-b border-dotted border-gray-200 dark:border-gray-700' : ''
                ]"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">{{ field.label }}</span>
                <StatusBadge v-if="field.type === 'status'" :status="field.value" variant="subtle" size="sm" />
                <TransactionTypeBadge
                  v-else-if="field.type === 'badge'"
                  :transaction-type="field.value"
                  size="sm"
                />
                <span
                  v-else-if="field.type === 'amount'"
                  class="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ field.value }}
                </span>
                <ClipboardBadge
                  v-else-if="field.type === 'code' && field.copyable"
                  :text="field.rawValue"
                  :copied-tooltip-text="$t('clipboard.copied')"
                  class="mt-1"
                />
                <span
                  v-else
                  :class="[
                    'text-sm font-medium text-gray-900 dark:text-white',
                    field.type === 'code' ? 'font-mono break-all' : ''
                  ]"
                >
                  {{ field.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Settlement Bank and Customer Information  -->
      <div class="space-y-3 flex flex-col h-full">
        <!-- Settlement Bank Section -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
            <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
              <UIcon name="material-symbols:account-balance-outline" class="w-4 h-4 text-primary" />
            </div>
            {{ t('pages.transaction_detail.settlement_bank') }}
          </h4>
          <!-- Horizontal line below header -->
          <hr class="border-gray-200 dark:border-gray-700 mt-3 -mx-3 py-1" />
          
          <!-- Loading State -->
          <div v-if="loading || apiError" class="space-y-3">
            <div v-if="loading" v-for="n in 3" :key="`settlement-skeleton-${n}`" class="flex justify-between items-center animate-pulse">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-if="apiError && !loading" class="text-center py-4">
              <p class="text-red-600 dark:text-red-400 text-sm">{{ apiError }}</p>
            </div>
          </div>
          
          <!-- Actual Data -->
          <div v-else class="space-y-3">
            <!-- Bank Name -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.settlement_bank') }}</span>
              <div class="flex items-center space-x-2">
                <UAvatar
                  :src="computedTransactionData.settlementBankLogo || ''"
                  :alt="computedTransactionData.settlementBank || ''"
                  size="sm"
                />
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ computedTransactionData.settlementBank || 'N/A' }}
                </span>
              </div>
            </div>

            <!-- Account Number -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.account_number') }}</span>
              <ClipboardBadge
                :text="maskAccountNumber(computedTransactionData.accountNumber)"
                :copied-tooltip-text="$t('clipboard.copied')"
                class="mt-1"
              />
            </div>

            <!-- Settlement Amount -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.settlement_amount') }}</span>
              <span class="text-lg font-bold">
                {{ computedTransactionData.settlementAmount }}
                {{ computedTransactionData.currency }}
              </span>
            </div>
          </div>
        </div>

        <!-- Customer Information Table -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 flex flex-col p-3">
          <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
            <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
              <UIcon name="material-symbols:receipt-outline" class="w-4 h-4 text-primary" />
            </div>
            {{ t('pages.transaction_detail.title') }}
          </h4>
          <!-- Horizontal line below header -->
          <hr class="border-gray-200 dark:border-gray-700  mt-3 -mx-3" />
          
          <!-- Loading State -->
          <div v-if="loading || apiError" class="flex-1 flex flex-col">
            <div v-if="loading" class="animate-pulse p-4">
              <!-- Table Header Shimmer -->
              <div class="flex space-x-4 mb-4">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
              <!-- Table Rows Shimmer -->
              <div v-for="n in 3" :key="`table-skeleton-${n}`" class="flex space-x-4 mb-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-if="apiError && !loading" class="flex-1 flex items-center justify-center py-8">
              <div class="text-center">
                <div class="text-red-500 mb-2">
                  <UIcon name="material-symbols:error-outline" class="w-8 h-8 mx-auto" />
                </div>
                <p class="text-red-600 dark:text-red-400 text-sm">{{ t('pages.transaction_detail.error_transaction_detail') }}</p>
              </div>
            </div>
          </div>
          
          <!-- Actual Data -->
          <UTable
            v-else
            ref="table"
            :data="customerDetails"
            :columns="customerColumns"
            sticky
            sortable
            class="-mx-3"
            :style="{ maxHeight: 'h-full'}"
            :ui="{
              ...appConfig.ui.table.slots,
            }"
            @select="onRowSelect"
          />
        </div>
      </div>
    </div>

    <!-- Transaction Allocation Table -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
        <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
          <UIcon name="material-symbols:credit-card-clock-outline" class="w-4 h-4 text-primary" />
        </div>
        {{ t('pages.transaction_allocation.title') }}
      </h4>
      <!-- Horizontal line below header -->
      <hr class="border-gray-200 dark:border-gray-700  mt-3 -mx-3" />
      
      <!-- Loading State -->
      <div v-if="allocationLoading || allocationError">
        <div v-if="allocationLoading" class="animate-pulse p-4">
          <!-- Table Header Shimmer -->
          <div class="flex space-x-4 mb-4">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
          <!-- Table Rows Shimmer -->
          <div v-for="n in 4" :key="`allocation-skeleton-${n}`" class="flex space-x-4 mb-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-if="allocationError && !allocationLoading" class="text-center py-8">
          <div class="text-red-500 mb-2">
            <UIcon name="material-symbols:error-outline" class="w-8 h-8 mx-auto" />
          </div>
          <p class="text-red-600 dark:text-red-400 text-sm">{{ allocationError }}</p>
        </div>
      </div>
    <!-- Transaction Allocation Table -->
      <UTable
        v-else
        ref="table"
        :data="transactionAllocateData"
        :columns="transactionAllocateColumns"
        sticky
        v-model:sort="transactionAllocationSorting"
        class="-mx-3"
        :style="{ maxHeight: 'h-full'}"
        :ui="{
          ...appConfig.ui.table.slots,
        }"
        @select="onTransactionAllocationSelect"
      />
    </div>

    <!-- Repush Transaction Summary and Auto Direct Debit Summary Cards -->
    <!-- Re-enabled: Available features for repush and direct debit -->
    <div v-if="true" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <!-- Left Card: Repush Transaction Summary with Tabs -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 h-86">
        <!-- Reusable Tabs Component -->
        <ExTab
          v-model="activeRepushTab"
          :tabs="repushTabs"
          size="md"
        >
          <template #default="{ activeTab }">
            <!-- Tab Content -->
            <div class="relative h-72 overflow-hidden">
              <!-- Repush Summary Tab Content -->
              <div
                v-show="activeTab === 'repush_transaction_summary'"
                class="h-full"
              >
                <!-- Clickable Summary Card -->
                <div
                  class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  @click="openRepushDetail"
                >
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.total_repush') }}</span>
                      <span class="text-lg font-bold text-gray-900 dark:text-white">{{ summary.totalRepush }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction.status') }}</span>
                      <StatusBadge :status="summary.status" variant="subtle" size="sm" />
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.type') }}</span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ summary.type }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.last_repush_date') }}</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ format.formatDateTime(summary.date, {
                          dateStyle: userPreferences?.dateFormat || 'medium',
                          timeStyle: userPreferences?.timeFormat || 'short',
                        }) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Click indicator -->
                  <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      <UIcon name="material-symbols:visibility-outline" class="w-3 h-3 mr-1" />
                    {{ t('pages.transaction_detail.view_details') }}
                    </div>
                  </div>
                </div>
                
                <!-- Repush Button -->
                <div class="mt-3">
                  <UButton
                    size="md"
                    variant="outline"
                    icon="material-symbols:sync"
                    class="w-full h-10 flex items-center justify-center"
                    @click="handleRepush"
                    :loading="isRepushing"
                    :disabled="isRepushing"
                  >
                    {{ isRepushing ? t('pages.transaction_detail.repushing') : t('pages.transaction_detail.repush_biller_action') }}
                  </UButton>
                </div>
              </div>

              <!-- Activity Logs Tab Content -->
              <div
                v-show="activeTab === 'repush_activity_logs'"
                class="h-full"
              >
                <div
                  class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 flex flex-col p-3 space-y-3">
                  <UTable
                    ref="table"
                    :data="summary.repushDetails || []"
                    :columns="repushDetailsColumns"
                    sticky
                    sortable
                    v-model:sort="webhookSorting"
                    class="-mx-3"
                    :style="{ maxHeight: 'h-full'}"
                    :ui="{
                      ...appConfig.ui.table.slots,
                    }"
                    @select="onRepushDetailSelect"
                  />
                </div>
              </div>
            </div>
          </template>
        </ExTab>
      </div>

      <!-- Right Card: Auto Direct Debit Summary -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 h-86">
        <h4 class="text-base font-medium text-gray-900 dark:text-white flex items-center">
          <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
            <UIcon name="material-symbols:account-balance-wallet-outline" class="w-4 h-4 text-primary" />
          </div>
          {{ t('pages.transaction_detail.repush_bank') }}
        </h4>
        <!-- Content area -->
        <div class="relative h-72 overflow-hidden py-4">
          <!-- Under Development Content -->
          <div class="h-full flex flex-col items-center justify-center space-y-4">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <UIcon name="material-symbols:construction" class="w-8 h-8 text-gray-400" />
            </div>
            <div class="text-center space-y-2">
              <h5 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('underDevelopment.title') }}</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                {{ t('pages.transaction_detail.repush_bank_description') }}
              </p>
            </div>
            <!-- <div class="w-full max-w-xs">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full" style="width: 45%"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Development Progress: 45%</p>
            </div> -->
          </div>

          <!-- Commented Out: Original Auto Direct Debit Content -->
          <!-- 
          <div
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
            @click="openDirectDebitDetail"
          >
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Bank</span>
                <div class="flex items-center space-x-2">
                  <UAvatar
                    :src="summaryDirectDebit.bankLogo"
                    :alt="summaryDirectDebit.bankName"
                    size="sm"
                  />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ summaryDirectDebit.bankName }}
                  </span>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Bank Reference</span>
                 <ClipboardBadge
                    :text="summaryDirectDebit.bankRef || ''"
                    :copied-tooltip-text="$t('clipboard.copied')"
                    class="mt-2"
                  />
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <StatusBadge :status="summaryDirectDebit.status" variant="subtle" size="sm" />
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Last Push Date</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ format.formatDateTime(summaryDirectDebit.lastPushDate, {
                    dateStyle: userPreferences?.dateFormat || 'medium',
                    timeStyle: userPreferences?.timeFormat || 'short',
                  }) }}
                </span>
              </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                <UIcon name="material-symbols:visibility-outline" class="w-3 h-3 mr-1" />
                Click to view details
              </div>
            </div>
          </div>
          
          <div class="mt-3">
            <UButton
              size="md"
              variant="outline"
              icon="material-symbols:verified-outline"
              class="w-full h-10 flex items-center justify-center"
              @click="handleVerifyTransaction"
              :loading="isVerifying"
              :disabled="isVerifying"
            >
              {{ isVerifying ? 'Verifying...' : 'Verify Transaction' }}
            </UButton>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>
   
    
    <!-- Repush Transaction Detail Slideover -->
    <!-- Re-enabled: Available for repush transaction details -->
    <USlideover
      v-if="true"
      v-model:open="showPushBackDetail"
      side="right"
      :overlay="false"
      title="Repush Transaction Detail"
      @close="closeSlideover"
    >
      <template #body>
        <div class="space-y-4" v-if="selectedPushBackTransaction">
          <!-- Detail Section -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Total Repush</span
                  >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    getSelectedPushBackDetail()?.totalRepush || '0'
                  }}</span>
                </div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Status</span
                  >
                  <StatusBadge
                    :status="getSelectedPushBackDetail()?.status || 'Unknown'"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white"
                    >Last Repush Date</span
                  >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    format.formatDateTime(getSelectedPushBackDetail()?.date, {
                      dateStyle: userPreferences?.dateFormat || 'medium',
                      timeStyle: userPreferences?.timeFormat || 'short',
                    })
                  }}</span>
                </div>
              </div>
          </div>

          <!-- Biller Configuration Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Configuration
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  getSelectedPushBackDetail()?.billerConfiguration.type
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">URL:</span>
                <ClipboardBadge
                  :text="getSelectedPushBackDetail()?.billerConfiguration.url || ''"
                  :copied-tooltip-text="$t('clipboard.copied')"
                  class="mt-2"
                />
              </div>
            </div>
          </div>

          <!-- Payload Sent Section -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"
            >
              Request Payload
            </h3>
            <CopyableCodeBlock
              :content="getSelectedPushBackDetail()?.payload"
              success-message="Payload copied to clipboard"
              :max-length="250"
            />
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Activity Log Detail Slideover -->
    <!-- Re-enabled: Available for activity log details -->
    <USlideover
      v-if="true"
      v-model:open="showActivityLogDetail"
      side="right"
      :overlay="false"
      title="Activity Log Details"
      @close="closeActivityLogSlideover"
    >
      <template #body>
        <div class="space-y-4" v-if="selectedActivityLog">
          <!-- Detail Section -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Status:</span>
                <StatusBadge
                  :status="getSelectedActivityLogDetail()?.status || 'Unknown'"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Date:</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{
                  format.formatDateTime(getSelectedActivityLogDetail()?.date, {
                    dateStyle: userPreferences?.dateFormat || 'medium',
                    timeStyle: userPreferences?.timeFormat || 'short',
                  })
                }}</span>
              </div>
            </div>
          </div>

          <!-- Response Payload Section -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Response Payload
            </h3>
            <CopyableCodeBlock
              :content="getSelectedActivityLogDetail()?.payload"
              success-message="Response payload copied to clipboard"
              :max-length="250"
            />
          </div>

          <!-- Status Code Section -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Status Code
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                <span class="text-sm font-mono font-medium text-gray-900 dark:text-white">{{
                  getSelectedActivityLogDetail()?.statusCode || 'N/A'
                }}</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm text-gray-600 dark:text-gray-400">Message:</span>
                <span class="text-sm font-medium text-right" :class="[
                  getSelectedActivityLogDetail()?.statusCode === 200 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                ]">{{
                  getSelectedActivityLogDetail()?.statusCode === 200 
                    ? 'Success' 
                    : 'Error'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Transaction Allocation Detail Slideover -->
    <USlideover
      v-model:open="showTransactionAllocationDetail"
      side="right"
      :overlay="false"
      :title="t('pages.transaction_allocation.detail')"
      @close="closeAllocationSlideover"
    >
      <template #body>
        <!-- Loading State -->
        <div v-if="allocationDetailLoading" class="space-y-4">
          <div class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-4"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="allocationDetailError" class="space-y-4">
          <div class="text-center py-8">
            <div class="text-red-500 mb-2">
              <UIcon name="material-symbols:error-outline" class="w-12 h-12 mx-auto" />
            </div>
            <p class="text-red-600 dark:text-red-400 font-medium">{{ allocationDetailError }}</p>
            <UButton
              variant="outline"
              color="error"
              size="sm"
              class="mt-3"
              @click="selectedTransactionAllocation?.id && fetchAllocationDetail(selectedTransactionAllocation.id)"
            >
              {{ t('wallet_page.retry') }}
            </UButton>
          </div>
        </div>

        <!-- Content -->
        <div v-else-if="selectedTransactionAllocation" class="space-y-4">
          <!-- Customer & Transaction Summary Card -->
          <UCard>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {{ t('pages.transaction_detail.customer') }}
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ allocationDetailData?.customer || '-' }}
                </p>
                <ClipboardBadge
                  :text="allocationDetailData?.customerCode || '-'"
                  :copied-tooltip-text="$t('clipboard.copied')"
                  class="mt-2"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {{ t('pages.transaction_allocation.allocation_party') }}
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ allocationDetailData?.allocationPartyName || '-' }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <StatusBadge 
                    :status="allocationDetailData?.status || '-'" 
                    variant="subtle" 
                    size="sm" 
                  />
                </div>
              </div>
            </div>

            <!-- Amount Summary -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction.amount') }}</span>
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ useCurrency().formatAmount(allocationDetailData?.transactionAmount || 0) }}
                  {{ allocationDetailData?.currency || '' }}
                </span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.settlement_amount') }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ useCurrency().formatAmount(allocationDetailData?.settleAmount || 0) }}
                  {{ allocationDetailData?.currency || '' }}
                </span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_allocation.outstanding_amount') }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ useCurrency().formatAmount(allocationDetailData?.outstandingAmount || 0) }}
                  {{ allocationDetailData?.currency || '' }}
                </span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_allocation.total_settlement') }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ allocationDetailData?.totalSettlement || '-' }}
                </span>
              </div>
            </div>
          </UCard>

          <!-- Settlement Details Section -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mr-2">
                <UIcon name="material-symbols:account-balance-outline" class="w-4 h-4 text-primary" />
              </div>
              <h4 class="text-base font-medium text-gray-900 dark:text-white">
                {{ t('pages.transaction_detail.settlement_detail') }}
              </h4>
            </div>

            <!-- Settlement Cards -->
            <div
              v-for="(settlement, index) in allocationDetailData?.settlements || []"
              :key="settlement.settlementId || index"
              class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
            >
              <!-- Settlement Information -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.settlement_amount') }}</span>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                    (settlement.settleAmount || 0).toLocaleString()
                  }} {{ settlement.currency || '' }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.bank_name') }}</span>
                  <div class="flex items-center gap-2">
                    <UAvatar 
                      v-if="settlement.bankLogo" 
                      :src="settlement.bankLogo" 
                      :alt="settlement.bank" 
                      size="xs" 
                    />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                      settlement.bank || 'AC'
                    }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction.bank_ref') }}</span>
                  <ClipboardBadge
                    :text="settlement.bankReference || 'CC2342342'"
                    :copied-tooltip-text="$t('clipboard.copied')"
                    class="mt-2"
                  />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction.status') }}</span>
                  <StatusBadge :status="settlement.status || 'success'" variant="subtle" size="sm" />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.settlement_date') }}</span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{
                    allocationDetailData?.date || '-'
                  }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('pages.transaction_detail.description') }}</span>
                  <span
                    class="text-sm text-gray-700 dark:text-gray-300"
                    :title="settlement.description || '-'"
                  >{{
                    (() => {
                      const desc = settlement.description || '-'
                      return desc.length > 30 ? desc.substring(0, 30) + '...' : desc
                    })()
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue'
import CopyableCodeBlock from '~/components/CopyableCodeBlock.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import ExTab from '~/components/tabs/ExTab.vue'
import TransactionTypeBadge from '~/components/TransactionTypeBadge.vue'
import { useTransactionApi } from '~/composables/api/useTransactionApi'
import { useClipboard } from '~/composables/useClipboard'
import { useNotification } from '~/composables/useNotification'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { useTransactionTypeIcon } from '~/composables/useTransactionTypeIcon'
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import { useTable } from '~/composables/utils/useTable'
import { useUserPreferences } from '~/composables/utils/useUserPreferences'
import type { TransactionHistoryRecord } from '~/models/transaction'
import appConfig from '~~/app.config'
import type { DirectDebitSummary } from '~~/server/model/pgw_module_api/direct_debit/direct_debit_summary'
import { RepushStatus, RepushType, type RepushSummary } from '~~/server/model/pgw_module_api/repush/repush_summary'
import type { TransactionAllocationDetail, TransactionAllocationModel } from '~~/server/model/pgw_module_api/transactions/transaction_allocation'
definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'transactions', to: '/transactions' },
    { label: 'details', active: true },
  ]
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { copy } = useClipboard()
const notification = useNotification()
const { getTransactionById, getTransactionAllocationList, getAllocationDetail } = useTransactionApi()
const { createRowNumberCell, createSortableHeader } = useTable()
const format = useFormat()
const userPreferences = useUserPreferences().getPreferences()

const isTransactionSelected = ref(false)
const transactionId = computed(() => route.params.id as string)
const loading = ref(true)
const transactionData = ref<TransactionHistoryRecord | null>(null)
const apiError = ref<string | null>(null)
const allocationLoading = ref(true)
const allocationError = ref<string | null>(null)
const allocationData = ref<TransactionAllocationModel[]>([])
const showDownloadModal = ref(false)
const showPushBackDetail = ref(false)
const selectedPushBackTransaction = ref<any>(null)
const showActivityLogDetail = ref(false)
const selectedActivityLog = ref<any>(null)
const showTransactionAllocationDetail = ref(false)
const selectedTransactionAllocation = ref<any>(null)
const allocationDetailLoading = ref(false)
const allocationDetailError = ref<string | null>(null)
const allocationDetailData = ref<TransactionAllocationDetail | null>(null)
const { transactionAllocationStatusCellBuilder } = useStatusBadge()
const { getTransactionTypeGroupDisplayText } = useTransactionTypeIcon()

const activeRepushTab = ref('repush_transaction_summary')
const isRepushing = ref(false)
const isVerifying = ref(false)
const isVoidRequesting = ref(false)

const repushTabs = [
  {
    label: t('pages.transaction_detail.repush_biller'),
    value: 'repush_transaction_summary',
    icon: 'material-symbols:sync-outline'
  },
  {
    label: t('pages.transaction_detail.activity_log'),
    value: 'repush_activity_logs',
    icon: 'material-symbols:history'
  }
]

// Sorting state for tables
const customerSorting = ref([])
const transactionAllocationSorting = ref([])
const webhookSorting = ref([{ id: 'date', desc: true }])

// Direct Debit Summary Data
const summaryDirectDebit = ref<DirectDebitSummary>({
  id: '001',
  bankName: 'ACLEDA Bank',
  bankLogo: 'https://b24-upload.s3.ap-southeast-1.amazonaws.com/banklogo2024/AC.png',
  bankRef: 'BX1234FD56789',
  lastPushDate: '2025-08-05T10:20:00+07:00',
  status: 'pending', // or 'success' | 'failed'
  payload: {
    accountNumber: '123456789012',  
    accountName: 'Chan Dara',
    amount: 250.75,
    currency: 'USD',
    debitDate: '2025-08-04'
  },
  transactionId: '3dc106d3-fb58-41eb-91ba-c9356ccb50ca',
  transactionNo: 'TXN-20250805001'
})

// Repush Summary Data
const summary = ref<RepushSummary>({
  id: 'pushback-001',
  transactionId: '3dc106d3-fb58-41eb-91ba-c9356ccb50ca',
  transactionNo: 'TXN-20240722001',
  totalRepush: 2,
  date: '2024-07-22T10:30:00+07:00',
  status: RepushStatus.Success,
  type: RepushType.Webhook,
  metaData: {
    url: 'https://webhook.example.com'
  },
  payload: {
    status: 'success',
    amount: 10.5,
    currency: 'USD',
    customer: {
      name: 'John Doe',
      phone: '012345678'
    }
  },
  repushDetails: [
      {
        id: 1,
        date: '2024-07-22T10:35:00+07:00',
        status: RepushStatus.Failed,
        metaData: {
          statusCode: 400,
          responsePayload: {
            status: 'error',
            amount: 10.5,
            currency: 'USD',
            customer: {
              name: 'John Doe',
              phone: '012345678'
            }
          },
          responseHeader: {
            'Content-Type': 'application/json'
          }
        }
      },
      {
        id: 2,
        date: '2024-07-23T10:35:00+07:00',
        status: RepushStatus.Success,
        metaData: {
          statusCode: 200,
          responsePayload: {
            status: 'success',
            amount: 10.5,
            currency: 'USD',
            customer: {
              name: 'John Doe',
              phone: '012345678'
            }
          },
          responseHeader: {
            'Content-Type': 'application/json'
          }
        }
      }
    ]
  
})

// Customer Details Data - computed from transaction data or fallback to mock data
const customerDetails = computed(() => {
   try {
    if (transactionData.value && transactionData.value.extData) {
      const parsed = JSON.parse(transactionData.value.extData)
      return (parsed.customers || []).map((c: any) => ({
        customerName: c.customer_name || '-',
        customerCode: c.customer_code || '-',
        billNumber: c.bill_no || '-',
        currency: c.currency || '-', // If available in API
        amount: c.amount || 0
      }))
    }
  } catch (error) {
    console.error('Failed to parse extData:', error)
  }
  return []
})

const customerColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false, 
  },
  {
    id: 'customerName',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_detail.customer'), 'left'),
    accessorKey: 'customerName',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customerName),
    enableSorting: true,
  },
  {
    id: 'customerCode',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_detail.customerCode'), 'left'),
    accessorKey: 'customerCode',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customerCode),
    enableSorting: true,
  },
  // {
  //   id: 'billNumber',
  //   header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_detail.billNo'), 'left'),
  //   accessorKey: 'billNumber',
  //   cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.billNumber),
  //   enableSorting: true,
  // },
  {
    id: 'amount',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_detail.amount'), 'right'),
    accessorKey: 'amount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.amount)),
    enableSorting: true,
  }
] as any[]



// Transaction Allocation Data - computed from API data 
const transactionAllocateData = computed(() => {
  // If we have allocation data from the API, use it
  if (allocationData.value && allocationData.value.length > 0) {
    return allocationData.value.map((allocation: TransactionAllocationModel) => ({
      id: allocation.id || '-',
      customer: allocation.customer || '-',
      transactionAmount: allocation.amount || 0,
      billerName: allocation.billerName || '-',
      amount: allocation.amount || 0,
      outstandingAmount: allocation.outstandingAmount || 0,
      currency: allocation.currency || '-',
      date: allocation.date || new Date().toISOString(),
      status: allocation.outstandingAmount === 0 ? 'complete' : 'pending',
    }))
  }


  
  // If we have transaction data but no allocation data (and not loading), show empty state
  if (transactionData.value && !allocationLoading.value && !allocationError.value) {
    return []
  }
  
  // If we're still loading or have an error, return empty array (shimmer will show)
  if (allocationLoading.value || allocationError.value) {
    return []
  }
  // No allocation data available -> empty
  return []
})

const transactionAllocateColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'date',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.date'), 'left'),
    accessorKey: 'date',
    cell: ({ row }: any) => {
      try {
        return h('div', { class: 'text-sm text-left' }, [
          format.formatDateTime(row.original.date, {
            dateStyle: userPreferences?.dateFormat || 'medium',
            timeStyle: userPreferences?.timeFormat || 'short',
          }),
        ])
      } catch (error) {
        // Fallback to original date string if formatting fails
        return h('div', { class: 'text-sm' }, [row.original.date])
      }
    },
    size: 160,
    minSize: 140,
    enableSorting: true,
  },
  {
    id: 'customer',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.customer'), 'left'),
    accessorKey: 'customer',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.customer),
    size: 180,
    minSize: 160,
    enableSorting: true,
  },
  {
    id: 'billerName',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.allocation_party'), 'left'),
    accessorKey: 'billerName',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.billerName),
    size: 160,
    minSize: 150,
    enableSorting: true,
  },
  {
    id: 'status',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.status.status'), 'left'),
    accessorKey: 'status',
    enableSorting: false,
    cell: ({ row }: any) => transactionAllocationStatusCellBuilder(row.original.status, true),
    size: 120,
  },
  {
    id: 'currency',
    header: () => h('div', { class: 'text-left' }, t('pages.transaction_allocation.currency')),
    accessorKey: 'currency',
    cell: ({ row }: any) => h('div', { class: 'text-left' }, row.original.currency),
    size: 80,
    minSize: 70,
    enableSorting: true,
  },
  {
    id: 'amount',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.amount'), 'right'),
    accessorKey: 'amount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.amount)),
    size: 120,
    minSize: 100,
    enableSorting: true,
  },
  {
    id: 'outstandingAmount',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_allocation.outstanding_amount'), 'right'),
    accessorKey: 'outstandingAmount',
    cell: ({ row }: any) =>
      h('div', { class: 'text-right' }, useCurrency().formatAmount(row.original.outstandingAmount)),
    size: 140,
    minSize: 120,
    enableSorting: true,
  },
]

// Push Back Transaction Data
const webhookHistoryData = ref([
  {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    date: '2024-07-22T10:30:00+07:00',
    type: 'webhook',
    status: 'Failed',
    totalRepush: 1,
    retrying: false,
  }
])

// Push Back Detail Data - for slideover
const pushBackDetailData = ref({
  'pushback-001': {
    id: 'pushback-001',
    transactionId: 'TXN-20240722001',
    action: 'push back',
    totalRepush: 1,
    date: '2024-07-22T10:30:00+07:00',
    status: 'Failed',
    billerConfiguration: {
      type: 'webhook',
      url: 'https://example.com/webhook',
      exchange: null,
      routingKey: null,
    },
    payload: {
      transaction_id: 'TXN-20240722001',
      status: 'failed',
      amount: 10.5,
      currency: 'USD',
      customer: {
        name: 'John Doe',
        phone: '012345678',
      },
    },
    response: {
      statusCode: 500,
      message: 'Internal Server Error',
    },
    headers: {
      'Content-Type': 'application/json',
    },
    retrying: false,
    allowPushBack: true,
  }
})

const retryPushBack = (id: string) => {
  const item = webhookHistoryData.value.find((x) => x.id === id)
  if (!item) return

  item.retrying = true
  notification.showInfo({
    title: 'Retry Push Back',
    description: `Retrying push back for ID ${id}...`,
  })

  setTimeout(() => {
    item.status = 'Success'
    item.retrying = false
    notification.showSuccess({
      title: 'Push Back Success',
      description: `Push back for ID ${id} has been resent successfully.`,
    })
  }, 1500)
}

const webhookColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'date',
    header: ({ column }: any) => createSortableHeader(column, 'Date', 'left'),
    accessorKey: 'date',
    enableSorting: true,
    cell: ({ row }: any) => {
      return h('div', { class: 'text-sm text-left' }, [
        format.formatDateTime(row.original.date, {
          dateStyle: userPreferences?.dateFormat || 'medium',
          timeStyle: userPreferences?.timeFormat || 'short',
        }),
      ])
    },
    size: 100,
  },
  //  {
  //   id: 'total_repush',
  //   header: () => h('div', { class: 'text-right' }, 'Total Repush'),
  //   accessorKey: 'total_repush',
  //   enableSorting: false,
  //   cell:  ({ row }: any) =>
  //     h('div', { class: 'text-right' },row.original.totalRepush),
  // },
  {
    id: 'type',
    header: () => h('div', { class: 'text-left' }, 'Type'),
    accessorKey: 'type',
    enableSorting: false,
    cell:  ({ row }: any) =>
      h('div', { class: 'text-left' },row.original.type),
    size: 100,
  },
  {
    id: 'status',
    header: () => h('div', { class: 'text-left' }, 'Status'),
    accessorKey: 'status',
    enableSorting: false,
    cell: ({ row }: any) =>
      h(StatusBadge, {
        class: 'text-left',
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    size: 100,
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-left' }, 'Actions'),
    cell: ({ row }: any) =>
      h(
        'div',
        {
          class: 'relative inline-block group',
        },
        [
          h(
            'button',
            {
              class: `
                inline-flex items-center justify-center w-6 h-6 rounded transition-colors
                ${
                  row.original.retrying
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
                    : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                }
              `,
              disabled: row.original.retrying,
              onClick: () => retryPushBack(row.original.id),
              title: row.original.retrying ? 'Retrying...' : 'Retry Push Back',
            },
            [
              row.original.retrying
                ? h('svg', {
                    class: 'animate-spin h-3 w-3',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    innerHTML: `
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    `,
                  })
                : h('svg', {
                    class: 'w-3 h-3',
                    xmlns: 'http://www.w3.org/2000/svg',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    'stroke-width': '1.5',
                    stroke: 'currentColor',
                    innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />`,
                  }),
            ]
          ),
        ]
      ),
    size: 80,
    enableSorting: false,
  },
]

// Repush Details Columns for Activity Logs
const repushDetailsColumns = [
  {
    id: 'row_number',
    header: () => '#',
    cell: ({ row, table }: any) => createRowNumberCell(row, table),
    size: 50,
    maxSize: 50,
    enableSorting: false,
  },
  {
    id: 'date',
    header: ({ column }: any) => createSortableHeader(column, t('pages.transaction_detail.date'), 'left'),
    accessorKey: 'date',
    enableSorting: true,
    cell: ({ row }: any) => {
      return h('div', { class: 'text-sm text-left' }, [
        format.formatDateTime(row.original.date, {
          dateStyle: userPreferences?.dateFormat || 'medium',
          timeStyle: userPreferences?.timeFormat || 'short',
        }),
      ])
    },
    size: 120,
  },
  {
    id: 'status',
    header: () => h('div', { class: 'text-left' }, t('pages.transaction.status')),
    accessorKey: 'status',
    enableSorting: false,
    cell: ({ row }: any) =>
      h(StatusBadge, {
        class: 'text-left',
        status: row.original.status,
        variant: 'subtle',
        size: 'sm',
      }),
    size: 100,
  },
  {
    id: 'statusCode',
    header: () => h('div', { class: 'text-center' }, t('pages.transaction_detail.status_code')),
    accessorKey: 'metaData.statusCode',
    enableSorting: false,
    cell: ({ row }: any) =>
      h('div', { class: 'text-center font-mono text-sm' }, row.original.metaData?.statusCode || 'N/A'),
    size: 100,
  },
]

// Transaction data computed from API response
const computedTransactionData = computed(() => {
  if (!transactionData.value) {
    return {
      transactionNo: '',
      date: '',
      transactionType: '',
      currency: '',
      status: '',
      transactionAmount: 0,
      settlementAmount: 0,
      customerFee: 0,
      supplierFee: 0,
      bankReference: '',
      collectionBank: '',
      settlementBank: '',
      settlementBankLogo: '',
      accountNumber: '',
      subBiller: '',
      transactionReference: '',
      settlementStatus: '',
      extData: '',
    }
  }

  const data = transactionData.value
  
  return {
    transactionNo: data.transactionNo || transactionId.value,
    date: data.date || '',
    transactionType: data.transactionType || '',
    currency: data.currency || data.currencyId || '',
    status: data.status || '',
    transactionAmount: data.totalAmount || 0,
    settlementAmount: data.settlementAmount || 0,
    customerFee: data.customerFee || 0,
    supplierFee: data.billerFee || 0,
    bankReference: data.bankReference || '',
    collectionBank: data.collectionBank || '',
    collectionBankLogo: data.collectionBankLogo || '',
    settlementBank: data.settlementBank || '',
    settlementBankLogo: data.settlementBankLogo || '',
    accountNumber: data.accountNumber || '',
    subBiller: data.subBiller || data.subBillerNameKh || '',
    transactionReference: data.bankReference || '',
    settlementStatus: data.status || '',
    extData: data.extData || '',
  }
})


// Transaction overview fields
const transactionOverviewFields = computed(() => {
  const txData = computedTransactionData.value
  
  return [
    {
      label: t('pages.transaction.status'),
      value: txData.status,
      type: 'status',
      status: txData.status,
    },
    {
      label: t('pages.transaction.amount'),
      value: `${useCurrency().formatAmount(txData.transactionAmount)} ${txData.currency}`,
      type: 'amount',
    },
    {
      label: t('pages.transaction.transaction_type'),
      // value: txData.transactionType,
      // type: 'badge',
      value: getTransactionTypeGroupDisplayText(txData.transactionType),
      type: 'text'
    },
    {
      label: t('pages.transaction.created_date'),
      value: txData.date ? format.formatDateTime(txData.date, {
        dateStyle: userPreferences?.dateFormat || 'medium',
        timeStyle: userPreferences?.timeFormat || 'short',
      }) : '',
      type: 'text',
    },
    {
      label: t('pages.transaction.customer_fee'),
      value: `${useCurrency().formatAmount(txData.customerFee)} ${txData.currency}`,
      type: 'amount',
    },
    {
      label: t('pages.transaction.supplier_fee'),
      value: `${useCurrency().formatAmount(txData.supplierFee)} ${txData.currency}`,
      type: 'amount',
    },
    {
      label: t('pages.transaction.sub_biller'),
      value: txData.subBiller,
      type: 'text',
    },
    {
      label: t('pages.transaction.settlement_bank'),
      value: txData.collectionBank,
      type: 'text',
    },
    {
      label: t('pages.transaction.bank_ref'),
      value: txData.transactionReference,
      type: 'code',
      copyable: true,
      rawValue: txData.transactionReference,
    }
  ]
})

// Show all fields in a single column
const allFields = computed(() => transactionOverviewFields.value)

// Push Back Transaction Detail function
const onRowSelect = (row: any) => {
  selectedPushBackTransaction.value = row.original
  showPushBackDetail.value = true
}

// Repush Detail Select function for Activity Logs
const onRepushDetailSelect = (row: any) => {
  console.log('🔍 Activity Log row selected:', row.original)
  console.log('📋 Row data structure:', JSON.stringify(row.original, null, 2))
  selectedActivityLog.value = row.original
  showActivityLogDetail.value = true
  console.log('✅ Activity Log slideover should open')
}

const closeSlideover = () => {
  showPushBackDetail.value = false
  selectedPushBackTransaction.value = null
}

const closeActivityLogSlideover = () => {
  showActivityLogDetail.value = false
  selectedActivityLog.value = null
}

// Helper function to get selected push back detail (for Repush Summary)
const getSelectedPushBackDetail = () => {
  if (!selectedPushBackTransaction.value) return null
  
  const data = selectedPushBackTransaction.value as any
  
  // For RepushSummary data (from clicking the summary card)
  return {
    transactionId: data.transactionId || summary.value.transactionId,
    date: data.date || summary.value.date,
    status: data.status || summary.value.status,
    totalRepush: data.totalRepush || summary.value.totalRepush,
    billerConfiguration: {
      type: data.type || summary.value.type || 'webhook',
      url: data.metaData?.url || summary.value.metaData?.url || 'N/A'
    },
    payload: data.payload || summary.value.payload || {},
    statusCode: null
  }
}

// Helper function to get selected activity log detail
const getSelectedActivityLogDetail = () => {
  if (!selectedActivityLog.value) return null
  
  const data = selectedActivityLog.value as any
  
  // For Activity Log data (repush detail items)
  return {
    transactionId: summary.value.transactionId,
    date: data.date,
    status: data.status,
    totalRepush: summary.value.totalRepush,
    payload: data.metaData?.responsePayload || {},
    statusCode: data.metaData?.statusCode || null
  }
}


// Transaction Allocation Detail function
const onTransactionAllocationSelect = async (row: any) => {
  selectedTransactionAllocation.value = row.original
  showTransactionAllocationDetail.value = true
  
  // Fetch allocation detail from API
  if (row.original.id) {
    await fetchAllocationDetail(row.original.id)
  }
}

const closeAllocationSlideover = () => {
  showTransactionAllocationDetail.value = false
  selectedTransactionAllocation.value = null
  allocationDetailData.value = null
  allocationDetailError.value = null
}

// Fetch allocation detail
const fetchAllocationDetail = async (allocationId: string) => {
  allocationDetailLoading.value = true
  allocationDetailError.value = null
  
  try {
    console.log(`Fetching allocation detail for transaction ${transactionId.value}, allocation ${allocationId}`)
    const result = await getAllocationDetail(transactionId.value, allocationId)
    allocationDetailData.value = result
    // Use mock data instead of API result
    //allocationDetailData.value = transactionAllocationDetail.value
    
    //console.log('Allocation detail fetched:', result)
  } catch (error) {
    console.error('Failed to fetch allocation detail:', error)
    allocationDetailError.value = t('pages.transaction_allocation.failed_allocation_detail')
  } finally {
    allocationDetailLoading.value = false
  }
}

// Transaction Allocation Detail data (mock data - commented out, now using API data)

const transactionAllocationDetail = ref({
  id: '56567e22-123e-405a-8672-919d25ac2e23',
  transactionId: 'ccb361bd-6b4e-4544-ade7-ab20d4d78923',
  customer: 'HAI029',
  customerCode: 'CUS-0001',
  allocationPartyName: 'Charge Station A',
  billerName: 'Charge Station A',
  billerId: 'BILLER-001',
  transactionAmount: 4000,
  amount: 3800,
  settleAmount: 3800,
  totalSettlement: 1,
  outstandingAmount: 0,
  currency: 'KHR',
  date: '2025-07-09 09:31 AM',
  status: 'complete',
  settlements: [
    {
      settlementId: 'e8369106-fb05-4418-bccf-c2f8d359c416',
      transactionId: 'd8369106-fb05-4418-bccf-c2f8d359c413',
      settleAmount: 3800,
      currency: 'KHR',
      status: 'success',
      bankReference: 'CC2342342',
      bank: 'AC',
      bankLogo: 'https://b24-upload.s3.ap-southeast-1.amazonaws.com/bank_brand_logos/acleda.jpg',
      customerName: 'HAI029',
      customerCode: 'CUS-0001',
      settleBy: '',
      description: ''
    }
  ]
})


// Helper function to get selected transaction allocation detail (commented out - now using allocationDetailData directly)
/*
const getSelectedAllocationDetail = () => {
  // If we have fetched detail data from API, use it
  if (allocationDetailData.value) {
    return allocationDetailData.value
  }
  
  // Fallback to mock data if API data is not available
  if (selectedTransactionAllocation.value) {
    return { ...transactionAllocationDetail.value, ...selectedTransactionAllocation.value }
  }
  
  return transactionAllocationDetail.value
}
*/

const exportTransaction = async () => {
  try {
    showDownloadModal.value = false
    notification.showInfo({
      title: 'Generating Export',
      description: 'Please wait while we capture the transaction details...',
    })
    notification.showSuccess({
      title: 'Export Complete',
      description: 'Transaction details exported successfully',
    })
  } catch (error) {
    console.error('Error exporting transaction:', error)
    notification.showError({
      title: 'Export Failed',
      description: 'Failed to export transaction details. Please try again.',
    })
  }
}

const downloadReceiptAsImage = async () => {
  try {
    showDownloadModal.value = false
    notification.showInfo({
      title: 'Generating Receipt',
      description: 'Please wait while we capture the receipt...',
    })

    notification.showSuccess({
      title: 'Receipt Downloaded',
      description: 'Receipt has been downloaded successfully',
    })
  } catch (error) {
    console.error('Error downloading receipt:', error)
    notification.showError({
      title: 'Download Failed',
      description: 'Failed to download receipt. Please try again.',
    })
  }
}

// Handle repush transaction
const handleRepush = async () => {
  try {
    isRepushing.value = true
    
    notification.showInfo({
      title: 'Repushing Transaction',
      description: `Repushing transaction ${summary.value.transactionNo}...`,
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update summary data
    summary.value.totalRepush += 1
    summary.value.date = new Date().toISOString()
    summary.value.status = RepushStatus.Success
    
    notification.showSuccess({
      title: 'Repush Successful',
      description: `Transaction ${summary.value.transactionNo} has been repushed successfully.`,
    })
  } catch (error) {
    console.error('Error repushing transaction:', error)
    notification.showError({
      title: 'Repush Failed',
      description: 'Failed to repush transaction. Please try again.',
    })
  } finally {
    isRepushing.value = false
  }
}

// Handle verify transaction
const handleVerifyTransaction = async () => {
  try {
    isVerifying.value = true
    
    notification.showInfo({
      title: 'Verifying Transaction',
      description: `Verifying direct debit transaction ${summaryDirectDebit.value.transactionNo}...`,
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update direct debit summary data
    summaryDirectDebit.value.lastPushDate = new Date().toISOString()
    summaryDirectDebit.value.status = 'success'
    
    notification.showSuccess({
      title: 'Verification Successful',
      description: `Transaction ${summaryDirectDebit.value.transactionNo} has been verified successfully.`,
    })
  } catch (error) {
    console.error('Error verifying transaction:', error)
    notification.showError({
      title: 'Verification Failed',
      description: 'Failed to verify transaction. Please try again.',
    })
  } finally {
    isVerifying.value = false
  }
}

// Handle void payment request
const handleVoidPaymentRequest = async () => {
  try {
    isVoidRequesting.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Navigate to void payment detail page
    router.push(`/void-payment/detail/${transactionId.value}`)
  } catch (error) {
    console.error('Error processing void request:', error)
    notification.showError({
      title: 'Void Request Failed',
      description: 'Failed to process void payment request. Please try again.',
    })
  } finally {
    isVoidRequesting.value = false
  }
}

// Open repush detail slideover
const openRepushDetail = () => {
  console.log('🚀 Opening repush detail')
  console.log('📊 Summary data:', summary.value)
  // Use the repush summary data as the selected transaction
  if (summary.value) {
    selectedPushBackTransaction.value = summary.value
    showPushBackDetail.value = true
    console.log('✅ Slideover should open now')
  }else{
    console.log('❌ No summary data available')
  }
}

// Open direct debit detail (placeholder function)
const openDirectDebitDetail = () => {
  // Placeholder function - can be implemented later when direct debit detail slideover is needed
  notification.showInfo({
    title: 'Direct Debit Details',
    description: 'Direct debit detail view is not yet implemented.',
  })
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber
  const lastFour = accountNumber.slice(-4)
  const maskedPart = '*'.repeat(accountNumber.length - 4)
  return `${maskedPart}${lastFour}`
}

// Fetch transaction data
const fetchTransactionData = async () => {
  loading.value = true
  apiError.value = null
  
  try {
    const result = await getTransactionById(transactionId.value)
    transactionData.value = result
   
  } catch (error) {
    console.error('Failed to fetch transaction data:', error)
    apiError.value = t('pages.transaction_detail.error_transaction_detail')
  } finally {
    loading.value = false
  }
}

// Fetch transaction allocation data
const fetchTransactionAllocation = async () => {
  allocationLoading.value = true
  allocationError.value = null
  
  try {
    const result = await getTransactionAllocationList(transactionId.value)
    allocationData.value = result.allocations || []

    console.log('Transaction allocation data fetched:', allocationData.value)
  } catch (error) {
    console.error('Failed to fetch transaction allocation data:', error)
    allocationError.value = t('pages.transaction_detail.error_allocation')
    allocationData.value = []
  } finally {
    allocationLoading.value = false
  }
}


onMounted(async () => {
  await fetchTransactionData()
  await fetchTransactionAllocation()
})

</script>

<style scoped>
/* Ensure modal is visible and has a high z-index */
.u-modal {
  z-index: 1000;
}
</style>
