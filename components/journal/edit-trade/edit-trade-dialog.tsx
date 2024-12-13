"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditTradeForm } from "./edit-trade-form";
import type { Trade } from "@/types";

interface EditTradeDialogProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditTradeDialog({
  trade,
  open,
  onOpenChange,
  onSuccess,
}: EditTradeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>
        <EditTradeForm
          trade={trade}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
