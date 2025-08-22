import { ColumnType } from '@/utils/enumModel';
import { format } from 'date-fns/format';
import { h } from 'vue';
import ClipboardBadge from '~/components/buttons/ClipboardBadge.vue';
import { useCurrency } from '~/composables/utils/useCurrency';

// Helper to support nested accessors like "supplier.code"
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
} // Assuming you have an i18n utility for translations

// export const { t } = useI18n()
// export const getFeeTypeOptions = () =>
//   Object.values(FeeType).map((value) => ({
//     label: t(`${value}_fee`), // Assuming t() is a translation function
//     value: value.toString(),
//   }))

// export const getCurrencyOptions = () => {
//   const { getCurrencySymbol } = useCurrency()
//   return Object.values(Currency).map((value) => ({
//     label: `${value} - ${getCurrencySymbol(value)}`,
//     value: value.toString(),
//   }))
// }

/**
 * Format amount with currency symbol and proper decimal places
 * @param amount - The amount to format
 * @param currency - Currency code (USD, KHR, etc.)
 * @param options - Additional formatting options
 */
export function formatAmount(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  options: {
    showSymbol?: boolean
    showCode?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    locale?: string
  } = {}
): string {
  // Handle null/undefined/empty values
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }

  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) {
    return '-'
  }

  const { showSymbol = true, showCode = false, locale = 'en-US' } = options

  const currencyUpper = currency.toUpperCase()
  const isKHR = currencyUpper === 'KHR'

  // Set default decimal places based on currency
  const defaultMinDecimals = isKHR ? 0 : 2
  const defaultMaxDecimals = isKHR ? 0 : 2

  const minDecimals = options.minimumFractionDigits ?? defaultMinDecimals
  const maxDecimals = options.maximumFractionDigits ?? defaultMaxDecimals

  if (showSymbol) {
    // Format with currency symbol
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyUpper,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(numericAmount)
  } else {
    // Format without currency symbol
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(numericAmount)

    if (showCode) {
      return `${formattedNumber} ${currencyUpper}`
    }

    return formattedNumber
  }
}

export function formatAmountV2(amount: number | string, currency?: string) {
  return useCurrency().formatAmount(amount, currency)
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code
 */
export function getCurrencySymbol(currency: string): string {
  const currencyUpper = currency.toUpperCase()

  const symbols: Record<string, string> = {
    USD: '$',
    KHR: '៛',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }

  return symbols[currencyUpper] || currencyUpper
}

/**
 * Format amount with custom symbol (useful for displaying KHR with ៛)
 * @param amount - The amount to format
 * @param currency - Currency code
 * @param customSymbol - Custom symbol to use
 */
export function formatAmountWithSymbolTest(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  customSymbol?: string
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }

  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) {
    return '-'
  }

  const currencyUpper = currency.toUpperCase()
  const isKHR = currencyUpper === 'KHR'
  const symbol = customSymbol || getCurrencySymbol(currencyUpper)

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isKHR ? 0 : 2,
    maximumFractionDigits: isKHR ? 0 : 2,
  }).format(numericAmount)

  // For KHR, put symbol after the number
  if (isKHR) {
    return `${formattedNumber}${symbol}`
  }

  // For other currencies, put symbol before
  return `${symbol}${formattedNumber}`
}

export function formatColumnValue(
  type: ColumnType = ColumnType.Text,
  row: Record<string, unknown>,
  accessorKey: string,
  currencyKey?: string
): string {
  const value = getNestedValue(row, accessorKey)

  if (value === null || value === undefined || value === '') return '-'

  switch (type) {
    case ColumnType.Number: {
      const currency = currencyKey ? getNestedValue(row, currencyKey) : ''
      const isKHR = currency?.toUpperCase() === 'KHR'

      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: isKHR ? 0 : 2,
        maximumFractionDigits: isKHR ? 0 : 2,
      })
    }

    case ColumnType.Currency: {
      const currency = currencyKey ? getNestedValue(row, currencyKey) || 'USD' : 'USD'
      const isKHR = currency.toUpperCase() === 'KHR'

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: isKHR ? 0 : 2,
        maximumFractionDigits: isKHR ? 0 : 2,
      }).format(Number(value))
    }

    case ColumnType.Date: {
      const date = new Date(value)
      return isNaN(date.getTime()) ? '-' : format(date, 'dd-MM-yyyy')
    }

    case ColumnType.DateTime: {
      const date = new Date(value)
      return isNaN(date.getTime()) ? '-' : format(date, 'dd-MM-yyyy HH:mm')
    }

    case ColumnType.Text:
    default:
      return String(value)
  }
}

export const formatDateForBackendRequest = (dateStr: string, formatStr: string = 'dd/MM/yyyy') => {
  try {
    // Create Date object from input
    const date = new Date(dateStr);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn("Invalid date provided to formatDateForBackendRequest:", dateStr);
      return typeof dateStr === "string" ? dateStr : "-";
    }

    // Format as dd/MM/yyyy
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateStr);
    return '-';
  }
}

export const copyCell = (text?: string | null, t?: (key: string) => string) => {
  const translationFn = t || ((key: string) => key) // Fallback if no translation function provided
  
  return h(
    'div',
    {
      class: 'inline-flex items-center',
      onClick: (e: MouseEvent) => e.stopPropagation(),
      onMousedown: (e: MouseEvent) => e.stopPropagation(),
    },
    [
      h(ClipboardBadge, {
        text: text ?? '-',
        copiedTooltipText: translationFn('clipboard.copied'),
      }),
    ]
  )
}


export const getTranslatedStatusLabel = (statusValue: string, t?: (key: string) => string): string => {
  // Provide fallback if no translation function is passed
  const translationFn = t || ((key: string) => key.split('.').pop() || key)

  if (statusValue === '') return translationFn('status.all')

  switch (statusValue.toLowerCase()) {
    case 'pending':
      return translationFn('status.pending')
    case 'processing':
      return translationFn('status.processing')
    case 'completed':
      return translationFn('status.completed')
    case 'failed':
      return translationFn('status.failed')
    case 'active':
      return translationFn('status.active')
    case 'inactive':
      return translationFn('status.inactive')
    
    default:
      return statusValue
  }
}

export const getFilterTranslateTransactionStatusLabel = (statusValue: string, t?: (key: string) => string): string => {
  // Provide fallback if no translation function is passed
  const translationFn = t || ((key: string) => key.split('.').pop() || key)

  if (statusValue === '') return translationFn('status.all')

  switch (statusValue.toLowerCase()) {
    case 'success':
      return translationFn('status.success')
    case 'pending':
      return translationFn('status.pending')
    case 'completed':
      return translationFn('status.completed')
    case 'failed':
      return translationFn('status.failed')
    case 'error':
      return translationFn('status.error')
    case 'cancel':
      return translationFn('status.cancel')
    case 'expire':
      return translationFn('status.expire')
    case 'reversed':
      return translationFn('status.reversed')
    default:
      return statusValue
  }
}

