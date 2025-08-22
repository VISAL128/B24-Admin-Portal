/**
 * Composable for handling transaction type icons and styling
 * Provides consistent icons, colors, and styles for different transaction types
 */

import { TranTypeGroup, TransactionType } from '~/utils/enumModel'

export const useTransactionTypeIcon = () => {
  const getTransactionTypeIcon = (transactionType: string): string => {
    switch (transactionType.toLowerCase()) {
      case 'top-up':
      case 'topup':
      case 'top up':
      case 'wallet topup':
      case 'wallet top-up':
      case 'wallet top up':
        return 'i-heroicons-arrow-down-circle-solid' // Incoming money - solid
      case 'settlement':
      case 'wallet payment':
      case 'payment':
        return 'i-heroicons-arrow-up-circle-solid' // Outgoing money - solid
      case 'transfer':
      case 'bank transfer':
        return 'i-heroicons-arrow-right-circle-solid' // Transfer - solid
      case 'refund':
        return 'i-heroicons-arrow-uturn-left-solid' // Refund/Return - solid
      case 'qr pay':
      case 'qr payment':
      case 'qr':
        return 'i-heroicons-qr-code-solid' // QR Code - solid
      case 'deeplink':
      case 'checkout':
      case 'deeplink / checkout':
        return 'i-heroicons-link-solid' // Link/Web - solid
      case 'subscription':
        return 'i-heroicons-calendar-days-solid' // Recurring - solid (updated from calendar-date-range)
      default:
        return 'i-heroicons-banknotes-solid' // Default money icon - solid
    }
  }

  const getTransactionTypeIconStyle = (transactionType: string): string => {
    switch (transactionType.toLowerCase()) {
      case 'top-up':
      case 'topup':
      case 'top up':
      case 'wallet topup':
      case 'wallet top-up':
      case 'wallet top up':
        return 'bg-green-100 dark:bg-green-900/30' // Green for incoming
      case 'settlement':
      case 'wallet payment':
      case 'payment':
        return 'bg-blue-100 dark:bg-blue-900/30' // Blue for payments
      case 'transfer':
      case 'bank transfer':
        return 'bg-orange-100 dark:bg-orange-900/30' // Orange for transfers
      case 'refund':
        return 'bg-red-100 dark:bg-red-900/30' // Red for refunds
      case 'qr pay':
      case 'qr payment':
      case 'qr':
        return 'bg-purple-100 dark:bg-purple-900/30' // Purple for QR
      case 'deeplink':
      case 'checkout':
      case 'deeplink / checkout':
        return 'bg-indigo-100 dark:bg-indigo-900/30' // Indigo for web
      case 'subscription':
        return 'bg-teal-100 dark:bg-teal-900/30' // Teal for subscriptions
      default:
        return 'bg-gray-100 dark:bg-gray-700' // Gray for unknown
    }
  }

  const getTransactionTypeIconColor = (transactionType: string): string => {
    switch (transactionType.toLowerCase()) {
      case 'top-up':
      case 'topup':
      case 'top up':
      case 'wallet topup':
      case 'wallet top-up':
      case 'wallet top up':
        return 'text-green-600 dark:text-green-400'
      case 'settlement':
      case 'wallet payment':
      case 'payment':
        return 'text-blue-600 dark:text-blue-400'
      case 'transfer':
      case 'bank transfer':
        return 'text-orange-600 dark:text-orange-400'
      case 'refund':
        return 'text-red-600 dark:text-red-400'
      case 'qr pay':
      case 'qr payment':
      case 'qr':
        return 'text-purple-600 dark:text-purple-400'
      case 'deeplink':
      case 'checkout':
      case 'deeplink / checkout':
        return 'text-indigo-600 dark:text-indigo-400'
      case 'subscription':
        return 'text-teal-600 dark:text-teal-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  /**
   * Get a semantic description of the transaction type for accessibility
   */
  const getTransactionTypeDescription = (transactionType: string): string => {
    switch (transactionType.toLowerCase()) {
      case 'top-up':
      case 'topup':
      case 'top up':
      case 'wallet topup':
      case 'wallet top-up':
      case 'wallet top up':
        return 'Incoming transaction - Money added to wallet'
      case 'settlement':
      case 'wallet payment':
      case 'payment':
        return 'Outgoing transaction - Payment made from wallet'
      case 'transfer':
      case 'bank transfer':
        return 'Transfer transaction - Money moved between accounts'
      case 'refund':
        return 'Refund transaction - Money returned'
      case 'qr pay':
      case 'qr payment':
      case 'qr':
        return 'QR Payment - Payment made via QR code'
      case 'deeplink':
      case 'checkout':
      case 'deeplink / checkout':
        return 'Online payment - Payment made via web checkout'
      case 'subscription':
        return 'Subscription payment - Recurring payment'
      default:
        return 'Transaction'
    }
  }

  /**
   * Get icon for TranTypeGroup
   */
  const getTranTypeGroupIcon = (group: TranTypeGroup): string => {
    switch (group) {
      case TranTypeGroup.PayBill:
        return 'i-heroicons-banknotes-solid'
      case TranTypeGroup.DeeplinkCheckout:
        return 'i-heroicons-link-solid'
      case TranTypeGroup.Qr:
        return 'i-heroicons-qr-code-solid'
      case TranTypeGroup.DirectDebit:
        return 'i-heroicons-arrow-right-circle-solid'
      case TranTypeGroup.WalletTopup:
        return 'i-heroicons-arrow-down-circle-solid'
      case TranTypeGroup.WalletPayment:
        return 'i-heroicons-arrow-up-circle-solid'
      default:
        return 'i-heroicons-banknotes-solid'
    }
  }

  /**
   * Get background style for TranTypeGroup
   */
  const getTranTypeGroupIconStyle = (group: TranTypeGroup): string => {
    switch (group) {
      case TranTypeGroup.PayBill:
        return 'bg-blue-100 dark:bg-blue-900/30'
      case TranTypeGroup.DeeplinkCheckout:
        return 'bg-indigo-100 dark:bg-indigo-900/30'
      case TranTypeGroup.Qr:
        return 'bg-purple-100 dark:bg-purple-900/30'
      case TranTypeGroup.DirectDebit:
        return 'bg-orange-100 dark:bg-orange-900/30'
      case TranTypeGroup.WalletTopup:
        return 'bg-green-100 dark:bg-green-900/30'
      case TranTypeGroup.WalletPayment:
        return 'bg-red-100 dark:bg-red-900/30'
      default:
        return 'bg-gray-100 dark:bg-gray-700'
    }
  }

  /**
   * Get icon color for TranTypeGroup
   */
  const getTranTypeGroupIconColor = (group: TranTypeGroup): string => {
    switch (group) {
      case TranTypeGroup.PayBill:
        return 'text-blue-600 dark:text-blue-400'
      case TranTypeGroup.DeeplinkCheckout:
        return 'text-indigo-600 dark:text-indigo-400'
      case TranTypeGroup.Qr:
        return 'text-purple-600 dark:text-purple-400'
      case TranTypeGroup.DirectDebit:
        return 'text-orange-600 dark:text-orange-400'
      case TranTypeGroup.WalletTopup:
        return 'text-green-600 dark:text-green-400'
      case TranTypeGroup.WalletPayment:
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }


  const transTypeGroups: Record<TranTypeGroup, TransactionType[]> = {
    [TranTypeGroup.PayBill]: [
      TransactionType.PayBill,
      TransactionType.Deposit,  
      TransactionType.Proxy,
    ],
    [TranTypeGroup.DeeplinkCheckout]: [
      TransactionType.Deeplink,
      TransactionType.Checkout,
    ],
    [TranTypeGroup.Qr]: [
      TransactionType.Qr,
    ],
    [TranTypeGroup.DirectDebit]: [
      TransactionType.DirectDebit,
    ],
    [TranTypeGroup.WalletTopup]: [
      TransactionType.WalletTopup,
    ],
    [TranTypeGroup.WalletPayment]: [
      TransactionType.WalletPayment,
    ],
  }
  
  // 1) Get transaction types by group
  const tranTypesByGroup = (group: TranTypeGroup): TransactionType[] => {
    return transTypeGroups[group] ?? [];
  };
  
  // 2) Cache & lookup group by transaction type
  const _savedTranGroup = new Map<TransactionType, TranTypeGroup>();
  
  const groupByTranType = (
    type?: TransactionType | null
  ): TranTypeGroup | null => {
    if (!type) return null;
  
    const cached = _savedTranGroup.get(type);
    if (cached) return cached;
  
    for (const [group, types] of Object.entries(transTypeGroups)) {
      const groupKey = Number(group) as TranTypeGroup;
      if (types.includes(type)) {
        _savedTranGroup.set(type, groupKey);
        return groupKey;
      }
    }
    return null;
  };

  // --- Text only label (no icon)
  const getTransactionTypeGroupDisplayText = (transactionType: string | TransactionType): string => {
    const group = groupByTranType(transactionType as TransactionType)
    if (group !== null) {
      const groupName = TranTypeGroup[group]
      if (groupName) {
        if (groupName === 'DeeplinkCheckout') return 'Deeplink/Checkout'
        return groupName.replace(/([A-Z])/g, ' $1').trim()
      }
    }
    return (transactionType as string) || '-'
  }

  
  return {
    getTransactionTypeIcon,
    getTransactionTypeIconStyle,
    getTransactionTypeIconColor,
    getTransactionTypeDescription,
    getTranTypeGroupIcon,
    getTranTypeGroupIconStyle,
    getTranTypeGroupIconColor,
    groupByTranType,
    tranTypesByGroup,
    
  }
}
