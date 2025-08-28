<template>
  <UButtonGroup>
    <UButton
      color="neutral"
      size="sm"
      variant="subtle"
      icon="tabler:file-excel"
      label="Excel"
      :ui="appConfig.ui.button.slots"
      @click="exportToExcelHandler"
    />

    <UDropdownMenu :items="exportItems" size="sm" :ui="appConfig.ui.dropdownMenu.slots">
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-chevron-down" />
    </UDropdownMenu>
  </UButtonGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
import { useToast } from '#imports'
import { computed } from 'vue'
import {
  exportToExcelWithUnicodeSupport,
  exportToPDFWithUnicodeSupport,
} from '~/composables/utils/exportUtils'

import type { ExportOptions } from '~/components/tables/ExTable.vue'
import appConfig from '~~/app.config'
const { t, locale } = useI18n()
const toast = useToast()

type ExportDataRow = {
  [key: string]: string | number | boolean | null | undefined
}

const props = defineProps<{
  data: ExportDataRow[]
  headers: { key: string; label: string }[]
  columns?: unknown[]
  exportOptions?: ExportOptions
}>()

const pdfExportHeaders = computed(() => props.headers)

// Check if the table has amount-related columns
const hasAmountColumns = computed(() => {
  return props.headers.some(
    (header) =>
      header.key.toLowerCase().includes('amount') ||
      header.key.toLowerCase().includes('total') ||
      header.label.toLowerCase().includes('amount') ||
      header.label.toLowerCase().includes('total')
  )
})

// Calculate totals by currency
const calculateCurrencyTotals = (data: ExportDataRow[]) => {
  const totals: Record<string, number> = {}

  data.forEach((item) => {
    const amount = Number(item.total_amount || item.amount) || 0
    const currency = String(item.currency_id || item.currency || 'USD')

    if (!totals[currency]) {
      totals[currency] = 0
    }
    totals[currency] += amount
  })

  return totals
}

// Transform data using exportValue functions when available
const transformedData = computed(() => {
  if (!props.columns || !props.data) return props.data

  return props.data.map((row) => {
    const transformedRow: ExportDataRow = {}

    props.headers.forEach(({ key }) => {
      // Find the column configuration for this key

      const column = props.columns?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (col: any) => (col.accessorKey && String(col.accessorKey) === key) || col.id === key
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((column as any)?.exportValue) {
        // Use the custom exportValue function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformedRow[key] = (column as any).exportValue(row)
      } else {
        // Use the original value
        transformedRow[key] = row[key]
      }
    })

    return transformedRow
  })
})

// const handleExport = (item: { click: () => void }) => {
//   if (item.click) item.click()
// }

const exportItems: DropdownMenuItem[] = [
  {
    label: t('excel'),
    icon: 'tabler:file-excel',
    onSelect() {
      exportToExcelHandler()
    },
  },
  {
    label: t('pdf'),
    icon: 'tabler:file-type-pdf',
    onSelect() {
      exportToPDFHandler()
    },
  },
]

const exportToExcelHandler = async () => {
  try {
    if (!props.data.length) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }

    // Use transformed data for export
    const dataToExport = transformedData.value

    // Only calculate total amount if table has amount columns
    const currencyTotals = hasAmountColumns.value
      ? calculateCurrencyTotals(dataToExport)
      : undefined

    console.log('Starting Excel export...', currencyTotals)

    const currentLocale = locale.value as 'km' | 'en'
    const periodText = `${props.exportOptions?.startDate} ${t('to')} ${props.exportOptions?.endDate}`
    await exportToExcelWithUnicodeSupport(
      dataToExport,
      props.headers,
      `${props.exportOptions?.fileName || 'export'}.xlsx`,
      props.exportOptions?.title || '',

      props.exportOptions?.subtitle || '',
      {
        locale: currentLocale,
        t,
        currency: props.exportOptions?.currency ?? 'USD',
        currencyTotals,
        period: periodText,
        filter: props.exportOptions?.filter,
        exportBy: props.exportOptions?.exportBy,
        exportDate: props.exportOptions?.exportDate,
      }
    )

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_excel', { count: dataToExport.length }),
      color: 'success',
    })
  } catch (error) {
    console.error('Excel export failed:', error)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_excel'),
      color: 'error',
    })
  }
}

const exportToPDFHandler = async () => {
  try {
    console.log('Starting PDF export...')
    if (!props.data.length) {
      toast.add({
        title: t('no_data_to_export'),
        description: t('please_ensure_there_is_data_to_export'),
        color: 'warning',
      })
      return
    }

    // Use transformed data for export
    const dataToExport = transformedData.value

    // Only calculate total amount if table has amount columns
    const currencyTotals = hasAmountColumns.value
      ? calculateCurrencyTotals(dataToExport)
      : undefined
    const currentLocale = locale.value as 'km' | 'en'

    await exportToPDFWithUnicodeSupport(
      dataToExport,
      pdfExportHeaders.value,
      `${props.exportOptions?.fileName || 'export'}.pdf`,
      props.exportOptions?.title || '',
      props.exportOptions?.subtitle || '',
      {
        currency: props.exportOptions?.currency,
        currencyTotals,
        locale: currentLocale,
        t,
        filter: props.exportOptions?.filter,
        exportBy: props.exportOptions?.exportBy,
        exportDate: props.exportOptions?.exportDate,
      }
    )

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_pdf', { count: dataToExport.length }),
      color: 'success',
    })
  } catch (e) {
    console.error('PDF export handler failed:', e)
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_pdf'),
      color: 'error',
    })
  }
}
</script>
