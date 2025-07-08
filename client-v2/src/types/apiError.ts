// Simple API error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Backend response format (từ C# ApiResult)
export interface ApiResponse<T> {
  Success: boolean;
  Result?: T;
  ErrorMessage?: string;
}

// Common error codes
export const ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_OTP: "INVALID_OTP",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;
