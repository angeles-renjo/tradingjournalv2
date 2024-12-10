"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetricsLoadingSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card
          key={i}
          className="relative flex flex-col min-w-0 overflow-hidden"
        >
          <div className="flex-1 p-4 sm:p-6">
            <div className="min-w-0">
              <Skeleton className="h-5 w-26" />
              <Skeleton className="h-8 w-24 mt-2" />
              <Skeleton className="h-4 w-12 mt-2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChartLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <div className="w-full h-full">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-36" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <>
      <div className="text-center mb-4">
        <Skeleton className="h-9 w-48 mx-auto" />
      </div>
      <div className="lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="space-y-6 lg:col-span-2 flex flex-col justify-around my-2">
          <MetricsLoadingSkeleton />
          <ChartLoadingSkeleton />
        </div>
        <div className="lg:col-span-2 space-y-2">
          <CalendarLoadingSkeleton />
          <GoalLoadingSkeleton />
        </div>
      </div>
    </>
  );
}
