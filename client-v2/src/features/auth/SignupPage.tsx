import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSignup } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { ErrorDisplay, SuccessDisplay } from "@/components/common";
import { signupSchema, type SignupFormData } from "./authFormSchema";

export const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const signupMutation = useSignup();
  const { error, handleError, clearError } = useApiError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await signupMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullname: data.fullname,
        username: data.username,
        phone: data.phone,
      });

      if (result.success) {
        // Always redirect to OTP verification since backend sends OTP for email verification
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`, {
          state: {
            email: data.email,
            message: result.message,
          },
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

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
              🌱
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              mb={1}
            >
              EcoFashion
            </Typography>
            <Typography
              variant="h5"
              fontWeight={600}
              color="text.primary"
              mb={1}
            >
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo tài khoản mới để bắt đầu
            </Typography>
          </Box>

          {/* Error Display */}
          <ErrorDisplay error={error} onClose={clearError} />

          {/* Success Display */}
          <SuccessDisplay
            message={
              signupMutation.isSuccess
                ? "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
                : null
            }
          />

          {/* Signup Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              placeholder="Nhập email của bạn"
              type="email"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              margin="normal"
              {...register("fullname")}
              error={!!errors.fullname}
              helperText={errors.fullname?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              margin="normal"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Số điện thoại (tùy chọn)"
              placeholder="Nhập số điện thoại"
              type="tel"
              margin="normal"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={signupMutation.isPending}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "16px",
                mb: 3,
              }}
            >
              {signupMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng ký"
              )}
            </Button>

            {/* Login Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?{" "}
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
