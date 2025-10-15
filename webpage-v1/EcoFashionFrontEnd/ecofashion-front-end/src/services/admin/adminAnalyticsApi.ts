import { apiClient } from '../api/baseApi';

export interface AdminRevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface AdminRevenueAnalytics {
  revenuePoints: AdminRevenuePoint[];
  totalRevenue: number;
  totalOrders: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface AdminRevenueRequest {
  period?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export interface UserRegistrationPoint {
  month: string;
  userCount: number;
}

export interface UserRegistrationAnalytics {
  registrationPoints: UserRegistrationPoint[];
  totalUsers: number;
  startDate: string;
  endDate: string;
}

export interface UserRegistrationRequest {
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDesigns: number;
  totalMaterials: number;
  totalRevenue: number;
}

export const adminAnalyticsApi = {
  getRevenueAnalytics: async (params: AdminRevenueRequest): Promise<AdminRevenueAnalytics> => {
    const response = await apiClient.get('/admin/AdminAnalytics/revenue', { params });
    return response.data.result;
  },

  getUserRegistrationAnalytics: async (params: UserRegistrationRequest): Promise<UserRegistrationAnalytics> => {
    const response = await apiClient.get('/admin/AdminAnalytics/user-registrations', { params });
    return response.data.result;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/AdminAnalytics/dashboard-stats');
    return response.data.result;
  }
};
