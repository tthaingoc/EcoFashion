import {
  CreateProductModelResponse,
  CreateProductSchemaFormValues,
} from "../../schemas/createProductSchema";
import { apiClient, handleApiResponse, handleApiError } from "./baseApi";
import type { BaseApiResponse } from "./baseApi";

export const designDraftFieldMapping = {
  designId: "DesignId",
  images: "Images", // multi-file upload
};
export class ProductService {
  private static readonly API_BASE = "Products";

  /**
   * Helper method to create FormData for file upload
   */
  private static createProductormData(
    request: CreateProductSchemaFormValues
  ): FormData {
    const formData = new FormData();

    // Text/number fields

    if (request.designId)
      formData.append(
        designDraftFieldMapping.designId,
        request.designId.toString()
      );

    // Sketch images (multi-file)
    if (request.images && request.images.length > 0) {
      request.images.forEach((file: File) => {
        formData.append(designDraftFieldMapping.images, file);
      });
    }

    return formData;
  }
  /**
   * Create Design Draft
   */
  static async createDesignDraft(
    request: CreateProductSchemaFormValues
  ): Promise<CreateProductModelResponse> {
    const formData = this.createProductormData(request);

    try {
      const response = await apiClient.post<any>(
        `/${this.API_BASE}/CreateByExistVariant`,
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
}
export default ProductService;
