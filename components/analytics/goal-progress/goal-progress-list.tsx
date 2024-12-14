"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Goal } from "@/types";

interface GoalProgressListProps {
  goals: Goal[];
  currentProfit: number;
  onViewDetails: (goal: Goal) => void;
  onAddGoal: () => void;
}

export function GoalProgressList({
  goals,
  currentProfit,
  onViewDetails,
  onAddGoal,
}: GoalProgressListProps) {
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

  if (!goals.length) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4">
        <Target className="h-12 w-12 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          No goals set yet. Create your first trading goal!
        </p>
        <Button onClick={onAddGoal}>Add Goal</Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Timeline</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {goals.map((goal) => (
          <TableRow key={goal.id}>
            <TableCell className="font-medium">
              {formatCurrency(goal.target_amount)}
            </TableCell>
            <TableCell>{calculateProgress(goal)}%</TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {formatDate(goal.start_date)}
                {goal.end_date && ` - ${formatDate(goal.end_date)}`}
              </span>
            </TableCell>
            <TableCell>{getStatusBadge(goal.status)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(goal)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
