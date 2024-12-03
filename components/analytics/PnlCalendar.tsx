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
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import { useTrades } from "@/context/TradeContext";

interface DayData {
  date: Date;
  pnl: number;
  trades: number;
}

const PnlCalendar = () => {
  const { trades } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Set default view based on screen size
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth >= 640 ? "calendar" : "list");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.setMonth(prev.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.setMonth(prev.getMonth() + 1)));
  };

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
      .filter((day) => day.trades > 0); // Filter out no-trade days for list view
  }, [trades, currentMonth]);

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000) {
      return `${amount >= 0 ? "" : "-"}$${(absAmount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(1)}`;
  };

  const CalendarView = () => (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="text-center p-2 text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}
      {calendarData.map((day, index) => {
        const dayOfWeek = day.date.getDay();
        const isProfitable = day.pnl > 0;
        const paddingDays = index === 0 ? dayOfWeek : 0;

        return (
          <React.Fragment key={day.date.toISOString()}>
            {index === 0 &&
              [...Array(paddingDays)].map((_, i) => (
                <div
                  key={`padding-${i}`}
                  className="aspect-square   bg-muted/20 rounded-lg"
                />
              ))}
            <div
              className={`aspect-square p-3 rounded-lg flex flex-col ${
                isProfitable
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              <div className="text-md font-medium">{format(day.date, "d")}</div>
              <div className="flex-1 flex flex-col justify-center">
                <div
                  className={`text-lg font-bold ${
                    isProfitable
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(day.pnl)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.trades} trade{day.trades !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {calendarData.length === 0 ? (
        <div className="col-span-7 py-12 text-center text-muted-foreground">
          No trades recorded for this month
        </div>
      ) : (
        calendarData.map((day, index) => (
          <div
            key={day.date.toISOString()}
            className={`p-4 rounded-lg flex justify-between items-center ${
              day.pnl > 0
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {format(day.date, "MMM d, yyyy")}
              </span>
              <span className="text-sm text-muted-foreground">
                {day.trades} trade{day.trades !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              className={`text-lg font-bold ${
                day.pnl > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(day.pnl)}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className="w-full bg-background">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold flex items-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "calendar" ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? <CalendarView /> : <ListView />}
      </div>
    </Card>
  );
};

export default PnlCalendar;
