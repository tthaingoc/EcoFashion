export interface MaterialSummaryDto {
  totalDistinctMaterials: number;
  totalOnHand: number;
  totalInventoryValue: number;
  lowStockCount: number;
  stockoutCount: number;
}

export interface MaterialStockDto {
  stockId: number;
  materialId: number;
  warehouseId: number;
  quantityOnHand: number;
  minThreshold: number;
  lastUpdated: string | Date;
  note?: string;
  materialName?: string;
  warehouseName?: string;
  unit?: string;
  imageUrl?: string;
  warehouseType?: string;
  quantityAvailable: number;
  pricePerUnit: number;
}

export interface MaterialStockTransactionDto {
  transactionId: number;
  materialId: number;
  warehouseId: number;
  transactionType: string;
  quantityChange: number;
  beforeQty: number;
  afterQty: number;
  unit?: string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdByUserId?: number;
  createdAt: string | Date;
  materialName?: string;
  warehouseName?: string;
  supplierName?: string;
  imageUrl?: string;
  warehouseType?: string;
}

export interface MaterialInventoryFilters {
  materialId?: number;
  warehouseId?: number;
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface ReceiveMaterialRequest {
  materialId: number;
  warehouseId: number;
  quantity: number;
  unit?: string;
  note?: string;
  referenceType?: string;
  referenceId?: string;
}