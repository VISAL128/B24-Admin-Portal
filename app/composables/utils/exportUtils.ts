import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportSettlementToExcel(data: any[]) {
  const exportData = data.map(item => ({
    'Settlement ID': item.settlementId,
    'Date': item.settlementDate,
    'Total Supplier': item.totalSupplier,
    'Total Amount': item.totalAmount,
    'Settled By': item.settledBy,
    'Status': item.status
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Settlement History')

  XLSX.writeFile(workbook, 'settlement-history.xlsx')
}

export function exportSettlementToPDF(data: any[]) {
  const doc = new jsPDF()
  const headers = [['Settlement ID', 'Date', 'Total Supplier', 'Total Amount', 'Settled By', 'Status']]
  const rows = data.map(item => [
    item.settlementId,
    new Date(item.settlementDate).toLocaleDateString(),
    item.totalSupplier,
    `$${item.totalAmount}`,
    item.settledBy,
    item.status
  ])

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
    theme: 'striped'
  })

  doc.save('settlement-history.pdf')
}
