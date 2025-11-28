import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Send,
  MoreVertical
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data: commentsData, error } = await supabase
          .from("comments")
          .select(`
            *,
            user:user_id (id, full_name, avatar_url)
          `)
          .eq("post_id", postId)
          .is("parent_id", null)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const commentsWithReplies = await Promise.all(
          (commentsData || []).map(async (comment) => {
            const { data: repliesData } = await supabase
              .from("comments")
              .select(`
                *,
                user:user_id (id, full_name, avatar_url)
              `)
              .eq("parent_id", comment.id)
              .order("created_at", { ascending: true });

            return {
              ...comment,
              replies: repliesData || []
            };
          })
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const allCommentIds = [
            ...commentsWithReplies.map(c => c.id),
            ...commentsWithReplies.flatMap(c => c.replies?.map(r => r.id) || [])
          ];

          if (allCommentIds.length > 0) {
            const { data: likesData } = await supabase
              .from("likes")
              .select("comment_id")
              .eq("user_id", session.user.id)
              .in("comment_id", allCommentIds);

            const likedCommentIds = new Set(likesData?.map(l => l.comment_id) || []);

            commentsWithReplies.forEach(comment => {
              comment.is_liked = likedCommentIds.has(comment.id);
              comment.replies?.forEach(reply => {
                reply.is_liked = likedCommentIds.has(reply.id);
              });
            });
          }
        }

        setComments(commentsWithReplies);
      } catch (error: unknown) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          user:user_id (id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, { ...data, replies: [] }]);
      setNewComment("");
    } catch (error: unknown) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content: replyContent.trim(),
          parent_id: parentId
        })
        .select(`
          *,
          user:user_id (id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments(prev => prev.map(comment =>
        comment.id === parentId
          ? { ...comment, replies: [...(comment.replies || []), data] }
          : comment
      ));

      setReplyingTo(null);
      setReplyContent("");
    } catch (error: unknown) {
      console.error("Error creating reply:", error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const comment = comments.find(c => c.id === commentId) ||
                     comments.flatMap(c => c.replies || []).find(r => r.id === commentId);

      if (!comment) return;

      if (comment.is_liked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({
            comment_id: commentId,
            user_id: session.user.id
          });

        if (error) throw error;
      }

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: !comment.is_liked,
            likes_count: (comment.likes_count || 0) + (comment.is_liked ? -1 : 1)
          };
        }
        if (comment.replies) {
          comment.replies = comment.replies.map(reply =>
            reply.id === commentId
              ? {
                  ...reply,
                  is_liked: !reply.is_liked,
                  likes_count: (reply.likes_count || 0) + (reply.is_liked ? -1 : 1)
                }
              : reply
          );
        }
        return comment;
      }));
    } catch (error: unknown) {
      console.error("Error toggling comment like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
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

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar_url} />
        <AvatarFallback className="text-xs">
          {comment.user.full_name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.full_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-2 ml-3">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 text-xs ${comment.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={() => handleLikeComment(comment.id)}
          >
            <Heart className={`h-3 w-3 mr-1 ${comment.is_liked ? 'fill-current' : ''}`} />
            {comment.likes_count || 0}
          </Button>

          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-3 ml-3 flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 glass-effect border-border text-sm resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
                className="bg-gradient-to-r from-primary to-blue-500"
              >
                <Send className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 glass-effect border-border text-sm resize-none"
            rows={2}
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            className="bg-gradient-to-r from-primary to-blue-500 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} />
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};