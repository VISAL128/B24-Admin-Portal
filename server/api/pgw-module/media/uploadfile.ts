import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'
export default defineEventHandler(async (event) => {
  try {
    const fullEndpoint = `/media/uploadfile`
    const response = await requestToPgwModuleApi(event, fullEndpoint, 'POST')

    return response
  } catch (error) {
    console.error('Error uploading file:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file',
    })
  }
})
