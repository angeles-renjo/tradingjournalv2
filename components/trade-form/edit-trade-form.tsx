// components/trade-form/edit-trade-form.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BaseTradeForm } from "./base-trade-form";
import { updateTrade, uploadTradeScreenshots } from "@/lib/actions/trades";
import type { TradeFormState } from "@/types/trade-form-type";
import type { Trade, TradeUpdateData } from "@/types";

interface EditTradeFormProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export function EditTradeForm({
  trade,
  open,
  onOpenChange,
  onSuccess,
}: EditTradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Convert trade data to form state
  const initialData: TradeFormState = {
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
    screenshots: trade.screenshots,
  };

  const handleSubmit = async (formData: TradeFormState) => {
    setIsSubmitting(true);
    try {
      // Upload new screenshots if any
      let updatedScreenshotUrls = [...trade.screenshots];
      const newScreenshots = formData.screenshots.filter(
        (s) => s instanceof File
      ) as File[];

      if (newScreenshots.length > 0) {
        const newScreenshotUrls = await uploadTradeScreenshots(
          trade.user_id,
          newScreenshots
        );
        updatedScreenshotUrls = [
          ...updatedScreenshotUrls,
          ...newScreenshotUrls,
        ];
      } else {
        // If no new screenshots, use existing screenshots
        updatedScreenshotUrls = formData.screenshots.filter(
          (s) => typeof s === "string"
        ) as string[];
      }

      // Prepare update data
      const updateData: TradeUpdateData = {
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
        setup_type: formData.setupType || "other",
        notes: formData.notes || null,
        entry_date: formData.entryDateTime,
        exit_date: formData.exitDateTime,
        screenshots: updatedScreenshotUrls,
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

      if (onSuccess) {
        await onSuccess();
      }
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update trade";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] my-auto"
        style={{
          position: "fixed",
          top: "50%",
          transform: "translate(-50%, -50%)",
          overflowY: "auto",
        }}
      >
        <DialogHeader className="top-0 bg-background z-10 pb-4">
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update the details of your trade. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div>
          <BaseTradeForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitButtonText="Save Changes"
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
