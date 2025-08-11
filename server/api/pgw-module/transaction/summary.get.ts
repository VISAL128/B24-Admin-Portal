import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    // Pass-through supported query params (FromDate, ToDate, PeriodType)
    const query = getQuery(event) as Record<string, string | number | undefined>
    const urlParams = new URLSearchParams()

    // Only append known params to avoid noise
    if (query.FromDate) urlParams.append('FromDate', String(query.FromDate))
    if (query.ToDate) urlParams.append('ToDate', String(query.ToDate))
    if (query.PeriodType !== undefined) urlParams.append('PeriodType', String(query.PeriodType))

    const qs = urlParams.toString()
    const endpoint = `/transaction/summary${qs ? `?${qs}` : ''}`

    const response = await requestToPgwModuleApi(
      event,
      endpoint,
      'GET'
    )
    return response
  } catch (error: any) {
    console.error('❌ Error fetching transaction summary:', error)

    const statusCode = error?.statusCode || 500
    const apiMessage = error?.statusMessage || error?.message || 'Unknown error occurred'

    throw createError({
      statusCode,
      statusMessage: apiMessage,
      data: {
        showNotification: true,
        notificationType: 'error',
        title: 'Transaction Summary Error',
        description: apiMessage,
      },
    })
  }
})
