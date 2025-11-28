import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          product:product_id (title, price),
          seller:seller_id (full_name, avatar_url)
        `)
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/buyer")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-electric-blue-500 to-sky-blue-500 bg-clip-text text-transparent animate-fade-in-up">
            My Orders
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Track and manage your purchases
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              className={filter === status ? "bg-gradient-to-r from-primary to-blue-500" : "glass-effect"}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6">
              {filter === "all" ? "You haven't placed any orders yet." : `No ${filter} orders`}
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-blue-500"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <Card
                key={order.id}
                className="glass-effect border-border overflow-hidden hover-scale animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{order.product?.title}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">
                            ${parseFloat(order.total_price).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Order ID: {order.id.slice(0, 8)}...</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="glass-effect">
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-effect"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  {order.status !== "cancelled" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              order.status !== "pending" ? "bg-green-500" : "bg-muted"
                            }`} />
                            <span className="text-xs text-muted-foreground">Order Placed</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              ["processing", "shipped", "delivered"].includes(order.status) ? "bg-green-500" : "bg-muted"
                            }`} />
                            <span className="text-xs text-muted-foreground">Processing</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              ["shipped", "delivered"].includes(order.status) ? "bg-green-500" : "bg-muted"
                            }`} />
                            <span className="text-xs text-muted-foreground">Shipped</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              order.status === "delivered" ? "bg-green-500" : "bg-muted"
                            }`} />
                            <span className="text-xs text-muted-foreground">Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
