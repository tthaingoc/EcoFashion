import apiClient from './baseApi';

export interface CartItemDto {
  itemType: 'material' | 'design' | 'product';
  materialId?: number;
  designId?: number;
  productId?: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSessionRequest {
  items: CartItemDto[];
  shippingAddress: string;
  holdMinutes?: number;
  // Idempotency key để tránh tạo trùng Order trên backend
  idempotencyKey?: string;
}

export interface CheckoutOrderDto {
  orderId: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
}

export interface CreateSessionResponse {
  orderGroupId: string;
  orders: CheckoutOrderDto[];
  expiresAt: string;
  // Thêm các field mới từ backend
  orderIds: number[];
  totalOrderCount: number;
  totalAmount: number;
}

// Service xử lý các chức năng liên quan đến Standard Checkout
// Standard Checkout xử lý thanh toán theo cách truyền thống - tạo session và thanh toán từng đơn
export const checkoutService = {
  // Tạo session checkout chuẩn từ danh sách sản phẩm
  createSession: async (payload: CreateSessionRequest) => {
    const { data } = await apiClient.post<CreateSessionResponse>(`/checkout/create-session`, payload);
    return data;
  },
  // Tạo session checkout chuẩn từ giỏ hàng hiện tại
  createSessionFromCart: async (shippingAddress?: string) => {
    const payload = shippingAddress ? { shippingAddress } : {};
    const { data } = await apiClient.post<CreateSessionResponse>(`/checkout/create-session-from-cart`, payload);
    return data;
  },
};


