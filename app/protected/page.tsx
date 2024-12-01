// app/protected/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard"; // Adjust this import path based on your file structure

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  return <Dashboard userId={user.id} />;
}
