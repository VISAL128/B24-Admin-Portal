import * as XLSX from 'xlsx'
import { getPDFTitles, getPeriodText, getCompanyText, getCurrencyText, getTotalText, getFooterText, getPageText } from './pdfFonts'
// Dynamic imports for jsPDF to avoid SSR issues
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
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

export async function exportSettlementToPDF(data: any[]) {
  const jsPDF = (await import('jspdf')).default
  const autoTable = (await import('jspdf-autotable')).default
  
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
  data: Record<string, unknown>[],
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

// export async function exportToPDF(
//   data: any[],
//   headers: ExportHeader[],
//   filename = 'export.pdf'
// ) {
//   const jsPDF = (await import('jspdf')).default
//   const autoTable = (await import('jspdf-autotable')).default
//   const doc = new jsPDF()
//   const head = [headers.map((h: ExportHeader) => h.label)]
//   const rows = data.map((item: any) => headers.map((h: ExportHeader) => item[h.key]))
//   autoTable(doc, {
//     head,
//     body: rows,
//     startY: 20,
//     theme: 'striped'
//   })
//   doc.save(filename)
// }

// export async function exportToExcelStyled(
//   data: any[],
//   headers: { key: string, label: string }[],
//   filename = 'export.xlsx',
//   title = 'Settlement History',
//   subtitle = ''
// ) {
//   const ExcelJS = (await import('exceljs')).default;
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Sheet1');

//   // Add title row
//   worksheet.mergeCells(1, 1, 1, headers.length);
//   const titleCell = worksheet.getCell(1, 1);
//   titleCell.value = title;
//   titleCell.font = { size: 16, bold: true };
//   titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

//   // Add subtitle row if provided
//   let headerRowIndex = 2;
//   if (subtitle) {
//     worksheet.mergeCells(2, 1, 2, headers.length);
//     const subtitleCell = worksheet.getCell(2, 1);
//     subtitleCell.value = subtitle;
//     subtitleCell.font = { size: 12, italic: true };
//     subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
//     headerRowIndex = 3;
//   }

//   // Add header row
//   worksheet.addRow(headers.map(h => h.label));
//   const headerRow = worksheet.getRow(headerRowIndex);
//   headerRow.font = { bold: true };
//   headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
//   headerRow.eachCell(cell => {
//     cell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFDDEEFF' }
//     };
//     cell.border = {
//       top: { style: 'thin' },
//       left: { style: 'thin' },
//       bottom: { style: 'thin' },
//       right: { style: 'thin' }
//     };
//   });

//   // Add data rows
//   data.forEach(item => {
//     worksheet.addRow(headers.map(h => item[h.key]));
//   });

//   // Auto width
//   worksheet.columns.forEach(column => {
//     if (!column) return;
//     let maxLength = 10;
//     column.eachCell?.({ includeEmpty: true }, cell => {
//       maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
//     });
//     column.width = maxLength + 2;
//   });
  

//   // Freeze header
//   worksheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];

//   // Save
//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(blob);
//   link.download = filename;
//   link.click();
// }



export async function exportToExcelStyled(
  data: Record<string, unknown>[],
  headers: { key: string, label: string }[],
  filename = 'export.xlsx',
  title = 'Settlement History',
  subtitle = '',
  options: {
    locale?: 'km' | 'en';
    t?: (key: string, ...args: any[]) => string;
    currency?: string;
    totalAmount?: number;
    period?: string;
  } = {}
) {

    console.log('Optimizing column width for:');

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

    // Add total row if provided with proper formatting
    if (options.totalAmount !== undefined && options.t) {
      // Add empty row for spacing
      worksheet.addRow([]);
      
      // Create a properly formatted total section
      const totalLabel = options.t('pdf_export.total');
      const totalValue = `${options.totalAmount.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US')} ${options.currency || ''}`;
      
      // Add total row spanning multiple columns for better layout
      const totalRowData = new Array(headers.length).fill('');
      totalRowData[headers.length - 2] = totalLabel; // Second to last column
      totalRowData[headers.length - 1] = totalValue; // Last column
      
      const totalRow = worksheet.addRow(totalRowData);
      
      // Style the total row
      totalRow.font = { 
        bold: true,
        size: 12,
        name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
      };
      totalRow.alignment = { horizontal: 'right', vertical: 'middle' };
      
      // Add background color and borders to make it stand out
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber >= headers.length - 1) { // Last two columns
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F3FF' } // Light blue background
          };
          cell.border = {
            top: { style: 'medium', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'medium', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
      });
      
      // Make the total value cell right-aligned and bold
      const totalValueCell = totalRow.getCell(headers.length);
      totalValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totalValueCell.font = { 
        bold: true,
        size: 12,
        color: { argb: 'FF0066CC' }, // Blue color for emphasis
        name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
      };
    }

    // Set reasonable column widths - compact and globally applicable
    worksheet.columns.forEach(column => {
      if (!column) return;
      
      let maxLength = 8; // Reduced minimum width
      let calculatedWidth = 12; // Reduced default width
      
      // Calculate width based on actual content
      column.eachCell?.({ includeEmpty: true }, cell => {
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          maxLength = Math.max(maxLength, cellLength);
        }
      });
      
      // Apply intelligent width limits based on content length
      if (maxLength <= 10) {
        calculatedWidth = Math.min(maxLength + 2, 12); // Short content
      } else if (maxLength <= 20) {
        calculatedWidth = Math.min(maxLength + 2, 18); // Medium content
      } else if (maxLength <= 30) {
        calculatedWidth = Math.min(maxLength + 2, 25); // Long content
      } else {
        calculatedWidth = Math.min(maxLength + 2, 30); // Very long content
      }
      
      // Ensure minimum readability but keep compact
      column.width = Math.max(calculatedWidth, 10);
    });

    // Adjust row height
    worksheet.eachRow((row, rowIndex) => {
      row.height = 20;  // Set a default row height to reduce space
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


export async function exportToPDFStyled(
  data: Record<string, unknown>[],
  headers: ExportHeader[],
  filename: string,
  title: string,
  subtitle: string,
  period = '',
  options: {
    company?: string;
    currency?: string;
    totalAmount?: number;
    locale?: 'km' | 'en';
    t?: (key: string, ...args: unknown[]) => string; // Translation function
  } = {}
) {
  // Use dynamic imports to avoid SSR issues
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Set font based on locale - for Khmer support
  if (options.locale === 'km') {
    // For Khmer text, we need to add a Unicode font
    // Since jsPDF doesn't support Khmer fonts by default, we'll fall back to a strategy
    // that works better with Unicode characters
    try {
      // Try to use a font that supports more Unicode characters
      doc.setFont('helvetica', 'normal');
      // Note: This is a limitation of jsPDF - it doesn't natively support Khmer fonts
      // For proper Khmer support, you would need to:
      // 1. Add a custom Khmer font (like Noto Sans Khmer) to jsPDF
      // 2. Or use an alternative PDF library that supports Unicode better
    } catch (error) {
      console.warn('Could not set Khmer font, falling back to helvetica');
      doc.setFont('helvetica');
    }
  } else {
    doc.setFont('helvetica');
  }
  
  let yPosition = 20;
  
  // Get dynamic titles if translation function is available
  const displayTitle = options.t ? options.t('pdf_export.settlement_report') : title;
  const displaySubtitle = options.t ? options.t('pdf_export.direct_debit_settlement_summary') : subtitle;
  
  // Header - Main Title (centered)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleWidth = doc.getTextWidth(displayTitle);
  doc.text(displayTitle, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 10;
  
  // Subtitle (centered)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const subtitleWidth = doc.getTextWidth(displaySubtitle);
  doc.text(displaySubtitle, (pageWidth - subtitleWidth) / 2, yPosition);
  yPosition += 8;
  
  // Period information (centered)
  if (period && options.t) {
    doc.setFontSize(10);
    const periodText = getPeriodText(options.t, period.split(' to ')[0] || period, period.split(' to ')[1] || '');
    const periodWidth = doc.getTextWidth(periodText);
    doc.text(periodText, (pageWidth - periodWidth) / 2, yPosition);
    yPosition += 6;
  }
  
  // Company and Currency info (centered)
  if (options.company && options.t) {
    const companyText = getCompanyText(options.t, options.company);
    const companyWidth = doc.getTextWidth(companyText);
    doc.text(companyText, (pageWidth - companyWidth) / 2, yPosition);
    yPosition += 6;
  }
  
  if (options.currency && options.t) {
    const currencyText = getCurrencyText(options.t, options.currency);
    const currencyWidth = doc.getTextWidth(currencyText);
    doc.text(currencyText, (pageWidth - currencyWidth) / 2, yPosition);
    yPosition += 10;
  }
  
  // Prepare table data with dynamic headers
  const tableHeaders = headers.map(h => h.label);
  const tableData = data.map((item: any) => 
    headers.map((h: ExportHeader) => {
      const value = item[h.key];
      // Format specific fields
      if (h.key.includes('date') && value) {
        return new Date(value).toLocaleDateString(options.locale === 'km' ? 'km-KH' : 'en-US');
      }
      if (h.key.includes('amount') && typeof value === 'number') {
        return value.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US');
      }
      return value?.toString() || '';
    })
  );
  
  // Create table with styling similar to the image
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      // Add font family that supports Unicode better
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [240, 240, 240], // Light gray background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fillColor: [255, 255, 255], // White background
      textColor: [0, 0, 0], // Black text
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248], // Very light gray for alternate rows
    },
    tableLineColor: [0, 0, 0], // Black border lines
    tableLineWidth: 0.1,
    margin: { top: 10, bottom: 20, left: 10, right: 10 },
    didDrawPage: function(data: any) {
      // Add page numbers
      const pageNum = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      const pageText = options.t ? getPageText(options.t, pageNum) : `Page ${pageNum}`;
      doc.text(pageText, pageWidth - 20, pageHeight - 10);
    }
  });
  
  // Add total summary if provided
  if (options.totalAmount !== undefined && options.t) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const totalText = getTotalText(
      options.t,
      options.totalAmount,
      options.currency || '',
      options.locale || 'en'
    );
    
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, pageWidth - totalWidth - 10, finalY);
  }
  
  // Add footer with generation date
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (options.t) {
    const footerText = getFooterText(options.t, options.locale || 'en');
    doc.text(footerText, 10, footerY);
  }
  
  // Save the PDF
  doc.save(filename);
}

/**
 * Enhanced PDF export with better Unicode/Khmer support using HTML rendering
 * This approach renders HTML content with proper fonts to canvas, then converts to PDF
 */
// export async function exportToPDFWithUnicodeSupport(
//   data: Record<string, unknown>[],
//   headers: ExportHeader[],
//   filename = 'settlement-report.pdf',
//   title = 'Settlement Report',
//   subtitle = 'Direct Debit Settlement Summary Report',
//   period = '',
//   options: {
//     company?: string;
//     currency?: string;
//     totalAmount?: number;
//     locale?: 'km' | 'en';
//     t?: (key: string, ...args: unknown[]) => string;
//   } = {}
// ) {
//   try {
//     console.log('test export....')
//     // Dynamic imports for better SSR support
//     const html2canvas = (await import('html2canvas')).default;
    
//     const jsPDF = (await import('jspdf')).default;
    
//     // Get dynamic titles if translation function is available
// const displayTitle = title?.trim() ? title : (options.t ? options.t('pdf_export.settlement_report') : '');
//     const displaySubtitle = options.t ? options.t('pdf_export.direct_debit_settlement_summary') : subtitle;
    
//     // Create a temporary container with proper fonts
//     const container = document.createElement('div');
//     container.style.cssText = `
//       position: absolute;
//       top: -9999px;
//       left: -9999px;
//       width: 210mm;
//       padding: 20px;
//       font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//       background: white;
//       color: black;
//     `;
    
//     // Build HTML content with clean, formal styling
//     let htmlContent = `
//       <div style="
//         text-align: center; 
//         margin-bottom: 30px;
//         padding: 20px;
//         border-bottom: 2px solid #333;
//       ">
//         <h1 style="
//           font-size: 18px; 
//           font-weight: bold; 
//           margin: 0 0 8px 0; 
//           font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//           color: #333;
//         ">${displayTitle}</h1>
//         <h2 style="
//           font-size: 12px; 
//           margin: 0 0 15px 0; 
//           font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//           color: #666;
//           font-weight: normal;
//         ">${displaySubtitle}</h2>
//     `;
    
//     // Add metadata section with clean styling
//     if (period || options.company || options.currency) {
//       htmlContent += `
//         <div style="
//           background: #f8f9fa;
//           border: 1px solid #dee2e6;
//           border-radius: 4px;
//           padding: 10px;
//           margin-top: 10px;
//           text-align: left;
//         ">
//       `;
      
//       if (period && options.t) {
//         const periodText = getPeriodText(options.t, period.split(' to ')[0] || period, period.split(' to ')[1] || '');
//         htmlContent += `
//           <p style="
//             font-size: 11px; 
//             margin: 0 0 5px 0;
//             color: #333;
//             font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//           ">${periodText}</p>
//         `;
//       }
      
//       if (options.company && options.t) {
//         const companyText = getCompanyText(options.t, options.company);
//         htmlContent += `
//           <p style="
//             font-size: 11px; 
//             margin: 0 0 5px 0;
//             color: #333;
//             font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//           ">${companyText}</p>
//         `;
//       }
      
//       if (options.currency && options.t) {
//         const currencyText = getCurrencyText(options.t, options.currency);
//         htmlContent += `
//           <p style="
//             font-size: 11px; 
//             margin: 0;
//             color: #333;
//             font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//           ">${currencyText}</p>
//         `;
//       }
      
//       htmlContent += `</div>`;
//     }
    
//     htmlContent += `</div>`;
    
//     // Create table with improved styling and proper Khmer font support
//     htmlContent += `
//       <table style="
//         width: 100%; 
//         border-collapse: collapse; 
//         font-size: 10px; 
//         font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//         margin: 20px 0;
//         box-shadow: 0 1px 3px rgba(0,0,0,0.1);
//         border: 1px solid #ddd;
//       ">
//         <thead>
//           <tr style="background: #f8f9fa; color: #333; border-bottom: 2px solid #dee2e6;">
//             ${headers.map(h => `
//               <th style="
//                 border: 1px solid #ddd; 
//                 padding: 12px 8px; 
//                 text-align: center; 
//                 font-weight: bold;
//                 font-size: 11px;
//                 font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//                 background: #f8f9fa;
//                 color: #495057;
//               ">${h.label}</th>
//             `).join('')}
//           </tr>
//         </thead>
//         <tbody>
//     `;
    
//     // Add table rows with proper Khmer font support
//     data.forEach((item, index) => {
//       const isEven = index % 2 === 0;
//       const rowStyle = isEven ? 'background-color: #ffffff;' : 'background-color: #f8f9fa;';
      
//       htmlContent += `<tr style="${rowStyle}">`;
      
//       headers.forEach((h, colIndex) => {
//         let value = item[h.key];
//         let cellAlign = 'center';
//         let cellStyle = '';
        
//         // Format specific fields
//         if (h.key.includes('date') && value) {
//           value = new Date(value).toLocaleDateString(options.locale === 'km' ? 'km-KH' : 'en-US');
//           cellStyle = 'color: #666;';
//         }
//         if (h.key.includes('amount') && typeof value === 'number') {
//           value = value.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US');
//           cellAlign = 'right';
//           cellStyle = 'color: #333; font-weight: 600;';
//         }
//         if (h.key.includes('status')) {
//           cellStyle = 'font-weight: 500;';
//         }
        
//         htmlContent += `
//           <td style="
//             border: 1px solid #ddd; 
//             padding: 8px; 
//             text-align: ${cellAlign};
//             font-size: 10px;
//             font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//             color: #333;
//             ${cellStyle}
//           ">${value?.toString() || '-'}</td>
//         `;
//       });
      
//       htmlContent += '</tr>';
//     });
    
//     htmlContent += '</tbody></table>';
    
//     // Add clean total section
//     if (options.totalAmount !== undefined && options.t) {
//       const totalText = getTotalText(
//         options.t,
//         options.totalAmount,
//         options.currency || '',
//         options.locale || 'en'
//       );
      
//       htmlContent += `
//         <div style="
//           margin-top: 20px;
//           padding: 15px;
//           background: #f8f9fa;
//           border: 1px solid #dee2e6;
//           border-radius: 4px;
//         ">
//           <table style="width: 100%; margin: 0;">
//             <tr>
//               <td style="
//                 text-align: right;
//                 font-weight: bold;
//                 font-size: 14px;
//                 color: #333;
//                 padding: 5px;
//                 font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : 'Arial, sans-serif'};
//               ">
//                 ${totalText}
//               </td>
//             </tr>
//           </table>
//         </div>
//       `;
//     }
    
//     // Add clean footer
//     if (options.t) {
//       const footerText = getFooterText(options.t, options.locale || 'en');
//       htmlContent += `
//         <div style="
//           margin-top: 30px; 
//           padding: 15px;
//           border-top: 1px solid #dee2e6;
//         ">
//         </div>
//       `;
//     }
    
//     container.innerHTML = htmlContent;
//     document.body.appendChild(container);
    
//     // Convert to canvas with high quality
//     const canvas = await html2canvas(container, {
//       scale: 2, // Higher resolution
//       useCORS: true,
//       allowTaint: false,
//       backgroundColor: '#ffffff'
//     });
    
//     // Remove temporary container
//     document.body.removeChild(container);
    
//     // Create PDF from canvas
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const imgData = canvas.toDataURL('image/png');
    
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();
//     const imgWidth = pdfWidth - 20; // 10mm margin on each side
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
//     let heightLeft = imgHeight;
//     let position = 10; // 10mm top margin
    
//     // Add image to PDF, handling multiple pages if needed
//     pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//     heightLeft -= pdfHeight;
    
//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight + 10;
//       pdf.addPage();
//       pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//       heightLeft -= pdfHeight;
//     }
    
//     // Save the PDF
//     pdf.save(filename);
    
//   } catch (error) {
//     console.error('Error generating PDF with Unicode support:', error);
//     // Fallback to regular PDF export
//     throw new Error('Failed to generate PDF with Unicode support. Please try again.');
//   }
// }


// ...existing code...
export async function exportToPDFWithUnicodeSupport(
  data: Record<string, unknown>[],
  headers: ExportHeader[],
  filename: string,
  title: string,
  subtitle?: string,
  options: {
    company?: string;
    currency?: string;
    totalAmount?: number;
    locale?: 'km' | 'en';
    t?: (key: string, ...args: unknown[]) => string;
    filter?: Record<string, string>;
  } = {}
) {
  try {

    console.log("-----filter-----", options.filter)

    // 1. Dynamic Orientation & Font Sizing Configuration
    const COLUMN_THRESHOLD_FOR_LANDSCAPE = 7;
    const isLandscape = headers.length > COLUMN_THRESHOLD_FOR_LANDSCAPE;
    const orientation = isLandscape ? 'l' : 'p';
    const containerWidth = isLandscape ? '297mm' : '210mm';
    
    // Adjust font size based on column count for readability
    let tableFontSize = '9px';
    if (headers.length > 8) tableFontSize = '8px';
    if (headers.length > 10) tableFontSize = '7px';

    // Dynamic imports for better SSR support
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Get dynamic titles if translation function is available
    const displayTitle = title;
    const displaySubtitle = subtitle;

    // Khmer-inspired color palette (from Cambodian flag)
    const KHMER_BLUE = '#032ea1';
    const KHMER_RED = '#da251d';
    const KHMER_WHITE = '#ffffff';
    const KHMER_TEXT_DARK = '#2c3e50';
    const KHMER_TEXT_LIGHT = '#555';
    const KHMER_BORDER = '#d1d8e0';
    const KHMER_BG_LIGHT = '#f7f9fc';

    // Create a temporary container with proper fonts
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: ${containerWidth};
      padding: 15mm;
      font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS", "Arial Unicode MS"' : '"Helvetica Neue", Arial, sans-serif'};
      background: ${KHMER_WHITE};
      color: ${KHMER_TEXT_DARK};
    `;

    // Build HTML content with Cambodian-inspired styling
      let htmlContent = `
      <div style="padding: 10px;">
        <div style="
          text-align: center; 
          padding-bottom: 15px;
          border-bottom: 3px double ${KHMER_BLUE};
          margin-bottom: 15px;
        ">
          <h1 style="
            font-size: 22px; 
            font-weight: bold; 
            margin: 0 0 8px 0; 
            font-family: ${options.locale === 'km' ? '"Khmer OS Muol Light", "Noto Sans Khmer"' : '"Times New Roman", serif'};
            color: ${KHMER_BLUE};
          ">${displayTitle}</h1>
          <h2 style="
            font-size: 14px; 
            margin: 0; 
            font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
            color: ${KHMER_TEXT_LIGHT};
            font-weight: normal;
          ">${displaySubtitle}</h2>
        </div>
    `;

    // Add Filter Information
    if (options.filter && Object.keys(options.filter).length > 0 && options.t) {
      const t = options.t;
      
      console.log('Filter data to display:', options.filter);

      // Always show filters section if filters exist, regardless of values
      htmlContent += `
        <div style="
          margin-bottom: 20px;
          padding: 12px 15px;
          background: ${KHMER_BG_LIGHT};
          border: 1px solid ${KHMER_BORDER};
          border-left: 4px solid ${KHMER_BLUE};
          border-radius: 5px;
        ">
          <h3 style="
            margin: 0 0 10px 0;
            font-size: 13px;
            font-weight: bold;
            color: ${KHMER_BLUE};
            font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
          ">${t('filters_applied')}</h3>
          <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
      `;

      // Display all filter values, even if they are "All" or "all_time"
      for (const [key, value] of Object.entries(options.filter)) {
        const displayValue = String(value || 'N/A');
        htmlContent += `
          <tr style="border-bottom: 1px solid ${KHMER_BORDER};">
            <td style="padding: 6px 0; font-weight: 600; color: ${KHMER_TEXT_DARK}; width: 150px;">${key}</td>
            <td style="padding: 6px 0; color: ${KHMER_TEXT_LIGHT};">${displayValue}</td>
          </tr>
        `;
      }

      htmlContent += `
          </table>
        </div>
      `;
    }
    
    // Create table with improved styling and proper Khmer font support
    htmlContent += `
      <table style="
        width: 100%; 
        border-collapse: collapse; 
        font-size: ${tableFontSize}; 
        font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
      ">
        <thead>
          <tr style="background: ${KHMER_BLUE}; color: ${KHMER_WHITE};">
            ${headers.map(h => `
              <th style="
                border: 1px solid ${KHMER_BLUE}; 
                padding: 10px 8px; 
                text-align: center; 
                font-weight: bold;
                font-size: calc(${tableFontSize} + 1px);
                font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
              ">${h.label}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    // Add table rows with proper Khmer font support
    data.forEach((item, index) => {
      const rowStyle = index % 2 === 0 ? `background-color: ${KHMER_WHITE};` : `background-color: ${KHMER_BG_LIGHT};`;
      
      htmlContent += `<tr style="${rowStyle}">`;
      
      headers.forEach((h) => {
        let value = item[h.key];
        let cellAlign = 'left';
        let cellStyle = '';
        
        // Format specific fields
        if (h.key.includes('date') && value) {
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            value instanceof Date
          ) {
            value = new Date(value).toLocaleDateString(
              options.locale === 'km' ? 'km-KH' : 'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }
            );
          }
          cellAlign = 'center';
        }

        if (h.key.includes('amount') && (typeof value === 'number' || value instanceof Date)) {
          value = value.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          cellAlign = 'right';
          cellStyle = 'font-weight: 600;';
        }
        if (h.key.includes('status')) {
          cellAlign = 'center';
          cellStyle = 'font-weight: 500; text-transform: capitalize;';
        }
        
        htmlContent += `
          <td style="
            border: 1px solid ${KHMER_BORDER}; 
            padding: 8px; 
            text-align: ${cellAlign};
            font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
            color: ${KHMER_TEXT_DARK};
            ${cellStyle}
          ">${value?.toString() || '-'}</td>
        `;
      });
      
      htmlContent += '</tr>';
    });
    
    htmlContent += '</tbody></table>';

    // Add clean total section
    if (options.totalAmount !== undefined && options.t) {
      const totalText = getTotalText(
        options.t,
        options.totalAmount,
        options.currency || '',
        options.locale || 'en'
      );
      
      htmlContent += `
        <div style="
          margin-top: 20px;
          text-align: right;
        ">
          <p style="
            display: inline-block;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
            color: ${KHMER_RED};
            background: ${KHMER_BG_LIGHT};
            border: 1px solid ${KHMER_BORDER};
            border-right: 3px solid ${KHMER_RED};
            border-radius: 4px;
            font-family: ${options.locale === 'km' ? '"Noto Sans Khmer", "Khmer OS"' : '"Helvetica Neue", Arial, sans-serif'};
          ">
            ${totalText}
          </p>
        </div>
      `;
    }

    // Add clean footer
    if (options.t) {
      const footerText = getFooterText(options.t, options.locale || 'en');
      htmlContent += `
        <div style="
          margin-top: 25px; 
          padding-top: 10px;
          border-top: 1px solid ${KHMER_BORDER};
          text-align: center;
          font-size: 10px;
          color: ${KHMER_TEXT_LIGHT};
        ">
          ${footerText}
        </div>
      `;
    }
    
    htmlContent += `</div>`; // Close main wrapper
    
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Convert to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF from canvas
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit within page margins
    const margin = 10; // 10mm margin
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin;
    
    // Add image to PDF, handling multiple pages if needed
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - (margin * 2));
    
    while (heightLeft > 0) {
      position = -heightLeft - margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));
    }

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF with Unicode support:', error);
    // Fallback to regular PDF export
    throw new Error('Failed to generate PDF with Unicode support. Please try again.');
  }
}
 
/**
 * Enhanced Excel export with better Unicode/Khmer support
 */
export async function exportToExcelWithUnicodeSupport(
  data: any[],
  headers: { key: string, label: string }[],
  filename = 'export.xlsx',
  title = 'Settlement History',
  subtitle = '',
  options: {
    locale?: 'km' | 'en';
    t?: Function;
    currency?: string;
    totalAmount?: number;
    period?: string;
  } = {}
) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Set worksheet properties for better Unicode support
  worksheet.properties.defaultColWidth = 5;

  // Get dynamic titles if translation function is available
  const displayTitle = options.t ? options.t('settlement_history_title') : title;
  const displaySubtitle = options.t ? 
    options.t('settlement_history_subtitle', { date: new Date().toLocaleDateString(options.locale === 'km' ? 'km-KH' : 'en-US') }) : 
    subtitle;

  let currentRow = 1;

  // Add title row
  worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = displayTitle;
  titleCell.font = { 
    size: 16, 
    bold: true,
    name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  currentRow++;

  // Add subtitle row if provided
  if (displaySubtitle) {
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
    const subtitleCell = worksheet.getCell(currentRow, 1);
    subtitleCell.value = displaySubtitle;
    subtitleCell.font = { 
      size: 12, 
      italic: true,
      name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
    };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;
  }

  // Add period information if provided
  if (options.period && options.t) {
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
    const periodCell = worksheet.getCell(currentRow, 1);
    const periodText = `${options.t('pdf_export.period')}: ${options.period}`;
    periodCell.value = periodText;
    periodCell.font = { 
      size: 10,
      name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
    };
    periodCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;
  }

  // Add empty row for spacing
  currentRow++;

  // Add header row
  const headerRow = worksheet.addRow(headers.map(h => h.label));
  headerRow.font = { 
    bold: true,
    name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
  };
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

  // Add data rows with proper formatting
  data.forEach(item => {
    const row = worksheet.addRow(headers.map(h => {
      let value = item[h.key];
      
      // Format specific fields based on locale
      if (h.key.includes('date') && value) {
        value = new Date(value).toLocaleDateString(options.locale === 'km' ? 'km-KH' : 'en-US');
      }
      if (h.key.includes('amount') && typeof value === 'number') {
        value = value.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US');
      }
      
      return value;
    }));
    
    // Set font for data rows
    row.font = {
      name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
    };
    
    // Add borders to data cells
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Add total row if provided with proper formatting
  if (options.totalAmount !== undefined && options.t) {
    // Add empty row for spacing
    worksheet.addRow([]);
    
    // Create a properly formatted total section
    const totalLabel = options.t('pdf_export.total');
    const totalValue = `${options.totalAmount.toLocaleString(options.locale === 'km' ? 'km-KH' : 'en-US')} ${options.currency || ''}`;
    
    // Add total row spanning multiple columns for better layout
    const totalRowData = new Array(headers.length).fill('');
    totalRowData[headers.length - 2] = totalLabel; // Second to last column
    totalRowData[headers.length - 1] = totalValue; // Last column
    
    const totalRow = worksheet.addRow(totalRowData);
    
    // Style the total row
    totalRow.font = { 
      bold: true,
      size: 12,
      name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
    };
    totalRow.alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Add background color and borders to make it stand out
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber >= headers.length - 1) { // Last two columns
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F3FF' } // Light blue background
        };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'medium', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }
    });
    
    // Make the total value cell right-aligned and bold
    const totalValueCell = totalRow.getCell(headers.length);
    totalValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
    totalValueCell.font = { 
      bold: true,
      size: 12,
      color: { argb: 'FF0066CC' }, // Blue color for emphasis
      name: options.locale === 'km' ? 'Noto Sans Khmer' : 'Arial'
    };
  }

  // Set reasonable column widths - more compact and globally applicable
  worksheet.columns.forEach((column, index) => {
    if (!column) return;
    
    let maxLength = 8; // Reduced minimum width
    let calculatedWidth = 12; // Reduced default width
    
    // Calculate width based on actual content
    column.eachCell?.({ includeEmpty: true }, cell => {
      if (cell.value) {
        const cellLength = cell.value.toString().length;
        // For Khmer text, account for wider characters but keep it reasonable
        const adjustedLength = options.locale === 'km' ? cellLength * 1.2 : cellLength;
        maxLength = Math.max(maxLength, adjustedLength);
      }
    });
    
    // Apply intelligent width limits based on content length rather than column names
    if (maxLength <= 10) {
      calculatedWidth = Math.min(maxLength + 2, 12); // Short content
    } else if (maxLength <= 20) {
      calculatedWidth = Math.min(maxLength + 2, 18); // Medium content
    } else if (maxLength <= 30) {
      calculatedWidth = Math.min(maxLength + 2, 25); // Long content
    } else {
      calculatedWidth = Math.min(maxLength + 2, 30); // Very long content
    }
    
    // Ensure minimum readability but keep compact
    column.width = Math.max(calculatedWidth, 10);
  });

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: currentRow }];

  // Save with proper encoding
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(link.href);
}
