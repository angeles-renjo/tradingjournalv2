"use server";

import { createClient } from "@/utils/supabase/server";
import type {
  TradeInsertData,
  Trade,
  Analytics,
  TradePsychology,
  ApiError,
} from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Creates a new trade entry
 * @param data Trade data to be inserted
 * @throws {ApiError} If user is not authenticated or insertion fails
 * @returns {Promise<Trade>} The created trade
 */
export async function createTrade(data: TradeInsertData): Promise<Trade> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw {
      message: "Not authenticated",
      code: "AUTH_ERROR",
    } as ApiError;
  }

  const tradeWithUserId = {
    ...data,
    user_id: user.id,
  };

  const { data: trade, error } = await supabase
    .from("trades")
    .insert([tradeWithUserId])
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  // Revalidate the dashboard page to refresh data
  revalidatePath("/protected");

  return trade as Trade;
}

/**
 * Retrieves trades for a specific user
 * @param userId The ID of the user
 * @throws {ApiError} If retrieval fails
 * @returns {Promise<Trade[]>} Array of trades
 */
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

/**
 * Calculates and retrieves analytics for a user's trades
 * @param userId The ID of the user
 * @throws {ApiError} If retrieval fails
 * @returns {Promise<Analytics>} Trade analytics
 */
export async function getTradeAnalytics(userId: string): Promise<Analytics> {
  const supabase = await createClient();

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      totalProfit: 0,
      bestTrade: null,
      worstTrade: null,
    };
  }

  const winningTrades = trades.filter((trade) => trade.profit_loss > 0);
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit_loss, 0);
  const winRate = (winningTrades.length / trades.length) * 100;

  const profitSum = winningTrades.reduce(
    (sum, trade) => sum + trade.profit_loss,
    0
  );
  const lossSum = trades
    .filter((trade) => trade.profit_loss < 0)
    .reduce((sum, trade) => sum + Math.abs(trade.profit_loss), 0);
  const profitFactor = lossSum === 0 ? profitSum : profitSum / lossSum;

  // Sort trades by profit/loss
  const sortedTrades = [...trades].sort(
    (a, b) => b.profit_loss - a.profit_loss
  );

  return {
    totalTrades: trades.length,
    winRate: Number(winRate.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    bestTrade: sortedTrades[0] || null,
    worstTrade: sortedTrades[sortedTrades.length - 1] || null,
  };
}

/**
 * Interface for trade journal entry parameters
 */
interface TradeJournalEntryParams {
  tradeId: string;
  userId: string;
  emotions: {
    preTrade: string;
    postTrade: string;
    confidenceLevel: number;
  };
  notes: string;
  lessons: string;
}

/**
 * Creates a new trade journal entry
 * @param params Trade journal entry parameters
 * @throws {ApiError} If creation fails
 * @returns {Promise<TradePsychology>} The created journal entry
 */
export async function createTradeJournalEntry(
  params: TradeJournalEntryParams
): Promise<TradePsychology> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trade_psychology")
    .insert([
      {
        trade_id: params.tradeId,
        pre_trade_emotion: params.emotions.preTrade,
        post_trade_emotion: params.emotions.postTrade,
        confidence_level: params.emotions.confidenceLevel,
        notes: params.notes,
        lessons_learned: params.lessons,
      },
    ])
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  return data as TradePsychology;
}

/**
 * Uploads trade screenshots to storage
 * @param userId The ID of the user
 * @param files Array of files to upload
 * @throws {ApiError} If upload fails
 * @returns {Promise<string[]>} Array of public URLs for the uploaded files
 */
export async function uploadTradeScreenshots(
  userId: string,
  files: File[]
): Promise<string[]> {
  const supabase = await createClient();

  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split(".").pop() || "";
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("trade-screenshots")
      .upload(filePath, file);

    if (error) {
      throw {
        message: error.message,
        code: "STORAGE_ERROR",
        details: error,
      } as ApiError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("trade-screenshots").getPublicUrl(filePath);

    return publicUrl;
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
