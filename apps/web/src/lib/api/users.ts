/**
 * Users API
 * API client for user management endpoints
 */

import { apiClient } from './client';
import { extractApiData } from './utils';

export interface User {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
  user_type?: string;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

/**
 * Users API client
 */
export const usersAPI = {
  /**
   * List all users with pagination
   */
  list: async (page = 1, pageSize = 50, search?: string, isActive?: boolean): Promise<UserListResponse> => {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    };
    
    if (search) {
      params.search = search;
    }
    
    if (isActive !== undefined) {
      params.is_active = isActive;
    }
    
    const response = await apiClient.get<UserListResponse | { items: User[]; total: number; page: number; page_size: number }>('/v1/users/', {
      params,
    });
    
    const data = extractApiData<UserListResponse | { items: User[]; total: number; page: number; page_size: number }>(response);
    
    if (data && typeof data === 'object') {
      if ('items' in data && 'total' in data) {
        return {
          items: (data as UserListResponse).items || [],
          total: (data as UserListResponse).total || 0,
          page: (data as UserListResponse).page || page,
          page_size: (data as UserListResponse).page_size || pageSize,
        };
      }
    }
    
    return {
      items: [],
      total: 0,
      page,
      page_size: pageSize,
    };
  },

  /**
   * Get a user by ID
   */
  get: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/v1/users/${userId}`);
    const data = extractApiData<User>(response);
    if (!data) {
      throw new Error(`User not found: ${userId}`);
    }
    return data;
  },

  /**
   * Update a user (superadmin only)
   */
  update: async (userId: number, data: UserUpdate): Promise<User> => {
    const response = await apiClient.put<User>(`/v1/users/${userId}`, data);
    const updatedUser = extractApiData<User>(response);
    if (!updatedUser) {
      throw new Error(`Failed to update user: ${userId}`);
    }
    return updatedUser;
  },

  /**
   * Delete a user (admin only)
   */
  delete: async (userId: number): Promise<void> => {
    await apiClient.delete(`/v1/users/${userId}`);
  },
};

export default usersAPI;