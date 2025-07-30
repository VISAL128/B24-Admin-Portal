import type { ApiResponse } from '~/models/baseModel'
import type { FeeModel, FeeModelRequest, SharingSupplier } from '~/models/settlement'
import { useApiExecutor } from './useApiExecutor'

export const useFeeConfigApi = () => {
  const { execute,executeV2 } = useApiExecutor()
  // 1. Get settlement history with pagination
  // const getListFeeConfig = (search: string) =>
  //   useFetch(`${baseUrl}/api/get-fee-config`, {
  //     method: 'POST',
  //     body: { search },
  //     onResponseError({ response }) {
  //       console.error('Error fetching settlement history:', response.status, response._data)
  //     },
  //   })

  // // 2. Get settlement CPOs by supplier IDs
  // const addFeeConfig = (supplierIds: string[]) =>
  //   useFetch(`${baseUrl}/api/getcpo`, {
  //     method: 'POST',
  //     body: { supplierIds },
  //     onResponseError({ response }) {
  //       console.error('Error fetching settlement CPOs:', response.status, response._data)
  //     },
  //   })

  const createFeeConfig = async (payload: FeeModelRequest): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponse<FeeModel>>(`/api/fee/create-fee-config`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      // console.error('Failed to fetch fee config:', rep.message)
      return null as any
    }
    return rep.data as FeeModel
  }
  const updateFeeConfig = async (payload: FeeModelRequest): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponse<FeeModel>>(`/api/fee/update-fee-config`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch fee config:', rep.message)
      return null as any
    }
    return rep.data as FeeModel
  }

  const getListFeeConfig = async (payload: { search: string }): Promise<FeeModel[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponse<FeeModel[]>>(`/api/fee/get-fee-config`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch fee config:', rep.message)
      return [] as FeeModel[]
    }
    return rep.data as FeeModel[]
  }

  const findFeeConfigById = async (payload: { id: string }): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponse<FeeModel>>(`/api/fee/find-fee-config`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch fee config by ID:', rep.message)
      return null as any
    }
    return rep.data
  }

  const getAllSharingSupplier = async (): Promise<SharingSupplier[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponse<SharingSupplier[]>>(`/api/fee/get_sharing_supplier`, { method: 'GET' })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch sharing supplier:', rep.message)
      return null as any
    }
    return rep.data as SharingSupplier[]
  }

  return {
    getListFeeConfig,
    findFeeConfigById,
    createFeeConfig,
    updateFeeConfig,
    getAllSharingSupplier,
  }
}
