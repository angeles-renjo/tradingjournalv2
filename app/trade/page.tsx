// app/protected/trades/new/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TradeEntryForm } from "@/components/TradeEntryForm";

export default async function NewTradePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="container max-w-4xl mx-auto py-6">
        <TradeEntryForm userId={user.id} />
      </div>
    </div>
  );
}
