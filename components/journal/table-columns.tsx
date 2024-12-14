import type { Trade } from "@/types";

export type SortDirection = "asc" | "desc" | null;

export interface Column {
  key: keyof Trade;
  label: string;
  sortable?: boolean;
}

export const columns: Column[] = [
  {
    key: "entry_date",
    label: "Date",
    sortable: true,
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
  },
  {
    key: "entry_price",
    label: "Entry",
    sortable: true,
  },
  {
    key: "exit_price",
    label: "Exit",
    sortable: true,
  },
  {
    key: "position_size",
    label: "Size",
    sortable: true,
  },
  {
    key: "profit_loss",
    label: "P/L",
    sortable: true,
  },
  {
    key: "setup_type",
    label: "Setup",
    sortable: true,
  },
];
