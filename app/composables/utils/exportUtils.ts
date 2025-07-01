import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// import ExcelJS from 'exceljs'

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

interface ExportHeader {
  key: string;
  label: string;
}

export async function exportToExcel(
  data: any[],
  headers: ExportHeader[],
  filename = 'export.xlsx'
) {
  const XLSX = await import('xlsx')
  const exportData = data.map((item: any) => {
    const row: Record<string, any> = {}
    headers.forEach(({ key, label }: ExportHeader) => {
      row[label] = item[key]
    })
    return row
  })
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}

export async function exportToPDF(
  data: any[],
  headers: ExportHeader[],
  filename = 'export.pdf'
) {
  const jsPDF = (await import('jspdf')).default
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  const head = [headers.map((h: ExportHeader) => h.label)]
  const rows = data.map((item: any) => headers.map((h: ExportHeader) => item[h.key]))
  autoTable(doc, {
    head,
    body: rows,
    startY: 20,
    theme: 'striped'
  })
  doc.save(filename)
}

export async function exportToExcelStyled(
  data: any[],
  headers: { key: string, label: string }[],
  filename = 'export.xlsx',
  title = 'Settlement History',
  subtitle = ''
) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add title row
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add subtitle row if provided
  let headerRowIndex = 2;
  if (subtitle) {
    worksheet.mergeCells(2, 1, 2, headers.length);
    const subtitleCell = worksheet.getCell(2, 1);
    subtitleCell.value = subtitle;
    subtitleCell.font = { size: 12, italic: true };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRowIndex = 3;
  }

  // Add header row
  worksheet.addRow(headers.map(h => h.label));
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEEFF' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  data.forEach(item => {
    worksheet.addRow(headers.map(h => item[h.key]));
  });

  // Auto width
  worksheet.columns.forEach(column => {
    if (!column) return;
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, cell => {
      maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
    });
    column.width = maxLength + 2;
  });

  // Freeze header
  worksheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];

  // Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
