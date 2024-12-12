"use client";

import { X } from "lucide-react";

interface ScreenshotPreviewProps {
  urls: string[];
  onRemove: (index: number) => void;
}

export function ScreenshotPreview({ urls, onRemove }: ScreenshotPreviewProps) {
  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {urls.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={`Preview ${index + 1}`}
            className="w-full h-40 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
