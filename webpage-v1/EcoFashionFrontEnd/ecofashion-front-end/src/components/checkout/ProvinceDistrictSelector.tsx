//file này dùng để chọn tỉnh thành, quận huyện, phường xã trong quá trình thanh toán api v2
import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  useProvincesV2,
  useDistrictsV2,
  useWardsV2,
  useProvinceCode,
} from "../../hooks/useProvincesV2";
import SearchableSelect from "./SearchableSelect";

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
  className = "",
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
    null
  );

  // Fetch all provinces
  const { data: provinces = [], isLoading: provincesLoading } =
    useProvincesV2();

  // Get province code from name
  const provinceCodeFromName = useProvinceCode(selectedProvince || "");

  // Fetch districts when province is selected
  const { data: districts = [], isLoading: districtsLoading } =
    useDistrictsV2(selectedProvinceId);

  // Fetch wards when district is selected
  const { data: wards = [], isLoading: wardsLoading } =
    useWardsV2(selectedDistrictId);

  // Update selected province ID when selectedProvince changes
  useEffect(() => {
    if (selectedProvince && provinceCodeFromName) {
      setSelectedProvinceId(provinceCodeFromName);
    } else {
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
    }
  }, [selectedProvince, provinceCodeFromName]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    const province = provinces.find((p) => p.province_name === provinceName);
    if (province) {
      onProvinceChange(provinceName, province.province_id);
      setSelectedProvinceId(province.province_id);
      setSelectedDistrictId(null);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    const district = districts.find((d) => d.district_name === districtName);
    if (district) {
      onDistrictChange(districtName, district.district_id);
      setSelectedDistrictId(district.district_id);
    }
  };

  const handleWardChange = (wardName: string) => {
    const ward = wards.find((w) => w.ward_name === wardName);
    if (ward && onWardChange) {
      onWardChange(wardName, ward.ward_id);
    }
  };

  const selectClassName = `w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed`;

  if (provincesLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Province Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố *
          <span className="text-xs text-blue-600 ml-1">(API v2)</span>
        </label>
        <div className="relative">
          <select
            value={selectedProvince || ""}
            onChange={handleProvinceChange}
            disabled={disabled || provincesLoading}
            className={selectClassName}
            required
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.province_id} value={province.province_name}>
                {province.province_name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* District Selector - Searchable */}
      <SearchableSelect
        items={districts}
        value={selectedDistrict || ""}
        onChange={handleDistrictChange}
        getLabel={(district) => district.district_name}
        getValue={(district) => district.district_name}
        label="Quận/Huyện"
        placeholder={
          !selectedProvince
            ? "Chọn Tỉnh/Thành phố trước"
            : districtsLoading
            ? "Đang tải danh sách quận/huyện..."
            : districts.length === 0
            ? "Không có quận/huyện"
            : "Nhập tên quận/huyện để tìm kiếm..."
        }
        disabled={
          disabled ||
          !selectedProvince ||
          districts.length === 0 ||
          districtsLoading
        }
        required
        emptyMessage="Không có quận/huyện"
        helperText={
          districtsLoading
            ? "Đang tải danh sách quận/huyện..."
            : selectedDistrict
            ? undefined
            : "💡 Bạn có thể gõ tiếng Việt có dấu để tìm kiếm"
        }
      />

      {/* Ward Selector - Searchable */}
      {showWards && (
        <SearchableSelect
          items={wards}
          value={selectedWard || ""}
          onChange={handleWardChange}
          getLabel={(ward) => ward.ward_name}
          getValue={(ward) => ward.ward_name}
          label={`Phường/Xã${
            wards.length > 0 ? ` (${wards.length} lựa chọn)` : ""
          }`}
          placeholder={
            !selectedDistrict
              ? "Chọn Quận/Huyện trước"
              : wardsLoading
              ? "Đang tải danh sách phường/xã..."
              : wards.length === 0
              ? "Không có phường/xã"
              : "Nhập tên phường/xã để tìm kiếm..."
          }
          disabled={
            disabled || !selectedDistrict || wards.length === 0 || wardsLoading
          }
          emptyMessage="Không có phường/xã"
          helperText={
            selectedWard
              ? undefined
              : wards.length > 0
              ? "💡 Gõ 'phuong vuon' để tìm 'Phường Vườn Lài'"
              : undefined
          }
        />
      )}

      {/* API Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">🌐</div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">
              Sử dụng API Provinces v2 (VNappmob)
            </p>
            <p className="text-xs text-blue-600">
              Dữ liệu tỉnh/thành phố, quận/huyện, phường/xã được cập nhật từ API
              vnappmob.com
            </p>
            {selectedProvinceId && (
              <p className="text-xs text-blue-600 mt-1">
                Đã tải:{" "}
                {
                  provinces.find((p) => p.province_id === selectedProvinceId)
                    ?.province_name
                }
                {districts.length > 0 && ` (${districts.length} quận/huyện)`}
                {wards.length > 0 && ` - ${wards.length} phường/xã`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinceDistrictSelector;
