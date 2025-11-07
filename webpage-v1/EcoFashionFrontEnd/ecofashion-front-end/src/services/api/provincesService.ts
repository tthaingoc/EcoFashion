// Service for Vietnam provinces/districts/wards API
// Using vnappmob API: https://vapi.vnappmob.com/

// API Response interfaces
export interface ProvinceV2 {
  province_id: string;
  province_name: string;
  province_type: string;
}

export interface DistrictV2 {
  district_id: string;
  district_name: string;
  district_type: string;
  province_id: string;
}

export interface WardV2 {
  ward_id: string;
  ward_name: string;
  ward_type: string;
  district_id: string;
}

// API wrapper response
interface ApiResponse<T> {
  results: T[];
}

// Processed interfaces for UI consistency
export interface Province {
  code: string;
  name: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface Ward {
  code: string;
  name: string;
}

const BASE_URL = 'https://vapi.vnappmob.com/api/v2';

export const provincesService = {
  // Get all provinces
  getAllProvinces: async (): Promise<ProvinceV2[]> => {
    try {
      const response = await fetch(`${BASE_URL}/province/`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data: ApiResponse<ProvinceV2> = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Get districts for a specific province
  getDistrictsForProvince: async (provinceId: string): Promise<DistrictV2[]> => {
    try {
      const response = await fetch(`${BASE_URL}/province/district/${provinceId}`);
      if (!response.ok) throw new Error(`Failed to fetch districts for province ${provinceId}`);
      const data: ApiResponse<DistrictV2> = await response.json();
      return data.results;
    } catch (error) {
      console.error(`Error fetching districts for province ${provinceId}:`, error);
      throw error;
    }
  },

  // Get wards for a specific district
  getWardsForDistrict: async (districtId: string): Promise<WardV2[]> => {
    try {
      const response = await fetch(`${BASE_URL}/province/ward/${districtId}`);
      if (!response.ok) throw new Error(`Failed to fetch wards for district ${districtId}`);
      const data: ApiResponse<WardV2> = await response.json();
      return data.results;
    } catch (error) {
      console.error(`Error fetching wards for district ${districtId}:`, error);
      throw error;
    }
  },

  // Convert API data to UI format
  convertToUIFormat: (provincesV2: ProvinceV2[]): Province[] => {
    return provincesV2.map(province => ({
      code: province.province_id,
      name: province.province_name,
      districts: []
    }));
  },

  // Search provinces by name
  searchProvinces: async (query: string): Promise<ProvinceV2[]> => {
    try {
      const allProvinces = await provincesService.getAllProvinces();
      return allProvinces.filter(province =>
        province.province_name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching provinces:', error);
      throw error;
    }
  },

  // Helper function to format address
  formatAddress: (province?: string, district?: string, ward?: string, addressLine?: string): string => {
    const parts: string[] = [];

    if (addressLine) parts.push(addressLine);
    if (ward) parts.push(ward);
    if (district) parts.push(district);
    if (province) parts.push(province);

    return parts.join(', ');
  },

  // Validate if province exists
  validateProvince: async (provinceName: string): Promise<boolean> => {
    try {
      const provinces = await provincesService.getAllProvinces();
      return provinces.some(p => p.province_name === provinceName);
    } catch (error) {
      console.error('Error validating province:', error);
      return false;
    }
  }
};

export default provincesService;