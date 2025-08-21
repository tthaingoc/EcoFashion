import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService, type OrderModel } from '../services/api/ordersService';
import { QUERY_KEYS } from '../config/wallet';

export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: ordersService.getAll,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrderById = (orderId: number) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersService.getById(orderId),
    enabled: !!orderId,
  });
};

export const useRefreshOrders = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
  };
};

// Helper hook to get filtered orders by status
export const useFilteredOrders = (orders: OrderModel[] = []) => {
  return {
    all: orders,
    pendingPayment: orders.filter(o => o.paymentStatus?.toLowerCase() === 'pending'),
    shipping: orders.filter(o => 
      o.paymentStatus?.toLowerCase() === 'paid' && 
      ['processing', 'shipped', 'none'].includes(o.fulfillmentStatus?.toLowerCase() || 'none')
    ),
    awaitingDelivery: orders.filter(o => o.fulfillmentStatus?.toLowerCase() === 'shipped'),
    completed: orders.filter(o => o.fulfillmentStatus?.toLowerCase() === 'delivered'),
    cancelled: orders.filter(o => 
      o.status?.toLowerCase() === 'cancelled' || 
      o.fulfillmentStatus?.toLowerCase() === 'canceled'
    ),
  };
};