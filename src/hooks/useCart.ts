import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_id: string;
  };
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export const useCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:product_id (
            id,
            title,
            price,
            images,
            seller_id
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add item to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: session.user.id,
            product_id: productId,
            quantity
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Update item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      } else {
        // Update quantity
        const { error } = await supabase
          .from('cart')
          .update({ quantity })
          .eq('id', itemId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    },
  });

  // Remove item from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  // Calculate cart summary
  const cartSummary: CartSummary = {
    subtotal: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
    tax: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08, // 8% tax
    shipping: cartItems.length > 0 ? 9.99 : 0, // Flat shipping rate
    total: 0,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };

  cartSummary.total = cartSummary.subtotal + cartSummary.tax + cartSummary.shipping;

  // Helper functions
  const addToCart = useCallback((productId: string, quantity = 1) => {
    addToCartMutation.mutate({ productId, quantity });
  }, [addToCartMutation]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  }, [updateQuantityMutation]);

  const removeFromCart = useCallback((itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  }, [removeFromCartMutation]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product_id === productId);
  }, [cartItems]);

  const getCartItemQuantity = useCallback((productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item?.quantity || 0;
  }, [cartItems]);

  return {
    cartItems,
    cartSummary,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getCartItemQuantity,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};