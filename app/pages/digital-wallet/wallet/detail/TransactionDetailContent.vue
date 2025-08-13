<template>
  <div v-if="transaction" class="space-y-4">
    <!-- Transaction Header -->
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
      <div class="flex items-center gap-2">
        <TransactionTypeBadge :transaction-type="transaction.transaction_type" />
        <StatusBadge :status="transaction.status" variant="subtle" size="sm" />
      </div>
    </div>

    <!-- Customer & Transaction Summary Card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 class="text-base font-medium text-gray-900 dark:text-white">
              {{ t('wallet_page.customer_info') }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDateTime(transaction.tran_date) }}
            </p>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ t('wallet_page.customer_name') }}
          </p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ transaction.customer_name || 'N/A' }}
          </p>
        </div>
        <div class="col-span-2">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ t('wallet_page.customer_email') }}
          </p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ transaction.customer_email || 'N/A' }}
          </p>
        </div>
        <div class="col-span-2">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ t('wallet_page.customer_phone') }}
          </p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ transaction.customer_phone || 'N/A' }}
          </p>
        </div>
      </div>

      <!-- Amount Summary -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('settlement.amount') }}</span>
          <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(transaction.amount, transaction.currency) }}
          </span>
        </div>
        <div v-if="transaction.settlement_amount > 0" class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.settlement_amount') }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatCurrency(transaction.settlement_amount, transaction.currency) }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.currency') }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ transaction.currency }}
          </span>
        </div>
      </div>
    </UCard>

    <!-- Transaction Details Section -->
    <div class="space-y-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center"
        >
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-blue-600" />
        </div>
        <h4 class="text-base font-medium text-gray-900 dark:text-white">
          {{ t('wallet_page.transaction_details') }}
        </h4>
      </div>

      <!-- Transaction Information Cards -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
        <!-- Transaction Information -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.transaction_id') }}:</span>
            <CopyableText :text="transaction.transaction_id" />
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.transaction_type') }}:</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ transaction.transaction_type }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.bank_ref_id') }}:</span>
            <CopyableText 
              :text="transaction.bank_ref_id || 'N/A'" 
              :show-copy="!!transaction.bank_ref_id"
            />
          </div>

          <div class="flex justify-between items-start">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('wallet_page.description') }}:</span>
            <span class="text-sm text-gray-700 dark:text-gray-300 text-right max-w-xs">
              {{ transaction.description || 'N/A' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center h-64 text-center">
    <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      {{ t('wallet_page.no_transaction_selected') }}
    </p>
    <p class="text-xs text-gray-400 dark:text-gray-500">
      {{ t('wallet_page.select_transaction_to_view') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'
import { useFormat } from '~/composables/utils/useFormat'
import type { WalletTransaction } from '~/models/wallet'

// Props
interface Props {
  transaction?: WalletTransaction | null
}

withDefaults(defineProps<Props>(), {
  transaction: null
})

// Composables
const { formatCurrency } = useCurrency()
const { formatDateTime } = useFormat()
const { t } = useI18n()
</script>
