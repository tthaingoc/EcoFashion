import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../services/api/authService';
import type { User, SupplierData, AuthResponse, SignupResponse } from '../services/api/authService';
import { getUserAvatarUrl, getUserInitials, hasRole, isAdmin, isSupplier, isCustomer, isDesigner } from '../utils/userUtils';

interface AuthState {
  // State
  user: User | null;
  supplierData: SupplierData | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSupplierData: (data: SupplierData | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Auth methods
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, fullname: string, username: string, phone?: string) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // User utilities
  getAvatarUrl: () => string | null;
  getInitials: (fallback?: string) => string;
  getDisplayName: () => string;
  
  // Role checks
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isSupplier: () => boolean;
  isCustomer: () => boolean;
  isDesigner: () => boolean;
  
  // Token utilities
  isTokenValid: () => boolean;
}

const isTokenExpired = (expiresAt: string): boolean => {
  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    return currentTime >= expirationTime;
  } catch (error) {
    return true;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      supplierData: null,
      loading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSupplierData: (supplierData) => set({ supplierData }),
      setLoading: (loading) => set({ loading }),

      // Auth methods
      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await AuthService.login(email, password);
          
          // AuthService already handles localStorage
          set({ 
            user: response.user, 
            isAuthenticated: true,
            loading: false 
          });

          // Load supplier data if user is supplier
          if (response.user.role === 'supplier') {
            const supplierInfo = localStorage.getItem("supplierInfo");
            if (supplierInfo) {
              try {
                const supplierData: SupplierData = JSON.parse(supplierInfo);
                set({ supplierData });
              } catch (error) {
                console.error("Error parsing supplier data:", error);
              }
            }
          }

          return response;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, fullname: string, username: string, phone?: string) => {
        set({ loading: true });
        try {
          const response = await AuthService.signup(email, password, fullname, username, phone);
          set({ loading: false });
          return response;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await AuthService.logout();
          set({ 
            user: null, 
            supplierData: null, 
            isAuthenticated: false,
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const freshUser = await AuthService.refreshUserProfile();
          set({ user: freshUser });

          // Refresh supplier data if needed
          if (freshUser.role === 'supplier') {
            try {
              await AuthService.fetchAndStoreSupplierData(freshUser.userId);
              const supplierInfo = localStorage.getItem("supplierInfo");
              if (supplierInfo) {
                const supplierData: SupplierData = JSON.parse(supplierInfo);
                set({ supplierData });
              }
            } catch (error) {
              console.error("Error refreshing supplier data:", error);
            }
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
          // Don't logout on refresh error, just log it
        }
      },

      // User utilities
      getAvatarUrl: () => {
        const { user } = get();
        return getUserAvatarUrl(user);
      },

      getInitials: (fallback: string = 'U') => {
        const { user, supplierData } = get();
        const displayName = supplierData?.supplierName || user?.fullName;
        return getUserInitials(displayName, fallback);
      },

      getDisplayName: () => {
        const { user, supplierData } = get();
        return supplierData?.supplierName || user?.fullName || user?.email || 'User';
      },

      // Role checks
      hasRole: (role: string) => {
        const { user } = get();
        return hasRole(user, role);
      },

      isAdmin: () => {
        const { user } = get();
        return isAdmin(user);
      },

      isSupplier: () => {
        const { user } = get();
        return isSupplier(user);
      },

      isCustomer: () => {
        const { user } = get();
        return isCustomer(user);
      },

      isDesigner: () => {
        const { user } = get();
        return isDesigner(user);
      },

      // Token utilities
      isTokenValid: () => {
        const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
        if (!tokenExpiresAt) return false;
        return !isTokenExpired(tokenExpiresAt);
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user and supplier data, not loading states
        user: state.user,
        supplierData: state.supplierData,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after hydration is finished
        if (state) {
          // Check if token is still valid
          const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
          if (!tokenExpiresAt || isTokenExpired(tokenExpiresAt)) {
            // Token expired, clear state
            state.user = null;
            state.supplierData = null;
            state.isAuthenticated = false;
          } else {
            // Token is valid, load user from localStorage
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
              try {
                const user: User = JSON.parse(userInfo);
                state.user = user;
                state.isAuthenticated = true;
                
                // Load supplier data if user is supplier
                if (user.role === 'supplier') {
                  const supplierInfo = localStorage.getItem("supplierInfo");
                  if (supplierInfo) {
                    try {
                      const supplierData: SupplierData = JSON.parse(supplierInfo);
                      state.supplierData = supplierData;
                    } catch (error) {
                      console.error("Error parsing supplier data on rehydration:", error);
                    }
                  }
                }
              } catch (error) {
                console.error("Error parsing user info on rehydration:", error);
                // Clear invalid data
                state.user = null;
                state.supplierData = null;
                state.isAuthenticated = false;
              }
            }
          }
        }
      },
    }
  )
); 