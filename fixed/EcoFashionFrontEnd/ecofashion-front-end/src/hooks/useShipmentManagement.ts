import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/api/shipmentService';
import { toast } from 'react-toastify';

export const useShipmentOrders = () => {
  return useQuery({
    queryKey: ['shipment', 'orders'],
    queryFn: shipmentService.getAllOrders,
  });
};

export const useSellerShipmentOrders = (sellerId: string, enabled = true) => {
  return useQuery({
    queryKey: ['shipment', 'orders', 'seller', sellerId],
    queryFn: () => shipmentService.getSellerOrders(sellerId),
    enabled: enabled && !!sellerId,
  });
};

export const useShipmentStatistics = () => {
  return useQuery({
    queryKey: ['shipment', 'statistics'],
    queryFn: shipmentService.getStatistics,
  });
};

export const useShipOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, shipData }: { orderId: number; shipData: { trackingNumber?: string; carrier?: string; notes?: string } }) => 
      shipmentService.shipOrder(orderId, shipData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đã cập nhật đơn hàng thành trạng thái đang vận chuyển!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái vận chuyển');
    },
  });
};

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: number) => shipmentService.deliverOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đã hoàn thành đơn hàng và xử lý thanh toán!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi hoàn thành đơn hàng');
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: number) => shipmentService.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      toast.success('Đã hoàn thành đơn hàng (demo)!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi hoàn thành đơn hàng');
    },
  });
};