"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTradeData } from "@/context/DataContext";
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  getGoals,
  setGoal,
  updateGoalStatus,
  deleteGoal,
} from "@/app/actions/goals";
import type { Goal } from "@/types";

// Loading Card Component
const LoadingCard = () => (
  <Card className="p-4 sm:p-6">
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground">Loading...</span>
    </div>
  </Card>
);

export default function GoalProgress() {
  const { analytics } = useTradeData();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: string;
    message: string;
  }>({ show: false, type: "", message: "" });

  const currentProfit = analytics?.totalProfit || 0;

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (currentProfit > 0 && goals.length > 0) {
      checkGoalsProgress();
    }
  }, [currentProfit, goals]);

  const showAlert = (type: string, message: string) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: "", message: "" });
    }, 2000);
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await getGoals();

      if (response.error) {
        showAlert("error", response.error);
        return;
      }

      if (response.data) {
        setGoals(response.data);
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      showAlert("error", "Failed to fetch goals");
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
      console.error("Error deleting goal:", err);
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
        if (currentProfit >= goal.target_amount) {
          const response = await updateGoalStatus(goal.id, "achieved");
          if (response.data) {
            setGoals((prev) =>
              prev.map((g) => (g.id === goal.id ? response.data! : g))
            );
            showAlert("success", "Goal achieved! Congratulations!");
          }
        } else if (goal.end_date && new Date(goal.end_date) < new Date()) {
          const response = await updateGoalStatus(goal.id, "failed");
          if (response.data) {
            setGoals((prev) =>
              prev.map((g) => (g.id === goal.id ? response.data! : g))
            );
            showAlert("error", "Goal timeline expired");
          }
        }
      }
    });
  };

  const resetForm = () => {
    setTargetAmount("");
    setStartDate("");
    setEndDate("");
  };

  const handleAddGoal = async () => {
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
      } else {
        showAlert("error", "Failed to create goal: No response data");
      }
    } catch (err) {
      console.error("Error adding goal:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Failed to add goal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDetailsDialog(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.status === "achieved") return "100.0";
    if (goal.status === "failed") return "0.0";
    return ((currentProfit / goal.target_amount) * 100).toFixed(1);
  };

  const renderGoalsList = () => (
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
                {goal.end_date ? ` - ${formatDate(goal.end_date)}` : ""}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(goal)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderEmptyState = () => (
    <div className="flex h-[300px] flex-col items-center justify-center gap-4">
      <Target className="h-12 w-12 text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        No goals set yet. Create your first trading goal!
      </p>
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogTrigger asChild>
          <Button>Add Goal</Button>
        </DialogTrigger>
        <DialogContent>
          {alertInfo.show && (
            <Alert
              variant={alertInfo.type === "error" ? "destructive" : "default"}
              className={`mb-4 ${
                alertInfo.type === "success"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : ""
              }`}
            >
              <AlertTitle>
                {alertInfo.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 inline mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 inline mr-2" />
                )}
                {alertInfo.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Alert>
          )}
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a new profit target with timeline for your trades.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target Profit</Label>
              <Input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Enter target profit amount"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
          </div>
          <DialogFooter>
            <Button onClick={handleAddGoal} disabled={isLoading}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 grid-cols-1">
          <LoadingCard />
        </div>
      );
    }

    if (!goals.length) {
      return renderEmptyState();
    }

    return renderGoalsList();
  };

  return (
    <div className="relative">
      {alertInfo.show && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <Alert
            variant={alertInfo.type === "error" ? "destructive" : "default"}
            className={`w-[90%] max-w-md shadow-lg ${
              alertInfo.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : ""
            }`}
          >
            <AlertTitle>
              {alertInfo.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
              ) : (
                <XCircle className="h-4 w-4 inline mr-2" />
              )}
              {alertInfo.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Trading Goals</CardTitle>
          {goals.length > 0 && (
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set a new profit target with timeline for your trades.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="targetAmount">Target Profit</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="Enter target profit amount"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
                </div>
                <DialogFooter>
                  <Button onClick={handleAddGoal} disabled={isLoading}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <Dialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) setSelectedGoal(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          {alertInfo.show && (
            <Alert
              variant={alertInfo.type === "error" ? "destructive" : "default"}
              className={`mb-4 ${
                alertInfo.type === "success"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : ""
              }`}
            >
              <AlertTitle>
                {alertInfo.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 inline mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 inline mr-2" />
                )}
                {alertInfo.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Alert>
          )}
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Target Amount</Label>
                <div className="font-medium">
                  {formatCurrency(selectedGoal.target_amount)}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Current Progress</Label>
                <div className="font-medium">
                  {calculateProgress(selectedGoal)}%
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Timeline</Label>
                <div className="text-sm text-muted-foreground">
                  Start: {formatDate(selectedGoal.start_date)}
                  {selectedGoal.end_date && (
                    <>
                      <br />
                      End: {formatDate(selectedGoal.end_date)}
                    </>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="text-sm text-muted-foreground capitalize">
                  {selectedGoal.status}
                </div>
              </div>
              {selectedGoal.achieved && selectedGoal.achieved_at && (
                <div className="grid gap-2">
                  <Label>Achieved Date</Label>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedGoal.achieved_at)}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => selectedGoal && handleDeleteGoal(selectedGoal.id)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Goal
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
