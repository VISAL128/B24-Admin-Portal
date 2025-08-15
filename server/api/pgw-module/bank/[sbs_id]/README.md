# Bank Accounts API Endpoint

This endpoint retrieves bank accounts by supplier bank service ID.

## Endpoint

`GET /api/pgw-module/bank/{sbs_id}/accounts`

## Parameters

- `sbs_id` (string, required): Supplier bank service ID

## Response

Returns an `ApiResponse<BankAccount[]>` with the following structure:

```typescript
{
  code: 'SUCCESS' | 'ERROR',
  message: string,
  data: BankAccount[]
}
```

## BankAccount Interface

```typescript
interface BankAccount {
  id: string
  bank_id: string
  code: string
  name: string
  title: string
  account_type_id: string
  status: string
  currency_id: string
  is_default: boolean
  created_date: string
  updated_date: string
}
```

## Usage Example

```typescript
const accounts = await $fetch('/api/pgw-module/bank/sbs_123/accounts')
```

## Notes

- Currently returns mock data for development
- When PGW Module API is ready, uncomment the API call code and remove mock data
- The endpoint handles error cases and returns empty array on failure
