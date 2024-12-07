"use server";

import { createClient } from "@/utils/supabase/server";
import {
  Goal,
  GoalInput,
  GoalResponse,
  GoalsListResponse,
  GoalStatus,
} from "@/types";

/**
 * Get all goals for the current user
 */
export async function getGoals(): Promise<GoalsListResponse> {
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to fetch goals" };
    }

    return { data: goals, error: null };
  } catch (error) {
    console.error("Unexpected error in getGoals:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new goal
 */
export async function setGoal(goalInput: GoalInput): Promise<GoalResponse> {
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

    // Input validation
    if (!goalInput.target_amount || !goalInput.start_date) {
      return { data: null, error: "Missing required fields" };
    }

    if (goalInput.target_amount <= 0) {
      return { data: null, error: "Target amount must be greater than 0" };
    }

    // Convert dates to ISO string format
    const startDate = new Date(goalInput.start_date).toISOString();
    const endDate = goalInput.end_date
      ? new Date(goalInput.end_date).toISOString()
      : null;

    // Create new goal with properly formatted data
    const { data, error: insertError } = await supabase
      .from("goals")
      .insert([
        {
          user_id: user.id,
          target_amount: goalInput.target_amount,
          start_date: startDate,
          end_date: endDate,
          status: "active",
          achieved: false,
          achieved_at: null,
          current_progress: 0,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error details:", insertError);
      return {
        data: null,
        error: "Failed to create goal: " + insertError.message,
      };
    }

    if (!data) {
      return { data: null, error: "No data returned after goal creation" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in setGoal:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update goal status
 */
export async function updateGoalStatus(
  goalId: string,
  status: GoalStatus
): Promise<GoalResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { data: null, error: "Authentication failed" };
    if (!user) return { data: null, error: "No authenticated user found" };

    const updates: Partial<Goal> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add achieved_at date if the goal is being marked as achieved
    if (status === "achieved") {
      updates.achieved = true;
      updates.achieved_at = new Date().toISOString();
    }

    const { data, error: updateError } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", goalId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return { data: null, error: "Failed to update goal status" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in updateGoalStatus:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(goalId: string): Promise<GoalResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { data: null, error: "Authentication failed" };
    if (!user) return { data: null, error: "No authenticated user found" };

    const { data, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to fetch goal" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getGoalById:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(
  goalId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { error: "Authentication failed" };
    if (!user) return { error: "No authenticated user found" };

    const { error: deleteError } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: "Failed to delete goal" };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error in deleteGoal:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Check and update goals progress
 */
export async function checkGoalsProgress(
  currentProfit: number
): Promise<GoalsListResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { data: null, error: "Authentication failed" };
    if (!user) return { data: null, error: "No authenticated user found" };

    // Get all active goals
    const { data: activeGoals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { data: null, error: "Failed to fetch goals" };
    }

    if (!activeGoals?.length) {
      return { data: [], error: null };
    }

    // Check and update each active goal
    const updates = activeGoals.map(async (goal) => {
      let newStatus: GoalStatus = "active";
      const now = new Date();

      if (currentProfit >= goal.target_amount) {
        newStatus = "achieved";
      } else if (goal.end_date && new Date(goal.end_date) < now) {
        newStatus = "failed";
      }

      if (newStatus !== "active") {
        const { data } = await updateGoalStatus(goal.id, newStatus);
        return data;
      }

      return goal;
    });

    const updatedGoals = await Promise.all(updates);
    return { data: updatedGoals.filter(Boolean) as Goal[], error: null };
  } catch (error) {
    console.error("Unexpected error in checkGoalsProgress:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}
