import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/baseApi';
import { QUERY_KEYS } from '../config/wallet';
import { toast } from 'react-toastify';

export const useDemoCompleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.post(`/settlements/demo-complete-order?orderId=${orderId}`);
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settlements });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
      toast.success('Đơn hàng đã được hoàn thành và chi trả!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi hoàn thành đơn hàng');
    },
  });
};

export const useReleasePayouts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, orderGroupId }: { orderId?: number; orderGroupId?: string }) => {
      let url = '/settlements/release';
      const params = new URLSearchParams();
      
      if (orderId) params.append('orderId', orderId.toString());
      if (orderGroupId) params.append('orderGroupId', orderGroupId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.post(url);
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settlements });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
      toast.success('Chi trả thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi chi trả');
    },
  });
};

export const useGetSettlementsForOrder = (orderId: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.settlements, 'order', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/settlements/order/${orderId}`);
      return response.data?.result || response.data;
    },
    enabled: !!orderId,
  });
};

export const useGetPendingSettlements = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.settlements, 'pending'],
    queryFn: async () => {
      const response = await apiClient.get('/settlements/seller/pending');
      return response.data?.result || response.data;
    },
  });
};