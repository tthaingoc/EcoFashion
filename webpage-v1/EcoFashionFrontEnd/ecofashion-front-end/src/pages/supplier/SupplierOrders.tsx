import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { ordersService, OrderModel, UpdateFulfillmentStatusRequest, ShipOrderRequest } from '../../services/api/ordersService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

// Use OrderModel from API service
type Order = OrderModel;

interface OrderDetail {
  orderDetailId: number;
  materialName?: string;
  designName?: string;
  quantity: number;
  unitPrice: number;
  type: 'material' | 'design' | 'product';
}

// Helper: tách SĐT (PersonalPhoneNumber) được append ở cuối địa chỉ bởi BE
const splitAddressPhone = (full: string): { address: string; phone?: string } => {
  if (!full) return { address: '' };
  const parts = full.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return { address: full };
  const last = parts[parts.length - 1] || '';
  const digits = (last.match(/\d/g) || []).length;
  const hasLetters = /[A-Za-zÀ-ỹ]/.test(last);
  if (!hasLetters && digits >= 8) {
    return { address: parts.slice(0, -1).join(', '), phone: last };
  }
  return { address: full };
};

const OrderStatusBadge: React.FC<{ status: string; type?: 'order' | 'payment' | 'fulfillment' }> = ({ 
  status, 
  type = 'fulfillment' 
}) => {
  const getStatusConfig = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Đã thanh toán' };
        case 'Pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Chờ thanh toán' };
        case 'Failed':
          return { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Thất bại' };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon, text: status };
      }
    }
    
    // Fulfillment status
    switch (status) {
      case 'None':
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Chưa xử lý' };
      case 'Processing':
        return { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'Đang xử lý' };
      case 'Shipped':
        return { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Đang vận chuyển' };
      case 'Delivered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Đã giao' };
      case 'Canceled':
        return { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Đã hủy' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon, text: status };
    }
  };

  const config = getStatusConfig(status, type);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

const OrderCard: React.FC<{
  order: Order;
  onViewDetails: (orderId: number) => void;
  onConfirmOrder: (orderId: number) => void;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  isUpdating?: boolean;
}> = ({ order, onViewDetails, onConfirmOrder, onUpdateStatus, isUpdating }) => {
  const canConfirm = order.paymentStatus === 'Paid' && (order.fulfillmentStatus === 'None' || !order.fulfillmentStatus);
  const canShip = order.paymentStatus === 'Paid' && order.fulfillmentStatus === 'Processing';
  const canComplete = order.paymentStatus === 'Paid' && order.fulfillmentStatus === 'Shipped';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Đơn hàng #{order.orderId}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            {new Date(order.orderDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <OrderStatusBadge status={order.fulfillmentStatus} />
      </div>

      {/* Order Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Khách hàng:</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{order.userName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tổng tiền:</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {order.totalPrice.toLocaleString('vi-VN')} VND
          </span>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Địa chỉ:</span>
          </div>
          <span className="text-sm text-gray-900 text-right max-w-xs">
            {order.shippingAddress}
          </span>
        </div>
        {order.personalPhoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Số điện thoại:</span>
            <span className="text-sm font-medium text-gray-900">{order.personalPhoneNumber}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Thanh toán:</span>
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(order.orderId)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Chi tiết
        </button>

        {canConfirm && (
          <button
            onClick={() => onConfirmOrder(order.orderId)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isUpdating ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
          </button>
        )}

        {canShip && (
          <button
            onClick={() => onUpdateStatus(order.orderId, 'Shipped')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TruckIcon className="w-4 h-4" />
            {isUpdating ? 'Đang cập nhật...' : 'Xác nhận vận chuyển'}
          </button>
        )}

        {canComplete && (
          <button
            onClick={() => onUpdateStatus(order.orderId, 'Delivered')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isUpdating ? 'Đang hoàn thành...' : 'Hoàn thành đơn hàng'}
          </button>
        )}
      </div>
    </div>
  );
};

interface SupplierOrdersProps {
  defaultFilter?: 'all' | 'processing' | 'shipped' | 'delivered';
}

const SupplierOrders: React.FC<SupplierOrdersProps> = ({ defaultFilter = 'all' }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>(defaultFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { supplierProfile } = useAuthStore();

  // Không tách chuỗi nữa: đọc trực tiếp order.personalPhoneNumber nếu có

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!supplierProfile?.supplierId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedOrders = await ordersService.getOrdersBySeller(supplierProfile.supplierId);
        setOrders(fetchedOrders || []);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [supplierProfile?.supplierId]);

  // Replace mock data with real data
  const realOrders: Order[] = orders;

  // Filter orders based on selected filter
  const filteredOrders = realOrders.filter(order => {
    if (filter === 'all') return true;
    return order.fulfillmentStatus.toLowerCase() === filter;
  });

  const handleViewDetails = (orderId: number) => {
    const order = realOrders.find(o => o.orderId === orderId);
    setSelectedOrder(order || null);
  };

  const handleConfirmOrder = async (orderId: number) => {
    setIsUpdating(true);
    
    // Optimistic update - immediately update UI
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, fulfillmentStatus: 'Processing', status: 'processing' }
          : order
      )
    );
    
    try {
      // Call API to confirm on server
      await ordersService.updateFulfillmentStatus(orderId, {
        fulfillmentStatus: 'Processing',
        notes: 'Đơn hàng đã được xác nhận bởi người bán'
      });
      
      // Success feedback with toast notification
      toast.success(`✅ Đơn hàng #${orderId} đã được xác nhận thành công!`);
    } catch (error: any) {
      console.error('❌ Error confirming order:', error);
      // Rollback optimistic update on error
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, fulfillmentStatus: 'None', status: 'pending' }
            : order
        )
      );
      
      // More specific error handling
      const errorMsg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác nhận đơn hàng';
      toast.error(`❌ Lỗi xác nhận: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    
    // Optimistic update - immediately update UI
    const statusMapping: Record<string, string> = {
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Processing': 'processing'
    };
    
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, fulfillmentStatus: newStatus, status: statusMapping[newStatus] || 'processing' }
          : order
      )
    );
    
    try {
      if (newStatus === 'Shipped') {
        // Use ship API for better tracking
        await ordersService.markOrderShipped(orderId, {
          carrier: 'Vận chuyển tiêu chuẩn',
          notes: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
        });
      } else if (newStatus === 'Delivered') {
        // Use deliver API to trigger settlement
        await ordersService.markOrderDelivered(orderId);
      } else {
        // For other status updates, use fulfillment status API
        await ordersService.updateFulfillmentStatus(orderId, {
          fulfillmentStatus: newStatus,
          notes: `Cập nhật trạng thái: ${newStatus}`
        });
      }
      
      // Success feedback with toast notifications and status-specific messages
      const statusMessages: Record<string, string> = {
        'Shipped': '🚚 Đơn hàng đã được chuyển cho đơn vị vận chuyển',
        'Delivered': '✅ Đơn hàng đã hoàn thành và kích hoạt thanh toán cho người bán',
        'Processing': '⏳ Đơn hàng đang được xử lý',
      };
      
      const successMsg = statusMessages[newStatus] || `Đơn hàng #${orderId} đã được cập nhật: ${newStatus}`;
      toast.success(successMsg);
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      
      // Rollback optimistic update on error - restore previous state
      if (supplierProfile?.supplierId) {
        const updatedOrders = await ordersService.getOrdersBySeller(supplierProfile.supplierId);
        setOrders(updatedOrders || []);
      }
      
      // More specific error handling
      const errorMsg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng';
      toast.error(`❌ Lỗi cập nhật: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getOrderCounts = () => {
    return {
      all: realOrders.length,
      processing: realOrders.filter(o => o.fulfillmentStatus === 'Processing').length,
      shipped: realOrders.filter(o => o.fulfillmentStatus === 'Shipped').length,
      delivered: realOrders.filter(o => o.fulfillmentStatus === 'Delivered').length,
    };
  };

  const counts = getOrderCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và xử lý các đơn hàng từ khách hàng</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tất cả đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">{counts.processing}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang vận chuyển</p>
                <p className="text-2xl font-bold text-purple-600">{counts.shipped}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã giao</p>
                <p className="text-2xl font-bold text-green-600">{counts.delivered}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Tất cả', count: counts.all },
                { key: 'processing', label: 'Đang xử lý', count: counts.processing },
                { key: 'shipped', label: 'Đang vận chuyển', count: counts.shipped },
                { key: 'delivered', label: 'Đã giao', count: counts.delivered },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải đơn hàng...</span>
          </div>
        )}

        {/* Updating State */}
        {isUpdating && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Đang cập nhật đơn hàng...
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12">
                <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${filter === 'processing' ? 'đang xử lý' : filter === 'shipped' ? 'đang vận chuyển' : 'đã giao'}`}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewDetails={handleViewDetails}
                onConfirmOrder={handleConfirmOrder}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={isUpdating}
              />
            ))
          )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng #{selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={selectedOrder.fulfillmentStatus} />
                <OrderStatusBadge status={selectedOrder.paymentStatus} type="payment" />
              </div>

              {/* Customer & Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-medium">{selectedOrder.userName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="font-medium">{splitAddressPhone(selectedOrder.shippingAddress).address}</span>
                    </div>
                    {splitAddressPhone(selectedOrder.shippingAddress).phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600">SĐT:</span>
                        <span className="font-medium">{splitAddressPhone(selectedOrder.shippingAddress).phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Thông tin đơn hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-semibold text-blue-600">
                        {selectedOrder.totalPrice.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items - This would be populated from API */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    Chi tiết sản phẩm sẽ được hiển thị khi tích hợp với API
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                
                {selectedOrder.paymentStatus === 'Paid' && (selectedOrder.fulfillmentStatus === 'None' || !selectedOrder.fulfillmentStatus) && (
                  <button
                    onClick={() => {
                      handleConfirmOrder(selectedOrder.orderId);
                      setSelectedOrder(null);
                    }}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    Xác nhận đơn hàng
                  </button>
                )}

                {selectedOrder.paymentStatus === 'Paid' && selectedOrder.fulfillmentStatus === 'Processing' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.orderId, 'Shipped');
                      setSelectedOrder(null);
                    }}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Xác nhận vận chuyển
                  </button>
                )}

                {selectedOrder.paymentStatus === 'Paid' && selectedOrder.fulfillmentStatus === 'Shipped' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.orderId, 'Delivered');
                      setSelectedOrder(null);
                    }}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Hoàn thành đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;