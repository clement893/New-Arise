/**
 * Pages API
 * API client for content pages endpoints
 */

import { apiClient } from './client';

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface PageCreate {
  slug: string;
  title: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface PageUpdate {
  slug?: string;
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface PageListResponse {
  items: Page[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Pages API client
 */
export const pagesAPI = {
  /**
   * Get list of pages with pagination
   */
  list: async (skip = 0, limit = 100): Promise<Page[]> => {
    const response = await apiClient.get<Page[] | PageListResponse>('/v1/pages', {
      params: { skip, limit },
    });
    
    // Handle both array and paginated response formats
    const data = (response as any).data || response;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'items' in data) {
      return (data as PageListResponse).items;
    }
    return [];
  },

  /**
   * Get a page by slug
   */
  get: async (slug: string): Promise<Page> => {
    const response = await apiClient.get<Page>(`/v1/pages/${slug}`);
    const data = (response as any).data || response;
    if (!data) {
      throw new Error(`Page not found: ${slug}`);
    }
    return data;
  },

  /**
   * Create a new page
   */
  create: async (data: PageCreate): Promise<Page> => {
    const response = await apiClient.post<Page>('/v1/pages', data);
    const result = (response as any).data || response;
    if (!result) {
      throw new Error('Failed to create page: no data returned');
    }
    return result;
  },

  /**
   * Update an existing page
   */
  update: async (id: number, data: PageUpdate): Promise<Page> => {
    const response = await apiClient.put<Page>(`/v1/pages/${id}`, data);
    const result = (response as any).data || response;
    if (!result) {
      throw new Error('Failed to update page: no data returned');
    }
    return result;
  },

  /**
   * Delete a page
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/pages/${id}`);
  },
};

