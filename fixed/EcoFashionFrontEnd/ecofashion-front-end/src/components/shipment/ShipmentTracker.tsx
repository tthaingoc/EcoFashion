import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  Flight,
  Home,
  CheckCircle,
  AccessTime,
  Refresh,
  LocationOn,
  Person,
  Phone
} from '@mui/icons-material';
import { formatViDateTime } from '../../utils/date';

export interface ShipmentStatus {
  step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  timestamp?: string;
  location?: string;
  description: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface ShipmentData {
  orderId: number;
  trackingNumber: string;
  carrier: string;
  currentStatus: ShipmentStatus;
  statusHistory: ShipmentStatus[];
  shippingAddress: string;
  customerInfo: {
    name: string;
    phone: string;
  };
  packageInfo: {
    weight: string;
    dimensions: string;
    items: number;
  };
}

interface Props {
  shipmentData: ShipmentData;
  onRefresh?: () => void;
  loading?: boolean;
}

const getStatusColor = (status: ShipmentStatus['status']) => {
  switch (status) {
    case 'completed': return '#16a34a';
    case 'in_progress': return '#2563eb';
    case 'delayed': return '#dc2626';
    default: return '#6b7280';
  }
};

const getStatusIcon = (step: number, status: ShipmentStatus['status']) => {
  const iconProps = { 
    sx: { 
      color: getStatusColor(status),
      fontSize: 28 
    } 
  };

  switch (step) {
    case 0: return <Inventory {...iconProps} />;
    case 1: return <LocalShipping {...iconProps} />;
    case 2: return <Flight {...iconProps} />;
    case 3: return <Home {...iconProps} />;
    default: return <CheckCircle {...iconProps} />;
  }
};

export default function ShipmentTracker({ shipmentData, onRefresh, loading = false }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const completedSteps = shipmentData.statusHistory.filter(s => s.status === 'completed').length;
    setActiveStep(completedSteps);
  }, [shipmentData.statusHistory]);

  const progressPercentage = (activeStep / 4) * 100;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Theo dõi đơn hàng #{shipmentData.orderId}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                Mã vận đơn: {shipmentData.trackingNumber}
              </Typography>
              <Chip 
                label={shipmentData.carrier}
                avatar={<LocalShipping />}
                sx={{ bgcolor: '#f0f9ff', color: '#0284c7' }}
              />
            </Box>
            <Tooltip title="Làm mới thông tin">
              <IconButton 
                onClick={onRefresh}
                disabled={loading}
                sx={{ bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}
              >
                <Refresh sx={{ color: loading ? '#9ca3af' : '#16a34a' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">Tiến độ giao hàng</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#16a34a',
                  borderRadius: 4
                }
              }} 
            />
          </Box>

          {/* Current Status */}
          <Alert 
            severity={shipmentData.currentStatus.status === 'delayed' ? 'warning' : 'info'}
            sx={{ bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Trạng thái hiện tại
            </Typography>
            <Typography variant="body2">
              {shipmentData.currentStatus.description}
              {shipmentData.currentStatus.location && (
                <span> tại {shipmentData.currentStatus.location}</span>
              )}
            </Typography>
            {shipmentData.currentStatus.estimatedDelivery && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#0369a1' }}>
                Dự kiến giao: {formatViDateTime(shipmentData.currentStatus.estimatedDelivery)}
              </Typography>
            )}
          </Alert>
        </CardContent>
      </Card>

      {/* Shipment Timeline */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Lịch trình vận chuyển
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {shipmentData.statusHistory.map((status, index) => (
              <Step key={index}>
                <StepLabel
                  icon={getStatusIcon(status.step, status.status)}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: status.status === 'completed' ? 'bold' : 'normal',
                      color: status.status === 'completed' ? '#16a34a' : '#6b7280'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {status.description}
                  </Typography>
                  {status.timestamp && (
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                      {formatViDateTime(status.timestamp)}
                    </Typography>
                  )}
                  {status.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {status.location}
                      </Typography>
                    </Box>
                  )}
                </StepLabel>
                <StepContent>
                  <Box sx={{ pb: 2 }}>
                    {status.carrier && (
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Vận chuyển bởi: {status.carrier}
                      </Typography>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Thông tin giao hàng
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Customer Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#374151' }}>
                Người nhận
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f3f4f6' }}>
                  <Person sx={{ color: '#6b7280' }} />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {shipmentData.customerInfo.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {shipmentData.customerInfo.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: '#6b7280', mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {shipmentData.shippingAddress}
                </Typography>
              </Box>
            </Box>

            {/* Package Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#374151' }}>
                Thông tin gói hàng
              </Typography>
              <Box sx={{ space: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Số lượng sản phẩm:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {shipmentData.packageInfo.items} món
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Khối lượng:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {shipmentData.packageInfo.weight}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Kích thước:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {shipmentData.packageInfo.dimensions}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}