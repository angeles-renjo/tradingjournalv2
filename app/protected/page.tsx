"use client";

import Dashboard from "@/components/Dashboard";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const router = useRouter();
  const supabase = createClient();

  // Simple effect to get userId for the providers
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
      }
    };

    checkUser();
  }, [router]);

  return <Dashboard />;
}
