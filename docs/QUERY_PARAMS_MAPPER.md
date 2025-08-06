# Query Parameters Mapper for PGW Module API

This helper maps client-side `QueryParams` to the PGW Module API format, handling the differences in structure between client and server APIs.

## Files Created/Modified

### 1. Query Parameters Mapper Helper
- **File**: `server/utils/queryParamsMapper.ts`
- **Purpose**: Maps client `QueryParams` to PGW Module API format

### 2. Updated PGW Module API Logic
- **File**: `server/logic/pgw_module_api_logic.ts`
- **Added**: `requestToPgwModuleApiWithQuery()` function

### 3. Updated Base Model
- **File**: `app/models/baseModel.ts`
- **Changed**: `sorts` property from single object to array

### 4. Example Implementation
- **File**: `server/api/pgw-module/sub-biller/list-with-query.ts`
- **Purpose**: Demonstrates usage of the new helper

## Key Differences Handled

### Client QueryParams → PGW Module API

| Client Property | PGW Module Property | Transformation |
|-----------------|---------------------|----------------|
| `page` | `pageIndex` | Direct mapping |
| `page_size` | `pageSize` | Direct mapping |
| `search` | `filters[].field: 'search'` | Converted to filter |
| `start_date` | `filters[].field: 'fromDate'` | Converted to filter |
| `end_date` | `filters[].field: 'toDate'` | Converted to filter |
| `sorts[]` | `sorts` string | Converted to `field+` (asc) or `field-` (desc), separated by `;` |
| `statuses[]` | `filters[]` | Each status becomes a filter |

## Usage Examples

### 1. Basic Usage in API Endpoint

```typescript
import type { QueryParams, PgwModuleResponseList } from '~/models/baseModel'
import { requestToPgwModuleApiWithQuery } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const queryParams: QueryParams = {
    page: query.page ? Number(query.page) : 1,
    page_size: query.page_size ? Number(query.page_size) : 10,
    search: query.search as string,
    start_date: query.start_date as string,
    end_date: query.end_date as string,
    sorts: query.sorts ? parseSort(query.sorts) : undefined
  }

  const response = await requestToPgwModuleApiWithQuery<PgwModuleResponseList<YourModel>>(
    event,
    '/your-endpoint',
    queryParams,
    'POST'
  )

  return response
})
```

### 2. Client-side Query Examples

```typescript
// Simple search with pagination
const queryParams: QueryParams = {
  page: 1,
  page_size: 20,
  search: 'john'
}

// Date range filtering
const queryParams: QueryParams = {
  start_date: '2024-01-01',
  end_date: '2024-12-31'
}

// Sorting (multiple fields)
const queryParams: QueryParams = {
  sorts: [
    { field: 'created_date', direction: 'desc' },
    { field: 'name', direction: 'asc' }
  ]
}

// Status filtering
const queryParams: QueryParams = {
  statuses: ['active', 'pending']
}
```

### 3. Resulting PGW Module API Format

The above client parameters would be transformed to:

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "sorts": "created_date-;name+",
  "Filters": [
    {
      "field": "search",
      "operator": "contains",
      "value": "john"
    },
    {
      "field": "fromDate",
      "operator": "gte", 
      "value": "2024-01-01"
    },
    {
      "field": "toDate",
      "operator": "lte",
      "value": "2024-12-31"
    },
    {
      "field": "search",
      "operator": "eq",
      "value": "active"
    },
    {
      "field": "search", 
      "operator": "eq",
      "value": "pending"
    }
  ]
}
```

## Functions Available

### `mapQueryParamsToPgwModule(clientParams: QueryParams): QueryParamsPgwModuleApi`
Maps client QueryParams to PGW Module format.

### `serializePgwModuleParams(pgwParams: QueryParamsPgwModuleApi): Record<string, unknown>`
Serializes PGW Module params to plain object for API request.

### `requestToPgwModuleApiWithQuery<T>(event, endpoint, queryParams, method)`
Makes API request with automatic query parameter mapping.

## Field Mapping Configuration

To add new field mappings, update the `mapFieldNameToPgwModule()` function:

```typescript
function mapFieldNameToPgwModule(clientField: string): string {
  const fieldMapping: Record<string, string> = {
    'created_date': 'fromDate',
    'updated_date': 'toDate', 
    'supplier_id': 'supplierId',
    // Add your mappings here
  }
  
  return fieldMapping[clientField] || clientField
}
```

## Notes

- The PGW Module API expects POST requests for listing with query parameters
- Sorting format: `field+` for ascending, `field-` for descending, separated by `;`
- Date ranges and search terms are converted to filters
- Only valid PGW fields (`search`, `fromDate`, `toDate`, `supplierId`) are allowed in filters
