# Digital Wallet API Specification

## Overview

This document outlines the API endpoints required to support the Digital Wallet Management Portal UI. The API follows REST principles and returns JSON responses.

## Base URL

```
https://api.bill24.com/v1
```

## Authentication

All API endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

## Common Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2025-07-14T10:30:00Z",
  "errors": null
}
```

## Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "timestamp": "2025-07-14T10:30:00Z",
  "errors": [
    {
      "field": "fieldName",
      "code": "ERROR_CODE",
      "message": "Detailed error message"
    }
  ]
}
```

---

## 1. Wallet Management Endpoints

### 1.1 Get User Wallets

Retrieve all wallets for the authenticated user.

**Endpoint:** `GET /wallets`

**Response:**

```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "wallet_123",
        "type": "personal",
        "name": "Personal Wallet",
        "status": "active",
        "currencies": [
          {
            "code": "KHR",
            "balance": 2450000.0,
            "available_balance": 2450000.0,
            "pending_balance": 0.0,
            "account_number": "85512345678901",
            "is_primary": true
          },
          {
            "code": "USD",
            "balance": 580.5,
            "available_balance": 580.5,
            "pending_balance": 0.0,
            "account_number": "85587654321098",
            "is_primary": false
          }
        ],
        "last_transaction_date": "2024-01-15T14:30:00Z",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z"
      }
    ],
    "wallet_types": [
      {
        "id": "personal",
        "name": "Personal Wallet",
        "description": "Individual personal wallet",
        "icon": "i-heroicons-user",
        "color_scheme": {
          "primary": "#3b82f6",
          "secondary": "#1e40af",
          "gradient": "from-blue-500 to-indigo-600"
        }
      },
      {
        "id": "business",
        "name": "Business Wallet",
        "description": "Business and corporate wallet",
        "icon": "i-heroicons-building-office",
        "color_scheme": {
          "primary": "#10b981",
          "secondary": "#059669",
          "gradient": "from-emerald-500 to-teal-600"
        }
      },
      {
        "id": "savings",
        "name": "Savings Wallet",
        "description": "Long-term savings wallet",
        "icon": "i-heroicons-banknotes",
        "color_scheme": {
          "primary": "#f59e0b",
          "secondary": "#d97706",
          "gradient": "from-amber-500 to-orange-500"
        }
      },
      {
        "id": "investment",
        "name": "Investment Wallet",
        "description": "Investment and trading wallet",
        "icon": "i-heroicons-chart-bar",
        "color_scheme": {
          "primary": "#8b5cf6",
          "secondary": "#7c3aed",
          "gradient": "from-purple-500 to-violet-600"
        }
      }
    ]
  }
}
```

### 1.2 Get Specific Wallet

Retrieve details for a specific wallet.

**Endpoint:** `GET /wallets/{wallet_id}`

**Parameters:**

- `wallet_id` (string, required): Wallet identifier

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wallet_123",
    "type": "personal",
    "name": "Personal Wallet",
    "status": "active",
    "currencies": [
      {
        "code": "KHR",
        "balance": 2450000.0,
        "available_balance": 2450000.0,
        "pending_balance": 0.0,
        "account_number": "85512345678901",
        "is_primary": true,
        "last_transaction": {
          "id": "txn_456",
          "amount": 50000.0,
          "type": "credit",
          "description": "Payment received",
          "timestamp": "2024-01-15T14:30:00Z"
        }
      }
    ]
  }
}
```

### 1.3 Refresh Wallet Balances

Force refresh of wallet balances from upstream sources.

**Endpoint:** `POST /wallets/{wallet_id}/refresh`

**Response:**

```json
{
  "success": true,
  "data": {
    "refresh_id": "refresh_789",
    "status": "completed",
    "updated_balances": [
      {
        "currency": "KHR",
        "previous_balance": 2400000.0,
        "current_balance": 2450000.0,
        "updated_at": "2024-01-15T15:00:00Z"
      }
    ]
  },
  "message": "Wallet balances refreshed successfully"
}
```

---

## 2. Transaction Summary Endpoints

### 2.1 Get Transaction Summary

Retrieve transaction summaries for specified periods.

**Endpoint:** `GET /wallets/{wallet_id}/summary`

**Query Parameters:**

- `currency` (string, optional): Currency code (KHR, USD). Default: all currencies
- `periods` (array, optional): Time periods to include. Options: today, week, month. Default: all

**Response:**

```json
{
  "success": true,
  "data": {
    "wallet_id": "wallet_123",
    "wallet_type": "personal",
    "summary": {
      "today": {
        "date": "2025-01-15",
        "total_transactions": 3,
        "currencies": {
          "KHR": {
            "total_received": 24500.0,
            "total_settlement": 195000.0,
            "total_sent": 0.0,
            "net_amount": 219500.0
          },
          "USD": {
            "total_received": 5.95,
            "total_settlement": 47.5,
            "total_sent": 0.0,
            "net_amount": 53.45
          }
        }
      },
      "week": {
        "date_range": "2025-01-13 to 2025-01-19",
        "total_transactions": 18,
        "currencies": {
          "KHR": {
            "total_received": 185200.0,
            "total_settlement": 425500.0,
            "total_sent": 50000.0,
            "net_amount": 560700.0
          },
          "USD": {
            "total_received": 45.2,
            "total_settlement": 103.75,
            "total_sent": 12.0,
            "net_amount": 136.95
          }
        }
      },
      "month": {
        "date_range": "2025-01-01 to 2025-01-31",
        "total_transactions": 67,
        "currencies": {
          "KHR": {
            "total_received": 725000.0,
            "total_settlement": 1250000.0,
            "total_sent": 200000.0,
            "net_amount": 1775000.0
          },
          "USD": {
            "total_received": 176.8,
            "total_settlement": 304.75,
            "total_sent": 50.0,
            "net_amount": 431.55
          }
        }
      }
    },
    "generated_at": "2025-01-15T16:00:00Z"
  }
}
```

---

## 3. Transaction History Endpoints

### 3.1 Get Transaction History

Retrieve paginated transaction history for a wallet.

**Endpoint:** `GET /wallets/{wallet_id}/transactions`

**Query Parameters:**

- `page` (integer, optional): Page number. Default: 1
- `limit` (integer, optional): Items per page. Default: 20, Max: 100
- `currency` (string, optional): Filter by currency (KHR, USD)
- `type` (string, optional): Filter by transaction type (credit, debit, transfer)
- `status` (string, optional): Filter by status (completed, pending, failed)
- `date_from` (string, optional): Start date (ISO 8601)
- `date_to` (string, optional): End date (ISO 8601)
- `search` (string, optional): Search in description or reference

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "reference": "TXN20250115001",
        "type": "credit",
        "status": "completed",
        "amount": 50000.0,
        "currency": "KHR",
        "description": "Payment received from merchant",
        "category": "payment",
        "sender": {
          "name": "Merchant ABC",
          "account": "****5678",
          "type": "business"
        },
        "receiver": {
          "name": "User Name",
          "account": "****8901",
          "type": "personal"
        },
        "fee": {
          "amount": 0.0,
          "currency": "KHR",
          "type": "none"
        },
        "exchange_rate": null,
        "metadata": {
          "merchant_id": "merchant_456",
          "order_id": "order_789",
          "payment_method": "qr_code"
        },
        "created_at": "2025-01-15T14:30:00Z",
        "completed_at": "2025-01-15T14:30:15Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_amount": 2450000.0,
      "currency": "KHR",
      "transaction_count": 150
    }
  }
}
```

---

## 4. Fund Management Endpoints

### 4.1 Top Up Wallet

Add funds to a wallet.

**Endpoint:** `POST /wallets/{wallet_id}/topup`

**Request Body:**

```json
{
  "amount": 100000.0,
  "currency": "KHR",
  "payment_method": "bank_transfer",
  "payment_details": {
    "bank_account_id": "bank_123",
    "reference": "TOPUP20250115001"
  },
  "description": "Wallet top-up via bank transfer"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_topup_123",
    "reference": "TOPUP20250115001",
    "status": "pending",
    "amount": 100000.0,
    "currency": "KHR",
    "estimated_completion": "2025-01-15T16:00:00Z",
    "payment_instructions": {
      "bank_name": "ABA Bank",
      "account_number": "123456789",
      "account_name": "Bill24 Topup Account",
      "reference_code": "TOPUP20250115001"
    }
  },
  "message": "Top-up request created successfully"
}
```

### 4.2 Transfer Funds

Transfer funds between wallets or to external accounts.

**Endpoint:** `POST /wallets/{wallet_id}/transfer`

**Request Body:**

```json
{
  "amount": 50000.0,
  "currency": "KHR",
  "recipient": {
    "type": "wallet", // "wallet" or "external"
    "wallet_id": "wallet_456", // if type is "wallet"
    "account_number": "85598765432109", // if type is "external"
    "bank_code": "ABA" // if type is "external"
  },
  "description": "Transfer to business wallet",
  "reference": "TRF20250115001"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_transfer_123",
    "reference": "TRF20250115001",
    "status": "completed",
    "amount": 50000.0,
    "currency": "KHR",
    "fee": {
      "amount": 1000.0,
      "currency": "KHR"
    },
    "sender_balance": 2400000.0,
    "recipient": {
      "name": "Business Wallet",
      "account": "****2109"
    },
    "completed_at": "2025-01-15T15:30:00Z"
  },
  "message": "Transfer completed successfully"
}
```

---

## 5. Currency and Exchange Endpoints

### 5.1 Get Exchange Rates

Retrieve current exchange rates.

**Endpoint:** `GET /currencies/exchange-rates`

**Query Parameters:**

- `base` (string, optional): Base currency. Default: KHR
- `target` (string, optional): Target currency. If not provided, returns all rates

**Response:**

```json
{
  "success": true,
  "data": {
    "base_currency": "KHR",
    "rates": {
      "USD": 0.000244,
      "EUR": 0.000227,
      "THB": 0.008536
    },
    "last_updated": "2025-01-15T15:00:00Z",
    "source": "central_bank"
  }
}
```

### 5.2 Currency Conversion

Convert amount between currencies.

**Endpoint:** `POST /currencies/convert`

**Request Body:**

```json
{
  "amount": 100000.0,
  "from_currency": "KHR",
  "to_currency": "USD"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "original_amount": 100000.0,
    "original_currency": "KHR",
    "converted_amount": 24.4,
    "converted_currency": "USD",
    "exchange_rate": 0.000244,
    "rate_timestamp": "2025-01-15T15:00:00Z"
  }
}
```

---

## 6. User Preferences Endpoints

### 6.1 Get User Preferences

Retrieve user's wallet and display preferences.

**Endpoint:** `GET /user/preferences`

**Response:**

```json
{
  "success": true,
  "data": {
    "default_wallet_id": "wallet_123",
    "preferred_currency": "KHR",
    "display_settings": {
      "theme": "light",
      "language": "en",
      "currency_format": "symbol",
      "date_format": "DD/MM/YYYY",
      "timezone": "Asia/Phnom_Penh"
    },
    "notification_settings": {
      "email_notifications": true,
      "push_notifications": true,
      "sms_notifications": false,
      "transaction_alerts": true,
      "balance_alerts": true
    }
  }
}
```

### 6.2 Update User Preferences

Update user's preferences.

**Endpoint:** `PUT /user/preferences`

**Request Body:**

```json
{
  "default_wallet_id": "wallet_456",
  "preferred_currency": "USD",
  "display_settings": {
    "theme": "dark",
    "language": "km"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updated_fields": ["default_wallet_id", "preferred_currency", "display_settings"],
    "updated_at": "2025-01-15T16:00:00Z"
  },
  "message": "Preferences updated successfully"
}
```

---

## 7. Notification Endpoints

### 7.1 Get Notifications

Retrieve user notifications.

**Endpoint:** `GET /notifications`

**Query Parameters:**

- `page` (integer, optional): Page number. Default: 1
- `limit` (integer, optional): Items per page. Default: 20
- `type` (string, optional): Filter by type (transaction, balance, security, system)
- `status` (string, optional): Filter by status (read, unread)

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "transaction",
        "title": "Payment Received",
        "message": "You received 50,000 KHR from Merchant ABC",
        "status": "unread",
        "priority": "normal",
        "data": {
          "transaction_id": "txn_123",
          "amount": 50000.0,
          "currency": "KHR"
        },
        "created_at": "2025-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 25,
      "total_pages": 2
    },
    "unread_count": 5
  }
}
```

---

## 8. Security and Audit Endpoints

### 8.1 Get Account Security Log

Retrieve security-related activities.

**Endpoint:** `GET /security/logs`

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "event_type": "login",
        "status": "success",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "location": "Phnom Penh, Cambodia",
        "timestamp": "2025-01-15T14:00:00Z"
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 400  | Bad Request - Invalid parameters         |
| 401  | Unauthorized - Invalid or expired token  |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource not found           |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation errors |
| 429  | Too Many Requests - Rate limit exceeded  |
| 500  | Internal Server Error                    |

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Transaction endpoints: 10 requests per minute
- Security endpoints: 5 requests per minute

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `wallet.balance_updated`
- `transaction.completed`
- `transaction.failed`
- `transfer.completed`
- `topup.completed`

### Webhook Payload Example

```json
{
  "event": "transaction.completed",
  "data": {
    "transaction_id": "txn_123",
    "wallet_id": "wallet_123",
    "amount": 50000.0,
    "currency": "KHR",
    "type": "credit"
  },
  "timestamp": "2025-01-15T14:30:00Z",
  "signature": "sha256=..."
}
```

This API specification provides comprehensive coverage for all the functionality displayed in your digital wallet UI, including wallet management, transaction handling, currency operations, and user preferences.
