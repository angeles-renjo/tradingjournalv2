"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { BaseTradeForm } from "./base-trade-form";
import { createTrade } from "@/lib/actions/trades";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_FORM_STATE } from "@/types/trade-form-type";
import type { TradeFormState } from "@/types/trade-form-type";
import type { TradeCreateInput } from "@/types";

interface TradeEntryFormProps {
  userId: string;
  onTradeCreated?: () => Promise<void>;
}

export function TradeEntryForm({
  userId,
  onTradeCreated,
}: TradeEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: TradeFormState) => {
    setIsSubmitting(true);
    try {
      // Prepare trade data
      const tradeData: TradeCreateInput = {
        user_id: userId,
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
        entry_date: formData.entryDateTime,
        exit_date: formData.exitDateTime,
        notes: formData.notes || null,
        screenshots: formData.screenshots.filter(
          (s) => s instanceof File
        ) as File[],
      };

      // Create trade
      const { data, error } = await createTrade(tradeData);

      if (error) throw new Error(error.message);

      if (!data) throw new Error("No data returned from trade creation");

      // Success handling
      toast({
        title: "Success",
        description: "Trade created successfully",
      });

      // Notify parent
      if (onTradeCreated) {
        await onTradeCreated();
      }

      // Reset form and close dialog
      setOpen(false);
    } catch (err) {
      console.error("Trade submission error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create trade";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <PlusCircle className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">New Trade</h3>
              <p className="text-sm text-gray-500">Record your latest trade</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <DialogTitle>New Trade Entry</DialogTitle>
          <DialogDescription>
            Enter the details of your trade. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="z-99">
          <BaseTradeForm
            initialData={INITIAL_FORM_STATE}
            onSubmit={handleSubmit}
            submitButtonText="Save Trade"
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
