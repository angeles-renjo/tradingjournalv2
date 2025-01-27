// lib/utils/csv.ts
import Papa from 'papaparse';
import { Trade, TradeDirection, TradeSetupType } from '@/types';
import { columns } from '@/components/journal/table-columns';

export class CSVGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CSVGenerationError';
  }
}

const formatDateValue = (value: any): string => {
  if (!value) return '';
  try {
    // Handle string arrays (e.g., from form data)
    if (Array.isArray(value)) {
      value = value[0];
    }
    // If already a string in ISO format, return as is
    if (typeof value === 'string') {
      return value;
    }
    // Otherwise, format it
    const date = new Date(value);
    return date.toISOString();
  } catch {
    return '';
  }
};

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.toFixed(2);
};

export const formatDataForCSV = (trades: Trade[]): any[] => {
  try {
    return trades.map((trade) => {
      const formattedTrade: Record<string, any> = {};

      columns.forEach((column) => {
        const value = trade[column.key];

        switch (column.key) {
          case 'entry_date':
          case 'exit_date':
          case 'created_at':
          case 'updated_at':
            formattedTrade[column.label] = formatDateValue(value);
            break;

          case 'profit_loss':
          case 'entry_price':
          case 'exit_price':
          case 'position_size':
          case 'stop_loss':
          case 'take_profit':
          case 'profit_loss_percentage':
            formattedTrade[column.label] = formatNumber(value as number);
            break;

          default:
            if (Array.isArray(value)) {
              formattedTrade[column.label] = value.join(', ');
            } else {
              formattedTrade[column.label] = value ?? '';
            }
        }
      });

      return formattedTrade;
    });
  } catch (error) {
    console.error('Error formatting trade data:', error);
    throw new CSVGenerationError('Failed to format trade data for CSV');
  }
};

export const generateCSV = (trades: Trade[]): string => {
  try {
    const formattedData = formatDataForCSV(trades);
    const columnHeaders = columns.map((col) => col.label);

    const csv = Papa.unparse(formattedData, {
      delimiter: ',',
      header: true,
      skipEmptyLines: true,
      columns: columnHeaders,
    });

    return csv;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new CSVGenerationError('Failed to generate CSV');
  }
};

export const validateTradeData = (trades: any[]): boolean => {
  if (!Array.isArray(trades) || trades.length === 0) {
    throw new CSVGenerationError('Invalid or empty trade data provided');
  }

  return trades.every((trade) => {
    try {
      return (
        trade.entry_date &&
        trade.exit_date &&
        trade.instrument &&
        trade.direction &&
        trade.entry_price !== undefined &&
        trade.position_size !== undefined &&
        trade.user_id
      );
    } catch (error) {
      return false;
    }
  });
};
