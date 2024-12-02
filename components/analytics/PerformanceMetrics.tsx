"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useTrades } from "@/context/TradeContext";
import type { Trade } from "@/types";

interface Metrics {
  totalTrades: number;
  winningTrades: number;
  winRate: string;
  totalProfit: number;
  avgTradeProfit: number;
  consecutiveWins: number;
}

const calculateMetrics = (trades: Trade[]): Metrics => {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      winRate: "0.0",
      totalProfit: 0,
      avgTradeProfit: 0,
      consecutiveWins: 0,
    };
  }

  const winningTrades = trades.filter((trade) => trade.profit_loss > 0).length;
  const winRate = ((winningTrades / totalTrades) * 100).toFixed(1);
  const totalProfit = trades.reduce(
    (sum, trade) => sum + (trade.profit_loss || 0),
    0
  );
  const avgTradeProfit = totalProfit / totalTrades;

  // Calculate consecutive wins
  let maxStreak = 0;
  let currentStreak = 0;
  const sortedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  for (const trade of sortedTrades) {
    if (trade.profit_loss > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalTrades,
    winningTrades,
    winRate,
    totalProfit,
    avgTradeProfit,
    consecutiveWins: maxStreak,
  };
};

export function PerformanceMetrics() {
  const { trades, loading, error } = useTrades();

  const metrics = useMemo(() => calculateMetrics(trades), [trades]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load performance metrics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (metrics.totalTrades === 0) {
    return (
      <Alert>
        <AlertTitle>No trades found</AlertTitle>
        <AlertDescription>
          Start adding trades to see your performance metrics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTrades}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.winningTrades} winners,{" "}
            {metrics.totalTrades - metrics.winningTrades} losers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.winRate}%</div>
          <p className="text-xs text-muted-foreground">
            Best streak: {metrics.consecutiveWins} trades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ${metrics.totalProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">All time profit/loss</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${metrics.avgTradeProfit >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ${metrics.avgTradeProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Per trade average</p>
        </CardContent>
      </Card>
    </div>
  );
}
