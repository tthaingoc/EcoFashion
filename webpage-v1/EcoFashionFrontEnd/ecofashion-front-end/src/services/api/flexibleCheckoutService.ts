import apiClient from './baseApi';

export interface CheckoutSessionItemDto {
  checkoutSessionItemId: number;
  checkoutSessionId: string;
  materialId?: number;
  productId?: number;
  itemName?: string;
  itemImageUrl?: string;
  type: string;
  supplierId?: string;
  designerId?: string;
  providerName?: string;
  providerType?: string;
  providerAvatarUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isSelected: boolean;
  createdAt: string;
}

export interface ProviderGroupDto {
  providerId?: string;
  providerName: string;
  providerType: string;
  providerAvatarUrl?: string;
  items: CheckoutSessionItemDto[];
  groupSubtotal: number;
  groupItemCount: number;
  canCheckoutSeparately: boolean;
}

export interface CheckoutSessionDto {
  checkoutSessionId: string;
  userId: number;
  status: string;
  shippingAddress?: string;
  addressId?: number;
  totalAmount: number;
  totalItems: number;
  totalProviders: number;
  createdAt: string;
  expiresAt?: string;
  items: CheckoutSessionItemDto[];
  providerGroups: ProviderGroupDto[];
}

export interface CreateCheckoutSessionRequest {
  items: CheckoutSessionItemRequest[];
  shippingAddress?: string;
  addressId?: number;
  holdMinutes?: number;
}

export interface CheckoutSessionItemRequest {
  materialId?: number;
  productId?: number;
  quantity: number;
  unitPrice?: number;
}

export interface UpdateCheckoutSelectionRequest {
  selectedItemIds: number[];
  providerIdFilter?: string;
  providerTypeFilter?: string;
}

export interface FlexibleCheckoutRequest {
  checkoutSessionId: string;
  selectedItemIds: number[];
  checkoutMode: 'Selected' | 'ByProvider' | 'All';
  providerIdFilter?: string;
  addressId?: number;
  shippingAddress?: string;
}

export interface PaySelectedWithWalletRequest {
  checkoutSessionId: string;
  selectedItemIds: number[];
  checkoutMode: 'Selected' | 'ByProvider' | 'All';
  providerIdFilter?: string;
  addressId?: number;
  shippingAddress?: string;
}

export interface FlexibleCheckoutResponse {
  success: boolean;
  data?: CheckoutSessionDto | any;
  message?: string;
}

// Service xử lý các chức năng liên quan đến Flexible Checkout
// Flexible Checkout cho phép người dùng thanh toán linh hoạt theo lựa chọn hoặc nhóm nhà cung cấp
export const flexibleCheckoutService = {
  // Tạo session checkout mới từ danh sách sản phẩm
  createSession: async (payload: CreateCheckoutSessionRequest): Promise<FlexibleCheckoutResponse> => {
    const { data } = await apiClient.post('/flexiblecheckout/create-session', payload);
    return data;
  },

  // Tạo session checkout từ giỏ hàng hiện tại
  createSessionFromCart: async (shippingAddress?: string, addressId?: number): Promise<FlexibleCheckoutResponse> => {
    const payload = { shippingAddress, addressId };
    const { data } = await apiClient.post('/flexiblecheckout/create-session-from-cart', payload);
    return data;
  },

  // Lấy thông tin session checkout theo ID
  getSession: async (checkoutSessionId: string): Promise<FlexibleCheckoutResponse> => {
    const { data } = await apiClient.get(`/flexiblecheckout/${checkoutSessionId}`);
    return data;
  },

  // Cập nhật lựa chọn sản phẩm trong session checkout
  updateSelection: async (checkoutSessionId: string, payload: UpdateCheckoutSelectionRequest): Promise<FlexibleCheckoutResponse> => {
    const { data } = await apiClient.put(`/flexiblecheckout/${checkoutSessionId}/selection`, payload);
    return data;
  },

  // Xử lý thanh toán linh hoạt với các tùy chọn khác nhau
  processFlexibleCheckout: async (payload: FlexibleCheckoutRequest): Promise<FlexibleCheckoutResponse> => {
    const { data } = await apiClient.post('/flexiblecheckout/process-flexible-checkout', payload);
    return data;
  },

  // Thanh toán bằng ví điện tử cho các sản phẩm đã chọn
  paySelectedWithWallet: async (payload: PaySelectedWithWalletRequest): Promise<FlexibleCheckoutResponse> => {
    const { data } = await apiClient.post('/flexiblecheckout/pay-selected-with-wallet', payload);
    return data;
  },

  // Các phương thức tiện ích cho các tình huống thường gặp

  selectAllItems: async (checkoutSessionId: string): Promise<FlexibleCheckoutResponse> => {
    const session = await flexibleCheckoutService.getSession(checkoutSessionId);
    if (session.success && session.data) {
      const allItemIds = session.data.items.map((item: CheckoutSessionItemDto) => item.checkoutSessionItemId);
      return flexibleCheckoutService.updateSelection(checkoutSessionId, { selectedItemIds: allItemIds });
    }
    return { success: false, message: 'Failed to get session' };
  },

  selectByProvider: async (checkoutSessionId: string, providerId: string, providerType: string): Promise<FlexibleCheckoutResponse> => {
    const session = await flexibleCheckoutService.getSession(checkoutSessionId);
    if (session.success && session.data) {
      const providerItems = session.data.items.filter((item: CheckoutSessionItemDto) => 
        (item.supplierId === providerId || item.designerId === providerId) && item.providerType === providerType
      );
      const itemIds = providerItems.map(item => item.checkoutSessionItemId);
      return flexibleCheckoutService.updateSelection(checkoutSessionId, { 
        selectedItemIds: itemIds,
        providerIdFilter: providerId,
        providerTypeFilter: providerType
      });
    }
    return { success: false, message: 'Failed to get session' };
  },

  deselectAllItems: async (checkoutSessionId: string): Promise<FlexibleCheckoutResponse> => {
    return flexibleCheckoutService.updateSelection(checkoutSessionId, { selectedItemIds: [] });
  },

  payByProvider: async (checkoutSessionId: string, providerId: string, addressId?: number): Promise<FlexibleCheckoutResponse> => {
    return flexibleCheckoutService.paySelectedWithWallet({
      checkoutSessionId,
      selectedItemIds: [], // Will be determined by provider filter
      checkoutMode: 'ByProvider',
      providerIdFilter: providerId,
      addressId
    });
  },

  payAllSelected: async (checkoutSessionId: string, selectedItemIds: number[], addressId?: number): Promise<FlexibleCheckoutResponse> => {
    return flexibleCheckoutService.paySelectedWithWallet({
      checkoutSessionId,
      selectedItemIds,
      checkoutMode: 'Selected',
      addressId
    });
  },

  payAllItems: async (checkoutSessionId: string, addressId?: number): Promise<FlexibleCheckoutResponse> => {
    return flexibleCheckoutService.paySelectedWithWallet({
      checkoutSessionId,
      selectedItemIds: [],
      checkoutMode: 'All',
      addressId
    });
  }
};