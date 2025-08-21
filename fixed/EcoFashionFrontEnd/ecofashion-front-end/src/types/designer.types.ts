export interface DesignerMaterialSummaryDto {
  totalPurchased: number;
  totalUsing: number;
  totalCost: number;
  efficiency: number;
}

export interface DesignerMaterialTransactionDto {
  purchaseId: number;
  designerId: string;
  materialId: number;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string | Date;
  status: 'Ordered' | 'Received' | 'Used';
  materialName?: string;
  supplierName?: string;
}

export interface MaterialUsageDto {
  materialId: number;
  materialName: string;
  totalPurchased: number;
  totalUsed: number;
  remainingQuantity: number;
  averagePrice: number;
  lastPurchaseDate: string;
  usageEfficiency: number;
}

export interface DesignerMaterialFilters {
  designerId: string;
  materialId?: number;
  supplierId?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
}