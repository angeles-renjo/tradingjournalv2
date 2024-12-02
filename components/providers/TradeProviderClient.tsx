"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TradeDataProvider } from "@/context/DataContext";
import { TradeOperationsProvider } from "@/context/OperationsContext";
import { RealtimeProvider } from "@/context/RealTimeContext";
import { TradeProvider } from "@/context/TradeContext";
import LoadingSpinner from "@/components/LoadingSpinner"; // Add this import

function DataInitializer({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      const supabase = createClient();
      try {
        const { data: tradesData, error: tradesError } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", userId)
          .order("entry_date", { ascending: false });

        if (!tradesError && tradesData) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    if (userId && !isInitialized) {
      initializeData();
    }
  }, [userId, isInitialized]);

  if (!isInitialized) {
    return <LoadingSpinner message="Loading trade data..." />;
  }

  return <>{children}</>;
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

  return (
    <TradeDataProvider>
      <TradeOperationsProvider userId={userId}>
        <RealtimeProvider userId={userId}>
          <TradeProvider>
            <DataInitializer userId={userId}>{children}</DataInitializer>
          </TradeProvider>
        </RealtimeProvider>
      </TradeOperationsProvider>
    </TradeDataProvider>
  );
}
