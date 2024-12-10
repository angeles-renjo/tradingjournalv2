"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TradeDataProvider } from "@/context/DataContext";
import { TradeOperationsProvider } from "@/context/OperationsContext";
import { RealtimeProvider } from "@/context/RealTimeContext";
import { TradeProvider } from "@/context/TradeContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import Loading from "@/app/protected/loading";
import { getTradesByUser } from "@/app/actions/trades";
import { getTradeAnalytics } from "@/app/actions/analytics";
import type { Trade, Analytics } from "@/types";

function DataInitializer({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialData, setInitialData] = useState<{
    trades: Trade[];
    analytics: Analytics;
  } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [trades, analytics] = await Promise.all([
          getTradesByUser(userId),
          getTradeAnalytics(userId),
        ]);

        setInitialData({ trades, analytics });
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    if (userId && !isInitialized) {
      initializeData();
    }
  }, [userId, isInitialized]);

  if (!isInitialized || !initialData) {
    return <Loading />;
  }

  return (
    <TradeDataProvider initialData={initialData}>
      <TradeOperationsProvider userId={userId}>
        <RealtimeProvider userId={userId}>
          <TradeProvider>{children}</TradeProvider>
        </RealtimeProvider>
      </TradeOperationsProvider>
    </TradeDataProvider>
  );
}

export default function TradeProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <LoadingSpinner message="Authenticating..." />;
  if (!userId) return <>{children}</>;

  return <DataInitializer userId={userId}>{children}</DataInitializer>;
}
