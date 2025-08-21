import React, { useState } from 'react';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useGetPendingSettlements } from '../../hooks/useSettlement';
import { useShipmentOrders, useShipmentStatistics, useCompleteOrder } from '../../hooks/useShipmentManagement';

// No more mock data - using real API calls

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Processing':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Đang xử lý' };
      case 'Shipped':
        return { color: 'bg-blue-100 text-blue-800', icon: TruckIcon, text: 'Đang vận chuyển' };
      case 'Delivered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Đã giao' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon, text: status };
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

const OrderCard: React.FC<{
  order: any;
  onViewDetails: (order: any) => void;
  onCompleteOrder: (orderId: number) => void;
  isCompletingOrder?: boolean;
}> = ({ order, onViewDetails, onCompleteOrder, isCompletingOrder }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Đơn hàng #{order.orderId}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.orderDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <OrderStatusBadge status={order.fulfillmentStatus} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Khách hàng:</span>
          <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tổng tiền:</span>
          <span className="text-sm font-semibold text-blue-600">
            {order.totalPrice.toLocaleString('vi-VN')} VND
          </span>
        </div>
        
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-600">Địa chỉ:</span>
          <span className="text-sm text-gray-900 text-right max-w-xs">
            {order.shippingAddress}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Sản phẩm:</p>
        <div className="space-y-1">
          {order.items.map((item: any, index: number) => (
            <p key={index} className="text-sm text-gray-900">
              {item.name} - {item.quantity} {item.unit}
            </p>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Chi tiết
        </button>

        {order.paymentStatus === 'Paid' && order.fulfillmentStatus === 'Processing' && (
          <button
            onClick={() => onCompleteOrder(order.orderId)}
            disabled={isCompletingOrder}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isCompletingOrder ? 'Đang xử lý...' : 'Hoàn thành (Demo)'}
          </button>
        )}
      </div>
    </div>
  );
};

const SettlementCard: React.FC<{ settlement: any }> = ({ settlement }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Chi trả đang chờ</h4>
        <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Đơn hàng:</span>
          <span className="text-sm font-medium">#{settlement.orderId}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tổng tiền:</span>
          <span className="text-sm font-medium text-blue-600">
            {settlement.grossAmount.toLocaleString('vi-VN')} VND
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Hoa hồng (10%):</span>
          <span className="text-sm font-medium text-red-600">
            -{settlement.commissionAmount.toLocaleString('vi-VN')} VND
          </span>
        </div>
        
        <div className="flex justify-between font-semibold">
          <span className="text-sm text-gray-900">Sẽ nhận:</span>
          <span className="text-sm text-green-600">
            {settlement.netAmount.toLocaleString('vi-VN')} VND
          </span>
        </div>
      </div>
    </div>
  );
};

const ShipmentDashboardTailwind: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'settlements'>('orders');

  const { data: orders = [], isLoading: ordersLoading } = useShipmentOrders();
  const { data: statistics } = useShipmentStatistics();
  const { mutateAsync: completeOrder, isPending: isCompleting } = useCompleteOrder();
  const { data: pendingSettlements = [] } = useGetPendingSettlements();

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await completeOrder(orderId);
      // Refresh the orders list or update UI as needed
    } catch (error) {
      console.error('Complete order error:', error);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const stats = statistics || {
    total: orders.length,
    pending: orders.filter((o: any) => o.fulfillmentStatus === 'None' || o.fulfillmentStatus === 'Processing').length,
    processing: orders.filter((o: any) => o.fulfillmentStatus === 'Processing').length,
    shipped: orders.filter((o: any) => o.fulfillmentStatus === 'Shipped').length,
    delivered: orders.filter((o: any) => o.fulfillmentStatus === 'Delivered').length,
    cancelled: orders.filter((o: any) => o.fulfillmentStatus === 'Canceled').length,
    pendingSettlements: pendingSettlements.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý vận chuyển</h1>
          <p className="text-gray-600">Theo dõi và quản lý các đơn hàng, vận chuyển và chi trả</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang vận chuyển</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã giao</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ chi trả</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pendingSettlements}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đơn hàng
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'settlements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chi trả ({pendingSettlements.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ordersLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải đơn hàng...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
                <p className="text-gray-600">Các đơn hàng cần vận chuyển sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <OrderCard
                  key={order.orderId}
                  order={{
                    ...order,
                    orderDate: order.orderDate,
                    customerName: order.userName,
                    fulfillmentStatus: order.fulfillmentStatus,
                    items: [{ name: 'Sản phẩm trong đơn hàng', quantity: 1, unit: 'đơn vị' }] // Simplified for demo
                  }}
                  onViewDetails={handleViewDetails}
                  onCompleteOrder={handleCompleteOrder}
                  isCompletingOrder={isCompleting}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSettlements.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có chi trả nào đang chờ</h3>
                <p className="text-gray-600">Các khoản chi trả sẽ xuất hiện ở đây sau khi đơn hàng được hoàn thành</p>
              </div>
            ) : (
              pendingSettlements.map((settlement: any, index: number) => (
                <SettlementCard key={index} settlement={settlement} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin đơn hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Ngày đặt:</span> {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}</p>
                    <p><span className="text-gray-600">Trạng thái:</span> <OrderStatusBadge status={selectedOrder.fulfillmentStatus} /></p>
                    <p><span className="text-gray-600">Tổng tiền:</span> <span className="font-semibold text-blue-600">{selectedOrder.totalPrice.toLocaleString('vi-VN')} VND</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Tên:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-gray-600">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Sản phẩm</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {selectedOrder.paymentStatus === 'Paid' && selectedOrder.fulfillmentStatus === 'Processing' && (
                  <button
                    onClick={() => {
                      handleCompleteOrder(selectedOrder.orderId);
                      setSelectedOrder(null);
                    }}
                    disabled={isCompleting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Hoàn thành (Demo)
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

export default ShipmentDashboardTailwind;