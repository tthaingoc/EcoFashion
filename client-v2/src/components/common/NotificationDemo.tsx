import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import {
  ErrorDisplay,
  SuccessDisplay,
  InfoDisplay,
  useNotification,
} from "./index";
import type { ApiError } from "@/types/apiError";

export const NotificationDemo: React.FC = () => {
  const [inlineError, setInlineError] = useState<ApiError | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);
  const [inlineInfo, setInlineInfo] = useState<string | null>(null);

  const notification = useNotification();

  const sampleErrors: ApiError[] = [
    { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không đúng" },
    {
      code: "USER_NOT_FOUND",
      message: "Không tìm thấy tài khoản với email này",
    },
    {
      code: "ACCOUNT_LOCKED",
      message: "Tài khoản đã bị khóa do nhiều lần đăng nhập sai",
    },
    { code: "INVALID_OTP", message: "Mã OTP không hợp lệ hoặc đã hết hạn" },
    { code: "EMAIL_EXISTS", message: "Email này đã được đăng ký" },
    {
      code: "VALIDATION_ERROR",
      message: "Vui lòng kiểm tra lại thông tin đã nhập",
    },
    { code: "NETWORK_ERROR", message: "Không thể kết nối đến máy chủ" },
    {
      code: "SERVER_ERROR",
      message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau",
    },
  ];

  const sampleSuccessMessages = [
    "Đăng nhập thành công!",
    "Đăng ký tài khoản thành công!",
    "Xác thực email thành công!",
    "Cập nhật thông tin thành công!",
    "Đặt hàng thành công!",
  ];

  const sampleInfoMessages = [
    {
      message: "Mã OTP đã được gửi đến email của bạn",
      severity: "info" as const,
    },
    {
      message: "Vui lòng kiểm tra email để xác thực tài khoản",
      severity: "info" as const,
    },
    {
      message: "Mật khẩu nên có ít nhất 8 ký tự",
      severity: "warning" as const,
    },
    {
      message: "Phiên đăng nhập sẽ hết hạn sau 15 phút",
      severity: "warning" as const,
    },
  ];

  const showRandomError = (type: "inline" | "snackbar") => {
    const randomError =
      sampleErrors[Math.floor(Math.random() * sampleErrors.length)];
    if (type === "inline") {
      setInlineError(randomError);
    } else {
      notification.showError(randomError);
    }
  };

  const showRandomSuccess = (type: "inline" | "snackbar") => {
    const randomMessage =
      sampleSuccessMessages[
        Math.floor(Math.random() * sampleSuccessMessages.length)
      ];
    if (type === "inline") {
      setInlineSuccess(randomMessage);
    } else {
      notification.showSuccess(randomMessage);
    }
  };

  const showRandomInfo = (type: "inline" | "snackbar") => {
    const randomInfo =
      sampleInfoMessages[Math.floor(Math.random() * sampleInfoMessages.length)];
    if (type === "inline") {
      setInlineInfo(randomInfo.message);
    } else {
      notification.showInfo(randomInfo.message, randomInfo.severity);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        🧪 Notification System Demo
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Test các component hiển thị thông báo của hệ thống
      </Typography>

      {/* Inline Notifications */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📍 Inline Notifications
          </Typography>

          <Stack spacing={2} mb={3}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => showRandomError("inline")}
            >
              Show Random Error
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => showRandomSuccess("inline")}
            >
              Show Random Success
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={() => showRandomInfo("inline")}
            >
              Show Random Info
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Display Area */}
          <ErrorDisplay
            error={inlineError}
            onClose={() => setInlineError(null)}
          />
          <SuccessDisplay
            message={inlineSuccess}
            onClose={() => setInlineSuccess(null)}
          />
          <InfoDisplay
            message={inlineInfo}
            onClose={() => setInlineInfo(null)}
          />
        </CardContent>
      </Card>

      {/* Snackbar Notifications */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🍞 Snackbar Notifications (Global)
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Các thông báo này sẽ xuất hiện ở đầu màn hình và tự động ẩn
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              color="error"
              onClick={() => showRandomError("snackbar")}
            >
              Show Global Error
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => showRandomSuccess("snackbar")}
            >
              Show Global Success
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => showRandomInfo("snackbar")}
            >
              Show Global Info
            </Button>
            <Button variant="outlined" onClick={notification.clearAll}>
              Clear All Notifications
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Code Reference */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📚 Error Code Reference
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Danh sách các mã lỗi được hỗ trợ:
          </Typography>

          <Box
            component="pre"
            sx={{
              fontSize: "0.875rem",
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            {`
Authentication: INVALID_CREDENTIALS, USER_NOT_FOUND, ACCOUNT_LOCKED, TOKEN_EXPIRED, UNAUTHORIZED
OTP/Verification: INVALID_OTP, OTP_EXPIRED, OTP_LIMIT_EXCEEDED
Registration: EMAIL_EXISTS, USERNAME_EXISTS, PHONE_EXISTS
Validation: VALIDATION_ERROR, REQUIRED_FIELD_MISSING, INVALID_EMAIL_FORMAT, WEAK_PASSWORD
Network/Server: NETWORK_ERROR, SERVER_ERROR, SERVICE_UNAVAILABLE, TIMEOUT
Business Logic: INSUFFICIENT_BALANCE, ORDER_NOT_FOUND, PRODUCT_OUT_OF_STOCK, DISCOUNT_EXPIRED
            `}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
