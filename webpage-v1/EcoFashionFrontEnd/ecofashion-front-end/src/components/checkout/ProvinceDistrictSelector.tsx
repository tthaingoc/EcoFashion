import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { 
  VIETNAM_PROVINCES, 
  findDistrictsByProvince, 
  findWardsByDistrict,
  type Province,
  type District,
  type Ward
} from '../../data/vietnamRegions';

interface ProvinceDistrictSelectorProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  selectedWard?: string;
  onProvinceChange: (province: string, provinceCode: string) => void;
  onDistrictChange: (district: string, districtCode: string) => void;
  onWardChange?: (ward: string, wardCode: string) => void;
  showWards?: boolean;
  disabled?: boolean;
  className?: string;
}

const ProvinceDistrictSelector: React.FC<ProvinceDistrictSelectorProps> = ({
  selectedProvince,
  selectedDistrict,
  selectedWard,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  showWards = true,
  disabled = false,
  className = '',
}) => {
  const [provinces] = useState<Province[]>(VIETNAM_PROVINCES);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.name === selectedProvince);
      if (province) {
        setSelectedProvinceCode(province.code);
        const provinceDistricts = findDistrictsByProvince(province.code);
        setDistricts(provinceDistricts);
        
        // Clear wards if district is not selected
        if (!selectedDistrict) {
          setWards([]);
        }
      }
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
    }
  }, [selectedProvince, provinces, selectedDistrict]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict && selectedProvinceCode) {
      const district = districts.find(d => d.name === selectedDistrict);
      if (district) {
        setSelectedDistrictCode(district.code);
        const districtWards = findWardsByDistrict(selectedProvinceCode, district.code);
        setWards(districtWards);
      }
    } else {
      setWards([]);
      setSelectedDistrictCode('');
    }
  }, [selectedDistrict, selectedProvinceCode, districts]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);
    if (province) {
      onProvinceChange(provinceName, province.code);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);
    if (district) {
      onDistrictChange(districtName, district.code);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.value;
    const ward = wards.find(w => w.name === wardName);
    if (ward && onWardChange) {
      onWardChange(wardName, ward.code);
    }
  };

  const selectClassName = `w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Province Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố *
        </label>
        <div className="relative">
          <select
            value={selectedProvince || ''}
            onChange={handleProvinceChange}
            disabled={disabled}
            className={selectClassName}
            required
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* District Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện *
        </label>
        <div className="relative">
          <select
            value={selectedDistrict || ''}
            onChange={handleDistrictChange}
            disabled={disabled || !selectedProvince || districts.length === 0}
            className={selectClassName}
            required
          >
            <option value="">
              {!selectedProvince 
                ? "Chọn Tỉnh/Thành phố trước"
                : districts.length === 0 
                ? "Không có quận/huyện"
                : "Chọn Quận/Huyện"
              }
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Ward Selector */}
      {showWards && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã
          </label>
          <div className="relative">
            <select
              value={selectedWard || ''}
              onChange={handleWardChange}
              disabled={disabled || !selectedDistrict || wards.length === 0}
              className={selectClassName}
            >
              <option value="">
                {!selectedDistrict 
                  ? "Chọn Quận/Huyện trước"
                  : wards.length === 0 
                  ? "Không có phường/xã"
                  : "Chọn Phường/Xã (tùy chọn)"
                }
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProvinceDistrictSelector;