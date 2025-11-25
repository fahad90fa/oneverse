import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  Shield,
  ArrowRight
} from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    cartItems,
    cartSummary,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    isUpdating,
    isRemoving,
    isClearing
  } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="glass-effect"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cartItems.length === 0
                  ? "Your cart is empty"
                  : `${cartSummary.itemCount} item${cartSummary.itemCount !== 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={isClearing}
              className="glass-effect hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          )}
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet.
              Start shopping to fill it up!
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-gradient-to-r from-primary to-blue-500"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-border p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                            {item.product.title}
                          </h3>

                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(item.product.price)}
                            </span>
                            <Badge variant="secondary">
                              Qty: {item.quantity}
                            </Badge>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="h-8 w-8 ml-4 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="glass-effect border-border p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartSummary.itemCount} items)</span>
                      <span>{formatPrice(cartSummary.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{cartSummary.shipping === 0 ? 'Free' : formatPrice(cartSummary.shipping)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(cartSummary.tax)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(cartSummary.total)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;