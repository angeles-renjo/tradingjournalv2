import { getTradesByUser } from "@/lib/actions/trades";
import { getTradeAnalytics } from "@/lib/actions/analytics";
import { getGoals } from "@/lib/actions/goals";
import { PerformanceMetrics } from "@/components/analytics/performance-metrics";
import { ProfitLossChart } from "@/components/analytics/profit-loss-chart";
import { PnlCalendar } from "@/components/analytics/pnl-calendar";
import { GoalProgress } from "@/components/analytics/goal-progress/goal-progress";
import { getAuthenticatedUser } from "@/lib/utils/db";

export default async function AnalyticsPage() {
  const user = await getAuthenticatedUser();

  const [analyticsResult, tradesResult, goalsResult] = await Promise.all([
    getTradeAnalytics(user.id),
    getTradesByUser(user.id),
    getGoals(),
  ]);

  const analytics = analyticsResult.data;
  const trades = tradesResult.data ?? [];
  const goals = goalsResult.data ?? [];

  if (!analytics) {
    throw new Error("Failed to load analytics data");
  }

  // Calculate current profit from trades
  const currentProfit = trades.reduce(
    (sum, trade) => sum + trade.profit_loss,
    0
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-4">
        Trading Analytics
      </h1>
      <div className="lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="space-y-6 lg:col-span-2 flex flex-col justify-around my-2">
          <PerformanceMetrics analytics={analytics} />
          <ProfitLossChart trades={trades} />
        </div>

        <div className="lg:col-span-2 space-y-2">
          <PnlCalendar trades={trades} />
          <GoalProgress initialGoals={goals} currentProfit={currentProfit} />
        </div>
      </div>
    </div>
  );
}
