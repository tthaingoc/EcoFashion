import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/baseApi';
import { QUERY_KEYS } from '../config/wallet';
import { toast } from 'react-toastify';


// Hook thanh toán từng đơn hàng riêng bằng ví điện tử - sử dụng trong Standard Checkout
export const usePayOrderWithWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, addressId }: { orderId: number; addressId: number }) => { // Thanh toán với ID đơn hàng và địa chỉ
      const response = await apiClient.post('/checkout/pay-with-wallet', { orderId, addressId });
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      toast.success('Thanh toán qua ví thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi thanh toán qua ví');
    },
  });
};


// Hook thanh toán tất cả đơn hàng trong nhóm bằng ví điện tử
export const usePayGroupWithWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderGroupId, addressId }: { orderGroupId: string; addressId: number }) => { // Thanh toán với ID nhóm đơn và địa chỉ
      // Log orderIds từ session để tracking
      const orderIds = sessionStorage.getItem('checkoutOrderIds');
      if (orderIds) {
        console.log('Paying for orderIds:', JSON.parse(orderIds));
      }
      
      const response = await apiClient.post('/checkout/pay-group-with-wallet', { orderGroupId, addressId });
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      toast.success('Thanh toán nhóm đơn qua ví thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi thanh toán nhóm đơn qua ví');
    },
  });
};


// Hook kiểm tra số dư ví có đủ để thanh toán hay không
export const useCheckWalletBalance = () => {
  return useMutation({
    mutationFn: async (requiredAmount: number) => { // Kiểm tra số tiền cần thanh toán
      const summary = await apiClient.get('/wallet/summary');
      const payload = summary.data?.result ?? summary.data ?? {};
      const balance = (payload?.balance ?? payload?.wallet?.balance ?? 0) as number;
      return {
        balance,
        sufficient: balance >= requiredAmount,
        shortfall: Math.max(0, requiredAmount - balance),
      };
    },
  });
};

