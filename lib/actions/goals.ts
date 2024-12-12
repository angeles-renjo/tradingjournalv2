"use server";

import { createClient } from "@/lib/utils/supabase/server";
import type {
  Goal,
  GoalInput,
  GoalResponse,
  GoalsListResponse,
  GoalStatus,
  ApiError,
} from "@/types";
import { revalidatePath } from "next/cache";

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

    if (userError || !user) {
      return {
        data: null,
        error: userError ? userError.message : "No authenticated user found",
      };
    }

    const { data: goals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return { data: null, error: fetchError.message };
    }

    return { data: goals, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
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

    if (userError || !user) {
      return {
        data: null,
        error: userError ? userError.message : "No authenticated user found",
      };
    }

    // Validation
    if (!goalInput.target_amount || !goalInput.start_date) {
      return { data: null, error: "Missing required fields" };
    }

    if (goalInput.target_amount <= 0) {
      return { data: null, error: "Target amount must be greater than 0" };
    }

    const startDate = new Date(goalInput.start_date).toISOString();
    const endDate = goalInput.end_date
      ? new Date(goalInput.end_date).toISOString()
      : null;

    const { data: goal, error: insertError } = await supabase
      .from("goals")
      .insert([
        {
          user_id: user.id,
          target_amount: goalInput.target_amount,
          start_date: startDate,
          end_date: endDate,
          status: "active" as GoalStatus,
          achieved: false,
          achieved_at: null,
          current_progress: 0,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { data: null, error: insertError.message };
    }

    revalidatePath("/protected");
    return { data: goal, error: null };
  } catch (error) {
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

    if (userError || !user) {
      return { data: null, error: "Authentication failed" };
    }

    const updates: Partial<Goal> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "achieved") {
      updates.achieved = true;
      updates.achieved_at = new Date().toISOString();
    }

    const { data: goal, error: updateError } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", goalId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    revalidatePath("/protected");
    return { data: goal, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
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

    if (userError || !user) {
      return { data: null, error: "Authentication failed" };
    }

    // Get active goals
    const { data: activeGoals, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (fetchError) {
      return { data: null, error: fetchError.message };
    }

    if (!activeGoals?.length) {
      return { data: [], error: null };
    }

    // Update each active goal
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
    revalidatePath("/protected");
    return { data: updatedGoals.filter(Boolean) as Goal[], error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
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

    if (userError || !user) {
      return { error: "Authentication failed" };
    }

    const { error: deleteError } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id); // Security check: ensure user owns the goal

    if (deleteError) {
      return { error: deleteError.message };
    }

    revalidatePath("/protected");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
