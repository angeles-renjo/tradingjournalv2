"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade } from "@/types";

interface ChartDataPoint {
  date: string;
  balance: number;
  trade_pl: number;
}

interface ProfitLossChartProps {
  trades: Trade[];
}

const transformTradeData = (trades: Trade[]): ChartDataPoint[] => {
  return trades
    .sort(
      (a, b) =>
        new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    )
    .reduce<ChartDataPoint[]>((acc, trade) => {
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const date = new Date(trade.entry_date);

      // Skip invalid dates
      if (isNaN(date.getTime())) {
        return acc;
      }

      return [
        ...acc,
        {
          date: date.toISOString().split("T")[0], // YYYY-MM-DD format
          balance: previousBalance + trade.profit_loss,
          trade_pl: trade.profit_loss,
        },
      ];
    }, []);
};

export function ProfitLossChart({ trades }: ProfitLossChartProps) {
  const chartData = transformTradeData(trades);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Alert>
              <AlertTitle>No trades found</AlertTitle>
              <AlertDescription>
                Start adding trades to see your account balance progression.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-sm"
                tick={false}
                tickLine={{ stroke: "currentColor" }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                className="text-sm"
                tick={{ fill: "currentColor" }}
                tickLine={{ stroke: "currentColor" }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => {
                  if (name === "balance") {
                    return [`$${value.toFixed(2)}`, "Balance"];
                  }
                  return [`$${value.toFixed(2)}`, "Trade P/L"];
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--primary))",
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
