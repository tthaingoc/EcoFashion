import { apiClient } from "./client";
import type { ApiResponse } from "@/types/apiError";
import type { User } from "@/types/auth";

// Auth request types
export interface LoginRequest {
  email: string;
  passwordHash: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export const authApi = {
  // Simple login function
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/User/login",
      {
        email,
        passwordHash: password,
      }
    );

    // Backend trả về { Success: true, Result: AuthResponse }
    if (response.data.Success && response.data.Result) {
      return response.data.Result;
    }

    // Nếu không có Result, throw error
    throw new Error("Invalid response format");
  },
};
