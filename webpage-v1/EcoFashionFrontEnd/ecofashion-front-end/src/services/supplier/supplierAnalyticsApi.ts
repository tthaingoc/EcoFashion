import { apiClient } from '../api/baseApi';

export interface SupplierRevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface SupplierRevenueAnalytics {
  revenuePoints: SupplierRevenuePoint[];
  totalRevenue: number;
  totalOrders: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface SupplierRevenueRequest {
  period?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export const supplierAnalyticsApi = {
  getRevenueAnalytics: async (params: SupplierRevenueRequest): Promise<SupplierRevenueAnalytics> => {
    const response = await apiClient.get('/supplier/revenue-analytics', { params });
    return response.data.result;
  }
};