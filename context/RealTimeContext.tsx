"use client";

import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function RealtimeProvider({
  children,
  userId,
  onUpdate,
}: {
  children: React.ReactNode;
  userId: string;
  onUpdate: () => void;
}) {
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
        onUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);

  return <>{children}</>;
}
