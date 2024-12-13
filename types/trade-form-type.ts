// types/trade-form-types.ts
import type { TradeSetupType, TradeDirection } from "@/types";

export interface BaseTradeFormProps {
  initialData: TradeFormState;
  onSubmit: (data: TradeFormState) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export interface TradeFormState {
  instrument: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  positionSize: string;
  stopLoss?: string;
  takeProfit?: string;
  setupType: TradeSetupType | null;
  notes?: string;
  entryDateTime: string;
  exitDateTime: string;
  screenshots: (File | string)[]; // Allow both File objects and URLs
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface TradeFormHandlers {
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateSelect: (type: "entry" | "exit", date: Date | undefined) => void;
  removeImage: (index: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<TradeFormState>>;
}

export const INITIAL_FORM_STATE: TradeFormState = {
  instrument: "",
  direction: "long",
  entryPrice: "",
  exitPrice: "",
  positionSize: "",
  stopLoss: "",
  takeProfit: "",
  setupType: null,
  notes: "",
  entryDateTime: new Date().toISOString(),
  exitDateTime: new Date().toISOString(),
  screenshots: [],
};
