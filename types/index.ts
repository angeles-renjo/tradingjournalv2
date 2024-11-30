// types/index.ts

// Trade direction type
export type TradeDirection = "long" | "short";

// Trade setup types
export type TradeSetupType =
  | "breakout"
  | "trend-following"
  | "reversal"
  | "range"
  | "other";

// Trading experience levels
export type TradingExperience = "beginner" | "intermediate" | "advanced";

// Base interface for common fields
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Profile interface
export interface Profile extends BaseEntity {
  trading_experience: TradingExperience;
  preferred_markets: string[];
}

// Trade form data interface
export interface TradeFormData {
  instrument: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  positionSize: string;
  stopLoss?: string;
  takeProfit?: string;
  setupType: TradeSetupType | "";
}

// Trade database record interface
export interface Trade extends BaseEntity {
  user_id: string;
  instrument: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  position_size: number;
  stop_loss: number | null;
  take_profit: number | null;
  setup_type: TradeSetupType;
  profit_loss: number;
  profit_loss_percentage: number;
  entry_date: string;
  exit_date: string;
}

// Trade data for insertion
export type TradeInsertData = Omit<Trade, "id" | "created_at" | "updated_at">;

// Database response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
  } | null;
}

// Props interfaces
export interface TradeEntryFormProps {
  userId: string;
}

// Optional trade fields
export type OptionalTradeFields = "stop_loss" | "take_profit";

// Utility type for trade validation
export type TradeValidationFields = {
  [K in keyof TradeFormData]: boolean;
};
