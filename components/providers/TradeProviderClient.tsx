"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TradeDataProvider } from "@/context/DataContext";
import { TradeOperationsProvider } from "@/context/OperationsContext";
import { RealtimeProvider } from "@/context/RealTimeContext";
import { TradeProvider } from "@/context/TradeContext";
import { useTradeOperations } from "@/context/OperationsContext";

// components/providers/TradeProviderClient.tsx

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

  if (loading) return <div>Loading...</div>;
  if (!userId) return <>{children}</>;

  return (
    <TradeDataProvider>
      <TradeOperationsProvider userId={userId}>
        <RealtimeProviderWrapper userId={userId}>
          <TradeProvider>{children}</TradeProvider>
        </RealtimeProviderWrapper>
      </TradeOperationsProvider>
    </TradeDataProvider>
  );
}

function RealtimeProviderWrapper({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const { refreshData } = useTradeOperations();

  return (
    <RealtimeProvider userId={userId} onUpdate={refreshData}>
      {children}
    </RealtimeProvider>
  );
}
