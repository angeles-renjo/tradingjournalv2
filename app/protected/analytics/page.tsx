import { getTradesByUser } from "@/lib/actions/trades";
import { getTradeAnalytics } from "@/lib/actions/analytics";
import { PerformanceMetrics } from "@/components/analytics/performance-metrics";
import { ProfitLossChart } from "@/components/analytics/profit-loss-chart";
import { PnlCalendar } from "@/components/analytics/PnlCalendar";
import { GoalProgress } from "@/components/analytics/GoalProgress";
import { getAuthenticatedUser } from "@/lib/utils/db";

export default async function AnalyticsPage() {
  const user = await getAuthenticatedUser();
  const [{ data: analytics }, { data: trades }] = await Promise.all([
    getTradeAnalytics(user.id),
    getTradesByUser(user.id),
  ]);

  if (!analytics || !trades) {
    throw new Error("Failed to load analytics data");
  }

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-center mb-4">
        Trading Analytics
      </h1>
      <div className="lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="space-y-6 lg:col-span-2 flex flex-col justify-around my-2">
          <PerformanceMetrics analytics={analytics} />
          <ProfitLossChart trades={trades} />
        </div>

        <div className="lg:col-span-2 space-y-2">
          <PnlCalendar />
          <div>
            <GoalProgress />
          </div>
        </div>
      </div>
    </>
  );
}
