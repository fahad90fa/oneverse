import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
}

export interface ConnectionSuggestion {
  id: string;
  user_id: string;
  suggested_user_id: string;
  reason: string;
  score: number;
  created_at: string;
}

export const connectionService = {
  async followUser(followingId: string): Promise<Connection> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const userId = (session as any)?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const result = (await supabase
      .from("connections" as never)
      .insert({
        follower_id: userId,
        following_id: followingId,
        status: "active",
      } as never)
      .select()
      .single()) as any;

    const { data: connData, error } = result as {
      data: unknown;
      error: unknown;
    };

    if (error) throw error;
    return connData as Connection;
  },

  async unfollowUser(followingId: string): Promise<void> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const userId = (session as any)?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { error } = (await supabase
      .from("connections" as never)
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", followingId)) as {
      error: unknown;
    };

    if (error) throw error;
  },

  async blockUser(userId: string): Promise<Connection> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const currentUserId = (session as any)?.user?.id;
    if (!currentUserId) throw new Error("Not authenticated");

    const result = (await supabase
      .from("connections" as never)
      .upsert({
        follower_id: currentUserId,
        following_id: userId,
        status: "blocked",
      } as never)
      .select()
      .single()) as any;

    const { data: connData, error } = result as {
      data: unknown;
      error: unknown;
    };

    if (error) throw error;
    return connData as Connection;
  },

  async unblockUser(userId: string): Promise<void> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const currentUserId = (session as any)?.user?.id;
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = (await supabase
      .from("connections" as never)
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .eq("status", "blocked")) as {
      error: unknown;
    };

    if (error) throw error;
  },

  async isFollowing(userId: string): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const currentUserId = (session as any)?.user?.id;
    if (!currentUserId) return false;

    const { data: connData, error } = (await supabase
      .from("connections" as never)
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .eq("status", "active")
      .single()) as {
      data: unknown;
      error: { code?: string } | null;
    };

    if (error && error.code !== "PGRST116") throw error;
    return !!connData;
  },

  async checkFollowStatus(targetUserId: string) {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const currentUserId = (session as any)?.user?.id;
    if (!currentUserId) return { isFollowing: false, followsBack: false };

    const { data: follows } = (await supabase
      .from("connections" as never)
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", targetUserId)
      .eq("status", "active")
      .single()) as {
      data: unknown;
    };

    const { data: followedBy } = (await supabase
      .from("connections" as never)
      .select("id")
      .eq("follower_id", targetUserId)
      .eq("following_id", currentUserId)
      .eq("status", "active")
      .single()) as {
      data: unknown;
    };

    return { isFollowing: !!follows, followsBack: !!followedBy };
  },

  async getFollowers(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    const { data, error } = (await supabase
      .from("connections" as never)
      .select(
        `
        id,
        follower_id,
        profiles:follower_id(id, user_id, full_name, avatar_url, trust_score),
        created_at
      `
      )
      .eq("following_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)) as {
      data: unknown;
      error: unknown;
    };

    if (error) throw error;
    return data || [];
  },

  async getFollowing(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    const { data, error } = (await supabase
      .from("connections" as never)
      .select(
        `
        id,
        following_id,
        profiles:following_id(id, user_id, full_name, avatar_url, trust_score),
        created_at
      `
      )
      .eq("follower_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)) as {
      data: unknown;
      error: unknown;
    };

    if (error) throw error;
    return data || [];
  },

  async getFollowerCount(userId: string): Promise<number> {
    const { count, error } = (await supabase
      .from("connections" as never)
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId)
      .eq("status", "active")) as {
      count: number | null;
      error: unknown;
    };

    if (error) throw error;
    return count || 0;
  },

  async getFollowingCount(userId: string): Promise<number> {
    const { count, error } = (await supabase
      .from("connections" as never)
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)
      .eq("status", "active")) as {
      count: number | null;
      error: unknown;
    };

    if (error) throw error;
    return count || 0;
  },

  async getConnectionSuggestions(
    limit = 10
  ): Promise<ConnectionSuggestion[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const { data, error } = await supabase
      .from("connection_suggestions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async dismissSuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabase
      .from("connection_suggestions")
      .delete()
      .eq("id", suggestionId);

    if (error) throw error;
  },

  subscribeToFollowers(
    userId: string,
    callback: (data: any) => void
  ): RealtimeChannel {
    return supabase
      .channel(`followers-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
          filter: `following_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToFollowing(
    userId: string,
    callback: (data: any) => void
  ): RealtimeChannel {
    return supabase
      .channel(`following-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
          filter: `follower_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};
