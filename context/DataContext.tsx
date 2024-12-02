"use client";

import React, { createContext, useContext, useState } from "react";
import type { Trade, Analytics } from "@/types";

interface TradeDataContextType {
  trades: Trade[];
  recentTrades: Trade[];
  analytics: Analytics | null;
  setTrades: (trades: Trade[]) => void;
  setRecentTrades: (trades: Trade[]) => void;
  setAnalytics: (analytics: Analytics | null) => void;
}

const TradeDataContext = createContext<TradeDataContextType | undefined>(
  undefined
);

export function TradeDataProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  return (
    <TradeDataContext.Provider
      value={{
        trades,
        recentTrades,
        analytics,
        setTrades,
        setRecentTrades,
        setAnalytics,
      }}
    >
      {children}
    </TradeDataContext.Provider>
  );
}

export function useTradeData() {
  const context = useContext(TradeDataContext);
  if (!context)
    throw new Error("useTradeData must be used within TradeDataProvider");
  return context;
}
