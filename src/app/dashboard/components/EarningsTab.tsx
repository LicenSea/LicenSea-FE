import { DollarSign, Award, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueDonutChart } from "./RevenueDonutChart";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import type { Work } from "@/types/work";

interface EarningsTabProps {
  myWorks: Work[];
  stats: {
    totalRevenue: number;
    salesRevenue: number;
    royaltyRevenue: number;
  };
}

interface Transaction {
  id: number;
  workId: string;
  workTitle: string;
  recipientAddress: string;
  amount: number;
  revenueType: "sales" | "royalty";
  transactionDigest: string;
  createdAt: string;
}

export const EarningsTab = ({ myWorks, stats }: EarningsTabProps) => {
  const currentAccount = useCurrentAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      if (!currentAccount?.address) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/earnings/transactions?creator=${currentAccount.address}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [currentAccount]);

  const getExplorerLink = (digest: string) => {
    return `https://suiexplorer.com/txblock/${digest}?network=testnet`;
  };

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
                  <p className="text-sm text-[#262d5c]/70 mt-1">SUI</p>
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Work</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-right p-2">Amount (SUI)</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <p className="font-medium truncate max-w-[200px]">
                              {tx.workTitle}
                            </p>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                tx.revenueType === "sales"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tx.revenueType === "sales" ? "Sales" : "Royalty"}
                            </Badge>
                          </td>
                          <td className="p-2 text-right">
                            <p className="font-semibold">
                              {tx.amount.toFixed(4)}
                            </p>
                          </td>
                          <td className="p-2">
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-2">
                            <a
                              href={getExplorerLink(tx.transactionDigest)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
