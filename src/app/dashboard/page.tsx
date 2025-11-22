"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { mockWorks } from "@/data";
import { DashboardTabs } from "./components/DashboardTabs";
import { OverviewTab } from "./components/OverviewTab";
import { MyWorksTab } from "./components/MyWorksTab";
import { PurchasedTab } from "./components/PurchasedTab";
import { DerivativesTab } from "./components/DerivativesTab";
import { EarningsTab } from "./components/EarningsTab";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useDerivativeTrees } from "./hooks/useDerivativeTrees";
import type { TabType } from "./types";
import { Work } from "@/types/work";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [myWorks, setMyWorks] = useState<Work[]>([]);
  const [purchasedWorks, setPurchasedWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const currentAccount = useCurrentAccount();

  // 내 작품들 로드
  useEffect(() => {
    async function loadMyWorks() {
      if (!currentAccount?.address) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/works/my?creator=${currentAccount.address}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch my works");
        }
        const data = await response.json();
        setMyWorks(data.works || []);
      } catch (error) {
        console.error("Error loading my works:", error);
        setMyWorks([]);
      } finally {
        setLoading(false);
      }
    }

    loadMyWorks();
  }, [currentAccount]);

  // 내가 구매한 작품들 로드 (View 객체 소유)
  useEffect(() => {
    async function loadPurchasedWorks() {
      if (!currentAccount?.address) {
        return;
      }

      try {
        const response = await fetch(
          `/api/work/purchased?owner=${currentAccount.address}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch purchased works");
        }
        const data = await response.json();
        setPurchasedWorks(data.works || []);
      } catch (error) {
        console.error("Error loading purchased works:", error);
        setPurchasedWorks([]);
      }
    }

    loadPurchasedWorks();
  }, [currentAccount]);

  // 내 작품들을 원본과 파생으로 구분
  const originalWorks = useMemo(() => {
    return myWorks.filter(
      (work) => !work.parentId || work.parentId.length === 0
    );
  }, [myWorks]);

  const derivativeWorks = useMemo(() => {
    return myWorks.filter(
      (work) => work.parentId !== null && work.parentId.length > 0
    );
  }, [myWorks]);

  const myDerivatives = derivativeWorks;
  const purchasedLicenses = useMemo(() => {
    return purchasedWorks.filter((work) => work.licenseOption !== null);
  }, [purchasedWorks]);

  // 통계 계산
  const stats = useDashboardStats({
    myWorks,
    purchasedWorks,
    purchasedLicenses,
    myDerivatives,
  });

  // 파생 작품 트리 구조
  const { derivativeTrees, loadingTrees, expandedNodes, toggleExpand } =
    useDerivativeTrees({
      activeTab,
      originalWorks,
    });

  if (!currentAccount) {
    return (
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            currentUserAddress={currentAccount.address}
            myWorks={myWorks}
            purchasedWorks={purchasedWorks}
            stats={stats}
            onTabChange={setActiveTab}
          />
        );
      case "my-works":
        return (
          <MyWorksTab
            myWorks={myWorks}
            originalWorks={originalWorks}
            derivativeWorks={derivativeWorks}
          />
        );
      case "purchased":
        return <PurchasedTab purchasedWorks={purchasedWorks} />;
      case "derivatives":
        return (
          <DerivativesTab
            originalWorks={originalWorks}
            derivativeTrees={derivativeTrees}
            loadingTrees={loadingTrees}
            expandedNodes={expandedNodes}
            onToggleExpand={toggleExpand}
          />
        );
      case "earnings":
        return <EarningsTab myWorks={myWorks} stats={stats} />;
      default:
        return (
          <OverviewTab
            currentUserAddress={currentAccount.address}
            myWorks={myWorks}
            purchasedWorks={purchasedWorks}
            stats={stats}
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
