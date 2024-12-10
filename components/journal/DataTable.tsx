// components/journal/DataTable.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trade } from "@/types";
import { Column, SortDirection } from "./TableColumns";
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { FilterValues } from "./TableFilters";
import { TablePagination } from "./TablePagination";
import { TableActions } from "./TableActions";
import { deleteTrade } from "@/app/actions/trades";

interface DataTableProps {
  columns: Column[];
  data: Trade[];
  filters: FilterValues;
  onEdit: (trade: Trade) => void;
  onRefresh: () => Promise<void>;
}

export function DataTable({
  columns,
  data,
  filters,
  onEdit,
  onRefresh,
}: DataTableProps) {
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

  const handleDelete = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId);
      await onRefresh();
    } catch (error) {
      console.error("Failed to delete trade:", error);
    }
  };

  // Filter data based on current filters
  const filteredData = data.filter((trade) => {
    // Direction filter
    if (filters.direction !== "all" && trade.direction !== filters.direction) {
      return false;
    }

    // Setup type filter
    if (filters.setupType !== "all" && trade.setup_type !== filters.setupType) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const tradeDate = new Date(trade.entry_date);
      if (filters.dateRange.from && tradeDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (tradeDate > endDate) {
          return false;
        }
      }
    }

    // Profit range filter
    if (
      filters.profitRange.min &&
      trade.profit_loss < parseFloat(filters.profitRange.min)
    ) {
      return false;
    }
    if (
      filters.profitRange.max &&
      trade.profit_loss > parseFloat(filters.profitRange.max)
    ) {
      return false;
    }

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="space-y-4">
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
            {paginatedData.length === 0 ? (
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
                    {/* Mobile View (Always Visible) */}
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
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(trade.profit_loss)}
                          </div>
                        </div>
                        <TableActions
                          trade={trade}
                          onEdit={() => onEdit(trade)}
                          onDelete={() => handleDelete(trade.id)}
                        />
                      </div>
                    </TableCell>
                    {/* Desktop View */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="hidden md:table-cell"
                      >
                        {column.render
                          ? column.render(trade[column.key], trade)
                          : trade[column.key]?.toString()}
                      </TableCell>
                    ))}
                    <TableCell className="hidden md:table-cell">
                      <TableActions
                        trade={trade}
                        onEdit={() => onEdit(trade)}
                        onDelete={() => handleDelete(trade.id)}
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
                            <div>
                              <label className="text-sm font-medium">
                                Entry Price
                              </label>
                              <div>{trade.entry_price}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Exit Price
                              </label>
                              <div>{trade.exit_price}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Position Size
                              </label>
                              <div>{trade.position_size}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Setup Type
                              </label>
                              <div>{trade.setup_type}</div>
                            </div>
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
