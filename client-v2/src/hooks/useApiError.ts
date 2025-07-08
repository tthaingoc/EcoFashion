import { useState, useCallback } from "react";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/apiError";

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((err: unknown) => {
    console.error("API Error:", err);

    // Default error
    let apiError: ApiError = {
      message: "Đã xảy ra lỗi không xác định",
      code: "UNKNOWN_ERROR",
    };

    // Check if it's an Axios error
    if (err && typeof err === "object" && "response" in err) {
      const axiosError = err as AxiosError;
      const responseData = axiosError.response?.data as any;
      const status = axiosError.response?.status;

      console.log("Response data:", responseData);

      // Check backend ApiResult format: { Success: false, ErrorMessage: string }
      if (
        responseData &&
        responseData.Success === false &&
        responseData.ErrorMessage
      ) {
        apiError = {
          message: responseData.ErrorMessage,
          code: getErrorCodeFromMessage(responseData.ErrorMessage),
          status: status,
        };
      }
      // Fallback to status code
      else {
        apiError = {
          message: getErrorMessageFromStatus(status || 500),
          code: getErrorCodeFromStatus(status || 500),
          status: status,
        };
      }
    }
    // Network or other errors
    else if (err instanceof Error) {
      apiError = {
        message: "Không thể kết nối đến server",
        code: "NETWORK_ERROR",
      };
    }

    setError(apiError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};

// Helper functions
function getErrorCodeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("mật khẩu") || lowerMessage.includes("password")) {
    return "INVALID_CREDENTIALS";
  }
  if (lowerMessage.includes("email") || lowerMessage.includes("tài khoản")) {
    return "USER_NOT_FOUND";
  }
  if (lowerMessage.includes("otp")) {
    return "INVALID_OTP";
  }

  return "API_ERROR";
}

function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 400:
      return "Thông tin không hợp lệ";
    case 401:
      return "Thông tin đăng nhập không chính xác";
    case 404:
      return "Không tìm thấy tài khoản";
    case 500:
      return "Lỗi hệ thống. Vui lòng thử lại sau";
    default:
      return "Đã xảy ra lỗi không xác định";
  }
}

function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "INVALID_CREDENTIALS";
    case 404:
      return "USER_NOT_FOUND";
    case 500:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN_ERROR";
  }
}
