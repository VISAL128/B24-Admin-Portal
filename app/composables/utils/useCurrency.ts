import { ref, computed } from 'vue'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  decimals: number
  locale: string
}

export interface CurrencyFormatOptions {
  showSymbol?: boolean
  showCode?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

export const useCurrency = () => {
  // Common currencies used in Bill24
  const currencies = ref<Record<string, CurrencyConfig>>({
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      decimals: 2,
      locale: 'en-US'
    },
    KHR: {
      code: 'KHR',
      symbol: '៛',
      name: 'Cambodian Riel',
      decimals: 0,
      locale: 'km-KH'
    }
  })

  const defaultCurrency = ref<string>('USD')

  // Get currency configuration
  const getCurrency = (code: string): CurrencyConfig | null => {
    return currencies.value[code.toUpperCase()] || null
  }

  // Get all available currencies
  const getAllCurrencies = computed(() => {
    return Object.values(currencies.value)
  })

  // Get currency options for select components
  const getCurrencyOptions = computed(() => {
    return getAllCurrencies.value.map(currency => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
      symbol: currency.symbol
    }))
  })

  // Format amount with currency
  const formatCurrency = (
    amount: number | string,
    currencyCode: string = defaultCurrency.value,
    options: CurrencyFormatOptions = {}
  ): string => {
    const currency = getCurrency(currencyCode)
    if (!currency) {
      return String(amount)
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) {
      return '0'
    }

    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: options.minimumFractionDigits ?? currency.decimals,
      maximumFractionDigits: options.maximumFractionDigits ?? currency.decimals,
      useGrouping: options.useGrouping ?? true
    }

    try {
      const formatted = new Intl.NumberFormat(currency.locale, formatOptions).format(numericAmount)
      
      // Custom formatting based on options
      if (!options.showSymbol && !options.showCode) {
        return formatted.replace(/[^\d.,\s-]/g, '').trim()
      }
      
      if (options.showCode && !options.showSymbol) {
        return `${numericAmount.toLocaleString(currency.locale, {
          minimumFractionDigits: formatOptions.minimumFractionDigits,
          maximumFractionDigits: formatOptions.maximumFractionDigits,
          useGrouping: formatOptions.useGrouping
        })} ${currency.code}`
      }

      return formatted
    } catch (error) {
      console.error('Currency formatting error:', error)
      return `${currency.symbol}${numericAmount.toFixed(currency.decimals)}`
    }
  }

  // Format amount without currency symbol
  const formatAmount = (
    amount: number | string,
    currencyCode: string = defaultCurrency.value
  ): string => {
    return formatCurrency(amount, currencyCode, { showSymbol: false, showCode: false })
  }

  // Parse currency string to number
  const parseCurrency = (currencyString: string): number => {
    if (!currencyString) return 0
    
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanString = currencyString.replace(/[^\d.,-]/g, '')
    const numericValue = parseFloat(cleanString.replace(',', ''))
    
    return isNaN(numericValue) ? 0 : numericValue
  }

  // Convert between currencies (placeholder for future exchange rate integration)
  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRate?: number
  ): number => {
    if (fromCurrency === toCurrency) return amount
    
    // For now, return the original amount
    // In the future, integrate with exchange rate API
    if (exchangeRate) {
      return amount * exchangeRate
    }
    
    console.warn('Currency conversion requires exchange rate integration')
    return amount
  }

  // Validate currency code
  const isValidCurrency = (code: string): boolean => {
    return code.toUpperCase() in currencies.value
  }

  // Get currency symbol
  const getCurrencySymbol = (code: string): string => {
    const currency = getCurrency(code)
    return currency?.symbol || code
  }

  // Add new currency
  const addCurrency = (config: CurrencyConfig): void => {
    currencies.value[config.code.toUpperCase()] = config
  }

  // Set default currency
  const setDefaultCurrency = (code: string): void => {
    if (isValidCurrency(code)) {
      defaultCurrency.value = code.toUpperCase()
    }
  }

  // Compare currency amounts
  const compareCurrencyAmounts = (
    amount1: number,
    currency1: string,
    amount2: number,
    currency2: string
  ): number => {
    if (currency1 === currency2) {
      return amount1 - amount2
    }
    
    // For different currencies, would need exchange rates
    console.warn('Comparing different currencies requires exchange rate conversion')
    return 0
  }

  return {
    // State
    currencies: readonly(currencies),
    defaultCurrency: readonly(defaultCurrency),
    
    // Computed
    getAllCurrencies,
    getCurrencyOptions,
    
    // Methods
    getCurrency,
    formatCurrency,
    formatAmount,
    parseCurrency,
    convertCurrency,
    isValidCurrency,
    getCurrencySymbol,
    addCurrency,
    setDefaultCurrency,
    compareCurrencyAmounts
  }
}

// Export types for external use
// export type { CurrencyConfig, CurrencyFormatOptions }
