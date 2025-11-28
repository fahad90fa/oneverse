import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  MapPin,
  Phone,
  MessageCircle,
  Download,
  CheckCircle
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Record<string, unknown>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          product:product_id (*),
          seller:seller_id (full_name, avatar_url),
          shipping_address:shipping_address_id (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Order not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "shipped":
        return <Truck className="h-6 w-6 text-blue-500" />;
      default:
        return <Package className="h-6 w-6 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Main Order Details */}
          <div className="md:col-span-2 space-y-6 animate-fade-in-up">
            {/* Order Header */}
            <Card className="glass-effect border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-lg font-semibold">{order.id.slice(0, 12)}...</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 flex items-center gap-2 text-base px-4 py-2">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </Card>

            {/* Product Info */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{order.product?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {order.product?.description?.substring(0, 100)}...
                  </p>
                  <p className="text-lg font-bold text-primary">
                    ${parseFloat(order.product?.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Shipping Info */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{order.shipping_address || "Address not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono font-medium">{order.tracking_number || "N/A"}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {[
                  { status: "Order Placed", date: order.created_at, active: true },
                  { status: "Processing", date: order.processing_date, active: ["processing", "shipped", "delivered"].includes(order.status) },
                  { status: "Shipped", date: order.shipped_date, active: ["shipped", "delivered"].includes(order.status) },
                  { status: "Delivered", date: order.delivered_date, active: order.status === "delivered" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${
                      item.active ? "bg-green-500" : "bg-muted"
                    }`} />
                    <div className="pb-4 border-b border-border last:border-b-0">
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.date ? new Date(item.date).toLocaleDateString() : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Seller Info */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Seller</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                    {order.seller?.full_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{order.seller?.full_name || "Seller"}</p>
                  <p className="text-xs text-muted-foreground">Verified Seller</p>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-blue-500 mb-2"
                onClick={() => navigate("/chat")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Card>

            {/* Order Summary */}
            <Card className="glass-effect border-border p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Product Price</span>
                  <span>${parseFloat(order.product?.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${(order.shipping_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(order.tax || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">${parseFloat(order.total_price).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full glass-effect">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              {order.status !== "delivered" && (
                <Button variant="outline" className="w-full glass-effect">
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
