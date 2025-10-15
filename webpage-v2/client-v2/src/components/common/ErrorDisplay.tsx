import React from "react";
import { Alert, AlertTitle, Snackbar, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { ApiError } from "@/types/apiError";

interface ErrorDisplayProps {
  error: ApiError | null;
  onClose?: () => void;
  variant?: "inline" | "snackbar";
  autoHideDuration?: number;
  showCloseButton?: boolean;
  sx?: object;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  variant = "inline",
  autoHideDuration = 6000,
  showCloseButton = true,
  sx = {},
}) => {
  if (!error) return null;

  const errorTitle = getErrorTitle(error.code);
  const severity = getErrorSeverity(error.code);

  // Snackbar variant (toast notification)
  if (variant === "snackbar") {
    return (
      <Snackbar
        open={!!error}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={showCloseButton ? onClose : undefined}
          severity={severity}
          sx={{ width: "100%" }}
          action={
            showCloseButton && onClose ? (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            ) : undefined
          }
        >
          {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
          {error.message}
        </Alert>
      </Snackbar>
    );
  }

  // Inline variant (embedded in page)
  return (
    <Alert
      severity={severity}
      onClose={showCloseButton ? onClose : undefined}
      sx={{
        mb: 2,
        borderRadius: 1,
        ...sx,
      }}
      action={
        showCloseButton && onClose ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        ) : undefined
      }
    >
      {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
      {error.message}
    </Alert>
  );
};

// Helper function to get error title based on code
function getErrorTitle(code?: string): string | null {
  if (!code) return null;

  switch (code) {
    // Authentication errors
    case "INVALID_CREDENTIALS":
      return "Đăng nhập thất bại";
    case "USER_NOT_FOUND":
      return "Tài khoản không tồn tại";
    case "ACCOUNT_LOCKED":
      return "Tài khoản bị khóa";
    case "TOKEN_EXPIRED":
      return "Phiên đăng nhập hết hạn";
    case "UNAUTHORIZED":
      return "Không có quyền truy cập";

    // OTP/Verification errors
    case "INVALID_OTP":
      return "Mã OTP không hợp lệ";
    case "OTP_EXPIRED":
      return "Mã OTP đã hết hạn";
    case "OTP_LIMIT_EXCEEDED":
      return "Đã vượt quá số lần nhập OTP";

    // Registration errors
    case "EMAIL_EXISTS":
      return "Email đã tồn tại";
    case "USERNAME_EXISTS":
      return "Tên đăng nhập đã tồn tại";
    case "PHONE_EXISTS":
      return "Số điện thoại đã tồn tại";

    // Validation errors
    case "VALIDATION_ERROR":
      return "Dữ liệu không hợp lệ";
    case "REQUIRED_FIELD_MISSING":
      return "Thiếu thông tin bắt buộc";
    case "INVALID_EMAIL_FORMAT":
      return "Định dạng email không hợp lệ";
    case "WEAK_PASSWORD":
      return "Mật khẩu không đủ mạnh";

    // Network/Server errors
    case "NETWORK_ERROR":
      return "Lỗi kết nối mạng";
    case "SERVER_ERROR":
      return "Lỗi máy chủ";
    case "SERVICE_UNAVAILABLE":
      return "Dịch vụ tạm thời không khả dụng";
    case "TIMEOUT":
      return "Quá thời gian chờ";

    // Business logic errors
    case "INSUFFICIENT_BALANCE":
      return "Số dư không đủ";
    case "ORDER_NOT_FOUND":
      return "Không tìm thấy đơn hàng";
    case "PRODUCT_OUT_OF_STOCK":
      return "Sản phẩm hết hàng";
    case "DISCOUNT_EXPIRED":
      return "Mã giảm giá đã hết hạn";

    default:
      return "Thông báo lỗi";
  }
}

// Helper function to get severity based on error code
function getErrorSeverity(code?: string): "error" | "warning" | "info" {
  if (!code) return "error";

  switch (code) {
    // Warning level errors (user input issues)
    case "VALIDATION_ERROR":
    case "INVALID_OTP":
    case "REQUIRED_FIELD_MISSING":
    case "INVALID_EMAIL_FORMAT":
    case "WEAK_PASSWORD":
      return "warning";

    // Info level errors (temporary issues)
    case "NETWORK_ERROR":
    case "TIMEOUT":
    case "SERVICE_UNAVAILABLE":
    case "OTP_EXPIRED":
      return "info";

    // Error level (critical issues)
    case "INVALID_CREDENTIALS":
    case "USER_NOT_FOUND":
    case "SERVER_ERROR":
    case "ACCOUNT_LOCKED":
    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
    case "EMAIL_EXISTS":
    case "USERNAME_EXISTS":
    case "PHONE_EXISTS":
    case "OTP_LIMIT_EXCEEDED":
    case "INSUFFICIENT_BALANCE":
    case "ORDER_NOT_FOUND":
    case "PRODUCT_OUT_OF_STOCK":
    case "DISCOUNT_EXPIRED":
    default:
      return "error";
  }
}
