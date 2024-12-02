"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ActivitySquare, Calendar } from "lucide-react";
import Link from "next/link";
import { TradeEntryForm } from "@/components/TradeEntryForm";
import { useTradeData } from "@/context/DataContext";
import { useTradeOperations } from "@/context/OperationsContext";

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{message}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { trades: recentTrades, analytics } = useTradeData();
  const { error } = useTradeOperations();

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track, analyze, and improve your trading performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <TradeEntryForm />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${analytics?.winRate ?? 0}%`}
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
              {analytics?.profitFactor?.toFixed(2) ?? "0.00"}
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
              {analytics?.totalTrades ?? 0}
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
              {`$${(analytics?.totalProfit ?? 0).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length > 0 ? (
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
