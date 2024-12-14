import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BasicFields } from "./fields/basic-fields";
import { PriceFields } from "./fields/price-fields";
import { DateFields } from "./fields/date-fields";
import { SetupFields } from "./fields/setup-fields";
import { ScreenshotFields } from "./fields/screenshot-field";
import { NotesField } from "./fields/notes-field";
import { useTradeForm } from "@/hooks/use-trade-form";
import { validateTradeForm } from "@/lib/utils/trade-form";
import type { TradeFormState } from "@/types/trade-form-type";

interface BaseTradeFormProps {
  initialData: TradeFormState;
  onSubmit: (data: TradeFormState) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function BaseTradeForm({
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting = false,
  onCancel,
}: BaseTradeFormProps) {
  const [error, setError] = useState("");
  const { formData, previewUrls, handlers } = useTradeForm(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Submit handler called");
    e.preventDefault();
    setError("");

    console.log("Form Data:", formData);

    const validationErrors = validateTradeForm(formData);
    console.log("Validation Errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    // Add this try-catch block to actually submit the form
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
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
        <BasicFields formData={formData} handlers={handlers} />

        <PriceFields formData={formData} handlers={handlers} />

        <SetupFields formData={formData} handlers={handlers} />

        <DateFields formData={formData} handlers={handlers} />

        <NotesField formData={formData} handlers={handlers} />

        <ScreenshotFields
          formData={formData}
          previewUrls={previewUrls}
          handlers={handlers}
        />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
