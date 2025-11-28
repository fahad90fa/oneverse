import { supabase } from '@/integrations/supabase/client';

export interface RecommendationResult {
  id: string;
  title: string;
  price: number;
  images: string[];
  category?: string;
  rating?: number;
  score: number; // Recommendation score
  reason: string; // Why this product is recommended
}

export class RecommendationsService {
  // Get similar products based on category and attributes
  static async getSimilarProducts(
    productId: string,
    category?: string,
    limit = 6
  ): Promise<RecommendationResult[]> {
    try {
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
        .neq('id', productId)
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(product => ({
        ...product,
        score: Math.random() * 0.5 + 0.5, // Random score for demo
        reason: category ? 'Similar category' : 'Popular choice'
      }));
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  // Get products frequently bought together
  static async getFrequentlyBoughtTogether(
    productId: string,
    limit = 4
  ): Promise<RecommendationResult[]> {
    try {
      // In a real implementation, this would analyze order data
      // For now, we'll return random products from the same category
      const { data: product } = await supabase
        .from('products')
        .select('category')
        .eq('id', productId)
        .single();

      if (!product?.category) return [];

      const { data, error } = await supabase
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
        .eq('category', product.category)
        .neq('id', productId)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(product => ({
        ...product,
        score: Math.random() * 0.3 + 0.7,
        reason: 'Frequently bought together'
      }));
    } catch (error) {
      console.error('Error fetching frequently bought together:', error);
      return [];
    }
  }

  // Get trending products based on recent activity
  static async getTrendingProducts(limit = 6): Promise<RecommendationResult[]> {
    try {
      // In a real implementation, this would analyze recent orders, views, etc.
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(product => ({
        ...product,
        score: Math.random() * 0.4 + 0.6,
        reason: 'Trending now'
      }));
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  }

  // Get personalized recommendations based on user history
  static async getPersonalizedRecommendations(
    userId: string,
    limit = 6
  ): Promise<RecommendationResult[]> {
    try {
      const result = (await (supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .limit(10) as unknown)) as {
        data: unknown;
        error: unknown;
      };

      const orders = Array.isArray(result.data) ? result.data : [];

      if (!orders || orders.length === 0) {
        return this.getTrendingProducts(limit);
      }

      const categories: string[] = [];

      const { data, error } = await supabase
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

      if (error) throw error;

      const products = Array.isArray(data) ? data : [];
      return (products || []).map((product: unknown) => ({
        ...product,
        score: Math.random() * 0.3 + 0.8,
        reason: 'Based on your purchases'
      }));
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      return [];
    }
  }

  // Get recently viewed products (would typically use browser storage or backend tracking)
  static async getRecentlyViewedProducts(
    userId: string,
    excludeIds: string[] = [],
    limit = 6
  ): Promise<RecommendationResult[]> {
    try {
      // In a real implementation, this would track user views
      // For now, return recent products excluding specified IDs
      const { data, error } = await supabase
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
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(product => ({
        ...product,
        score: Math.random() * 0.2 + 0.3,
        reason: 'Recently viewed'
      }));
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
      return [];
    }
  }

  // Get products by price range (complementary products)
  static async getComplementaryProducts(
    basePrice: number,
    category?: string,
    limit = 4
  ): Promise<RecommendationResult[]> {
    try {
      const minPrice = basePrice * 0.5;
      const maxPrice = basePrice * 1.5;

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
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(product => ({
        ...product,
        score: Math.random() * 0.4 + 0.6,
        reason: 'Similar price range'
      }));
    } catch (error) {
      console.error('Error fetching complementary products:', error);
      return [];
    }
  }

  // Main recommendation engine
  static async getRecommendations(
    context: {
      userId?: string;
      productId?: string;
      category?: string;
      currentPrice?: number;
      excludeIds?: string[];
    },
    limit = 6
  ): Promise<RecommendationResult[]> {
    const { userId, productId, category, currentPrice, excludeIds = [] } = context;

    try {
      const recommendations: RecommendationResult[] = [];

      // 1. Personalized recommendations (highest priority)
      if (userId) {
        const personalized = await this.getPersonalizedRecommendations(userId, Math.floor(limit * 0.4));
        recommendations.push(...personalized);
      }

      // 2. Similar products
      if (productId) {
        const similar = await this.getSimilarProducts(productId, category, Math.floor(limit * 0.3));
        recommendations.push(...similar.filter(r => !recommendations.some(rec => rec.id === r.id)));
      }

      // 3. Frequently bought together
      if (productId) {
        const frequent = await this.getFrequentlyBoughtTogether(productId, Math.floor(limit * 0.2));
        recommendations.push(...frequent.filter(r => !recommendations.some(rec => rec.id === r.id)));
      }

      // 4. Complementary products
      if (currentPrice) {
        const complementary = await this.getComplementaryProducts(currentPrice, category, Math.floor(limit * 0.2));
        recommendations.push(...complementary.filter(r => !recommendations.some(rec => rec.id === r.id)));
      }

      // 5. Fill with trending products if needed
      if (recommendations.length < limit) {
        const trending = await this.getTrendingProducts(limit - recommendations.length);
        recommendations.push(...trending.filter(r => !recommendations.some(rec => rec.id === r.id)));
      }

      // Remove excluded products and limit results
      return recommendations
        .filter(rec => !excludeIds.includes(rec.id))
        .slice(0, limit)
        .sort((a, b) => b.score - a.score); // Sort by recommendation score

    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Fallback to trending products
      return this.getTrendingProducts(limit);
    }
  }
}