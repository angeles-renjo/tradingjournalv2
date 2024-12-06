"use server";

import { createClient } from "@/utils/supabase/server";
import { Goal } from "@/types";

export async function setGoal(
  targetAmount: number
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("User auth error:", userError);
      return { data: null, error: "Authentication failed" };
    }

    if (!user) {
      return { data: null, error: "No authenticated user found" };
    }

    // Check if a goal already exists for the user
    const { data: goals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to check existing goal" };
    }

    if (goals && goals.length > 0) {
      // Update existing goal
      const { data, error: updateError } = await supabase
        .from("goals")
        .update({
          target_amount: targetAmount,
          updated_at: new Date().toISOString(),
          achieved: false, // Reset achievement status when updating goal
          achieved_at: null,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return { data: null, error: "Failed to update goal" };
      }

      return { data, error: null };
    }

    // Create new goal
    const { data, error: insertError } = await supabase
      .from("goals")
      .insert([
        {
          user_id: user.id,
          target_amount: targetAmount,
          achieved: false,
          achieved_at: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { data: null, error: "Failed to create goal" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in setGoal:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function getGoal(): Promise<{
  data: Goal | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("User auth error:", userError);
      return { data: null, error: "Authentication failed" };
    }

    if (!user) {
      return { data: null, error: "No authenticated user found" };
    }

    const { data: goals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to fetch goal" };
    }

    if (goals && goals.length > 0) {
      return { data: goals[0], error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error("Unexpected error in getGoal:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function checkGoalAchievement(
  currentProfit: number
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { data: null, error: "Authentication failed" };
    if (!user) return { data: null, error: "No authenticated user found" };

    // Get current unachieved goal
    const { data: goals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("achieved", false)
      .limit(1);

    if (fetchError) return { data: null, error: "Failed to fetch goal" };
    if (!goals?.length) return { data: null, error: null };

    const currentGoal = goals[0];

    // Check if goal should be marked as achieved
    if (currentProfit >= currentGoal.target_amount && !currentGoal.achieved) {
      const { data, error: updateError } = await supabase
        .from("goals")
        .update({
          achieved: true,
          achieved_at: new Date().toISOString(),
        })
        .eq("id", currentGoal.id)
        .select()
        .single();

      if (updateError) {
        return { data: null, error: "Failed to update goal achievement" };
      }

      return { data, error: null };
    }

    return { data: currentGoal, error: null };
  } catch (error) {
    console.error("Unexpected error in checkGoalAchievement:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}
