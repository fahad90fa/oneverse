import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Eye,
  MoreHorizontal,
  Truck
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: number;
}

const OrdersManage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const mockOrders: Order[] = [
        {
          id: "1",
          orderNumber: "#ORD-2024-001",
          customer: "John Doe",
          email: "john@example.com",
          total: 299.99,
          status: "processing",
          date: new Date().toLocaleDateString(),
          items: 2
        },
        {
          id: "2",
          orderNumber: "#ORD-2024-002",
          customer: "Jane Smith",
          email: "jane@example.com",
          total: 149.99,
          status: "shipped",
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          items: 1
        },
        {
          id: "3",
          orderNumber: "#ORD-2024-003",
          customer: "Bob Johnson",
          email: "bob@example.com",
          total: 450.00,
          status: "delivered",
          date: new Date(Date.now() - 172800000).toLocaleDateString(),
          items: 3
        },
        {
          id: "4",
          orderNumber: "#ORD-2024-004",
          customer: "Alice Williams",
          email: "alice@example.com",
          total: 89.99,
          status: "pending",
          date: new Date().toLocaleDateString(),
          items: 1
        },
        {
          id: "5",
          orderNumber: "#ORD-2024-005",
          customer: "Charlie Brown",
          email: "charlie@example.com",
          total: 199.99,
          status: "cancelled",
          date: new Date(Date.now() - 259200000).toLocaleDateString(),
          items: 1
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast({
        title: "Success",
        description: "Order status updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-500 border-amber-500/50";
      case "processing":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "shipped":
        return "bg-purple-500/20 text-purple-500 border-purple-500/50";
      case "delivered":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mt-4">Manage Orders</h1>
          <p className="text-muted-foreground">View and manage all your orders</p>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-6 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order number, customer name, or email..."
            className="pl-10 glass-effect border-border"
          />
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr className="bg-muted/30">
                    <th className="text-left p-4 font-semibold">Order</th>
                    <th className="text-left p-4 font-semibold">Customer</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Items</th>
                    <th className="text-left p-4 font-semibold">Total</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="p-4">
                            <p className="font-semibold">{order.orderNumber}</p>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.customer}</p>
                              <p className="text-xs text-muted-foreground">{order.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{order.date}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{order.items} item{order.items > 1 ? "s" : ""}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className={`flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No orders found</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersManage;
