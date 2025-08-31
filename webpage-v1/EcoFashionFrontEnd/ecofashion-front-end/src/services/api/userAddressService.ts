import apiClient from "./baseApi";

export interface UserAddress {
  addressId: number;
  userId: number;
  addressLine?: string;
  city?: string;
  district?: string;
  // Thay zipCode bằng personalPhoneNumber: số điện thoại liên hệ giao hàng
  personalPhoneNumber?: string;
  country?: string;
  isDefault: boolean;
  // Note: fullName không có trong UserAddress table, sẽ dùng User.fullName làm fallback ở UI
}

export interface CreateAddressRequest {
  addressLine?: string;
  city?: string;
  district?: string;
  // Số điện thoại nhận hàng (thay cho Mã bưu điện)
  personalPhoneNumber?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  addressLine?: string;
  city?: string;
  district?: string;
  // Số điện thoại nhận hàng (thay cho Mã bưu điện)
  personalPhoneNumber?: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressFormData {
  addressLine: string;
  city: string;
  district: string;
  // Số điện thoại liên hệ giao hàng tại địa chỉ này
  personalPhoneNumber: string;
  country: string;
  isDefault: boolean;
  // Note: fullName để trong form UI nhưng không lưu vào UserAddress table
}

export const userAddressService = {
  // Get all addresses for current user
  getAll: async (): Promise<UserAddress[]> => {
    const { data } = await apiClient.get("/useraddress");
    return data?.result || data || [];
  },

  // Get specific address by ID
  getById: async (addressId: number): Promise<UserAddress> => {
    const { data } = await apiClient.get(`/useraddress/${addressId}`);
    return data?.result || data;
  },

  // Get default address
  getDefault: async (): Promise<UserAddress> => {
    const { data } = await apiClient.get("/useraddress/default");
    return data?.result || data;
  },

  // Create new address
  create: async (addressData: CreateAddressRequest): Promise<UserAddress> => {
    const { data } = await apiClient.post("/useraddress", addressData);
    return data?.result || data;
  },

  // Update existing address
  update: async (
    addressId: number,
    addressData: UpdateAddressRequest
  ): Promise<UserAddress> => {
    const { data } = await apiClient.put(
      `/useraddress/${addressId}`,
      addressData
    );
    return data?.result || data;
  },

  // Delete address
  delete: async (addressId: number): Promise<void> => {
    await apiClient.delete(`/useraddress/${addressId}`);
  },

  // Set address as default
  setDefault: async (addressId: number): Promise<UserAddress> => {
    const { data } = await apiClient.put(
      `/useraddress/${addressId}/set-default`
    );
    return data?.result || data;
  },

  // Get formatted address string
  getFormatted: async (addressId: number): Promise<string> => {
    const { data } = await apiClient.get(`/useraddress/${addressId}/formatted`);
    return data?.formattedAddress || "";
  },

  // Get default formatted address string
  getDefaultFormatted: async (): Promise<string> => {
    const { data } = await apiClient.get("/useraddress/default/formatted");
    return data?.formattedAddress || "";
  },

  // Helper function to format address client-side
  formatAddress: (address: UserAddress): string => {
    const parts: string[] = [];

    if (address.addressLine) parts.push(address.addressLine);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    // Hiển thị số điện thoại ở cuối chuỗi địa chỉ nếu có
    if (address.personalPhoneNumber) parts.push(address.personalPhoneNumber);
    if (address.country) parts.push(address.country);

    return parts.join(", ");
  },

  // Helper function to validate address data
  validateAddress: (address: Partial<AddressFormData>): string[] => {
    const errors: string[] = [];

    if (!address.addressLine?.trim()) {
      errors.push("Địa chỉ cụ thể là bắt buộc");
    }

    if (!address.city?.trim()) {
      errors.push("Thành phố là bắt buộc");
    }

    if (!address.district?.trim()) {
      errors.push("Quận/Huyện là bắt buộc");
    }

    return errors;
  },

  // Helper function to check if address is complete
  isAddressComplete: (address: UserAddress): boolean => {
    return !!(address.addressLine && address.city && address.district);
  },
};

export default userAddressService;
