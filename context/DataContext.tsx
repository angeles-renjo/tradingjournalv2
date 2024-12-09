"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Trade, Analytics } from "@/types";

interface TradeDataContextType {
  trades: Trade[];
  recentTrades: Trade[];
  analytics: Analytics | null;
  setTrades: (trades: Trade[]) => void;
  setRecentTrades: (trades: Trade[]) => void;
  setAnalytics: (analytics: Analytics | null) => void;
  goalTarget: number | null;
  setGoalTarget: (goal: number | null) => void;
}

const TradeDataContext = createContext<TradeDataContextType | undefined>(
  undefined
);

interface TradeDataProviderProps {
  children: React.ReactNode;
  initialData?: {
    trades: Trade[];
    analytics: Analytics;
  };
}

export function TradeDataProvider({
  children,
  initialData,
}: TradeDataProviderProps) {
  const [trades, setTrades] = useState<Trade[]>(initialData?.trades || []);
  const [recentTrades, setRecentTrades] = useState<Trade[]>(
    initialData?.trades?.slice(0, 5) || []
  );
  const [analytics, setAnalytics] = useState<Analytics | null>(
    initialData?.analytics || null
  );
  const [goalTarget, setGoalTarget] = useState<number | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tradingGoalTarget");
      return saved ? Number(saved) : null;
    }
    return null;
  });

  // Persist goal changes to localStorage
  useEffect(() => {
    if (goalTarget === null) {
      localStorage.removeItem("tradingGoalTarget");
    } else {
      localStorage.setItem("tradingGoalTarget", goalTarget.toString());
    }
  }, [goalTarget]);

  return (
    <TradeDataContext.Provider
      value={{
        trades,
        recentTrades,
        analytics,
        setTrades,
        setRecentTrades,
        setAnalytics,
        goalTarget,
        setGoalTarget,
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
