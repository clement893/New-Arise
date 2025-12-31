'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getStoredToken, 
  getStoredUser, 
  logout as logoutUser,
  getCurrentUser 
} from '@/lib/api/auth';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await getCurrentUser(token);
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear storage
          logoutUser();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    const token = getStoredToken();
    if (token) {
      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
