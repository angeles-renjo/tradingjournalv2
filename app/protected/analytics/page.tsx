// app/protected/analytics/page.tsx
import { createClient } from "@/utils/supabase/server";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { ProfitLossChart } from "@/components/analytics/ProfitLossChart";
import { redirect } from "next/navigation";
import PnlCalendar from "@/components/analytics/PnlCalendar";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Trading Analytics</h1>
      <PerformanceMetrics />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="col-span-2">
          <ProfitLossChart />
          <PnlCalendar />
        </div>
      </div>
    </div>
  );
}
