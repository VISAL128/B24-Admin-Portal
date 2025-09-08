import puppeteer from 'puppeteer-core'

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
  t?: Record<string, string> // Changed from function to object for JSON serialization
  filter?: Record<string, string>
  exportBy?: string
  exportDate?: string
  userDateFormat?: string
}

interface RequestBody {
  data: Record<string, unknown>[]
  headers: ExportHeader[]
  title: string
  subtitle?: string
  options?: ExportOptions
}

function formatDateTime(
  dateInput: string | Date | null | undefined,
  userDateFormat?: string
): string {
  if (!dateInput) return '-'
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) {
      return typeof dateInput === 'string' ? dateInput : '-'
    }
    
    // Use user date format if provided, otherwise default to medium/short
    const dateStyle = (userDateFormat as 'full' | 'long' | 'medium' | 'short') || 'medium'
    
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle,
      timeStyle: 'short',
    }).format(date)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return typeof dateInput === 'string' ? dateInput : '-'
  }
}

function generateHTML(
  data: Record<string, unknown>[],
  headers: ExportHeader[],
  title: string,
  subtitle?: string,
  options: ExportOptions = {}
): string {
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
    const walletInfo = options.t?.['wallet_info'] || 'Wallet Info'
    htmlContent += `
      <div class="subtitle"><strong>${walletInfo}:</strong> ${subtitle}</div>`
  }

  if (options.exportBy) {
    const exportByLabel = options.t?.['exported_by'] || 'Exported By'
    htmlContent += `
      <div class="metadata"><strong>${exportByLabel}:</strong> ${options.exportBy}</div>`
  }

  if (options.exportDate) {
    const exportDateLabel = options.t?.['export_date'] || 'Export Date'
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
    const filtersAppliedLabel = options.t['filters_applied'] || 'Filters Applied'
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
            value = formatDateTime(value.toString(), options.userDateFormat)
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
      const totalLabel = options.t['pdf_export.total'] || 'Total'

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
      const totalLabel = options.t['pdf_export.total'] || 'Total'
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
    const footerText = options.t['generated_by_system'] || 'Generated by system'
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

export default defineEventHandler(async (event) => {
  try {
    // Only allow POST requests
    if (event.node.req.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    const body = await readBody<RequestBody>(event)
    const { data, headers, title, subtitle, options = {} } = body

    if (!data || !headers || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: data, headers, title'
      })
    }

    // Try to find Chrome/Chromium executable
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
      process.env.CHROME_BIN,
      process.env.PUPPETEER_EXECUTABLE_PATH,
    ].filter(Boolean) as string[]

    let executablePath: string | undefined

    // Try to detect Chrome executable
    for (const path of possiblePaths) {
      try {
        const fs = await import('fs')
        if (fs.existsSync(path)) {
          executablePath = path
          break
        }
      } catch {
        continue
      }
    }

    if (!executablePath) {
      // Default to common macOS path
      executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()

    // Generate HTML content
    const htmlContent = generateHTML(data, headers, title, subtitle, options)

    // Set content and wait for fonts to load
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    })

    // Configure PDF options
    const isLandscape = headers.length > 7
    const pdfOptions: Parameters<typeof page.pdf>[0] = {
      format: 'A4',
      landscape: isLandscape,
      printBackground: true,
      margin: {
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
        left: '10mm',
      },
      preferCSSPageSize: true,
    }

    // Generate PDF buffer
    const pdfBuffer = await page.pdf(pdfOptions)

    await browser.close()

    // Set response headers for PDF download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'attachment; filename="export.pdf"')

    return pdfBuffer

  } catch (error) {
    console.error('Error generating PDF:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Could not find expected browser')) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Chrome/Chromium browser not found. Please install Google Chrome or set CHROME_BIN environment variable.'
        })
      }
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate PDF'
    })
  }
})
