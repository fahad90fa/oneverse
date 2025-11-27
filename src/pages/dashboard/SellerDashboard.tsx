import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProtectRoute } from "@/hooks/useRoleAccess";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  ShoppingCart,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

const SellerDashboard = () => {
  const navigate = useNavigate();
  useProtectRoute('seller');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrders: 0,
    productsListed: 0,
    customerRating: 0,
    totalOrders: 0,
    activeOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);

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

      // Fetch products
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", session.user.id);

      // Fetch orders for seller's products
      const productIds = products?.map(p => p.id) || [];
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const newOrders = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate > weekAgo;
      }).length || 0;

      setStats({
        totalRevenue,
        newOrders,
        productsListed: products?.length || 0,
        customerRating: 4.9, // Mock data
        totalOrders: orders?.length || 0,
        activeOrders: orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0
      });

      // Set recent orders (last 5)
      setRecentOrders(orders?.slice(0, 5) || []);

      // Mock revenue data for chart
      setRevenueData([2400, 2800, 3200, 2900, 3500, 3800, 4200]);

    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(0)}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      description: "vs last month"
    },
    {
      title: "New Orders",
      value: stats.newOrders,
      change: "+8",
      changeType: "positive" as const,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-500",
      description: "This week"
    },
    {
      title: "Products Listed",
      value: stats.productsListed,
      change: "+3",
      changeType: "positive" as const,
      icon: Package,
      gradient: "from-purple-500 to-blue-500",
      description: "Active listings"
    },
    {
      title: "Customer Rating",
      value: `${stats.customerRating}/5`,
      change: "+0.1",
      changeType: "positive" as const,
      icon: Star,
      gradient: "from-yellow-500 to-orange-500",
      description: "Average rating"
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
      title="Seller Dashboard"
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
              🏪 Your store has {stats.newOrders} new orders waiting! 🎉
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              You have {stats.activeOrders} active orders and {stats.productsListed} products listed
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => navigate("/products/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
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
        {/* Revenue Chart */}
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
                  <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                  <p className="text-sm text-muted-foreground">Monthly revenue trends</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Week</Button>
                  <Button variant="outline" size="sm" className="bg-primary/10">Month</Button>
                  <Button variant="outline" size="sm">Year</Button>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-500/60 rounded-t"
                    style={{ height: `${(value / 5000) * 100}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / 5000) * 100}%` }}
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
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="glass-effect border-border">
              <div className="p-6">
                <h4 className="font-semibold mb-4">Top Products</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Premium Widget</span>
                    </div>
                    <span className="text-sm font-medium">$299</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Basic Tool</span>
                    </div>
                    <span className="text-sm font-medium">$99</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Service Pack</span>
                    </div>
                    <span className="text-sm font-medium">$149</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="glass-effect border-border">
              <div className="p-6">
                <h4 className="font-semibold mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate("/products/new")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate("/orders/manage")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate("/analytics")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="glass-effect border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/orders/manage")}>
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
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
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
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500"
                    onClick={() => navigate("/products")}
                  >
                    Start Selling
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

export default SellerDashboard;
