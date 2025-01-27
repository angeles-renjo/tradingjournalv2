// lib/actions/export.ts
import { Trade, TradeDirection, TradeSetupType } from '@/types';
import {
  formatDataForCSV,
  generateCSV,
  validateTradeData,
  CSVGenerationError,
} from '../utils/csv';

export interface ExportOptions {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeAnalysis: boolean;
  format: 'CSV' | 'PDF';
}

export async function exportData(options: ExportOptions) {
  try {
    const trades = await fetchTradesForExport(options.dateRange);

    if (!validateTradeData(trades)) {
      throw new CSVGenerationError('Invalid trade data structure');
    }

    const csv = generateCSV(trades);

    return {
      success: true,
      data: csv,
      metadata: {
        rows: trades.length,
        generated: new Date().toISOString(),
        type: 'CSV',
      },
    };
  } catch (error) {
    console.error('Error in exportData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        generated: new Date().toISOString(),
        type: 'ERROR',
      },
    };
  }
}

async function fetchTradesForExport({
  startDate,
  endDate,
}: ExportOptions['dateRange']): Promise<Trade[]> {
  // Mock trade data matching complete Trade interface with correct types
  const now = new Date().toISOString();

  return [
    {
      id: '1',
      user_id: '1',
      instrument: 'AAPL',
      direction: 'long' as TradeDirection,
      entry_price: 150.5,
      exit_price: 155.75,
      position_size: 100,
      stop_loss: 148.0,
      take_profit: 160.0,
      profit_loss: 525.0,
      profit_loss_percentage: 3.5,
      setup_type: 'breakout' as TradeSetupType,
      notes: 'Strong momentum trade',
      entry_date: now,
      exit_date: now,
      screenshots: [],
      created_at: now,
      updated_at: now,
    },
  ];
}
