import apiClient, { handleApiResponse, handleApiError } from './baseApi';
import {
  materialDetailDtoSchema,
  materialDetailResponseSchema,
  materialModelSchema,
  materialCreationFormRequestSchema,
  materialTypeModelSchema,
  materialSustainabilityReportSchema,
  type MaterialDetailDto,
  type MaterialDetailResponse,
  type MaterialModel,
  type MaterialCreationFormRequest,
  type MaterialTypeModel,
  type MaterialSustainabilityReport,
  type MaterialTypeBenchmarkModel,
  materialCreationResponseSchema,
  type MaterialCreationResponse,
} from '../../schemas/materialSchema';

// Type for transport method options from backend
export interface TransportMethodOption {
  method: string;
  estimatedDistance: number;
  icon: string;
  description: string;
  isRecommended: boolean;
  sustainabilityImpact: string;
  color: string;
}

// REMOVED: backendFieldMapping is no longer needed as backend uses consistent camelCase naming

class MaterialService {
  private readonly API_BASE = "Material";

  // Get all materials with sustainability scores (for homepage) - uses new filtered endpoint
  async getAllMaterialsWithSustainability(): Promise<MaterialDetailDto[]> {
    const response = await apiClient.get<any>(`${this.API_BASE}`);
    const result = handleApiResponse<MaterialDetailDto[]>(response);
    
    return result.map((item) => {
      try {
        return materialDetailDtoSchema.parse(item);
      } catch (error) {
        console.error("Schema validation error:", error);
        console.error("Item that failed validation:", item);
        throw error;
      }
    });
  }

  // Get all materials with comprehensive filtering
  async getAllMaterialsWithFilters(filters?: {
    typeId?: number;
    supplierId?: string;
    supplierName?: string;
    materialName?: string;
    productionCountry?: string;
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    hasCertification?: boolean;
    transportMethod?: string;
    sortBySustainability?: boolean;
    publicOnly?: boolean;
  }): Promise<MaterialDetailDto[]> {
    const params = new URLSearchParams();
    
    if (filters?.typeId !== undefined) params.append('typeId', filters.typeId.toString());
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    if (filters?.supplierName) params.append('supplierName', filters.supplierName);
    if (filters?.materialName) params.append('materialName', filters.materialName);
    if (filters?.productionCountry) params.append('productionCountry', filters.productionCountry);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minQuantity !== undefined) params.append('minQuantity', filters.minQuantity.toString());
    if (filters?.hasCertification !== undefined) params.append('hasCertification', filters.hasCertification.toString());
    if (filters?.transportMethod) params.append('transportMethod', filters.transportMethod);
    if (filters?.sortBySustainability !== undefined) params.append('sortBySustainability', filters.sortBySustainability.toString());
    if (filters?.publicOnly !== undefined) params.append('publicOnly', filters.publicOnly.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${this.API_BASE}/filtered?${queryString}` : `${this.API_BASE}/filtered`;
    
    const response = await apiClient.get<any>(url);
    const result = handleApiResponse<MaterialDetailDto[]>(response);
    
    return result.map((item) => {
      try {
        return materialDetailDtoSchema.parse(item);
      } catch (error) {
        console.error("Schema validation error:", error);
        console.error("Item that failed validation:", item);
        throw error;
      }
    });
  }

  // Get all materials (uses default filtering with public only and sustainability sorting)
  async getAllMaterials(): Promise<MaterialDetailDto[]> {
    return this.getAllMaterialsWithSustainability();
  }

  // Get materials by type (uses new filtered endpoint)
  async getMaterialsByType(typeId: number): Promise<MaterialDetailDto[]> {
    return this.getAllMaterialsWithFilters({ typeId, sortBySustainability: true, publicOnly: true });
  }

  // Admin: get all materials regardless of approval/availability
  async getAllMaterialsAdmin(): Promise<MaterialDetailDto[]> {
    const response = await apiClient.get<any>(`/Material/admin/all`);
    const result = handleApiResponse<MaterialDetailDto[] | { success: boolean; result: MaterialDetailDto[] }>(response);
    const data = Array.isArray(result) ? result : (result as any).result;
    return data.map((item) => materialDetailDtoSchema.parse(item));
  }

  // Get material detail by ID
  async getMaterialDetail(id: number): Promise<MaterialDetailResponse> {
    const response = await apiClient.get<any>(`${this.API_BASE}/${id}`);
    const result = handleApiResponse<MaterialDetailResponse>(response);
    return materialDetailResponseSchema.parse(result);
  }

  // Get material by ID (alias for getMaterialDetail)
  async getMaterialById(id: number): Promise<MaterialDetailResponse> {
    const response = await apiClient.get<any>(`${this.API_BASE}/${id}`);
    const result = handleApiResponse<MaterialDetailResponse>(response);
    return materialDetailResponseSchema.parse(result);
  }

  // Create new material with sustainability (returns creation response)
  async createMaterialWithSustainability(request: MaterialCreationFormRequest): Promise<MaterialCreationResponse> {
    try {
      const validatedRequest = materialCreationFormRequestSchema.parse(request);
      const response = await apiClient.post<any>(`${this.API_BASE}/CreateWithSustainability`, validatedRequest);
      const result = handleApiResponse<MaterialCreationResponse>(response);
      return materialCreationResponseSchema.parse(result);
    } catch (error) {
      handleApiError(error as any);
    }
  }

  // Upload images for a material (multipart form)
  async uploadMaterialImages(materialId: number, files: File[]): Promise<{ imageId: number; imageUrl: string }[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await apiClient.post<any>(`${this.API_BASE}/${materialId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return handleApiResponse(response);
  }

  // Admin: approve material
  async approveMaterial(materialId: number, adminNote?: string): Promise<boolean> {
    const body = JSON.stringify(adminNote ?? null);
    const response = await apiClient.post<any>(`${this.API_BASE}/${materialId}/approve`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    const result = handleApiResponse<boolean>(response);
    return !!result;
  }

  // Admin: reject material with optional admin note
  async rejectMaterial(materialId: number, adminNote?: string): Promise<boolean> {
    const body = JSON.stringify(adminNote ?? null);
    const response = await apiClient.post<any>(`${this.API_BASE}/${materialId}/reject`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    const result = handleApiResponse<boolean>(response);
    return !!result;
  }

  // Delete material
  async deleteMaterial(id: number): Promise<void> {
    const response = await apiClient.delete<any>(`${this.API_BASE}/${id}`);
    handleApiResponse<string>(response);
  }

  // Get material sustainability score
  async getMaterialSustainability(materialId: number): Promise<MaterialSustainabilityReport> {
    const response = await apiClient.get<any>(`${this.API_BASE}/Sustainability/${materialId}`);
    const result = handleApiResponse<MaterialSustainabilityReport>(response);
    return materialSustainabilityReportSchema.parse(result);
  }

  // Get all material types (for dropdown)
  async getAllMaterialTypes(): Promise<MaterialTypeModel[]> {
    const response = await apiClient.get<any>(`${this.API_BASE}/GetAllMaterialTypes`);
    const result = handleApiResponse<MaterialTypeModel[]>(response);
    return result.map((item) => materialTypeModelSchema.parse(item));
  }

  // Admin: get benchmarks for a material type (requires admin auth)
  async getBenchmarksByMaterialType(typeId: number): Promise<MaterialTypeBenchmarkModel[]> {
    const response = await apiClient.get<any>(`/MaterialTypes/${typeId}/benchmarks`);
    const api = handleApiResponse<{ success: boolean; result: MaterialTypeBenchmarkModel[] } | MaterialTypeBenchmarkModel[]>(response);
    // Support both ApiResult-wrapped and plain array (just in case)
    const data = Array.isArray(api) ? api : (api as any).result;
    return data as MaterialTypeBenchmarkModel[];
  }

  // Get transport evaluation from backend
  async getTransportEvaluation(distance: number, method: string) {
    try {
      const response = await apiClient.get(`/material/GetTransportEvaluation/${distance}/${method}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get transport evaluation:', error);
      throw error;
    }
  }

  // Get production evaluation from backend
  async getProductionEvaluation(country: string) {
    try {
      const response = await apiClient.get(`/material/GetProductionEvaluation/${country}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get production evaluation:', error);
      throw error;
    }
  }

  // Get recommended transport details (distance, method, description) by country
  async getTransportDetails(country: string): Promise<{ distance: number; method: string; description: string }> {
    const response = await apiClient.get<any>(`/material/CalculateTransport/${encodeURIComponent(country)}`);
    return handleApiResponse(response);
  }

  // Get available transport methods for a country (for selection)
  async getAvailableTransportMethods(country: string): Promise<TransportMethodOption[]> {
    const response = await apiClient.get<any>(`${this.API_BASE}/GetAvailableTransportMethods?country=${encodeURIComponent(country)}`);
    const result = handleApiResponse<TransportMethodOption[]>(response);
    return result;
  }

  // Get list of supported countries
  async getSupportedCountries(): Promise<string[]> {
    const response = await apiClient.get<any>(`${this.API_BASE}/GetSupportedCountries`);
    const result = handleApiResponse<string[]>(response);
    return result;
  }

  // Get common production countries (for dropdown)
  async getProductionCountries(): Promise<string[]> {
    const response = await apiClient.get<any>(`/material/GetProductionCountries`);
    const result = handleApiResponse<{ countries: string[] }>(response);
    return result.countries ?? [];
  }

  // Get sustainability evaluation from backend
  async getSustainabilityEvaluation(score: number) {
    try {
      const response = await apiClient.get(`/material/GetSustainabilityEvaluation/${score}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get sustainability evaluation:', error);
      throw error;
    }
  }

  // Get supplier's materials with approval status filter (includes all statuses for supplier)
  async getSupplierMaterials(supplierId: string, approvalStatus?: string): Promise<MaterialDetailDto[]> {
    const params = new URLSearchParams();
    params.append('supplierId', supplierId);
    
    // Only add approval status if it's specified and not 'all'
    if (approvalStatus && approvalStatus !== 'all') {
      params.append('approvalStatus', approvalStatus);
    }
    
    const response = await apiClient.get<any>(`${this.API_BASE}/GetSupplierMaterials?${params}`);
    const result = handleApiResponse<MaterialDetailDto[]>(response);
    
    return result.map((item) => {
      try {
        return materialDetailDtoSchema.parse(item);
      } catch (error) {
        console.error("Schema validation error:", error);
        console.error("Item that failed validation:", item);
        throw error;
      }
    });
  }

  // DEPRECATED: Use getAllMaterialsWithFilters instead
  // Legacy method for backward compatibility - will be removed in future versions
  async getAllMaterialByType(typeId: number): Promise<MaterialDetailDto[]> {
    console.warn('getAllMaterialByType is deprecated. Use getMaterialsByType or getAllMaterialsWithFilters instead.');
    return this.getMaterialsByType(typeId);
  }
}

export const materialService = new MaterialService();
export default materialService; 