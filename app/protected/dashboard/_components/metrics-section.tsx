// app/protected/dashboard/_components/metrics-section.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { MetricsSkeleton } from "./loading-skeletons/metrics-skeleton";
import { getTradeAnalytics } from "@/app/actions/analytics";

// Server Component for fetching and displaying metrics
async function MetricsContent({ userId }: { userId: string }) {
  const analytics = await getTradeAnalytics(userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {`${analytics?.winRate ?? 0}%`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Profit Factor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.profitFactor?.toFixed(2) ?? "0.00"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.totalTrades ?? 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (analytics?.totalProfit ?? 0) > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {`$${(analytics?.totalProfit ?? 0).toFixed(2)}`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component that includes Suspense
export function MetricsSection({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <MetricsContent userId={userId} />
    </Suspense>
  );
}
