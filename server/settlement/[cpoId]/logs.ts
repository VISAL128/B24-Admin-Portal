export default defineEventHandler(event => {
  const { cpoId } = event.context.params!
  return [
    { transaction_id: 'txn_001', ref_id: 'CSMS0001', total_amount: 100, fee_amount: 5, date: '2025-06-26' },
    { transaction_id: 'txn_002', ref_id: 'CSMS0002', total_amount: 120, fee_amount: 6, date: '2025-06-26' }
  ]
})
