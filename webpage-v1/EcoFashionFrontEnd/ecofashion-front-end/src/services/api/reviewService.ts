import apiClient, { handleApiResponse, handleApiError, BaseApiResponse } from './baseApi';

export interface Review {
  reviewId: number;
  userId: string;
  productId?: number;
  materialId?: number;
  comment: string;
  ratingScore: number;
  createdAt?: string;
  userName?: string;
}

export interface CreateReviewRequest {
  productId?: number;
  materialId?: number;
  comment: string;
  ratingScore: number;
}

export interface UpdateReviewRequest {
  comment: string;
  ratingScore: number;
}

class ReviewService {
  private readonly basePath = '/Review';

  // Get all reviews by materialId or productId
  async getReviews(materialId?: number, productId?: number): Promise<Review[]> {
    try {
      const params: any = {};
      if (materialId) params.materialId = materialId;
      if (productId) params.productId = productId;

      const response = await apiClient.get<BaseApiResponse<Review[]>>(this.basePath, { params });
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Get average rating score
  async getAverageScore(id: number, isProduct: boolean = false): Promise<number> {
    try {
      const response = await apiClient.get<BaseApiResponse<number>>(
        `${this.basePath}/average-score/${id}`,
        { params: { isProduct } }
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Create new review
  async createReview(request: CreateReviewRequest): Promise<Review> {
    try {
      const response = await apiClient.post<BaseApiResponse<Review>>(
        `${this.basePath}/Create`,
        request
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Update existing review
  async updateReview(reviewId: number, request: UpdateReviewRequest): Promise<Review> {
    try {
      const response = await apiClient.put<BaseApiResponse<Review>>(
        `${this.basePath}/${reviewId}`,
        request
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Delete review
  async deleteReview(reviewId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.basePath}/${reviewId}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const reviewService = new ReviewService();
