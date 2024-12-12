import type { TradeSetupType, TradeDirection } from "@/types";

export interface TradeFormState {
  instrument: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  positionSize: string;
  stopLoss?: string;
  takeProfit?: string;
  setupType: TradeSetupType | null; // Changed from "" to null
  notes?: string;
  entryDateTime: string;
  exitDateTime: string;
  screenshots: File[];
}

export interface TradeFormProps {
  userId: string;
  onTradeCreated?: () => Promise<void>;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const SETUP_TYPES: TradeSetupType[] = [
  "breakout",
  "trend-following",
  "reversal",
  "range",
  "other",
];

export const INITIAL_FORM_STATE: TradeFormState = {
  instrument: "",
  direction: "long",
  entryPrice: "",
  exitPrice: "",
  positionSize: "",
  stopLoss: "",
  takeProfit: "",
  setupType: null, // Changed from "" to null
  notes: "",
  entryDateTime: new Date().toISOString(),
  exitDateTime: new Date().toISOString(),
  screenshots: [],
};
