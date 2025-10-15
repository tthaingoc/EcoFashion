//import apiClient from "./baseApi";
//service gửi request cho api provinces.open-api.vn
//https://provinces.open-api.vn/docs/

// Using fetch for simplicity; can replace with axios or other HTTP client if needed
// API v2 interfaces based on actual response structure
export interface ProvinceV2 {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts?: DistrictV2[];
  wards?: WardV2[];
}

export interface DistrictV2 {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards?: WardV2[];
}

export interface WardV2 {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code?: number;
  province_code?: number;
  short_codename?: string;
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

const BASE_URL = 'https://provinces.open-api.vn/api/v2';

export const provincesService = {
  // Get all provinces from API v2
  getAllProvinces: async (): Promise<ProvinceV2[]> => {
    try {
      const response = await fetch(`${BASE_URL}/p/`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      return response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Get province with districts and wards
  getProvinceWithDetails: async (provinceCode: number): Promise<ProvinceV2> => {
    try {
      const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) throw new Error(`Failed to fetch province ${provinceCode}`);
      return response.json();
    } catch (error) {
      console.error(`Error fetching province ${provinceCode}:`, error);
      throw error;
    }
  },

  // Get all provinces with full details (districts and wards)
  getAllProvincesWithDetails: async (): Promise<ProvinceV2[]> => {
    try {
      const response = await fetch(`${BASE_URL}/?depth=2`);
      if (!response.ok) throw new Error('Failed to fetch provinces with details');
      return response.json();
    } catch (error) {
      console.error('Error fetching provinces with details:', error);
      throw error;
    }
  },

  // Convert API v2 data to UI format
  convertToUIFormat: (provincesV2: ProvinceV2[]): Province[] => {
    return provincesV2.map(province => ({
      code: province.code.toString(),
      name: province.name,
      districts: [] // Will be populated when needed
    }));
  },

  // Get districts for a specific province
  getDistrictsForProvince: async (provinceCode: number): Promise<DistrictV2[]> => {
    try {
      const province = await provincesService.getProvinceWithDetails(provinceCode);

      // API v2 structure: wards are directly under province, need to group by district
      if (province.wards) {
        // Group wards by district_code if available
        const districtsMap = new Map<number, DistrictV2>();

        province.wards.forEach(ward => {
          if (ward.district_code) {
            if (!districtsMap.has(ward.district_code)) {
              // Create district entry (we'll need to derive district name from wards)
              districtsMap.set(ward.district_code, {
                name: ward.name.split(',')[0] || 'District', // Extract district name from ward
                code: ward.district_code,
                division_type: 'huyện',
                codename: ward.codename.split('_')[0] || '',
                province_code: provinceCode,
                wards: []
              });
            }
            districtsMap.get(ward.district_code)!.wards!.push(ward);
          }
        });

        return Array.from(districtsMap.values());
      }

      return [];
    } catch (error) {
      console.error(`Error fetching districts for province ${provinceCode}:`, error);
      throw error;
    }
  },

  // Search provinces by name
  searchProvinces: async (query: string): Promise<ProvinceV2[]> => {
    try {
      const allProvinces = await provincesService.getAllProvinces();
      return allProvinces.filter(province =>
        province.name.toLowerCase().includes(query.toLowerCase()) ||
        province.codename.includes(query.toLowerCase())
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
      return provinces.some(p => p.name === provinceName);
    } catch (error) {
      console.error('Error validating province:', error);
      return false;
    }
  }
};

export default provincesService;