import apiClient, { handleApiResponse } from './baseApi';
import type {
  DesignerMaterialSummaryDto,
  DesignerMaterialTransactionDto,
  MaterialUsageDto,
  DesignerMaterialFilters
} from '../../types/designer.types';

class DesignerMaterialInventoryService {
  private readonly BASE = '/api/DesignerMaterialInventories';

  async getSummary(filters?: DesignerMaterialFilters): Promise<DesignerMaterialSummaryDto> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);

      // Use existing endpoint and calculate summary
      const response = await apiClient.get<any>(`${this.BASE}?${params}`);
      const data = handleApiResponse<any>(response);
      const items = Array.isArray(data) ? data : data.result || data.data || [];
      
      return {
        totalPurchased: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
        totalUsing: items.filter((item: any) => item.status === 'in_use').length,
        totalCost: items.reduce((sum: number, item: any) => sum + item.cost, 0),
        efficiency: this.calculateEfficiency(items)
      };
    } catch (error) {
      console.error('Error fetching designer material summary:', error);
      return {
        totalPurchased: 0,
        totalUsing: 0,
        totalCost: 0,
        efficiency: 0
      };
    }
  }

  async getTransactions(filters?: DesignerMaterialFilters): Promise<DesignerMaterialTransactionDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);
      if (filters?.materialId) params.append('materialId', String(filters.materialId));
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);

      // Transform inventory data to transaction format
      const response = await apiClient.get<any>(`${this.BASE}?${params}`);
      const data = handleApiResponse<any>(response);
      const items = Array.isArray(data) ? data : data.result || data.data || [];
      
      return items.map((item: any) => ({
        purchaseId: item.inventoryId,
        designerId: item.designer?.designerId || '',
        materialId: item.materialId,
        supplierId: item.material?.supplierId || '',
        quantity: item.quantity || 0,
        unitPrice: item.cost / (item.quantity || 1),
        totalCost: item.cost,
        purchaseDate: item.lastBuyDate,
        status: item.status,
        materialName: item.material?.materialName,
        supplierName: item.designer?.fullName
      }));
    } catch (error) {
      console.error('Error fetching designer material transactions:', error);
      return [];
    }
  }

  async getUsageAnalytics(filters?: DesignerMaterialFilters): Promise<MaterialUsageDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.designerId) params.append('designerId', filters.designerId);

      const response = await apiClient.get<any>(`${this.BASE}?${params}`);
      const data = handleApiResponse<any>(response);
      const items = Array.isArray(data) ? data : data.result || data.data || [];
      
      // Group by material and calculate usage analytics
      const materialGroups = items.reduce((acc: Record<string, any[]>, item: any) => {
        const materialId = item.materialId;
        if (!acc[materialId]) {
          acc[materialId] = [];
        }
        acc[materialId].push(item);
        return acc;
      }, {});

      return Object.entries(materialGroups).map(([materialId, materialItems]) => {
        const firstItem = materialItems[0];
        const totalPurchased = materialItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalUsed = materialItems.filter(item => item.status === 'used').reduce((sum, item) => sum + (item.quantity || 0), 0);
        const averagePrice = materialItems.reduce((sum, item) => sum + item.cost, 0) / materialItems.length;
        const lastPurchaseDate = materialItems.reduce((latest, item) => {
          return new Date(item.lastBuyDate) > new Date(latest) ? item.lastBuyDate : latest;
        }, materialItems[0].lastBuyDate);

        return {
          materialId: parseInt(materialId),
          materialName: firstItem.material?.materialName || 'Unknown Material',
          totalPurchased,
          totalUsed,
          remainingQuantity: totalPurchased - totalUsed,
          averagePrice,
          lastPurchaseDate,
          usageEfficiency: totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0
        };
      });
    } catch (error) {
      console.error('Error fetching designer material usage analytics:', error);
      return [];
    }
  }

  async getAllInventories(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(this.BASE);
      const data = handleApiResponse<any>(response);
      return Array.isArray(data) ? data : data.result || data.data || [];
    } catch (error) {
      console.error('Error fetching all designer material inventories:', error);
      return [];
    }
  }

  async getInventoryById(id: number): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${this.BASE}/${id}`);
      return handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error fetching designer material inventory by id:', error);
      return null;
    }
  }

  async getInventoryByDesignerId(designerId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(`${this.BASE}/GetStoredMaterial/${designerId}`);
      const data = handleApiResponse<any>(response);
      return Array.isArray(data) ? data : data.result || data.data || [];
    } catch (error) {
      console.error('Error fetching designer material inventory by designer id:', error);
      return [];
    }
  }

  async createInventory(request: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(this.BASE, request);
      return handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error creating designer material inventory:', error);
      throw error;
    }
  }

  async updateInventory(id: number, request: any): Promise<any> {
    try {
      const response = await apiClient.put<any>(`${this.BASE}/${id}`, request);
      return handleApiResponse<any>(response);
    } catch (error) {
      console.error('Error updating designer material inventory:', error);
      throw error;
    }
  }

  async deleteInventory(id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`${this.BASE}/${id}`);
      const result = handleApiResponse<any>(response);
      return result === true || result?.success === true;
    } catch (error) {
      console.error('Error deleting designer material inventory:', error);
      return false;
    }
  }

  private calculateEfficiency(items: any[]): number {
    if (items.length === 0) return 0;
    
    const totalItems = items.length;
    const usedItems = items.filter(item => item.status === 'used' || item.status === 'in_use').length;
    
    return totalItems > 0 ? (usedItems / totalItems) * 100 : 0;
  }
}

export const designerMaterialInventoryService = new DesignerMaterialInventoryService();
export default designerMaterialInventoryService;