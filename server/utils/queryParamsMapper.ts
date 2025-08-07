import type { QueryParams } from '~/models/baseModel'
import { QueryParamsPgwModuleApi } from '../model/pgw_module_api/base'
import type { ParamFilterPgwModuleApi } from '../model/pgw_module_api/base'
import { FilterOperatorPgwModule } from '~/utils/enumModel'

/**
 * Maps client-side QueryParams to PGW Module API format
 * @param clientParams - QueryParams from client
 * @returns QueryParamsPgwModuleApi instance
 */
export function mapQueryParamsToPgwModule(clientParams: QueryParams): QueryParamsPgwModuleApi {
  const pgwParams = new QueryParamsPgwModuleApi()
  
  // Map pagination
  pgwParams.pageIndex = clientParams.page || 1
  pgwParams.pageSize = clientParams.page_size || 10
  
  // Map sorting - convert to PGW format (field+ for asc, field- for desc, separated by ;)
  if (clientParams.sortAsString) {
    // If sortAsString is provided, use it directly
    pgwParams.sorts = clientParams.sortAsString
    
  }else{
      // Otherwise, build sorts from array (THIS IS NOT YET WORKING)
    const sortsArray = clientParams.sorts || []
    if (sortsArray.length > 0) {
      sortsArray.forEach((sort: { field: string; direction: 'asc' | 'desc' }) => {
        pgwParams.sorts += `${sort.field}${sort.direction === 'asc' ? '+' : '-'};`
      })
    }
  }

  // Remove trailing semicolon if exists
  if (pgwParams.sorts.endsWith(';')) {
    pgwParams.sorts = pgwParams.sorts.slice(0, -1)
  }
  
  // Initialize filters array
  const filters: ParamFilterPgwModuleApi[] = []
  
  // Map search to filter
  if (clientParams.search) {
    filters.push({
      field: 'search',
      operator: FilterOperatorPgwModule.Contains,
      value: clientParams.search,
      manualFilter: false
    })
  }
  
  // Map date range to filters
  if (clientParams.start_date) {
    filters.push({
      field: 'fromDate',
      operator: FilterOperatorPgwModule.GreaterThanOrEqualTo,
      value: clientParams.start_date,
      manualFilter: false
    })
  }
  
  if (clientParams.end_date) {
    filters.push({
      field: 'toDate',
      operator: FilterOperatorPgwModule.LessThanOrEqualTo,
      value: clientParams.end_date,
      manualFilter: false
    })
  }
  
  // Map additional filters
  if (clientParams.filters) {
    let filtersArray = clientParams.filters
    console.log('Client filters:', filtersArray)
    // Handle case where filters is a JSON string (from URL query params)
    if (typeof clientParams.filters === 'string') {
      try {
        filtersArray = JSON.parse(clientParams.filters)
      } catch (error) {
        console.warn('Failed to parse filters JSON string:', error)
        filtersArray = []
      }
    }
    
    // Ensure it's an array and has items
    if (Array.isArray(filtersArray) && filtersArray.length > 0) {
      for (let filter of filtersArray) {
        if (typeof filter === 'string') {
          filter = JSON.parse(filter)
        }
        // Map field names if needed for PGW API compatibility
        const pgwField = mapFieldNameToPgwModule(filter.field)
        
        filters.push({
          field: pgwField as ParamFilterPgwModuleApi['field'],
          operator: filter.operator as FilterOperatorPgwModule,
          value: filter.value,
          manualFilter: false
        })
      }
    }
    else if (filtersArray && typeof filtersArray === 'object' && !Array.isArray(filtersArray)) {
      // If filters is a single object, convert it to an array
      const singleFilter = filtersArray as { field: string; operator: FilterOperatorPgwModule; value: string | number | boolean | Date; manualFilter?: boolean }
      filters.push({
        field: mapFieldNameToPgwModule(singleFilter.field),
        operator: singleFilter.operator,
        value: singleFilter.value,
        manualFilter: false
      })
    }
  }
  console.log('Mapped filters:', filters)
  
  // Map status filters if any
//   if (clientParams.statuses && clientParams.statuses.length > 0) {
//     // Assuming status is mapped to a search filter for PGW
//     for (const status of clientParams.statuses) {
//       filters.push({
//         field: 'search',
//         operator: 'eq',
//         value: status
//       })
//     }
//   }
  
  pgwParams.filter = filters
  
  return pgwParams
}

/**
 * Maps client field names to PGW Module API field names
 * @param clientField - Field name from client
 * @returns Mapped field name for PGW API
 */
function mapFieldNameToPgwModule(clientField: string): string {
  const fieldMapping: Record<string, string> = {
    'supplier_id': 'supplierId',
    // Add more field mappings as needed
  }
  
  return fieldMapping[clientField] || clientField
}

/**
 * Converts QueryParamsPgwModuleApi to plain object for API request
 * @param pgwParams - QueryParamsPgwModuleApi instance
 * @returns Plain object suitable for API request
 */
export function serializePgwModuleParams(pgwParams: QueryParamsPgwModuleApi): Record<string, unknown> {
  // Simple serialization without class-transformer for now
  return {
    pageIndex: pgwParams.pageIndex,
    pageSize: pgwParams.pageSize,
    pageCount: pgwParams.pageCount,
    rowCount: pgwParams.rowCount,
    sorts: pgwParams.sorts,
    Filter: pgwParams.filter
  }
}
