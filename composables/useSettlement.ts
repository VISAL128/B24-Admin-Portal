export const useSettlement = () => {
  const fetchLogs = async (cpoId: string) => {
    return await useFetch(`/api/settlement/${cpoId}/logs`)
  }

  const confirmSettlement = async (cpoId: string, payload: any) => {
    return await $fetch(`/api/settlement/${cpoId}/confirm`, {
      method: 'POST',
      body: payload
    })
  }

  return { fetchLogs, confirmSettlement }
}
