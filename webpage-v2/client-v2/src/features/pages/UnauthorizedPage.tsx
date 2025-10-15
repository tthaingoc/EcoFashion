import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export const UnauthorizedPage: React.FC = () => {
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
      <Card sx={{ maxWidth: 400, textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" color="error" fontWeight={600} mb={2}>
            403
          </Typography>
          <Typography variant="h6" mb={2}>
            Truy cập bị từ chối
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn không có quyền truy cập vào trang này.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
