"use server";

import { createClient } from "@/lib/utils/supabase/server";
import type {
  TradeInsertData,
  Trade,
  ApiError,
  TradeDirection,
  TradeSetupType,
  TradeUpdateData,
} from "@/types";
import { revalidatePath } from "next/cache";

export async function createTrade(data: TradeInsertData): Promise<{
  data: Trade | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { data: trade, error } = await supabase
      .from("trades")
      .insert([data])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: "DB_ERROR",
          details: error,
        },
      };
    }

    revalidatePath("/protected");
    return { data: trade as Trade, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export async function getTradesByUser(userId: string): Promise<{
  data: Trade[] | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: "DB_ERROR",
          details: error,
        },
      };
    }

    return { data: trades as Trade[], error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export async function uploadTradeScreenshots(
  userId: string,
  files: File[]
): Promise<string[]> {
  try {
    const supabase = await createClient();

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop() || "";
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(filePath, fileData, {
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("trade-screenshots")
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw {
      message: "Failed to upload screenshots",
      code: "STORAGE_ERROR",
      details: error,
    } as ApiError;
  }
}

export async function deleteTrade(id: string): Promise<{
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("trades").delete().eq("id", id);

    if (error) {
      return {
        error: {
          message: error.message,
          code: "DB_ERROR",
          details: error,
        },
      };
    }

    revalidatePath("/protected/journal");
    return { error: null };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export async function getFilteredTrades(
  userId: string,
  filters: {
    direction?: TradeDirection | "all";
    setupType?: TradeSetupType | "all";
    dateRange?: {
      from: Date | null;
      to: Date | null;
    };
    profitRange?: {
      min: string;
      max: string;
    };
  }
): Promise<{
  data: Trade[] | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    let query = supabase.from("trades").select("*").eq("user_id", userId);

    // Apply filters
    if (filters.direction && filters.direction !== "all") {
      query = query.eq("direction", filters.direction);
    }

    if (filters.setupType && filters.setupType !== "all") {
      query = query.eq("setup_type", filters.setupType);
    }

    if (filters.dateRange?.from) {
      query = query.gte("entry_date", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange?.to) {
      query = query.lte("entry_date", filters.dateRange.to.toISOString());
    }

    if (filters.profitRange?.min) {
      query = query.gte("profit_loss", parseFloat(filters.profitRange.min));
    }

    if (filters.profitRange?.max) {
      query = query.lte("profit_loss", parseFloat(filters.profitRange.max));
    }

    const { data: trades, error } = await query.order("entry_date", {
      ascending: false,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: "DB_ERROR",
          details: error,
        },
      };
    }

    return { data: trades as Trade[], error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export async function updateTrade(
  id: string,
  data: TradeUpdateData
): Promise<{
  data: Trade | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();

    // Calculate profit/loss before update
    const profitLoss =
      (data.exit_price - data.entry_price) * data.position_size;
    const profitLossPercentage =
      ((data.exit_price - data.entry_price) / data.entry_price) * 100;

    // Prepare update data
    const updateData = {
      ...data,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage,
    };

    const { data: trade, error } = await supabase
      .from("trades")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: "DB_ERROR",
          details: error,
        },
      };
    }

    revalidatePath("/protected");
    return { data: trade as Trade, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}
