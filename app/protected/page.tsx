"use client";

import { createClient } from "@/utils/supabase/client";
import Dashboard from "@/components/Dashboard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradeOperationsProvider } from "@/context/OperationsContext";

export default function ProtectedPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/sign-in");
      } else {
        setUserId(user.id);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  if (!userId) return null;

  return (
    <TradeOperationsProvider userId={userId}>
      <Dashboard />
    </TradeOperationsProvider>
  );
}
