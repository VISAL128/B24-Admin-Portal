export default defineEventHandler(() => {
  return [
    { cpoId: 'cpo_001', cpoName: 'GreenCharge', balance: 1000, cutoff: '2025-06-27T17:00:00', status: 'pending' },
    { cpoId: 'cpo_002', cpoName: 'VoltFleet', balance: 700, cutoff: '2025-06-27T17:00:00', status: 'completed' }
  ]
})
