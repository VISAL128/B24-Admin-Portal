/**
 * Notification composable for displaying toast messages
 * Uses Nuxt UI's toast system with Bill24 brand colors
 */

interface NotificationOptions {
  title: string
  description?: string
  duration?: number
  icon?: string
}

export const useNotification = () => {
  const toast = useToast()
  const { t } = useI18n()

  const showSuccess = (options: NotificationOptions) => {
    toast.add({
      title: options.title,
      description: options.description,
      color: 'success' as const,
      icon: options.icon || 'heroicons:check-circle',
    })
  }

  const showError = (options: NotificationOptions) => {
    toast.add({
      title: options.title,
      description: options.description,
      color: 'error' as const,
      icon: options.icon || 'heroicons:x-circle',
    })
  }

  const showWarning = (options: NotificationOptions) => {
    toast.add({
      title: options.title,
      description: options.description,
      color: 'warning' as const,
      icon: options.icon || 'heroicons:exclamation-triangle',
    })
  }

  const showInfo = (options: NotificationOptions) => {
    toast.add({
      title: options.title,
      description: options.description,
      color: 'info' as const,
      icon: options.icon || 'heroicons:information-circle',
    })
  }

  // Server error helpers with predefined messages
  const showServerError = (statusCode?: number, customMessage?: string) => {
    let title = t('error.server_error', 'Server Error')
    let description = customMessage || t('error.internal_server_error', 'An internal server error occurred. Please try again later.')

    if (statusCode) {
      switch (statusCode) {
        case 500:
          title = t('error.internal_server_error_title', 'Internal Server Error')
          description = customMessage || t('error.internal_server_error_desc', 'The server encountered an error and could not complete your request.')
          break
        case 502:
          title = t('error.bad_gateway', 'Bad Gateway')
          description = customMessage || t('error.bad_gateway_desc', 'The server received an invalid response from an upstream server.')
          break
        case 503:
          title = t('error.service_unavailable', 'Service Unavailable')
          description = customMessage || t('error.service_unavailable_desc', 'The service is temporarily unavailable. Please try again later.')
          break
        case 504:
          title = t('error.gateway_timeout', 'Gateway Timeout')
          description = customMessage || t('error.gateway_timeout_desc', 'The server took too long to respond.')
          break
        default:
          title = t('error.server_error_code', `Server Error (${statusCode})`)
      }
    }

    showError({
      title,
      description,
      duration: 8000,
    })
  }

  const showNetworkError = () => {
    showError({
      title: t('error.network_error', 'Network Error'),
      description: t('error.network_error_desc', 'Unable to connect to the server. Please check your internet connection.'),
      duration: 7000,
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showServerError,
    showNetworkError,
  }
}
