// export default FeeConfiguration;
import { useFeeConfigApi } from '~/composables/api/useFeeConfigApi'

export interface SupplierFee {
  id: string
  value: number
}

export interface TransactionFeeRow {
  start_amount: number
  end_amount: number | null
  fee_amount: number
  fee_type: 'percentage' | 'fixed'
  unlimited: boolean
  supplier_rate: number
  customer_rate: number
  supplier_sharings: SupplierFee[]
}

export interface DistributionFeeRow {
  feeCharge: number
  supplierFees: { [supplierId: string]: number }
}

export interface Supplier {
  id: string
  name: string
  isDisabled: boolean
}

export interface FeeConfig {
  currency: string
  transaction_fees: TransactionFeeRow[]
  allocate_details: Supplier[]
}

export interface TransactionResult {
  transactionFee: number
  distribution: { [supplierName: string]: number }
}

class FeeConfiguration {
  private feeConfigs: FeeConfig[] = []
  private isInitialized: boolean = false

  async initialize(defaultSupplierId?: string, defaultSupplierName?: string): Promise<void> {
    if (this.isInitialized) return

    try {
      const data = await useFeeConfigApi().getSupplierFeeConfig({ search: '' })

      if (data.length === 0) {
        console.warn('No fee configurations returned from API, using default configuration')
        this.feeConfigs = this.getDefaultFeeConfigs(defaultSupplierId, defaultSupplierName)
      } else {
        this.feeConfigs = data

        // Ensure both KHR and USD currencies exist
        const defaultConfigs = this.getDefaultFeeConfigs(defaultSupplierId, defaultSupplierName)
        defaultConfigs.forEach((defaultConfig) => {
          if (!this.feeConfigs.some((config) => config.currency === defaultConfig.currency)) {
            this.feeConfigs.push(defaultConfig)
          }
        })
      }

      // Ensure transaction_fees are ordered by start_amount for every currency config
      this.feeConfigs.forEach((cfg) => {
        cfg.transaction_fees = this.sortTransactionFees(cfg.transaction_fees)
      })

      this.isInitialized = true
    } catch (error) {
      console.error('Error fetching fee configuration:', error)
      console.warn('Using default fee configuration due to API error')

      // Use default configuration as fallback
      this.feeConfigs = this.getDefaultFeeConfigs(defaultSupplierId, defaultSupplierName)

      // Sort fallback configs as well
      this.feeConfigs.forEach((cfg) => {
        cfg.transaction_fees = this.sortTransactionFees(cfg.transaction_fees)
      })

      this.isInitialized = true
    }
  }

  private getDefaultFeeConfigs(
    defaultSupplierId?: string,
    defaultSupplierName?: string
  ): FeeConfig[] {
    const supplierId = defaultSupplierId || '3904u39fu39u090f3f3'
    const supplierName = defaultSupplierName || 'Default Supplier'

    return [
      {
        currency: 'KHR',
        transaction_fees: [
          {
            start_amount: 0,
            end_amount: 0,
            fee_amount: 0,
            fee_type: 'percentage',
            unlimited: true,
            supplier_rate: 0,
            customer_rate: 0,
            supplier_sharings: [
              {
                id: supplierId,
                value: 0,
              },
            ],
          },
        ],
        allocate_details: [
          {
            id: supplierId,
            name: `${supplierName} (You)`,
            isDisabled: true,
          },
        ],
      },
      {
        currency: 'USD',
        transaction_fees: [
          {
            start_amount: 0,
            end_amount: 0,
            fee_amount: 0,
            fee_type: 'percentage',
            unlimited: true,
            supplier_rate: 0,
            customer_rate: 0,
            supplier_sharings: [
              {
                id: supplierId,
                value: 0,
              },
            ],
          },
        ],
        allocate_details: [
          {
            id: supplierId,
            name: `${supplierName} (You)`,
            isDisabled: true,
          },
        ],
      },
    ]
  }

  // new: sort helper to keep ordering logic in one place
  private sortTransactionFees(fees: TransactionFeeRow[] = []): TransactionFeeRow[] {
    return fees.slice().sort((a, b) => {
      const sa = Number(a?.start_amount ?? 0)
      const sb = Number(b?.start_amount ?? 0)
      return sa - sb
    })
  }

  getAllConfigFees(): FeeConfig[] {
    return this.feeConfigs
  }

  getSuppliers(currency: string): Supplier[] {
    if (!this.isInitialized) {
      throw new Error('Fee configuration not initialized. Call initialize() first.')
    }

    const config = this.getCurrencyFees(currency)
    return config.allocate_details
  }

  // Add method to check if currency exists
  hasCurrency(currency: string): boolean {
    if (!this.isInitialized) {
      return false
    }
    return this.feeConfigs.some((config) => config.currency === currency)
  }

  // Add method to initialize a currency if it doesn't exist
  initializeCurrency(
    currency: string,
    defaultSupplierId?: string,
    defaultSupplierName?: string
  ): void {
    if (this.hasCurrency(currency)) {
      return // Currency already exists
    }

    const supplierId = defaultSupplierId || '3904u39fu39u090f3f3'
    const supplierName = defaultSupplierName || 'Default Supplier'

    const newCurrencyConfig: FeeConfig = {
      currency: currency,
      transaction_fees: [
        {
          start_amount: 0,
          end_amount: 0,
          fee_amount: 0,
          fee_type: 'percentage',
          unlimited: true,
          supplier_rate: 0,
          customer_rate: 0,
          supplier_sharings: [
            {
              id: supplierId,
              value: 0,
            },
          ],
        },
      ],
      allocate_details: [
        {
          id: supplierId,
          name: `${supplierName} (You)`,
          isDisabled: true,
        },
      ],
    }

    this.feeConfigs.push(newCurrencyConfig)
  }

  getCurrencyFees(currency: string): FeeConfig {
    if (!this.isInitialized) {
      throw new Error('Fee configuration not initialized. Call initialize() first.')
    }

    let foundConfig = this.feeConfigs.find((cur) => cur.currency === currency)

    if (!foundConfig) {
      // Try to get from default configs first
      const defaultConfigs = this.getDefaultFeeConfigs()
      foundConfig = defaultConfigs.find((cur) => cur.currency === currency)

      if (foundConfig) {
        // Add the default config to our configs
        this.feeConfigs.push(foundConfig)
        return foundConfig
      } else {
        // Initialize the currency if it's not found
        this.initializeCurrency(currency)
        foundConfig = this.feeConfigs.find((cur) => cur.currency === currency)
      }
    }

    if (!foundConfig) {
      throw new Error(`Currency ${currency} not supported in selected configuration`)
    }

    return foundConfig
  }

  calculateFees(currency: string, amount: number): TransactionResult {
    const config = this.getCurrencyFees(currency)
    let transactionFee = 0
    let applicableRow: TransactionFeeRow | null = null
    const distribution: { [supplierName: string]: number } = {}

    for (const row of config.transaction_fees) {
      if (
        row.unlimited ||
        (amount >= row.start_amount && (row.end_amount === null || amount <= row.end_amount))
      ) {
        applicableRow = row
        transactionFee =
          row.fee_type === 'percentage' ? (amount * row.fee_amount) / 100 : row.fee_amount
        break
      }
    }

    // Ensure transactionFee is never undefined or NaN
    if (isNaN(transactionFee) || transactionFee === undefined) {
      transactionFee = 0
    }

    if (applicableRow && config.allocate_details.length > 0) {
      for (const supplier of config.allocate_details) {
        const supplierFee = applicableRow.supplier_sharings.find((s) => s.id === supplier.id)
        if (supplierFee) {
          const supplierFeePercentage = supplierFee.value || 0
          const distributionAmount = (transactionFee * supplierFeePercentage) / 100
          distribution[supplier.name] = isNaN(distributionAmount) ? 0 : distributionAmount
        }
      }
    }

    return { transactionFee, distribution }
  }

  addRow(currency: string): void {
    const config = this.getCurrencyFees(currency)
    const newRow: TransactionFeeRow = {
      start_amount: 0,
      end_amount: 0,
      fee_amount: 0,
      fee_type: 'percentage',
      unlimited: false,
      supplier_sharings: config.allocate_details.map((supplier) => ({
        id: supplier.id,
        value: 0,
      })),
      supplier_rate: 0,
      customer_rate: 0,
    }
    config.transaction_fees.push(newRow)
  }

  addSupplier(currency: string, supplierId: string, supplierName: string): void {
    if (!supplierName.trim()) {
      throw new Error('Supplier name cannot be empty')
    }
    const config = this.getCurrencyFees(currency)
    if (config.allocate_details.some((s) => s.name === supplierName)) {
      throw new Error('Supplier name must be unique')
    }

    config.allocate_details.push({
      id: supplierId,
      name: supplierName,
      isDisabled: false,
    })
  }

  removeSupplier(currency: string, supplierId: string): void {
    const config = this.getCurrencyFees(currency)
    config.allocate_details = config.allocate_details.filter((s) => s.id !== supplierId)

    // Remove supplier from all transaction rows
    config.transaction_fees.forEach((row) => {
      row.supplier_sharings = row.supplier_sharings.filter((s) => s.id !== supplierId)
    })
  }

  updateSupplierFee(currency: string, rowIndex: number, supplierId: string, value: number): void {
    const config = this.getCurrencyFees(currency)
    if (rowIndex >= 0 && rowIndex < config.transaction_fees.length) {
      const row = config.transaction_fees[rowIndex]
      const supplierFee = row?.supplier_sharings.find((s) => s.id === supplierId)
      if (supplierFee) {
        supplierFee.value = value
      } else {
        // Add supplier to transaction fee if it doesn't exist
        row?.supplier_sharings.push({
          id: supplierId,
          value: value,
        })
      }
    }
  }

  removeTransactionRow(currency: string, index: number): void {
    const config = this.getCurrencyFees(currency)
    if (config.transaction_fees.length > 1) {
      config.transaction_fees.splice(index, 1)
    }
  }

  toJSON(): FeeConfig[] {
    return this.feeConfigs
  }

  static fromJSON(json: FeeConfig): FeeConfiguration {
    const config = new FeeConfiguration()
    config.feeConfigs = [json]
    config.isInitialized = true
    return config
  }
}

export default FeeConfiguration
