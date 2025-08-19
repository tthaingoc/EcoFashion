import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/baseApi';
import { QUERY_KEYS } from '../config/wallet';
import { toast } from 'react-toastify';

export const usePayOrderWithWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.post('/checkout/pay-with-wallet', { orderId });
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

export const usePayGroupWithWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderGroupId: string) => {
      const response = await apiClient.post('/checkout/pay-group-with-wallet', { orderGroupId });
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

export const useCheckWalletBalance = () => {
  return useMutation({
    mutationFn: async (requiredAmount: number) => {
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