// app/protected/loading.tsx
import { MetricsSkeleton } from "./dashboard/_components/loading-skeletons/metrics-skeleton";
import { TradesSkeleton } from "./dashboard/_components/loading-skeletons/trades-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="h-8 w-[300px] mb-2">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="h-4 w-[400px]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>

      {/* Grid for action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[100px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[100px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[100px] w-full" />
          </CardContent>
        </Card>
      </div>

      <MetricsSkeleton />
      <TradesSkeleton />
    </div>
  );
}
