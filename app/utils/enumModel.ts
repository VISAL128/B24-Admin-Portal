export enum ColumnType {
  Text = 'text',
  Number = 'number',
  Currency = 'currency',
  Date = 'date',
  DateTime = 'datetime',
  Boolean = 'boolean',
}
enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}
enum FilterOperator {
  Equals = 'equals',
  NotEquals = 'not_equals',
  Contains = 'contains',
  NotContains = 'not_contains',
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
  In = 'in',
  NotIn = 'not_in'
}
enum FilterType {
  Text = 'text',
  Number = 'number',
  DateTime = 'datetime',
  Select = 'select',
  MultiSelect = 'multi_select'
}

enum PartyType {
  Supplier = 2,
  Bank = 1
}

enum Status {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed'
}

enum SettlementStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed'
}

enum SettlementHistoryStatus {
  All = 'all',
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed'
}

export { SortDirection, FilterOperator, FilterType, PartyType, Status, SettlementStatus, SettlementHistoryStatus };
