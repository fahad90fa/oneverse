import { supabase } from '../integrations/supabase/client';

export interface UploadOptions {
  file: File;
  userId?: string;
  uploadType: string;
}

type UploadConfig = {
  maxSize: number;
  allowed: string[];
};

type UploadTarget = {
  bucket: string;
  folder: string;
};

const uploadConfigs: Record<string, UploadConfig> = {
  profile_picture: {
    maxSize: 5 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif']
  },
  project_file: {
    maxSize: 50 * 1024 * 1024,
    allowed: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  'project-files': {
    maxSize: 50 * 1024 * 1024,
    allowed: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  product_image: {
    maxSize: 10 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  portfolio_image: {
    maxSize: 10 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  posts: {
    maxSize: 10 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  verification: {
    maxSize: 15 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  }
};

const uploadTargets: Record<string, UploadTarget> = {
  profile_picture: { bucket: 'documents', folder: 'profiles' },
  project_file: { bucket: 'documents', folder: 'project-files' },
  'project-files': { bucket: 'documents', folder: 'project-files' },
  product_image: { bucket: 'documents', folder: 'products' },
  portfolio_image: { bucket: 'documents', folder: 'portfolio' },
  posts: { bucket: 'documents', folder: 'posts' },
  verification: { bucket: 'documents', folder: 'verifications' }
};

const defaultTarget: UploadTarget = { bucket: 'documents', folder: 'general' };

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');

const resolveUserId = async (providedId?: string) => {
  if (providedId) return providedId;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user.id;
};

const getUploadTarget = (uploadType?: string): UploadTarget => {
  if (!uploadType) return defaultTarget;
  return uploadTargets[uploadType] || {
    bucket: defaultTarget.bucket,
    folder: sanitizeFileName(uploadType) || defaultTarget.folder
  };
};

const buildFilePath = (folder: string, userId: string, fileName: string) => {
  const safeName = sanitizeFileName(fileName);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${folder}/${userId}/${uniqueSuffix}-${safeName}`;
};

export const fileUploadService = {
  async uploadFile(options: UploadOptions | File, legacyUploadType?: string) {
    try {
      let file: File | undefined;
      let uploadType: string | undefined;
      let providedUserId: string | undefined;

      if (options instanceof File) {
        file = options;
        uploadType = legacyUploadType;
      } else {
        file = options.file;
        uploadType = options.uploadType;
        providedUserId = options.userId;
      }

      if (!file) {
        throw new Error('No file provided');
      }

      if (!uploadType) {
        throw new Error('No upload type provided');
      }

      const userId = await resolveUserId(providedUserId);
      const target = getUploadTarget(uploadType);
      const filePath = buildFilePath(target.folder, userId, file.name);

      this.validateFile(file, uploadType);

      const { error } = await supabase.storage
        .from(target.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: publicData } = supabase.storage
        .from(target.bucket)
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl || '';

      return {
        url: publicUrl,
        file_url: publicUrl,
        file_name: file.name,
        file_path: filePath,
        bucket: target.bucket
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async uploadMultipleFiles(files: File[], uploadType: string, userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const uploadPromises = files.map(file =>
        this.uploadFile({ file, userId: resolvedUserId, uploadType })
      );

      const results = await Promise.all(uploadPromises);

      return {
        success: true,
        files: results.map(r => ({
          url: r.file_url,
          name: r.file_name,
          record: r
        }))
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  },

  async deleteFile(path: string, bucket = defaultTarget.bucket) {
    try {
      if (!path) return;
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async getUserFiles(userId: string, uploadType?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const target = getUploadTarget(uploadType);
      const prefix = `${target.folder}/${resolvedUserId}`;

      const { data, error } = await supabase.storage
        .from(target.bucket)
        .list(prefix, { limit: 100 });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(file => {
        const filePath = `${prefix}/${file.name}`;
        const { data: publicData } = supabase.storage
          .from(target.bucket)
          .getPublicUrl(filePath);
        return {
          ...file,
          path: filePath,
          url: publicData?.publicUrl || ''
        };
      });
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  },

  async getProfilePicture(userId: string) {
    try {
      const files = await this.getUserFiles(userId, 'profile_picture');
      return files && files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  },

  validateFile(file: File, uploadType: string) {
    const normalizedType = uploadConfigs[uploadType]
      ? uploadType
      : uploadType.replace('-', '_');
    const config = uploadConfigs[normalizedType] || uploadConfigs[uploadType];

    if (!config) {
      return true;
    }

    if (file.size > config.maxSize) {
      throw new Error(`File size exceeds maximum of ${config.maxSize / 1024 / 1024}MB`);
    }

    if (!config.allowed.includes(file.type)) {
      throw new Error(`File type not allowed. Accepted types: ${config.allowed.join(', ')}`);
    }

    return true;
  }
};
