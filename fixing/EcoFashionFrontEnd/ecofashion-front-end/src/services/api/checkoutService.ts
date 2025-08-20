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
}

export const checkoutService = {
  createSession: async (payload: CreateSessionRequest) => {
    const { data } = await apiClient.post<CreateSessionResponse>(`/checkout/create-session`, payload);
    return data;
  },
  createSessionFromCart: async (shippingAddress?: string) => {
    const payload = shippingAddress ? { shippingAddress } : {};
    const { data } = await apiClient.post<CreateSessionResponse>(`/checkout/create-session-from-cart`, payload);
    return data;
  },
};


