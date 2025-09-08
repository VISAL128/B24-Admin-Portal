interface ExportHeader {
  key: string
  label: string
}

interface ExportOptions {
  company?: string
  currency?: string
  totalAmount?: number
  currencyTotals?: Record<string, number>
  locale?: 'km' | 'en'
  t?: (key: string, ...args: unknown[]) => string
  filter?: Record<string, string>
  exportBy?: string
  exportDate?: string
}

export const usePuppeteerPdfExport = () => {
  
    const formatDateTime = (
    dateInput: string | Date | null | undefined
  ): string => {
    if (!dateInput) return '-'
    
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) {
        return typeof dateInput === 'string' ? dateInput : '-'
      }
      
      return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    } catch (error) {
      console.error('Error formatting datetime:', error)
      return typeof dateInput === 'string' ? dateInput : '-'
    }
  }

  const generateHTML = (
    data: Record<string, unknown>[],
    headers: ExportHeader[],
    title: string,
    subtitle?: string,
    options: ExportOptions = {}
  ): string => {
    const isKhmer = options.locale === 'km'
    
    // Khmer-inspired color palette
    const KHMER_BLUE = '#032ea1'
    const KHMER_RED = '#da251d'
    const KHMER_WHITE = '#ffffff'
    const KHMER_TEXT_DARK = '#2c3e50'
    const KHMER_TEXT_LIGHT = '#555'
    const KHMER_BORDER = '#d1d8e0'
    const KHMER_BG_LIGHT = '#f7f9fc'

    // Dynamic font sizing based on column count
    let tableFontSize = '9px'
    if (headers.length > 8) tableFontSize = '8px'
    if (headers.length > 10) tableFontSize = '7px'

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="${isKhmer ? 'km' : 'en'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${isKhmer ? '"Noto Sans Khmer", "Khmer OS"' : '"Inter"'}, Arial, sans-serif;
          background: ${KHMER_WHITE};
          color: ${KHMER_TEXT_DARK};
          padding: 20px;
          line-height: 1.4;
        }
        
        .header {
          text-align: left;
          padding-bottom: 15px;
          border-bottom: 3px double ${KHMER_BLUE};
          margin-bottom: 20px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: ${KHMER_BLUE};
          font-family: ${isKhmer ? '"Noto Sans Khmer", "Khmer OS"' : '"Inter"'}, Arial, sans-serif;
        }
        
        .subtitle {
          font-size: 14px;
          margin: 4px 0;
          color: ${KHMER_TEXT_LIGHT};
          font-weight: 500;
        }
        
        .metadata {
          font-size: 12px;
          margin: 3px 0;
          color: ${KHMER_TEXT_LIGHT};
        }
        
        .filters-section {
          margin-bottom: 20px;
          padding: 15px 0;
          border-top: 1px solid #e0e0e0;
        }
        
        .filters-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .filter-table {
          width: 100%;
          font-size: 11px;
        }
        
        .filter-row {
          margin-bottom: 4px;
        }
        
        .filter-key {
          font-weight: 600;
          color: #333;
          width: 120px;
          display: inline-block;
        }
        
        .filter-value {
          color: #666;
        }
        
        .main-table {
          width: 100%;
          border-collapse: collapse;
          font-size: ${tableFontSize};
          margin-top: 10px;
        }
        
        .main-table th {
          background: ${KHMER_BLUE};
          color: ${KHMER_WHITE};
          border: 1px solid ${KHMER_BLUE};
          padding: 12px 8px;
          text-align: center;
          font-weight: 700;
          font-size: calc(${tableFontSize} + 1px);
        }
        
        .main-table td {
          border: 1px solid ${KHMER_BORDER};
          padding: 8px;
          color: ${KHMER_TEXT_DARK};
        }
        
        .main-table tbody tr:nth-child(even) {
          background-color: ${KHMER_BG_LIGHT};
        }
        
        .main-table tbody tr:nth-child(odd) {
          background-color: ${KHMER_WHITE};
        }
        
        .cell-center {
          text-align: center;
        }
        
        .cell-right {
          text-align: right;
        }
        
        .cell-left {
          text-align: left;
        }
        
        .row-number {
          font-weight: 600;
          color: #666;
          font-size: 0.9em;
        }
        
        .amount {
          font-weight: 600;
        }
        
        .status {
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .totals-section {
          margin-top: 20px;
          text-align: right;
        }
        
        .total-item {
          display: inline-block;
          padding: 10px 15px;
          font-weight: 700;
          font-size: 14px;
          color: ${KHMER_RED};
          background: ${KHMER_BG_LIGHT};
          border: 1px solid ${KHMER_BORDER};
          border-right: 3px solid ${KHMER_RED};
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid ${KHMER_BORDER};
          text-align: center;
          font-size: 10px;
          color: ${KHMER_TEXT_LIGHT};
        }
        
        @media print {
          body {
            padding: 10px;
          }
          
          .header {
            page-break-inside: avoid;
          }
          
          .main-table {
            page-break-inside: auto;
          }
          
          .main-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .main-table thead {
            display: table-header-group;
          }
          
          .totals-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${title}</h1>`

    if (subtitle) {
      const walletInfo = options.t ? options.t('wallet_info') : 'Wallet Info'
      htmlContent += `
        <div class="subtitle"><strong>${walletInfo}:</strong> ${subtitle}</div>`
    }

    if (options.exportBy) {
      const exportByLabel = options.t?.('exported_by') || 'Exported By'
      htmlContent += `
        <div class="metadata"><strong>${exportByLabel}:</strong> ${options.exportBy}</div>`
    }

    if (options.exportDate) {
      const exportDateLabel = options.t?.('export_date') || 'Export Date'
      const formattedDate = new Date(options.exportDate).toLocaleDateString(
        isKhmer ? 'km-KH' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
      htmlContent += `
        <div class="metadata"><strong>${exportDateLabel}:</strong> ${formattedDate}</div>`
    }

    htmlContent += `
      </div>`

    // Add filters section
    if (options.filter && Object.keys(options.filter).length > 0 && options.t) {
      const filtersAppliedLabel = options.t('filters_applied')
      const filterEntries = Object.entries(options.filter).filter(
        ([key]) => !key.toLowerCase().includes('date range')
      )

      if (filterEntries.length > 0) {
        htmlContent += `
        <div class="filters-section">
          <h3 class="filters-title">${filtersAppliedLabel}</h3>
          <div class="filters-grid">`

        const midPoint = Math.ceil(filterEntries.length / 2)
        const leftColumn = filterEntries.slice(0, midPoint)
        const rightColumn = filterEntries.slice(midPoint)

        htmlContent += `
            <div class="filter-table">`
        leftColumn.forEach(([key, value]) => {
          const displayValue = String(value || 'N/A')
          htmlContent += `
              <div class="filter-row">
                <span class="filter-key">${key}:</span>
                <span class="filter-value">${displayValue}</span>
              </div>`
        })
        htmlContent += `
            </div>`

        if (rightColumn.length > 0) {
          htmlContent += `
            <div class="filter-table">`
          rightColumn.forEach(([key, value]) => {
            const displayValue = String(value || 'N/A')
            htmlContent += `
              <div class="filter-row">
                <span class="filter-key">${key}:</span>
                <span class="filter-value">${displayValue}</span>
              </div>`
          })
          htmlContent += `
            </div>`
        }

        htmlContent += `
          </div>
        </div>`
      }
    }

    // Add main table
    htmlContent += `
      <table class="main-table">
        <thead>
          <tr>`

    headers.forEach((header) => {
      htmlContent += `
            <th>${header.label}</th>`
    })

    htmlContent += `
          </tr>
        </thead>
        <tbody>`

    data.forEach((item, index) => {
      htmlContent += `
          <tr>`

      headers.forEach((header) => {
        let value: unknown
        let cellClass = 'cell-center' // Default to center alignment
        let extraClass = ''

        if (header.key === 'row_number' || header.label === '#') {
          value = index + 1
          cellClass = 'cell-center'
          extraClass = 'row-number'
        } else {
          value = item[header.key]

          if (header.key.includes('date') && value) {
            if (typeof value === 'string' || value instanceof Date) {
              value = formatDateTime(value.toString())
            }
            cellClass = 'cell-center'
          }

          if (header.key.includes('amount') && typeof value === 'number') {
            value = value.toLocaleString(isKhmer ? 'km-KH' : 'en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            cellClass = 'cell-right' // Amount columns remain right-aligned
            extraClass = 'amount'
          }

          if (header.key.includes('status')) {
            cellClass = 'cell-center'
            extraClass = 'status'
          }
        }

        const displayValue = value?.toString() || '-'
        htmlContent += `
            <td class="${cellClass} ${extraClass}">${displayValue}</td>`
      })

      htmlContent += `
          </tr>`
    })

    htmlContent += `
        </tbody>
      </table>`

    // Add totals section
    if ((options.totalAmount !== undefined || options.currencyTotals) && options.t) {
      htmlContent += `
      <div class="totals-section">`

      if (options.currencyTotals && Object.keys(options.currencyTotals).length > 0) {
        const totalLabel = options.t('pdf_export.total') || 'Total'

        Object.entries(options.currencyTotals).forEach(([currency, amount]) => {
          const formattedAmount = (amount as number).toLocaleString(
            isKhmer ? 'km-KH' : 'en-US'
          )
          htmlContent += `
        <div class="total-item">
          ${totalLabel} (${currency}): ${formattedAmount} ${currency}
        </div>`
        })
      } else if (options.totalAmount !== undefined) {
        const totalLabel = options.t('pdf_export.total') || 'Total'
        const formattedAmount = options.totalAmount.toLocaleString(
          isKhmer ? 'km-KH' : 'en-US'
        )
        htmlContent += `
        <div class="total-item">
          ${totalLabel}: ${formattedAmount} ${options.currency || ''}
        </div>`
      }

      htmlContent += `
      </div>`
    }

    // Add footer
    if (options.t) {
      const footerText = options.t('generated_by_system') || 'Generated by system'
      const currentDate = new Date().toLocaleDateString(
        isKhmer ? 'km-KH' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )

      htmlContent += `
      <div class="footer">
        ${footerText} - ${currentDate}
      </div>`
    }

    htmlContent += `
    </body>
    </html>`

    return htmlContent
  }

  const exportToPDF = async (
    data: Record<string, unknown>[],
    headers: ExportHeader[],
    filename: string,
    title: string,
    subtitle?: string,
    options: ExportOptions = {}
  ) => {
    try {
      // Convert translation function to object for JSON serialization
      const translationObject: Record<string, string> = {}
      if (options.t) {
        // Common translation keys used in PDF export
        const keys = [
          'wallet_info',
          'exported_by',
          'export_date',
          'filters_applied',
          'pdf_export.total',
          'generated_by_system'
        ]
        
        keys.forEach(key => {
          try {
            translationObject[key] = options.t!(key)
          } catch {
            // If translation fails, use the key as fallback
            translationObject[key] = key
          }
        })
      }

      // Prepare request body
      const requestBody = {
        data,
        headers,
        title,
        subtitle,
        options: {
          ...options,
          t: translationObject // Replace function with object
        }
      }

      // Call server-side API
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${errorText}`)
      }

      // Get PDF blob from response
      const pdfBlob = await response.blob()

      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating PDF with Puppeteer:', error)
      
      // Enhanced error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Chrome/Chromium browser not found')) {
          throw new Error(
            'Chrome/Chromium browser not found on server. Please install Google Chrome or set CHROME_BIN environment variable.'
          )
        }
        if (error.message.includes('Server error')) {
          throw new Error(error.message)
        }
      }
      
      throw new Error('Failed to generate PDF. Please try again.')
    }
  }

  return {
    exportToPDF,
    generateHTML, // Export for testing purposes
  }
}
