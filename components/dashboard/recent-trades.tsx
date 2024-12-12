import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivitySquare } from "lucide-react";
import type { Trade } from "@/types";

interface RecentTradesProps {
  trades: Trade[];
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  const recentTrades = trades.slice(0, 5);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTrades.length > 0 ? (
          <div className="divide-y">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{trade.instrument}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(trade.entry_date).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          trade.direction === "long"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {trade.direction.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      trade.profit_loss > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${trade.profit_loss.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <ActivitySquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
      <p>No trades recorded yet</p>
    </div>
  );
}

export function RecentTradesSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
