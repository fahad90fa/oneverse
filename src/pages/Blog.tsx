import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import { useBlogQueries } from '@/hooks/useBlogQueries';
import BlogCard from '@/components/Blog/BlogCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

const Blog = () => {
  const navigate = useNavigate();
  const { usePublishedBlogs } = useBlogQueries();
  const { data: blogs = [] } = usePublishedBlogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const promptLogin = (description: string) => {
    toast({
      title: 'Login required',
      description,
      variant: 'destructive'
    });
    navigate('/auth');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(blogs.map(b => b.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2">Blog</h1>
              <p className="text-xl text-muted-foreground">
                Insights, tips, and stories from our community
              </p>
            </div>

            {user && (
              <Button
                onClick={() => navigate('/dashboard/worker/blogs')}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Write Article
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === null
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedCategory === cat
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Blogs Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onClick={() => navigate(`/blog/${blog.slug}`)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-2xl text-muted-foreground mb-4">
              {searchTerm ? 'No blogs found matching your search' : 'No blogs published yet'}
            </p>
            {!searchTerm && !user && (
              <Button onClick={() => promptLogin('Please log in to publish a blog')}>
                Create Your First Blog
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;
