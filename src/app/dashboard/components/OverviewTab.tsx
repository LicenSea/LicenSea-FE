import { useRouter } from "next/navigation";
import { Package, ShoppingBag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "./ProfileCard";
import { useClaimHistory } from "../hooks/useClaimHistory";
import type { Work } from "@/types/work";
import type { TabType } from "../types";

interface OverviewTabProps {
  currentUserAddress: string;
  myWorks: Work[];
  purchasedWorks: Work[];
  stats: {
    totalWorks: number;
    totalPurchases: number;
    salesRevenue: number;
    royaltyRevenue: number;
    totalRevenue: number;
  };
  onTabChange: (tab: TabType) => void;
}

export const OverviewTab = ({
  currentUserAddress,
  myWorks,
  purchasedWorks,
  stats,
  onTabChange,
}: OverviewTabProps) => {
  const router = useRouter();
  const { claimHistory } = useClaimHistory();

  return (
    <div className="space-y-4">
      {/* 프로필 정보 */}
      <ProfileCard currentUserAddress={currentUserAddress} />

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Works
                </p>
                <p className="text-2xl font-bold">{stats.totalWorks}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Purchased Works
                </p>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1 ">
                  Total Revenue
                </p>
                <div className="flex gap-2">
                  <p className="text-2xl font-bold">
                    {stats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">SUI</p>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Works</CardTitle>
          </CardHeader>
          <CardContent>
            {myWorks.length > 0 ? (
              <div className="space-y-4">
                {myWorks.slice(0, 3).map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/work/${work.id}`)}
                  >
                    {work.preview_uri ? (
                      <img
                        src={work.preview_uri}
                        alt={work.metadata.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {work.metadata.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {work.fee > 0 ? `${work.fee} SUI` : "FREE"}
                      </p>
                    </div>
                  </div>
                ))}
                {myWorks.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onTabChange("my-works")}
                  >
                    View All ({myWorks.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No works yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/upload")}
                >
                  Upload Your First Work
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {purchasedWorks.length > 0 ? (
              <div className="space-y-4">
                {purchasedWorks.slice(0, 3).map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/work/${work.id}`)}
                  >
                    {work.preview_uri ? (
                      <img
                        src={work.preview_uri}
                        alt={work.metadata.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {work.metadata.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {work.fee > 0 ? `${work.fee} SUI` : "FREE"}
                      </p>
                    </div>
                  </div>
                ))}
                {purchasedWorks.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onTabChange("purchased")}
                  >
                    View All ({purchasedWorks.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No purchases yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/marketplace")}
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 col-span-1">
          <div className="space-y-4">
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

            {/* Claim 이력 */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Work
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimHistory.length > 0 ? (
                        claimHistory.map((transaction, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline">
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                {transaction.workPreview && (
                                  <img
                                    src={transaction.workPreview}
                                    alt={transaction.workTitle}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <span className="truncate max-w-[200px]">
                                  {transaction.workTitle}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">
                              {transaction.amount.toFixed(4)} SUI
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge
                                variant={
                                  transaction.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-12 text-center text-muted-foreground"
                          >
                            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No transaction history yet</p>
                            <p className="text-sm mt-2">
                              Claim transactions will appear here
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
