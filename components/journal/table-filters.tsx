"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradeDirection, TradeSetupType } from "@/types";

export interface FilterValues {
  direction: TradeDirection | "all";
  setupType: TradeSetupType | "all";
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  profitRange: {
    min: string;
    max: string;
  };
}

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

interface TableFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function TableFilters({ onFilterChange }: TableFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    onFilterChange(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.direction !== "all" ||
    filters.setupType !== "all" ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null ||
    filters.profitRange.min !== "" ||
    filters.profitRange.max !== "";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <FilterX className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Direction Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Direction</label>
          <Select
            value={filters.direction}
            onValueChange={(value: TradeDirection | "all") =>
              handleFilterChange("direction", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Setup Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Setup Type</label>
          <Select
            value={filters.setupType}
            onValueChange={(value: TradeSetupType | "all") =>
              handleFilterChange("setupType", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select setup type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="breakout">Breakout</SelectItem>
              <SelectItem value="trend-following">Trend Following</SelectItem>
              <SelectItem value="reversal">Reversal</SelectItem>
              <SelectItem value="range">Range</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "PP")
                  ) : (
                    <span>From</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      from: date,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "PP")
                  ) : (
                    <span>To</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      to: date,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Profit Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Profit Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.profitRange.min}
              onChange={(e) =>
                handleFilterChange("profitRange", {
                  ...filters.profitRange,
                  min: e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.profitRange.max}
              onChange={(e) =>
                handleFilterChange("profitRange", {
                  ...filters.profitRange,
                  max: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
