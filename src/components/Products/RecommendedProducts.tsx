import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  ShoppingCart,
  Heart,
  Star,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category?: string;
  rating?: number;
  review_count?: number;
  seller_id: string;
}

interface RecommendedProductsProps {
  currentProductId?: string;
  category?: string;
  limit?: number;
  type?: 'similar' | 'popular' | 'recently_viewed' | 'trending';
  className?: string;
}

export const RecommendedProducts = ({
  currentProductId,
  category,
  limit = 6,
  type = 'similar',
  className = ""
}: RecommendedProductsProps) => {
  const navigate = useNavigate();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', type, currentProductId, category, limit],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          images,
          category,
          seller_id
        `)
        .eq('status', 'active')
        .limit(limit);

      // Filter based on type
      switch (type) {
        case 'similar':
          if (category) {
            query = query.eq('category', category);
          }
          if (currentProductId) {
            query = query.neq('id', currentProductId);
          }
          break;

        case 'popular':
          // In a real app, you'd sort by sales/popularity
          query = query.order('created_at', { ascending: false });
          break;

        case 'trending':
          // In a real app, you'd sort by recent sales velocity
          query = query.order('created_at', { ascending: false });
          break;

        case 'recently_viewed':
          // In a real app, you'd get from user's recently viewed items
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });

  const getTitle = () => {
    switch (type) {
      case 'similar':
        return 'Similar Products';
      case 'popular':
        return 'Popular Products';
      case 'trending':
        return 'Trending Now';
      case 'recently_viewed':
        return 'Recently Viewed';
      default:
        return 'Recommended for You';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'similar':
        return <Sparkles className="h-5 w-5" />;
      case 'popular':
        return <Users className="h-5 w-5" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      case 'recently_viewed':
        return <Clock className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded animate-pulse" />
          <div className="w-32 h-5 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="w-full h-32 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-muted rounded" />
                  <div className="w-1/2 h-4 bg-muted rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
        <h3 className="text-lg font-semibold">{getTitle()}</h3>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="glass-effect border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist logic here
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {type === 'trending' && (
                    <Badge className="bg-red-500/90 text-white text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  {type === 'popular' && (
                    <Badge className="bg-blue-500/90 text-white text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>

                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View More Button */}
      {recommendations.length >= limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="glass-effect"
          >
            View More Products
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

// Quick recommendations component for product detail pages
export const ProductRecommendations = ({
  productId,
  category,
  className = ""
}: {
  productId: string;
  category?: string;
  className?: string;
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Similar Products */}
      <RecommendedProducts
        currentProductId={productId}
        category={category}
        type="similar"
        limit={4}
      />

      {/* Popular in Category */}
      {category && (
        <RecommendedProducts
          category={category}
          type="popular"
          limit={4}
        />
      )}

      {/* Trending Products */}
      <RecommendedProducts
        type="trending"
        limit={4}
      />
    </div>
  );
};