import apiClient, {
  BaseApiResponse,
  handleApiError,
  handleApiResponse,
} from "./baseApi";

export interface ProductInventoryTransactions {
  transactionId: number;
  inventoryId: number;
  designName: string;
  itemName: string;
  performedByUserId: number;
  quantityChanged: number;
  beforeQty: number;
  afterQty: number;
  transactionDate: string;
  transactionType: string;
  notes: string;
  inventoryType: string;
}
export class InventoryTransactionsService {
  private static readonly API_BASE = "InventoryTransactions";
  /**
   * Get all design
   */
  static async getAllMaterialInventoryByDesigner(): Promise<
    ProductInventoryTransactions[]
  > {
    try {
      const response = await apiClient.get<
        BaseApiResponse<ProductInventoryTransactions[]>
      >(`/${this.API_BASE}/By-DesignerId`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}
export default InventoryTransactionsService;
