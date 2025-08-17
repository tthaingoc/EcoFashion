import apiClient, { handleApiResponse } from './baseApi';
import type {
  ProductSummaryDto,
  ProductTransactionDto,
  LowStockProductDto,
  ProductActivityDto,
  ProductInventoryFilters
} from '../../types/product.types';

class ProductInventoryService {
  private readonly BASE = '/api/ProductInventory'; // This endpoint needs to be implemented in backend

  async getSummary(filters?: ProductInventoryFilters): Promise<ProductSummaryDto> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);

      const response = await apiClient.get<any>(`${this.BASE}/summary?${params}`);
      return handleApiResponse<ProductSummaryDto>(response);
    } catch (error) {
      console.error('Error fetching product summary:', error);
      // Return default values if API is not implemented yet
      return {
        totalProducts: 0,
        totalCompleted: 0,
        totalProducing: 0,
        totalInventoryValue: 0
      };
    }
  }

  async getTransactions(filters?: ProductInventoryFilters): Promise<ProductTransactionDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append('productId', String(filters.productId));
      if (filters?.warehouseId) params.append('warehouseId', String(filters.warehouseId));
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.transactionType) params.append('transactionType', filters.transactionType);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);

      const response = await apiClient.get<any>(`${this.BASE}/transactions?${params}`);
      const data = handleApiResponse<any[]>(response);
      
      return data.map(tx => ({
        transactionId: tx.transactionId,
        productId: tx.productId,
        warehouseId: tx.warehouseId,
        transactionType: tx.transactionType,
        quantityChange: tx.quantityChange,
        beforeQty: tx.beforeQty,
        afterQty: tx.afterQty,
        orderId: tx.orderId,
        note: tx.note,
        createdByUserId: tx.createdByUserId,
        createdAt: tx.createdAt,
        productName: tx.productName,
        warehouseName: tx.warehouseName,
        imageUrl: tx.imageUrl
      }));
    } catch (error) {
      console.error('Error fetching product transactions:', error);
      return [];
    }
  }

  async getLowStock(filters?: ProductInventoryFilters): Promise<LowStockProductDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await apiClient.get<any>(`${this.BASE}/low-stock?${params}`);
      const data = handleApiResponse<any[]>(response);
      
      return data.map(item => ({
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantityOnHand: item.quantityOnHand,
        minThreshold: item.minThreshold,
        difference: item.difference,
        estimatedValue: item.estimatedValue,
        lastUpdated: item.lastUpdated,
        productName: item.productName,
        warehouseName: item.warehouseName
      }));
    } catch (error) {
      console.error('Error fetching product low stock:', error);
      return [];
    }
  }

  async getActivity(filters?: ProductInventoryFilters): Promise<ProductActivityDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);

      const response = await apiClient.get<any>(`${this.BASE}/activity?${params}`);
      const data = handleApiResponse<any[]>(response);
      
      return data.map(activity => ({
        date: activity.date,
        completed: activity.completed,
        inProduction: activity.inProduction,
        productName: activity.productName
      }));
    } catch (error) {
      console.error('Error fetching product activity:', error);
      return [];
    }
  }

  async createTransaction(request: {
    productId: number;
    warehouseId: number;
    transactionType: string;
    quantityChange: number;
    note?: string;
    orderId?: number;
  }): Promise<boolean> {
    try {
      const response = await apiClient.post<any>(`${this.BASE}/transactions`, request);
      return handleApiResponse<boolean>(response);
    } catch (error) {
      console.error('Error creating product transaction:', error);
      return false;
    }
  }

  async updateStock(request: {
    productId: number;
    warehouseId: number;
    quantityAvailable: number;
    note?: string;
  }): Promise<boolean> {
    try {
      const response = await apiClient.put<any>(`${this.BASE}/stock`, request);
      return handleApiResponse<boolean>(response);
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }
}

export const productInventoryService = new ProductInventoryService();
export default productInventoryService;
