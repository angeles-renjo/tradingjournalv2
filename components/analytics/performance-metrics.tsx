import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Analytics } from "@/types";

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
            "sm:text-2xl font-bold tracking-tight truncate mt-1",
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

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

interface PerformanceMetricsProps {
  analytics: Analytics;
}

export function PerformanceMetrics({ analytics }: PerformanceMetricsProps) {
  const metricsConfig = [
    {
      title: "Total Trades",
      mainValue: analytics.totalTrades.toString(),
      subtitle: "losers",
      subtitleValue: `${Math.round(analytics.totalTrades * (analytics.winRate / 100))} winners, ${
        analytics.totalTrades -
        Math.round(analytics.totalTrades * (analytics.winRate / 100))
      }`,
    },
    {
      title: "Win Rate",
      mainValue: `${analytics.winRate}%`,
      subtitle: "trades",
      subtitleValue: analytics.bestTrade
        ? `Best trade: ${formatCurrency(analytics.bestTrade.profit_loss)}`
        : undefined,
    },
    {
      title: "Total P/L",
      mainValue: formatCurrency(analytics.totalProfit),
      subtitle: "All time profit/loss",
      valueClassName:
        analytics.totalProfit >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Profit Factor",
      mainValue: analytics.profitFactor.toString(),
      subtitle: "Risk/Reward ratio",
      valueClassName:
        analytics.profitFactor >= 1 ? "text-green-500" : "text-red-500",
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
