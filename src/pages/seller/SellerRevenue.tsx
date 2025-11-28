import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart
} from "lucide-react";

interface RevenueData {
  date: string;
  amount: number;
  orders: number;
  status: "completed" | "pending" | "refunded";
}

interface RevenueSummary {
  totalRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  averageOrderValue: number;
  totalOrders: number;
}

const SellerRevenue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState<RevenueSummary>({
    totalRevenue: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    averageOrderValue: 0,
    totalOrders: 0
  });
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false });

      const mockData = generateMockRevenueData(orders || []);
      setRevenueData(mockData);

      const completed = mockData.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0);
      const pending = mockData.filter(d => d.status === "pending").reduce((sum, d) => sum + d.amount, 0);
      const refunded = mockData.filter(d => d.status === "refunded").reduce((sum, d) => sum + d.amount, 0);

      setSummary({
        totalRevenue: completed,
        pendingAmount: pending,
        refundedAmount: refunded,
        averageOrderValue: mockData.length > 0 ? completed / mockData.length : 0,
        totalOrders: mockData.length
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load revenue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockRevenueData = (orders: unknown[]): RevenueData[] => {
    const statuses = ["completed", "pending", "refunded"] as const;
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: Math.random() * 1000,
      orders: Math.floor(Math.random() * 10) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Pending",
      value: `$${summary.pendingAmount.toFixed(2)}`,
      change: Math.floor(Math.random() * 20),
      icon: Calendar,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Average Order Value",
      value: `$${summary.averageOrderValue.toFixed(2)}`,
      change: "+5.2%",
      icon: BarChart3,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      change: "+23 orders",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout currentRole="seller">
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentRole="seller"
      title="Revenue Analytics"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard/seller" },
        { label: "Revenue" }
      ]}
    >
      {/* Time Range Selector */}
      <motion.div
        className="mb-8 flex gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {(["week", "month", "year"] as const).map((range) => (
          <Button
            key={range}
            onClick={() => setTimeRange(range)}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            className="capitalize"
          >
            {range}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-border hover-scale cursor-pointer group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-border h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Revenue Trend</h3>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-64 flex items-end justify-between gap-1">
                {revenueData.slice(0, 30).map((data, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t"
                    style={{ height: `${(data.amount / 1000) * 100}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.amount / 1000) * 100}%` }}
                    transition={{ delay: index * 0.02, duration: 0.5 }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-border h-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue Status
              </h3>

              <div className="space-y-4">
                {[
                  { label: "Completed", amount: summary.totalRevenue, color: "bg-green-500", percentage: 75 },
                  { label: "Pending", amount: summary.pendingAmount, color: "bg-amber-500", percentage: 15 },
                  { label: "Refunded", amount: summary.refundedAmount, color: "bg-red-500", percentage: 10 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold">${item.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-effect border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {revenueData.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        transaction.status === "completed"
                          ? "bg-green-500/20 text-green-500"
                          : transaction.status === "pending"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default SellerRevenue;
