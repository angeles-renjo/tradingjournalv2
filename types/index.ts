// Basic types
export type TradeDirection = "long" | "short";

export type TradeSetupType =
  | "breakout"
  | "trend-following"
  | "reversal"
  | "range"
  | "other";

// Add this constant
export const SETUP_TYPES: TradeSetupType[] = [
  "breakout",
  "trend-following",
  "reversal",
  "range",
  "other",
];

// Base interface for database entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Trade related interfaces
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

export type TradeInsertData = Omit<Trade, "id" | "created_at" | "updated_at">;

// Analytics interfaces
export interface Analytics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  goalTarget: number | null;
}

// Goal related types
export type GoalStatus = "active" | "achieved" | "failed";

export interface Goal extends BaseEntity {
  user_id: string;
  target_amount: number;
  achieved: boolean;
  achieved_at: string | null;
  start_date: string;
  end_date: string | null;
  status: GoalStatus;
  current_progress?: number;
}

export interface GoalInput {
  target_amount: number;
  start_date: string;
  end_date?: string | null;
}

export interface GoalResponse {
  data: Goal | null;
  error: string | null;
}

export interface GoalsListResponse {
  data: Goal[] | null;
  error: string | null;
}

// Component Props
export interface GoalProgressProps {
  initialGoals: Goal[];
  currentProfit: number;
}

// UI State types
export interface AlertInfo {
  show: boolean;
  type: "success" | "error";
  message: string;
}

export interface GoalFormData {
  targetAmount: string;
  startDate: string;
  endDate: string;
}

// Error handling
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Add new type for edit form
export interface TradeUpdateData {
  id: string;
  instrument: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  position_size: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  setup_type: TradeSetupType;
  notes?: string | null;
  entry_date: string;
  exit_date: string;
  screenshots: string[];
}

export interface TradeCreateInput {
  user_id: string;
  instrument: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  position_size: number;
  stop_loss: number | null;
  take_profit: number | null;
  setup_type: TradeSetupType;
  entry_date: string;
  exit_date: string;
  notes: string | null;
  screenshots?: File[];
}
