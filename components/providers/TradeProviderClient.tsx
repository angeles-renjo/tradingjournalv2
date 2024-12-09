// components/providers/TradeProviderClient.tsx
"use client";

import { TradeDataProvider } from "@/context/DataContext";
import { TradeOperationsProvider } from "@/context/OperationsContext";
import { RealtimeProvider } from "@/context/RealTimeContext";
import { TradeProvider } from "@/context/TradeContext";

export default function TradeProviderClient({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  return (
    <TradeDataProvider>
      <TradeOperationsProvider userId={userId}>
        <RealtimeProvider userId={userId}>
          <TradeProvider>{children}</TradeProvider>
        </RealtimeProvider>
      </TradeOperationsProvider>
    </TradeDataProvider>
  );
}
