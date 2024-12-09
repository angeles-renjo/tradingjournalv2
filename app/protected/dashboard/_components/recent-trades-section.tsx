// app/protected/dashboard/_components/recent-trades-section.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActivitySquare } from "lucide-react";
import { Suspense } from "react";
import { TradesSkeleton } from "./loading-skeletons/trades-skeleton";
import { getTradesByUser } from "@/app/actions/trades";

async function RecentTradesContent({ userId }: { userId: string }) {
  const trades = await getTradesByUser(userId);
  const recentTrades = trades
    .sort(
      (a, b) =>
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    )
    .slice(0, 5);

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
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
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
          <div className="text-center py-8 text-gray-500">
            <ActivitySquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No trades recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentTradesSection({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<TradesSkeleton />}>
      <RecentTradesContent userId={userId} />
    </Suspense>
  );
}
