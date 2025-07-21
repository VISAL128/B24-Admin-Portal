import { StatusBadgeV2 } from '#components'
import { h } from 'vue'

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
   * Format settlement status for display
   */
  const formatSettlementStatus = (status: string, useTranslation: boolean = true): string => {
    if (!useTranslation) {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const { t } = useI18n()
    return t(getSettlementStatusTranslationKey(status))
  }

  const statusCellBuilder = (status: string, useTranslation: boolean = true) => {

    return h(StatusBadgeV2, {
      status,
      variant: 'subtle',
      size: 'md',
      useTranslation
    })
  }

  return {
    getSettlementStatusTranslationKey,
    getSettlementStatusIcon,
    formatSettlementStatus,
    statusCellBuilder
  }
}
