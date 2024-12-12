"use server";

import { createClient } from "@/lib/utils/supabase/server";
import type { TradeInsertData, Trade, ApiError } from "@/types";
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
