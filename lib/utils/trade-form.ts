import type { TradeFormState, ValidationErrors } from "@/types/trade-form";
import type { TradeInsertData, TradeSetupType } from "@/types";

export function calculateRiskReward(data: TradeFormState): number | null {
  if (!data.stopLoss || !data.takeProfit) return null;
  const entry = parseFloat(data.entryPrice);
  const stop = parseFloat(data.stopLoss);
  const target = parseFloat(data.takeProfit);

  if (isNaN(entry) || isNaN(stop) || isNaN(target)) return null;
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  return Number((reward / risk).toFixed(2));
}

export function validateTradeForm(data: TradeFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.instrument.trim()) {
    errors.instrument = "Instrument is required";
  }

  if (!data.setupType) {
    errors.setupType = "Setup type is required";
  }

  const numericFields = {
    entryPrice: "Entry price",
    exitPrice: "Exit price",
    positionSize: "Position size",
  };

  Object.entries(numericFields).forEach(([field, label]) => {
    const value = parseFloat(data[field as keyof typeof numericFields]);
    if (isNaN(value) || value <= 0) {
      errors[field] = `${label} must be a positive number`;
    }
  });

  // Optional numeric fields
  if (data.stopLoss && isNaN(parseFloat(data.stopLoss))) {
    errors.stopLoss = "Stop loss must be a number";
  }

  if (data.takeProfit && isNaN(parseFloat(data.takeProfit))) {
    errors.takeProfit = "Take profit must be a number";
  }

  const entryDate = new Date(data.entryDateTime);
  const exitDate = new Date(data.exitDateTime);

  if (isNaN(entryDate.getTime())) {
    errors.entryDateTime = "Invalid entry date";
  }

  if (isNaN(exitDate.getTime())) {
    errors.exitDateTime = "Invalid exit date";
  }

  if (entryDate > exitDate) {
    errors.exitDateTime = "Exit date must be after entry date";
  }

  return errors;
}

export function parseTradeData(
  formData: TradeFormState,
  userId: string
): TradeInsertData {
  if (!formData.setupType) {
    throw new Error("Setup type is required");
  }

  const entryPrice = parseFloat(formData.entryPrice);
  const exitPrice = parseFloat(formData.exitPrice);
  const positionSize = parseFloat(formData.positionSize);
  const stopLoss = formData.stopLoss ? parseFloat(formData.stopLoss) : null;
  const takeProfit = formData.takeProfit
    ? parseFloat(formData.takeProfit)
    : null;

  if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(positionSize)) {
    throw new Error("Invalid numeric values");
  }

  const profitLoss =
    formData.direction === "long"
      ? (exitPrice - entryPrice) * positionSize
      : (entryPrice - exitPrice) * positionSize;

  const profitLossPercentage =
    ((exitPrice - entryPrice) / entryPrice) *
    100 *
    (formData.direction === "long" ? 1 : -1);

  return {
    user_id: userId,
    instrument: formData.instrument,
    direction: formData.direction,
    entry_price: entryPrice,
    exit_price: exitPrice,
    position_size: positionSize,
    stop_loss: stopLoss,
    take_profit: takeProfit,
    setup_type: formData.setupType as TradeSetupType,
    profit_loss: Number(profitLoss.toFixed(2)),
    profit_loss_percentage: Number(profitLossPercentage.toFixed(2)),
    entry_date: formData.entryDateTime,
    exit_date: formData.exitDateTime,
    notes: formData.notes || null,
    screenshots: [], // This will be updated after upload
  };
}
