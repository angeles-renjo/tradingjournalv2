// app/protected/dashboard/_components/action-cards.tsx
import { TradeEntryForm } from "@/components/TradeEntryForm";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export function ActionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow">
        {/* TradeEntryForm will be rendered from parent */}
        <TradeEntryForm />
      </Card>

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
  );
}
