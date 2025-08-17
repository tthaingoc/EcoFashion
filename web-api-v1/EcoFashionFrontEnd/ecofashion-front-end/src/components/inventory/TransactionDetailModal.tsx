import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatViDateTime } from '../../utils/date';
import type { UnifiedTransactionDto } from '../../types/inventory.types';

interface TransactionDetailModalProps {
  transaction: UnifiedTransactionDto | null;
  isOpen: boolean;
  onClose: () => void;
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
    return 'text-green-600 bg-green-50 border-green-200';
  } else if (transaction.quantityChange < 0) {
    return 'text-red-600 bg-red-50 border-red-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

const getItemTypeText = (itemType: string) => {
  switch (itemType) {
    case 'material':
      return 'Nguyên liệu';
    case 'product':
      return 'Sản phẩm';
    case 'designer-material':
      return 'Nguyên liệu Designer';
    default:
      return itemType;
  }
};

const DeltaDisplay: React.FC<{ delta: number }> = ({ delta }) => {
  if (delta > 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <ArrowUpIcon className="w-5 h-5" />
        <span className="text-lg font-semibold">+{delta}</span>
      </div>
    );
  }
  if (delta < 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <ArrowDownIcon className="w-5 h-5" />
        <span className="text-lg font-semibold">{delta}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="text-lg font-semibold">0</span>
    </div>
  );
};

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  if (!isOpen || !transaction) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Chi tiết giao dịch #{transaction.transactionId}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {getTransactionTypeText(transaction.transactionType, transaction.itemType)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Type Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getTransactionColor(transaction)}`}>
              {getTransactionTypeText(transaction.transactionType, transaction.itemType)}
            </span>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Thời gian</label>
                <p className="text-base text-gray-900">{formatViDateTime(transaction.createdAt)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên mặt hàng</label>
                <p className="text-base text-gray-900">{transaction.itemName || `#${transaction.itemId}`}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Loại hàng</label>
                <p className="text-base text-gray-900">{getItemTypeText(transaction.itemType)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Kho</label>
                <p className="text-base text-gray-900">{transaction.warehouseName || `#${transaction.warehouseId}`}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Loại kho</label>
                <p className="text-base text-gray-900">{transaction.warehouseType || '—'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Đơn vị</label>
                <p className="text-base text-gray-900">{transaction.unit || '—'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Người thực hiện</label>
                <p className="text-base text-gray-900">
                  {transaction.supplierName || transaction.createdByUserId || '—'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tham chiếu</label>
                <p className="text-base text-gray-900">
                  {transaction.referenceType && transaction.referenceId 
                    ? `${transaction.referenceType} #${transaction.referenceId}` 
                    : '—'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Change Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Thay đổi số lượng</h4>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{transaction.beforeQty}</div>
                <div className="text-sm text-gray-500">Trước</div>
              </div>
              
              <div className="flex flex-col items-center">
                <DeltaDisplay delta={transaction.quantityChange} />
                <div className="text-sm text-gray-500 mt-1">Thay đổi</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{transaction.afterQty}</div>
                <div className="text-sm text-gray-500">Sau</div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          {transaction.imageUrl && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh minh họa</h4>
              <div className="flex justify-center">
                <img
                  src={transaction.imageUrl}
                  alt={transaction.itemName || 'Transaction image'}
                  className="max-w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Notes Section */}
          {transaction.note && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ghi chú</h4>
              <p className="text-gray-700">{transaction.note}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Transaction ID:</span>
                <span className="ml-2 text-gray-900">{transaction.transactionId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Item ID:</span>
                <span className="ml-2 text-gray-900">{transaction.itemId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Warehouse ID:</span>
                <span className="ml-2 text-gray-900">{transaction.warehouseId}</span>
              </div>
              {transaction.createdByUserId && (
                <div>
                  <span className="font-medium text-gray-500">User ID:</span>
                  <span className="ml-2 text-gray-900">{transaction.createdByUserId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;