import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
  following?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
  };
  follower?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
  };
}

export interface ConnectionSuggestion {
  id: string;
  user_id: string;
  suggested_user_id: string;
  reason: string;
  score: number;
  created_at: string;
  suggested_user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    skills: string[];
  };
}

export const useConnections = () => {
  const [followers, setFollowers] = useState<Connection[]>([]);
  const [following, setFollowing] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFollowers = useCallback(async (userId?: string) => {
    try {
      const targetUserId = userId || (await supabase.auth.getSession()).data.session?.user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          follower:follower_id (
            id,
            username,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', targetUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowers(data || []);
    } catch (error: unknown) {
      console.error('Error fetching followers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load followers',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchFollowing = useCallback(async (userId?: string) => {
    try {
      const targetUserId = userId || (await supabase.auth.getSession()).data.session?.user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          following:following_id (
            id,
            username,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', targetUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowing(data || []);
    } catch (error: unknown) {
      console.error('Error fetching following:', error);
      toast({
        title: 'Error',
        description: 'Failed to load following',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('connection_suggestions')
        .select(`
          *,
          suggested_user:suggested_user_id (
            id,
            username,
            full_name,
            avatar_url,
            bio,
            skills
          )
        `)
        .eq('user_id', session.user.id)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error: unknown) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load suggestions',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const followUser = async (userId: string) => {
    try {
      setFollowLoading(userId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: 'Please sign in',
          description: 'You need to be signed in to follow users',
          variant: 'destructive',
        });
        return false;
      }

      if (session.user.id === userId) {
        toast({
          title: 'Cannot follow yourself',
          description: 'You cannot follow your own account',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          follower_id: session.user.id,
          following_id: userId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Already following',
            description: 'You are already following this user',
          });
          return false;
        }
        throw error;
      }

      // Optimistically update the following list
      const followingUser = await getUserProfile(userId);
      if (followingUser) {
        setFollowing(prev => [{
          ...data,
          following: followingUser
        }, ...prev]);
      }

      toast({
        title: 'Following',
        description: 'You are now following this user',
      });
      return true;
    } catch (error: unknown) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setFollowLoading(null);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      setFollowLoading(userId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', userId);

      if (error) throw error;

      // Remove from following list
      setFollowing(prev => prev.filter(conn => conn.following_id !== userId));

      toast({
        title: 'Unfollowed',
        description: 'You have unfollowed this user',
      });
      return true;
    } catch (error: unknown) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setFollowLoading(null);
    }
  };

  const blockUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // First check if there's an existing connection
      const { data: existing } = await supabase
        .from('connections')
        .select('id')
        .eq('follower_id', session.user.id)
        .eq('following_id', userId)
        .single();

      if (existing) {
        // Update existing connection to blocked
        const { error } = await supabase
          .from('connections')
          .update({ status: 'blocked' })
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Create new blocked connection
        const { error } = await supabase
          .from('connections')
          .insert({
            follower_id: session.user.id,
            following_id: userId,
            status: 'blocked',
          });

        if (error) throw error;
      }

      // Remove from following list if present
      setFollowing(prev => prev.filter(conn => conn.following_id !== userId));

      toast({
        title: 'User blocked',
        description: 'You have blocked this user',
      });
      return true;
    } catch (error: unknown) {
      console.error('Error blocking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive',
      });
      return false;
    }
  };

  const isFollowing = (userId: string) => {
    return following.some(conn => conn.following_id === userId && conn.status === 'active');
  };

  const isBlocked = (userId: string) => {
    return following.some(conn => conn.following_id === userId && conn.status === 'blocked');
  };

  const getFollowersCount = (userId?: string) => {
    // This would need to be fetched from profiles table
    // For now, return the length of followers array
    return followers.length;
  };

  const getFollowingCount = (userId?: string) => {
    return following.length;
  };

  const getMutualConnections = (userId: string) => {
    // Get users that both current user and target user follow
    const currentUserFollowing = following.map(conn => conn.following_id);
    const targetUserFollowing = followers
      .filter(conn => conn.follower_id === userId)
      .map(conn => conn.following_id);

    return currentUserFollowing.filter(id => targetUserFollowing.includes(id));
  };

  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const refetchAll = async (userId?: string) => {
      setLoading(true);
      await Promise.all([
        fetchFollowers(userId),
        fetchFollowing(userId),
        fetchSuggestions(),
      ]);
      setLoading(false);
    };

    refetchAll();
  }, [fetchFollowers, fetchFollowing, fetchSuggestions]);

  return {
    followers,
    following,
    suggestions,
    loading,
    followLoading,
    followUser,
    unfollowUser,
    blockUser,
    isFollowing,
    isBlocked,
    getFollowersCount,
    getFollowingCount,
    getMutualConnections,
    fetchFollowers,
    fetchFollowing,
    fetchSuggestions,
    refetch: refetchAll,
  };
};