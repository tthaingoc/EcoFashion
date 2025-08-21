import { create } from 'zustand';
import type { CheckoutOrderDto, CreateSessionResponse } from '../services/api/checkoutService';

// Interface quản lý trạng thái chuỗi thanh toán Standard Checkout
interface CheckoutWizardState {
  orderGroupId?: string;
  orders: CheckoutOrderDto[];
  currentIndex: number;
  statusByOrderId: Record<number, 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Skipped'>;
  expiresAt?: string;
  start: (resp: CreateSessionResponse) => void;
  markStatus: (orderId: number, status: 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Skipped') => void;
  next: () => void;
  reset: () => void;
  goToOrder: (orderId: number) => void;
}

// Store quản lý trạng thái wizard cho Standard Checkout
// Wizard cho phép thanh toán từng đơn một trong nhóm đơn hàng
export const useCheckoutWizard = create<CheckoutWizardState>((set, get) => ({
  orders: [],
  currentIndex: 0,
  statusByOrderId: {},
  // Khởi tạo wizard với dữ liệu session mới
  start: (resp) => set({
    orderGroupId: resp.orderGroupId,
    orders: resp.orders,
    currentIndex: 0,
    statusByOrderId: resp.orders.reduce((acc, o) => { acc[o.orderId] = 'Pending'; return acc; }, {} as Record<number, any>),
    expiresAt: resp.expiresAt,
  }),
  // Đánh dấu trạng thái thanh toán của một đơn hàng
  markStatus: (orderId, status) => set((s) => ({
    statusByOrderId: { ...s.statusByOrderId, [orderId]: status },
  })),
  // Chuyển đến đơn hàng tiếp theo trong wizard
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.orders.length) })),
  // Reset wizard về trạng thái ban đầu
  reset: () => set({ orderGroupId: undefined, orders: [], currentIndex: 0, statusByOrderId: {}, expiresAt: undefined }),
  // Nhảy đến một đơn hàng cụ thể trong wizard
  goToOrder: (orderId) => set((s) => {
    const idx = s.orders.findIndex(o => o.orderId === orderId);
    return idx >= 0 ? { currentIndex: idx } : {} as any;
  }),
}));


