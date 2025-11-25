import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Clock } from 'lucide-react';
import { BlogWithAuthor, BlogComment } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BlogDetailProps {
  blog: BlogWithAuthor;
  comments?: BlogComment[];
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: (content: string) => void;
  onShare?: () => void;
  isLoading?: boolean;
}

const BlogDetail = ({
  blog,
  comments = [],
  isLiked = false,
  onLike,
  onComment,
  onShare,
  isLoading = false
}: BlogDetailProps) => {
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState(blog.likes_count || 0);
  const readingTime = Math.ceil((blog.content.split(' ').length || 0) / 200);

  const handleLike = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(commentText);
      setCommentText('');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto"
    >
      {blog.featured_image_url && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={blog.featured_image_url}
          alt={blog.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}

      <div className="space-y-4 mb-8">
        <h1 className="text-5xl font-bold">{blog.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {blog.author?.user_metadata?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {blog.author?.user_metadata?.full_name || 'Anonymous'}
              </p>
              <p className="text-xs">
                {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="text-muted-foreground">
              {blog.views_count || 0} views
            </div>
          </div>
        </div>

        {blog.category && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded">
            {blog.category}
          </span>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        {blog.content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-border">
          {blog.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 mb-8 py-6 border-y border-border"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'bg-red-500/20 text-red-500'
              : 'hover:bg-primary/10 text-muted-foreground'
          }`}
        >
          <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likes} Likes</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length} Comments</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors"
        >
          <Share2 className="h-5 w-5" />
          Share
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>

        <div className="space-y-4 mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <Button
            onClick={handleComment}
            disabled={isLoading || !commentText.trim()}
            className="w-full"
          >
            Post Comment
          </Button>
        </div>

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-border rounded-lg"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  C
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">User</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.article>
  );
};

export default BlogDetail;
