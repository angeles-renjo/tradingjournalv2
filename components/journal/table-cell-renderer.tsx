"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@/types";

export function renderCell(
  column: keyof Trade,
  value: Trade[keyof Trade],
  trade: Trade
): React.ReactNode {
  switch (column) {
    case "entry_date":
      return format(new Date(value as string), "MMM dd, yyyy");

    case "direction":
      return (
        <Badge variant={value === "long" ? "default" : "secondary"}>
          {(value as string).charAt(0).toUpperCase() +
            (value as string).slice(1)}
        </Badge>
      );

    case "entry_price":
    case "exit_price":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value as number);

    case "profit_loss":
      return (
        <span
          className={`${(value as number) > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            signDisplay: "always",
          }).format(value as number)}
        </span>
      );

    case "setup_type":
      return (
        <Badge variant="outline">
          {(value as string)
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      );

    default:
      return value?.toString();
  }
}
