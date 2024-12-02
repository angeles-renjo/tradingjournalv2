"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getTradesByUser } from "@/app/actions/trades";
import { getTradeAnalytics } from "@/app/actions/analytics";
import type { ApiError } from "@/types";
import { useTradeData } from "./DataContext";

interface TradeOperationsContextType {
  refreshData: () => Promise<void>;
  loading: boolean;
  error: ApiError | null;
}

const TradeOperationsContext = createContext<
  TradeOperationsContextType | undefined
>(undefined);

export function TradeOperationsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { setTrades, setRecentTrades, setAnalytics } = useTradeData();

  const refreshData = useCallback(async () => {
    if (!userId) {
      setError({ message: "User ID required", code: "AUTH_ERROR" });
      return;
    }

    setLoading(true);
    try {
      const [analyticsData, tradesData] = await Promise.all([
        getTradeAnalytics(userId),
        getTradesByUser(userId),
      ]);

      const sortedTrades = tradesData.sort(
        (a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

      setTrades(tradesData);
      setRecentTrades(sortedTrades.slice(0, 5));
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [userId, setTrades, setRecentTrades, setAnalytics]);

  return (
    <TradeOperationsContext.Provider value={{ refreshData, loading, error }}>
      {children}
    </TradeOperationsContext.Provider>
  );
}

export function useTradeOperations() {
  const context = useContext(TradeOperationsContext);
  if (!context)
    throw new Error(
      "useTradeOperations must be used within TradeOperationsProvider"
    );
  return context;
}
