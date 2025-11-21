import React from "react";
import {
  TrendingUp,
  Upload,
  ShoppingBag,
  Layers,
  DollarSign,
} from "lucide-react";
import type { TabType } from "../types";

interface DashboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  { id: "my-works", label: "My Works", icon: <Upload className="w-4 h-4" /> },
  {
    id: "purchased",
    label: "Purchased",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "derivatives",
    label: "Derivatives",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: <DollarSign className="w-4 h-4" />,
  },
];

export const DashboardTabs = ({
  activeTab,
  onTabChange,
}: DashboardTabsProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? "border-[#a3f9d8] text-[#262d5c]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
