// export const useSettlementApi = () => {
//   const config = useRuntimeConfig()

//   const baseUrl = config.public.managementApi || 'http://localhost:3005'

//   // 1. Get all settlement history
//   const getSettlementHistory = () =>
//     useFetch(`${baseUrl}/api/settlement/history`, {
//       method: 'GET',
//       onResponseError({ response }) {
//         console.error('Error fetching settlement history:', response.status, response._data)
//       }
//     })

//   // 2. Get all settlement CPOs
//   const getAllSettlementCpo = (supplierIds: string[]) =>
//     useFetch(`${baseUrl}/api/settlement/getallsettlementcpo`, {
//       method: 'POST',
//       body: { supplierIds },
//       onResponseError({ response }) {
//         console.error('Error fetching all settlement CPOs:', response.status, response._data)
//       }
//     })

//   return { getSettlementHistory, getAllSettlementCpo }
// }

export const useSettlementApi = () => {
  const baseUrl = '' //config.public.managementApi || 'http://localhost:3005'

  // 1. Get settlement history with pagination
  const getSettlementHistory = (page = 1, limit = 10) =>
    useFetch(`${baseUrl}/api/management/settlement-history`, {
      method: 'GET',
      query: { page, limit },
      onResponseError({ response }) {
        console.error('Error fetching settlement history:', response.status, response._data)
      },
    })

  // 2. Get settlement CPOs by supplier IDs
  const getSettlementCpoBySupplierIds = (supplierIds: string[]) =>
    useFetch(`${baseUrl}/api/management/getcpo`, {
      method: 'POST',
      body: { supplierIds },
      onResponseError({ response }) {
        console.error('Error fetching settlement CPOs:', response.status, response._data)
      },
    })

  return { getSettlementHistory, getSettlementCpoBySupplierIds }
}
