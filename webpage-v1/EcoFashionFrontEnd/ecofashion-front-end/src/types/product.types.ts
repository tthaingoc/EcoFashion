export interface ProductSummaryDto {
  totalProducts: number;
  totalCompleted: number;
  totalProducing: number;
  totalInventoryValue: number;
}

export interface ProductTransactionDto {
  transactionId: number;
  productId: number;
  warehouseId: number;
  transactionType: 'Production' | 'Sale' | 'Return' | 'Damage';
  quantityChange: number;
  beforeQty: number;
  afterQty: number;
  orderId?: number;
  note?: string;
  createdByUserId?: number;
  createdAt: string | Date;
  productName?: string;
  warehouseName?: string;
  imageUrl?: string;
}

export interface LowStockProductDto {
  productId: number;
  warehouseId: number;
  quantityOnHand: number;
  minThreshold: number;
  difference: number;
  estimatedValue: number;
  lastUpdated: string;
  productName?: string;
  warehouseName?: string;
}

export interface ProductActivityDto {
  date: string;
  completed: number;
  inProduction: number;
  productName?: string;
}

export interface ProductInventoryFilters {
  productId?: number;
  warehouseId?: number;
  designerId?: string;
  from?: string;
  to?: string;
  transactionType?: string;
  limit?: number;
}