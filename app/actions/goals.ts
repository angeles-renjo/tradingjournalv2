// app/actions/goals.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { Goal } from "@/types";

export async function setGoal(
  targetAmount: number
): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get the current user
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

    // Get the current user
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

    // Get goals without using .single()
    const { data: goals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to fetch goal" };
    }

    // Return the first goal if it exists
    if (goals && goals.length > 0) {
      return { data: goals[0], error: null };
    }

    // No goal found - this is not an error
    return { data: null, error: null };
  } catch (error) {
    console.error("Unexpected error in getGoal:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}
