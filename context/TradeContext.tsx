"use client";

import React, { createContext, useContext } from "react";
import type { Trade, Analytics, ApiError } from "@/types";
import { useTradeData } from "./DataContext";
import { useTradeOperations } from "./OperationsContext";

interface TradeContextType {
  trades: Trade[];
  recentTrades: Trade[];
  analytics: Analytics | null;
  loading: boolean;
  error: ApiError | null;
  refreshData: () => Promise<void>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { trades, recentTrades, analytics } = useTradeData();
  const { loading, error, refreshData } = useTradeOperations();

  return (
    <TradeContext.Provider
      value={{
        trades,
        recentTrades,
        analytics,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrades must be used within TradeProvider");
  return context;
}
