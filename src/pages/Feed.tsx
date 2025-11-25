import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PostCreator } from "@/components/Social/PostCreator";
import { Post } from "@/components/Social/Post";
import {
  Home,
  TrendingUp,
  Users,
  Filter,
  ArrowLeft
} from "lucide-react";

interface PostData {
  id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
  is_shared?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, [filter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(session.user);
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          user:user_id (id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      // Apply filter
      if (filter === "connections") {
        // For now, show all posts. In a real app, you'd filter by connections
        // This would require a connections/followers table
      } else if (filter === "popular") {
        query = query.order("likes_count", { ascending: false });
      }

      const { data: postsData, error } = await query;
      if (error) throw error;

      if (currentUser) {
        // Check which posts the current user has liked/shared
        const postIds = postsData?.map(p => p.id) || [];
        if (postIds.length > 0) {
          const { data: likesData } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", currentUser.id)
            .in("post_id", postIds);

          const { data: sharesData } = await supabase
            .from("shares")
            .select("post_id")
            .eq("user_id", currentUser.id)
            .in("post_id", postIds);

          const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);
          const sharedPostIds = new Set(sharesData?.map(s => s.post_id) || []);

          const postsWithInteractions = postsData?.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id),
            is_shared: sharedPostIds.has(post.id)
          })) || [];

          setPosts(postsWithInteractions);
        } else {
          setPosts(postsData || []);
        }
      } else {
        setPosts(postsData || []);
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostInteraction = (postId: string, action: 'like' | 'share') => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            is_liked: action === 'like' ? !post.is_liked : post.is_liked,
            is_shared: action === 'share' ? !post.is_shared : post.is_shared,
            likes_count: action === 'like'
              ? (post.is_liked ? post.likes_count - 1 : post.likes_count + 1)
              : post.likes_count,
            shares_count: action === 'share'
              ? (post.is_shared ? post.shares_count - 1 : post.shares_count + 1)
              : post.shares_count
          }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Social Feed
              </h1>
              <p className="text-muted-foreground">Connect with the community</p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 glass-effect border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    All Posts
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Connections
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Post Creator */}
        <Card className="glass-effect border-border p-6 mb-8">
          <PostCreator onPostCreated={handlePostCreated} />
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="glass-effect border-border p-12 text-center">
              <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share something with the community!
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onInteraction={handlePostInteraction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;