"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTradeData } from "@/context/DataContext";
import { setGoal, getGoal, checkGoalAchievement } from "@/app/actions/goals";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Goal } from "@/types";

export default function GoalProgress() {
  const { analytics } = useTradeData();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showAchievementAlert, setShowAchievementAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [goalData, setGoalData] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProfit = analytics?.totalProfit || 0;

  useEffect(() => {
    const fetchAndCheckGoal = async () => {
      try {
        setIsLoading(true);
        const result = await getGoal();

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.data) {
          if (
            !result.data.achieved &&
            currentProfit >= result.data.target_amount
          ) {
            const achievementResult = await checkGoalAchievement(currentProfit);
            if (achievementResult.data) {
              setGoalData(achievementResult.data);
              setShowAchievementAlert(true);
              setTimeout(() => setShowAchievementAlert(false), 5000);
            }
          } else {
            setGoalData(result.data);
            setTargetAmount(result.data.target_amount.toString());
          }
        }
      } catch (err) {
        console.error("Error in fetchAndCheckGoal:", err);
        setError("Failed to load goal");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCheckGoal();
  }, [currentProfit]);

  const progressPercentage = goalData
    ? (currentProfit / goalData.target_amount) * 100
    : 0;
  const remainingPercentage = Math.max(
    0,
    Math.min(100 - progressPercentage, 100)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const CHART_COLORS = {
    progress: goalData?.achieved ? "#22c55e" : "#22c55e",
    background: "hsl(var(--muted))",
    achieved: "#22c55e",
  };

  const chartData = [
    { name: "progress", value: progressPercentage },
    { name: "remaining", value: remainingPercentage },
  ];

  const handleGoalUpdate = async () => {
    const newGoalAmount = parseFloat(targetAmount);
    if (!isNaN(newGoalAmount) && newGoalAmount > 0) {
      if (newGoalAmount <= currentProfit) {
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 3000);
        return;
      }

      setIsLoading(true);
      try {
        const result = await setGoal(newGoalAmount);
        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.data) {
          setGoalData(result.data);
          setIsEditingGoal(false);
          setError(null);
        }
      } catch (err) {
        console.error("Error in handleGoalUpdate:", err);
        setError("Failed to update goal");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderGoalContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      );
    }

    if (!analytics || currentProfit === 0) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No trades found</p>
        </div>
      );
    }

    if (!goalData) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">
            Set a goal to track your progress
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="relative h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="85%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                className={goalData.achieved ? "animate-glow-pulse" : ""}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? goalData.achieved
                          ? CHART_COLORS.achieved
                          : CHART_COLORS.progress
                        : CHART_COLORS.background
                    }
                    className={
                      index === 0 && goalData.achieved
                        ? "filter drop-shadow-md shadow-emerald-500"
                        : ""
                    }
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`text-4xl font-bold ${
                goalData.achieved ? "text-emerald-500" : "text-foreground"
              }`}
            >
              {progressPercentage.toFixed(1)}%
            </div>
            <div className="mt-2 flex flex-col items-center gap-1">
              <div
                className={`text-sm ${
                  goalData.achieved
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              >
                Current: ${currentProfit.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Goal: ${goalData.target_amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Started: {formatDate(goalData.created_at)}</span>
            <Badge
              variant={goalData.achieved ? "default" : "secondary"}
              className={goalData.achieved ? "bg-emerald-500" : ""}
            >
              {goalData.achieved ? "✨ Achieved" : "In Progress"}
            </Badge>
          </div>
          {goalData.achieved && goalData.achieved_at && (
            <div>Achieved: {formatDate(goalData.achieved_at)}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {(showAchievementAlert || showErrorAlert) && (
        <div className="fixed inset-x-0 top-4 mx-auto max-w-md z-[100] px-4">
          {showAchievementAlert && (
            <Alert
              variant="default"
              className="bg-emerald-500/15 border-emerald-500/30"
            >
              <Trophy className="h-5 w-5 text-emerald-500" />
              <AlertTitle className="text-emerald-500">
                Goal Achieved! 🎉
              </AlertTitle>
              <AlertDescription className="text-emerald-600">
                Congratulations! You've reached your profit goal of $
                {goalData?.target_amount.toLocaleString()}. Keep up the great
                work!
              </AlertDescription>
            </Alert>
          )}
          {showErrorAlert && (
            <Alert variant="destructive">
              <AlertTitle>Invalid Goal Amount</AlertTitle>
              <AlertDescription>
                Please set a goal higher than your current profit of $
                {currentProfit.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl font-normal text-foreground">
            Profit Goal
          </CardTitle>
          <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-lg">
                Edit Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Profit Goal</DialogTitle>
                <DialogDescription>
                  Enter your target profit goal amount.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="profitGoal">Target Profit</Label>
                  <Input
                    id="profitGoal"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="Enter target profit amount"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleGoalUpdate} disabled={isLoading}>
                  Save Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>{renderGoalContent()}</CardContent>
      </Card>
    </>
  );
}
