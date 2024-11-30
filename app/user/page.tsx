// app/protected/profile/page.tsx
import { Metadata } from "next";
import UserProfile from "@/components/UserProfile";

export const metadata: Metadata = {
  title: "Your Profile | Trading Journal",
  description: "Manage your trading preferences and profile settings",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <UserProfile />
    </div>
  );
}
