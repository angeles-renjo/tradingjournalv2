// app/protected/analytics/page.tsx
import { createClient } from "@/utils/supabase/server";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { ProfitLossChart } from "@/components/analytics/ProfitLossChart";
import { redirect } from "next/navigation";
import PnlCalendar from "@/components/analytics/PnlCalendar";
import GoalProgress from "@/components/analytics/GoalProgress";

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
    <>
      <h1 className="text-3xl font-bold tracking-tight text-center mb-4">
        Trading Analytics
      </h1>
      <div className=" lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="space-y-6 lg:col-span-2 flex flex-col justify-around my-2">
          <PerformanceMetrics />
          <ProfitLossChart />
        </div>

        <div className="lg:col-span-2 space-y-2">
          <PnlCalendar />
          <div>
            <GoalProgress />
          </div>
        </div>
      </div>
    </>
  );
}
