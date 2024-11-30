"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface TradeEntryFormProps {
  userId: string;
}

const TradeEntryForm = ({ userId }: TradeEntryFormProps) => {
  const [formData, setFormData] = useState({
    instrument: "",
    direction: "long",
    entryPrice: "",
    exitPrice: "",
    positionSize: "",
    stopLoss: "",
    takeProfit: "",
    setupType: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();

      // Parse numeric values
      const entryPrice = parseFloat(formData.entryPrice);
      const exitPrice = parseFloat(formData.exitPrice);
      const positionSize = parseFloat(formData.positionSize);
      const stopLoss = formData.stopLoss ? parseFloat(formData.stopLoss) : null;
      const takeProfit = formData.takeProfit
        ? parseFloat(formData.takeProfit)
        : null;

      // Validate numeric values
      if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(positionSize)) {
        throw new Error("Invalid numeric values");
      }

      // Calculate P&L
      const profitLoss =
        formData.direction === "long"
          ? (exitPrice - entryPrice) * positionSize
          : (entryPrice - exitPrice) * positionSize;

      const profitLossPercentage =
        ((exitPrice - entryPrice) / entryPrice) *
        100 *
        (formData.direction === "long" ? 1 : -1);

      const tradeData = {
        user_id: userId,
        instrument: formData.instrument,
        direction: formData.direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        position_size: positionSize,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        setup_type: formData.setupType,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
      };

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
      setFormData({
        instrument: "",
        direction: "long",
        entryPrice: "",
        exitPrice: "",
        positionSize: "",
        stopLoss: "",
        takeProfit: "",
        setupType: "",
      });
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card rounded-lg shadow"
    >
      <div className="p-6">
        <div className="text-2xl font-semibold mb-6">New Trade Entry</div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
            Trade saved successfully!
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instrument">Trading Instrument</Label>
            <Input
              id="instrument"
              name="instrument"
              placeholder="e.g., EURUSD, AAPL, BTC/USD"
              value={formData.instrument}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Trade Direction</Label>
            <select
              id="direction"
              name="direction"
              className="w-full p-2 rounded-md border bg-background"
              value={formData.direction}
              onChange={handleChange}
              required
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                name="entryPrice"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                name="exitPrice"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="positionSize">Position Size</Label>
            <Input
              id="positionSize"
              name="positionSize"
              type="number"
              step="any"
              placeholder="Position size"
              value={formData.positionSize}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                name="stopLoss"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.stopLoss}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                name="takeProfit"
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.takeProfit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupType">Setup Type</Label>
            <select
              id="setupType"
              name="setupType"
              className="w-full p-2 rounded-md border bg-background"
              value={formData.setupType}
              onChange={handleChange}
              required
            >
              <option value="">Select setup type</option>
              <option value="breakout">Breakout</option>
              <option value="trend-following">Trend Following</option>
              <option value="reversal">Reversal</option>
              <option value="range">Range</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 bg-muted/40 rounded-b-lg">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Trade"}
        </Button>
      </div>
    </form>
  );
};

export default TradeEntryForm;
