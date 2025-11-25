import { apiService } from './api';
import { supabase } from '../integrations/supabase/client';

export interface UploadOptions {
  file: File;
  userId: string;
  uploadType: 'profile_picture' | 'project_file' | 'product_image' | 'portfolio_image';
}

export const fileUploadService = {
  async uploadFile(options: UploadOptions) {
    try {
      const { file, userId, uploadType } = options;

      if (!file) {
        throw new Error('No file provided');
      }

      this.validateFile(file, uploadType);

      return apiService.uploadFile(file, userId, uploadType);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async uploadMultipleFiles(files: File[], userId: string, uploadType: 'product_image' | 'portfolio_image') {
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
    const maxSizes: Record<string, number> = {
      profile_picture: 5 * 1024 * 1024,
      project_file: 50 * 1024 * 1024,
      product_image: 10 * 1024 * 1024,
      portfolio_image: 10 * 1024 * 1024
    };

    const allowedTypes: Record<string, string[]> = {
      profile_picture: ['image/jpeg', 'image/png', 'image/gif'],
      project_file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      product_image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      portfolio_image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    };

    const maxSize = maxSizes[uploadType];
    const allowed = allowedTypes[uploadType];

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowed.includes(file.type)) {
      throw new Error(`File type not allowed. Accepted types: ${allowed.join(', ')}`);
    }

    return true;
  }
};
