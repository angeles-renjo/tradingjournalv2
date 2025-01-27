// app/protected/layout.tsx
import { getAuthenticatedUser } from "@/lib/utils/db";
import { Suspense } from "react";
import Loading from "./loading";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We keep this one auth check as the source of truth
  const user = await getAuthenticatedUser();

  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
