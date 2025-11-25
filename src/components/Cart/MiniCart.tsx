import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from "lucide-react";

export const MiniCart = () => {
  const navigate = useNavigate();
  const { cartItems, cartSummary, updateQuantity, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  return (
    <div className="relative" ref={cartRef}>
      {/* Cart Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className="relative glass-effect text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {cartSummary.itemCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {cartSummary.itemCount}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Cart Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Shopping Cart</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {cartItems.slice(0, 3).map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-lg hover:bg-muted/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.product.title}
                          </p>
                          <p className="text-sm text-primary font-medium">
                            {formatPrice(item.product.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 mt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-6 w-6"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-6 w-6"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-6 w-6 flex-shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}

                    {cartItems.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-muted-foreground">
                          +{cartItems.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-border p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-primary">
                      {formatPrice(cartSummary.total)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/cart');
                      }}
                    >
                      View Cart
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-blue-500"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/checkout');
                      }}
                    >
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};