import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import inventoryAnalyticsService from '../../services/api/inventoryAnalyticsService';
import materialInventoryService from '../../services/api/materialInventoryService';
import designerMaterialInventoryService from '../../services/api/designerMaterialInventoryService';
import productInventoryAnalyticsService from '../../services/api/productInventoryAnalyticsService';

// Simple interfaces for the demo
interface DateRange {
  from: string;
  to: string;
}

type WarehouseType = 'all' | 'material' | 'material-supplier' | 'designer-material' | 'product';

const InventoryReport: React.FC = () => {
  // State for filters
  const [warehouseType, setWarehouseType] = useState<WarehouseType>('all');
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  }));

  // Fetch material inventory summary
  const { data: materialSummary, isLoading: materialLoading, error: materialError } = useQuery({
    queryKey: ['material-summary', dateRange.from, dateRange.to],
    queryFn: () => inventoryAnalyticsService.getSummary({
      from: dateRange.from,
      to: dateRange.to
    }),
    enabled: warehouseType === 'material' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch material transactions  
  const { data: materialTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['material-transactions', dateRange.from, dateRange.to],
    queryFn: () => materialInventoryService.getTransactions({
      from: dateRange.from,
      to: dateRange.to,
      supplierOnly: warehouseType === 'material-supplier',
      warehouseId: warehouseType === 'material-supplier' ? 3 : undefined
    }),
    enabled: warehouseType === 'material' || warehouseType === 'material-supplier' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch low stock items
  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryAnalyticsService.getLowStock({ limit: 10 }),
    enabled: warehouseType === 'material' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['chart-data', dateRange.from, dateRange.to],
    queryFn: () => inventoryAnalyticsService.getReceiptsBySupplier({
      from: dateRange.from,
      to: dateRange.to
    }),
    enabled: warehouseType === 'material' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch designer material summary
  const { data: designerSummary, isLoading: designerLoading } = useQuery({
    queryKey: ['designer-summary'],
    queryFn: () => designerMaterialInventoryService.getSummary(),
    enabled: warehouseType === 'designer-material' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch designer transactions
  const { data: designerTransactions, isLoading: designerTransactionsLoading } = useQuery({
    queryKey: ['designer-transactions'],
    queryFn: () => designerMaterialInventoryService.getTransactions(),
    enabled: warehouseType === 'designer-material' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch product inventory summary
  const { data: productSummary, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product-summary', dateRange.from, dateRange.to],
    queryFn: () => productInventoryAnalyticsService.getSummary({
      from: dateRange.from,
      to: dateRange.to
    }),
    enabled: warehouseType === 'product' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch product transactions
  const { data: productTransactions, isLoading: productTransactionsLoading } = useQuery({
    queryKey: ['product-transactions', dateRange.from, dateRange.to],
    queryFn: () => productInventoryAnalyticsService.getTransactions({
      from: dateRange.from,
      to: dateRange.to
    }),
    enabled: warehouseType === 'product' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch product low stock items
  const { data: productLowStock, isLoading: productLowStockLoading } = useQuery({
    queryKey: ['product-low-stock'],
    queryFn: () => productInventoryAnalyticsService.getLowStock({ limit: 10 }),
    enabled: warehouseType === 'product' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  // Fetch product activity data
  const { data: productActivity, isLoading: productActivityLoading } = useQuery({
    queryKey: ['product-activity', dateRange.from, dateRange.to],
    queryFn: () => productInventoryAnalyticsService.getProductionActivity({
      from: dateRange.from,
      to: dateRange.to
    }),
    enabled: warehouseType === 'product' || warehouseType === 'all',
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const isLoading = materialLoading || transactionsLoading || lowStockLoading || chartLoading || designerLoading || designerTransactionsLoading || productLoading || productTransactionsLoading || productLowStockLoading || productActivityLoading;
  const hasError = materialError || productError;

  // Handler functions
  const handleTypeChange = (type: WarehouseType) => {
    setWarehouseType(type);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (hasError) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Lỗi khi tải dữ liệu kho hàng</div>
              <button
                onClick={() => window.location.reload()}
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
              Quản lý và theo dõi tất cả các loại kho: Nguyên liệu, Nguyên liệu Designer, và Sản phẩm
            </p>
          </div>

          {/* Filters: only warehouse type */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Warehouse Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Kho
                </label>
                <select
                  value={warehouseType}
                  onChange={(e) => handleTypeChange(e.target.value as WarehouseType)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả kho</option>
                  <option value="material">Kho nguyên liệu</option>
                  <option value="material-supplier">Kho nguyên liệu - NCC</option>
                  <option value="designer-material">Kho nguyên liệu Designer</option>
                  <option value="product">Kho sản phẩm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State hidden */}
          {false && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Stats Cards hidden */}
          {false && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {warehouseType !== 'designer-material' && materialSummary && (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Tổng Nguyên Liệu</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {materialSummary.totalDistinctMaterials}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100">
                        <div className="w-6 h-6 bg-blue-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Tồn Kho</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {materialSummary.totalOnHand?.toFixed(1)} m
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100">
                        <div className="w-6 h-6 bg-green-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Giá Trị Tồn Kho</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${materialSummary.totalInventoryValue?.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100">
                        <div className="w-6 h-6 bg-purple-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Cảnh Báo Tồn Kho</p>
                        <p className="text-2xl font-bold text-red-600">
                          {materialSummary.lowStockCount}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-red-100">
                        <div className="w-6 h-6 bg-red-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {warehouseType !== 'material' && designerSummary && (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Đã Mua</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {designerSummary.totalPurchased}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-indigo-100">
                        <div className="w-6 h-6 bg-indigo-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Đang Sử Dụng</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {designerSummary.totalUsing}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-orange-100">
                        <div className="w-6 h-6 bg-orange-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Tổng Chi Phí</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${designerSummary.totalCost?.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-pink-100">
                        <div className="w-6 h-6 bg-pink-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Hiệu Suất</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {designerSummary.efficiency?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-teal-100">
                        <div className="w-6 h-6 bg-teal-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {warehouseType !== 'material' && warehouseType !== 'designer-material' && productSummary && (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {productSummary.totalProducts}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100">
                        <div className="w-6 h-6 bg-blue-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Đã Hoàn Thành</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {productSummary.totalCompleted}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100">
                        <div className="w-6 h-6 bg-green-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Đang Sản Xuất</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {productSummary.totalInProduction}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-yellow-100">
                        <div className="w-6 h-6 bg-yellow-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Cảnh Báo Tồn Kho</p>
                        <p className="text-2xl font-bold text-red-600">
                          {productSummary.lowStockCount}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-red-100">
                        <div className="w-6 h-6 bg-red-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Chart Section hidden */}
          {false && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {warehouseType === 'material' || warehouseType === 'all' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Nhập Kho Theo Nhà Cung Cấp
                  </h3>
                  {chartData && chartData.length > 0 && (
                    <div className="space-y-4">
                      {chartData.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.supplierName || 'Không xác định'}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(100, (item.quantity / Math.max(...chartData.map(d => d.quantity))) * 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-16 text-right">
                              {item.quantity} m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {warehouseType === 'product' && productActivity && productActivity.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hoạt Động Sản Xuất Theo Design
                  </h3>
                  <div className="space-y-4">
                    {productActivity.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.designName || 'Không xác định'}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600">Sản xuất:</span>
                            <span className="text-sm font-medium text-green-900">{item.produced}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-blue-600">Bán:</span>
                            <span className="text-sm font-medium text-blue-900">{item.sold}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Recent Transactions */}
          {(materialTransactions && materialTransactions.length > 0) || (designerTransactions && designerTransactions.length > 0) || (productTransactions && productTransactions.length > 0) ? (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giao Dịch Gần Đây
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nguyên Liệu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi Chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {warehouseType !== 'designer-material' && materialTransactions &&
                      materialTransactions.slice(0, 10).map((transaction, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.transactionType === 'SupplierReceipt'
                              ? 'bg-green-100 text-green-800'
                              : transaction.transactionType === 'CustomerSale'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.materialName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {warehouseType === 'material-supplier' ? 'Kho nguyên liệu - NCC' : (transaction.warehouseName || 'N/A')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={transaction.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                              {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange} {transaction.unit || 'm'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.note || '-'}
                          </td>
                        </tr>
                      ))
                    }
                    {warehouseType !== 'material' && designerTransactions &&
                      designerTransactions.slice(0, 10).map((transaction, index) => (
                        <tr key={`designer-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.purchaseDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Designer Purchase
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.materialName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            +{transaction.quantity} pcs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Cost: ${transaction.totalCost}
                          </td>
                        </tr>
                      ))
                    }
                    {warehouseType !== 'material' && warehouseType !== 'designer-material' && productTransactions &&
                      productTransactions.slice(0, 10).map((transaction, index) => (
                        <tr key={`product-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.transactionType === 'Production'
                              ? 'bg-green-100 text-green-800'
                              : transaction.transactionType === 'Sale'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.productName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={transaction.quantityChanged > 0 ? 'text-green-600' : 'text-red-600'}>
                              {transaction.quantityChanged > 0 ? '+' : ''}{transaction.quantityChanged} cái
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.notes || '-'}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giao Dịch Gần Đây
              </h3>
              <p className="text-gray-500 text-center py-8">Không có giao dịch nào</p>
            </div>
          )}

          {/* Low Stock Alert hidden */}
          {false && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cảnh Báo Tồn Kho Thấp
              </h3>
              <div className="space-y-3">
                {lowStockItems && lowStockItems.map((item, index) => (
                  <div key={`material-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.materialName}</p>
                      <p className="text-sm text-gray-600">{item.warehouseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">
                        Còn lại: {item.quantityOnHand} / Tối thiểu: {item.minThreshold}
                      </p>
                      <p className="text-xs text-gray-500">
                        Thiếu: {Math.abs(item.difference)} units
                      </p>
                    </div>
                  </div>
                ))}
                {productLowStock && productLowStock.map((item, index) => (
                  <div key={`product-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">{item.warehouseName} - SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">
                        Còn lại: {item.quantityAvailable} / Tối thiểu: {item.minThreshold}
                      </p>
                      <p className="text-xs text-gray-500">
                        Thiếu: {Math.abs(item.difference)} cái
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;