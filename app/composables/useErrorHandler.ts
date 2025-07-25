/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Error handler composable for processing API errors and showing notifications
 * Handles both client-side and server-side errors with appropriate toast messages
 */

interface ErrorData {
  showNotification?: boolean
  notificationType?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  description?: string
  statusCode?: number
}

export const useErrorHandler = () => {
  const notification = useNotification()
  const { t } = useI18n()

  const handleApiError = (error: any) => {
    // Check if error has notification data from server
    if (error?.data?.showNotification) {
      const errorData: ErrorData = error.data

      switch (errorData.notificationType) {
        case 'error':
          notification.showError({
            title: errorData.title || t('error.server_error'),
            description: errorData.description || t('error.internal_server_error'),
          })
          break
        case 'warning':
          notification.showWarning({
            title: errorData.title || t('error.server_error'),
            description: errorData.description || t('error.internal_server_error'),
          })
          break
        case 'info':
          notification.showInfo({
            title: errorData.title || t('error.server_error'),
            description: errorData.description || t('error.internal_server_error'),
          })
          break
        default:
          notification.showError({
            title: errorData.title || t('error.server_error'),
            description: errorData.description || t('error.internal_server_error'),
          })
      }
      return
    }

    // Handle different types of errors
    if (error?.statusCode) {
      notification.showServerError(error.statusCode, error.statusMessage)
      return
    }

    // Handle fetch errors
    if (error?.name === 'FetchError' || error?.message?.includes('fetch')) {
      notification.showNetworkError()
      return
    }

    // Handle generic errors
    if (error?.message) {
      notification.showError({
        title: t('error.server_error'),
        description: error.message
      })
      return
    }

    // Fallback error
    notification.showError({
      title: t('error.server_error'),
      description: t('error.internal_server_error'),
    })
  }

  const handleNetworkError = () => {
    notification.showNetworkError()
  }

  const handleValidationError = (message: string) => {
    notification.showWarning({
      title: t('validation_error', 'Validation Error'),
      description: message,
    })
  }

  const handleSuccessResponse = (message?: string) => {
    notification.showSuccess({
      title: t('success', 'Success'),
      description: message || t('operation_completed', 'Operation completed successfully'),
    })
  }

  return {
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleSuccessResponse,
  }
}
