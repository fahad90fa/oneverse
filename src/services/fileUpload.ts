import { apiService } from './api';
import { supabase } from '../integrations/supabase/client';

export interface UploadOptions {
  file: File;
  userId?: string;
  uploadType: string;
}

const uploadConfigs: Record<string, { maxSize: number; allowed: string[] }> = {
  profile_picture: {
    maxSize: 5 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif']
  },
  project_file: {
    maxSize: 50 * 1024 * 1024,
    allowed: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
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
  'project-files': {
    maxSize: 50 * 1024 * 1024,
    allowed: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  },
  verification: {
    maxSize: 15 * 1024 * 1024,
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  }
};

export const fileUploadService = {
  async uploadFile(options: UploadOptions | File, legacyUploadType?: string) {
    try {
      let file: File | undefined;
      let uploadType: string | undefined;
      let userId: string | undefined;

      if (options instanceof File) {
        file = options;
        uploadType = legacyUploadType;
      } else {
        file = options.file;
        uploadType = options.uploadType;
        userId = options.userId;
      }

      if (!file) {
        throw new Error('No file provided');
      }

      if (!uploadType) {
        throw new Error('No upload type provided');
      }

      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          throw new Error('User not authenticated');
        }
        userId = session.user.id;
      }

      this.validateFile(file, uploadType);

      return apiService.uploadFile(file, userId, uploadType);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async uploadMultipleFiles(files: File[], userId: string, uploadType: string) {
    try {
      const uploadPromises = files.map(file =>
        this.uploadFile({ file, userId, uploadType })
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

  async deleteFile(fileId: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/uploads/${fileId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async getUserFiles(userId: string, uploadType?: string) {
    try {
      let url = `http://localhost:3000/api/uploads/${userId}`;
      if (uploadType) {
        url += `?uploadType=${uploadType}`;
      }

      const response = await fetch(url);
      return await response.json();
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
    const normalizedType = uploadConfigs[uploadType] ? uploadType : uploadType.replace('-', '_');
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
