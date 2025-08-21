import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type OrderModel } from '../../services/api/ordersService';
import { formatViDateTime } from '../../utils/date';
import { useOrders, useFilteredOrders, useRefreshOrders } from '../../hooks/useOrders';

const formatVND = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

interface OrderTab {
  key: string;
  label: string;
  count: number;
  filter: (order: OrderModel) => boolean;
}

const getStatusBadge = (status: string, variant: 'payment' | 'fulfillment' = 'fulfillment') => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  
  if (variant === 'payment') {
    switch (status?.toLowerCase()) {
      case 'paid': return `${baseClasses} bg-green-100 text-green-700`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-700`;
      default: return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  }
  
  // Fulfillment status
  switch (status?.toLowerCase()) {
    case 'delivered': return `${baseClasses} bg-green-100 text-green-700`;
    case 'shipped': return `${baseClasses} bg-blue-100 text-blue-700`;
    case 'processing': return `${baseClasses} bg-yellow-100 text-yellow-700`;
    case 'canceled': return `${baseClasses} bg-red-100 text-red-700`;
    case 'none':
    default: return `${baseClasses} bg-gray-100 text-gray-700`;
  }
};

const getPaymentStatusText = (paymentStatus?: string) => {
  switch (paymentStatus?.toLowerCase()) {
    case 'paid':
      return '✅ Đã thanh toán';
    case 'pending':
      return '⏳ Chờ thanh toán';
    case 'failed':
      return '❌ Thanh toán thất bại';
    case 'expired':
      return '⏰ Hết hạn thanh toán';
    default:
      return '⏳ Chờ thanh toán';
  }
};

const getStatusLabel = (paymentStatus?: string, fulfillmentStatus?: string, orderStatus?: string) => {
  // Priority logic based on the implementation guide
  if (paymentStatus?.toLowerCase() === 'pending') {
    return { main: '⏳ Chờ thanh toán', sub: 'Chưa thanh toán' };
  }
  
  if (paymentStatus?.toLowerCase() === 'paid') {
    switch (fulfillmentStatus?.toLowerCase()) {
      case 'delivered':
        return { main: '✅ Đã giao hàng', sub: 'Hoàn thành' };
      case 'shipped':
        return { main: '🚚 Đang vận chuyển', sub: 'Chờ giao hàng' };
      case 'processing':
        return { main: '📦 Đang xử lý', sub: 'Chuẩn bị hàng' };
      case 'canceled':
        return { main: '❌ Đã hủy', sub: 'Đơn hàng bị hủy' };
      case 'none':
      default:
        return { main: '📦 Đang xử lý', sub: 'Đã thanh toán' };
    }
  }
  
  if (orderStatus?.toLowerCase() === 'cancelled') {
    return { main: '❌ Đã hủy', sub: 'Đơn hàng bị hủy' };
  }
  
  return { main: '⏳ Chờ xử lý', sub: 'Đang xử lý' };
};

export default function OrderTabsContainer() {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  
  const { data: orders = [], isLoading: loading, error, refetch } = useOrders();
  const filteredOrdersData = useFilteredOrders(orders);
  const refreshOrders = useRefreshOrders();

  // Define order tabs following Shopee pattern
  const orderTabs: OrderTab[] = [
    {
      key: 'all',
      label: 'Tất cả',
      count: filteredOrdersData.all.length,
      filter: () => true
    },
    {
      key: 'pending_payment',
      label: 'Chờ thanh toán',
      count: filteredOrdersData.pendingPayment.length,
      filter: (order) => order.paymentStatus?.toLowerCase() === 'pending'
    },
    {
      key: 'shipping',
      label: 'Vận chuyển',
      count: filteredOrdersData.shipping.length,
      filter: (order) => 
        order.paymentStatus?.toLowerCase() === 'paid' && 
        ['processing', 'shipped', 'none'].includes(order.fulfillmentStatus?.toLowerCase() || 'none')
    },
    {
      key: 'awaiting_delivery',
      label: 'Chờ giao hàng',
      count: filteredOrdersData.awaitingDelivery.length,
      filter: (order) => order.fulfillmentStatus?.toLowerCase() === 'shipped'
    },
    {
      key: 'completed',
      label: 'Hoàn thành',
      count: filteredOrdersData.completed.length,
      filter: (order) => order.fulfillmentStatus?.toLowerCase() === 'delivered'
    },
    {
      key: 'cancelled',
      label: 'Đã hủy',
      count: filteredOrdersData.cancelled.length,
      filter: (order) => 
        order.status?.toLowerCase() === 'cancelled' || 
        order.fulfillmentStatus?.toLowerCase() === 'canceled'
    }
  ];

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending_payment': return filteredOrdersData.pendingPayment;
      case 'shipping': return filteredOrdersData.shipping;
      case 'awaiting_delivery': return filteredOrdersData.awaitingDelivery;
      case 'completed': return filteredOrdersData.completed;
      case 'cancelled': return filteredOrdersData.cancelled;
      default: return filteredOrdersData.all;
    }
  };

  const filteredOrders = getFilteredOrders();
  const activeTabData = orderTabs.find(tab => tab.key === activeTab) || orderTabs[0];

  if (loading) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-8 text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error?.message || 'Đã xảy ra lỗi'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {orderTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.key
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  ml-2 px-2 py-0.5 text-xs rounded-full
                  ${activeTab === tab.key
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800">
            {activeTabData.label} ({filteredOrders.length})
          </h3>
          <button
            onClick={() => {
              refetch();
              refreshOrders();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span>
            Làm mới
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <p className="text-gray-600 text-lg mb-2">Chưa có đơn hàng nào</p>
          <p className="text-gray-500 text-sm">
            {activeTab === 'all' 
              ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
              : `Không có đơn hàng nào ở trạng thái "${activeTabData.label}"`
            }
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusLabel(order.paymentStatus, order.fulfillmentStatus, order.status);
            return (
              <div
                key={order.orderId}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/orders/${order.orderId}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-gray-800">
                      #{order.orderId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.orderDate ? formatViDateTime(order.orderDate) : '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatVND(Number(order.totalPrice || 0))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {order.sellerAvatarUrl ? (
                      <img 
                        src={order.sellerAvatarUrl} 
                        alt="seller" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">👤</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {order.sellerName || 'Người bán'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.sellerType === 'Supplier' ? 'Nhà cung cấp' : 'Nhà thiết kế'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={getStatusBadge(order.paymentStatus || 'pending', 'payment')}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                    <span className={getStatusBadge(order.fulfillmentStatus || 'none')}>
                      {statusInfo.main}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {statusInfo.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}