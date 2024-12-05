"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { useTrades } from "@/context/TradeContext";
import { cn } from "@/lib/utils";

interface DayData {
  date: Date;
  pnl: number;
  trades: number;
}

// Reusable UI components
const IconButton = ({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 hover:bg-accent rounded-full transition-colors",
      className
    )}
  >
    {children}
  </button>
);

const ViewToggleButton = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 rounded-lg transition-colors",
      isActive ? "bg-accent" : "hover:bg-accent/50"
    )}
  >
    {children}
  </button>
);

const ProfitLossText = ({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) => {
  const isProfitable = amount > 0;
  return (
    <span
      className={cn(
        "font-bold",
        isProfitable
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
        className
      )}
    >
      {formatCurrency(amount)}
    </span>
  );
};

// Calendar day component
const CalendarDay = ({ data }: { data: DayData }) => {
  const isProfitable = data.pnl > 0;

  return (
    <div
      className={cn(
        "aspect-square p-2 rounded-lg flex flex-col",
        isProfitable
          ? "bg-green-100 dark:bg-green-900/20"
          : "bg-red-100 dark:bg-red-900/20"
      )}
    >
      <span className="text-sm font-medium">{format(data.date, "d")}</span>
      <div className="flex-1 flex flex-col justify-center">
        <ProfitLossText amount={data.pnl} className="text-sm" />
        <span className="text-xs text-muted-foreground">
          {data.trades} trade{data.trades !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

// List item component
const ListItem = ({ data }: { data: DayData }) => (
  <div
    className={cn(
      "p-4 rounded-lg flex justify-between items-center",
      data.pnl > 0
        ? "bg-green-100 dark:bg-green-900/20"
        : "bg-red-100 dark:bg-red-900/20"
    )}
  >
    <div className="flex flex-col min-w-0 flex-1">
      <span className="font-medium truncate">
        {format(data.date, "MMM d, yyyy")}
      </span>
      <span className="text-sm text-muted-foreground">
        {data.trades} trade{data.trades !== 1 ? "s" : ""}
      </span>
    </div>
    <ProfitLossText amount={data.pnl} className="ml-4" />
  </div>
);

// Utility functions
const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000) {
    return `${amount >= 0 ? "" : "-"}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(1)}`;
};

// Main component
const PnlCalendar = () => {
  const { trades } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setViewMode("list");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days
      .map((day) => {
        const dayTrades = trades.filter((trade) => {
          const exitDate = new Date(trade.exit_date);
          return (
            isSameMonth(exitDate, currentMonth) &&
            format(exitDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
          );
        });

        return {
          date: day,
          pnl: dayTrades.reduce((sum, trade) => sum + trade.profit_loss, 0),
          trades: dayTrades.length,
        };
      })
      .filter((day) => day.trades > 0);
  }, [trades, currentMonth]);

  const CalendarView = () => (
    <div className="w-full max-w-screen-lg mx-auto">
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center p-2  font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {calendarData.map((day, index) => {
          const dayOfWeek = day.date.getDay();
          const paddingDays = index === 0 ? dayOfWeek : 0;

          return (
            <React.Fragment key={day.date.toISOString()}>
              {index === 0 &&
                [...Array(paddingDays)].map((_, i) => (
                  <div
                    key={`padding-${i}`}
                    className="aspect-square bg-muted/20 rounded-lg"
                  />
                ))}
              <CalendarDay data={day} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-2 w-full max-w-screen-lg mx-auto">
      {calendarData.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No trades recorded for this month
        </div>
      ) : (
        calendarData.map((day) => (
          <ListItem key={day.date.toISOString()} data={day} />
        ))
      )}
    </div>
  );

  return (
    <Card className="w-full bg-background">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <IconButton
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.setMonth(prev.getMonth() - 1))
                )
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <IconButton
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.setMonth(prev.getMonth() + 1))
                )
              }
            >
              <ChevronRight className="h-5 w-5" />
            </IconButton>
          </div>

          {!isMobile && (
            <div className="hidden sm:flex gap-2">
              <ViewToggleButton
                isActive={viewMode === "calendar"}
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="h-5 w-5" />
              </ViewToggleButton>
              <ViewToggleButton
                isActive={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </ViewToggleButton>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          {isMobile ? (
            <ListView />
          ) : viewMode === "calendar" ? (
            <CalendarView />
          ) : (
            <ListView />
          )}
        </div>
      </div>
    </Card>
  );
};

export default PnlCalendar;
