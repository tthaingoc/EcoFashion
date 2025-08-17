import apiClient, { handleApiResponse } from './baseApi';
import type { 
  WarehouseType, 
  UnifiedInventoryData, 
  InventorySummaryDto, 
  UnifiedTransactionDto, 
  LowStockItemDto, 
  ActivityDataDto,
  DateRange 
} from '../../types/inventory.types';

class UnifiedInventoryService {
  private readonly BASE = '/api';

  async getSummary(warehouseType: WarehouseType, dateRange: DateRange): Promise<InventorySummaryDto> {
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);

      let endpoint = '';
      switch (warehouseType) {
        case 'material':
          endpoint = `${this.BASE}/analytics/inventory/summary`;
          break;
        case 'product':
          // Will need to be implemented in backend
          endpoint = `${this.BASE}/analytics/product-inventory/summary`;
          break;
        case 'designer-material':
          // Will use existing designer material API
          endpoint = `${this.BASE}/DesignerMaterialInventories`;
          break;
        case 'all':
          // Aggregate all types
          const [materialSummary, designerSummary] = await Promise.all([
            this.getMaterialSummary(dateRange),
            this.getDesignerMaterialSummary()
          ]);
          return this.aggregateSummaries(materialSummary, designerSummary);
        default:
          endpoint = `${this.BASE}/analytics/inventory/summary`;
      }

      const response = await apiClient.get<any>(`${endpoint}?${params}`);
      return handleApiResponse<InventorySummaryDto>(response);
    } catch (error) {
      console.error('Error fetching summary:', error);
      return {
        totalDistinctMaterials: 0,
        totalOnHand: 0,
        totalInventoryValue: 0,
        lowStockCount: 0,
        stockoutCount: 0
      };
    }
  }

  async getTransactions(warehouseType: WarehouseType, dateRange: DateRange, filters?: any): Promise<UnifiedTransactionDto[]> {
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);
      if (filters?.materialId) params.append('materialId', String(filters.materialId));
      if (filters?.warehouseId) params.append('warehouseId', String(filters.warehouseId));
      if (filters?.type) params.append('type', filters.type);

      let transactions: UnifiedTransactionDto[] = [];

      switch (warehouseType) {
        case 'material':
          transactions = await this.getMaterialTransactions(params);
          break;
        case 'product':
          transactions = await this.getProductTransactions(params);
          break;
        case 'designer-material':
          transactions = await this.getDesignerMaterialTransactions(params);
          break;
        case 'all':
          const [materialTx, designerTx] = await Promise.all([
            this.getMaterialTransactions(params),
            this.getDesignerMaterialTransactions(params)
          ]);
          transactions = [...materialTx, ...designerTx].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getLowStockItems(warehouseType: WarehouseType, limit: number = 20): Promise<LowStockItemDto[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', String(limit));

      let items: LowStockItemDto[] = [];

      switch (warehouseType) {
        case 'material':
          items = await this.getMaterialLowStock(params);
          break;
        case 'product':
          items = await this.getProductLowStock(params);
          break;
        case 'designer-material':
          items = await this.getDesignerMaterialLowStock(params);
          break;
        case 'all':
          const [materialItems, designerItems] = await Promise.all([
            this.getMaterialLowStock(params),
            this.getDesignerMaterialLowStock(params)
          ]);
          items = [...materialItems, ...designerItems]
            .sort((a, b) => a.difference - b.difference)
            .slice(0, limit);
          break;
      }

      return items;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  async getActivityData(warehouseType: WarehouseType, dateRange: DateRange): Promise<ActivityDataDto[]> {
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);

      switch (warehouseType) {
        case 'material':
          return await this.getMaterialActivity(params);
        case 'product':
          return await this.getProductActivity(params);
        case 'designer-material':
          return await this.getDesignerMaterialActivity(params);
        case 'all':
          return await this.getAggregatedActivity(params);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      return [];
    }
  }

  private async getMaterialSummary(dateRange: DateRange): Promise<InventorySummaryDto> {
    const params = new URLSearchParams();
    if (dateRange.from) params.append('from', dateRange.from);
    if (dateRange.to) params.append('to', dateRange.to);

    const response = await apiClient.get<any>(`${this.BASE}/analytics/inventory/summary?${params}`);
    return handleApiResponse<InventorySummaryDto>(response);
  }

  private async getDesignerMaterialSummary(): Promise<InventorySummaryDto> {
    // This would need to be implemented in backend or calculated from existing data
    const response = await apiClient.get<any>(`${this.BASE}/DesignerMaterialInventories`);
    const data = handleApiResponse<any>(response);
    const items = Array.isArray(data) ? data : data.result || data.data || [];
    
    // Transform designer material data to summary format
    return {
      totalDistinctMaterials: items.length || 0,
      totalOnHand: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
      totalInventoryValue: items.reduce((sum: number, item: any) => sum + item.cost, 0),
      lowStockCount: items.filter((item: any) => item.status === 'out_of_stock').length,
      stockoutCount: items.filter((item: any) => item.quantity === 0).length
    };
  }

  private aggregateSummaries(material: InventorySummaryDto, designer: InventorySummaryDto): InventorySummaryDto {
    return {
      totalDistinctMaterials: material.totalDistinctMaterials + designer.totalDistinctMaterials,
      totalOnHand: material.totalOnHand + designer.totalOnHand,
      totalInventoryValue: material.totalInventoryValue + designer.totalInventoryValue,
      lowStockCount: material.lowStockCount + designer.lowStockCount,
      stockoutCount: material.stockoutCount + designer.stockoutCount
    };
  }

  private async getMaterialTransactions(params: URLSearchParams): Promise<UnifiedTransactionDto[]> {
    const response = await apiClient.get<any>(`${this.BASE}/Inventory/materials/transactions?${params}`);
    const data = handleApiResponse<any[]>(response);
    
    return data.map(tx => ({
      transactionId: tx.transactionId,
      itemId: tx.materialId,
      warehouseId: tx.warehouseId,
      transactionType: tx.transactionType,
      quantityChange: tx.quantityChange,
      beforeQty: tx.beforeQty,
      afterQty: tx.afterQty,
      unit: tx.unit,
      referenceType: tx.referenceType,
      referenceId: tx.referenceId,
      note: tx.note,
      createdByUserId: tx.createdByUserId,
      createdAt: tx.createdAt,
      itemName: tx.materialName,
      warehouseName: tx.warehouseName,
      supplierName: tx.supplierName,
      imageUrl: tx.imageUrl,
      warehouseType: tx.warehouseType,
      itemType: 'material' as const
    }));
  }

  private async getProductTransactions(params: URLSearchParams): Promise<UnifiedTransactionDto[]> {
    // This would need product inventory API - placeholder for now
    return [];
  }

  private async getDesignerMaterialTransactions(params: URLSearchParams): Promise<UnifiedTransactionDto[]> {
    // Transform designer material inventory to transaction format
    const response = await apiClient.get<any>(`${this.BASE}/DesignerMaterialInventories`);
    const data = handleApiResponse<any>(response);
    const items = Array.isArray(data) ? data : data.result || data.data || [];
    
    return items.map((item: any) => ({
      transactionId: item.inventoryId,
      itemId: item.materialId,
      warehouseId: 1, // Designer warehouse
      transactionType: 'Purchase',
      quantityChange: item.quantity || 0,
      beforeQty: 0,
      afterQty: item.quantity || 0,
      unit: 'pcs',
      referenceType: 'Purchase',
      referenceId: String(item.inventoryId),
      note: `Designer purchase - Status: ${item.status}`,
      createdByUserId: undefined,
      createdAt: item.lastBuyDate,
      itemName: item.material?.materialName,
      warehouseName: 'Designer Warehouse',
      supplierName: item.designer?.fullName,
      imageUrl: item.material?.imageUrl,
      warehouseType: 'designer',
      itemType: 'designer-material' as const
    }));
  }

  private async getMaterialLowStock(params: URLSearchParams): Promise<LowStockItemDto[]> {
    const response = await apiClient.get<any>(`${this.BASE}/analytics/inventory/low-stock?${params}`);
    const data = handleApiResponse<any[]>(response);
    
    return data.map(item => ({
      itemId: item.materialId,
      warehouseId: item.warehouseId,
      quantityOnHand: item.quantityOnHand,
      minThreshold: item.minThreshold,
      difference: item.difference,
      estimatedValue: item.estimatedValue,
      lastUpdated: item.lastUpdated,
      itemName: item.materialName,
      warehouseName: item.warehouseName,
      itemType: 'material' as const
    }));
  }

  private async getProductLowStock(params: URLSearchParams): Promise<LowStockItemDto[]> {
    // Placeholder for product low stock
    return [];
  }

  private async getDesignerMaterialLowStock(params: URLSearchParams): Promise<LowStockItemDto[]> {
    const response = await apiClient.get<any>(`${this.BASE}/DesignerMaterialInventories`);
    const data = handleApiResponse<any>(response);
    const items = Array.isArray(data) ? data : data.result || data.data || [];
    
    return items
      .filter((item: any) => item.status === 'out_of_stock' || (item.quantity || 0) < 10)
      .map((item: any) => ({
        itemId: item.materialId,
        warehouseId: 1,
        quantityOnHand: item.quantity || 0,
        minThreshold: 10, // Default threshold
        difference: (item.quantity || 0) - 10,
        estimatedValue: item.cost,
        lastUpdated: item.lastBuyDate,
        itemName: item.material?.materialName,
        warehouseName: 'Designer Warehouse',
        itemType: 'designer-material' as const
      }));
  }

  private async getMaterialActivity(params: URLSearchParams): Promise<ActivityDataDto[]> {
    const response = await apiClient.get<any>(`${this.BASE}/analytics/inventory/receipts-by-supplier?${params}`);
    const data = handleApiResponse<any[]>(response);
    
    return data.map(item => ({
      date: item.date,
      value: item.quantity,
      label: item.supplierName || 'Unknown Supplier',
      type: 'receipt',
      metadata: { supplierName: item.supplierName }
    }));
  }

  private async getProductActivity(params: URLSearchParams): Promise<ActivityDataDto[]> {
    // Placeholder for product activity
    return [];
  }

  private async getDesignerMaterialActivity(params: URLSearchParams): Promise<ActivityDataDto[]> {
    const response = await apiClient.get<any>(`${this.BASE}/DesignerMaterialInventories`);
    const data = handleApiResponse<any>(response);
    const items = Array.isArray(data) ? data : data.result || data.data || [];
    
    // Group by material type for pie chart
    const groupedData = items.reduce((acc: Record<string, number>, item: any) => {
      const materialName = item.material?.materialName || 'Unknown';
      acc[materialName] = (acc[materialName] || 0) + item.cost;
      return acc;
    }, {});

    return Object.entries(groupedData).map(([name, value]) => ({
      date: new Date().toISOString(),
      value: value as number,
      label: name,
      type: 'purchase'
    }));
  }

  private async getAggregatedActivity(params: URLSearchParams): Promise<ActivityDataDto[]> {
    const [materialActivity, designerActivity] = await Promise.all([
      this.getMaterialActivity(params),
      this.getDesignerMaterialActivity(params)
    ]);

    // Combine and aggregate by date
    const combined = [...materialActivity, ...designerActivity];
    const grouped = combined.reduce((acc: Record<string, { materials: number; designerMaterials: number }>, item) => {
      const date = new Date(item.date).toDateString();
      if (!acc[date]) {
        acc[date] = { materials: 0, designerMaterials: 0 };
      }
      
      if (item.type === 'receipt') {
        acc[date].materials += item.value;
      } else if (item.type === 'purchase') {
        acc[date].designerMaterials += item.value;
      }
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, values]) => ({
      date,
      value: values.materials + values.designerMaterials,
      label: date,
      type: 'aggregate',
      metadata: values
    }));
  }
}

export const unifiedInventoryService = new UnifiedInventoryService();
export default unifiedInventoryService;