"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            {error.message || "An unexpected error occurred"}
          </div>
          <button
            onClick={reset}
            className="mt-4 bg-destructive/10 text-destructive px-3 py-2 rounded-md hover:bg-destructive/20 transition-colors"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
