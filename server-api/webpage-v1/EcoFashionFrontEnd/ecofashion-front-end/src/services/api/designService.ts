// Designer service - specialized for designer operations
import {
  CreateDesignFormValues,
  CreateDesignModelResponse,
  createDesignModelResponseSchema,
} from "../../schemas/designSchema";
import { apiClient, handleApiResponse, handleApiError } from "./baseApi";
import type { BaseApiResponse } from "./baseApi";

// export interface DesignTypes {
//     type_id: string;
//     name: string;
// }

// Types for designer operations
// export interface Design {
//   designId: number;
//   designerId: string;
//   name?: string  ;
//   description?: string;
//   recycledPercentage: number ;
//   careInstructions?: string ;
//   price: number;
//   productScore: number;
//   status?: string;
//   createdAt: string;
//   designTypeId?: number;
// }

export interface SustainabilityCriterion {
  criterion: string;
  value: number;
}

export interface Material {
  materialId: number;
  persentageUsed: number;
  meterUsed: number;
  materialName: string;
  materialTypeName: string;
  sustainabilityCriteria: SustainabilityCriterion[];
  materialDescription: string;
  recycledPercentage: number;
}

export interface StoredMaterial {
  materialId: number;
  supplierId: string;
  name: string;
  recycledPercentage: number;
}

export interface Designer {
  designerId: string;
  designerName: string;
  avatarUrl: string;
  bio: string;
  specializationUrl: string;
  portfolioUrl: string;
  bannerUrl: string;
  rating: number | null;
  reviewCount: number | null;
  certificates: string; // or string[] if you parse JSON
}

// export interface DesignType {
//   designTypeId: number;
//   designTypeName: string;
// }
export interface Feature {
  reduceWaste?: boolean;
  lowImpactDyes?: boolean;
  durable?: boolean;
  ethicallyManufactured?: boolean;
}
export interface Design {
  designId: number;
  designerId: string;
  name: string;
  description: string;
  recycledPercentage: number;
  careInstructions: string;
  price: number;
  productScore: number;
  status: string;
  createdAt: string;
  // designTypeId?: number;
  designTypeName: string;
  // designType: DesignType;
  imageUrls: string[];
  feature?: Feature | null; // Define type if you know the structure
  variants: any[]; // Define type if needed
  materials: Material[];
  avgRating: number | null;
  reviewCount: number;
  designer: Designer;
}

export interface DesignResponse {
  design: Design;
}

export const designFieldMapping = {
  name: "Name",
  description: "Description",
  recycledPercentage: "RecycledPercentage",
  careInstructions: "CareInstructions",
  price: "Price",
  productScore: "ProductScore",
  status: "Status",
  designTypeId: "DesignTypeId",

  // Feature (flattened in request)
  reduceWaste: "Feature.ReduceWaste",
  lowImpactDyes: "Feature.LowImpactDyes",
  durable: "Feature.Durable",
  ethicallyManufactured: "Feature.EthicallyManufactured",

  materialsJson: "MaterialsJson",
  imageFiles: "ImageFiles", // multi-file upload
};

/**
 * Design Service
 * Handles all designer-related API calls
 */
export class DesignService {
  private static readonly API_BASE = "Design";

  /**
   * Get all design
   */
  static async getAllDesign(): Promise<Design[]> {
    try {
      //   const response = await apiClient.get<BaseApiResponse<DesignerResponse>>(
      //     `/${this.API_BASE}/Detail/${designId}`
      //   );
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/GetAll`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
  /**
   * Get all design with pagination
   */
  static async getAllDesignPagination(
    page: number = 1,
    pageSize: number = 12
  ): Promise<Design[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/GetAllPagination?page=${page}&pageSize=${pageSize}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
  /**
   * Get designer profile by designer ID
   */
  static async getDesignDetailById(id: number): Promise<Design> {
    try {
      //   const response = await apiClient.get<BaseApiResponse<DesignerResponse>>(
      //     `/${this.API_BASE}/Detail/${designId}`
      //   );
      const response = await apiClient.get<BaseApiResponse<Design>>(
        `/${this.API_BASE}/Detail/${id}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
  /**
   * Get stored material
   */
  static async getStoredMaterial(): Promise<StoredMaterial[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<StoredMaterial[]>>(
        `/Materials`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Helper method to create FormData for file upload
   */
  private static createFormData(request: CreateDesignFormValues): FormData {
    const formData = new FormData();

    // Text/number fields
    if (request.Name) formData.append(designFieldMapping.name, request.Name);
    if (request.Description)
      formData.append(designFieldMapping.description, request.Description);
    formData.append(
      designFieldMapping.recycledPercentage,
      request.RecycledPercentage.toString()
    );
    if (request.CareInstructions)
      formData.append(
        designFieldMapping.careInstructions,
        request.CareInstructions
      );
    formData.append(designFieldMapping.price, request.Price.toString());
    formData.append(
      designFieldMapping.productScore,
      request.ProductScore.toString()
    );
    if (request.Status)
      formData.append(designFieldMapping.status, request.Status);
    if (request.DesignTypeId !== undefined)
      formData.append(
        designFieldMapping.designTypeId,
        request.DesignTypeId.toString()
      );

    // Feature
    formData.append(
      designFieldMapping.reduceWaste,
      request.Feature.ReduceWaste.toString()
    );
    formData.append(
      designFieldMapping.lowImpactDyes,
      request.Feature.LowImpactDyes.toString()
    );
    formData.append(
      designFieldMapping.durable,
      request.Feature.Durable.toString()
    );
    formData.append(
      designFieldMapping.ethicallyManufactured,
      request.Feature.EthicallyManufactured.toString()
    );

    // Materials (as JSON string)
    const materialsJson = JSON.stringify(request.MaterialsJson);
    formData.append(designFieldMapping.materialsJson, materialsJson);

    // Image files
    request.imageFiles.forEach((file) => {
      formData.append(designFieldMapping.imageFiles, file);
    });

    return formData;
  }

  /**
   * Create Design
   */
  static async createDesign(
    request: CreateDesignFormValues
  ): Promise<CreateDesignModelResponse> {
    const formData = this.createFormData(request);

    const response = await apiClient.post<any>(
      `/${this.API_BASE}/Create`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for file upload
      }
    );
    const result = handleApiResponse<CreateDesignModelResponse>(response);
    return createDesignModelResponseSchema.parse(result);
  }
}
export default DesignService;
