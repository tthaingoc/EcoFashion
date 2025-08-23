import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { ordersService, OrderProgressModel, SellerProgress, OrderTimelineEvent } from '../../services/api/ordersService';

interface OrderProgressModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const StatusIcon: React.FC<{ status: string; className?: string }> = ({ status, className = "w-5 h-5" }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <ClockIcon className={`${className} text-gray-500`} />;
    case 'confirmed':
    case 'processing':
      return <CheckCircleIcon className={`${className} text-blue-500`} />;
    case 'shipping':
    case 'shipped':
    case 'partiallyshipped':
      return <TruckIcon className={`${className} text-purple-500`} />;
    case 'delivered':
      return <CheckCircleIcon className={`${className} text-green-500`} />;
    default:
      return <ClockIcon className={`${className} text-gray-500`} />;
  }
};

const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ 
  progress, 
  color = "bg-blue-500" 
}) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className={`${color} h-2 rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(progress, 100)}%` }}
    />
  </div>
);

const SellerProgressCard: React.FC<{ seller: SellerProgress }> = ({ seller }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {seller.avatarUrl ? (
          <img src={seller.avatarUrl} alt={seller.sellerName} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm text-blue-600 font-medium">{seller.sellerName[0]}</span>
          </div>
        )}
        <div>
          <div className="font-medium text-gray-900">{seller.sellerName}</div>
          <div className="text-sm text-gray-500">{seller.sellerType}</div>
        </div>
      </div>
      <StatusIcon status={seller.status} />
    </div>

    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Tiến độ: {seller.confirmedItems}/{seller.totalItems} items</span>
        <span>{Math.round(seller.progress)}%</span>
      </div>
      <ProgressBar 
        progress={seller.progress} 
        color={seller.progress === 100 ? "bg-green-500" : "bg-amber-500"} 
      />
    </div>

    <div className="space-y-2">
      {seller.items.map((item) => (
        <div key={item.orderDetailId} className="flex items-center gap-2 text-sm">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.itemName} className="w-6 h-6 object-cover rounded" />
          ) : (
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="flex-1 text-gray-900">{item.itemName}</span>
          <span className="text-gray-500">x{item.quantity}</span>
          <StatusIcon status={item.status} className="w-4 h-4" />
        </div>
      ))}
    </div>
  </div>
);

const TimelineEvent: React.FC<{ event: OrderTimelineEvent; isLast: boolean }> = ({ 
  event, 
  isLast 
}) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        event.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        <StatusIcon 
          status={event.eventType} 
          className={`w-4 h-4 ${
            event.status === 'completed' ? 'text-green-600' : 'text-gray-400'
          }`} 
        />
      </div>
      {!isLast && <div className="w-0.5 h-6 bg-gray-200 mt-2" />}
    </div>
    
    <div className="flex-1 min-w-0 pb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
        <span className="text-xs text-gray-500">
          {new Date(event.eventDate).toLocaleDateString('vi-VN')}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
      {event.sellerName && (
        <p className="text-xs text-gray-500 mt-1">bởi {event.sellerName}</p>
      )}
    </div>
  </div>
);

const OrderProgressModal: React.FC<OrderProgressModalProps> = ({
  orderId,
  isOpen,
  onClose
}) => {
  const [orderProgress, setOrderProgress] = useState<OrderProgressModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderProgress();
    }
  }, [isOpen, orderId]);

  const fetchOrderProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersService.getOrderProgress(orderId);
      setOrderProgress(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Chi tiết đơn hàng #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchOrderProgress}
                  className="mt-2 text-red-600 underline hover:text-red-800"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {orderProgress && (
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Khách hàng:</span>
                    <span className="text-sm font-medium text-gray-900">{orderProgress.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Ngày đặt:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(orderProgress.orderDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {orderProgress.totalPrice.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trạng thái thanh toán:</span>
                    <span className={`text-sm font-medium ${
                      orderProgress.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {orderProgress.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tổng quan tiến độ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{orderProgress.confirmationProgress}%</div>
                      <div className="text-sm text-gray-600 mt-1">Xác nhận</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {orderProgress.confirmedItems}/{orderProgress.totalItems} items
                      </div>
                    </div>
                    <ProgressBar progress={orderProgress.confirmationProgress} color="bg-amber-500" />
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{orderProgress.shippingProgress}%</div>
                      <div className="text-sm text-gray-600 mt-1">Vận chuyển</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {orderProgress.shippedItems}/{orderProgress.totalItems} items
                      </div>
                    </div>
                    <ProgressBar progress={orderProgress.shippingProgress} color="bg-purple-500" />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{orderProgress.deliveryProgress}%</div>
                      <div className="text-sm text-gray-600 mt-1">Giao hàng</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {orderProgress.deliveredItems}/{orderProgress.totalItems} items
                      </div>
                    </div>
                    <ProgressBar progress={orderProgress.deliveryProgress} color="bg-green-500" />
                  </div>
                </div>
              </div>

              {/* Seller Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Tiến độ từng nhà bán ({orderProgress.sellerProgressList.length})
                </h3>
                <div className="grid gap-4">
                  {orderProgress.sellerProgressList.map((seller) => (
                    <SellerProgressCard key={seller.sellerId} seller={seller} />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              {orderProgress.timeline.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Lịch sử đơn hàng</h3>
                  <div className="space-y-4">
                    {orderProgress.timeline.map((event, index) => (
                      <TimelineEvent
                        key={`${event.eventDate}-${index}`}
                        event={event}
                        isLast={index === orderProgress.timeline.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated Dates */}
              {(orderProgress.estimatedShippingDate || orderProgress.estimatedDeliveryDate) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Thời gian dự kiến</h4>
                  <div className="space-y-1 text-sm">
                    {orderProgress.estimatedShippingDate && (
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">
                          Gửi hàng: {new Date(orderProgress.estimatedShippingDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {orderProgress.estimatedDeliveryDate && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">
                          Giao hàng: {new Date(orderProgress.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            {orderProgress && (
              <button
                onClick={fetchOrderProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Làm mới
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProgressModal;