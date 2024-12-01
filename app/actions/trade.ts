"use server";

import { createClient } from "@/utils/supabase/server";
import type { TradeInsertData, TradeSetupType, TradeDirection } from "@/types";

/**
 * Trade-related actions
 */
export async function createTrade(data: TradeInsertData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Add the user_id to the trade data
  const tradeWithUserId = {
    ...data,
    user_id: user.id,
  };

  const { data: trade, error } = await supabase
    .from("trades")
    .insert([tradeWithUserId])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return trade;
}

export async function getTradesByUser(userId: string) {
  const supabase = await createClient();

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) throw new Error(error.message);
  return trades;
}

export async function getTradeAnalytics(userId: string) {
  const supabase = await createClient();

  // Fetch all trades for the user
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageRR: 0,
      totalProfit: 0,
      bestTrade: null,
      worstTrade: null,
    };
  }

  // Calculate analytics
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
    bestTrade: sortedTrades[0],
    worstTrade: sortedTrades[sortedTrades.length - 1],
  };
}

/**
 * Psychology-related actions
 */
export async function createTradeJournalEntry({
  tradeId,
  userId,
  emotions,
  notes,
  lessons,
}: {
  tradeId: string;
  userId: string;
  emotions: {
    preTrade: string;
    postTrade: string;
    confidenceLevel: number;
  };
  notes: string;
  lessons: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trade_psychology")
    .insert([
      {
        trade_id: tradeId,
        pre_trade_emotion: emotions.preTrade,
        post_trade_emotion: emotions.postTrade,
        confidence_level: emotions.confidenceLevel,
        notes,
        lessons_learned: lessons,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * File-related actions
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

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("trade-screenshots").getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
}
