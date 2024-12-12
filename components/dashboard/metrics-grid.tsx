import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analytics } from "@/types";

interface MetricsGridProps {
  analytics: Analytics | null;
}

export default function MetricsGrid({ analytics }: MetricsGridProps) {
  const metrics = [
    {
      title: "Win Rate",
      value: `${analytics?.winRate ?? 0}%`,
      className: "",
    },
    {
      title: "Profit Factor",
      value: analytics?.profitFactor?.toFixed(2) ?? "0.00",
      className: "",
    },
    {
      title: "Total Trades",
      value: analytics?.totalTrades ?? 0,
      className: "",
    },
    {
      title: "Total P&L",
      value: `$${(analytics?.totalProfit ?? 0).toFixed(2)}`,
      className:
        (analytics?.totalProfit ?? 0) > 0 ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.className}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
