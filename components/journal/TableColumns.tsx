// components/journal/TableColumns.tsx
"use client";

import { Trade } from "@/types";
import { format } from "date-fns";

export type SortDirection = "asc" | "desc" | null;

export type Column = {
  key: keyof Trade;
  label: string;
  sortable?: boolean;
  render?: (value: Trade[keyof Trade], trade: Trade) => React.ReactNode;
};

export const columns: Column[] = [
  {
    key: "entry_date",
    label: "Date",
    sortable: true,
    render: (value) => format(new Date(value as string), "MMM dd, yyyy"),
  },
  {
    key: "instrument",
    label: "Instrument",
    sortable: true,
  },
  {
    key: "direction",
    label: "Direction",
    sortable: true,
    render: (value) =>
      (value as string).charAt(0).toUpperCase() + (value as string).slice(1),
  },
  {
    key: "profit_loss",
    label: "P/L",
    sortable: true,
    render: (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value as number),
  },
];
