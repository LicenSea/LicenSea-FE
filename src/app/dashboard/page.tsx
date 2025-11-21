"use client";

import { useState, useMemo } from "react";
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // TODO: 실제로는 연결된 지갑 주소를 사용
  const currentUserAddress =
    "0xded158cc74a375be0a0e4506d18801bb2355abb38a7d0b4168452a20a32b96d9";

  // 내가 업로드한 작품들
  const myWorks = useMemo(() => {
    return mockWorks.filter((work) => work.creator === currentUserAddress);
  }, [currentUserAddress]);

  // 내가 구매한 작품들 (VIEW 버튼을 누른 작품들 - 실제로는 구매 내역에서 가져옴)
  // TODO: 실제 구매 내역 API 연동
  const purchasedWorks = useMemo(() => {
    // 임시로 fee가 0이 아닌 작품들을 구매한 것으로 가정
    return mockWorks.filter((work) => work.fee > 0);
  }, []);

  // 내가 구매한 라이선스 NFT들
  const purchasedLicenses = useMemo(() => {
    // TODO: 실제 라이선스 구매 내역 API 연동
    return mockWorks.filter((work) => work.licenseOption !== null);
  }, []);

  // 내가 만든 2차 창작물들
  const myDerivatives = useMemo(() => {
    return mockWorks.filter(
      (work) =>
        work.parentId !== null &&
        work.parentId.length > 0 &&
        work.creator === currentUserAddress
    );
  }, [currentUserAddress]);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            currentUserAddress={currentUserAddress}
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
            currentUserAddress={currentUserAddress}
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
