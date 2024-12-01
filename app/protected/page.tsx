"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ActivitySquare, Calendar } from "lucide-react";
import Link from "next/link";
import { TradeEntryForm } from "@/components/TradeEntryForm";

export default function Dashboard({ userId }: { userId: string }) {
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
          <TradeEntryForm userId={userId} />
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
            <div className="text-2xl font-bold">--.--%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-.--</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$-.--</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ActivitySquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No trades recorded yet</p>
            <TradeEntryForm userId={userId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
