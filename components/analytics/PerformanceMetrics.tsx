// components/analytics/PerformanceMetrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PerformanceMetricsProps {
  userId: string;
}

export async function PerformanceMetrics({ userId }: PerformanceMetricsProps) {
  const supabase = await createClient();

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId);

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

  if (!trades || trades.length === 0) {
    return (
      <Alert>
        <AlertTitle>No trades found</AlertTitle>
        <AlertDescription>
          Start adding trades to see your performance metrics.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((trade) => trade.profit_loss > 0).length;
  const winRate = ((winningTrades / totalTrades) * 100).toFixed(1);
  const totalProfit = trades.reduce(
    (sum, trade) => sum + (trade.profit_loss || 0),
    0
  );
  const avgTradeProfit = totalProfit / totalTrades;
  const consecutiveWins = calculateConsecutiveWins(trades);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTrades}</div>
          <p className="text-xs text-muted-foreground">
            {winningTrades} winners, {totalTrades - winningTrades} losers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winRate}%</div>
          <p className="text-xs text-muted-foreground">
            Best streak: {consecutiveWins} trades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ${totalProfit.toFixed(2)}
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
            className={`text-2xl font-bold ${avgTradeProfit >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ${avgTradeProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Per trade average</p>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateConsecutiveWins(trades: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;

  // Sort trades by date to get proper sequence
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

  return maxStreak;
}
