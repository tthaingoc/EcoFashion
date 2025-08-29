import apiClient from "./baseApi";

export interface OrderModel {
  orderId: number;
  userId: number;
  userName?: string;
  shippingAddress: string;
  // Số điện thoại nhận hàng (từ PersonalPhoneNumber trên BE)
  personalPhoneNumber?: string;
  status: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  totalPrice: number;
  orderDate: string;
  sellerName?: string;
  sellerType?: string;
  sellerAvatarUrl?: string;
}

// Request/Response interfaces
export interface UpdateFulfillmentStatusRequest {
  fulfillmentStatus: string | number;
  notes?: string;
  location?: string;
}

export interface ShipOrderRequest {
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  estimatedDelivery?: string;
}

export const ordersService = {
  getAll: async () => {
    const { data } = await apiClient.get(`/order/getall`);
    return (data?.result || data) as OrderModel[];
  },
  getById: async (orderId: number) => {
    const { data } = await apiClient.get(`/order/${orderId}`);
    // backend wraps in ApiResult; baseApi returns raw data, but here assume direct passthrough
    return (data?.result || data) as {
      result?: { orderId: number; status: string; paymentStatus?: string };
    };
  },
  getDetailsByOrderId: async (orderId: number) => {
    const { data } = await apiClient.get(`/orderdetail/getall`);
    const rows = (data?.result || data) as any[];
    return rows.filter((r) => r.orderId === orderId);
  },

  // New methods for supplier order management
  getOrdersBySeller: async (sellerId: string) => {
    const { data } = await apiClient.get(`/order/by-seller/${sellerId}`);
    return (data?.result || data) as OrderModel[];
  },

  updateFulfillmentStatus: async (
    orderId: number,
    request: UpdateFulfillmentStatusRequest
  ) => {
    const toEnumNumber = (value: string | number): number => {
      if (typeof value === "number") return value;
      const map: Record<string, number> = {
        none: 0,
        processing: 1,
        shipped: 2,
        delivered: 3,
        canceled: 4,
        cancelled: 4,
      };
      return map[value?.toLowerCase?.() as string] ?? 0;
    };

    const payload = {
      fulfillmentStatus: toEnumNumber(request.fulfillmentStatus),
      notes: request.notes,
      location: request.location,
    };

    const { data } = await apiClient.patch(
      `/order/${orderId}/fulfillment-status`,
      payload
    );
    return data?.result || data;
  },

  markOrderShipped: async (orderId: number, request: ShipOrderRequest) => {
    const { data } = await apiClient.post(`/order/${orderId}/ship`, request);
    return data?.result || data;
  },

  markOrderDelivered: async (orderId: number) => {
    const { data } = await apiClient.post(`/order/${orderId}/deliver`);
    return data?.result || data;
  },
};
