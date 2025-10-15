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


 // Designer order management: backend merges supplier/designer under seller endpoint
 getOrdersByDesigner: async (designerId: string) => {
   const { data } = await apiClient.get(`/order/by-seller/${designerId}`);
   return (data?.result || data) as OrderModel[];
 },


 // Get order details for supplier - use proper API endpoint for supplier access
 getOrderDetailsBySupplier: async (orderId: number, sellerId: string) => {
   try {
     // First verify the order belongs to this supplier
     const supplierOrders = await ordersService.getOrdersBySeller(sellerId);
     const orderExists = supplierOrders.some(order => order.orderId === orderId);
    
     if (!orderExists) {
       throw new Error('Order not found or access denied');
     }
    
     // If order belongs to supplier, get details
     const { data } = await apiClient.get(`/orderdetail/getall`);
     const rows = (data?.result || data) as any[];
     return rows.filter((r) => r.orderId === orderId);
   } catch (error) {
     throw error;
   }
 },


 // Get order details for designer - use proper API endpoint for designer access
 getOrderDetailsByDesigner: async (orderId: number, designerId: string) => {
   try {
     // First verify the order belongs to this designer
     const designerOrders = await ordersService.getOrdersByDesigner(designerId);
     const orderExists = designerOrders.some(order => order.orderId === orderId);
    
     if (!orderExists) {
       throw new Error('Order not found or access denied');
     }
    
     // If order belongs to designer, get details
     const { data } = await apiClient.get(`/orderdetail/getall`);
     const rows = (data?.result || data) as any[];
     return rows.filter((r) => r.orderId === orderId);
   } catch (error) {
     throw error;
   }
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




