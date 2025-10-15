import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ProvinceDistrictSelector from "./ProvinceDistrictSelector";
import { UserAddress } from "../../services/api/userAddressService";
import { useAuthStore } from "../../store/authStore";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: UserAddress;
  onSubmit: (addressData: Partial<UserAddress>) => void;
  isLoading: boolean;
}

type AddressType = "office" | "home";

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  address,
  onSubmit,
  isLoading,
}) => {
  const { user } = useAuthStore();
  const [allowEditName, setAllowEditName] = useState(false);
  const [formData, setFormData] = useState({
    senderName: address?.senderName || user?.fullName || "",
    personalPhoneNumber: address?.personalPhoneNumber || user?.phone || "",
    city: address?.city || "",
    district: address?.district || "",
    ward: "",
    addressLine: address?.addressLine || "",
    country: "Việt Nam",
    isDefault: address?.isDefault || false,
    addressType: "home" as AddressType,
  });

  // Update form data when user or address changes
  useEffect(() => {
    if (address) {
      // Editing existing address - populate all fields from address
      setFormData({
        senderName: address.senderName || "",
        personalPhoneNumber: address.personalPhoneNumber || "",
        city: address.city || "",
        district: address.district || "",
        ward: "",
        addressLine: address.addressLine || "",
        country: address.country || "Việt Nam",
        isDefault: address.isDefault || false,
        addressType: "home" as AddressType,
      });
      setAllowEditName(false); // Reset edit name state
    } else if (user) {
      // Creating new address - use user info as defaults
      setFormData((prev) => ({
        ...prev,
        senderName: user.fullName || "",
        personalPhoneNumber: user.phone || "",
      }));
      setAllowEditName(false); // Reset edit name state
    }
  }, [address, user]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAllowEditName(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      senderName: formData.senderName,
      city: formData.city,
      district: formData.district,
      addressLine: formData.addressLine,
      personalPhoneNumber: formData.personalPhoneNumber,
      country: formData.country,
      isDefault: formData.isDefault,
    };

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (provinceName: string) => {
    handleChange("city", provinceName);
    // Clear district when province changes
    handleChange("district", "");
    handleChange("ward", "");
  };

  const handleDistrictChange = (districtName: string) => {
    handleChange("district", districtName);
    // Clear ward when district changes
    handleChange("ward", "");
  };

  const handleWardChange = (wardName: string) => {
    handleChange("ward", wardName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {address ? "Sửa Địa chỉ" : "Địa chỉ mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Full Name and Phone */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên người nhận {!address && "(từ thông tin tài khoản)"}
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => handleChange("senderName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={user?.fullName || "Nhập họ và tên người nhận"}
                  disabled={!address && !!user?.fullName && !allowEditName} // Disable for new address if user has name and not allowing edit
                  required
                />
                {!address && user?.fullName && !allowEditName && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Sử dụng tên từ tài khoản
                    </p>
                    <button
                      type="button"
                      onClick={() => setAllowEditName(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Thay đổi cho địa chỉ này
                    </button>
                  </div>
                )}
                {!address && allowEditName && (
                  <p className="text-xs text-yellow-600 mt-1">
                    💡 Thay đổi này chỉ áp dụng cho địa chỉ này, không ảnh hưởng
                    đến tài khoản.
                  </p>
                )}
                {address && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tên người nhận hàng tại địa chỉ này
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại{" "}
                  {!address && user?.phone && "(từ thông tin tài khoản)"}
                </label>
                <input
                  type="tel"
                  value={formData.personalPhoneNumber}
                  onChange={(e) =>
                    handleChange("personalPhoneNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={user?.phone || "Nhập số điện thoại"}
                />
                {!address &&
                  user?.phone &&
                  formData.personalPhoneNumber === user.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      Số điện thoại từ tài khoản. Bạn có thể thay đổi cho địa
                      chỉ này.
                    </p>
                  )}
              </div>
            </div>

            {/* Province/District Selector - Using API v2 */}
            <ProvinceDistrictSelector
              selectedProvince={formData.city}
              selectedDistrict={formData.district}
              selectedWard={formData.ward}
              onProvinceChange={handleProvinceChange}
              onDistrictChange={handleDistrictChange}
              onWardChange={handleWardChange}
              showWards={true}
            />

            {/* Address Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đường, Tòa nhà, Số nhà *
              </label>
              <textarea
                value={formData.addressLine}
                onChange={(e) => handleChange("addressLine", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="Ví dụ: 216 Nguyễn Huệ"
                required
              />
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                Đặt làm địa chỉ mặc định
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại địa chỉ:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="addressType"
                    value="office"
                    checked={formData.addressType === "office"}
                    onChange={(e) =>
                      handleChange("addressType", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Văn Phòng</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="addressType"
                    value="home"
                    checked={formData.addressType === "home"}
                    onChange={(e) =>
                      handleChange("addressType", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Nhà Riêng</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.senderName ||
                !formData.city ||
                !formData.district ||
                !formData.addressLine
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? "Đang xử lý..." : "HOÀN THÀNH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
