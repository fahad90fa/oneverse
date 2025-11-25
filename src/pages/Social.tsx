import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  ArrowLeft
} from "lucide-react";

const Social = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: newPost
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared"
      });

      setNewPost("");
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-electric-blue-500 bg-clip-text text-transparent animate-fade-in-up">
            Social Feed
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Connect and share with the community
          </p>
        </div>

        {/* Create Post */}
        {user && (
          <Card className="glass-effect border-border mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="glass-effect border-border resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="glass-effect">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="bg-gradient-to-r from-primary to-blue-500"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glass-effect border-border">
                <div className="p-4 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className="glass-effect border-border hover-scale animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                        {post.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.profiles?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-3 border-t border-border">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
