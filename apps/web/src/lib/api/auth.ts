import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Extract error message from API error response
 * Handles various error response formats (string, array, object)
 */
function extractErrorMessage(errorData: any, defaultMessage: string): string {
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }
  
  if (Array.isArray(errorData.detail)) {
    // Handle validation errors array (e.g., FastAPI validation errors)
    return errorData.detail
      .map((err: any) => {
        if (typeof err === 'string') return err;
        if (err?.msg) return err.msg;
        if (err?.loc && err?.msg) {
          return `${err.loc.join('.')}: ${err.msg}`;
        }
        return JSON.stringify(err);
      })
      .join(', ');
  }
  
  if (errorData.detail && typeof errorData.detail === 'object') {
    // Handle object error details
    return errorData.detail.message || errorData.detail.msg || JSON.stringify(errorData.detail);
  }
  
  if (errorData.message && typeof errorData.message === 'string') {
    return errorData.message;
  }
  
  return defaultMessage;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
  };
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<UserResponse> {
  try {
    const response = await axios.post<UserResponse>(
      `${API_URL}/api/v1/auth/register`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = extractErrorMessage(error.response.data, 'Registration failed');
      throw new Error(errorMessage);
    }
    throw new Error('Network error. Please try again.');
  }
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/api/v1/auth/login`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = extractErrorMessage(error.response.data, 'Login failed');
      throw new Error(errorMessage);
    }
    throw new Error('Network error. Please try again.');
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string): Promise<UserResponse> {
  try {
    const response = await axios.get<UserResponse>(
      `${API_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Failed to get user');
    }
    throw new Error('Network error. Please try again.');
  }
}

/**
 * Logout user (client-side only, clears token)
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
}

/**
 * Save auth data to localStorage
 */
export function saveAuthData(authResponse: AuthResponse): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', authResponse.access_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }
}

/**
 * Get stored auth token
 */
export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Get stored user data
 */
export function getStoredUser(): UserResponse | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
