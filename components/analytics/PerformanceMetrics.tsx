"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTrades } from "@/context/TradeContext";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";

interface Metrics {
  totalTrades: number;
  winningTrades: number;
  winRate: string;
  totalProfit: number;
  avgTradeProfit: number;
  consecutiveWins: number;
}

interface MetricCardProps {
  title: string;
  mainValue: string;
  subtitle: string;
  subtitleValue?: string;
  valueClassName?: string;
}

const MetricCard = ({
  title,
  mainValue,
  subtitle,
  subtitleValue,
  valueClassName,
}: MetricCardProps) => (
  <Card className="relative flex flex-col min-w-0 overflow-hidden">
    <div className="flex-1 p-4 sm:p-6">
      <div className="min-w-0">
        <h3 className="text-base sm:text-lg font-medium text-muted-foreground truncate">
          {title}
        </h3>
        <div
          className={cn(
            " sm:text-2xl font-bold tracking-tight truncate mt-1",
            valueClassName
          )}
        >
          {mainValue}
        </div>
        <div className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
          {subtitleValue ? (
            <>
              {subtitleValue} {subtitle}
            </>
          ) : (
            subtitle
          )}
        </div>
      </div>
    </div>
  </Card>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const calculateMetrics = (trades: Trade[]): Metrics => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      winRate: "0.0",
      totalProfit: 0,
      avgTradeProfit: 0,
      consecutiveWins: 0,
    };
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter((trade) => trade.profit_loss > 0).length;
  const winRate = ((winningTrades / totalTrades) * 100).toFixed(1);
  const totalProfit = trades.reduce(
    (sum, trade) => sum + (trade.profit_loss || 0),
    0
  );
  const avgTradeProfit = totalProfit / totalTrades;

  const sortedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
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

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export function PerformanceMetrics() {
  const { trades, loading, error } = useTrades();
  const metrics = calculateMetrics(trades);

  if (error) {
    return (
      <ErrorAlert message="Failed to load performance metrics. Please try again later." />
    );
  }

  const metricsConfig = [
    {
      title: "Total Trades",
      mainValue: metrics.totalTrades.toString(),
      subtitle: "losers",
      subtitleValue: `${metrics.winningTrades} winners, ${
        metrics.totalTrades - metrics.winningTrades
      }`,
    },
    {
      title: "Win Rate",
      mainValue: `${metrics.winRate}%`,
      subtitle: "trades",
      subtitleValue: `Best streak: ${metrics.consecutiveWins}`,
    },
    {
      title: "Total P/L",
      mainValue: formatCurrency(metrics.totalProfit),
      subtitle: "All time profit/loss",
      valueClassName:
        metrics.totalProfit >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Avg Trade",
      mainValue: formatCurrency(metrics.avgTradeProfit),
      subtitle: "Per trade average",
      valueClassName:
        metrics.avgTradeProfit >= 0 ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metricsConfig.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          mainValue={metric.mainValue}
          subtitle={metric.subtitle}
          subtitleValue={metric.subtitleValue}
          valueClassName={metric.valueClassName}
        />
      ))}
    </div>
  );
}
