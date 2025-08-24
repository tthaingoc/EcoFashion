import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  TruckIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';

// Trang xác nhận giỏ hàng trước khi tạo đơn hàng - sử dụng Tailwind CSS
const CheckoutConfirmTailwind: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  
  // State quản lý các sản phẩm được chọn để checkout
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    // Lấy danh sách sản phẩm đã chọn từ localStorage
    const savedSelection = localStorage.getItem('selectedItemsForCheckout');
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        // Chỉ giữ lại những item có trong cart hiện tại
        return Array.isArray(parsed) ? parsed.filter(id => items.some(item => item.id === id)) : items.map(item => item.id);
      } catch {
        return items.map(item => item.id); // Fallback nếu parse lỗi
      }
    }
    return items.map(item => item.id); // Mặc định chọn tất cả nếu không có dữ liệu
  });

  // Xóa dữ liệu localStorage cũ chỉ khi component mount (không phải unmount)
  useEffect(() => {
    // Chỉ xóa nếu đây là lần load mới mà không có dữ liệu từ cart
    const savedSelection = localStorage.getItem('selectedItemsForCheckout');
    if (!savedSelection) {
      // Nếu không có dữ liệu từ cart thì có thể là load trực tiếp, không làm gì
    }
  }, []);

  // Nhóm sản phẩm theo seller/provider
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach((item) => {
      if (!groups[item.sellerId]) groups[item.sellerId] = [];
      groups[item.sellerId].push(item);
    });
    return groups;
  }, [items]);

  // Tính tổng tiền cho các sản phẩm đã chọn
  const selectedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items, selectedItems]);

  const formatVND = (amount: number) => 
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  // Toggle chọn/bỏ chọn một sản phẩm
  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Toggle chọn/bỏ chọn tất cả sản phẩm của một seller
  const toggleSelectGroup = (sellerId: string) => {
    const groupItemIds = groupedItems[sellerId].map(item => item.id);
    const allSelected = groupItemIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !groupItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...groupItemIds])]);
    }
  };

  // Chọn/bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  // Xác nhận và chuyển đến checkout
  const proceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }
    
    console.log('Saving selectedItems to localStorage:', selectedItems);
    
    // Lưu danh sách sản phẩm được chọn vào localStorage hoặc store
    localStorage.setItem('selectedItemsForCheckout', JSON.stringify(selectedItems));
    
    // Verify the save
    const saved = localStorage.getItem('selectedItemsForCheckout');
    console.log('Verified localStorage save:', saved);
    
    // Chuyển đến trang checkout thực tế
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCartIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
          <button 
            onClick={() => navigate('/fashion')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Xác nhận đơn hàng</h1>
              <p className="text-gray-600 mt-1">
                Xem lại và chọn sản phẩm bạn muốn thanh toán
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-600 font-medium">Giỏ hàng</span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="text-blue-600 font-medium">Xác nhận</span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              <div className="flex items-center">
                <CreditCardIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-400">Thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              
              {/* Header với checkbox chọn tất cả */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-lg font-semibold text-gray-900">
                      Sản phẩm ({items.length})
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">
                    Đã chọn: {selectedItems.length}/{items.length}
                  </span>
                </div>
              </div>

              {/* Danh sách nhóm sản phẩm theo seller */}
              {Object.entries(groupedItems).map(([sellerId, sellerItems]) => {
                const sellerName = sellerItems[0]?.sellerName || `Nhà cung cấp ${sellerId.slice(0, 8)}`;
                const groupTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const groupSelected = sellerItems.filter(item => selectedItems.includes(item.id));
                
                return (
                  <div key={sellerId} className="border-b border-gray-200 last:border-b-0">
                    
                    {/* Seller Header */}
                    <div className="p-4 bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={sellerItems.every(item => selectedItems.includes(item.id))}
                            onChange={() => toggleSelectGroup(sellerId)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <BuildingStorefrontIcon className="w-5 h-5 text-green-600 ml-3 mr-2" />
                          <span className="font-semibold text-gray-900">{sellerName}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Tạm tính: </span>
                          <span className="font-semibold text-green-600">{formatVND(groupTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Items */}
                    {sellerItems.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-center space-x-4">
                          
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image || '/placeholder-image.jpg'} 
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {item.type}
                              </span>
                              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                ĐVT: {item.unit}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{item.sellerName}</p>
                          </div>
                          
                          {/* Price & Quantity */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatVND(item.price)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Total & Remove */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-lg font-bold text-red-600">
                                {formatVND(item.price * item.quantity)}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Xóa sản phẩm"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sản phẩm đã chọn:</span>
                  <span className="font-semibold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{formatVND(selectedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">Tổng cộng:</span>
                    <span className="font-bold text-red-600">{formatVND(selectedTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={proceedToCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp tục thanh toán ({selectedItems.length} sản phẩm)
                </button>
                
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Quay lại giỏ hàng
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <TruckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-800 mb-1">Miễn phí vận chuyển</div>
                    <div className="text-blue-700">
                      Đơn hàng của bạn sẽ được giao miễn phí trong vòng 2-3 ngày làm việc
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmTailwind;