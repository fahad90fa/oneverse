import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useBlogQueries } from '@/hooks/useBlogQueries';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import BlogEditor from '@/components/Blog/BlogEditor';
import { Blog } from '@/types/blog';
import type { User } from '@supabase/supabase-js';

const WorkerBlogs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const { useUserBlogs, createBlogMutation, updateBlogMutation, deleteBlogMutation } = useBlogQueries();
  const { data: blogs = [], isLoading } = useUserBlogs(user?.id || '');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleCreateBlog = (blogData: Partial<Blog>) => {
    createBlogMutation.mutate({
      ...blogData,
      author_id: user.id
    });
    setShowEditor(false);
  };

  const handleUpdateBlog = (blogData: Partial<Blog>) => {
    if (editingBlog) {
      updateBlogMutation.mutate({
        ...blogData,
        id: editingBlog.id
      });
      setEditingBlog(null);
    }
  };

  const handleDeleteBlog = (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteBlogMutation.mutate(blogId);
    }
  };

  if (showEditor || editingBlog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">
            {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <BlogEditor
            initialBlog={editingBlog || undefined}
            onSave={editingBlog ? handleUpdateBlog : handleCreateBlog}
            onCancel={() => {
              setShowEditor(false);
              setEditingBlog(null);
            }}
            isLoading={createBlogMutation.isPending || updateBlogMutation.isPending}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Blog Posts</h1>
            <p className="text-muted-foreground">Manage and publish your articles</p>
          </div>
          <Button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Post
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-2xl text-muted-foreground mb-4">No blog posts yet</p>
          <Button onClick={() => setShowEditor(true)}>Create Your First Post</Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-border rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{blog.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      blog.status === 'published' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                      blog.status === 'draft' ? 'bg-gray-500/20 text-gray-700 dark:text-gray-400' :
                      'bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {blog.status}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {blog.excerpt || blog.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Created: {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                    {blog.published_at && (
                      <span>
                        Published: {new Date(blog.published_at).toLocaleDateString()}
                      </span>
                    )}
                    <span>{blog.views_count || 0} views</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {blog.status === 'published' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      title="View Post"
                    >
                      <Eye className="h-5 w-5" />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingBlog(blog)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="h-5 w-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerBlogs;
