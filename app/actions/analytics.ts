"use server";

import { createClient } from "@/utils/supabase/server";
import type { Analytics, ApiError } from "@/types";

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

  if (!trades?.length) {
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
