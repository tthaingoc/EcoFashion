import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthService } from "../api/authService";
import type { AuthResponse, User, SignupResponse } from "../api/authService";

const isTokenExpired = (expiresAt: string): boolean => {
  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    return currentTime >= expirationTime;
  } catch (error) {
    return true;
  }
};

interface AuthContextType {
  user: User | null;
  createUser: (
    email: string,
    password: string,
    fullname: string,
    username: string,
    phone?: string
  ) => Promise<SignupResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  // Token utilities
  isTokenValid: () => boolean;
  refreshUserFromStorage: () => void;
  refreshUserFromServer: () => Promise<void>;
}

const UserContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
        const userInfo = localStorage.getItem("userInfo");

        if (
          token &&
          tokenExpiresAt &&
          userInfo &&
          !isTokenExpired(tokenExpiresAt)
        ) {
          // Parse user info from localStorage
          const userData: User = JSON.parse(userInfo);
          setUser(userData);
        } else {
          // Token expired or invalid, clear storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("tokenExpiresAt");
          localStorage.removeItem("userInfo");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear on error
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("userInfo");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Create new user account
  const createUser = async (
    email: string,
    password: string,
    fullname: string,
    username: string,
    phone?: string
  ): Promise<SignupResponse> => {
    try {
      const response = await AuthService.signup(
        email,
        password,
        fullname,
        username,
        phone
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  // Sign in user
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await AuthService.login(email, password);

      // AuthService already handles token storage, just update our state
      setUser(response.user);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      // Clear local state first
      setUser(null);

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("userInfo");

      // Optional: Call logout API if available
      try {
        await AuthService.logout();
      } catch (error) {
        // Logout API might not exist or fail, but local logout should still work
        console.warn("Logout API call failed:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  };

  // Check if token is still valid
  const isTokenValid = (): boolean => {
    const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
    if (!tokenExpiresAt) return false;
    return !isTokenExpired(tokenExpiresAt);
  };

  // Refresh user from localStorage
  const refreshUserFromStorage = () => {
    const token = localStorage.getItem("authToken");
    const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
    const userInfo = localStorage.getItem("userInfo");

    if (
      token &&
      tokenExpiresAt &&
      userInfo &&
      !isTokenExpired(tokenExpiresAt)
    ) {
      try {
        const userData: User = JSON.parse(userInfo);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user info:", error);
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("userInfo");
      }
    } else {
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("userInfo");
    }
  };

  // Refresh user from server
  const refreshUserFromServer = async (): Promise<void> => {
    try {
      if (!isTokenValid()) {
        console.warn("Token is invalid, skipping refresh");
        return;
      }

      console.log("🔄 Refreshing user from server...");
      const freshUser = await AuthService.refreshUserProfile();
      console.log("✅ User refreshed successfully:", freshUser);
      setUser(freshUser);
    } catch (error: any) {
      console.error("❌ Error refreshing user from server:", error);
      
      // Only logout on 401 (unauthorized), not on other errors
      if (error.message?.includes('401') || error.status === 401) {
        console.warn("Token expired or unauthorized, logging out");
        await logout();
      } else {
        // For other errors (404, 500, etc.), just log but don't logout
        console.warn("Refresh failed but keeping user logged in:", error.message);
      }
    }
  };

  const value: AuthContextType = {
    user,
    createUser,
    signIn,
    logout,
    loading,
    isTokenValid,
    refreshUserFromStorage,
    refreshUserFromServer,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
