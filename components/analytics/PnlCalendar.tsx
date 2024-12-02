"use client";
import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTrades } from "@/context/TradeContext";
import type { Trade } from "@/types";

interface DayData {
  date: Date;
  pnl: number;
  trades: number;
}

const PnlCalendar = () => {
  const { trades } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
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
    });
  }, [trades, currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.setMonth(prev.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.setMonth(prev.getMonth() + 1)));
  };

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000) {
      return `${amount >= 0 ? "" : "-"}$${(absAmount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(1)}`;
  };

  return (
    <Card className="w-full bg-background">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

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
            const hasNoTrades = day.trades === 0;

            // Add padding for first week
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

                <div
                  className={`aspect-square p-3 rounded-lg transition-colors flex flex-col ${
                    hasNoTrades
                      ? "bg-muted/20"
                      : isProfitable
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                  }`}
                >
                  <div className="text-md font-medium">
                    {format(day.date, "d")}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    {!hasNoTrades && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PnlCalendar;
