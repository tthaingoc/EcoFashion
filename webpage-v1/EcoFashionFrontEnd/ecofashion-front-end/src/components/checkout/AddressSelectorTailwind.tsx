import React, { useState } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { 
  useUserAddresses, 
  useCreateAddress, 
  useUpdateAddress, 
  useDeleteAddress,
  useSetDefaultAddress 
} from '../../hooks/useAddressManagement';
import { UserAddress } from '../../services/api/userAddressService';

// Sử dụng UserAddress từ service; đã đổi zipCode -> personalPhoneNumber

// Props cho component chọn địa chỉ giao hàng trong Standard Checkout
interface AddressSelectorProps {
  selectedAddressId?: number; // ID địa chỉ đã chọn
  onAddressSelect: (address: UserAddress) => void; // Callback khi chọn địa chỉ
  className?: string;
}

const AddressModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  address?: UserAddress;
  onSubmit: (addressData: Partial<UserAddress>) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, address, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    addressLine: address?.addressLine || '',
    city: address?.city || '',
    district: address?.district || '',
    // Số điện thoại liên hệ tại địa chỉ
    personalPhoneNumber: address?.personalPhoneNumber || '',
    country: address?.country || 'Vietnam',
    isDefault: address?.isDefault || false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cụ thể *
              </label>
              <input
                type="text"
                value={formData.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quận/Huyện"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành phố *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Thành phố"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="tel"
                  value={formData.personalPhoneNumber}
                  onChange={(e) => handleChange('personalPhoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 0912345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quốc gia
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quốc gia"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Đang xử lý...' : (address ? 'Cập nhật' : 'Thêm địa chỉ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddressSelectorTailwind: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();
  
  const { data: addresses = [], isLoading } = useUserAddresses();
  const { mutateAsync: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutateAsync: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutateAsync: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutateAsync: setDefaultAddress } = useSetDefaultAddress();

  const handleCreateAddress = () => {
    setEditingAddress(undefined);
    setShowModal(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleSubmitAddress = async (addressData: Partial<UserAddress>) => {
    try {
      if (editingAddress) {
        await updateAddress({
          addressId: editingAddress.addressId,
          data: addressData,
        });
      } else {
        await createAddress(addressData);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Address operation error:', error);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    await setDefaultAddress(addressId);
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h3>
        <button
          onClick={handleCreateAddress}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPinIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-3">Chưa có địa chỉ nào</p>
            <button
              onClick={handleCreateAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          addresses.map((address: UserAddress) => (
            <div
              key={address.addressId}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddressId === address.addressId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-medium">
                        Mặc định
                      </span>
                    )}
                    {selectedAddressId === address.addressId && (
                      <CheckIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  
                  <p className="font-medium text-gray-900 mb-1">
                    {address.addressLine}
                  </p>
                  
                  <p className="text-gray-600 text-sm">
                    {[address.district, address.city, address.country].filter(Boolean).join(', ')}
                  </p>
                  
                  {address.personalPhoneNumber && (
                    <p className="text-gray-500 text-xs mt-1">
                      Điện thoại: {address.personalPhoneNumber}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.addressId);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.addressId);
                    }}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        address={editingAddress}
        onSubmit={handleSubmitAddress}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default AddressSelectorTailwind;