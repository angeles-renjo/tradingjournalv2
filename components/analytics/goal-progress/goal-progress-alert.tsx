"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { AlertInfo } from "@/types";

interface GoalProgressAlertProps {
  alertInfo: AlertInfo;
}

export function GoalProgressAlert({ alertInfo }: GoalProgressAlertProps) {
  if (!alertInfo.show) return null;

  return (
    <Alert
      variant={alertInfo.type === "error" ? "destructive" : "default"}
      className={
        alertInfo.type === "success"
          ? "bg-green-50 border-green-500 text-green-700"
          : ""
      }
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
  );
}
