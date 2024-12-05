"use client";
import React, { useState } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTradeData } from "@/context/DataContext";

export default function ProfitGoalTracker() {
  const { analytics, goalTarget, setGoalTarget } = useTradeData();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetAmount, setTargetAmount] = useState(
    goalTarget?.toString() || ""
  );

  const currentProfit = analytics?.totalProfit || 0;
  const progressPercentage = goalTarget
    ? (currentProfit / goalTarget) * 100
    : 0;
  const remainingPercentage = Math.max(
    0,
    Math.min(100 - progressPercentage, 100)
  );

  const chartData = [
    { name: "currentProgress", value: progressPercentage },
    { name: "remaining", value: remainingPercentage },
  ];

  const CHART_COLORS = {
    progress: "#22c55e",
    background: "hsl(var(--muted))",
  };

  const handleGoalUpdate = () => {
    const newGoalAmount = parseFloat(targetAmount);
    if (!isNaN(newGoalAmount) && newGoalAmount > 0) {
      setGoalTarget(newGoalAmount);
      setIsEditingGoal(false);
    }
  };

  const renderGoalContent = () => {
    if (!analytics || currentProfit === 0) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No trades found</p>
        </div>
      );
    }

    if (!goalTarget) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">
            Set a goal to track your progress
          </p>
        </div>
      );
    }

    return (
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
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0
                      ? CHART_COLORS.progress
                      : CHART_COLORS.background
                  }
                  strokeWidth={0}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-foreground">
            {progressPercentage.toFixed(1)}%
          </div>
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="text-sm text-muted-foreground">
              Current: ${currentProfit.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Goal: ${goalTarget.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
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
            <div className="flex justify-end">
              <Button onClick={handleGoalUpdate}>Save Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>{renderGoalContent()}</CardContent>
    </Card>
  );
}
