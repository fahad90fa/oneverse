import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useBlogQueries } from '@/hooks/useBlogQueries';
import BlogDetailComponent from '@/components/Blog/BlogDetail';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { useBlogBySlug, useBlogComments, addCommentMutation } = useBlogQueries();
  const { data: blog, isLoading: blogLoading } = useBlogBySlug(slug || '');
  const { data: comments = [] } = useBlogComments(blog?.id || '');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  if (blogLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Not Found</h1>
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Blog
          </motion.button>
        </div>
      </div>
    );
  }

  const handleComment = (content: string) => {
    if (user && blog.id) {
      addCommentMutation.mutate({
        blog_id: blog.id,
        user_id: user.id,
        content
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Blog
        </motion.button>

        <BlogDetailComponent
          blog={blog}
          comments={comments}
          onComment={handleComment}
          onShare={() => {
            if (navigator.share) {
              navigator.share({
                title: blog.title,
                text: blog.excerpt || blog.title,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          isLoading={addCommentMutation.isPending}
        />
      </div>
    </div>
  );
};

export default BlogDetailPage;
