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
  exportOptions?: ExportOptions
}>()

const pdfExportHeaders = computed(() => props.headers)

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
  }
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
    
    // const totalAmount = props.data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0)
    const totalAmount = props.data.reduce((sum, item) => sum + (Number((item.total_amount || item.amount)) || 0), 0)

    console.log('Starting Excel export...', totalAmount);
    
    const currentLocale = locale.value as 'km' | 'en'
    const periodText = `${props.exportOptions?.startDate} ${t('to')} ${props.exportOptions?.endDate}`
      await exportToExcelWithUnicodeSupport(
        props.data,
        props.headers,
        `${props.exportOptions?.fileName || 'export'}.xlsx`,
        props.exportOptions?.title || '',

        props.exportOptions?.subtitle || '',
        {
          locale: currentLocale,
          t,
          currency: props.exportOptions?.currency ?? 'USD',
          totalAmount,
          period: periodText,
          filter: props.exportOptions?.filter,
          exportBy: props.exportOptions?.exportBy,
          exportDate: props.exportOptions?.exportDate,
        }
      )

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_excel', { count: props.data.length }),
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
    const totalAmount = props.data.reduce((sum, item) => sum + (Number((item.total_amount || item.amount)) || 0), 0)
    const currentLocale = locale.value as 'km' | 'en'

 
    await exportToPDFWithUnicodeSupport(
      props.data,
      pdfExportHeaders.value,
      `${props.exportOptions?.fileName || 'export'}.pdf`,
      props.exportOptions?.title || '',
      props.exportOptions?.subtitle || '',
      {
        currency: props.exportOptions?.currency,
        totalAmount,
        locale: currentLocale,
        t,
        filter: props.exportOptions?.filter,
        exportBy: props.exportOptions?.exportBy,
        exportDate: props.exportOptions?.exportDate,
      }
    )

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_pdf', { count: props.data.length }),
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
