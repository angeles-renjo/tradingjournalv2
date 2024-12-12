"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setGoal, updateGoalStatus, deleteGoal } from "@/lib/actions/goals";
import type { Goal, GoalProgressProps, AlertInfo, GoalStatus } from "@/types";
import { GoalProgressAlert } from "./goal-progress-alert";
import { GoalProgressForm } from "./goal-progress-form";
import { GoalProgressList } from "./goal-progress-list";
import { GoalProgressDetails } from "./goal-progress-details";

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Component for managing and displaying trading goals progress.
 *
 * @param {GoalProgressProps} props - The properties object.
 * @param {Goal[]} props.initialGoals - Initial list of goals.
 * @param {number} props.currentProfit - Current profit amount to evaluate goal progress.
 *
 * @returns {JSX.Element} The rendered component.
 *
 * The component provides functionality to:
 * - Display a list of trading goals.
 * - Add new trading goals with a specified target amount and timeline.
 * - Delete existing goals.
 * - Automatically check and update the status of goals based on current profit
 *   and timelines, marking them as 'achieved' or 'failed' as appropriate.
 * - Show alerts for success or error actions such as creating or deleting goals.
 */
/******  6106b14b-c4f7-4059-ae6d-06ce597e01c9  *******/ export function GoalProgress({
  initialGoals,
  currentProfit,
}: GoalProgressProps) {
  // State
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Alert state
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    type: "success",
    message: "",
  });

  // Show alert helper
  const showAlert = (type: "success" | "error", message: string) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: "success", message: "" });
    }, 3000);
  };

  // Form reset helper
  const resetForm = () => {
    setTargetAmount("");
    setStartDate("");
    setEndDate("");
  };

  // Handlers
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAmount || !startDate) {
      showAlert("error", "Please fill in all required fields");
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert("error", "Please enter a valid target amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await setGoal({
        target_amount: amount,
        start_date: startDate,
        end_date: endDate || null,
      });

      if (response.error) {
        showAlert("error", response.error);
      } else if (response.data) {
        setGoals((prev) => [...prev, response.data!]);
        setIsAddingGoal(false);
        resetForm();
        showAlert("success", "Goal created successfully!");
      }
    } catch (err) {
      showAlert(
        "error",
        err instanceof Error ? err.message : "Failed to add goal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setIsLoading(true);
      const response = await deleteGoal(goalId);

      if (response.error) {
        showAlert("error", response.error);
        return;
      }

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      setShowDetailsDialog(false);
      setSelectedGoal(null);
      showAlert("success", "Goal deleted successfully");
    } catch (err) {
      showAlert(
        "error",
        err instanceof Error ? err.message : "Failed to delete goal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkGoalsProgress = async () => {
    goals.forEach(async (goal) => {
      if (goal.status === "active") {
        let newStatus: GoalStatus = "active";

        if (currentProfit >= goal.target_amount) {
          newStatus = "achieved";
        } else if (goal.end_date && new Date(goal.end_date) < new Date()) {
          newStatus = "failed";
        }

        if (newStatus !== goal.status) {
          const response = await updateGoalStatus(goal.id, newStatus);
          if (response.data) {
            setGoals((prev) =>
              prev.map((g) => (g.id === goal.id ? response.data! : g))
            );
            showAlert(
              newStatus === "achieved" ? "success" : "error",
              newStatus === "achieved"
                ? "Goal achieved! Congratulations!"
                : "Goal timeline expired"
            );
          }
        }
      }
    });
  };

  // Check goals progress when currentProfit changes
  useEffect(() => {
    if (currentProfit > 0 && goals.length > 0) {
      checkGoalsProgress();
    }
  }, [currentProfit, goals.length]);

  return (
    <div className="relative">
      <GoalProgressAlert alertInfo={alertInfo} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Trading Goals</CardTitle>
          {goals.length > 0 && (
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Goal</Button>
              </DialogTrigger>
              <GoalProgressForm
                onSubmit={handleAddGoal}
                targetAmount={targetAmount}
                setTargetAmount={setTargetAmount}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                isLoading={isLoading}
              />
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          <GoalProgressList
            goals={goals}
            currentProfit={currentProfit}
            onViewDetails={(goal) => {
              setSelectedGoal(goal);
              setShowDetailsDialog(true);
            }}
            onAddGoal={() => setIsAddingGoal(true)}
          />
        </CardContent>
      </Card>

      <Dialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) setSelectedGoal(null);
        }}
      >
        {selectedGoal && (
          <GoalProgressDetails
            goal={selectedGoal}
            currentProfit={currentProfit}
            onDelete={handleDeleteGoal}
            onClose={() => setShowDetailsDialog(false)}
            isLoading={isLoading}
          />
        )}
      </Dialog>
    </div>
  );
}
