import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShoppingBag,
  Heart,
  Package,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart
} from "lucide-react";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    avgRating: 0
  });
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [spendingData, setSpendingData] = useState<number[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      // Fetch wishlist
      const { data: wishlist } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", session.user.id);

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const activeOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalOrders,
        wishlistItems: wishlist?.length || 0,
        activeOrders,
        completedOrders,
        totalSpent,
        avgRating: 4.8 // Mock data
      });

      // Set recent orders (last 5)
      setRecentOrders(orders?.slice(0, 5) || []);

      // Mock spending data for chart
      setSpendingData([120, 150, 180, 200, 250, 300, 280]);

    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+12%",
      changeType: "positive" as const,
      icon: ShoppingBag,
      gradient: "from-purple-500 to-blue-500",
      description: "vs last month"
    },
    {
      title: "Active Cart Items",
      value: stats.activeOrders,
      change: "3 items",
      changeType: "neutral" as const,
      icon: Package,
      gradient: "from-cyan-500 to-blue-500",
      description: "Ready to checkout"
    },
    {
      title: "Wishlist Items",
      value: stats.wishlistItems,
      change: "+5",
      changeType: "positive" as const,
      icon: Heart,
      gradient: "from-pink-500 to-red-500",
      description: "Saved for later"
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(0)}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      description: "This year"
    }
  ];

  const quickActions = [
    {
      title: "Continue Shopping",
      description: "Find amazing products",
      icon: ShoppingBag,
      gradient: "from-purple-500 to-blue-500",
      action: () => navigate("/products")
    },
    {
      title: "Track Orders",
      description: "View delivery status",
      icon: Package,
      gradient: "from-cyan-500 to-blue-500",
      action: () => navigate("/orders")
    },
    {
      title: "My Wishlist",
      description: "Saved favorites",
      icon: Heart,
      gradient: "from-pink-500 to-red-500",
      action: () => navigate("/wishlist")
    }
  ];

  if (loading) {
    return (
      <DashboardLayout currentRole="buyer">
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
      currentRole="buyer"
      title="Buyer Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      {/* Welcome Section */}
      <motion.div
        className="glass-effect rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              👋 Welcome back! Ready to discover amazing products today?
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              You have {stats.activeOrders} active orders and {stats.wishlistItems} items in your wishlist
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              onClick={() => navigate("/products")}
            >
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon = stat.changeType === 'positive' ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <Card className="glass-effect border-border hover-scale cursor-pointer group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.changeType === 'positive' ? 'text-green-500' :
                      stat.changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      <ChangeIcon className="h-3 w-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>

                  <motion.div
                    className="mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.7, type: "spring" }}
                  >
                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  </motion.div>

                  <p className="text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Spending Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-effect border-border h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Spending Overview</h3>
                  <p className="text-sm text-muted-foreground">Monthly spending trends</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Week</Button>
                  <Button variant="outline" size="sm" className="bg-primary/10">Month</Button>
                  <Button variant="outline" size="sm">Year</Button>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2">
                {spendingData.map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t"
                    style={{ height: `${(value / 350) * 100}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / 350) * 100}%` }}
                    transition={{ delay: index * 0.1 + 1, duration: 0.5 }}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Side Widgets */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="glass-effect border-border">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Profile Complete</h4>
                    <p className="text-sm text-muted-foreground">85% complete</p>
                  </div>
                </div>
                <Progress value={85} className="mb-4" />
                <Button variant="outline" size="sm" className="w-full">
                  Complete Profile
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="glass-effect border-border">
              <div className="p-6">
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Order History</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <PieChart className="h-4 w-4 text-primary" />
                    <span className="text-sm">Analytics</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Reviews</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="glass-effect border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 1.2 }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total_amount}</p>
                      <Badge
                        variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500"
                    onClick={() => navigate("/products")}
                  >
                    Start Shopping
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
