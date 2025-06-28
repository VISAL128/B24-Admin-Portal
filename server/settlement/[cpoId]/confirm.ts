export default defineEventHandler(async event => {
  const { cpoId } = event.context.params!
  const body = await readBody(event)

  // Normally trigger a bank API here
  return {
    status: 'success',
    settledBy: body.staffId,
    amount: body.amount,
    settledAt: new Date().toISOString()
  }
})
