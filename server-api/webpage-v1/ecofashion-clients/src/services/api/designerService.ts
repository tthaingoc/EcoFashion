// Designer service - specialized for designer operations
import { apiClient, handleApiResponse, handleApiError } from "./baseApi";
import type { BaseApiResponse } from "./baseApi";

// Types for designer operations
export interface DesignerProfile {
  designerId: string;
  userId: number;
  designerName: string;
  avatarUrl?: string;
  bio?: string;
  specializationUrl?: string;
  portfolioUrl?: string;
  portfolioFiles?: string;
  bannerUrl?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  identificationNumber?: string;
  identificationPictureFront?: string;
  identificationPictureBack?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
  certificates?: string;
}

export interface CreateDesignerRequest {
  designerName: string;
  portfolioUrl?: string;
  bannerUrl?: string;
  specializationUrl?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  identificationNumber?: string;
  identificationPicture?: string;
  identificationPictureOwner?: string;
}

export interface UpdateDesignerRequest extends Partial<CreateDesignerRequest> {
  designerId: string;
}

export interface DesignerResponse {
  designer: DesignerProfile;
}

export interface DesignerListResponse {
  designers: DesignerProfile[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface DesignerSummary {
  designerId: string;
  designerName?: string;
  avatarUrl?: string;
  bio?: string;
  bannerUrl?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface DesignerPublic {
  designerId: string;
  designerName?: string;
  avatarUrl?: string;
  bio?: string;
  specializationUrl?: string;
  portfolioUrl?: string;
  portfolioFiles?: string;
  bannerUrl?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  certificates?: string;
  createdAt: string;
  userFullName?: string;
  socialLinks?: string;
  taxNumber?: string;
  identificationPictureOwner?: string;
}

/**
 * Designer Service
 * Handles all designer-related API calls
 */
export class DesignerService {
  private static readonly API_BASE = "Designer";

  /**
   * Get current user's designer profile
   */
  static async getDesignerProfile(): Promise<DesignerProfile> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignerProfile>>(
        `${this.API_BASE}/profile`
      );
      const data = handleApiResponse(response);

      return data; // Backend trả về DesignerModel trực tiếp, không wrap trong { designer: ... }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get designer profile by designer ID
   */
  static async getDesignerById(designerId: string): Promise<DesignerProfile> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignerResponse>>(
        `${this.API_BASE}/${designerId}`
      );
      const data = handleApiResponse(response);

      return data.designer;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Create new designer profile
   */
  static async createDesignerProfile(
    profileData: CreateDesignerRequest
  ): Promise<DesignerProfile> {
    try {
      const response = await apiClient.post<BaseApiResponse<DesignerResponse>>(
        `${this.API_BASE}/create`,
        profileData
      );
      const data = handleApiResponse(response);

      return data.designer;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Update current user's designer profile
   */
  static async updateDesignerProfile(
    profileData: Partial<DesignerProfile>
  ): Promise<DesignerProfile> {
    try {
      const response = await apiClient.put<BaseApiResponse<string>>(
        `${this.API_BASE}/profile`,
        profileData
      );
      const data = handleApiResponse(response);

      // Backend update trả về message, cần get lại profile
      return await DesignerService.getDesignerProfile();
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Delete designer profile
   */
  static async deleteDesignerProfile(designerId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.API_BASE}/delete/${designerId}`);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all designers with pagination
   */
  static async getAllDesigners(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<DesignerListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await apiClient.get<
        BaseApiResponse<DesignerListResponse>
      >(`${this.API_BASE}/list?${params.toString()}`);

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Upload designer document image
   */
  static async uploadDesignerImage(
    designerId: string,
    imageFile: File,
    imageType: "identification" | "owner" | "banner"
  ): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("imageType", imageType);

      const response = await apiClient.post<
        BaseApiResponse<{ imageUrl: string }>
      >(`${this.API_BASE}/upload-image/${designerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Update designer status (Admin only)
   */
  static async updateDesignerStatus(
    designerId: string,
    status: "Active" | "Inactive" | "Pending" | "Rejected"
  ): Promise<DesignerProfile> {
    try {
      const response = await apiClient.patch<BaseApiResponse<DesignerResponse>>(
        `${this.API_BASE}/status/${designerId}`,
        { status }
      );
      const data = handleApiResponse(response);

      return data.designer;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get designer statistics (for admin dashboard)
   */
  static async getDesignerStats(): Promise<{
    totalDesigners: number;
    activeDesigners: number;
    pendingDesigners: number;
    rejectedDesigners: number;
  }> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<{
          totalDesigners: number;
          activeDesigners: number;
          pendingDesigners: number;
          rejectedDesigners: number;
        }>
      >(`${this.API_BASE}/statistics`);

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get public designers for directory listing (no auth required)
   */
  static async getPublicDesigners(
    page: number = 1,
    pageSize: number = 12
  ): Promise<DesignerSummary[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignerSummary[]>>(
        `${this.API_BASE}/public?page=${page}&pageSize=${pageSize}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get designer public profile for landing page (no auth required)
   */
  static async getDesignerPublicProfile(
    designerId: string
  ): Promise<DesignerPublic> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignerPublic>>(
        `${this.API_BASE}/public/${designerId}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Search public designers (no auth required)
   */
  static async searchPublicDesigners(
    keyword?: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<DesignerSummary[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (keyword) {
        params.append("keyword", keyword);
      }

      const response = await apiClient.get<BaseApiResponse<DesignerSummary[]>>(
        `${this.API_BASE}/public/search?${params.toString()}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get featured designers for homepage (no auth required)
   */
  static async getFeaturedDesigners(
    count: number = 6
  ): Promise<DesignerSummary[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<DesignerSummary[]>>(
        `${this.API_BASE}/public/featured?count=${count}`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default DesignerService;
