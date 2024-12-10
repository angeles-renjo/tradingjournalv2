// app/protected/journal/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useTrades } from "@/context/TradeContext";
import { DataTable } from "@/components/journal/DataTable";
import { TableFilters, FilterValues } from "@/components/journal/TableFilters";
import { columns } from "@/components/journal/TableColumns";

const INITIAL_FILTERS: FilterValues = {
  direction: "all",
  setupType: "all",
  dateRange: {
    from: null,
    to: null,
  },
  profitRange: {
    min: "",
    max: "",
  },
};

export default function JournalPage() {
  const { trades, loading, error } = useTrades();
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
      </div>

      <TableFilters onFilterChange={setFilters} />

      <Card className="p-4">
        <DataTable columns={columns} data={trades} filters={filters} />
      </Card>
    </div>
  );
}
