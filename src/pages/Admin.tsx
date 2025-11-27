import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminLoginModal from "@/components/AdminLoginModal";
import { StatCard } from "@/components/Admin/StatCard";
import { AdminTable } from "@/components/Admin/AdminTable";
import { UserDetailModal } from "@/components/Admin/UserDetailModal";
import { VerificationModal } from "@/components/Admin/VerificationModal";
import { OrderDetailModal } from "@/components/Admin/OrderDetailModal";
import { RevenueChart } from "@/components/Admin/RevenueChart";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  ArrowLeft,
  Trash2,
  CheckCircle,
  Shield,
  AlertCircle,
  DollarSign,
  Star,
  Download,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    verifiedUsers: 0,
    pendingVerifications: 0
  });

  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [verifications, setVerifications] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);

  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<Record<string, unknown> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);
  
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);

  const ensureAdminMembership = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const email = session.user.email || session.user.user_metadata?.email || "";
      const fullName = session.user.user_metadata?.full_name || email;

      const { error } = await supabase
        .from("admin_users")
        .upsert(
          {
            user_id: session.user.id,
            email,
            full_name: fullName
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to ensure admin access:", error);
      return false;
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        { data: usersData },
        { data: productsData },
        { data: ordersData },
        { data: verificationsData },
        { data: paymentsData },
        { data: reviewsData }
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("products").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("verifications").select(`
          *,
          profiles:user_id (full_name, email, avatar_url)
        `).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false })
      ]);

      const totalRevenue = (paymentsData || [])
        .filter((p) => p.status === "completed")
        .reduce((sum, payment) => sum + parseFloat(payment.amount?.toString() || "0"), 0);

      const verifiedCount = (verificationsData || []).filter(
        (v) => v.status === "approved"
      ).length;

      const pendingCount = (verificationsData || []).filter(
        (v) => v.status === "pending"
      ).length;

      setStats({
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        verifiedUsers: verifiedCount,
        pendingVerifications: pendingCount
      });

      setUsers(usersData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setVerifications(verificationsData || []);
      setPayments(paymentsData || []);
      setReviews(reviewsData || []);

      // Generate chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const chartDataFormatted = last7Days.map((date) => {
        const dayPayments = (paymentsData || []).filter(
          (p) => p.created_at.startsWith(date) && p.status === "completed"
        );
        const dayOrders = (ordersData || []).filter(
          (o) => o.created_at.startsWith(date)
        );

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayPayments.reduce((sum, p) => sum + parseFloat(p.amount?.toString() || "0"), 0),
          orders: dayOrders.length
        };
      });

      setChartData(chartDataFormatted);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    }
  }, [toast]);

  const checkAdminAccessCallback = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const adminPassword = localStorage.getItem('admin_password');
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'fahad123@fa';

      if (adminPassword === correctPassword) {
        const hasMembership = await ensureAdminMembership();
        if (!hasMembership) {
          setShowLoginModal(true);
          return;
        }
        setIsAdmin(true);
        await fetchDashboardData();
      } else {
        setShowLoginModal(true);
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchDashboardData, ensureAdminMembership]);

  useEffect(() => {
    checkAdminAccessCallback();
  }, [checkAdminAccessCallback]);

  const handleLoginSuccess = async () => {
    const hasMembership = await ensureAdminMembership();
    if (!hasMembership) {
      toast({
        title: "Admin access error",
        description: "Unable to verify admin privileges",
        variant: "destructive"
      });
      return;
    }
    setIsAdmin(true);
    await fetchDashboardData();
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    navigate("/dashboard");
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      toast({ title: "User deleted" });
      await fetchDashboardData();
      setUserDetailOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      toast({ title: "Product deleted" });
      await fetchDashboardData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleVerificationAction = async (
    verificationId: string,
    action: "approved" | "rejected",
    notes?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        status: action,
        verified_by: session.user.id,
        verified_at: new Date().toISOString(),
        admin_notes: notes
      };

      const verification = verifications.find((v) => v.id === verificationId);
      if (verification && ["top_rated", "rising_talent"].includes(verification.verification_type)) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);
        updateData.expires_at = expiresAt.toISOString();
      }

      const { error } = await supabase
        .from("verifications")
        .update(updateData)
        .eq("id", verificationId);

      if (error) throw error;

      toast({
        title: `Verification ${action}`,
        description: `The verification has been ${action}.`
      });

      await fetchDashboardData();
      setVerificationModalOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Access Denied</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      trend: 12
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-purple-500 to-pink-500",
      trend: 8
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-green-500 to-emerald-500",
      trend: 15
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      gradient: "from-orange-500 to-red-500",
      trend: 23
    },
    {
      title: "Verified Users",
      value: stats.verifiedUsers,
      icon: CheckCircle,
      gradient: "from-yellow-500 to-amber-500",
      trend: 5
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-500",
      trend: -3
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-muted-foreground">
              Platform management, analytics, and operations hub
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                gradient={stat.gradient}
                trend={stat.trend}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 glass-effect border-border mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <RevenueChart
                  data={chartData}
                  title="Platform Revenue & Orders (Last 7 Days)"
                  type="line"
                />
              </motion.div>

              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">
                        ${order.total_price}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <AdminTable
                columns={[
                  {
                    key: "full_name",
                    label: "Name"
                  },
                  {
                    key: "user_id",
                    label: "Email",
                    render: (value) => <span className="font-mono text-xs">{value.slice(0, 20)}...</span>
                  },
                  {
                    key: "trust_score",
                    label: "Trust Score",
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                    )
                  },
                  {
                    key: "created_at",
                    label: "Joined",
                    render: (value) => new Date(value).toLocaleDateString()
                  }
                ]}
                data={users}
                onRowClick={(user) => {
                  setSelectedUser(user);
                  setUserDetailOpen(true);
                }}
                searchPlaceholder="Search users by name or email..."
              />
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Products Management</h3>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <AdminTable
                columns={[
                  {
                    key: "title",
                    label: "Product Title"
                  },
                  {
                    key: "price",
                    label: "Price",
                    render: (value) => <span className="font-semibold">${value}</span>
                  },
                  {
                    key: "stock_quantity",
                    label: "Stock"
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value) => (
                      <Badge className={
                        value === "active"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }>
                        {value}
                      </Badge>
                    )
                  }
                ]}
                data={products}
                rowActions={(product) => (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                searchPlaceholder="Search products by title or category..."
              />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <AdminTable
                columns={[
                  {
                    key: "id",
                    label: "Order ID",
                    render: (value) => <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
                  },
                  {
                    key: "quantity",
                    label: "Qty"
                  },
                  {
                    key: "total_price",
                    label: "Amount",
                    render: (value) => <span className="font-semibold text-green-500">${value}</span>
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value) => (
                      <Badge className={
                        value === "delivered"
                          ? "bg-green-500/10 text-green-500"
                          : value === "shipped"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }>
                        {value}
                      </Badge>
                    )
                  },
                  {
                    key: "created_at",
                    label: "Date",
                    render: (value) => new Date(value).toLocaleDateString()
                  }
                ]}
                data={orders}
                onRowClick={(order) => {
                  setSelectedOrder(order);
                  setOrderDetailOpen(true);
                }}
                searchPlaceholder="Search orders..."
              />
            </TabsContent>

            {/* Verifications Tab */}
            <TabsContent value="verifications" className="space-y-6">
              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-bold mb-4">Pending Verifications</h3>
                <div className="space-y-3">
                  {verifications.filter((v) => v.status === "pending").map((verification) => (
                    <motion.div
                      key={verification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setVerificationModalOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {verification.profiles?.full_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                            {verification.verification_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Submitted {new Date(verification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVerification(verification);
                          setVerificationModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </motion.div>
                  ))}
                  {verifications.filter((v) => v.status === "pending").length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No pending verifications
                    </p>
                  )}
                </div>
              </Card>

              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-bold mb-4">Verification History</h3>
                <AdminTable
                  columns={[
                    {
                      key: "profiles.full_name",
                      label: "User",
                      render: (_, row) => row.profiles?.full_name || "N/A"
                    },
                    {
                      key: "verification_type",
                      label: "Type"
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (value) => (
                        <Badge className={
                          value === "approved"
                            ? "bg-green-500/10 text-green-500"
                            : value === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }>
                          {value}
                        </Badge>
                      )
                    },
                    {
                      key: "created_at",
                      label: "Date",
                      render: (value) => new Date(value).toLocaleDateString()
                    }
                  ]}
                  data={verifications.filter((v) => v.status !== "pending")}
                  searchPlaceholder="Search verification history..."
                  itemsPerPage={5}
                />
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="glass-effect border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
                  </p>
                </Card>
                <Card className="glass-effect border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Completed Payments</p>
                  <p className="text-2xl font-bold">
                    {payments.filter((p) => p.status === "completed").length}
                  </p>
                </Card>
                <Card className="glass-effect border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Failed Payments</p>
                  <p className="text-2xl font-bold text-red-500">
                    {payments.filter((p) => p.status === "failed").length}
                  </p>
                </Card>
              </div>

              <RevenueChart
                data={chartData}
                title="Revenue Trends"
                type="bar"
              />

              <AdminTable
                columns={[
                  {
                    key: "id",
                    label: "Transaction ID",
                    render: (value) => <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    render: (value) => <span className="font-semibold">${value}</span>
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value) => (
                      <Badge className={
                        value === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : value === "failed"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }>
                        {value}
                      </Badge>
                    )
                  },
                  {
                    key: "payment_method",
                    label: "Method"
                  },
                  {
                    key: "created_at",
                    label: "Date",
                    render: (value) => new Date(value).toLocaleDateString()
                  }
                ]}
                data={payments}
                searchPlaceholder="Search payments..."
              />
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <AdminTable
                columns={[
                  {
                    key: "rating",
                    label: "Rating",
                    render: (value) => (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < value ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    )
                  },
                  {
                    key: "comment",
                    label: "Review",
                    render: (value) => <p className="text-sm truncate max-w-xs">{value || "No comment"}</p>
                  },
                  {
                    key: "created_at",
                    label: "Date",
                    render: (value) => new Date(value).toLocaleDateString()
                  }
                ]}
                data={reviews}
                rowActions={(review) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                searchPlaceholder="Search reviews..."
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-bold mb-6">Platform Settings</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform-status" className="text-base font-semibold">
                      Platform Status
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch defaultChecked />
                      <span className="text-sm text-muted-foreground">Live (toggle for maintenance)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-commission" className="text-base font-semibold">
                      Product Commission Rate (%)
                    </Label>
                    <Input
                      type="number"
                      defaultValue={10}
                      min={0}
                      max={50}
                      className="glass-effect max-w-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gig-commission" className="text-base font-semibold">
                      Gig Commission Rate (%)
                    </Label>
                    <Input
                      type="number"
                      defaultValue={15}
                      min={0}
                      max={50}
                      className="glass-effect max-w-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="announcement" className="text-base font-semibold">
                      Global Announcement Banner
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter announcement message..."
                      className="glass-effect"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      className="bg-gradient-to-r from-primary to-accent"
                      onClick={() => toast({ title: "Settings saved successfully" })}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-bold mb-4">Export Data</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="glass-effect">
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                  <Button variant="outline" className="glass-effect">
                    <Download className="h-4 w-4 mr-2" />
                    Export Orders
                  </Button>
                  <Button variant="outline" className="glass-effect">
                    <Download className="h-4 w-4 mr-2" />
                    Export Payments
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserDetailModal
          isOpen={userDetailOpen}
          onClose={() => setUserDetailOpen(false)}
          user={selectedUser}
          onDelete={handleDeleteUser}
        />
      )}

      {selectedVerification && (
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          verification={selectedVerification}
          onApprove={(id, notes) => handleVerificationAction(id, "approved", notes)}
          onReject={(id, notes) => handleVerificationAction(id, "rejected", notes)}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={orderDetailOpen}
          onClose={() => setOrderDetailOpen(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default Admin;
