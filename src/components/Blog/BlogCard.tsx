import { motion } from 'framer-motion';
import { Clock, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { BlogWithAuthor } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BlogCardProps {
  blog: BlogWithAuthor;
  onClick?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const BlogCard = ({ blog, onClick, onLike, isLiked = false }: BlogCardProps) => {
  const [likes, setLikes] = useState(blog.likes_count || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const readingTime = Math.ceil((blog.content.split(' ').length || 0) / 200);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
        {blog.featured_image_url && (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            <img
              src={blog.featured_image_url}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {blog.is_featured && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                Featured
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {blog.category && (
            <span className="inline-block px-2 py-1 mb-3 text-xs font-semibold text-accent bg-accent/10 rounded">
              {blog.category}
            </span>
          )}

          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {blog.excerpt || blog.content.substring(0, 150)}...
          </p>

          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{blog.views_count || 0} views</span>
            </div>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                {blog.author?.user_metadata?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-semibold">
                  {blog.author?.user_metadata?.full_name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLiked
                    ? 'bg-red-500/20 text-red-500'
                    : 'hover:bg-primary/10 text-muted-foreground'
                }`}
              >
                <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
