"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/Navbar/Navbar";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockWorks } from "@/data";
import {
  Copy,
  Upload,
  ShoppingBag,
  FileText,
  Layers,
  TrendingUp,
  DollarSign,
  Package,
  Award,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronRight, ChevronDown } from "lucide-react";

type TabType =
  | "overview"
  | "my-works"
  | "purchased"
  | "derivatives"
  | "earnings";

// 트리 노드 타입
type TreeNode = {
  work: {
    id: string;
    title: string;
    creator: string;
    preview_uri?: string;
    created_at?: string;
  };
  children: TreeNode[];
};

// 트리 노드 컴포넌트
const TreeNodeComponent = ({
  node,
  level = 0,
  expandedNodes,
  onToggleExpand,
  router,
}: {
  node: TreeNode;
  level?: number;
  expandedNodes: Set<string>;
  onToggleExpand: (workId: string) => void;
  router: {
    push: (href: string) => void;
  };
}) => {
  const isExpanded = expandedNodes.has(node.work.id);
  const hasChildren = node.children.length > 0;
  const indent = level * 24;

  return (
    <div className="mb-2">
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => router.push(`/work/${node.work.id}`)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.work.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {node.work.preview_uri ? (
            <img
              src={node.work.preview_uri}
              alt={node.work.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{node.work.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {node.work.creator.slice(0, 8)}...
            </p>
          </div>
          {hasChildren && (
            <Badge variant="secondary" className="flex-shrink-0">
              {node.children.length}
            </Badge>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.work.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 도넛 차트 컴포넌트
const RevenueDonutChart = ({
  salesRevenue,
  royaltyRevenue,
}: {
  salesRevenue: number;
  royaltyRevenue: number;
}) => {
  const data = [
    {
      name: "Sales Revenue",
      value: salesRevenue,
      color: "#a3f9d8",
    },
    {
      name: "Royalty Revenue",
      value: royaltyRevenue,
      color: "#ffcccc",
    },
  ].filter((item) => item.value > 0); // 0인 값은 제외

  const total = salesRevenue + royaltyRevenue;

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // 5% 미만은 레이블 숨김

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toFixed(2)} (${((value / total) * 100).toFixed(1)}%)`,
              "",
            ]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">
              {item.name}: {item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const router = useRouter();

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

  // 트리 구조 데이터
  const [derivativeTrees, setDerivativeTrees] = useState<TreeNode[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Claim 이력 데이터
  type ClaimTransaction = {
    date: string;
    type: string;
    workTitle: string;
    workPreview?: string;
    amount: number;
    status: "completed" | "pending" | "failed";
  };
  const [claimHistory, setClaimHistory] = useState<ClaimTransaction[]>([]);

  // 재귀적으로 자식 작품들을 가져오는 함수
  const fetchChildrenRecursively = async (
    workId: string,
    visited: Set<string> = new Set()
  ): Promise<TreeNode[]> => {
    if (visited.has(workId)) {
      return []; // 순환 참조 방지
    }
    visited.add(workId);

    try {
      const response = await fetch(`/api/lineage/${workId}`);
      const data = await response.json();

      if (!data.children || data.children.length === 0) {
        return [];
      }

      const children: TreeNode[] = [];
      for (const child of data.children) {
        const childNode: TreeNode = {
          work: {
            id: child.work_id,
            title: child.title,
            creator: child.creator,
            preview_uri: child.preview_uri,
            created_at: child.created_at,
          },
          children: await fetchChildrenRecursively(child.work_id, visited),
        };
        children.push(childNode);
      }

      return children;
    } catch (error) {
      console.error(`Error fetching children for ${workId}:`, error);
      return [];
    }
  };

  // 원본 작품들의 트리 구조 생성
  useEffect(() => {
    if (activeTab !== "derivatives" || originalWorks.length === 0) {
      return;
    }

    const loadTrees = async () => {
      setLoadingTrees(true);
      try {
        const trees: TreeNode[] = [];

        for (const originalWork of originalWorks) {
          const children = await fetchChildrenRecursively(originalWork.id);
          if (children.length > 0) {
            trees.push({
              work: {
                id: originalWork.id,
                title: originalWork.metadata.title,
                creator: originalWork.creator,
                preview_uri: originalWork.preview_uri,
              },
              children,
            });
            // 루트 노드는 기본적으로 확장
            setExpandedNodes((prev) => new Set(prev).add(originalWork.id));
          }
        }

        setDerivativeTrees(trees);
      } catch (error) {
        console.error("Error loading derivative trees:", error);
      } finally {
        setLoadingTrees(false);
      }
    };

    loadTrees();
  }, [activeTab, originalWorks]);

  // 통계 계산
  const stats = useMemo(() => {
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

  const shortenAddress = (address: string, start = 8, end = 6): string => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

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

  const renderOverview = () => (
    <div className="space-y-4">
      {/* 프로필 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73] flex items-center justify-center text-2xl font-bold text-[#262d5c]">
              {currentUserAddress.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm">
                  {shortenAddress(currentUserAddress)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUserAddress);
                  }}
                  title="Copy address"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
            </div>
            <Button onClick={() => router.push("/upload")}>
              <Upload className="w-4 h-4 mr-2" />
              Upload New Work
            </Button>
          </div>
        </CardContent>
      </Card>

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

        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Views
                </p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card> */}

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

        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Purchased Licenses
                </p>
                <p className="text-2xl font-bold">{stats.totalLicenses}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card> */}

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
                    onClick={() => setActiveTab("my-works")}
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
                    onClick={() => setActiveTab("purchased")}
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

              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-base">License Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {stats.licenseRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">SUI</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    From license sales
                  </p>
                </CardContent>
              </Card> */}

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
                      {/* TODO: 실제 claim 이력 데이터 연동 */}
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

  const renderMyWorks = () => {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Works</h2>
            <p className="text-muted-foreground">
              {myWorks.length} {myWorks.length === 1 ? "work" : "works"}{" "}
              uploaded
            </p>
          </div>
          <Button onClick={() => router.push("/upload")}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Work
          </Button>
        </div>

        {myWorks.length > 0 ? (
          <div className="space-y-8">
            {/* 원본 작품 섹션 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Original Works</h3>
                  <p className="text-sm text-muted-foreground">
                    {originalWorks.length}{" "}
                    {originalWorks.length === 1 ? "work" : "works"}
                  </p>
                </div>
              </div>
              {originalWorks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {originalWorks.map((work) => (
                    <ProductCard key={work.id} product={work} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No original works yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 파생 작품 섹션 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Derivative Works</h3>
                  <p className="text-sm text-muted-foreground">
                    {derivativeWorks.length}{" "}
                    {derivativeWorks.length === 1 ? "work" : "works"}
                  </p>
                </div>
                {derivativeWorks.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/upload");
                      // TODO: 라이선스 선택 상태로 업로드 페이지 열기
                    }}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Create New Derivative
                  </Button>
                )}
              </div>
              {derivativeWorks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {derivativeWorks.map((work) => (
                    <ProductCard key={work.id} product={work} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No derivative works yet
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push("/upload");
                      }}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Create Derivative Work
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No works yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating and uploading your first work
              </p>
              <Button onClick={() => router.push("/upload")}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Work
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPurchased = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Purchased Works</h2>
        <p className="text-muted-foreground">
          {purchasedWorks.length}{" "}
          {purchasedWorks.length === 1 ? "work" : "works"} purchased
        </p>
      </div>

      {purchasedWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {purchasedWorks.map((work) => (
            <ProductCard key={work.id} product={work} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">
              Explore the marketplace and purchase works
            </p>
            <Button onClick={() => router.push("/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDerivatives = () => {
    const toggleExpand = (workId: string) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(workId)) {
          next.delete(workId);
        } else {
          next.add(workId);
        }
        return next;
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Derivative Lineage</h2>
            <p className="text-muted-foreground">
              Tree view of works derived from your original works
            </p>
          </div>
          <Button
            onClick={() => {
              router.push("/upload");
              // TODO: 라이선스 선택 상태로 업로드 페이지 열기
            }}
          >
            <Layers className="w-4 h-4 mr-2" />
            Create New Derivative
          </Button>
        </div>

        {loadingTrees ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading derivative trees...
              </p>
            </CardContent>
          </Card>
        ) : derivativeTrees.length > 0 ? (
          <div className="space-y-6">
            {derivativeTrees.map((tree) => (
              <Card key={tree.work.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span>Original Work</span>
                    <Badge variant="outline">
                      {tree.children.length}{" "}
                      {tree.children.length === 1
                        ? "derivative"
                        : "derivatives"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* 루트 노드 */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border-2 border-primary/20 bg-primary/5"
                      onClick={() => router.push(`/work/${tree.work.id}`)}
                    >
                      {tree.work.preview_uri ? (
                        <img
                          src={tree.work.preview_uri}
                          alt={tree.work.title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {tree.work.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {tree.work.creator.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    {/* 자식 노드들 */}
                    {tree.children.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-muted">
                        {tree.children.map((child) => (
                          <TreeNodeComponent
                            key={child.work.id}
                            node={child}
                            level={0}
                            expandedNodes={expandedNodes}
                            onToggleExpand={toggleExpand}
                            router={router}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No derivative works yet
              </h3>
              <p className="text-muted-foreground mb-6">
                {originalWorks.length === 0
                  ? "Upload original works first to see derivative lineage"
                  : "No works have been derived from your original works yet"}
              </p>
              <div className="flex gap-4 justify-center">
                {originalWorks.length === 0 ? (
                  <Button onClick={() => router.push("/upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Original Work
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/marketplace")}
                    >
                      Browse Licenses
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/upload");
                      }}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Create Derivative
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderEarnings = () => (
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "my-works":
        return renderMyWorks();
      case "purchased":
        return renderPurchased();
      case "derivatives":
        return renderDerivatives();
      case "earnings":
        return renderEarnings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* 탭 컨텐츠 */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
