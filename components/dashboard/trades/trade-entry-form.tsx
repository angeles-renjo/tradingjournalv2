"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Card, CardContent } from "@/components/ui/card";
import { ScreenshotPreview } from "./screenshot-preview";
import { createTrade, uploadTradeScreenshots } from "@/lib/actions/trades";
import { cn } from "@/lib/utils";
import {
  INITIAL_FORM_STATE,
  SETUP_TYPES,
  type TradeFormProps,
  type TradeFormState,
} from "@/types/trade-form";
import {
  calculateRiskReward,
  validateTradeForm,
  parseTradeData,
} from "@/lib/utils/trade-form";

export function TradeEntryForm({ userId, onTradeCreated }: TradeFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TradeFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
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
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate form
      const validationErrors = validateTradeForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setError(Object.values(validationErrors)[0]);
        setLoading(false);
        return;
      }

      // Parse trade data
      let tradeData = parseTradeData(formData, userId);

      // Upload screenshots if any
      if (formData.screenshots.length > 0) {
        const screenshotUrls = await uploadTradeScreenshots(
          userId,
          formData.screenshots
        );
        tradeData = { ...tradeData, screenshots: screenshotUrls };
      }

      // Create trade
      await createTrade(tradeData);

      // Success handling
      setSuccess(true);
      setFormData(INITIAL_FORM_STATE);
      setPreviewUrls([]);

      // Notify parent
      if (onTradeCreated) {
        await onTradeCreated();
      }

      // Close dialog after delay
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <PlusCircle className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">New Trade</h3>
                <p className="text-sm text-gray-500">
                  Record your latest trade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="setupType" className="text-right">
                Setup *
              </Label>
              <Select
                name="setupType"
                value={formData.setupType || ""}
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
