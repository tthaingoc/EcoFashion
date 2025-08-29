import apiClient, {
  BaseApiResponse,
  handleApiError,
  handleApiResponse,
} from "./baseApi";

export interface FullDesignVariant {
  variantId: number;
  designName: string;
  sizeName: string;
  colorCode: string;
  quantity: number;
  ratio: number;
  sizeId: number;
  meterUsed?: number;
}

export interface AddVariant {
  sizeId: number;
  colorCode: string;
  quantity: number;
}

export interface UpdateVariant {
  sizeId?: number;
  colorCode?: string;
  quantity?: number;
}

export class DesignVariantService {
  private static readonly API_BASE = "DesignsVariant";

  /**
   * Get all design
   */
  static async getVariantsByDesignIdAsync(
    id: number
  ): Promise<FullDesignVariant[]> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<FullDesignVariant[]>
      >(`/${this.API_BASE}/${id}/variants`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Creat design variant
   */
  static async creatVariantsByDesignIdAsync(
    id: number,
    request: AddVariant
  ): Promise<AddVariant> {
    try {
      const response = await apiClient.post(
        `/${this.API_BASE}/${id}/variants`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
  static deleteVariant = async (variantId: number) => {
    try {
      const response = await apiClient.delete(
        `${this.API_BASE}/variants/${variantId}`
      );

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  };

  static updateVariantAsync = async (
    variantId: number,
    updatedVariant: UpdateVariant
  ) => {
    try {
      const response = await apiClient.put(
        `${this.API_BASE}/variants/${variantId}`,
        updatedVariant
      );

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
export default DesignVariantService;
