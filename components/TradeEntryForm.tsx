"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type {
  TradeFormData,
  TradeEntryFormProps,
  TradeInsertData,
  TradeSetupType,
  TradeDirection,
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
  notes: "",
  entryDateTime: new Date().toISOString(),
  exitDateTime: new Date().toISOString(),
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

  const calculateRiskReward = (data: TradeFormData): number | null => {
    if (!data.stopLoss || !data.takeProfit) return null;

    const entry = parseFloat(data.entryPrice);
    const stop = parseFloat(data.stopLoss);
    const target = parseFloat(data.takeProfit);

    if (isNaN(entry) || isNaN(stop) || isNaN(target)) return null;

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);

    return Number((reward / risk).toFixed(2));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEntryDateSelect = (date: Date | undefined) => {
    if (date) {
      const currentEntry = new Date(formData.entryDateTime);
      date.setHours(currentEntry.getHours(), currentEntry.getMinutes());
      setFormData((prev) => ({
        ...prev,
        entryDateTime: date.toISOString(),
      }));
    }
  };

  const handleExitDateSelect = (date: Date | undefined) => {
    if (date) {
      const currentExit = new Date(formData.exitDateTime);
      date.setHours(currentExit.getHours(), currentExit.getMinutes());
      setFormData((prev) => ({
        ...prev,
        exitDateTime: date.toISOString(),
      }));
    }
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

    const riskRewardRatio = calculateRiskReward(formData);

    return {
      user_id: userId,
      instrument: formData.instrument,
      direction: formData.direction as TradeDirection,
      entry_price: entryPrice,
      exit_price: exitPrice,
      position_size: positionSize,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      setup_type: formData.setupType as TradeSetupType,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage,
      entry_date: formData.entryDateTime,
      exit_date: formData.exitDateTime,
      notes: formData.notes || null,
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

      const { data, error: supabaseError } = await supabase
        .from("trades")
        .insert([tradeData])
        .select()
        .single();

      if (supabaseError) throw new Error(supabaseError.message);

      setSuccess(true);
      setFormData(INITIAL_FORM_STATE);
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save trade";
      setError(`Error: ${errorMessage}`);
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entryDateTime" className="text-right">
                  Entry Date *
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.entryDateTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.entryDateTime ? (
                          format(new Date(formData.entryDateTime), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.entryDateTime)}
                        onSelect={handleEntryDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="mt-2"
                    value={format(new Date(formData.entryDateTime), "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value
                        .split(":")
                        .map(Number);
                      const date = new Date(formData.entryDateTime);
                      date.setHours(hours, minutes);
                      setFormData((prev) => ({
                        ...prev,
                        entryDateTime: date.toISOString(),
                      }));
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exitDateTime" className="text-right">
                  Exit Date *
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.exitDateTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.exitDateTime ? (
                          format(new Date(formData.exitDateTime), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.exitDateTime)}
                        onSelect={handleExitDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="mt-2"
                    value={format(new Date(formData.exitDateTime), "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value
                        .split(":")
                        .map(Number);
                      const date = new Date(formData.exitDateTime);
                      date.setHours(hours, minutes);
                      setFormData((prev) => ({
                        ...prev,
                        exitDateTime: date.toISOString(),
                      }));
                    }}
                    required
                  />
                </div>
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

            {/* Risk:Reward Display */}
            {formData.stopLoss && formData.takeProfit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3">
                  <span className="text-sm text-muted-foreground">
                    Risk:Reward Ratio: {calculateRiskReward(formData)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes field */}
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                className="col-span-3 min-h-[100px] p-2 rounded-md border"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Trade setup, market conditions, reasons for entry/exit..."
              />
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
