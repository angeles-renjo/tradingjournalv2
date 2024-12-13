"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ScreenshotPreview } from "@/components/dashboard/trades/screenshot-preview";
import { updateTrade, uploadTradeScreenshots } from "@/lib/actions/trades";
import { cn } from "@/lib/utils";
import { TradeSetupType, type Trade } from "@/types";
import { calculateRiskReward, validateTradeForm } from "@/lib/utils/trade-form";
import { useToast } from "@/hooks/use-toast";
import { SETUP_TYPES, TradeFormState } from "@/types/trade-form";

interface EditTradeFormProps {
  trade: Trade;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditTradeForm({
  trade,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
  onCancel,
}: EditTradeFormProps) {
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>(trade.screenshots);

  // Initialize form data from trade
  const [formData, setFormData] = useState<TradeFormState>({
    instrument: trade.instrument,
    direction: trade.direction,
    entryPrice: trade.entry_price.toString(),
    exitPrice: trade.exit_price.toString(),
    positionSize: trade.position_size.toString(),
    stopLoss: trade.stop_loss?.toString() || "",
    takeProfit: trade.take_profit?.toString() || "",
    setupType: trade.setup_type,
    notes: trade.notes || "",
    entryDateTime: trade.entry_date,
    exitDateTime: trade.exit_date,
    screenshots: [], // Will hold new screenshots
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    setFormData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...validFiles],
    }));

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // If it's an existing screenshot (URL string)
    if (
      typeof previewUrls[index] === "string" &&
      !previewUrls[index].startsWith("data:")
    ) {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // If it's a new screenshot
      setFormData((prev) => ({
        ...prev,
        screenshots: prev.screenshots.filter((_, i) => i !== index),
      }));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDateSelect = (type: "entry" | "exit", date: Date | undefined) => {
    if (!date) return;
    const currentDate = new Date(
      type === "entry" ? formData.entryDateTime : formData.exitDateTime
    );
    date.setHours(currentDate.getHours(), currentDate.getMinutes());
    setFormData((prev) => ({
      ...prev,
      [type === "entry" ? "entryDateTime" : "exitDateTime"]: date.toISOString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form
      const validationErrors = validateTradeForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setError(Object.values(validationErrors)[0]);
        return;
      }

      // Upload new screenshots if any
      let updatedScreenshotUrls = [...trade.screenshots];
      if (formData.screenshots.length > 0) {
        const newScreenshotUrls = await uploadTradeScreenshots(
          trade.user_id,
          formData.screenshots
        );
        updatedScreenshotUrls = [
          ...updatedScreenshotUrls,
          ...newScreenshotUrls,
        ];
      }

      const updateData = {
        id: trade.id,
        instrument: formData.instrument,
        direction: formData.direction,
        entry_price: parseFloat(formData.entryPrice),
        exit_price: parseFloat(formData.exitPrice),
        position_size: parseFloat(formData.positionSize),
        stop_loss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        take_profit: formData.takeProfit
          ? parseFloat(formData.takeProfit)
          : null,
        setup_type: formData.setupType as TradeSetupType, // Cast to ensure type safety
        notes: formData.notes || null,
        entry_date: formData.entryDateTime,
        exit_date: formData.exitDateTime,
        screenshots: updatedScreenshotUrls,
        user_id: trade.user_id,
      };
      // Update trade
      const { error: updateError } = await updateTrade(trade.id, updateData);

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast({
        title: "Success",
        description: "Trade updated successfully",
      });

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update trade";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Instrument */}
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

        {/* Direction */}
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
            required
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

        {/* Entry/Exit Prices */}
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

        {/* Position Size */}
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

        {/* Stop Loss/Take Profit */}
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

        {/* Setup Type */}
        {/* Setup Type */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="setupType" className="text-right">
            Setup *
          </Label>
          <Select
            name="setupType"
            value={formData.setupType || ""} // Add fallback to empty string
            onValueChange={(value) =>
              handleChange({ target: { name: "setupType", value } } as any)
            }
            required
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

        {/* Entry/Exit Dates */}
        <div className="grid grid-cols-2 gap-4">
          {/* Entry Date/Time */}
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.entryDateTime)}
                    onSelect={(date) => handleDateSelect("entry", date)}
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

          {/* Exit Date/Time */}
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.exitDateTime)}
                    onSelect={(date) => handleDateSelect("exit", date)}
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

        {/* Notes */}
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

        {/* Screenshots */}
        <div className="grid grid-cols-4 gap-4">
          <Label htmlFor="screenshots" className="text-right pt-2">
            Screenshots
          </Label>
          <div className="col-span-3 space-y-4">
            <Input
              id="screenshots"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <div className="text-sm text-muted-foreground">
              Max file size: 5MB. Accepted formats: JPG, PNG, GIF
            </div>

            <ScreenshotPreview urls={previewUrls} onRemove={removeImage} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
