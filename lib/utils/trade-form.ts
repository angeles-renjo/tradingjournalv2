// utils/trade-form-utils.ts
import { TradeFormState, ValidationErrors } from "../../types/trade-form-type";

export const validateTradeForm = (data: TradeFormState): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Required fields
  if (!data.instrument) errors.instrument = "Instrument is required";
  if (!data.direction) errors.direction = "Direction is required";
  if (!data.entryPrice) errors.entryPrice = "Entry price is required";
  if (!data.exitPrice) errors.exitPrice = "Exit price is required";
  if (!data.positionSize) errors.positionSize = "Position size is required";
  if (!data.setupType) errors.setupType = "Setup type is required";
  if (!data.entryDateTime) errors.entryDateTime = "Entry date/time is required";
  if (!data.exitDateTime) errors.exitDateTime = "Exit date/time is required";

  // Numeric validation
  const numericFields = [
    "entryPrice",
    "exitPrice",
    "positionSize",
    "stopLoss",
    "takeProfit",
  ];
  numericFields.forEach((field) => {
    if (
      data[field as keyof TradeFormState] &&
      isNaN(parseFloat(data[field as keyof TradeFormState] as string))
    ) {
      errors[field] = `${field} must be a valid number`;
    }
  });

  // Date validation
  if (new Date(data.exitDateTime) < new Date(data.entryDateTime)) {
    errors.exitDateTime = "Exit date must be after entry date";
  }

  return errors;
};

export const calculateRiskReward = (formData: TradeFormState): string => {
  if (!formData.stopLoss || !formData.takeProfit) return "N/A";

  const entry = parseFloat(formData.entryPrice);
  const stop = parseFloat(formData.stopLoss);
  const target = parseFloat(formData.takeProfit);

  if (isNaN(entry) || isNaN(stop) || isNaN(target)) return "N/A";

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);

  if (risk === 0) return "N/A";

  return (reward / risk).toFixed(2);
};

// constants/trade-form-constants.ts
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
