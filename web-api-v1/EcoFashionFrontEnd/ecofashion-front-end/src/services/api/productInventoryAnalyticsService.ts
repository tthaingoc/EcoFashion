import apiClient, { handleApiResponse } from './baseApi';

export type ProductSummaryDto = {
  totalProducts: number;
  totalCompleted: number;
  totalInProduction: number;
  totalInventoryValue: number;
  lowStockCount: number;
};

export type ProductLowStockItemDto = {
  productId: number;
  productName?: string | null;
  sku?: string | null;
  warehouseId: number;
  warehouseName?: string | null;
  quantityAvailable: number;
  minThreshold: number;
  difference: number;
  estimatedValue: number;
  lastUpdated: string;
  designName?: string | null;
  sizeName?: string | null;
  colorCode?: string | null;
};

export type ProductActivityPointDto = {
  date: string;
  produced: number;
  sold: number;
  designName?: string | null;
};

export type ProductTransactionDto = {
  transactionId: number;
  productId: number;
  warehouseId: number;
  transactionType: string;
  quantityChanged: number;
  transactionDate: string;
  notes?: string | null;
  productName?: string | null;
  sku?: string | null;
  warehouseName?: string | null;
  designName?: string | null;
  sizeName?: string | null;
  colorCode?: string | null;
};

class ProductInventoryAnalyticsService {
  private readonly base = 'analytics/product-inventory';

  async getSummary(params: { from?: string; to?: string; designerId?: string; }): Promise<ProductSummaryDto> {
    const resp = await apiClient.get(`${this.base}/summary`, { params });
    return handleApiResponse<ProductSummaryDto>(resp as any);
  }

  async getLowStock(params: { limit?: number; designerId?: string; }): Promise<ProductLowStockItemDto[]> {
    const resp = await apiClient.get(`${this.base}/low-stock`, { params });
    return handleApiResponse<ProductLowStockItemDto[]>(resp as any);
  }

  async getTransactions(params: { from?: string; to?: string; designerId?: string; productId?: number; limit?: number; }): Promise<ProductTransactionDto[]> {
    const resp = await apiClient.get(`${this.base}/transactions`, { params });
    return handleApiResponse<ProductTransactionDto[]>(resp as any);
  }

  async getProductionActivity(params: { from: string; to: string; designerId?: string; }): Promise<ProductActivityPointDto[]> {
    const resp = await apiClient.get(`${this.base}/production-activity`, { params });
    return handleApiResponse<ProductActivityPointDto[]>(resp as any);
  }

  async getDesignPopularity(params: { from: string; to: string; }): Promise<ProductActivityPointDto[]> {
    const resp = await apiClient.get(`${this.base}/design-popularity`, { params });
    return handleApiResponse<ProductActivityPointDto[]>(resp as any);
  }
}

export const productInventoryAnalyticsService = new ProductInventoryAnalyticsService();
export default productInventoryAnalyticsService;