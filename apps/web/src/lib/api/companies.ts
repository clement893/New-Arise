/**
 * Companies API
 * API client for companies/enterprises endpoints
 */

import { apiClient } from './client';
import { extractApiData } from './utils';

export interface Company {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  logo_filename?: string | null;
  industry?: string | null;
  size?: string | null;
  city?: string | null;
  country?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  logo_filename?: string | null;
  industry?: string | null;
  size?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {}

/**
 * Companies API client
 */
export const companiesAPI = {
  /**
   * Get list of companies with pagination
   */
  list: async (skip = 0, limit = 100): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/v1/reseau/companies', {
      params: { skip, limit },
    });
    
    const data = extractApiData<Company[] | { items: Company[] }>(response);
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'items' in data) {
      return (data as { items: Company[] }).items;
    }
    return [];
  },

  /**
   * Get a company by ID
   */
  get: async (companyId: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/v1/reseau/companies/${companyId}`);
    const data = extractApiData<Company>(response);
    if (!data) {
      throw new Error(`Company not found: ${companyId}`);
    }
    return data;
  },

  /**
   * Create a new company
   */
  create: async (company: CompanyCreate): Promise<Company> => {
    const response = await apiClient.post<Company>('/v1/reseau/companies', company);
    const data = extractApiData<Company>(response);
    if (!data) {
      throw new Error('Failed to create company: no data returned');
    }
    return data;
  },

  /**
   * Update a company
   */
  update: async (companyId: number, company: CompanyUpdate): Promise<Company> => {
    const response = await apiClient.put<Company>(`/v1/reseau/companies/${companyId}`, company);
    const data = extractApiData<Company>(response);
    if (!data) {
      throw new Error('Failed to update company: no data returned');
    }
    return data;
  },

  /**
   * Delete a company
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/reseau/companies/${id}`);
  },
};
