import { useMemo, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { Work } from "@/types/work";

interface DashboardStats {
  totalWorks: number;
  totalPurchases: number;
  totalLicenses: number;
  totalDerivatives: number;
  salesRevenue: number;
  royaltyRevenue: number;
  totalRevenue: number;
  totalViews: number;
}

interface UseDashboardStatsProps {
  myWorks: Work[];
  purchasedWorks: Work[];
  purchasedLicenses: Work[];
  myDerivatives: Work[];
}

export const useDashboardStats = ({
  myWorks,
  purchasedWorks,
  purchasedLicenses,
  myDerivatives,
}: UseDashboardStatsProps): DashboardStats => {
  const currentAccount = useCurrentAccount();
  const [revenueStats, setRevenueStats] = useState({
    salesRevenue: 0,
    royaltyRevenue: 0,
    totalRevenue: 0,
  });

  // 실제 revenue 통계 로드
  useEffect(() => {
    async function loadRevenueStats() {
      if (!currentAccount?.address) {
        return;
      }

      try {
        const response = await fetch(
          `/api/earnings/stats?creator=${currentAccount.address}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch revenue stats");
        }
        const data = await response.json();
        setRevenueStats({
          salesRevenue: data.salesRevenue || 0,
          royaltyRevenue: data.royaltyRevenue || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error loading revenue stats:", error);
      }
    }

    loadRevenueStats();
  }, [currentAccount]);

  return useMemo(() => {
    const totalWorks = myWorks.length;
    const totalPurchases = purchasedWorks.length;
    const totalLicenses = purchasedLicenses.length;
    const totalDerivatives = myDerivatives.length;

    // 실제 revenue 통계 사용
    const salesRevenue = revenueStats.salesRevenue;
    const royaltyRevenue = revenueStats.royaltyRevenue;
    const totalRevenue = revenueStats.totalRevenue;

    // 조회수 (임시)
    const totalViews = myWorks.length * 10; // TODO: 실제 조회수 API 연동

    return {
      totalWorks,
      totalPurchases,
      totalLicenses,
      totalDerivatives,
      salesRevenue,
      royaltyRevenue,
      totalRevenue,
      totalViews,
    };
  }, [myWorks, purchasedWorks, purchasedLicenses, myDerivatives, revenueStats]);
};
