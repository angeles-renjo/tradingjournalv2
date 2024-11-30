"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  username: string;
  trading_experience: string;
  preferred_markets: string[];
}

const UserProfile = () => {
  const [profile, setProfile] = useState<Profile>({
    username: "",
    trading_experience: "beginner",
    preferred_markets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfile(profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMarketsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const markets = e.target.value.split(",").map((market) => market.trim());
    setProfile((prev) => ({
      ...prev,
      preferred_markets: markets,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          trading_experience: profile.trading_experience,
          preferred_markets: profile.preferred_markets,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-xl mx-auto p-6 bg-card rounded-lg shadow"
    >
      <div className="text-2xl font-semibold mb-6">Your Profile</div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trading_experience">Trading Experience</Label>
          <select
            id="trading_experience"
            name="trading_experience"
            className="w-full p-2 rounded-md border bg-background"
            value={profile.trading_experience}
            onChange={handleChange}
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_markets">
            Preferred Markets (comma-separated)
          </Label>
          <Input
            id="preferred_markets"
            name="preferred_markets"
            value={profile.preferred_markets.join(", ")}
            onChange={handleMarketsChange}
            placeholder="e.g., Forex, Stocks, Crypto"
          />
          <p className="text-sm text-muted-foreground">
            Enter markets separated by commas
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
};

export default UserProfile;
