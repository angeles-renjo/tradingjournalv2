"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ActivitySquare, Calendar } from "lucide-react";
import Link from "next/link";
import { TradeEntryForm } from "@/components/TradeEntryForm";
import { getTradeAnalytics, getTradesByUser } from "@/app/actions/trade";
import type { Trade, Analytics, DashboardProps, ApiError } from "@/types";

export default function Dashboard({ userId }: DashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    try {
      const [analyticsData, tradesData] = await Promise.all([
        getTradeAnalytics(userId),
        getTradesByUser(userId),
      ]);

      // Sort trades by created_at in descending order (newest first)
      const sortedTrades = tradesData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAnalytics(analyticsData);
      setRecentTrades(sortedTrades.slice(0, 5)); // Take only the 5 most recent trades
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err as ApiError;
      setError(errorMessage.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTradeAdded = () => {
    fetchDashboardData();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track, analyze, and improve your trading performance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <TradeEntryForm userId={userId} onTradeAdded={handleTradeAdded} />
        </Card>

        <Link href="/analysis">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-500">View your performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold">Journal</h3>
                  <p className="text-sm text-gray-500">Review your trades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "--.-" : `${analytics?.winRate ?? 0}%`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? "--.-"
                : (analytics?.profitFactor.toFixed(2) ?? "0.00")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "--" : (analytics?.totalTrades ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (analytics?.totalProfit ?? 0) > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {loading
                ? "$--.-"
                : `$${(analytics?.totalProfit ?? 0).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : recentTrades.length > 0 ? (
            <div className="divide-y">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{trade.instrument}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(trade.entry_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            trade.direction === "long"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trade.direction.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        trade.profit_loss > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      ${trade.profit_loss.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ActivitySquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No trades recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
