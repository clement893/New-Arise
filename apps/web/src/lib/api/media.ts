/**
 * Media API
 * API client for media library endpoints
 */

import { apiClient } from './client';

export interface Media {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  storage_type: string;
  is_public: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadOptions {
  folder?: string;
  is_public?: boolean;
}

/**
 * Media API client
 */
export const mediaAPI = {
  /**
   * Get list of media files with pagination
   */
  list: async (skip = 0, limit = 100, folder?: string): Promise<Media[]> => {
    const response = await apiClient.get<Media[]>('/v1/media', {
      params: { skip, limit, ...(folder && { folder }) },
    });
    
    // Handle both array and paginated response formats
    const data = (response as any).data || response;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'items' in data) {
      return (data as any).items;
    }
    return [];
  },

  /**
   * Get a media file by ID
   */
  get: async (mediaId: number): Promise<Media> => {
    const response = await apiClient.get<Media>(`/v1/media/${mediaId}`);
    const data = (response as any).data || response;
    if (!data) {
      throw new Error(`Media file not found: ${mediaId}`);
    }
    return data;
  },

  /**
   * Upload a media file
   */
  upload: async (file: File, options?: MediaUploadOptions): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params: Record<string, string> = {};
    if (options?.folder) {
      params.folder = options.folder;
    }
    if (options?.is_public !== undefined) {
      params.is_public = options.is_public.toString();
    }
    
    const response = await apiClient.post<Media>('/v1/media', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = (response as any).data || response;
    if (!result) {
      throw new Error('Failed to upload media file: no data returned');
    }
    return result;
  },

  /**
   * Delete a media file
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/media/${id}`);
  },
};
