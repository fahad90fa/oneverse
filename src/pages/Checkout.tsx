import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { paymentService } from "@/services/payment";
import { emailService } from "@/services/email";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  ArrowLeft,
  Lock,
  Truck,
  Package
} from "lucide-react";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  title: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });

  const fetchCartItems = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("cart")
        .select(`
          *,
          product:product_id (title, price)
        `)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setCartItems(data?.map((item: unknown) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        title: item.product?.title || "Product"
      })) || []);
    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      if (paymentMethod === "card") {
        const paymentIntent = await paymentService.createPaymentIntent({
          amount: total,
          currency: "USD",
          description: `Order for ${cartItems.length} items`,
          metadata: {
            userId: session.user.id,
            cartItems: cartItems.length.toString()
          }
        });

        if (!paymentIntent.client_secret) {
          throw new Error("Failed to create payment intent");
        }

        const confirmResult = await paymentService.confirmPayment(paymentIntent.id);
        if (!confirmResult.success) {
          throw new Error("Payment confirmation failed");
        }
      }

      const shippingAddressStr = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert([{
          buyer_id: session.user.id,
          total_price: total,
          shipping_address: shippingAddressStr,
          status: "processing"
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      await emailService.sendOrderConfirmation(shippingAddress.email, {
        orderId: newOrder.id,
        totalPrice: total,
        status: "processing",
        shippingAddress: shippingAddressStr
      });

      await supabase
        .from("cart")
        .delete()
        .eq("user_id", session.user.id);

      toast({
        title: "Order placed successfully!",
        description: "Check your email for confirmation"
      });

      navigate(`/orders`);
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="glass-effect border-border p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">Your Cart is Empty</h3>
            <p className="text-muted-foreground mb-6">
              Add items to your cart to proceed with checkout
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-blue-500"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in-up">
          Checkout
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Complete your purchase
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {/* Shipping Address */}
            <Card className="glass-effect border-border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    required
                    className="glass-effect border-border mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="glass-effect border-border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Payment Method
              </h2>
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="glass-effect border-border mb-4">
                  <TabsTrigger value="card">Credit Card</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-500">
                      Test Card: 4242 4242 4242 4242 | Any expiry | Any CVC
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      required
                      className="glass-effect border-border mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                        className="glass-effect border-border mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        required
                        className="glass-effect border-border mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paypal" className="text-center py-8 text-muted-foreground">
                  <p>You will be redirected to PayPal to complete your payment</p>
                </TabsContent>
              </Tabs>
            </Card>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-blue-500 h-12 text-lg"
              disabled={processing}
            >
              {processing ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Card className="glass-effect border-border p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.title} x{item.quantity}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-y border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge className="bg-green-500/10 text-green-500">FREE</Badge>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mt-4 text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
