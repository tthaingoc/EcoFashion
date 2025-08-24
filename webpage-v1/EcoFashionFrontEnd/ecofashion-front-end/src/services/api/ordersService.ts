import apiClient from './baseApi';

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
  fulfillmentStatus: string;
  notes?: string;
  location?: string;
}

export interface ShipOrderRequest {
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  estimatedDelivery?: string;
}

// NEW INTERFACES FOR PARTIAL FULFILLMENT SYSTEM
export interface UpdateOrderDetailStatusRequest {
  status: string;
  notes?: string;
  estimatedShippingDate?: string;
}

export interface BulkConfirmRequest {
  notes?: string;
  estimatedShippingDate?: string;
  orderDetailIds: number[];
}

export interface OrderSellerViewModel {
  orderId: number;
  userName: string;
  shippingAddress: string;
  // Số điện thoại nhận hàng (từ PersonalPhoneNumber trên BE)
  personalPhoneNumber?: string;
  totalPrice: number;
  orderDate: string;
  paymentStatus: string;
  orderStatus: string;
  fulfillmentStatus: string;
  sellerItems: SellerOrderDetailModel[];
  otherSellers: OtherSellerInfo[];
  totalItemsInOrder: number;
  sellerItemsCount: number;
  confirmedSellerItems: number;
  allSellerItemsConfirmed: boolean;
}

export interface SellerOrderDetailModel {
  orderDetailId: number;
  itemName: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  notes?: string;
  imageUrl?: string;
  canConfirm: boolean;
  canShip: boolean;
}

export interface OtherSellerInfo {
  sellerId: string;
  sellerName: string;
  sellerType: string;
  itemCount: number;
  confirmedItems: number;
  allItemsConfirmed: boolean;
  avatarUrl?: string;
}

export interface OrderProgressModel {
  orderId: number;
  userName: string;
  totalPrice: number;
  orderDate: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalItems: number;
  confirmedItems: number;
  shippedItems: number;
  deliveredItems: number;
  confirmationProgress: number;
  shippingProgress: number;
  deliveryProgress: number;
  sellerProgressList: SellerProgress[];
  estimatedShippingDate?: string;
  estimatedDeliveryDate?: string;
  timeline: OrderTimelineEvent[];
}

export interface SellerProgress {
  sellerId: string;
  sellerName: string;
  sellerType: string;
  avatarUrl?: string;
  totalItems: number;
  confirmedItems: number;
  shippedItems: number;
  status: string;
  progress: number;
  items: ItemProgress[];
}

export interface ItemProgress {
  orderDetailId: number;
  itemName: string;
  itemType: string;
  quantity: number;
  status: string;
  imageUrl?: string;
}

export interface OrderTimelineEvent {
  eventDate: string;
  eventType: string;
  title: string;
  description: string;
  sellerName?: string;
  icon?: string;
  status: string;
}

export const ordersService = {
  getAll: async () => {
    const { data } = await apiClient.get(`/order/getall`);
    return (data?.result || data) as OrderModel[];
  },
  getById: async (orderId: number) => {
    const { data } = await apiClient.get(`/order/${orderId}`);
    // backend wraps in ApiResult; baseApi returns raw data, but here assume direct passthrough
    return (data?.result || data) as { result?: { orderId: number; status: string; paymentStatus?: string } };
  },
  getDetailsByOrderId: async (orderId: number) => {
    const { data } = await apiClient.get(`/orderdetail/getall`);
    const rows = (data?.result || data) as any[];
    return rows.filter(r => r.orderId === orderId);
  },
  
  // New methods for supplier order management
  getOrdersBySeller: async (sellerId: string) => {
    const { data } = await apiClient.get(`/order/by-seller/${sellerId}`);
    return (data?.result || data) as OrderModel[];
  },
  
  updateFulfillmentStatus: async (orderId: number, request: UpdateFulfillmentStatusRequest) => {
    const { data } = await apiClient.patch(`/order/${orderId}/fulfillment-status`, request);
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

  // NEW METHODS FOR PARTIAL FULFILLMENT SYSTEM

  // Get seller's view of a specific order
  getOrderSellerView: async (orderId: number, sellerId: string): Promise<OrderSellerViewModel> => {
    const { data } = await apiClient.get(`/orderdetail/order/${orderId}/seller-view/${sellerId}`);
    return data?.result || data;
  },

  // Get order progress for customer view
  getOrderProgress: async (orderId: number): Promise<OrderProgressModel> => {
    const { data } = await apiClient.get(`/orderdetail/order/${orderId}/progress`);
    return data?.result || data;
  },

  // Update individual order detail status
  updateOrderDetailStatus: async (orderDetailId: number, request: UpdateOrderDetailStatusRequest) => {
    const { data } = await apiClient.patch(`/orderdetail/${orderDetailId}/status`, request);
    return data?.result || data;
  },

  // Bulk confirm all seller items in an order
  confirmAllSellerItems: async (orderId: number, sellerId: string, request: BulkConfirmRequest) => {
    const { data } = await apiClient.post(`/orderdetail/order/${orderId}/confirm-seller-items/${sellerId}`, request);
    return data?.result || data;
  },

  // Get order details by seller (for dashboard filtering)
  getOrderDetailsBySeller: async (sellerId: string) => {
    const { data } = await apiClient.get(`/orderdetail/by-seller/${sellerId}`);
    return data?.result || data;
  }
};


