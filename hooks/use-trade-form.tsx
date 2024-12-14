// hooks/use-trade-form.ts
import { useState } from "react";
import type {
  TradeFormState,
  TradeFormHandlers,
} from "@/types/trade-form-type";

export function useTradeForm(initialData: TradeFormState) {
  const [formData, setFormData] = useState<TradeFormState>(initialData);
  const [previewUrls, setPreviewUrls] = useState<string[]>(() => {
    if (
      "screenshots" in initialData &&
      Array.isArray(initialData.screenshots) &&
      initialData.screenshots.length > 0 &&
      typeof initialData.screenshots[0] === "string"
    ) {
      return initialData.screenshots as string[];
    }
    return [];
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

    // Update form data with new files
    setFormData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...validFiles],
    }));

    // Generate preview URLs for new files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrls((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
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

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    formData,
    previewUrls,
    handlers: {
      handleChange,
      handleFileChange,
      handleDateSelect,
      removeImage,
      setFormData,
    },
  };
}
