import React, { useState } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
  useUserAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress
} from '../../hooks/useAddressManagement';
import { UserAddress } from '../../services/api/userAddressService';
import AddressFormModal from './AddressFormModal';
import { useAuthStore } from '../../store/authStore';


// Props cho component chọn địa chỉ giao hàng trong Standard Checkout
interface AddressSelectorProps {
  selectedAddressId?: number;
  onAddressSelect: (address: UserAddress) => void;
  className?: string;
}


// Helper function to get address type icon and label
const getAddressTypeDisplay = (address: UserAddress) => {
  // Simple logic to determine if it's office or home based on address content
  const addressText = `${address.addressLine} ${address.district} ${address.city}`.toLowerCase();
  const isOffice = addressText.includes('công ty') ||
    addressText.includes('văn phòng') ||
    addressText.includes('tòa nhà') ||
    addressText.includes('building');
  return {
    icon: isOffice ? BuildingOfficeIcon : HomeIcon,
    label: isOffice ? 'Văn Phòng' : 'Nhà Riêng',
    bgColor: isOffice ? 'bg-blue-100' : 'bg-green-100',
    textColor: isOffice ? 'text-blue-700' : 'text-green-700'
  };
};


const AddressSelectorTailwind: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();
  const { user } = useAuthStore(); // Get user info to use as fallback for fullName
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
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-xl"></div>
        ))}
      </div>
    );
  }


  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h3>
        <button
          onClick={handleCreateAddress}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          + Thêm địa chỉ
        </button>
      </div>


      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium text-gray-700 mb-2">Chưa có địa chỉ nào</h4>
            <p className="text-sm text-gray-500 mb-4">Thêm địa chỉ giao hàng để tiếp tục đặt hàng</p>
            <button
              onClick={handleCreateAddress}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          addresses.map((address: UserAddress) => {
            const typeDisplay = getAddressTypeDisplay(address);
            const TypeIcon = typeDisplay.icon;

            return (
              <div
                key={address.addressId}
                className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedAddressId === address.addressId
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => onAddressSelect(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {selectedAddressId === address.addressId && (
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {address.isDefault && (
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
                          Mặc định
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${typeDisplay.bgColor} ${typeDisplay.textColor}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeDisplay.label}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      {/* Dòng 1: Full Name - Sử dụng User.fullName làm fallback */}
                      <p className="font-semibold text-gray-900 text-base">
                        {user?.fullName || 'Người nhận'}
                      </p>

                      {/* Dòng 2: Address Line */}
                      <p className="text-gray-700 text-sm">
                        {address.addressLine}
                      </p>

                      {/* Dòng 3: District, City */}
                      <p className="text-gray-600 text-sm">
                        {[address.district, address.city].filter(Boolean).join(', ')}
                      </p>

                      {/* Dòng 4: Country */}
                      <p className="text-gray-500 text-sm">
                        {address.country || 'Việt Nam'}
                      </p>
                    </div>

                    {address.personalPhoneNumber && (
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <span className="w-4 h-4 text-gray-400">📞</span>
                        {address.personalPhoneNumber}
                      </p>
                    )}
                  </div>


                  <div className="flex flex-col gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.addressId);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                      >
                        Đặt mặc định
                      </button>
                    )}

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.addressId);
                        }}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      <AddressFormModal
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

