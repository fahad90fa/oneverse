import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    stock_quantity: number;
    images: string[];
    status: string;
  };
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:product_id (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: 'Please sign in',
          description: 'You need to be signed in to add items to wishlist',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: session.user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Already in wishlist',
            description: 'This item is already in your wishlist',
          });
          return false;
        }
        throw error;
      }

      setWishlistItems(prev => [data, ...prev]);
      toast({
        title: 'Added to wishlist',
        description: 'Item added to your wishlist',
      });
      return true;
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast({
        title: 'Removed from wishlist',
        description: 'Item removed from your wishlist',
      });
      return true;
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive',
      });
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const getWishlistItem = (productId: string) => {
    return wishlistItems.find(item => item.product_id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItem,
    getWishlistCount,
    refetch: fetchWishlist,
  };
};