import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Save, X, Eye, EyeOff } from 'lucide-react';
import { Blog } from '@/types/blog';

interface BlogEditorProps {
  initialBlog?: Blog;
  onSave: (blog: Partial<Blog>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const BlogEditor = ({ initialBlog, onSave, onCancel, isLoading = false }: BlogEditorProps) => {
  const [title, setTitle] = useState(initialBlog?.title || '');
  const [slug, setSlug] = useState(initialBlog?.slug || '');
  const [content, setContent] = useState(initialBlog?.content || '');
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || '');
  const [category, setCategory] = useState(initialBlog?.category || '');
  const [tags, setTags] = useState((initialBlog?.tags || []).join(', '));
  const [featured_image_url, setFeaturedImage] = useState(initialBlog?.featured_image_url || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(initialBlog?.status || 'draft');
  const [preview, setPreview] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialBlog) {
      setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
    }
  };

  const handleSave = () => {
    onSave({
      id: initialBlog?.id,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      content,
      excerpt: excerpt || content.substring(0, 150),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      featured_image_url,
      status,
      published_at: status === 'published' ? new Date().toISOString() : undefined
    });
  };

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background p-8"
      >
        <button
          onClick={() => setPreview(false)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <EyeOff className="h-5 w-5" />
          Back to Editor
        </button>

        <article className="max-w-3xl mx-auto">
          {featured_image_url && (
            <img
              src={featured_image_url}
              alt={title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-5xl font-bold mb-4">{title}</h1>

          {category && (
            <span className="inline-block px-3 py-1 mb-4 bg-primary/10 text-primary text-sm font-semibold rounded">
              {category}
            </span>
          )}

          <div className="prose dark:prose-invert max-w-none mb-8">
            {content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>

          {tags && (
            <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
              {tags.split(',').map((tag) => (
                <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </article>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter blog title"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="blog-post-slug"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Technology"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Featured Image URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={featured_image_url}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button variant="outline" size="icon">
            <Image className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of your post"
          rows={2}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog post here (Markdown supported)..."
          rows={12}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-vertical font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Supports Markdown formatting (** for bold, * for italic, # for headings, etc.)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Separate with commas: tech, web, react"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex gap-3 pt-6 border-t border-border">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            Preview
          </Button>
        </motion.div>

        <div className="flex-1" />

        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
        )}

        <Button
          onClick={handleSave}
          disabled={isLoading || !title || !content}
          className="flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {initialBlog ? 'Update' : 'Publish'} Blog
        </Button>
      </div>
    </motion.div>
  );
};

export default BlogEditor;
