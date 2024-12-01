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
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Profile interface
export interface Profile extends BaseEntity {
  user_id: string;
  username: string;
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
  notes?: string;
  entryDateTime: string;
  exitDateTime: string;
  screenshots: File[];
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
  notes: string | null;
  screenshots: string[];
}

// Trade data for insertion
export type TradeInsertData = Omit<Trade, "id" | "created_at" | "updated_at">;

// Analytics interface
export interface Analytics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
}

// Props interfaces
export interface TradeEntryFormProps {
  userId: string;
  onTradeAdded?: () => void;
}

export interface DashboardProps {
  userId: string;
}

// Utility interfaces for recent trades
export interface RecentTrade {
  id: string;
  entry_date: string;
  instrument: string;
  direction: string;
  profit_loss: number;
}

// Database response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
  } | null;
}

// Trade psychology interfaces
export interface TradePsychology extends BaseEntity {
  trade_id: string;
  pre_trade_emotion: string;
  post_trade_emotion: string;
  confidence_level: number;
  notes: string;
  lessons_learned: string;
}

// Error handling interfaces
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type TradeValidationFields = {
  [K in keyof TradeFormData]: boolean;
};

// Optional trade fields type
export type OptionalTradeFields =
  | "stop_loss"
  | "take_profit"
  | "notes"
  | "screenshots";
