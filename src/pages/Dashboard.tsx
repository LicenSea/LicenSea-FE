import React, { useState, useMemo } from "react";
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
import { useNavigate } from "react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type TabType =
  | "overview"
  | "my-works"
  | "purchased"
  | "licenses"
  | "derivatives"
  | "earnings";

// 도넛 차트 컴포넌트
const RevenueDonutChart = ({
  salesRevenue,
  licenseRevenue,
  royaltyRevenue,
}: {
  salesRevenue: number;
  licenseRevenue: number;
  royaltyRevenue: number;
}) => {
  const data = [
    {
      name: "Sales Revenue",
      value: salesRevenue,
      color: "#a3f9d8",
    },
    {
      name: "License Revenue",
      value: licenseRevenue,
      color: "#e6fc73",
    },
    {
      name: "Royalty Revenue",
      value: royaltyRevenue,
      color: "#ffcccc",
    },
  ].filter((item) => item.value > 0); // 0인 값은 제외

  const total = salesRevenue + licenseRevenue + royaltyRevenue;

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
  const navigate = useNavigate();

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

  // 통계 계산
  const stats = useMemo(() => {
    const totalWorks = myWorks.length;
    const totalPurchases = purchasedWorks.length;
    const totalLicenses = purchasedLicenses.length;
    const totalDerivatives = myDerivatives.length;

    // 수익 계산 (임시)
    const salesRevenue = myWorks.reduce((sum, work) => sum + work.fee, 0);
    const licenseRevenue = myWorks
      .filter((work) => work.licenseOption)
      .reduce((sum, work) => sum + (work.licenseOption?.price || 0), 0);
    const royaltyRevenue = 0; // TODO: 실제 로열티 수익 계산
    const totalRevenue = salesRevenue + licenseRevenue + royaltyRevenue;

    // 조회수 (임시)
    const totalViews = myWorks.length * 10; // TODO: 실제 조회수 API 연동

    return {
      totalWorks,
      totalPurchases,
      totalLicenses,
      totalDerivatives,
      salesRevenue,
      licenseRevenue,
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
      id: "licenses",
      label: "Licenses",
      icon: <FileText className="w-4 h-4" />,
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
            <Button onClick={() => navigate("/upload")}>
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

        <Card>
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
        </Card>

        <Card className="bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73]">
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
                    onClick={() => navigate(`/work/${work.id}`)}
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
                  onClick={() => navigate("/upload")}
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
                    onClick={() => navigate(`/work/${work.id}`)}
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
                  onClick={() => navigate("/marketplace")}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );

  const renderMyWorks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Works</h2>
          <p className="text-muted-foreground">
            {myWorks.length} {myWorks.length === 1 ? "work" : "works"} uploaded
          </p>
        </div>
        <Button onClick={() => navigate("/upload")}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New Work
        </Button>
      </div>

      {myWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {myWorks.map((work) => (
            <ProductCard key={work.id} product={work} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No works yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating and uploading your first work
            </p>
            <Button onClick={() => navigate("/upload")}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Work
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

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
            <Button onClick={() => navigate("/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLicenses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Purchased Licenses</h2>
          <p className="text-muted-foreground">
            {purchasedLicenses.length}{" "}
            {purchasedLicenses.length === 1 ? "license" : "licenses"} purchased
          </p>
        </div>
        {purchasedLicenses.length > 0 && (
          <Button
            onClick={() => {
              navigate("/upload");
              // TODO: 라이선스 선택 상태로 업로드 페이지 열기
            }}
          >
            <Layers className="w-4 h-4 mr-2" />
            Create Derivative Work
          </Button>
        )}
      </div>

      {purchasedLicenses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {purchasedLicenses.map((work) => (
            <Card key={work.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  {work.preview_uri ? (
                    <img
                      src={work.preview_uri}
                      alt={work.metadata.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <FileText className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4">License NFT</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{work.metadata.title}</h3>
                  {work.licenseOption && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rule: </span>
                        <span>{work.licenseOption.rule}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-medium">
                          {work.licenseOption.price} ETH
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Royalty: </span>
                        <span>
                          {work.licenseOption.royaltyRatio}% (Creator) /{" "}
                          {100 - work.licenseOption.royaltyRatio}% (You)
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate(`/work/${work.id}`)}
                  >
                    View Original Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No licenses purchased
            </h3>
            <p className="text-muted-foreground mb-6">
              Purchase license NFTs to create derivative works
            </p>
            <Button onClick={() => navigate("/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDerivatives = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Derivative Works</h2>
          <p className="text-muted-foreground">
            {myDerivatives.length}{" "}
            {myDerivatives.length === 1
              ? "derivative work"
              : "derivative works"}
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/upload");
            // TODO: 라이선스 선택 상태로 업로드 페이지 열기
          }}
        >
          <Layers className="w-4 h-4 mr-2" />
          Create New Derivative
        </Button>
      </div>

      {myDerivatives.length > 0 ? (
        <div className="space-y-8">
          {myDerivatives.map((derivative) => {
            // 원본 작품 찾기
            const originalWorks = mockWorks.filter((work) =>
              derivative.parentId?.includes(work.id)
            );

            return (
              <Card key={derivative.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2차 창작물 */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                        DERIVATIVE WORK
                      </h4>
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/work/${derivative.id}`)}
                      >
                        {derivative.preview_uri ? (
                          <img
                            src={derivative.preview_uri}
                            alt={derivative.metadata.title}
                            className="w-full aspect-square rounded object-cover mb-2"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded bg-muted flex items-center justify-center mb-2">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <p className="font-medium">
                          {derivative.metadata.title}
                        </p>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="flex items-center justify-center">
                      <div className="text-4xl text-muted-foreground">→</div>
                    </div>

                    {/* 원본 작품들 */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                        ORIGINAL WORK{originalWorks.length > 1 ? "S" : ""}
                      </h4>
                      <div className="space-y-4">
                        {originalWorks.map((original) => (
                          <div
                            key={original.id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/work/${original.id}`)}
                          >
                            {original.preview_uri ? (
                              <img
                                src={original.preview_uri}
                                alt={original.metadata.title}
                                className="w-full aspect-square rounded object-cover mb-2"
                              />
                            ) : (
                              <div className="w-full aspect-square rounded bg-muted flex items-center justify-center mb-2">
                                <Package className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                            <p className="font-medium text-sm">
                              {original.metadata.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No derivative works yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Purchase a license NFT and create your first derivative work
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/marketplace")}
              >
                Browse Licenses
              </Button>
              <Button
                onClick={() => {
                  navigate("/upload");
                }}
              >
                <Layers className="w-4 h-4 mr-2" />
                Create Derivative
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <CardTitle className="text-base">License Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.licenseRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">ETH</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From license sales
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
              licenseRevenue={stats.licenseRevenue}
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
      case "licenses":
        return renderLicenses();
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
