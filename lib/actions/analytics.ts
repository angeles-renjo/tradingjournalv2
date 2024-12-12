"use server";

import { createClient } from "@/lib/utils/supabase/server";
import type { Analytics, ApiError, Trade } from "@/types";

/**
 * Get trade analytics for a user
 */
export async function getTradeAnalytics(userId: string): Promise<{
  data: Analytics | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId);

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

    if (!trades?.length) {
      return {
        data: {
          totalTrades: 0,
          winRate: 0,
          profitFactor: 0,
          totalProfit: 0,
          bestTrade: null,
          worstTrade: null,
          goalTarget: null,
        },
        error: null,
      };
    }

    // Calculate analytics
    const winningTrades = trades.filter((trade) => trade.profit_loss > 0);
    const losingTrades = trades.filter((trade) => trade.profit_loss < 0);

    const totalProfit = Number(
      trades.reduce((sum, trade) => sum + trade.profit_loss, 0).toFixed(2)
    );
    const winRate = Number(
      ((winningTrades.length / trades.length) * 100).toFixed(2)
    );

    // Calculate profit factor
    const totalWinning = winningTrades.reduce(
      (sum, trade) => sum + trade.profit_loss,
      0
    );
    const totalLosing = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.profit_loss, 0)
    );
    const profitFactor =
      totalLosing === 0
        ? Number(totalWinning.toFixed(2))
        : Number((totalWinning / totalLosing).toFixed(2));

    // Get best and worst trades
    const sortedTrades = [...trades].sort(
      (a, b) => b.profit_loss - a.profit_loss
    );
    const bestTrade = sortedTrades[0] || null;
    const worstTrade = sortedTrades[sortedTrades.length - 1] || null;

    const analytics: Analytics = {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      totalProfit,
      bestTrade,
      worstTrade,
      goalTarget: null, // This will be updated when we implement goals
    };

    return { data: analytics, error: null };
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

/**
 * Get analytics for a specific time period
 */
export async function getAnalyticsByPeriod(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{
  data: Analytics | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", startDate)
      .lte("exit_date", endDate);

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

    if (!trades?.length) {
      return {
        data: {
          totalTrades: 0,
          winRate: 0,
          profitFactor: 0,
          totalProfit: 0,
          bestTrade: null,
          worstTrade: null,
          goalTarget: null,
        },
        error: null,
      };
    }

    // Calculate period-specific analytics
    const winningTrades = trades.filter((trade) => trade.profit_loss > 0);
    const losingTrades = trades.filter((trade) => trade.profit_loss < 0);

    const totalProfit = Number(
      trades.reduce((sum, trade) => sum + trade.profit_loss, 0).toFixed(2)
    );
    const winRate = Number(
      ((winningTrades.length / trades.length) * 100).toFixed(2)
    );

    // Calculate profit factor for the period
    const totalWinning = winningTrades.reduce(
      (sum, trade) => sum + trade.profit_loss,
      0
    );
    const totalLosing = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.profit_loss, 0)
    );
    const profitFactor =
      totalLosing === 0
        ? Number(totalWinning.toFixed(2))
        : Number((totalWinning / totalLosing).toFixed(2));

    // Get best and worst trades for the period
    const sortedTrades = [...trades].sort(
      (a, b) => b.profit_loss - a.profit_loss
    );
    const bestTrade = sortedTrades[0] || null;
    const worstTrade = sortedTrades[sortedTrades.length - 1] || null;

    const analytics: Analytics = {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      totalProfit,
      bestTrade,
      worstTrade,
      goalTarget: null,
    };

    return { data: analytics, error: null };
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

/**
 * Get daily PnL for a date range
 */
export async function getDailyPnL(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{
  data: { date: string; pnl: number }[] | null;
  error: ApiError | null;
}> {
  try {
    const supabase = await createClient();
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .gte("exit_date", startDate)
      .lte("exit_date", endDate);

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

    if (!trades?.length) {
      return { data: [], error: null };
    }

    // Group trades by date and calculate daily PnL
    const dailyPnL = trades.reduce((acc: { [key: string]: number }, trade) => {
      const date = new Date(trade.exit_date).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + trade.profit_loss;
      return acc;
    }, {});

    // Convert to array and format
    const formattedData = Object.entries(dailyPnL).map(([date, pnl]) => ({
      date,
      pnl: Number(pnl.toFixed(2)),
    }));

    // Sort by date
    formattedData.sort((a, b) => a.date.localeCompare(b.date));

    return { data: formattedData, error: null };
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
