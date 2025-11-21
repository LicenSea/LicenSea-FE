import { DollarSign, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueDonutChart } from "./RevenueDonutChart";
import type { Work } from "@/types/work";

interface EarningsTabProps {
  myWorks: Work[];
  stats: {
    totalRevenue: number;
    salesRevenue: number;
    royaltyRevenue: number;
  };
}

export const EarningsTab = ({ myWorks, stats }: EarningsTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Earnings</h2>
        <p className="text-muted-foreground">Your revenue breakdown</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* 총 수익 */}
          <Card className="bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#262d5c]/70 mb-1">
                    Total Earnings
                  </p>
                  <p className="text-4xl font-bold text-[#262d5c]">
                    {stats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-[#262d5c]/70 mt-1">SUI + ETH</p>
                </div>
                <Award className="w-16 h-16 text-[#262d5c]/50" />
              </div>
            </CardContent>
          </Card>

          {/* 수익 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.salesRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">SUI</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From {myWorks.length}{" "}
                  {myWorks.length === 1 ? "work" : "works"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Royalty Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.royaltyRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">SUI</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From derivative works
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 수익 상세 내역 (향후 구현) */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Transaction history will be displayed here</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueDonutChart
              salesRevenue={stats.salesRevenue}
              royaltyRevenue={stats.royaltyRevenue}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
