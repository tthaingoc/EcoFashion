//file này dùng để chọn tỉnh thành, quận huyện, phường xã trong quá trình thanh toán api v2
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  useProvincesV2,
  useProvinceDetailsV2,
  useProvinceCode,
} from "../../hooks/useProvincesV2";
import { WardV2 } from "../../services/api/provincesService";

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
  //selectedDistrict,
  selectedWard,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  showWards = true,
  disabled = false,
  className = "",
}) => {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictForFilter, setSelectedDistrictForFilter] =
    useState<string>("");

  // Fetch all provinces
  const { data: provinces = [], isLoading: provincesLoading } =
    useProvincesV2();

  // Get province code from name
  const provinceCodeFromName = useProvinceCode(selectedProvince || "");

  // Fetch province details (wards) when province is selected
  const { data: provinceDetails, isLoading: provinceDetailsLoading } =
    useProvinceDetailsV2(selectedProvinceCode);

  // Update selected province code when selectedProvince changes
  useEffect(() => {
    if (selectedProvince && provinceCodeFromName) {
      setSelectedProvinceCode(provinceCodeFromName);
    } else {
      setSelectedProvinceCode(null);
    }
  }, [selectedProvince, provinceCodeFromName]);

  // Extract unique districts from wards
  const districts = useMemo(() => {
    if (!provinceDetails?.wards) return [];

    const districtsMap = new Map<
      string,
      { name: string; code: string; wards: WardV2[] }
    >();

    provinceDetails.wards.forEach((ward) => {
      // Extract district name from ward's codename or division_type
      let districtName = "";
      let districtCode = "";

      // Try to extract district info from ward data
      // In API v2, wards might contain district info in their structure
      if (ward.codename) {
        const parts = ward.codename.split("_");
        if (parts.length >= 2) {
          districtName = parts.slice(0, -1).join(" ").replace(/_/g, " ");
          districtCode = parts.slice(0, -1).join("_");
        }
      }

      // Fallback: create generic district grouping
      if (!districtName) {
        const wardType = ward.division_type || "";
        if (wardType.includes("phường")) {
          districtName = "Quận trung tâm";
          districtCode = "quan_trung_tam";
        } else {
          districtName = "Huyện ngoại thành";
          districtCode = "huyen_ngoai_thanh";
        }
      }

      if (!districtsMap.has(districtCode)) {
        districtsMap.set(districtCode, {
          name: districtName,
          code: districtCode,
          wards: [],
        });
      }

      districtsMap.get(districtCode)!.wards.push(ward);
    });

    return Array.from(districtsMap.values());
  }, [provinceDetails]);

  // Get wards for selected district (for filtering)
  const wards = useMemo(() => {
    if (!selectedDistrictForFilter || !districts.length) return [];

    const district = districts.find(
      (d) => d.name === selectedDistrictForFilter
    );
    return district?.wards || [];
  }, [selectedDistrictForFilter, districts]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    const province = provinces.find((p) => p.name === provinceName);
    if (province) {
      onProvinceChange(provinceName, province.code.toString());
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    setSelectedDistrictForFilter(districtName);
    // Không gọi onDistrictChange ở đây - chỉ để lọc phường/xã
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.value;
    const ward = wards.find((w) => w.name === wardName);
    if (ward) {
      // Lưu ward vào district field để gửi về backend
      onDistrictChange(wardName, ward.code.toString());
      // Vẫn gọi onWardChange nếu có
      if (onWardChange) {
        onWardChange(wardName, ward.code.toString());
      }
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
          Chọn vùng *
          {provinceDetailsLoading && (
            <span className="text-xs text-blue-600 ml-1">(Đang tải...)</span>
          )}
        </label>
        <div className="relative">
          <select
            value={selectedDistrictForFilter || ""}
            onChange={handleDistrictChange}
            disabled={
              disabled ||
              !selectedProvince ||
              districts.length === 0 ||
              provinceDetailsLoading
            }
            className={selectClassName}
            required
          >
            <option value="">
              {!selectedProvince
                ? "Chọn Tỉnh/Thành phố trước"
                : provinceDetailsLoading
                ? "Đang tải danh sách quận/huyện..."
                : districts.length === 0
                ? "Không có quận/huyện"
                : "Chọn Quận/Huyện"}
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.name}>
                {district.name} ({district.wards.length} phường/xã)
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
            {wards.length > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({wards.length} lựa chọn)
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={selectedWard || ""}
              onChange={handleWardChange}
              disabled={
                disabled || !selectedDistrictForFilter || wards.length === 0
              }
              className={selectClassName}
            >
              <option value="">
                {!selectedDistrictForFilter
                  ? "Chọn Quận/Huyện trước"
                  : wards.length === 0
                  ? "Không có phường/xã"
                  : "Chọn Phường/Xã (tùy chọn)"}
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

      {/* API Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">🌐</div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">
              Sử dụng API Provinces v2
            </p>
            <p className="text-xs text-blue-600">
              Dữ liệu tỉnh/thành phố, quận/huyện, phường/xã được cập nhật từ API
              chính thức.
            </p>
            {selectedProvinceCode && (
              <p className="text-xs text-blue-600 mt-1">
                Đã tải:{" "}
                {provinces.find((p) => p.code === selectedProvinceCode)?.name}
                {provinceDetails?.wards?.length &&
                  ` (${provinceDetails.wards.length} phường/xã)`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinceDistrictSelector;
