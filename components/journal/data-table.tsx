"use client";

import { useState, useOptimistic, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { Trade } from "@/types";
import type { Column, SortDirection } from "./table-columns";
import type { FilterValues } from "./table-filters";
import { TableFilters } from "./table-filters";
import { TablePagination } from "./table-pagination";
import { TableActions } from "./table-actions";
import { renderCell } from "./table-cell-renderer";
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { getFilteredTrades } from "@/lib/actions/trades";

interface DataTableProps {
  initialData: Trade[];
  columns: Column[];
  userId: string;
}

export function DataTable({ initialData, columns, userId }: DataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticTrades, updateOptimisticTrades] = useOptimistic(initialData);

  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade;
    direction: SortDirection;
  }>({
    key: "entry_date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = async (filters: FilterValues) => {
    try {
      setIsLoading(true);
      const { data: filteredData, error } = await getFilteredTrades(
        userId,
        filters
      );

      if (error) {
        throw error;
      }

      if (filteredData) {
        startTransition(() => {
          updateOptimisticTrades(filteredData);
        });
        setCurrentPage(1);
        setExpandedRows(new Set());
      }
    } catch (error) {
      console.error("Failed to filter trades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    startTransition(() => {
      updateOptimisticTrades((currentTrades) =>
        currentTrades.filter((trade) => trade.id !== tradeId)
      );
    });
  };

  const toggleRow = (tradeId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(tradeId)) {
      newExpandedRows.delete(tradeId);
    } else {
      newExpandedRows.add(tradeId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (key: keyof Trade) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort data
  const sortedData = [...optimisticTrades].sort((a, b) => {
    if (sortConfig.direction === null) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue === null) return sortConfig.direction === "asc" ? -1 : 1;
    if (bValue === null) return sortConfig.direction === "asc" ? 1 : -1;

    return sortConfig.direction === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  // Paginate data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <TableFilters onFilterChange={handleFilterChange} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} className="hidden md:table-cell">
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="hover:bg-transparent"
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead className="hidden md:table-cell w-[70px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="h-24 text-center"
                >
                  No trades found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData
                .map((trade) => [
                  <TableRow
                    key={`row-${trade.id}`}
                    className="cursor-pointer"
                    onClick={() => toggleRow(trade.id)}
                  >
                    <TableCell>
                      {expandedRows.has(trade.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    {/* Mobile View */}
                    <TableCell
                      className="md:hidden"
                      colSpan={columns.length + 1}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium">
                            {trade.instrument} - {trade.direction.toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {renderCell(
                              "profit_loss",
                              trade.profit_loss,
                              trade
                            )}
                          </div>
                        </div>
                        <TableActions
                          trade={trade}
                          onDelete={handleDelete}
                          onRefresh={() => router.refresh()}
                        />
                      </div>
                    </TableCell>
                    {/* Desktop View */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="hidden md:table-cell"
                      >
                        {renderCell(column.key, trade[column.key], trade)}
                      </TableCell>
                    ))}
                    <TableCell className="hidden md:table-cell">
                      <TableActions
                        trade={trade}
                        onDelete={handleDelete}
                        onRefresh={() => router.refresh()}
                      />
                    </TableCell>
                  </TableRow>,
                  expandedRows.has(trade.id) && (
                    <TableRow
                      key={`expanded-${trade.id}`}
                      className="md:hidden"
                    >
                      <TableCell colSpan={columns.length + 2}>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {columns
                              .filter(
                                (col) =>
                                  ![
                                    "instrument",
                                    "direction",
                                    "profit_loss",
                                  ].includes(col.key)
                              )
                              .map((col) => (
                                <div key={col.key}>
                                  <label className="text-sm font-medium">
                                    {col.label}
                                  </label>
                                  <div>
                                    {renderCell(col.key, trade[col.key], trade)}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {trade.notes && (
                            <div>
                              <label className="text-sm font-medium">
                                Notes
                              </label>
                              <div className="text-sm">{trade.notes}</div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                ])
                .flat()
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        totalItems={sortedData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
