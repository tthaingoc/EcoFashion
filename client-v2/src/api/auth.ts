import { apiClient } from './client';
import type {
  LoginRequest,
  SignupRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  AuthResponse,
  SignupResponse,
  OTPResponse,
  ApiResponse,
} from '@/types/auth';

export const authApi = {
  // User login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const credentials: LoginRequest = {
      email,
      passwordHash: password, // Backend expects raw password in "passwordHash" field
    };

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/User/login',
      credentials
    );

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || 'Login failed');
    }

    return response.data.result;
  },

  // User signup/registration
  signup: async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    phone?: string
  ): Promise<SignupResponse> => {
    const userData: SignupRequest = {
      email,
      password,
      fullName,
      username,
      phone,
    };

    const response = await apiClient.post<ApiResponse<SignupResponse>>(
      '/User/signup',
      userData
    );

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || 'Signup failed');
    }

    return response.data.result;
  },

  // Verify OTP after signup
  verifyOTP: async (email: string, otpCode: string): Promise<OTPResponse> => {
    const verifyData: VerifyOTPRequest = {
      email,
      otpCode,
    };

    const response = await apiClient.post<ApiResponse<OTPResponse>>(
      '/User/verify-otp',
      verifyData
    );

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || 'OTP verification failed');
    }

    return response.data.result;
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<OTPResponse> => {
    const resendData: ResendOTPRequest = {
      email,
    };

    const response = await apiClient.post<ApiResponse<OTPResponse>>(
      '/User/resend-otp',
      resendData
    );

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || 'Resend OTP failed');
    }

    return response.data.result;
  },
};
