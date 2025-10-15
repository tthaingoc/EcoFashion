import { useQuery } from '@tanstack/react-query';
import { provincesService, ProvinceV2, DistrictV2 } from '../services/api/provincesService';

const QUERY_KEYS = {
  provinces: ['provinces-v2'],
  provincesWithDetails: ['provinces-v2', 'details'],
  provinceDetails: (code: number) => ['provinces-v2', 'details', code],
  districts: (provinceCode: number) => ['provinces-v2', 'districts', provinceCode],
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

// Hook to get all provinces with full details (includes wards)
export const useProvincesWithDetailsV2 = () => {
  return useQuery({
    queryKey: QUERY_KEYS.provincesWithDetails,
    queryFn: provincesService.getAllProvincesWithDetails,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Hook to get specific province with details
export const useProvinceDetailsV2 = (provinceCode: number | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.provinceDetails(provinceCode!),
    queryFn: () => provincesService.getProvinceWithDetails(provinceCode!),
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Hook to get districts for a province
export const useDistrictsV2 = (provinceCode: number | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.districts(provinceCode!),
    queryFn: () => provincesService.getDistrictsForProvince(provinceCode!),
    enabled: !!provinceCode,
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

// Helper hook to convert province name to code
export const useProvinceCode = (provinceName: string) => {
  const { data: provinces } = useProvincesV2();

  if (!provinces || !provinceName) return null;

  const province = provinces.find(p => p.name === provinceName);
  return province?.code || null;
};

// Helper hook to convert province code to name
export const useProvinceName = (provinceCode: number) => {
  const { data: provinces } = useProvincesV2();

  if (!provinces || !provinceCode) return null;

  const province = provinces.find(p => p.code === provinceCode);
  return province?.name || null;
};

// Hook to get wards from a province (flattened)
export const useWardsFromProvinceV2 = (provinceCode: number | null) => {
  const { data: provinceDetails } = useProvinceDetailsV2(provinceCode);

  return {
    data: provinceDetails?.wards || [],
    isLoading: !provinceDetails && !!provinceCode,
  };
};