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
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  ShoppingCart,
  Star,
  Filter,
  Download
} from "lucide-react";

interface AnalyticsData {
  views: number;
  clicks: number;
  conversions: number;
  avgOrderValue: number;
  conversionRate: number;
  repeatCustomers: number;
}

const SellerAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views: 12450,
    clicks: 3280,
    conversions: 248,
    avgOrderValue: 125.50,
    conversionRate: 7.56,
    repeatCustomers: 45
  });
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalytics(prev => ({
        ...prev,
        views: Math.floor(Math.random() * 20000) + 5000,
        clicks: Math.floor(Math.random() * 5000) + 1000,
        conversions: Math.floor(Math.random() * 500) + 50
      }));
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Views",
      value: analytics.views.toLocaleString(),
      change: "+12.5%",
      icon: Eye,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Clicks",
      value: analytics.clicks.toLocaleString(),
      change: "+8.2%",
      icon: ShoppingCart,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Conversions",
      value: analytics.conversions,
      change: "+5.1%",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      change: "+2.1%",
      icon: BarChart3,
      gradient: "from-orange-500 to-red-500"
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
      title="Analytics"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard/seller" },
        { label: "Analytics" }
      ]}
    >
      {/* Time Range */}
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

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Top Products</h3>
              <div className="space-y-4">
                {[
                  { name: "Wireless Headphones", views: 3420, sales: 45 },
                  { name: "Phone Case", views: 2890, sales: 156 },
                  { name: "USB Cable", views: 2340, sales: 289 },
                  { name: "Screen Protector", views: 1890, sales: 134 }
                ].map((product, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.views} views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.sales} sales</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {[
                  { source: "Search Engines", visits: 4560, percentage: 40 },
                  { source: "Direct", visits: 2340, percentage: 25 },
                  { source: "Social Media", visits: 1890, percentage: 20 },
                  { source: "Referral", visits: 1250, percentage: 15 }
                ].map((source, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{source.source}</span>
                      <span className="text-sm font-semibold">{source.visits}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{source.percentage}%</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SellerAnalytics;
