// Authentication types
export interface User {
  id: number;
  email: string;
  fullname: string;
  username: string;
  phone?: string;
  roleName: string;
  isEmailVerified: boolean;
}

export interface LoginRequest {
  email: string;
  passwordHash: string; // Raw password field name from backend
}

export interface SignupRequest {
  email: string;
  password: string;
  fullname: string;
  username: string;
  phone?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otpCode: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  isEmailVerified: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  errorMessage?: string;
}
