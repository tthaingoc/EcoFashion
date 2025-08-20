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
import { toast } from 'react-toastify';




interface PaymentMethod {
 id: 'wallet';
 name: string;
 description: string;
 icon: React.ComponentType<any>;
 available: boolean;
}




const CheckoutTailwind: React.FC = () => {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet'>('wallet');
 const [selectedAddress, setSelectedAddress] = useState<any>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const bootstrapExecuted = useRef(false);
 const [walletBalanceCheck, setWalletBalanceCheck] = useState<{
   sufficient: boolean;
   shortfall: number;
 } | null>(null);




 const wizard = useCheckoutWizard();
 const currentOrder = wizard.orders[wizard.currentIndex];
 const { data: walletBalance = 0 } = useWalletBalance();
 const { mutateAsync: payWithWallet } = usePayOrderWithWallet();
 const { mutateAsync: payGroupWithWallet } = usePayGroupWithWallet();
 const { mutateAsync: checkBalance } = useCheckWalletBalance();




 const orderTotal = (currentOrder as any)?.totalAmount ?? (currentOrder as any)?.totalPrice ?? 0;
 const groupTotal = wizard.orders.reduce((sum, order: any) => sum + (order.totalAmount ?? order.totalPrice ?? 0), 0);




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




 // Bootstrap: create checkout session from cart using default address on backend
 useEffect(() => {
   const bootstrap = async () => {
     if (bootstrapExecuted.current) return;
     bootstrapExecuted.current = true;
     
     try {
       setIsProcessing(true);
       
       // Check if we have an existing orderId to pay for
       const existingOrderId = searchParams.get('orderId');
       if (existingOrderId) {
         // For existing orders, load the actual order data
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
           expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min from now
         };
         wizard.start(resp);
       } else {
         // Normal flow: create session from cart
         // Let backend use default UserAddress if available
         const resp = await checkoutService.createSessionFromCart();
         wizard.start(resp);
       }




       // Note: Removed sellerId-based routing since we no longer use sellerId
       // Orders are now processed sequentially or as a group
     } catch (e) {
       // Fail silently; UI will show not found/empty state
       console.warn('createSessionFromCart failed:', e);
     } finally {
       setIsProcessing(false);
     }
   };




   if (!wizard.orderGroupId && !isProcessing) {
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
   if (!currentOrder) {
     toast.error('Không tìm thấy đơn hàng');
     return;
   }




   if (!selectedAddress) {
     toast.error('Vui lòng chọn địa chỉ giao hàng');
     return;
   }




   console.log('Selected address:', selectedAddress);
   console.log('Wallet balance:', walletBalance);
   console.log('Order total:', orderTotal);




   setIsProcessing(true);




   try {
     // Only wallet payment is available now
     await handleWalletPayment();
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




 if (!currentOrder) {
   return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
       <div className="text-center">
         <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
         <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
         <p className="text-gray-600 mb-4">Vui lòng quay lại giỏ hàng và thử lại</p>
         <button
           onClick={() => navigate('/shop/cart')}
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
           Đơn hàng #{currentOrder.orderId} - {wizard.currentIndex + 1}/{wizard.orders.length}
         </p>
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
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
           
             <div className="space-y-3 mb-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Tạm tính:</span>
                 <span className="text-gray-900">{(((currentOrder as any).subtotal ?? 0) as number).toLocaleString('vi-VN')} VND</span>
               </div>
             
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Phí vận chuyển:</span>
                 <span className="text-gray-900">{(((currentOrder as any).shippingFee ?? 0) as number).toLocaleString('vi-VN')} VND</span>
               </div>
             
               {(((currentOrder as any).discount ?? 0) as number) > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Giảm giá:</span>
                   <span className="text-red-600">-{(((currentOrder as any).discount ?? 0) as number).toLocaleString('vi-VN')} VND</span>
                 </div>
               )}
             
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
               disabled={isProcessing || !selectedAddress}
               className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
             >
               {isProcessing ? (
                 <>
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                   Đang xử lý...
                 </>
               ) : (
                 <>
                   <BanknotesIcon className="w-5 h-5" />
                   Thanh toán {orderTotal.toLocaleString('vi-VN')} VND
                 </>
               )}
             </button>




             {/* Group Payment Option */}
             {wizard.orders.length > 1 && (
               <div className="mt-4 pt-4 border-t">
                 <h4 className="font-medium text-gray-900 mb-2">Hoặc thanh toán tất cả</h4>
                 <p className="text-sm text-gray-600 mb-3">
                   Thanh toán {wizard.orders.length} đơn hàng với tổng {groupTotal.toLocaleString('vi-VN')} VND
                 </p>
                 <button
                   onClick={handlePayGroup}
                   disabled={isProcessing || !selectedAddress}
                   className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                 >
                   Thanh toán tất cả
                 </button>
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





