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

export interface UpdateProductQuantity {
  designId: number;
  variants?: string;
  images?: string[];
  files?: File[];
}

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

  private static updateProductQuantity(
    productInfo: UpdateProductQuantity
  ): FormData {
    const formData = new FormData();
    formData.append("DesignId", productInfo.designId.toString());
    formData.append("Variants", productInfo.variants);

    // append images (nếu có)
    if (productInfo.files && productInfo.files.length > 0) {
      productInfo.files.forEach((file) => {
        formData.append("Images", file); // backend nhận file thật
      });
    }

    return formData;
  }

  /**
   * Update Product Quantity
   */
  static updateProductDetailAsync = async (
    updateProductQuanity: UpdateProductQuantity
  ) => {
    const formData = this.updateProductQuantity(updateProductQuanity);
    try {
      const response = await apiClient.post<any>(
        `/${this.API_BASE}/CreateByNewVariant`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000, // 5 minutes for file upload
        }
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
export default ProductService;
