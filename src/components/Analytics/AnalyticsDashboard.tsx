import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MetricCard } from "./MetricCard";

interface ChartDataPoint {
  date: string;
  amount: number;
}

interface CategoryData {
  [key: string]: number;
}

interface AnalyticsData {
  totalSpending?: number;
  totalRevenue?: number;
  totalSpent?: number;
  totalEarnings?: number;
  orderCount?: number;
  totalOrders?: number;
  projectCount?: number;
  completedProjects?: number;
  averageOrder?: string | number;
  averageOrderValue?: string | number;
  averageProjectValue?: string | number;
  averageRating?: string | number;
  conversionRate?: number;
  completionRate?: string | number;
  byCategory?: CategoryData;
  chartData?: ChartDataPoint[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  type: "buyer" | "seller" | "client" | "worker";
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const AnalyticsDashboard = ({ data, type }: AnalyticsDashboardProps) => {
  const [dateRange, setDateRange] = useState("30d");

  const renderMetrics = () => {
    switch (type) {
      case "buyer":
        return (
          <>
            <MetricCard label="Total Spending" value={`$${typeof data.totalSpending === "number" ? data.totalSpending.toFixed(2) : 0}`} />
            <MetricCard label="Total Orders" value={data.orderCount || 0} />
            <MetricCard label="Average Order" value={`$${data.averageOrder || 0}`} />
          </>
        );
      case "seller":
        return (
          <>
            <MetricCard label="Total Revenue" value={`$${typeof data.totalRevenue === "number" ? data.totalRevenue.toFixed(2) : 0}`} />
            <MetricCard label="Total Orders" value={data.totalOrders || 0} />
            <MetricCard label="Average Order Value" value={`$${data.averageOrderValue || 0}`} />
            <MetricCard label="Conversion Rate" value={`${typeof data.conversionRate === "number" ? data.conversionRate.toFixed(1) : 0}%`} />
          </>
        );
      case "client":
        return (
          <>
            <MetricCard label="Total Spent" value={`$${typeof data.totalSpent === "number" ? data.totalSpent.toFixed(2) : 0}`} />
            <MetricCard label="Total Projects" value={data.projectCount || 0} />
            <MetricCard label="Completed Projects" value={data.completedProjects || 0} />
            <MetricCard label="Completion Rate" value={`${data.completionRate || 0}%`} />
          </>
        );
      case "worker":
        return (
          <>
            <MetricCard label="Total Earnings" value={`$${typeof data.totalEarnings === "number" ? data.totalEarnings.toFixed(2) : 0}`} />
            <MetricCard label="Total Projects" value={data.projectCount || 0} />
            <MetricCard label="Average Project Value" value={`$${data.averageProjectValue || 0}`} />
            <MetricCard label="Average Rating" value={`${data.averageRating || 0}⭐`} />
          </>
        );
      default:
        return null;
    }
  };

  const renderCategoryChart = () => {
    if (type !== "buyer" || !data.byCategory) return null;

    const chartData = Object.entries(data.byCategory).map(([category, value]: [string, number]) => ({
      name: category,
      value,
    }));

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }: { name: string; value: number }) => `${name}: $${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value}`} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {["7d", "30d", "90d", "365d"].map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? "default" : "outline"}
            onClick={() => setDateRange(range)}
            size="sm"
          >
            {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Last Year"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{renderMetrics()}</div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number | string) => `$${value}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              dot={false}
              name={type === "buyer" ? "Spending" : type === "seller" ? "Revenue" : type === "client" ? "Project Budget" : "Earnings"}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {renderCategoryChart()}
    </div>
  );
};
