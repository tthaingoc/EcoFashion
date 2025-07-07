import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/features/auth/AuthContext';

export const SimpleHomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();

  const getWelcomeMessage = () => {
    if (!isAuthenticated) {
      return 'Chào mừng đến với EcoFashion!';
    }
    const displayName = user?.fullname || user?.email?.split('@')[0] || 'bạn';
    return `Chào mừng ${displayName}!`;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            {getWelcomeMessage()}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Thời trang bền vững cho tương lai xanh
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Đăng ký ngay
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Đăng nhập
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Tại sao chọn EcoFashion?
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, maxWidth: 400 }}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
                  🌱
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Thân thiện môi trường
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sản phẩm được làm từ vật liệu tái chế và bền vững
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, maxWidth: 400 }}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
                  👥
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cộng đồng sáng tạo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Kết nối với các nhà thiết kế và nhà cung cấp uy tín
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, maxWidth: 400 }}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
                  ♻️
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Chất lượng cao
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sản phẩm chất lượng với quy trình sản xuất nghiêm ngặt
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
