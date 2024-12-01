"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  TradeFormData,
  TradeEntryFormProps,
  TradeInsertData,
  TradeSetupType,
} from "@/types";

const INITIAL_FORM_STATE: TradeFormData = {
  instrument: "",
  direction: "long",
  entryPrice: "",
  exitPrice: "",
  positionSize: "",
  stopLoss: "",
  takeProfit: "",
  setupType: "",
};

const SETUP_TYPES: TradeSetupType[] = [
  "breakout",
  "trend-following",
  "reversal",
  "range",
  "other",
];

export function TradeEntryForm({ userId }: TradeEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TradeFormData>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseTradeData = (formData: TradeFormData): TradeInsertData => {
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
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage,
      entry_date: new Date().toISOString(),
      exit_date: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();
      const tradeData = parseTradeData(formData);

      console.log("Submitting trade data:", tradeData);

      const { data, error: supabaseError } = await supabase
        .from("trades")
        .insert([tradeData])
        .select()
        .single();

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw new Error(supabaseError.message);
      }

      console.log("Trade saved successfully:", data);

      setSuccess(true);
      setFormData(INITIAL_FORM_STATE);
      setTimeout(() => setOpen(false), 1500); // Close dialog after success message
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save trade";
      setError(`Error: ${errorMessage}`);
      console.error("Trade entry error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">New Trade</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Trade Entry</DialogTitle>
          <DialogDescription>
            Enter the details of your trade. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md">
              Trade saved successfully!
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instrument" className="text-right">
                Instrument *
              </Label>
              <Input
                id="instrument"
                name="instrument"
                placeholder="e.g., EURUSD, AAPL, BTC/USD"
                className="col-span-3"
                value={formData.instrument}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direction" className="text-right">
                Direction *
              </Label>
              <Select
                name="direction"
                value={formData.direction}
                onValueChange={(value) =>
                  handleChange({ target: { name: "direction", value } } as any)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entryPrice" className="text-right">
                  Entry *
                </Label>
                <Input
                  id="entryPrice"
                  name="entryPrice"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="col-span-3"
                  value={formData.entryPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exitPrice" className="text-right">
                  Exit *
                </Label>
                <Input
                  id="exitPrice"
                  name="exitPrice"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="col-span-3"
                  value={formData.exitPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="positionSize" className="text-right">
                Size *
              </Label>
              <Input
                id="positionSize"
                name="positionSize"
                type="number"
                step="any"
                placeholder="Position size"
                className="col-span-3"
                value={formData.positionSize}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stopLoss" className="text-right">
                  Stop
                </Label>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="col-span-3"
                  value={formData.stopLoss}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="takeProfit" className="text-right">
                  Target
                </Label>
                <Input
                  id="takeProfit"
                  name="takeProfit"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="col-span-3"
                  value={formData.takeProfit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="setupType" className="text-right">
                Setup *
              </Label>
              <Select
                name="setupType"
                value={formData.setupType}
                onValueChange={(value) =>
                  handleChange({ target: { name: "setupType", value } } as any)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select setup type" />
                </SelectTrigger>
                <SelectContent>
                  {SETUP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() +
                        type.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
