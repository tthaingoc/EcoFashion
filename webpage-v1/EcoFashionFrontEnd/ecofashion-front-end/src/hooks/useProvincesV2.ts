import { useQuery } from '@tanstack/react-query';
import { provincesService, ProvinceV2, DistrictV2 } from '../services/api/provincesService';

const QUERY_KEYS = {
  provinces: ['provinces-v2'],
  districts: (provinceId: string) => ['provinces-v2', 'districts', provinceId],
  wards: (districtId: string) => ['provinces-v2', 'wards', districtId],
} as const;

// Hook to get all provinces (basic info only)
export const useProvincesV2 = () => {
  return useQuery({
    queryKey: QUERY_KEYS.provinces,
    queryFn: provincesService.getAllProvinces,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - provinces don't change often
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Hook to get districts for a province
export const useDistrictsV2 = (provinceId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.districts(provinceId!),
    queryFn: () => provincesService.getDistrictsForProvince(provinceId!),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Hook to get wards for a district
export const useWardsV2 = (districtId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.wards(districtId!),
    queryFn: () => provincesService.getWardsForDistrict(districtId!),
    enabled: !!districtId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Hook for province search
export const useProvinceSearch = (query: string) => {
  return useQuery({
    queryKey: ['provinces-v2', 'search', query],
    queryFn: () => provincesService.searchProvinces(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes for search results
  });
};

// Helper hook to convert province name to ID
export const useProvinceCode = (provinceName: string) => {
  const { data: provinces } = useProvincesV2();

  if (!provinces || !provinceName) return null;

  const province = provinces.find(p => p.province_name === provinceName);
  return province?.province_id || null;
};

// Helper hook to convert province ID to name
export const useProvinceName = (provinceId: string) => {
  const { data: provinces } = useProvincesV2();

  if (!provinces || !provinceId) return null;

  const province = provinces.find(p => p.province_id === provinceId);
  return province?.province_name || null;
};