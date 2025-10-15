import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isTokenExpired = (expiresAt: string): boolean => {
  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    return currentTime >= expirationTime;
  } catch (error) {
    return true;
  }
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    try {
      const token = localStorage.getItem('authToken');
      const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
      const userInfo = localStorage.getItem('userInfo');

      if (
        token &&
        tokenExpiresAt &&
        userInfo &&
        !isTokenExpired(tokenExpiresAt)
      ) {
        const userData: User = JSON.parse(userInfo);
        setUser(userData);
      } else {
        // Token expired or invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Clear on error
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userInfo');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const isAuthenticated = !!user && !!localStorage.getItem('authToken');

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    setUser,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
