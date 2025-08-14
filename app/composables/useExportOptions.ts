import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { QueryParams, Filter } from '~/models/baseModel'

/**
 * @interface ExportableDataInfo
 * @description Represents the basic information needed from the source page for generating export options.
 * @property {string} resourceName - The name of the resource being exported (e.g., "Transaction", "Settlement").
 * @property {string} sourceName - The name of the data source (e.g., "Settlement Wallet", "Top-Up Wallet").
 * @property {string} currency - The currency of the data.
 */
export interface ExportableDataInfo {
  resourceName: string
  sourceName: string
  currency: string
}

/**
 * @interface FilterDisplayConfig
 * @description Configuration for how to find and display a specific filter.
 * @property {string} labelKey - The translation key for the filter's label.
 * @property {string} filterField - The field name in the `QueryParams` filters array.
 * @property {'single' | 'multiple'} type - How to process the filter value(s).
 */
export interface FilterDisplayConfig {
  labelKey: string
  filterField: string
  type: 'single' | 'multiple'
}

/**
 * A composable to generate dynamic export options for tables.
 * It centralizes the logic for creating filenames, titles, and filter summaries for PDF/Excel exports.
 *
 * @param dataInfo - A Ref or ComputedRef containing information about the data source.
 * @param lastFetchParams - A Ref containing the last QueryParams used, which includes the filters.
 * @param filterConfigs - An array defining which filters to display and how.
 * @param t - The `t` function from `useI18n` for translations.
 * @returns A computed property that returns the dynamic export options.
 */
export function useExportOptions(
  dataInfo: Ref<ExportableDataInfo | null> | ComputedRef<ExportableDataInfo | null>,
  lastFetchParams: Ref<QueryParams | undefined>,
  filterConfigs: FilterDisplayConfig[],
  t: (key: string, ...args: any[]) => string
) {
  return computed(() => {
    if (!dataInfo.value) {
      return {
        fileName: 'export.pdf',
        title: t('report'),
      }
    }

    const { resourceName, sourceName, currency } = dataInfo.value
    const timestamp = new Date().toISOString().split('T')[0]

    const getFilterValue = (field: string, defaultValue: string = t('all')) => {
      const filter = lastFetchParams.value?.filters?.find((f: Filter) => f.field === field)
      return filter?.value ? String(filter.value) : defaultValue
    }

    const getMultipleFilterValues = (field: string) => {
      const filters = lastFetchParams.value?.filters?.filter((f: Filter) => f.field === field)
      if (!filters || filters.length === 0) return t('all')
      return filters
        .map((f: Filter) => {
          const valueStr = String(f.value)
          return `${valueStr.charAt(0).toUpperCase()}${valueStr.slice(1)}`
        })
        .join(', ')
    }

    const fromDate = getFilterValue('fromDate', '')
    const toDate = getFilterValue('toDate', '')
    const dateRange = fromDate && toDate ? `${t('from')} ${fromDate} ${t('to')} ${toDate}` : t('all_time')

    const filterSummary: Record<string, string> = {
      [t('date_range')]: dateRange,
    }

    filterConfigs.forEach(config => {
      const value =
        config.type === 'single'
          ? getFilterValue(config.filterField)
          : getMultipleFilterValues(config.filterField)
      filterSummary[t(config.labelKey)] = value
    })

    return {
      fileName: `${resourceName}_Report_${sourceName.replace(/\s/g, '_')}_${timestamp}`,
      title: sourceName,
      subtitle: t('resource_report', { resource: resourceName }),
      currency,
      filter: filterSummary,
    }
  })
}

