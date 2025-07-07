import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from '@/hooks/useAuth';
import { useAuthContext } from './AuthContext';
import { loginSchema, type LoginFormData } from './validation';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Get redirect path from query params
  const getRedirectPath = () => {
    const returnUrl = searchParams.get('returnUrl');
    return returnUrl || '/';
  };

  useEffect(() => {
    if (user) {
      navigate(getRedirectPath());
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      setUser(result.user);
      navigate(getRedirectPath());
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
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
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                fontSize: '24px',
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
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chào mừng bạn quay trở lại!
            </Typography>
          </Box>

          {/* Error Alert */}
          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loginMutation.error?.message || 'Đăng nhập thất bại'}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              placeholder="Nhập email của bạn"
              type="email"
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              {...register('password')}
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
              sx={{ mb: 2 }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Ghi nhớ đăng nhập
                  </Typography>
                }
              />
              <Link
                to="/forgot-password"
                style={{
                  color: '#2e7d32',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loginMutation.isPending}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '16px',
                mb: 3,
              }}
            >
              {loginMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>

            {/* Sign Up Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: '#2e7d32',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
