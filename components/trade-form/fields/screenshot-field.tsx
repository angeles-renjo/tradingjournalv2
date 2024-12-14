import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type {
  TradeFormState,
  TradeFormHandlers,
} from "@/types/trade-form-type";

interface ScreenshotFieldsProps {
  formData: TradeFormState;
  previewUrls: string[];
  handlers: Pick<TradeFormHandlers, "handleFileChange" | "removeImage">;
}

export function ScreenshotFields({
  previewUrls,
  handlers,
}: ScreenshotFieldsProps) {
  const { handleFileChange, removeImage } = handlers;

  const getImageLoader = (src: string) => {
    // Check if the URL is from Supabase
    if (src.includes("supabase")) {
      return {
        src,
        width: 300,
        height: 300,
        unoptimized: process.env.NODE_ENV === "development",
      };
    }
    // For local file previews
    return {
      src,
      width: 300,
      height: 300,
      unoptimized: true, // Always unoptimized for local file previews
    };
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      <Label htmlFor="screenshots" className="text-right pt-2 col-span-2">
        Screenshots
      </Label>

      {/* Modern File Upload Area */}
      <div className="col-span-4">
        <div className="relative group">
          <Input
            id="screenshots"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer opacity-0 absolute inset-0 w-full h-full z-10"
          />
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg px-3 py-4 hover:border-muted-foreground/50 transition-colors group-focus-within:border-primary">
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span className="font-medium">Choose files</span>
              <span className="text-xs">or drag and drop</span>
              <span className="text-xs">Max 5MB • JPG, PNG, GIF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Preview Grid */}
      <div className="col-span-6">
        <div
          className={`grid grid-cols-4 gap-3 transition-all duration-200 ease-in-out ${
            previewUrls.length === 0 ? "opacity-0" : "opacity-100"
          }`}
        >
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted shadow-sm transition-all duration-200 group-hover:shadow-md">
                <div className="relative w-full h-full">
                  {/* Error boundary for image loading */}
                  <div className="relative w-full h-full">
                    {url && (
                      <Image
                        {...getImageLoader(url)}
                        alt={`Screenshot ${index + 1}`}
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="(max-width: 300px) 100vw, 300px"
                        priority={index < 4} // Prioritize loading for first 4 images
                        onError={(e) => {
                          // Fallback for failed image loads
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = "/placeholder-image.png"; // Add a placeholder image to your public folder
                        }}
                      />
                    )}
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Image number badge */}
              <div className="absolute bottom-1 right-1 text-xs font-medium text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
