import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { 
  WarehouseType, 
  UnifiedInventoryData, 
  DateRange,
  UnifiedTransactionDto 
} from '../types/inventory.types';
import unifiedInventoryService from '../services/api/unifiedInventoryService';

interface UseWarehouseDataOptions {
  warehouseType: WarehouseType;
  dateRange: DateRange;
  refreshInterval?: number;
}

export const useWarehouseData = ({ 
  warehouseType, 
  dateRange, 
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: UseWarehouseDataOptions) => {
  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransactionDto | null>(null);

  // Fetch summary data
  const { 
    data: summary, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useQuery({
    queryKey: ['warehouse-summary', warehouseType, dateRange.from, dateRange.to],
    queryFn: () => unifiedInventoryService.getSummary(warehouseType, dateRange),
    staleTime: refreshInterval,
    retry: 3
  });

  // Fetch transactions data
  const { 
    data: transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: ['warehouse-transactions', warehouseType, dateRange.from, dateRange.to],
    queryFn: () => unifiedInventoryService.getTransactions(warehouseType, dateRange),
    staleTime: refreshInterval,
    retry: 3
  });

  // Fetch low stock items
  const { 
    data: lowStockItems, 
    isLoading: lowStockLoading, 
    error: lowStockError,
    refetch: refetchLowStock 
  } = useQuery({
    queryKey: ['warehouse-low-stock', warehouseType],
    queryFn: () => unifiedInventoryService.getLowStockItems(warehouseType, 20),
    staleTime: refreshInterval,
    retry: 3
  });

  // Fetch activity data
  const { 
    data: activityData, 
    isLoading: activityLoading, 
    error: activityError,
    refetch: refetchActivity 
  } = useQuery({
    queryKey: ['warehouse-activity', warehouseType, dateRange.from, dateRange.to],
    queryFn: () => unifiedInventoryService.getActivityData(warehouseType, dateRange),
    staleTime: refreshInterval,
    retry: 3
  });

  // Aggregate data into unified format
  const unifiedData: UnifiedInventoryData | undefined = useMemo(() => {
    if (!summary) return undefined;

    return {
      type: warehouseType,
      summary,
      transactions: transactions || [],
      lowStockItems: lowStockItems || [],
      activityData: activityData || []
    };
  }, [warehouseType, summary, transactions, lowStockItems, activityData]);

  // Loading state
  const isLoading = summaryLoading || transactionsLoading || lowStockLoading || activityLoading;

  // Error state
  const error = summaryError || transactionsError || lowStockError || activityError;

  // Refetch all data
  const refetchAll = () => {
    refetchSummary();
    refetchTransactions();
    refetchLowStock();
    refetchActivity();
  };

  // Chart data transformed for charts
  const chartData = useMemo(() => {
    if (!activityData) return null;

    switch (warehouseType) {
      case 'material':
        return {
          receiptsBySupplier: activityData,
          chartType: 'bar' as const
        };
      case 'product':
        return {
          productionTimeline: activityData,
          chartType: 'line' as const
        };
      case 'designer-material':
        return {
          purchaseDistribution: activityData,
          chartType: 'pie' as const
        };
      case 'all':
        return {
          overview: activityData,
          chartType: 'multi-series' as const
        };
      default:
        return {
          receiptsBySupplier: activityData,
          chartType: 'bar' as const
        };
    }
  }, [warehouseType, activityData]);

  // Stats for current warehouse type
  const stats = useMemo(() => {
    if (!summary) return null;

    const baseStats = {
      material: [
        { label: 'Số vật liệu', value: summary.totalDistinctMaterials ?? 0 },
        { label: 'Tồn kho hiện tại', value: summary.totalOnHand ?? 0 },
        { label: 'Giá trị tồn kho', value: summary.totalInventoryValue ?? 0 },
        { label: 'Dưới ngưỡng', value: summary.lowStockCount ?? 0 },
        { label: 'Hết hàng', value: summary.stockoutCount ?? 0 }
      ],
      product: [
        { label: 'Tổng sản phẩm', value: summary.totalProducts ?? 0 },
        { label: 'Đã hoàn thành', value: summary.totalCompleted ?? 0 },
        { label: 'Đang sản xuất', value: summary.totalProducing ?? 0 },
        { label: 'Giá trị tồn kho', value: summary.totalInventoryValue ?? 0 }
      ],
      'designer-material': [
        { label: 'Đã mua', value: summary.totalPurchased ?? 0 },
        { label: 'Đang sử dụng', value: summary.totalUsing ?? 0 },
        { label: 'Tổng chi phí', value: summary.totalCost ?? 0 },
        { label: 'Hiệu suất', value: summary.efficiency ? `${summary.efficiency}%` : '0%' }
      ],
      all: [
        { label: 'Tổng vật liệu', value: summary.totalDistinctMaterials ?? 0 },
        { label: 'Tổng sản phẩm', value: summary.totalProducts ?? 0 },
        { label: 'Tổng giá trị', value: summary.totalInventoryValue ?? 0 },
        { label: 'Cảnh báo', value: (summary.lowStockCount ?? 0) + (summary.stockoutCount ?? 0) }
      ]
    };

    return baseStats[warehouseType] || baseStats.all;
  }, [warehouseType, summary]);

  // Transaction handlers
  const handleViewTransactionDetail = (transaction: UnifiedTransactionDto) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseTransactionDetail = () => {
    setSelectedTransaction(null);
  };

  return {
    // Data
    data: unifiedData,
    summary,
    transactions: transactions || [],
    lowStockItems: lowStockItems || [],
    activityData: activityData || [],
    chartData,
    stats,

    // Loading states
    isLoading,
    summaryLoading,
    transactionsLoading,
    lowStockLoading,
    activityLoading,

    // Error states
    error,
    summaryError,
    transactionsError,
    lowStockError,
    activityError,

    // Actions
    refetch: refetchAll,
    refetchSummary,
    refetchTransactions,
    refetchLowStock,
    refetchActivity,

    // Transaction detail modal
    selectedTransaction,
    handleViewTransactionDetail,
    handleCloseTransactionDetail
  };
};