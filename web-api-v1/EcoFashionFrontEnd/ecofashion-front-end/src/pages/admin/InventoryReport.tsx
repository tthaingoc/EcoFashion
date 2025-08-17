import React, { useState } from 'react';
import type { WarehouseType, DateRange } from '../../types/inventory.types';
import { useWarehouseData } from '../../hooks/useWarehouseData';

// Import new components
import WarehouseFilterComponent from '../../components/inventory/WarehouseFilterComponent';
import InventoryStatsComponent from '../../components/inventory/InventoryStatsComponent';
import TransactionHistoryComponent from '../../components/inventory/TransactionHistoryComponent';
import ActivityChartComponent from '../../components/inventory/ActivityChartComponent';
import LowStockAlertComponent from '../../components/inventory/LowStockAlertComponent';
import TransactionDetailModal from '../../components/inventory/TransactionDetailModal';

const InventoryReport: React.FC = () => {
  // State for warehouse type and date range
  const [warehouseType, setWarehouseType] = useState<WarehouseType>('all');
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: new Date(Date.now() - 7 * 86400000).toISOString(),
    to: new Date().toISOString()
  }));

  // Use the custom hook to fetch all data
  const {
    data,
    isLoading,
    error,
    chartData,
    selectedTransaction,
    handleViewTransactionDetail,
    handleCloseTransactionDetail,
    refetch
  } = useWarehouseData({
    warehouseType,
    dateRange
  });

  // Handlers
  const handleTypeChange = (type: WarehouseType) => {
    setWarehouseType(type);
  };

  const handleDateChange = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  if (error) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Lỗi khi tải dữ liệu kho hàng</div>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header mb-6">
            <h1 className="dashboard-title">Báo Cáo Kho Hàng Tổng Hợp</h1>
            <p className="dashboard-subtitle">
              Quản lý và theo dõi tất cả các loại kho: Nguyên liệu, Sản phẩm, và Nguyên liệu Designer
            </p>
          </div>

          {/* Warehouse Filter */}
          <WarehouseFilterComponent
            selectedType={warehouseType}
            onTypeChange={handleTypeChange}
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />

          {/* Stats Section */}
          {data && (
            <InventoryStatsComponent
              warehouseType={warehouseType}
              data={data}
              loading={isLoading}
            />
          )}

          {/* Activity Chart */}
          {chartData && (
            <ActivityChartComponent
              warehouseType={warehouseType}
              data={chartData}
              timeRange={dateRange}
            />
          )}

          {/* Transaction History */}
          <TransactionHistoryComponent
            warehouseType={warehouseType}
            transactions={data?.transactions || []}
            loading={isLoading}
            onViewDetail={handleViewTransactionDetail}
          />

          {/* Low Stock Alert */}
          <LowStockAlertComponent
            warehouseType={warehouseType}
            lowStockItems={data?.lowStockItems || []}
            loading={isLoading}
          />

          {/* Transaction Detail Modal */}
          <TransactionDetailModal
            transaction={selectedTransaction}
            isOpen={!!selectedTransaction}
            onClose={handleCloseTransactionDetail}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;


