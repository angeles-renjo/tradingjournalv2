"use server";

import { createClient } from "@/utils/supabase/server";
import type { TradeInsertData, Trade, ApiError } from "@/types";
import { revalidatePath } from "next/cache";

export async function createTrade(data: TradeInsertData): Promise<Trade> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw { message: "Not authenticated", code: "AUTH_ERROR" } as ApiError;
  }

  const { data: trade, error } = await supabase
    .from("trades")
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  revalidatePath("/protected");
  return trade as Trade;
}

export async function getTradesByUser(userId: string): Promise<Trade[]> {
  const supabase = await createClient();
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  return trades as Trade[];
}

export async function uploadTradeScreenshots(
  userId: string,
  files: File[]
): Promise<string[]> {
  const supabase = await createClient();

  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split(".").pop() || "";
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from("trade-screenshots")
      .upload(filePath, file);

    if (error) {
      throw {
        message: error.message,
        code: "STORAGE_ERROR",
        details: error,
      } as ApiError;
    }

    return supabase.storage.from("trade-screenshots").getPublicUrl(filePath)
      .data.publicUrl;
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw {
      message: "Failed to upload screenshots",
      code: "STORAGE_ERROR",
      details: error,
    } as ApiError;
  }
}
export async function updateTrade(
  tradeId: string,
  data: Partial<TradeInsertData>
): Promise<Trade> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw { message: "Not authenticated", code: "AUTH_ERROR" } as ApiError;
  }

  const { data: trade, error } = await supabase
    .from("trades")
    .update(data)
    .eq("id", tradeId)
    .eq("user_id", user.id) // Security check
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  revalidatePath("/protected");
  return trade as Trade;
}

export async function deleteTrade(tradeId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw { message: "Not authenticated", code: "AUTH_ERROR" } as ApiError;
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("user_id", user.id); // Security check

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  revalidatePath("/protected");
}
