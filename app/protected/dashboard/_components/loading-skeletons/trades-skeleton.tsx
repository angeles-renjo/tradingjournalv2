// app/protected/dashboard/_components/loading-skeletons/trades-skeleton.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TradesSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-[120px]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-[80px]" />
                    <Skeleton className="h-3 w-[60px] rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
