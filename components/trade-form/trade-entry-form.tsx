// components/trade-form/trade-entry-form.tsx
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
import { createTrade, uploadTradeScreenshots } from "@/lib/actions/trades";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_FORM_STATE } from "@/types/trade-form-type";
import type { TradeFormState } from "@/types/trade-form-type";
import type { TradeInsertData } from "@/types";

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
      // ... rest of the submit logic remains the same
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create trade";
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
        <DialogHeader className=" top-0 bg-background z-10 pb-4">
          <DialogTitle>New Trade Entry</DialogTitle>
          <DialogDescription>
            Enter the details of your trade. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div>
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
