// Import existing types from services
export type { 
  InventorySummaryDto, 
  LowStockItemDto, 
  MovementPointDto, 
  SupplierReceiptPointDto 
} from '../services/api/inventoryAnalyticsService';

export type { 
  MaterialStockDto, 
  MaterialStockTransactionDto 
} from '../schemas/inventorySchema';

export type WarehouseType = 'all' | 'material' | 'product' | 'designer-material';

export interface DateRange {
  from: string;
  to: string;
}

export interface WarehouseFilter {
  type: WarehouseType;
  label: string;
  icon: string;
  description: string;
  color: string;
  apiEndpoint?: string;
}

// Simplified types for the UI
export interface StatCard {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
  [key: string]: any;
}

export interface InventoryReportData {
  summary: InventorySummaryDto;
  transactions: MaterialStockTransactionDto[];
  lowStockItems: LowStockItemDto[];
  chartData: ChartDataPoint[];
}