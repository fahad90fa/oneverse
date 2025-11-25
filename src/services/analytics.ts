import { supabase } from "@/integrations/supabase/client";

interface CategoryTotal {
  [key: string]: number;
}

interface OrderData {
  total_price?: number;
  created_at: string;
  products?: { category?: string };
}

export const analyticsService = {
  async getBuyerAnalytics(userId: string, startDate: string, endDate: string) {
    try {
      const { data: orders } = await supabase
        .from("orders")
        .select("*, products(price, category)")
        .eq("buyer_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const spending = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
      
      const byCategory = orders?.reduce((acc: CategoryTotal, o: OrderData) => {
        const cat = o.products?.category || "Other";
        acc[cat] = (acc[cat] || 0) + (o.total_price || 0);
        return acc;
      }, {} as CategoryTotal) || {};

      const chartData = (orders || []).map((o) => ({
        date: new Date(o.created_at).toLocaleDateString(),
        amount: o.total_price || 0,
      }));

      return {
        totalSpending: spending,
        orderCount: orders?.length || 0,
        averageOrder: orders?.length ? (spending / orders.length).toFixed(2) : 0,
        byCategory,
        orders: orders || [],
        chartData,
      };
    } catch (error) {
      console.error("Error fetching buyer analytics:", error);
      throw error;
    }
  },

  async getSellerAnalytics(userId: string, startDate: string, endDate: string) {
    try {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const revenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
      
      const chartData = (orders || []).map((o) => ({
        date: new Date(o.created_at).toLocaleDateString(),
        amount: o.total_price || 0,
      }));

      return {
        totalRevenue: revenue,
        totalOrders: orders?.length || 0,
        averageOrderValue: orders?.length ? (revenue / orders.length).toFixed(2) : 0,
        conversionRate: ((orders?.length || 0) / 100) * 100,
        orders: orders || [],
        chartData,
      };
    } catch (error) {
      console.error("Error fetching seller analytics:", error);
      throw error;
    }
  },

  async getClientAnalytics(userId: string, startDate: string, endDate: string) {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const spending = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const completed = projects?.filter((p) => p.status === "completed").length || 0;

      const chartData = (projects || []).map((p) => ({
        date: new Date(p.created_at).toLocaleDateString(),
        amount: p.budget || 0,
      }));

      return {
        totalSpent: spending,
        projectCount: projects?.length || 0,
        completedProjects: completed,
        completionRate: projects?.length ? ((completed / projects.length) * 100).toFixed(1) : 0,
        projects: projects || [],
        chartData,
      };
    } catch (error) {
      console.error("Error fetching client analytics:", error);
      throw error;
    }
  },

  async getWorkerAnalytics(userId: string, startDate: string, endDate: string) {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("worker_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", userId);

      const earnings = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const avgRating = reviews?.length 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      const chartData = (projects || []).map((p) => ({
        date: new Date(p.created_at).toLocaleDateString(),
        amount: p.budget || 0,
      }));

      return {
        totalEarnings: earnings,
        projectCount: projects?.length || 0,
        averageProjectValue: projects?.length ? (earnings / projects.length).toFixed(2) : 0,
        averageRating: avgRating,
        projects: projects || [],
        chartData,
      };
    } catch (error) {
      console.error("Error fetching worker analytics:", error);
      throw error;
    }
  },

  async saveSearch(userId: string, query: string, filters: Record<string, unknown>) {
    try {
      return await supabase.from("saved_searches").insert({
        user_id: userId,
        query,
        filters: JSON.stringify(filters),
      });
    } catch (error) {
      console.error("Error saving search:", error);
      throw error;
    }
  },

  async getRecentSearches(userId: string) {
    try {
      const { data } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    } catch (error) {
      console.error("Error fetching recent searches:", error);
      return [];
    }
  },
};
