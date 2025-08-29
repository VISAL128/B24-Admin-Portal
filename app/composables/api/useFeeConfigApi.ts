/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponseList } from '~/models/baseModel'
import type { FeeModel, SharingSupplier } from '~/models/settlement'
import { useApiExecutor } from './useApiExecutor'
import type { FeeConfig } from '~/models/feeConfiguration'
const toast = useToast()

export const useFeeConfigApi = () => {
  const { executeV2 } = useApiExecutor()
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

  const createFeeConfig = async (payload: FeeModel): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeModel>>(`/api/fee/create-fee-config`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to create fee config: ${rep.message}`,
        color: 'error',
      })
      return null as any
    }
    return rep.data as FeeModel
  }

  const updateFeeConfig = async (payload: FeeModel): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeModel>>(`/api/fee/update-fee-config`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to update fee config: ${rep.message}`,
        color: 'error',
      })
      return null as any
    }
    return rep.data as FeeModel
  }

  const getListFeeConfig = async (payload: { search: string }): Promise<FeeModel[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeModel[]>>(`/api/fee/get-fee-configv2`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to fetch fee config: ${rep.message}`,
        color: 'error',
      })
      return [] as FeeModel[]
    }
    return rep.data as FeeModel[]
  }

  const findFeeConfigById = async (payload: { id: string }): Promise<FeeModel> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeModel>>(`/api/fee/find-fee-config`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to fetch fee config by ID: ${rep.message}`,
        color: 'error',
      })
      return null as any
    }
    return rep.data
  }

  // New API Fee Config
  const getSupplierFeeConfig = async (payload: { search: string }): Promise<FeeConfig[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeConfig[]>>(`/api/fee/get-fee-config`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to fetch supplier fee config: ${rep.message}`,
        color: 'error',
      })
      return [] as FeeConfig[]
    }
    return rep.data as FeeConfig[]
  }

  const saveSupplierFeeConfig = async (payload: FeeConfig[]): Promise<FeeConfig[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<FeeConfig[]>>(`/api/fee/update-fee-config`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to save supplier fee config: ${rep.message}`,
        color: 'error',
      })
      return [] as FeeConfig[]
    }
    return rep.data as FeeConfig[]
  }

  const getAllSharingSupplier = async (): Promise<SharingSupplier[]> => {
    const rep = await executeV2(() =>
      $fetch<ApiResponseList<SharingSupplier[]>>(`/api/fee/get_sharing_supplier`, { method: 'GET' })
    )
    if (rep.code !== 'SUCCESS') {
      toast.add({
        title: 'Error',
        description: `Failed to fetch sharing suppliers: ${rep.message}`,
        color: 'error',
      })
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
    saveSupplierFeeConfig,
    getSupplierFeeConfig,
  }
}
