import { StatusBadgeV2 } from '#components'
import { h } from 'vue'
import { TransactionStatus } from '~/utils/enumModel'

/**
 * Composable for working with status badges and settlement status
 */
export const useStatusBadge = () => {

  /**
   * Get the translation key for a settlement status
   */
  const getSettlementStatusTranslationKey = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status.completed'
      case 'pending':
        return 'status.pending'
      case 'failed':
        return 'status.failed'
      default:
        return 'status.pending'
    }
  }

  /**
   * Get the translation key for a transaction status
   */
  const getTransactionStatusTranslationKey = (status: string): string => {
    switch (status.toLowerCase()) {
      case TransactionStatus.Success.toLowerCase():
        return 'status.success'
      case TransactionStatus.Pending.toLowerCase():
        return 'status.pending'
      case TransactionStatus.Failed.toLowerCase():
        return 'status.failed'
      case TransactionStatus.Error.toLowerCase():
        return 'status.error'
      case TransactionStatus.Cancel.toLowerCase():
        return 'status.cancel'
      case TransactionStatus.Expire.toLowerCase():
        return 'status.expire'
      case TransactionStatus.Reversed.toLowerCase():
        return 'status.reversed'
      default:
        return 'status.pending'
    }
  }

  /**
   * Get an icon name for a settlement status (for use with icon libraries)
   */
  const getSettlementStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle'
      case 'pending':
        return 'clock'
      case 'failed':
        return 'x-circle'
      default:
        return 'help-circle'
    }
  }

  /**
   * Get an icon name for a transaction status (for use with icon libraries)
   */
  const getTransactionStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case TransactionStatus.Success.toLowerCase():
        return 'check-circle'
      case TransactionStatus.Pending.toLowerCase():
        return 'clock'
      case TransactionStatus.Failed.toLowerCase():
      case TransactionStatus.Error.toLowerCase():
        return 'x-circle'
      case TransactionStatus.Cancel.toLowerCase():
        return 'ban'
      case TransactionStatus.Expire.toLowerCase():
        return 'clock-x'
      case TransactionStatus.Reversed.toLowerCase():
        return 'rotate-ccw'
      default:
        return 'help-circle'
    }
  }

  /**
   * Format settlement status for display
   */
  const formatSettlementStatus = (status: string, useTranslation: boolean = true): string => {
    if (!useTranslation) {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const { t } = useI18n()
    return t(getSettlementStatusTranslationKey(status))
  }

  /**
   * Format transaction status for display
   */
  const formatTransactionStatus = (status: string, useTranslation: boolean = true): string => {
    if (!useTranslation) {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const { t } = useI18n()
    return t(getTransactionStatusTranslationKey(status))
  }

  const statusCellBuilder = (status: string, useTranslation: boolean = true) => {

    return h(StatusBadgeV2, {
      status,
      variant: 'subtle',
      size: 'md',
      useTranslation
    })
  }

  const transactionStatusCellBuilder = (status: string, useTranslation: boolean = true) => {

    return h(StatusBadgeV2, {
      status,
      variant: 'subtle',
      size: 'md',
      useTranslation
    })
  }

  return {
    getSettlementStatusTranslationKey,
    getTransactionStatusTranslationKey,
    getSettlementStatusIcon,
    getTransactionStatusIcon,
    formatSettlementStatus,
    formatTransactionStatus,
    statusCellBuilder,
    transactionStatusCellBuilder
  }
}
