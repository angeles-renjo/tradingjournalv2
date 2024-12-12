//lib/utils/utils.ts
import { createClient } from "@/lib/utils/supabase/server";
import type { ApiError } from "@/types";

/**
 * Get authenticated user or throw error
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw {
      message: error?.message || "No authenticated user found",
      code: "AUTH_ERROR",
    } as ApiError;
  }

  return user;
}

/**
 * Handle Supabase error responses
 */
export function handleDatabaseError(error: any): ApiError {
  return {
    message: error?.message || "Database operation failed",
    code: "DB_ERROR",
    details: error,
  };
}

/**
 * Format number to fixed decimal places with type safety
 */
export function formatNumber(value: number, decimals: number = 2): number {
  return Number(value.toFixed(decimals));
}

/**
 * Safe date conversion
 */
export function toISOString(date: string | Date): string {
  try {
    return new Date(date).toISOString();
  } catch (error) {
    throw {
      message: "Invalid date format",
      code: "VALIDATION_ERROR",
    } as ApiError;
  }
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends object>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw {
      message: `Missing required fields: ${missingFields.join(", ")}`,
      code: "VALIDATION_ERROR",
    } as ApiError;
  }
}
