import React from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { OrderSellerViewModel, SellerOrderDetailModel } from '../../services/api/ordersService';

// Không cần helper tách chuỗi nữa – BE sẽ trả về personalPhoneNumber riêng

interface PartialOrderCardProps {
  orderData: OrderSellerViewModel;
  onViewDetails: (orderId: number) => void;
  onConfirmAllItems: (orderId: number) => void;
  onConfirmItem: (orderDetailId: number) => void;
  onShipItem: (orderDetailId: number) => void;
  isUpdating?: boolean;
}

const StatusBadge: React.FC<{ status: string; type?: 'order' | 'item' }> = ({ 
  status, 
  type = 'item' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Chờ xác nhận' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, text: 'Đã xác nhận' };
      case 'shipping':
        return { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Đang vận chuyển' };
      case 'partiallyconfirmed':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Một phần đã xác nhận' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, text: 'Đang xử lý' };
      case 'partiallyshipped':
        return { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon, text: 'Một phần đã gửi' };
      case 'shipped':
        return { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Đã gửi' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Đã giao' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: status };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

const SellerItemRow: React.FC<{
  item: SellerOrderDetailModel;
  onConfirm: (id: number) => void;
  onShip: (id: number) => void;
  isUpdating?: boolean;
}> = ({ item, onConfirm, onShip, isUpdating }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.itemName}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="font-medium text-gray-900">{item.itemName}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>{item.itemType}</span>
            <span>•</span>
            <span>x{item.quantity}</span>
            <span>•</span>
            <span>{item.unitPrice.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          
          {/* Ẩn nút xác nhận từng item để chỉ giữ luồng "Xác nhận tất cả items" */}
          
          {/* Ẩn nút gửi hàng từng item (ship per-item) tại trang này */}
        </div>
      </div>
    </div>
  );
};

const OtherSellerInfo: React.FC<{ sellers: any[] }> = ({ sellers }) => {
  if (sellers.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <div className="text-sm font-medium text-blue-900 mb-2">
        Suppliers khác trong đơn hàng này:
      </div>
      <div className="space-y-1">
        {sellers.map((seller, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {seller.avatarUrl ? (
                <img src={seller.avatarUrl} alt={seller.sellerName} className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-600">{seller.sellerName[0]}</span>
                </div>
              )}
              <span className="text-blue-800">{seller.sellerName}</span>
              <span className="text-blue-600">({seller.sellerType})</span>
            </div>
            <div className="text-blue-700">
              {seller.confirmedItems}/{seller.itemCount} items {seller.allItemsConfirmed ? '✅' : '⏳'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PartialOrderCard: React.FC<PartialOrderCardProps> = ({
  orderData,
  onViewDetails,
  onConfirmAllItems,
  onConfirmItem,
  onShipItem,
  isUpdating
}) => {
  const hasUnconfirmedItems = orderData.sellerItems.some(item => item.status === 'pending');
  const canConfirmAll = hasUnconfirmedItems && orderData.paymentStatus === 'Paid';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn hàng #{orderData.orderId}
            </h3>
            {orderData.sellerItemsCount < orderData.totalItemsInOrder && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                Mixed Order
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            {new Date(orderData.orderDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <StatusBadge status={orderData.fulfillmentStatus} />
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Khách hàng:</span>
            <span className="text-sm font-medium text-gray-900">{orderData.userName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tổng tiền:</span>
            <span className="text-sm font-semibold text-blue-600">
              {orderData.totalPrice.toLocaleString('vi-VN')} VND
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Items của bạn:</span>
            <span className="text-sm font-medium text-gray-900">
              {orderData.sellerItemsCount}/{orderData.totalItemsInOrder} items
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>Đã xác nhận: </span>
            <span className="font-medium text-green-600">
              {orderData.confirmedSellerItems}/{orderData.sellerItemsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-4">
        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
        <div>
          <span className="text-sm text-gray-600">Địa chỉ: </span>
          <span className="text-sm text-gray-900">{orderData.shippingAddress}</span>
          {orderData.personalPhoneNumber && (
            <div className="text-sm text-gray-600 mt-1">
              <span>Số điện thoại: </span>
              <span className="text-gray-900">{orderData.personalPhoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seller Items */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 mb-2">
          Items của bạn ({orderData.sellerItemsCount}):
        </div>
        <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          {orderData.sellerItems.map((item) => (
            <SellerItemRow
              key={item.orderDetailId}
              item={item}
              onConfirm={onConfirmItem}
              onShip={onShipItem}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* Other Sellers Info */}
      <OtherSellerInfo sellers={orderData.otherSellers} />

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onViewDetails(orderData.orderId)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Chi tiết đơn hàng
        </button>

        {canConfirmAll && (
          <button
            onClick={() => onConfirmAllItems(orderData.orderId)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isUpdating ? 'Đang xử lý...' : 'Xác nhận tất cả items'}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {orderData.sellerItemsCount > 1 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Tiến độ xác nhận</span>
            <span>{Math.round((orderData.confirmedSellerItems / orderData.sellerItemsCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(orderData.confirmedSellerItems / orderData.sellerItemsCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartialOrderCard;