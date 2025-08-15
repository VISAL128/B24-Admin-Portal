export enum ColumnType {
  Text = 'text',
  Number = 'number',
  Currency = 'currency',
  Amount = 'amount',
  Date = 'date',
  DateTime = 'datetime',
  Boolean = 'boolean',
}
enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}
enum FilterOperator {
  Equals = 'equals',
  NotEquals = 'not_equals',
  Contains = 'contains',
  NotContains = 'not_contains',
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
  In = 'in',
  NotIn = 'not_in',
}

enum FilterOperatorPgwModule {
  Equals = 'eq',
  NotEquals = 'neq',
  Contains = 'contains',
  DoesNotContain = 'doesnotcontain',
  GreaterThan = 'gt',
  GreaterThanOrEqualTo = 'gte',
  LessThan = 'lt',
  LessThanOrEqualTo = 'lte',
  StartsWith = 'startswith',
  EndsWith = 'endswith',
}

enum FilterType {
  Text = 'text',
  Number = 'number',
  DateTime = 'datetime',
  Select = 'select',
  MultiSelect = 'multi_select',
}

enum PartyType {
  Supplier = 2,
  Bank = 1,
}

enum Status {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

enum SettlementStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed'
}
enum FeeType {
  Fixed = 'fixed',
  Percentage = 'percentage',
}

enum Currency {
  USD = 'USD',
  KHR = 'KHR',
}

enum SettlementHistoryStatus {
  // All = 'all',
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed'
}

enum BankServiceStatus {
  Active = 1,
  Inactive = 2
}


export enum TransactionStatus {
  Cancel = 'cancel',
  Error = 'error',
  Expire = 'expire',
  Failed = 'failed',
  Pending = 'pending',
  Reversed = 'reversed',
  Success = 'success',
}

export enum TransactionType {
  Activate = 'activate',
  Checkout = 'checkout',
  Deeplink = 'deeplink',
  Deposit = 'deposit',
  DirectDebit = 'direct_debit',
  PayBill = 'pay_bill',
  PayPersonalBill = 'pay_personal_bill',
  Proxy = 'proxy',
  QrPay = 'qr_pay',
  WalletPayment = 'wallet_payment',
  WalletTopup = 'wallet_topup',
}

export enum SettlementType {
  HUB = 'HUB',
  DIRECT = 'DIRECT',
}
export enum VoidPaymentRequestStatus {
  Pending = 'pending'
}

export enum RepushToBillerType {
  Webhook = 'webhook',
  RMQ = 'rmq',
}

export enum PeriodType {
  Today = 1,
  ThisWeek = 2,
  ThisMonth = 3,
  Custom = 4,
}

export enum TransactionAllocationStatus {
  Completed = 'completed',
  Pending = 'pending',
}

export { BankServiceStatus, Currency, FeeType, FilterOperator, FilterOperatorPgwModule, FilterType, PartyType, SettlementHistoryStatus, SettlementStatus, SortDirection, Status };

