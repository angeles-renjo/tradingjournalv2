"use client";

import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTradeOperations } from "./OperationsContext";

export function RealtimeProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const { refreshData } = useTradeOperations();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("trades-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${userId}`,
        },
        refreshData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshData]);

  return <>{children}</>;
}
