"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Goal } from "@/types";

interface GoalProgressDetailsProps {
  goal: Goal;
  currentProfit: number;
  onDelete: (goalId: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function GoalProgressDetails({
  goal,
  currentProfit,
  onDelete,
  onClose,
  isLoading,
}: GoalProgressDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.status === "achieved") return "100.0";
    if (goal.status === "failed") return "0.0";
    return ((currentProfit / goal.target_amount) * 100).toFixed(1);
  };

  const getStatusBadge = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Progress
          </Badge>
        );
      case "achieved":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-2 bg-green-500"
          >
            <CheckCircle2 className="h-4 w-4" />
            Achieved
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Goal Details</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Target Amount</Label>
          <div className="font-medium">
            {formatCurrency(goal.target_amount)}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Current Progress</Label>
          <div className="font-medium">{calculateProgress(goal)}%</div>
        </div>

        <div className="grid gap-2">
          <Label>Timeline</Label>
          <div className="text-sm text-muted-foreground">
            Start: {formatDate(goal.start_date)}
            {goal.end_date && (
              <>
                <br />
                End: {formatDate(goal.end_date)}
              </>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <div>{getStatusBadge(goal.status)}</div>
        </div>

        {goal.achieved && goal.achieved_at && (
          <div className="grid gap-2">
            <Label>Achieved Date</Label>
            <div className="text-sm text-muted-foreground">
              {formatDate(goal.achieved_at)}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex justify-between">
        <Button
          variant="destructive"
          onClick={() => onDelete(goal.id)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Goal
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
