import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatViDateTime } from '../../utils/date';
import type { TransactionHistoryProps, UnifiedTransactionDto } from '../../types/inventory.types';

type SortField = 'createdAt' | 'itemName' | 'transactionType' | 'quantityChange' | 'afterQty';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  transactionType: string;
  itemType: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

const getTransactionTypeText = (type: string, itemType: string) => {
  const typeMap: Record<string, Record<string, string>> = {
    material: {
      'SupplierReceipt': 'NCC nhập kho',
      'DesignerPurchase': 'Designer mua',
      'Adjustment': 'Điều chỉnh',
      'Transfer': 'Chuyển kho'
    },
    product: {
      'Production': 'Sản xuất',
      'Sale': 'Bán hàng',
      'Return': 'Trả hàng',
      'Damage': 'Hư hỏng'
    },
    'designer-material': {
      'Purchase': 'Mua hàng',
      'Usage': 'Sử dụng',
      'Return': 'Trả lại'
    }
  };

  return typeMap[itemType]?.[type] || type;
};

const getTransactionColor = (transaction: UnifiedTransactionDto) => {
  if (transaction.quantityChange > 0) {
    return 'text-green-600 bg-green-50';
  } else if (transaction.quantityChange < 0) {
    return 'text-red-600 bg-red-50';
  }
  return 'text-gray-600 bg-gray-50';
};

const DeltaCell: React.FC<{ delta: number }> = ({ delta }) => {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <ArrowUpIcon className="w-3 h-3" /> +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
        <ArrowDownIcon className="w-3 h-3" /> {delta}
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">0</span>;
};

const TransactionHistoryComponent: React.FC<TransactionHistoryProps> = ({
  warehouseType,
  transactions,
  loading,
  onViewDetail
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    transactionType: '',
    itemType: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      const searchMatch = !filters.search || 
        (tx.itemName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         tx.warehouseName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         tx.supplierName?.toLowerCase().includes(filters.search.toLowerCase()));

      const typeMatch = !filters.transactionType || tx.transactionType === filters.transactionType;
      const itemTypeMatch = !filters.itemType || tx.itemType === filters.itemType;
      
      const dateFromMatch = !filters.dateFrom || new Date(tx.createdAt) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || new Date(tx.createdAt) <= new Date(filters.dateTo);
      
      const minAmountMatch = !filters.amountMin || Math.abs(tx.quantityChange) >= parseFloat(filters.amountMin);
      const maxAmountMatch = !filters.amountMax || Math.abs(tx.quantityChange) <= parseFloat(filters.amountMax);

      return searchMatch && typeMatch && itemTypeMatch && dateFromMatch && dateToMatch && minAmountMatch && maxAmountMatch;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, filters, sortField, sortOrder]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 text-blue-600" /> : 
      <ArrowDownIcon className="w-4 h-4 text-blue-600" />;
  };

  const exportToCSV = () => {
    const headers = ['Thời gian', 'Tên mặt hàng', 'Loại', 'Kho', 'Chênh lệch', 'Trước', 'Sau', 'Ghi chú'];
    const rows = filteredAndSortedTransactions.map(tx => [
      formatViDateTime(tx.createdAt),
      tx.itemName || `#${tx.itemId}`,
      getTransactionTypeText(tx.transactionType, tx.itemType),
      tx.warehouseName || tx.warehouseId,
      tx.quantityChange,
      tx.beforeQty,
      tx.afterQty,
      tx.note || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${warehouseType}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">Lịch Sử Giao Dịch</h3>
            <p className="text-sm text-gray-500">
              {filteredAndSortedTransactions.length} giao dịch 
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
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên mặt hàng, kho, nhà cung cấp..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <select
              className="form-select"
              value={filters.transactionType}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
            >
              <option value="">Tất cả loại GD</option>
              <option value="SupplierReceipt">NCC nhập kho</option>
              <option value="Production">Sản xuất</option>
              <option value="Sale">Bán hàng</option>
              <option value="Purchase">Mua hàng</option>
              <option value="Usage">Sử dụng</option>
            </select>

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

            <input
              type="date"
              className="form-input"
              placeholder="Từ ngày"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />

            <input
              type="date"
              className="form-input"
              placeholder="Đến ngày"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />

            <input
              type="number"
              className="form-input"
              placeholder="Số lượng tối thiểu"
              value={filters.amountMin}
              onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
            />

            <input
              type="number"
              className="form-input"
              placeholder="Số lượng tối đa"
              value={filters.amountMax}
              onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-2">
                  Thời gian
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('itemName')}
              >
                <div className="flex items-center gap-2">
                  Mặt hàng
                  <SortIcon field="itemName" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('transactionType')}
              >
                <div className="flex items-center gap-2">
                  Loại GD
                  <SortIcon field="transactionType" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kho
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantityChange')}
              >
                <div className="flex items-center gap-2">
                  Chênh lệch
                  <SortIcon field="quantityChange" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trước → Sau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tham chiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((tx) => (
              <tr key={`${tx.transactionId}-${tx.itemType}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatViDateTime(tx.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {tx.imageUrl && (
                      <img 
                        src={tx.imageUrl} 
                        alt={tx.itemName || ''} 
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{tx.itemName || `#${tx.itemId}`}</div>
                      <div className="text-xs text-gray-500 capitalize">{tx.itemType}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionColor(tx)}`}>
                    {getTransactionTypeText(tx.transactionType, tx.itemType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {tx.warehouseName || tx.warehouseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DeltaCell delta={tx.quantityChange} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {tx.beforeQty} → {tx.afterQty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {tx.referenceType && tx.referenceId ? 
                    `${tx.referenceType} #${tx.referenceId}` : 
                    '—'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewDetail(tx)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Không có giao dịch nào</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} 
            trong tổng số {filteredAndSortedTransactions.length} giao dịch
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryComponent;