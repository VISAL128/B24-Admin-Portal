export default defineEventHandler(async () => {
  return {
    code: 'SUCCESS',
    message: 'success',
    data: [
      { supplierId: 'SUP-001', name: 'Supplier A' },
      { supplierId: 'SUP-002', name: 'Supplier B' }
    ]
  }
})