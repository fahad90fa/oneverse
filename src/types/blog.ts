export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category?: string;
  meta_title?: string;
  meta_description?: string;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogLike {
  id: string;
  blog_id: string;
  user_id: string;
  created_at: string;
}

export interface BlogWithAuthor extends Blog {
  author?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  comments_count?: number;
  likes_count?: number;
}
