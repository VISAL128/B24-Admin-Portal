<template>
  <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div class="flex justify-between items-start gap-4">
      <div class="flex flex-col">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {{ t('settlement.generate.form.total_transactions') }}
        </p>
        <span class="font-bold text-gray-800 dark:text-gray-200">
          {{ props.totalTransactions || 0 }}
        </span>
      </div>
      <div class="flex flex-col text-right">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {{ t('settlement.generate.form.total_amount') }}
        </p>
        <AmountWithCurrency
          :amount="props.amount"
          :currency="props.currency"
          size="md"
        />
        <!-- <span class="font-bold text-gray-800 dark:text-gray-200">
          {{ formatAmount(props.amount, props.currency) }}
          <span class="ml-1">
            {{ props.currency }}
          </span>
        </span> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useCurrency } from '~/composables/utils/useCurrency'
import AmountWithCurrency from '../AmountWithCurrency.vue'

const { t } = useI18n()
// const { formatAmount } = useCurrency()

const props = defineProps<{
  totalTransactions: number
  amount: number
  currency?: string
}>()
</script>
