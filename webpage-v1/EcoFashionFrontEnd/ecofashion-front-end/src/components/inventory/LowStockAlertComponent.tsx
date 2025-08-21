import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { CubeIcon, PuzzlePieceIcon, SparklesIcon } from '@heroicons/react/24/solid';
import type { LowStockItemDto, WarehouseType } from '../../types/inventory.types';

const formatCurrency = (n: number) => (n * 1000).toLocaleString('vi-VN') + 'đ';

interface LowStockAlertProps {
  warehouseType: WarehouseType;
  lowStockItems: LowStockItemDto[];
  loading: boolean;
}

interface FilterState {
  itemType: string;
  severity: string;
  warehouse: string;
}

const getSeverityLevel = (item: LowStockItemDto) => {
  if (item.quantityOnHand === 0) return 'critical';
  if (item.quantityOnHand <= item.minThreshold * 0.5) return 'high';
  if (item.quantityOnHand <= item.minThreshold * 0.8) return 'medium';
  return 'low';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'Hết hàng';
    case 'high':
      return 'Rất thấp';
    case 'medium':
      return 'Thấp';
    case 'low':
      return 'Gần hết';
    default:
      return 'Bình thường';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <XCircleIcon className="w-4 h-4" />;
    case 'high':
    case 'medium':
      return <ExclamationTriangleIcon className="w-4 h-4" />;
    case 'low':
      return <ClockIcon className="w-4 h-4" />;
    default:
      return <ExclamationTriangleIcon className="w-4 h-4" />;
  }
};

const getItemTypeIcon = (itemType: string) => {
  switch (itemType) {
    case 'material':
      return <CubeIcon className="w-4 h-4" />;
    case 'product':
      return <PuzzlePieceIcon className="w-4 h-4" />;
    case 'designer-material':
      return <SparklesIcon className="w-4 h-4" />;
    default:
      return <CubeIcon className="w-4 h-4" />;
  }
};

const getItemTypeText = (itemType: string) => {
  switch (itemType) {
    case 'material':
      return 'Nguyên liệu';
    case 'product':
      return 'Sản phẩm';
    case 'designer-material':
      return 'NVL Designer';
    default:
      return itemType;
  }
};

const LowStockAlertComponent: React.FC<LowStockAlertProps> = ({
  warehouseType,
  lowStockItems,
  loading
}) => {
  const [filters, setFilters] = useState<FilterState>({
    itemType: '',
    severity: '',
    warehouse: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = React.useMemo(() => {
    return lowStockItems.filter(item => {
      const itemTypeMatch = !filters.itemType || item.itemType === filters.itemType;
      const severityMatch = !filters.severity || getSeverityLevel(item) === filters.severity;
      const warehouseMatch = !filters.warehouse || 
        (item.warehouseName && item.warehouseName.toLowerCase().includes(filters.warehouse.toLowerCase()));

      return itemTypeMatch && severityMatch && warehouseMatch;
    });
  }, [lowStockItems, filters]);

  const exportToCSV = () => {
    const headers = ['Tên mặt hàng', 'Loại', 'Kho', 'Tồn hiện tại', 'Ngưỡng tối thiểu', 'Chênh lệch', 'Mức độ', 'Giá trị ước tính', 'Cập nhật lần cuối'];
    const rows = filteredItems.map(item => [
      item.itemName || `#${item.itemId}`,
      getItemTypeText(item.itemType),
      item.warehouseName || item.warehouseId,
      item.quantityOnHand,
      item.minThreshold,
      item.difference,
      getSeverityText(getSeverityLevel(item)),
      formatCurrency(item.estimatedValue),
      new Date(item.lastUpdated).toLocaleString('vi-VN')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low_stock_alert_${warehouseType}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              Cảnh Báo Tồn Kho Thấp
            </h3>
            <p className="text-sm text-gray-500">
              {filteredItems.length} mặt hàng cần chú ý
              {warehouseType !== 'all' && ` (${warehouseType})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-4 h-4" />
              Bộ lọc
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <select
              className="form-select"
              value={filters.itemType}
              onChange={(e) => setFilters(prev => ({ ...prev, itemType: e.target.value }))}
            >
              <option value="">Tất cả loại hàng</option>
              <option value="material">Nguyên liệu</option>
              <option value="product">Sản phẩm</option>
              <option value="designer-material">NVL Designer</option>
            </select>

            <select
              className="form-select"
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            >
              <option value="">Tất cả mức độ</option>
              <option value="critical">Hết hàng</option>
              <option value="high">Rất thấp</option>
              <option value="medium">Thấp</option>
              <option value="low">Gần hết</option>
            </select>

            <input
              type="text"
              className="form-input"
              placeholder="Tìm theo tên kho..."
              value={filters.warehouse}
              onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Alert Items */}
      <div className="divide-y divide-gray-200">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div>Không có mặt hàng nào cần cảnh báo</div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const severity = getSeverityLevel(item);
            return (
              <div 
                key={`${item.itemId}-${item.warehouseId}`} 
                className="p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Item Info */}
                    <div className="flex items-center gap-2">
                      {getItemTypeIcon(item.itemType)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.itemName || `#${item.itemId}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.warehouseName || item.warehouseId} • {getItemTypeText(item.itemType)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Info */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {item.quantityOnHand}
                        </div>
                        <div className="text-xs text-gray-500">Tồn hiện tại</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600">
                          {item.minThreshold}
                        </div>
                        <div className="text-xs text-gray-500">Ngưỡng tối thiểu</div>
                      </div>

                      <div className="text-center">
                        <div className={`text-lg font-semibold ${
                          item.difference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.difference}
                        </div>
                        <div className="text-xs text-gray-500">Chênh lệch</div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.estimatedValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(severity)}`}>
                    {getSeverityIcon(severity)}
                    {getSeverityText(severity)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Mức tồn kho</span>
                    <span className="ml-auto">
                      {item.quantityOnHand > 0 ? 
                        `${((item.quantityOnHand / item.minThreshold) * 100).toFixed(0)}%` : 
                        '0%'
                      } so với ngưỡng tối thiểu
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        severity === 'critical' ? 'bg-red-500' :
                        severity === 'high' ? 'bg-orange-500' :
                        severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (item.quantityOnHand / item.minThreshold) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LowStockAlertComponent;