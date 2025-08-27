import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
 CreditCardIcon,
 BanknotesIcon,
 ShoppingCartIcon,
 TruckIcon,
 CheckCircleIcon,
 ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCheckoutWizard } from '../../store/checkoutWizardStore';
import { useWalletBalance } from '../../hooks/useWalletQueries';
import { usePayOrderWithWallet, usePayGroupWithWallet, useCheckWalletBalance } from '../../hooks/useWalletCheckout';
import { checkoutService } from '../../services/api/checkoutService';
import { ordersService } from '../../services/api/ordersService';
import AddressSelectorTailwind from '../../components/checkout/AddressSelectorTailwind';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'react-toastify';




// Interface định nghĩa phương thức thanh toán cho Standard Checkout
interface PaymentMethod {
 id: 'wallet'; // Chỉ hỗ trợ thanh toán bằng ví điện tử
 name: string;
 description: string;
 icon: React.ComponentType<any>;
 available: boolean;
}




// Component trang Standard Checkout - xử lý thanh toán chuẩn theo cách truyền thống
const CheckoutTailwind: React.FC = () => {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet'>('wallet'); // Phương thức thanh toán đã chọn
 const [selectedAddress, setSelectedAddress] = useState<any>(null); // Địa chỉ giao hàng đã chọn
 const [isProcessing, setIsProcessing] = useState(false); // Trạng thái đang xử lý
 const bootstrapExecuted = useRef(false); // Kiểm soát chỉ chạy bootstrap một lần
 const [walletBalanceCheck, setWalletBalanceCheck] = useState<{
   sufficient: boolean;
   shortfall: number;
 } | null>(null);
 const [selectedCartItems, setSelectedCartItems] = useState<any[]>([]); // Lưu sản phẩm đã chọn
 const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền đã chọn

 // Sinh và lưu idempotencyKey để backend reuse order nếu người dùng bấm lại
 const [idempotencyKey] = useState<string>(() => {
   const existing = sessionStorage.getItem('checkoutIdempotencyKey');
   if (existing) return existing;
   const gen = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
     ? (crypto as any).randomUUID()
     : `${Date.now()}-${Math.random()}`;
   sessionStorage.setItem('checkoutIdempotencyKey', gen);
   return gen;
 });




 const wizard = useCheckoutWizard(); // Store quản lý wizard checkout
 const currentOrder = wizard.orders[wizard.currentIndex]; // Đơn hàng hiện tại trong wizard
 const { data: walletBalance = 0 } = useWalletBalance(); // Số dư ví điện tử
 const { mutateAsync: payWithWallet } = usePayOrderWithWallet(); // Hook thanh toán đơn lẻ
 const { mutateAsync: payGroupWithWallet } = usePayGroupWithWallet(); // Hook thanh toán nhóm
 const { mutateAsync: checkBalance } = useCheckWalletBalance(); // Hook kiểm tra số dư
 const cartItems = useCartStore((s) => s.items); // Lấy items từ cart store




 // Tính orderTotal từ wizard.orders (sau khi backend pre-split) hoặc fallback về totalAmount
 const orderTotal = wizard.orders.length > 0 
   ? wizard.orders.reduce((sum, order) => sum + order.totalAmount, 0)
   : totalAmount;




 const paymentMethods: PaymentMethod[] = [
   {
     id: 'wallet',
     name: 'Ví điện tử',
     description: `Thanh toán bằng số dư ví (${walletBalance.toLocaleString('vi-VN')} VND)`,
     icon: BanknotesIcon,
     available: true, // Always show wallet option
   },
 ];




 useEffect(() => {
   if (currentOrder) {
     checkWalletBalance();
   }
 }, [currentOrder]);




 // Khi tổng tiền thay đổi, kiểm tra lại số dư ví để cập nhật cảnh báo/disable nút
 useEffect(() => {
   if (orderTotal > 0) {
     checkWalletBalance();
   }
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orderTotal]);




 // Bootstrap: tạo session checkout chỉ cho các sản phẩm đã được chọn từ trang confirm
 useEffect(() => {
   const bootstrap = async () => {
     if (bootstrapExecuted.current) return;
     bootstrapExecuted.current = true;
     
     try {
       setIsProcessing(true);
       
       // Kiểm tra nếu có orderId để thanh toán đơn hàng có sẵn
       const existingOrderId = searchParams.get('orderId');
       if (existingOrderId) {
         // Đối với đơn hàng có sẵn, tải dữ liệu đơn hàng
         const orderData = await ordersService.getById(parseInt(existingOrderId));
         const order = (orderData as any)?.result || orderData;
         
         const resp = {
           orderGroupId: `existing-${existingOrderId}`,
           orders: [{
             orderId: order.orderId,
             subtotal: order.subtotal || 0,
             shippingFee: order.shippingFee || 0,
             discount: order.discount || 0,
             totalAmount: order.totalPrice || 0,
             paymentStatus: order.paymentStatus || 'Pending'
           }],
           expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 phút từ bây giờ
         };
         wizard.start({
             ...resp,
             orderIds: resp.orders.map((o: any) => o.orderId),
             totalOrderCount: resp.orders.length,
             totalAmount: resp.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
           });

       } else {
         // Flow thông thường: kiểm tra có danh sách sản phẩm đã chọn không
         const selectedItemsStr = localStorage.getItem('selectedItemsForCheckout');
         console.log('CheckoutTailwind bootstrap - selectedItemsStr:', selectedItemsStr);
         
         if (!selectedItemsStr) {
           // Nếu không có sản phẩm đã chọn, quay về trang xác nhận
           console.log('No selectedItemsForCheckout found, redirecting to /checkout/confirm');
           navigate('/checkout/confirm');
           return;
         }
         
         // Parse danh sách ID sản phẩm đã chọn
         let selectedItemIds: string[] = [];
         try {
           selectedItemIds = JSON.parse(selectedItemsStr);
         } catch (error) {
           console.error('Error parsing selectedItemsForCheckout:', error);
           navigate('/checkout/confirm');
           return;
         }
         
         // Lọc các items đã chọn từ cartItems
         const filteredCartItems = cartItems.filter(item => selectedItemIds.includes(item.id));
         console.log('Selected cart items:', filteredCartItems);
         
         if (filteredCartItems.length === 0) {
           console.log('No valid selected items found');
           navigate('/checkout/confirm');
           return;
         }
         
         // Convert cart items thành format API và tạo session ngay
         const cartItemsDto = filteredCartItems.map(item => {
           console.log('Converting item for session:', item);
           
           if (item.type === 'material') {
             if (!item.materialId) {
               throw new Error(`Material item ${item.id} missing materialId`);
             }
             return {
               itemType: 'material' as const,
               materialId: item.materialId,
               quantity: item.quantity,
               unitPrice: item.price
             };
           } else if (item.type === 'product') {
             if (!item.productId) {
               throw new Error(`Product item ${item.id} missing productId`);
             }
             return {
               itemType: 'product' as const,
               productId: item.productId,
               quantity: item.quantity,
               unitPrice: item.price
             };
           } else {
             // design - sử dụng productId vì design được chuyển thành product
             if (!item.productId) {
               throw new Error(`Design item ${item.id} missing productId`);
             }
             return {
               itemType: 'design' as const,
               designId: item.productId, // Design sử dụng productId
               quantity: item.quantity,
               unitPrice: item.price
             };
           }
         });
         
         // Tạo session với backend để pre-split orders theo seller
         console.log('Creating session with items:', cartItemsDto);
         const sessionResp = await checkoutService.createSession({
           items: cartItemsDto,
           shippingAddress: 'temp', // Sẽ được cập nhật khi chọn địa chỉ
           idempotencyKey, // Gửi idempotency key để tránh tạo trùng
         });
         
         console.log('Session created:', sessionResp);
         
         // Khởi tạo wizard với response từ backend
         wizard.start(sessionResp);
         
         // Lưu selected items để hiển thị
         setSelectedCartItems(filteredCartItems);
         
         // Sử dụng totalAmount từ backend thay vì tính lại
         setTotalAmount(sessionResp.totalAmount || sessionResp.orders.reduce((sum, order) => sum + order.totalAmount, 0));
         
         // LƯU ORDERIDS VÀO SESSION STORAGE cho việc thanh toán
         if (sessionResp.orderIds && sessionResp.orderIds.length > 0) {
           sessionStorage.setItem('checkoutOrderIds', JSON.stringify(sessionResp.orderIds));
           sessionStorage.setItem('checkoutOrderGroupId', sessionResp.orderGroupId);
           console.log('Saved orderIds to session:', sessionResp.orderIds);
           console.log('Saved orderGroupId to session:', sessionResp.orderGroupId);
         }
         
         // Xóa danh sách đã chọn sau khi load xong
         localStorage.removeItem('selectedItemsForCheckout');
       }
     } catch (e) {
       // Xử lý lỗi: hiển thị thông báo hoặc quay về trang trước
       console.warn('createSessionFromCart failed:', e);
       // Có thể chuyển hướng về trang confirm nếu tạo session thất bại
       navigate('/checkout/confirm');
     } finally {
       setIsProcessing(false);
     }
   };




   // Chỉ chạy bootstrap một lần để load dữ liệu sản phẩm
   if (!bootstrapExecuted.current && !isProcessing) {
     bootstrap();
   }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);




 const checkWalletBalance = async () => {
   try {
     const result = await checkBalance(orderTotal);
     setWalletBalanceCheck({
       sufficient: result.sufficient,
       shortfall: result.shortfall,
     });
   } catch (error) {
     console.error('Balance check error:', error);
   }
 };




 const handlePayment = async () => {
   if (!wizard.orderGroupId || wizard.orders.length === 0) {
     toast.error('Không tìm thấy đơn hàng để thanh toán');
     return;
   }

   if (!selectedAddress) {
     toast.error('Vui lòng chọn địa chỉ giao hàng');
     return;
   }

   // Chặn thanh toán khi số dư ví không đủ
   if (walletBalance < orderTotal) {
     toast.error('Số dư ví không đủ, vui lòng nạp tiền trước khi thanh toán');
     navigate('/wallet');
     return;
   }

   setIsProcessing(true);

   try {
     console.log('Paying for order group:', wizard.orderGroupId);
     console.log('Orders in group:', wizard.orders);
     
     // Thanh toán nhóm đơn hàng
     const addressId = selectedAddress?.addressId;
     if (!addressId) throw new Error('Không có addressId');
     
     await payGroupWithWallet({ orderGroupId: wizard.orderGroupId, addressId });
     
     // Thanh toán thành công thì clear các keys liên quan
     sessionStorage.removeItem('checkoutIdempotencyKey');
     sessionStorage.removeItem('checkoutOrderIds');
     sessionStorage.removeItem('checkoutOrderGroupId');
     
     // Chuyển đến trang kết quả với orderGroupId
     navigate(`/checkout/result?orderGroupId=${wizard.orderGroupId}&paymentMethod=wallet&status=success`);
     
   } catch (error) {
     console.error('Payment error:', error);
     toast.error('Lỗi trong quá trình thanh toán');
   } finally {
     setIsProcessing(false);
   }
 };




 const handleWalletPayment = async () => {
  try {
    // Determine payment type based on URL parameters and wizard state
    const groupSellerId = searchParams.get('groupSellerId');
    const isGroupPayment = groupSellerId && wizard.orderGroupId;
    const addressId = selectedAddress?.addressId;
    if (!addressId) throw new Error('Không có addressId');
    if (isGroupPayment) {
      // Group payment: pay for all orders in the group
      await payGroupWithWallet({ orderGroupId: wizard.orderGroupId!, addressId });
      navigate(`/checkout/result?orderGroupId=${wizard.orderGroupId}&paymentMethod=wallet&status=success`);
    } else {
      // Individual payment: pay for current order only
      await payWithWallet({ orderId: currentOrder!.orderId, addressId });
      navigate(`/checkout/result?orderId=${currentOrder!.orderId}&paymentMethod=wallet&status=success`);
    }
  } catch (error) {
    throw error;
  }
 };








 const handlePayGroup = async () => {
   if (!wizard.orderGroupId) {
     toast.error('Không tìm thấy nhóm đơn hàng');
     return;
   }




   setIsProcessing(true);




  try {
    // Only wallet payment is available now
    const addressId = selectedAddress?.addressId;
    if (!addressId) throw new Error('Không có addressId');
    await payGroupWithWallet({ orderGroupId: wizard.orderGroupId, addressId });
    navigate(`/checkout/result?orderGroupId=${wizard.orderGroupId}&paymentMethod=wallet&status=success`);
  } catch (error) {
    console.error('Group payment error:', error);
    toast.error('Lỗi khi thanh toán nhóm đơn hàng');
  } finally {
    setIsProcessing(false);
  }
 };




 if (selectedCartItems.length === 0 && !isProcessing) {
   return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
       <div className="text-center">
         <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
         <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
         <p className="text-gray-600 mb-4">Vui lòng quay lại giỏ hàng và chọn sản phẩm</p>
         <button
           onClick={() => navigate('/cart')}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
         >
           Quay về giỏ hàng
         </button>
       </div>
     </div>
   );
 }




 return (
   <div className="min-h-screen bg-gray-50">
     <div className="max-w-4xl mx-auto px-4 py-8">
       {/* Header */}
       <div className="mb-8">
         <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán</h1>
         <p className="text-gray-600">
           {wizard.orders.length > 0 
             ? `Thanh toán cho ${wizard.orders.length} đơn hàng từ ${wizard.orders.length} người bán khác nhau - Tổng: ${orderTotal.toLocaleString('vi-VN')} VND`
             : `${selectedCartItems.length} sản phẩm đã chọn - Tổng: ${orderTotal.toLocaleString('vi-VN')} VND`
           }
         </p>
         {/* Hiển thị danh sách OrderIds nếu có */}
         {wizard.orders.length > 0 && (
           <div className="mt-2 text-sm text-gray-500">
             <span>Mã đơn hàng: {wizard.orders.map(o => `#ĐH${o.orderId}`).join(', ')}</span>
           </div>
         )}
       </div>




       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-6">
           {/* Address Selection */}
           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
             <AddressSelectorTailwind
               selectedAddressId={selectedAddress?.addressId}
               onAddressSelect={setSelectedAddress}
             />
           </div>




           {/* Payment Methods */}
           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
           
             <div className="space-y-3">
               {paymentMethods.map((method) => (
                 <div
                   key={method.id}
                   className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                     selectedPaymentMethod === method.id
                       ? 'border-blue-500 bg-blue-50'
                       : method.available
                       ? 'border-gray-200 hover:bg-gray-50'
                       : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                   }`}
                   onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                 >
                   <div className="flex items-center gap-3">
                     <method.icon className="w-6 h-6 text-gray-600" />
                     <div className="flex-1">
                       <h4 className="font-medium text-gray-900">{method.name}</h4>
                       <p className="text-sm text-gray-600">{method.description}</p>
                     </div>
                     {selectedPaymentMethod === method.id && (
                       <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                     )}
                   </div>
                 </div>
               ))}
             </div>




             {/* Wallet Balance Warning */}
             {selectedPaymentMethod === 'wallet' && walletBalanceCheck && !walletBalanceCheck.sufficient && (
               <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                 <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-0.5" />
                 <div>
                   <h4 className="font-medium text-yellow-800">Số dư ví không đủ</h4>
                   <p className="text-sm text-yellow-700 mt-1">
                     Bạn cần nạp thêm {(walletBalanceCheck.shortfall as number).toLocaleString('vi-VN')} VND để thanh toán
                   </p>
                   <button
                     onClick={() => navigate('/wallet')}
                     className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                   >
                     Nạp tiền ngay
                   </button>
                 </div>
               </div>
             )}
           </div>
         </div>




         {/* Order Summary */}
         <div className="lg:col-span-1">
           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Tóm tắt đơn hàng
               {wizard.orders.length > 0 && (
                 <span className="text-sm font-normal text-gray-500 ml-2">
                   ({wizard.orders.length} đơn)
                 </span>
               )}
             </h3>

             {/* Hiển thị từng đơn hàng nếu có nhiều đơn */}
             {wizard.orders.length > 1 && (
               <div className="mb-4 space-y-2">
                 <h4 className="text-sm font-medium text-gray-700">Chi tiết từng đơn hàng:</h4>
                 {wizard.orders.map((order, index) => (
                   <div key={order.orderId} className="flex justify-between text-sm">
                     <span className="text-gray-600">Đơn #{order.orderId}:</span>
                     <span className="text-gray-900">{order.totalAmount.toLocaleString('vi-VN')} VND</span>
                   </div>
                 ))}
                 <div className="border-t pt-2 mt-2"></div>
               </div>
             )}
           
             <div className="space-y-3 mb-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Tạm tính:</span>
                 <span className="text-gray-900">{orderTotal.toLocaleString('vi-VN')} VND</span>
               </div>
             
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Phí vận chuyển:</span>
                 <span className="text-gray-900">0 VND</span>
               </div>
             
               <div className="border-t pt-3">
                 <div className="flex justify-between font-semibold text-lg">
                   <span className="text-gray-900">Tổng cộng:</span>
                   <span className="text-blue-600">{orderTotal.toLocaleString('vi-VN')} VND</span>
                 </div>
               </div>
             </div>




             {/* Payment Button */}
             <button
               onClick={handlePayment}
               disabled={isProcessing || !selectedAddress || walletBalance < orderTotal}
               className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
             >
               {isProcessing ? (
                 <>
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                   Đang xử lý thanh toán...
                 </>
               ) : (
                 <>
                   <BanknotesIcon className="w-5 h-5" />
                   {wizard.orders.length > 1 
                     ? `Thanh toán ${wizard.orders.length} đơn hàng - ${orderTotal.toLocaleString('vi-VN')} VND`
                     : `Thanh toán ${orderTotal.toLocaleString('vi-VN')} VND`
                   }
                 </>
               )}
             </button>
             
             {/* Thông tin bổ sung về thanh toán */}
             {wizard.orders.length > 1 && (
               <div className="mt-2 text-xs text-gray-500 text-center">
                 Bạn sẽ thanh toán một lần cho tất cả {wizard.orders.length} đơn hàng
               </div>
             )}




           </div>
         </div>
       </div>
     </div>
   </div>
 );
};




export default CheckoutTailwind;





