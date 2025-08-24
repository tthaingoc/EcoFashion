import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { 
  ordersService, 
  OrderSellerViewModel, 
  UpdateOrderDetailStatusRequest, 
  BulkConfirmRequest 
} from '../../services/api/ordersService';
import { useAuthStore } from '../../store/authStore';
import PartialOrderCard from '../../components/orders/PartialOrderCard';

interface SupplierOrdersPartialProps {
  defaultFilter?: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

const SupplierOrdersPartial: React.FC<SupplierOrdersPartialProps> = ({ defaultFilter = 'all' }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderSellerViewModel | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>(defaultFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orders, setOrders] = useState<OrderSellerViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { supplierProfile } = useAuthStore();

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!supplierProfile?.supplierId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all orders that contain items from this supplier
        const allOrders = await ordersService.getOrdersBySeller(supplierProfile.supplierId);
        
        // For each order, get the detailed seller view
        const detailedOrders = await Promise.all(
          allOrders.map(async (order) => {
            try {
              return await ordersService.getOrderSellerView(order.orderId, supplierProfile.supplierId);
            } catch (error) {
              console.error(`Error fetching seller view for order ${order.orderId}:`, error);
              return null;
            }
          })
        );

        // Filter out null results and set orders
        const validOrders = detailedOrders.filter((order): order is OrderSellerViewModel => order !== null);
        setOrders(validOrders);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [supplierProfile?.supplierId]);

  // Filter orders based on their overall status
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    
    // Map filter to fulfillment status
    const statusMap = {
      'pending': ['None', 'PartiallyConfirmed'],
      'confirmed': ['Processing'],
      'shipped': ['Shipped', 'PartiallyShipped'],
      'delivered': ['Delivered']
    };
    
    return statusMap[filter]?.includes(order.fulfillmentStatus);
  });

  const handleViewDetails = (orderId: number) => {
    const order = orders.find(o => o.orderId === orderId);
    setSelectedOrder(order || null);
  };

  const handleConfirmAllItems = async (orderId: number) => {
    if (!supplierProfile?.supplierId) return;
    
    setIsUpdating(true);
    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return;

      // Get pending item IDs
      const pendingItemIds = order.sellerItems
        .filter(item => item.status === 'pending')
        .map(item => item.orderDetailId);

      if (pendingItemIds.length === 0) {
        alert('Không có items nào cần xác nhận');
        return;
      }

      const request: BulkConfirmRequest = {
        notes: 'Xác nhận tất cả items của supplier',
        orderDetailIds: pendingItemIds
      };
      
      await ordersService.confirmAllSellerItems(orderId, supplierProfile.supplierId, request);
      
      // Refresh orders
      await refreshOrders();
      
      alert(`Đã xác nhận ${pendingItemIds.length} items trong đơn hàng #${orderId}`);
    } catch (error: any) {
      console.error('Error confirming all items:', error);
      alert(error.message || 'Có lỗi xảy ra khi xác nhận items');
    } finally {
      setIsUpdating(false);
    }
  };

  // Ẩn xác nhận từng item: giữ lại luồng "Xác nhận tất cả items"
  const handleConfirmItem = async (_orderDetailId: number) => {
    // no-op
  };

  const handleShipItem = async (_orderDetailId: number) => {
    // no-op (ẩn gửi hàng từng item ở trang này)
  };

  const refreshOrders = async () => {
    if (!supplierProfile?.supplierId) return;
    
    try {
      const allOrders = await ordersService.getOrdersBySeller(supplierProfile.supplierId);
      const detailedOrders = await Promise.all(
        allOrders.map(async (order) => {
          try {
            return await ordersService.getOrderSellerView(order.orderId, supplierProfile.supplierId);
          } catch (error) {
            console.error(`Error fetching seller view for order ${order.orderId}:`, error);
            return null;
          }
        })
      );

      const validOrders = detailedOrders.filter((order): order is OrderSellerViewModel => order !== null);
      setOrders(validOrders);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
    };

    orders.forEach(order => {
      switch (order.fulfillmentStatus) {
        case 'None':
        case 'PartiallyConfirmed':
          counts.pending++;
          break;
        case 'Processing':
          counts.confirmed++;
          break;
        case 'Shipped':
        case 'PartiallyShipped':
          counts.shipped++;
          break;
        case 'Delivered':
          counts.delivered++;
          break;
      }
    });

    return counts;
  };

  const counts = getOrderCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng (Partial Fulfillment)</h1>
          <p className="text-gray-600">Quản lý từng items trong đơn hàng mixed và single</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">{counts.confirmed}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
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
                { key: 'pending', label: 'Chờ xác nhận', count: counts.pending },
                { key: 'confirmed', label: 'Đã xác nhận', count: counts.confirmed },
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
            Đang cập nhật trạng thái...
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
                <p className="text-gray-600">
                  {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${filter === 'pending' ? 'chờ xác nhận' : filter === 'confirmed' ? 'đã xác nhận' : filter === 'shipped' ? 'đang vận chuyển' : 'đã giao'}`}
                </p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <PartialOrderCard
                  key={order.orderId}
                  orderData={order}
                  onViewDetails={handleViewDetails}
                  onConfirmAllItems={handleConfirmAllItems}
                  onConfirmItem={handleConfirmItem}
                  onShipItem={handleShipItem}
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
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
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
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin đơn hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Ngày đặt:</span> {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}</p>
                    <p><span className="text-gray-600">Trạng thái:</span> {selectedOrder.fulfillmentStatus}</p>
                    <p><span className="text-gray-600">Tổng tiền:</span> <span className="font-semibold text-blue-600">{selectedOrder.totalPrice.toLocaleString('vi-VN')} VND</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Tên:</span> {selectedOrder.userName}</p>
                    <p><span className="text-gray-600">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tiến độ của bạn</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Items của bạn:</span> {selectedOrder.sellerItemsCount}/{selectedOrder.totalItemsInOrder}</p>
                    <p><span className="text-gray-600">Đã xác nhận:</span> {selectedOrder.confirmedSellerItems}/{selectedOrder.sellerItemsCount}</p>
                  </div>
                </div>
              </div>

              {/* Seller Items Detail */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Items của bạn</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.sellerItems.map(item => (
                    <div key={item.orderDetailId} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-gray-500">
                          {item.itemType} • x{item.quantity} • {item.unitPrice.toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          item.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.status}
                        </span>
                        {/* Ẩn nút xác nhận/gửi hàng từng item trong modal ở trang này */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Sellers Info */}
              {selectedOrder.otherSellers.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sellers khác trong đơn hàng</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    {selectedOrder.otherSellers.map((seller, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          {seller.avatarUrl ? (
                            <img src={seller.avatarUrl} alt={seller.sellerName} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-sm text-blue-600">{seller.sellerName[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-blue-900">{seller.sellerName}</div>
                            <div className="text-sm text-blue-700">{seller.sellerType}</div>
                          </div>
                        </div>
                        <div className="text-sm text-blue-800">
                          {seller.confirmedItems}/{seller.itemCount} items {seller.allItemsConfirmed ? '✅' : '⏳'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrdersPartial;