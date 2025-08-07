# PGW Module API Integration Guide

This document provides comprehensive instructions for developers on how to make API requests to the PGW Module API, using the Banks List implementation as a reference example.

## Overview

The PGW Module API integration follows a layered architecture:
1. **Frontend Component** - Makes requests to our server API
2. **Server API Endpoint** - Proxies requests to PGW Module API
3. **PGW Module API Logic** - Handles request transformation and authentication
4. **Composable API Function** - Provides a clean interface for frontend consumption

## Architecture Flow

```
Frontend Component (Vue) 
    ↓ (calls composable)
Composable API Function (useBankApi.ts)
    ↓ (makes request to server endpoint)
Server API Endpoint (list.get.ts)
    ↓ (uses logic layer)
PGW Module API Logic (pgw_module_api_logic.ts)
    ↓ (makes external request)
PGW Module API (External Service)
```

## Step-by-Step Implementation Guide

### 1. Create Server API Endpoint

Create a server endpoint that acts as a proxy to the PGW Module API.

**Example: `/server/api/pgw-module/bank/list.get.ts`**

```typescript
import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'
import type { Bank } from '~/models/bank'
import type { ApiResponse, PgwModuleResponseList } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<Bank[]>> => {
  try {
    // Call the PGW Module API using the logic layer
    const response = await requestToPgwModuleApi<PgwModuleResponseList<Bank>>(
      event, 
      PGW_MODULE_API_ENDPOINTS.BANK.GET_BY_WALLET_SERVICE, 
      'GET'
    )

    console.log('Response from PGW Module API:', response)
    const banks = response.result || []

    // Transform PGW Module response to our standard API response format
    return {
      code: 'SUCCESS',
      message: 'Banks retrieved successfully',
      total_records: response.param.rowCount,
      total_pages: response.param.pageCount,
      page: response.param.pageIndex,
      page_size: response.param.pageSize,
      data: banks,
    }
  } catch (error) {
    console.error('Error in banks API:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    // Return standardized error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to retrieve banks',
        data: null,
      },
    })
  }
})
```

**Key Points:**
- Use `defineEventHandler` for Nuxt server routes
- Import and use `requestToPgwModuleApi` from the logic layer
- Transform the PGW Module response to match our standard API response format
- Handle errors appropriately and return standardized error responses

### 2. Create Composable API Function

Create a composable that provides a clean interface for frontend components.

**Example: `/app/composables/api/useBankApi.ts`**

```typescript
import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { Bank } from '~/models/bank'
import type { ApiResponse, QueryParams } from '~/models/baseModel'

export const useBankApi = () => {
  const { execute } = useApiExecutor()

  /**
   * Get list of banks with optional filtering and pagination
   */
  const getBanks = async (query?: QueryParams): Promise<ApiResponse<Bank[]>> => {
    const response = await execute<Bank[]>(() =>
      $fetch<ApiResponse<Bank[]>>('/api/pgw-module/bank/list', {
        method: 'GET',
        query,
      })
    )
    
    // Handle unsuccessful responses
    if (response.code !== 'SUCCESS') {
      return {
        code: 'ERROR',
        message: 'Failed to retrieve banks',
        data: [],
        total_records: 0,
        total_pages: 0,
        page: 1,
        page_size: 25,
      }
    }
    
    return response
  }

  return {
    getBanks,
    // ... other API functions
  }
}
```

**Key Points:**
- Use `useApiExecutor` for consistent error handling and request management
- Return standardized `ApiResponse` format
- Provide fallback values for failed requests
- Export all API functions from the composable

### 3. Use in Frontend Component

Implement the API call in your Vue component.

**Example: Frontend component usage**

```typescript
<script setup lang="ts">
import { useBankApi } from '~/composables/api/useBankApi'
import type { QueryParams } from '~/models/baseModel'
import type { BankListTableFetchResult } from '~/components/tables/table'

const { getBanks } = useBankApi()
const errorHandler = useErrorHandler()

// Fetch function for table component
const fetchBanks = async (params?: QueryParams): Promise<BankListTableFetchResult | undefined> => {
  try {
    const data = await getBanks(params)
    return {
      data: data.data,
      total_page: data.total_pages || 0,
      total_record: data.total_records || 0,
    }
  } catch (error: unknown) {
    // Show error notification to user
    errorHandler.handleApiError(error)
  }
}
</script>
```

**Key Points:**
- Import the composable API function
- Use proper error handling with `useErrorHandler`
- Transform the response to match your component's expected format
- Handle loading states appropriately

## PGW Module API Logic Layer

The `requestToPgwModuleApi` function in `/server/logic/pgw_module_api_logic.ts` handles:

### Features

1. **Query Parameter Mapping**: Automatically maps our QueryParams to PGW Module format
2. **Authentication**: Adds Bearer token from the user's session
3. **Error Handling**: Standardized error handling and response transformation
4. **Request Timeout**: 30-second timeout for all requests
5. **Logging**: Comprehensive logging for debugging

### Query Parameter Handling

The logic automatically detects and transforms query parameters for list endpoints:

```typescript
// Input QueryParams format
const query = {
  page: 1,
  page_size: 25,
  search: 'ACLEDA',
  filters: { active: 1 }
}

// Automatically transformed to PGW Module format
const pgwParams = {
  pageIndex: 1,
  pageSize: 25,
  searchTerm: 'ACLEDA',
  filterConditions: [{ field: 'active', value: 1 }]
}
```

## Best Practices

### 1. Error Handling

Always implement proper error handling at all layers:

```typescript
// In server endpoint
try {
  const response = await requestToPgwModuleApi(/* ... */)
  return response
} catch (error) {
  console.error('Error in API:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error'
  })
}

// In composable
const response = await execute(() => $fetch(/* ... */))
if (response.code !== 'SUCCESS') {
  // Return fallback data
}

// In component
try {
  const data = await apiFunction()
  return data
} catch (error) {
  errorHandler.handleApiError(error)
}
```

### 2. Type Safety

Always use proper TypeScript types:

```typescript
// Define your model types
interface Bank {
  id: string
  name: string
  active: boolean
  // ... other properties
}

// Use generic types in API calls
const response = await requestToPgwModuleApi<PgwModuleResponseList<Bank>>(
  event,
  endpoint,
  'GET'
)
```

### 3. Response Transformation

Always transform PGW Module responses to our standard format:

```typescript
// PGW Module format
const pgwResponse = {
  result: [...],
  param: {
    rowCount: 100,
    pageCount: 10,
    pageIndex: 1,
    pageSize: 10
  }
}

// Our standard format
const standardResponse = {
  code: 'SUCCESS',
  message: 'Data retrieved successfully',
  data: pgwResponse.result,
  total_records: pgwResponse.param.rowCount,
  total_pages: pgwResponse.param.pageCount,
  page: pgwResponse.param.pageIndex,
  page_size: pgwResponse.param.pageSize
}
```

### 4. Logging

Add appropriate logging for debugging:

```typescript
console.log('Requesting PGW Module API:', {
  endpoint,
  method,
  params: sanitizedParams // Don't log sensitive data
})
```

## Common Patterns

### For List Endpoints (GET with pagination)

1. Create server endpoint with `defineEventHandler`
2. Use `requestToPgwModuleApi` with 'GET' method
3. Transform response pagination data
4. Handle query parameters automatically

### For Detail Endpoints (GET by ID)

1. Extract ID from route parameters
2. Make direct API call to PGW Module
3. Return single entity response

### For Create/Update Endpoints (POST/PUT)

1. Extract body data from request
2. Transform data to PGW Module format
3. Use `requestToPgwModuleApi` with appropriate method
4. Return success/error response

## File Structure

```
server/
  api/
    pgw-module/
      bank/
        list.get.ts          # List endpoint
        [id].get.ts          # Detail endpoint
        index.post.ts        # Create endpoint
        [id].put.ts          # Update endpoint
  logic/
    pgw_module_api_logic.ts  # Core logic layer
  utils/
    pgw-module-api-endpoints.ts # Endpoint definitions

app/
  composables/
    api/
      useBankApi.ts          # API composable
  models/
    bank.ts                  # Type definitions
  pages/
    organization/
      banks/
        index.vue            # List page component
```

## Testing

Test your implementation at each layer:

1. **Server Endpoint**: Test with tools like Postman or curl
2. **Composable**: Test in component or with unit tests
3. **Component**: Test user interactions and error scenarios

## Troubleshooting

### Common Issues

1. **Query Parameter Mapping**: Ensure your QueryParams match the expected format
2. **Authentication**: Verify Bearer token is properly passed
3. **Response Format**: Check that PGW Module response matches expected structure
4. **Error Handling**: Implement proper error handling at all layers

### Debug Logging

Enable debug logging to trace request flow:

```typescript
console.log('Frontend request:', params)
console.log('Server endpoint called:', endpoint)
console.log('PGW Module request:', url)
console.log('PGW Module response:', response)
```

This guide should help you implement consistent and reliable PGW Module API integrations throughout the application.
