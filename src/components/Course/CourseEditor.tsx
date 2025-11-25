import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Save, X, Eye, EyeOff } from 'lucide-react';
import { Course } from '@/types/course';

interface CourseEditorProps {
  initialCourse?: Course;
  onSave: (course: Partial<Course>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CourseEditor = ({ initialCourse, onSave, onCancel, isLoading = false }: CourseEditorProps) => {
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [slug, setSlug] = useState(initialCourse?.slug || '');
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [price, setPrice] = useState(initialCourse?.price || 0);
  const [currency, setCurrency] = useState(initialCourse?.currency || 'USD');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(initialCourse?.level || 'beginner');
  const [category, setCategory] = useState(initialCourse?.category || '');
  const [tags, setTags] = useState((initialCourse?.tags || []).join(', '));
  const [coverImageUrl, setCoverImageUrl] = useState(initialCourse?.cover_image_url || '');
  const [previewVideoUrl, setPreviewVideoUrl] = useState(initialCourse?.preview_video_url || '');
  const [durationMinutes, setDurationMinutes] = useState(initialCourse?.duration_minutes || 0);
  const [status, setStatus] = useState<'draft' | 'pending_approval' | 'published' | 'archived'>(initialCourse?.status || 'draft');
  const [requiresApproval, setRequiresApproval] = useState(initialCourse?.requires_approval || false);
  const [preview, setPreview] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialCourse) {
      setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
    }
  };

  const handleSave = () => {
    onSave({
      id: initialCourse?.id,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: parseFloat(price.toString()),
      currency,
      level,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      cover_image_url: coverImageUrl,
      preview_video_url: previewVideoUrl,
      duration_minutes: durationMinutes ? parseInt(durationMinutes.toString()) : undefined,
      status,
      requires_approval: requiresApproval,
      published_at: status === 'published' ? new Date().toISOString() : undefined,
      is_featured: false,
      total_students: initialCourse?.total_students || 0,
      average_rating: initialCourse?.average_rating || 0
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

        <div className="max-w-3xl mx-auto">
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div className="space-y-4">
            <h1 className="text-5xl font-bold mb-4">{title}</h1>

            <div className="flex gap-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded">
                {level}
              </span>
              {category && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded">
                  {category}
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-primary">
              {currency} {price}
            </div>

            {durationMinutes > 0 && (
              <p className="text-muted-foreground">
                Duration: {durationMinutes} minutes
              </p>
            )}

            <div className="prose dark:prose-invert max-w-none">
              {description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            {tags && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
                {tags.split(',').map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-secondary/10 text-secondary-foreground text-sm rounded">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Course title"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="course-slug"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            step="0.01"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="PKR">PKR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Web Development"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'pending_approval' | 'published' | 'archived')}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course description"
          rows={6}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Preview Video URL</label>
          <input
            type="url"
            value={previewVideoUrl}
            onChange={(e) => setPreviewVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-semibold">Requires Approval Before Publishing</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setPreview(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="h-5 w-5" />
          Preview
        </Button>

        <Button
          onClick={handleSave}
          disabled={isLoading || !title}
          className="flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {isLoading ? 'Saving...' : 'Save Course'}
        </Button>

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CourseEditor;
