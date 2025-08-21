import apiClient from './baseApi';

export interface ShipmentUpdateRequest {
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  location?: string;
  notes?: string;
  estimatedDelivery?: string;
}

export interface ShipmentTrackingResponse {
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  statusHistory: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;
  estimatedDelivery?: string;
  currentLocation?: string;
}

export interface OrderShipmentInfo {
  orderId: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  estimatedDelivery?: string;
  items: number;
  totalValue: number;
}

export const shipmentService = {
  // Get all orders that need shipment management
  getAllOrders: async (): Promise<OrderShipmentInfo[]> => {
    const { data } = await apiClient.get('/shipment/orders');
    return data?.result || data;
  },

  // Get orders for specific seller
  getSellerOrders: async (sellerId: string): Promise<OrderShipmentInfo[]> => {
    const { data } = await apiClient.get(`/shipment/orders/seller/${sellerId}`);
    return data?.result || data;
  },

  // Get specific order shipment details
  getOrderShipment: async (orderId: number): Promise<OrderShipmentInfo> => {
    const { data } = await apiClient.get(`/shipment/orders/${orderId}`);
    return data?.result || data;
  },

  // Update shipment information
  updateShipment: async (updateData: ShipmentUpdateRequest): Promise<void> => {
    const { data } = await apiClient.put(`/shipment/update`, updateData);
    return data?.result || data;
  },

  // Get tracking information
  getTracking: async (orderId: number): Promise<ShipmentTrackingResponse> => {
    const { data } = await apiClient.get(`/shipment/track/${orderId}`);
    return data?.result || data;
  },

  // Get tracking by tracking number
  getTrackingByNumber: async (trackingNumber: string): Promise<ShipmentTrackingResponse> => {
    const { data } = await apiClient.get(`/shipment/track/number/${trackingNumber}`);
    return data?.result || data;
  },

  // Create shipment (assign tracking number and carrier)
  createShipment: async (orderId: number, carrier: string, trackingNumber: string): Promise<void> => {
    const { data } = await apiClient.post('/shipment/create', {
      orderId,
      carrier,
      trackingNumber
    });
    return data?.result || data;
  },

  // Update shipment status
  updateStatus: async (orderId: number, status: string, location?: string, notes?: string): Promise<void> => {
    const { data } = await apiClient.patch(`/shipment/${orderId}/status`, {
      status,
      location,
      notes,
      timestamp: new Date().toISOString()
    });
    return data?.result || data;
  },

  // Get delivery statistics
  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> => {
    const { data } = await apiClient.get('/shipment/statistics');
    return data?.result || data;
  },

  // Ship order (mark as shipped)
  shipOrder: async (orderId: number, shipData: { trackingNumber?: string; carrier?: string; notes?: string }): Promise<void> => {
    const { data } = await apiClient.post(`/shipment/${orderId}/ship`, shipData);
    return data?.result || data;
  },

  // Deliver order (mark as delivered and trigger settlement)
  deliverOrder: async (orderId: number): Promise<void> => {
    const { data } = await apiClient.post(`/shipment/${orderId}/deliver`);
    return data?.result || data;
  },

  // Demo: Complete order for testing
  completeOrder: async (orderId: number): Promise<void> => {
    const { data } = await apiClient.post(`/shipment/${orderId}/complete`);
    return data?.result || data;
  }
};

export default shipmentService;