import type { User, SupplierData } from '../services/api/authService';

// Extended interface for Supplier with additional data
export interface SupplierUser extends User {
  supplierId?: string;
  supplierName?: string;
  supplierAvatarUrl?: string; // Avatar from Supplier table
  bio?: string;
  specializationUrl?: string;
  portfolioUrl?: string;
  bannerUrl?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * Get user data from localStorage
 * @returns User object or null if not found/invalid
 */
export const getUserFromStorage = (): User | null => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const userData: User = JSON.parse(userInfo);
      return userData;
    }
  } catch (error) {
    console.error('Error loading user data from localStorage:', error);
  }
  return null;
};

/**
 * Get supplier data from localStorage (if user is supplier)
 * @returns SupplierData object or null if not found/invalid
 */
export const getSupplierFromStorage = (): SupplierData | null => {
  try {
    const supplierInfo = localStorage.getItem('supplierInfo');
    if (supplierInfo) {
      const supplierData: SupplierData = JSON.parse(supplierInfo);
      return supplierData;
    }
  } catch (error) {
    console.error('Error loading supplier data from localStorage:', error);
  }
  return null;
};

/**
 * Get the correct avatar URL for a user
 * For suppliers, use supplierAvatarUrl if available, otherwise fallback to user avatarUrl
 * @param user User object
 * @returns Avatar URL or null
 */
export const getUserAvatarUrl = (user: User | null): string | null => {
  if (!user) return null;
  
  // If user is supplier, try to get supplier avatar
  if (user.role === 'supplier') {
    const supplierData = getSupplierFromStorage();
    if (supplierData?.avatarUrl) {
      return supplierData.avatarUrl;
    }
  }
  
  // Fallback to user avatarUrl
  return user.avatarUrl || null;
};

/**
 * Get user initials from full name
 * @param fullName User's full name
 * @param fallback Fallback text if no name provided
 * @returns User initials (max 2 characters)
 */
export const getUserInitials = (fullName?: string, fallback: string = 'U'): string => {
  if (!fullName) return fallback;
  return fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if user is authenticated
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem('authToken');
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token || !tokenExpiresAt) return false;
    
    const expirationTime = new Date(tokenExpiresAt).getTime();
    const currentTime = Date.now();
    
    return currentTime < expirationTime;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get role display name
 * @param role User role from API
 * @returns Formatted role name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Admin',
    'supplier': 'Supplier',
    'customer': 'Customer',
    'designer': 'Designer'
  };
  
  return roleMap[role.toLowerCase()] || role;
};

/**
 * Check if user has specific role
 * @param user User object
 * @param role Role to check
 * @returns boolean
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  return user.role.toLowerCase() === role.toLowerCase();
};

/**
 * Check if user is admin
 * @param user User object
 * @returns boolean
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is supplier
 * @param user User object
 * @returns boolean
 */
export const isSupplier = (user: User | null): boolean => {
  return hasRole(user, 'supplier');
};

/**
 * Check if user is customer
 * @param user User object
 * @returns boolean
 */
export const isCustomer = (user: User | null): boolean => {
  return hasRole(user, 'customer');
};

/**
 * Check if user is designer
 * @param user User object
 * @returns boolean
 */
export const isDesigner = (user: User | null): boolean => {
  return hasRole(user, 'designer');
}; 