import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAddressService } from '../services/api/userAddressService';
import apiClient from '../services/api/baseApi';
import { toast } from 'react-toastify';

const QUERY_KEYS = {
  addresses: ['addresses'],
  defaultAddress: ['addresses', 'default'],
} as const;

export const useUserAddresses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.addresses,
    queryFn: userAddressService.getAll,
  });
};

export const useDefaultAddress = () => {
  return useQuery({
    queryKey: QUERY_KEYS.defaultAddress,
    queryFn: userAddressService.getDefault,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userAddressService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultAddress });
      toast.success('Địa chỉ đã được tạo thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo địa chỉ');
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: number; data: any }) => 
      userAddressService.update(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultAddress });
      toast.success('Địa chỉ đã được cập nhật thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật địa chỉ');
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: number) => userAddressService.delete(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultAddress });
      toast.success('Địa chỉ đã được xóa thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa địa chỉ');
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: number) => userAddressService.setDefault(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultAddress });
      toast.success('Đã đặt địa chỉ mặc định');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định');
    },
  });
};

// Checkout-specific address hooks
export const useCheckoutAddresses = () => {
  return useQuery({
    queryKey: ['checkout', 'addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/checkout/addresses');
      return response.data?.result || response.data;
    },
  });
};

export const useCreateCheckoutAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (addressData: any) => {
      const response = await apiClient.post('/checkout/create-address', addressData);
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout', 'addresses'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
      toast.success('Địa chỉ mới đã được tạo');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo địa chỉ');
    },
  });
};

export const useUpdateOrderAddress = () => {
  return useMutation({
    mutationFn: async ({ orderId, addressData }: { orderId: number; addressData: any }) => {
      const response = await apiClient.put(`/checkout/order/${orderId}/address`, addressData);
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      toast.success('Địa chỉ giao hàng đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật địa chỉ');
    },
  });
};