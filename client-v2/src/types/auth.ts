// Authentication types
export interface User {
  userId: number;
  email: string;
  fullName: string;
  username?: string;
  phone?: string;
  role: string;
  roleId: number;
  status: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  passwordHash: string; // Raw password field name from backend
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string; // Đổi từ fullname thành fullName để khớp với backend
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
  email: string; // Đổi từ isEmailVerified thành email để khớp với backend
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
