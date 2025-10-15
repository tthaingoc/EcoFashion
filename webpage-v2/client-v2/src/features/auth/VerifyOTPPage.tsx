import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { ErrorDisplay, SuccessDisplay } from "@/components/common";
import { verifyOTPSchema, type VerifyOTPFormData } from "./authFormSchema";

export const VerifyOTPPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();
  const { error, handleError, clearError } = useApiError();

  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email,
    },
  });

  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: VerifyOTPFormData) => {
    try {
      const result = await verifyOTPMutation.mutateAsync({
        email: data.email,
        otpCode: data.otpCode,
      });

      if (result.success) {
        navigate("/login");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    try {
      await resendOTPMutation.mutateAsync({ email });
    } catch (error) {
      handleError(error);
    }
  };

  if (!email) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 400 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="error" mb={2}>
              Email không được cung cấp
            </Typography>
            <Button component={Link} to="/signup" variant="contained">
              Quay lại đăng ký
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                fontSize: "24px",
              }}
            >
              ✉️
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              mb={1}
            >
              Xác thực email
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Chúng tôi đã gửi mã xác thực đến email:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {email}
            </Typography>
          </Box>

          {/* Error Display */}
          <ErrorDisplay error={error} onClose={clearError} />

          {/* Success Display */}
          <SuccessDisplay
            message={
              verifyOTPMutation.isSuccess
                ? "Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ."
                : null
            }
          />

          {/* Resend OTP Success */}
          <SuccessDisplay
            message={
              resendOTPMutation.isSuccess
                ? "Mã xác thực mới đã được gửi đến email của bạn."
                : null
            }
          />

          {/* OTP Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Mã xác thực"
              placeholder="Nhập mã 6 chữ số"
              margin="normal"
              {...register("otpCode")}
              error={!!errors.otpCode}
              helperText={errors.otpCode?.message}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={verifyOTPMutation.isPending}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "16px",
                mb: 2,
              }}
            >
              {verifyOTPMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Xác thực"
              )}
            </Button>

            {/* Resend OTP */}
            <Button
              variant="text"
              fullWidth
              onClick={handleResendOTP}
              disabled={resendOTPMutation.isPending}
              sx={{ mb: 3 }}
            >
              {resendOTPMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "Gửi lại mã xác thực"
              )}
            </Button>

            {/* Back to Login */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Đã xác thực?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#2e7d32",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
