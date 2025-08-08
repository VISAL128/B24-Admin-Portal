<template>
  <!-- <UDropdownMenu :items="exportItems" :content="{ align: 'end' }" @select="handleExport">
    <UButton icon="i-lucide-download" trailing-icon="i-lucide-chevron-down">
      {{ t('export') }}
    </UButton>
  </UDropdownMenu> -->
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
  exportToExcelStyled,
  exportToPDFWithUnicodeSupport,
  exportToPDFStyled,
} from '~/composables/utils/exportUtils'

import type { ExportOptions } from '~/components/tables/BaseTable.vue'
import appConfig from '~~/app.config'
const { t, locale } = useI18n()
const toast = useToast()

const props = defineProps<{
  data: any[]
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
    console.log('Starting Excel export...')
    const totalAmount = props.data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0)
    const currentLocale = locale.value as 'km' | 'en'
    const periodText = `${props.exportOptions?.startDate} ${t('to')} ${props.exportOptions?.endDate}`
    try {
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
        }
      )
    } catch (unicodeError) {
      console.error('Unicode Excel export failed:', unicodeError)
      await exportToExcelStyled(
        props.data,
        props.headers,
        `${props.exportOptions?.fileName || 'export'}.xlsx`,
        props.exportOptions?.title || '',
        props.exportOptions?.subtitle || '',
        {
          currency: props.exportOptions?.currency,
          totalAmount: props.exportOptions?.totalAmount,
          locale: locale.value as 'km' | 'en',
          t,
        }
      )
    }
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
    const totalAmount = props.data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0)
    const currentLocale = locale.value as 'km' | 'en'
    const periodText = `${props.exportOptions?.startDate} ${t('to')} ${props.exportOptions?.endDate}`

    try {
      await exportToPDFWithUnicodeSupport(
        props.data,
        pdfExportHeaders.value,
        `${props.exportOptions?.fileName || 'export'}.pdf`,
        props.exportOptions?.title || '',
        props.exportOptions?.subtitle || '',
        periodText,
        {
          totalAmount,
          locale: currentLocale,
          t,
        }
      )
    } catch {
      await exportToPDFStyled(
        props.data,
        props.headers,
        `${props.exportOptions?.fileName || 'export'}.pdf`,
        props.exportOptions?.title || '',
        props.exportOptions?.subtitle || '',
        `${props.exportOptions?.startDate} to ${props.exportOptions?.endDate}`,
        {
          currency: props.exportOptions?.currency,
          totalAmount: props.exportOptions?.totalAmount,
          locale: locale.value as 'km' | 'en',
          t,
        }
      )
    }

    toast.add({
      title: t('export_successful'),
      description: t('exported_records_to_pdf', { count: props.data.length }),
      color: 'success',
    })
  } catch {
    toast.add({
      title: t('export_failed'),
      description: t('failed_to_export_to_pdf'),
      color: 'error',
    })
  }
}
</script>
