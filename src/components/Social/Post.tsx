import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "./CommentSection";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Bookmark,
  Flag
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

interface PostProps {
  post: PostData;
  onInteraction: (postId: string, action: 'like' | 'share') => void;
}

export const Post = ({ post, onInteraction }: PostProps) => {
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to like posts",
          variant: "destructive"
        });
        return;
      }

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: session.user.id
          });

        if (error) throw error;
      }

      onInteraction(post.id, 'like');
    } catch (error: unknown) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to share posts",
          variant: "destructive"
        });
        return;
      }

      if (post.is_shared) {
        // Unshare
        const { error } = await supabase
          .from("shares")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        // Share
        const { error } = await supabase
          .from("shares")
          .insert({
            post_id: post.id,
            user_id: session.user.id
          });

        if (error) throw error;
      }

      onInteraction(post.id, 'share');
    } catch (error: unknown) {
      console.error("Error toggling share:", error);
      toast({
        title: "Error",
        description: "Failed to update share",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    toast({
      title: "Feature coming soon",
      description: "Post saving will be available in a future update"
    });
  };

  const handleReport = () => {
    toast({
      title: "Post reported",
      description: "Thank you for helping keep our community safe"
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <Card className="glass-effect border-border p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback>
              {post.user.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.user.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="glass-effect">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-4 rounded-lg overflow-hidden ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
        }`}>
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className={`w-full object-cover ${
                post.images.length === 3 && index === 0 ? 'row-span-2' : 'h-48'
              }`}
            />
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-4">
          {post.likes_count > 0 && (
            <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
          )}
          {post.comments_count > 0 && (
            <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
          )}
          {post.shares_count > 0 && (
            <span>{post.shares_count} {post.shares_count === 1 ? 'share' : 'shares'}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`glass-effect ${post.is_liked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
            {post.is_liked ? 'Liked' : 'Like'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="glass-effect"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`glass-effect ${post.is_shared ? 'text-blue-500' : ''}`}
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {post.is_shared ? 'Shared' : 'Share'}
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="glass-effect"
            onClick={handleSave}
          >
            <Bookmark className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="glass-effect text-muted-foreground hover:text-red-500"
            onClick={handleReport}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border">
          <CommentSection postId={post.id} />
        </div>
      )}
    </Card>
  );
};