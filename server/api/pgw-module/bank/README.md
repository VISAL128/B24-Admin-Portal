# Bank API Endpoints

## Available Endpoints

### 1. GET `/api/pgw-module/bank/list`
- **Description**: Get banks from PGW Module API (current implementation)
- **Source**: `/get-current-bank-by-service-id/8`
- **Usage**: Existing bank list functionality

### 2. GET `/api/pgw-module/bank/tbanks`
- **Description**: Get TBanks from real API 
- **Source**: `http://172.16.81.141:22043/bank/list`
- **Usage**: Real bank list from external API
- **Query Parameters**: Supports standard QueryParams (pagination, filtering, etc.)

### 3. GET `/api/pgw-module/bank/service/[serviceId]`
- **Description**: Get banks by specific service ID
- **Usage**: Service-specific bank filtering

### 4. GET `/api/pgw-module/bank/[id]`
- **Description**: Get specific bank details by ID
- **Usage**: Individual bank information

## Usage Examples

### Using getTBanks in a component:

```typescript
import { useBankApi } from '~/composables/api/useBankApi'

const { getTBanks } = useBankApi()

// Get all TBanks
const banks = await getTBanks()

// Get TBanks with pagination
const banks = await getTBanks({
  page: 1,
  page_size: 25
})

// Get TBanks with search
const banks = await getTBanks({
  search: 'ABA',
  page: 1,
  page_size: 10
})
```

## Configuration

The real API endpoint is configured via environment variable:
- `PGW_MODULE_API_URL=http://172.16.81.141:22043`