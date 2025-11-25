import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Blog, BlogComment, BlogLike, BlogWithAuthor } from '@/types/blog';

export const useBlogQueries = () => {
  const queryClient = useQueryClient();

  // Get all published blogs
  const usePublishedBlogs = () =>
    useQuery({
      queryKey: ['blogs', 'published'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });
          
          if (error) throw error;
          return data as BlogWithAuthor[];
        } catch (error) {
          console.error('Error fetching published blogs:', error);
          return [];
        }
      }
    });

  // Get blog by slug
  const useBlogBySlug = (slug: string) =>
    useQuery({
      queryKey: ['blog', slug],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();
          
          if (error) throw error;
          return data as BlogWithAuthor;
        } catch (error) {
          console.error('Error fetching blog:', error);
          return null;
        }
      },
      enabled: !!slug
    });

  // Get user's blogs
  const useUserBlogs = (userId: string) =>
    useQuery({
      queryKey: ['blogs', 'user', userId],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data as Blog[];
        } catch (error) {
          console.error('Error fetching user blogs:', error);
          return [];
        }
      },
      enabled: !!userId
    });

  // Get blog comments
  const useBlogComments = (blogId: string) =>
    useQuery({
      queryKey: ['blog', blogId, 'comments'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('blog_id', blogId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data as BlogComment[];
        } catch (error) {
          console.error('Error fetching blog comments:', error);
          return [];
        }
      },
      enabled: !!blogId
    });

  // Create blog
  const createBlogMutation = useMutation({
    mutationFn: async (blog: Partial<Blog>) => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .insert([blog])
          .select()
          .single();
        
        if (error) throw error;
        return data as Blog;
      } catch (error) {
        console.error('Error creating blog:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    }
  });

  // Update blog
  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Blog> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as Blog;
      } catch (error) {
        console.error('Error updating blog:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    }
  });

  // Delete blog
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: string) => {
      try {
        const { error } = await supabase
          .from('blogs')
          .delete()
          .eq('id', blogId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting blog:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    }
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (comment: Partial<BlogComment>) => {
      try {
        const { data, error } = await supabase
          .from('blog_comments')
          .insert([comment])
          .select()
          .single();
        
        if (error) throw error;
        return data as BlogComment;
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_comments'] });
    }
  });

  // Like blog
  const likeBlogMutation = useMutation({
    mutationFn: async ({ blogId, userId }: { blogId: string; userId: string }) => {
      try {
        const { data, error } = await supabase
          .from('blog_likes')
          .insert([{ blog_id: blogId, user_id: userId }])
          .select()
          .single();
        
        if (error) throw error;
        return data as BlogLike;
      } catch (error) {
        console.error('Error liking blog:', error);
        throw error;
      }
    }
  });

  // Unlike blog
  const unlikeBlogMutation = useMutation({
    mutationFn: async ({ blogId, userId }: { blogId: string; userId: string }) => {
      try {
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error unliking blog:', error);
        throw error;
      }
    }
  });

  return {
    usePublishedBlogs,
    useBlogBySlug,
    useUserBlogs,
    useBlogComments,
    createBlogMutation,
    updateBlogMutation,
    deleteBlogMutation,
    addCommentMutation,
    likeBlogMutation,
    unlikeBlogMutation
  };
};
