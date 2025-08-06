import type { QueryParams } from '~/models/baseModel'
import { QueryParamsPgwModuleApi } from '../model/pgw_module_api/base'
import type { ParamFilterPgwModuleApi } from '../model/pgw_module_api/base'

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
      operator: 'contains',
      value: clientParams.search
    })
  }
  
  // Map date range to filters
  // if (clientParams.start_date) {
  //   filters.push({
  //     field: 'fromDate',
  //     operator: 'gte',
  //     value: clientParams.start_date
  //   })
  // }
  
  // if (clientParams.end_date) {
  //   filters.push({
  //     field: 'toDate',
  //     operator: 'lte',
  //     value: clientParams.end_date
  //   })
  // }
  
  // Map additional filters
  if (clientParams.filters && clientParams.filters.length > 0) {
    for (const filter of clientParams.filters) {
      // Map field names if needed for PGW API compatibility
      const pgwField = mapFieldNameToPgwModule(filter.field)
      
      filters.push({
        field: pgwField as ParamFilterPgwModuleApi['field'],
        operator: filter.operator,
        value: filter.value
      })
    }
  }
  
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
