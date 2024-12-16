// protected/page.tsx
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/utils/db";
import { getTradeAnalytics } from "@/lib/actions";
import { getTradesByUser } from "@/lib/actions/";
import NavLinks from "@/components/dashboard/nav-cards";
import MetricsGrid, {
  MetricsGridSkeleton,
} from "@/components/dashboard/metrics-grid";
import RecentTrades, {
  RecentTradesSkeleton,
} from "@/components/dashboard/recent-trades";
import { TradeEntryForm } from "@/components/trade-form/trade-entry-form";

export default async function ProtectedPage() {
  const user = await getAuthenticatedUser();
  const { data: analytics } = await getTradeAnalytics(user.id);
  const { data: trades } = await getTradesByUser(user.id);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track, analyze, and improve your trading performance
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <TradeEntryForm userId={user.id} />
        </Card>
        <NavLinks />
      </div>

      {/* Metrics Grid */}
      <Suspense fallback={<MetricsGridSkeleton />}>
        <MetricsGrid analytics={analytics} />
      </Suspense>

      {/* Recent Trades */}
      <Suspense fallback={<RecentTradesSkeleton />}>
        <RecentTrades trades={trades ?? []} />
      </Suspense>
    </div>
  );
}
