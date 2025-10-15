// Designer service - specialized for designer operations
import {
  CreateDesignDraftFormValues,
  CreateDesignDraftModelResponse,
} from "../../schemas/createDesignDraftSchema";
import {
  CreateDesignFormValues,
  CreateDesignModelResponse,
} from "../../schemas/designSchema";
import { apiClient, handleApiResponse, handleApiError } from "./baseApi";
import type { BaseApiResponse } from "./baseApi";

export interface SustainabilityCriterion {
  criterionId: number;
  name: string;
  description: string;
  unit: string;
  value: number;
}

export interface Material {
  materialId: number;
  persentageUsed: number;
  meterUsed: number;
  materialName: string;
  materialTypeName: string;
  sustainabilityCriteria: SustainabilityCriterion[];
  description: string;
  sustainabilityScore: number;
  carbonFootprint: number;
  carbonFootprintUnit: string;
  waterUsage: number;
  waterUsageUnit: string;
  wasteDiverted: number;
  wasteDivertedUnit: string;
  certificates: string;
  supplierName: string;
  pricePerUnit: number;
  createdAt: string;
}

export interface TypeMaterial {
  materialId: number;
  name: string;
  pricePerUnit: string;
  quantityAvailable: number;
  carbonFootprint: number;
  carbonFootprintUnit: string;
  waterUsage: number;
  waterUsageUnit: string;
  wasteDiverted: number;
  wasteDivertedUnit: string;
  productionCountry: string;
  productionRegion: string;
  transportDistance: number;
  transportMethod: string;
  supplierName: string;
  sustainabilityScore: number;
  sustainabilityColor: string;
  certificationDetails: string;
}

export interface MaterialInStored {
  inventoryId: number;
  materialId: number;
  name: string;
  imageUrl: string;
  quantity: number;
  status: string;
  pricePerUnit: number;
  totalValue: number;
  lastUpdated: string;
  quantityAvailable: number;
  supplierName: string;
}

export interface StoredMaterial {
  inventoryId: number;
  designerId: number;
  material: MaterialInStored;
  materialId: number;
  quantity: number;
  cost: number;
  lastBuyDate: string;
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
  createAt: string;
}

export interface DesignType {
  itemTypeId: number;
  typeName: string;
}

export interface MaterialType {
  typeId: number;
  typeName: string;
}

export interface Feature {
  reduceWaste?: boolean;
  lowImpactDyes?: boolean;
  durable?: boolean;
  ethicallyManufactured?: boolean;
}

export interface DesignsVariants {
  id: number;
  designId: number;
  quantity: number;
  ratio: number;
  sizeName: string;
  sizeId: number;
  colorCode: string;
}

export interface DesignFeatures {
  reduceWaste: boolean;
  lowImpactDyes: boolean;
  durable: boolean;
  ethicallyManufactured: boolean;
}

export interface Design {
  designId: number;
  name: string;
  recycledPercentage: number;
  description: string;
  careInstruction: string;
  itemTypeName: string;
  salePrice: number;
  designImageUrls: string[];
  drafSketches: string;
  materials: Material[];
  productCount: number;
  designer: Designer;
  createAt: string;
  designsVariants: DesignsVariants[];
  designFeatures: DesignFeatures;
}

export interface Products {
  productId: number;
  sku: string;
  price: number;
  colorCode: string;
  sizeId: number;
  quantityAvailable: number;
  sizeName: string;
}

export interface DesignDetails {
  designId: number;
  name: string;
  recycledPercentage: number;
  itemTypeName: string;
  salePrice: number;
  designImages: string[];
  materials: Material[];
  productCount: number;
  designer: Designer;
  createAt: string;
  description: string;
  feature: Feature;
  careInstruction: string;
  carbonFootprint: number;
  waterUsage: number;
  wasteDiverted: number;
  products: Products[];
}

export interface FullProductDetail {
  productId: number;
  sku: string;
  price: number;
  colorCode: string;
  sizeId: number;
  sizeName: string;
  sizeRatio: number;
  quantityAvailable: number;
  designId: number;
  lastUpdated: string;
}

export interface DesignResponse {
  design: Design;
}

export interface DesignMaterial {
  materialId: number;
  materialName: string;
  requiredMeters: number;
  designerStock: number;
  supplierStock: number;
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

export const designDraftFieldMapping = {
  name: "Name",
  description: "Description",
  recycledPercentage: "RecycledPercentage",
  designTypeId: "DesignTypeId",

  unitPrice: "UnitPrice",
  salePrice: "SalePrice",
  laborHours: "LaborHours",
  laborCostPerHour: "LaborCostPerHour",

  draftPartsJson: "DraftPartsJson",
  materialsJson: "MaterialsJson",

  totalCarbon: "TotalCarbon",
  totalWater: "TotalWater",
  totalWaste: "TotalWaste",

  sketchImages: "SketchImages", // multi-file upload
};

export interface DesignFeature {
  reduceWaste: boolean;
  lowImpactDyes: boolean;
  durable: boolean;
  ethicallyManufactured: boolean;
}

export interface DraftParts {
  name: string;
  length: number;
  width: number;
  quantity: number;
  materialId: number;
  materialName: string;
  materialStatus: string;
}

export interface DraftMaterial {
  materialId: number;
  materialName: string;
  meterUsed: number;
  price: number;
}

export interface DesignDraftDetails {
  designId: number;
  name: string;
  description: string;
  recycledPercentage: number;
  designTypeId: number;
  createdAt: string;
  unitPrice: number;
  salePrice: number;
  laborHours: number;
  laborCostPerHour: number;
  totalCarbon: number;
  totalWater: number;
  totalWaste: number;
  designFeature: DesignFeature;
  draftParts: DraftParts[];
  materials: DraftMaterial[];
  sketchImageUrls: string;
}

export interface UpdateProductDetail {
  designId: number;
  productName: string;
  description: string;
  careInstruction: string;
  designFeatures: {
    ReduceWaste: boolean;
    LowImpactDyes: boolean;
    Durable: boolean;
    EthicallyManufactured: boolean;
  };
  designImages?: string[];
  files?: File[];
}

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
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/designs-with-products`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all design
   */
  static async getAllDesignByDesigner(): Promise<Design[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/design-variant`
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
    page: number,
    pageSize: number
  ): Promise<Design[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/GetDesignsWithProductsPagination?page=${page}&pageSize=${pageSize}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getAllDesignByDesignerPagination(
    uid: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<Design[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/GetAllPagination-by-designer/${uid}?page=${page}&pageSize=${pageSize}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get designer profile by designer ID
   */
  static async getDesignDetailById(
    id: number,
    designerId: string
  ): Promise<DesignDetails> {
    try {
      //   const response = await apiClient.get<BaseApiResponse<DesignerResponse>>(
      //     `/${this.API_BASE}/Detail/${designId}`
      //   );
      const response = await apiClient.get<BaseApiResponse<DesignDetails>>(
        `/${this.API_BASE}/${id}/designer/${designerId}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get material
   */
  static async getMaterial(): Promise<TypeMaterial[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<TypeMaterial[]>>(
        `/Material`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get stored material
   */
  static async getStoredMaterial(): Promise<MaterialInStored[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<MaterialInStored[]>>(
        `/DesignerMaterialInventories/GetStoredMaterial`
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
    if (request.name) formData.append(designFieldMapping.name, request.name);
    if (request.description)
      formData.append(designFieldMapping.description, request.description);
    formData.append(
      designFieldMapping.recycledPercentage,
      request.recycledPercentage.toString()
    );
    if (request.careInstructions)
      formData.append(
        designFieldMapping.careInstructions,
        request.careInstructions
      );
    formData.append(designFieldMapping.price, request.salePrice.toString());
    formData.append(
      designFieldMapping.productScore,
      request.productScore.toString()
    );
    if (request.status)
      formData.append(designFieldMapping.status, request.status);
    if (request.designTypeId)
      formData.append(
        designFieldMapping.designTypeId,
        request.designTypeId.toString()
      );

    // Feature
    formData.append(
      designFieldMapping.reduceWaste,
      request.feature.reduceWaste.toString()
    );
    formData.append(
      designFieldMapping.lowImpactDyes,
      request.feature.lowImpactDyes.toString()
    );
    formData.append(
      designFieldMapping.durable,
      request.feature.durable.toString()
    );
    formData.append(
      designFieldMapping.ethicallyManufactured,
      request.feature.ethicallyManufactured.toString()
    );

    // Materials (as JSON string)
    const materialsJson = JSON.stringify(request.materialsJson);
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

    try {
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
      // const result = handleApiResponse<CreateDesignModelResponse>(response);
      // return createDesignModelResponseSchema.parse(result);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get Design Type
   */
  static async getDesignType(): Promise<DesignType[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignType[]>>(
        `/DesignTypes`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get Material Type
   */
  static async getMaterialType(): Promise<MaterialType[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<MaterialType[]>>(
        `/MaterialTypes`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get material by Type
   */
  static async getMaterialByType(id: number): Promise<TypeMaterial[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<TypeMaterial[]>>(
        `/Material/GetAllMaterialByType/${id}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Helper method to create FormData for file upload
   */
  private static createDraftFormData(
    request: CreateDesignDraftFormValues
  ): FormData {
    const formData = new FormData();

    // Text/number fields
    if (request.name)
      formData.append(designDraftFieldMapping.name, request.name);
    if (request.description)
      formData.append(designDraftFieldMapping.description, request.description);
    if (
      request.recycledPercentage !== undefined &&
      request.recycledPercentage !== null
    )
      formData.append(
        designDraftFieldMapping.recycledPercentage,
        request.recycledPercentage.toString()
      );
    if (request.designTypeId)
      formData.append(
        designDraftFieldMapping.designTypeId,
        request.designTypeId.toString()
      );

    if (request.unitPrice !== undefined && request.unitPrice !== null)
      formData.append(
        designDraftFieldMapping.unitPrice,
        request.unitPrice.toString()
      );
    if (request.salePrice !== undefined && request.salePrice !== null)
      formData.append(
        designDraftFieldMapping.salePrice,
        request.salePrice.toString()
      );
    if (request.laborHours !== undefined && request.laborHours !== null)
      formData.append(
        designDraftFieldMapping.laborHours,
        request.laborHours.toString()
      );
    if (
      request.laborCostPerHour !== undefined &&
      request.laborCostPerHour !== null
    )
      formData.append(
        designDraftFieldMapping.laborCostPerHour,
        request.laborCostPerHour.toString()
      );

    if (request.draftPartsJson)
      formData.append(
        designDraftFieldMapping.draftPartsJson,
        request.draftPartsJson
      );

    if (request.materialsJson)
      formData.append(
        designDraftFieldMapping.materialsJson,
        JSON.stringify(request.materialsJson)
      );

    if (request.totalCarbon !== undefined && request.totalCarbon !== null)
      formData.append(
        designDraftFieldMapping.totalCarbon,
        request.totalCarbon.toString()
      );
    if (request.totalWater !== undefined && request.totalWater !== null)
      formData.append(
        designDraftFieldMapping.totalWater,
        request.totalWater.toString()
      );
    if (request.totalWaste !== undefined && request.totalWaste !== null)
      formData.append(
        designDraftFieldMapping.totalWaste,
        request.totalWaste.toString()
      );

    // Sketch images (multi-file)
    if (request.sketchImages && request.sketchImages.length > 0) {
      request.sketchImages.forEach((file: File) => {
        formData.append(designDraftFieldMapping.sketchImages, file);
      });
    }

    return formData;
  }
  /**
   * Create Design Draft
   */
  static async createDesignDraft(
    request: CreateDesignDraftFormValues
  ): Promise<CreateDesignDraftModelResponse> {
    const formData = this.createDraftFormData(request);

    try {
      const response = await apiClient.post<any>(
        `/DesignDraft/create-draft`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000, // 5 minutes for file upload
        }
      );
      // const result = handleApiResponse<CreateDesignModelResponse>(response);
      // return createDesignModelResponseSchema.parse(result);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all design that have product
   */
  static async getAllDesignProuct(): Promise<Design[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<Design[]>>(
        `/${this.API_BASE}/designs-with-products/by-designer`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all design with product detail
   */
  static async getDesignProductDetailsAsync(
    id: number
  ): Promise<FullProductDetail[]> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<FullProductDetail[]>
      >(`/${this.API_BASE}/designProductDetails/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Delete design without product
   */
  static async deleteDesign(designId: number) {
    try {
      const response = await apiClient.delete(`/DesignDraft/${designId}`);

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get Design Draft Detai
   */
  static async getDesignDraftDetailAsync(
    designId: number
  ): Promise<DesignDraftDetails> {
    try {
      const response = await apiClient.get(`/DesignDraft/drafts/${designId}`);

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  private static updateProductDetailFormData(
    productInfo: UpdateProductDetail
  ): FormData {
    const formData = new FormData();
    formData.append("DesignId", productInfo.designId.toString());
    formData.append("Name", productInfo.productName);
    formData.append("Description", productInfo.description);
    formData.append("CareInstruction", productInfo.careInstruction);

    // append design features
    formData.append(
      "DesignFeatures.ReduceWaste",
      productInfo.designFeatures.ReduceWaste.toString()
    );
    formData.append(
      "DesignFeatures.LowImpactDyes",
      productInfo.designFeatures.LowImpactDyes.toString()
    );
    formData.append(
      "DesignFeatures.Durable",
      productInfo.designFeatures.Durable.toString()
    );
    formData.append(
      "DesignFeatures.EthicallyManufactured",
      productInfo.designFeatures.EthicallyManufactured.toString()
    );
    // append images (nếu có)
    if (productInfo.files && productInfo.files.length > 0) {
      productInfo.files.forEach((file) => {
        formData.append("DesignImages", file); // backend nhận file thật
      });
    }

    return formData;
  }
  /**
   * Update Product Detail
   */
  static updateProductDetailAsync = async (
    updateProductDetail: UpdateProductDetail
  ) => {
    try {
      const formData = this.updateProductDetailFormData(updateProductDetail);

      const response = await apiClient.put(
        `${this.API_BASE}/update-basic-info`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  };

  /**
   * Get Design Material
   */
  static async getDesignMaterialByDesignId(
    designId: number
  ): Promise<DesignMaterial[]> {
    try {
      const response = await apiClient.get(
        `/DesignDraft/fabric-usage-each-Design/${designId}`
      );

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}
export default DesignService;
