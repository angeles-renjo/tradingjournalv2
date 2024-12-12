"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GoalProgressFormProps {
  onSubmit: (e: React.FormEvent) => void;
  targetAmount: string;
  setTargetAmount: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  isLoading: boolean;
}

export function GoalProgressForm({
  onSubmit,
  targetAmount,
  setTargetAmount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isLoading,
}: GoalProgressFormProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Goal</DialogTitle>
        <DialogDescription>
          Set a new profit target with timeline for your trades.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="targetAmount">Target Profit</Label>
          <Input
            id="targetAmount"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Enter target profit amount"
            step="0.01"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Goal"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
