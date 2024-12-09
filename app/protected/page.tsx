// app/protected/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TradeProviderClient from "@/components/providers/TradeProviderClient";
import { MetricsSection } from "./dashboard/_components/metrics-section";
import { ActionCards } from "./dashboard/_components/action-cards";
import { RecentTradesSection } from "./dashboard/_components/recent-trades-section";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  return (
    <TradeProviderClient userId={user.id}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track, analyze, and improve your trading performance
          </p>
        </div>

        <ActionCards />
        <MetricsSection userId={user.id} />
        <RecentTradesSection userId={user.id} />
      </div>
    </TradeProviderClient>
  );
}
