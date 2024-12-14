"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";

export default function NavLinks() {
  return (
    <>
      <Link href="/protected/analytics">
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

      <Link href="/protected/journal">
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
    </>
  );
}
