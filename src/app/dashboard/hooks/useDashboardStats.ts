import { useMemo } from "react";
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
  return useMemo(() => {
    const totalWorks = myWorks.length;
    const totalPurchases = purchasedWorks.length;
    const totalLicenses = purchasedLicenses.length;
    const totalDerivatives = myDerivatives.length;

    // 수익 계산 (임시)
    const salesRevenue = myWorks.reduce((sum, work) => sum + work.fee, 0);
    const royaltyRevenue = 0; // TODO: 실제 로열티 수익 계산
    const totalRevenue = salesRevenue + royaltyRevenue;

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
  }, [myWorks, purchasedWorks, purchasedLicenses, myDerivatives]);
};
