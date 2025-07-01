import { ColumnType } from '@/utils/enumModel';
import { format } from 'date-fns/format';
import { useCurrency } from '~/composables/utils/useCurrency';

// Helper to support nested accessors like "supplier.code"
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function formatColumnValue(
  type: ColumnType = ColumnType.Text,
  row: Record<string, any>,
  accessorKey: string,
  currencyKey?: string
): string {
  const value = getNestedValue(row, accessorKey);

  if (value === null || value === undefined || value === '') return '-';

  switch (type) {
    case ColumnType.Number: {
      const currency = currencyKey ? getNestedValue(row, currencyKey) : '';
      const isKHR = currency?.toUpperCase() === 'KHR';

      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: isKHR ? 0 : 2,
        maximumFractionDigits: isKHR ? 0 : 2,
      });
    }

    case ColumnType.Currency: {
      const currency = currencyKey
        ? getNestedValue(row, currencyKey) || 'USD'
        : 'USD';
      const isKHR = currency.toUpperCase() === 'KHR';

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: isKHR ? 0 : 2,
        maximumFractionDigits: isKHR ? 0 : 2,
      }).format(Number(value));
    }

    case ColumnType.Date: {
      const date = new Date(value);
      return isNaN(date.getTime()) ? '-' : format(date, 'dd-MM-yyyy');
    }

    case ColumnType.DateTime: {
      const date = new Date(value);
      return isNaN(date.getTime()) ? '-' : format(date, 'dd-MM-yyyy HH:mm');
    }

    case ColumnType.Text:
    default:
      return String(value);
  }
}