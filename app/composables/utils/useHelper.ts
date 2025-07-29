export const useHelper = () => {
  const formatAmountWithSymbol = (amount: number, currency: string): string => {
    if (!currency || typeof currency !== 'string') {
      return '-'
    }

    // Handle KHR currency with Riel symbol
    if (currency === 'KHR') {
      return (
        new Intl.NumberFormat('km-KH', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount) + ' ៛'
      )
    }

    // Handle USD and other currencies
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Format amount with currency symbol and proper decimal places
   * @param amount - The amount to format
   * @param currency - Currency code (USD, KHR, etc.)
   * @param options - Additional formatting options
   */
  const formatAmount = (
    amount: number | string | null | undefined,
    currency: string = 'USD',
    options: {
      showSymbol?: boolean
      showCode?: boolean
      minimumFractionDigits?: number
      maximumFractionDigits?: number
      locale?: string
    } = {}
  ): string => {
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

  return {
    formatAmountWithSymbol,
    formatAmount,
  }
}
