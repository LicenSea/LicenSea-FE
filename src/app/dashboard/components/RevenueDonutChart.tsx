import { DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueDonutChartProps {
  salesRevenue: number;
  royaltyRevenue: number;
}

export const RevenueDonutChart = ({
  salesRevenue,
  royaltyRevenue,
}: RevenueDonutChartProps) => {
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
