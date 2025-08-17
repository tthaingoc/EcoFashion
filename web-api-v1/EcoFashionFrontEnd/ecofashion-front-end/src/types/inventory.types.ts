export type WarehouseType = 'all' | 'material' | 'product' | 'designer-material';

export interface WarehouseFilter {
  type: WarehouseType;
  label: string;
  icon: string;
  description: string;
  color: string;
  apiEndpoint?: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface UnifiedInventoryData {
  type: WarehouseType;
  summary: InventorySummaryDto;
  transactions: UnifiedTransactionDto[];
  lowStockItems: LowStockItemDto[];
  activityData: ActivityDataDto[];
}

export interface InventorySummaryDto {
  totalDistinctMaterials?: number;
  totalOnHand?: number;
  totalInventoryValue?: number;
  lowStockCount?: number;
  stockoutCount?: number;
  totalProducts?: number;
  totalCompleted?: number;
  totalProducing?: number;
  totalPurchased?: number;
  totalUsing?: number;
  totalCost?: number;
  efficiency?: number;
}

export interface UnifiedTransactionDto {
  transactionId: number;
  itemId: number;
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
  itemName?: string;
  warehouseName?: string;
  supplierName?: string;
  imageUrl?: string;
  warehouseType?: string;
  itemType: 'material' | 'product' | 'designer-material';
}

export interface LowStockItemDto {
  itemId: number;
  warehouseId: number;
  quantityOnHand: number;
  minThreshold: number;
  difference: number;
  estimatedValue: number;
  lastUpdated: string;
  itemName?: string;
  warehouseName?: string;
  itemType: 'material' | 'product' | 'designer-material';
}

export interface ActivityDataDto {
  date: string;
  value: number;
  label: string;
  type: string;
  metadata?: Record<string, any>;
}

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

export interface StatsConfig {
  material: StatCard[];
  product: StatCard[];
  'designer-material': StatCard[];
  all: StatCard[];
}

export interface ChartData {
  material: MaterialActivityData;
  product: ProductActivityData;
  'designer-material': DesignerActivityData;
  all: AggregatedActivityData;
}

export interface MaterialActivityData {
  receiptsBySupplier: ActivityDataDto[];
  chartType: 'bar';
}

export interface ProductActivityData {
  productionTimeline: ActivityDataDto[];
  chartType: 'line';
}

export interface DesignerActivityData {
  purchaseDistribution: ActivityDataDto[];
  chartType: 'pie';
}

export interface AggregatedActivityData {
  overview: ActivityDataDto[];
  chartType: 'multi-series';
}

export interface AdvancedFilters {
  warehouseType: WarehouseType[];
  dateRange: DateRange;
  suppliers?: string[];
  designers?: string[];
  materials?: number[];
  products?: number[];
  transactionTypes?: string[];
  amountRange?: { min: number; max: number };
}

export interface TransactionHistoryProps {
  warehouseType: WarehouseType;
  transactions: UnifiedTransactionDto[];
  loading: boolean;
  onViewDetail: (tx: UnifiedTransactionDto) => void;
}

export interface InventoryStatsProps {
  warehouseType: WarehouseType;
  data: UnifiedInventoryData;
  loading: boolean;
}

export interface ActivityChartProps {
  warehouseType: WarehouseType;
  data: ChartData[WarehouseType];
  timeRange: DateRange;
}

export interface WarehouseFilterProps {
  selectedType: WarehouseType;
  onTypeChange: (type: WarehouseType) => void;
  dateRange: DateRange;
  onDateChange: (from: string, to: string) => void;
}