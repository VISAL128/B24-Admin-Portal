<template>
  <div class="flex items-baseline gap-1">
    <span class="font-bold" :class="amountClasses">
      {{ formattedAmount }}
    </span>
    <span v-if="showCurrency" class="text-sm font-medium font-mono" :class="currencyClasses">
      {{ currency }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/utils/useCurrency'

interface Props {
  amount: number | string
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning'
  showSymbol?: boolean
  showCurrency?: boolean
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  showSymbol: false,
  showCurrency: true,
  currency: 'USD',
  textColor: undefined,
})

const { t } = useI18n()
const { formatAmount } = useCurrency()

const formattedAmount = computed(() => {
  const numericAmount = typeof props.amount === 'string' ? parseFloat(props.amount) : props.amount

  if (isNaN(numericAmount)) {
    return props.showSymbol ? `${currencySymbol.value}0.00` : '0.00'
  }

  const formatted = formatAmount(numericAmount, props.currency)
  return props.showSymbol ? `${currencySymbol.value}${formatted}` : formatted
})

const currencySymbol = computed(() => {
  const currency = props.currency?.toLowerCase() || 'usd'
  return t(`settings.currency_format.symbol_${currency}`)
})

const amountClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  }

  // Use custom text color if provided, otherwise use variant colors
  const colorClasses = props.textColor
    ? props.textColor
    : (() => {
        const variantClasses = {
          default: 'text-gray-900 dark:text-gray-100',
          primary: 'text-blue-600 dark:text-blue-400',
          secondary: 'text-gray-600 dark:text-gray-300',
          success: 'text-green-600 dark:text-green-400',
          error: 'text-red-600 dark:text-red-400',
          warning: 'text-amber-600 dark:text-amber-400',
        }
        return variantClasses[props.variant]
      })()

  return [sizeClasses[props.size], colorClasses]
})

const currencyClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  // Use the same color as the amount text
  const colorClasses = props.textColor
    ? props.textColor
    : (() => {
        const variantClasses = {
          default: 'text-gray-700 dark:text-gray-50',
          primary: 'text-blue-500 dark:text-blue-300',
          secondary: 'text-gray-400 dark:text-gray-200',
          success: 'text-green-500 dark:text-green-300',
          error: 'text-red-500 dark:text-red-300',
          warning: 'text-amber-500 dark:text-amber-300',
        }
        return variantClasses[props.variant]
      })()

  return [sizeClasses[props.size], colorClasses]
})
</script>
