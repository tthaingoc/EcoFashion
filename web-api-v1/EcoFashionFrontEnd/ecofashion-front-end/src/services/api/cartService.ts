import apiClient, { handleApiResponse, type BaseApiResponse } from './baseApi';

export type ServerCartItemDto = {
  cartItemId: number;
  materialId: number;
  quantity: number;
  unitPriceSnapshot: number;
  currentPrice: number;
  materialName?: string;
  imageUrl?: string;
  unitLabel?: string;
  supplierId: string;
  supplierName?: string;
};

export type ServerCartDto = {
  cartId: number;
  isActive: boolean;
  updatedAt: string;
  items: ServerCartItemDto[];
  subtotal: number;
};

export type UpsertCartItemRequest = {
  materialId: number;
  quantity: number;
};

export type UpdateCartItemQuantityRequest = { quantity: number };

export const cartService = {
  async getCart(): Promise<ServerCartDto> {
    const resp = await apiClient.get<BaseApiResponse<ServerCartDto>>(`/Cart`);
    return handleApiResponse(resp);
  },
  async upsertItem(payload: UpsertCartItemRequest): Promise<ServerCartDto> {
    const resp = await apiClient.put<BaseApiResponse<ServerCartDto>>(`/Cart/items`, payload);
    return handleApiResponse(resp);
  },
  async updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartDto> {
    const resp = await apiClient.patch<BaseApiResponse<ServerCartDto>>(`/Cart/items/${cartItemId}`, { quantity });
    return handleApiResponse(resp);
  },
  async removeItem(cartItemId: number): Promise<ServerCartDto> {
    const resp = await apiClient.delete<BaseApiResponse<ServerCartDto>>(`/Cart/items/${cartItemId}`);
    return handleApiResponse(resp);
  },
  async clear(): Promise<ServerCartDto> {
    const resp = await apiClient.post<BaseApiResponse<ServerCartDto>>(`/Cart/clear`, {});
    return handleApiResponse(resp);
  },
};


