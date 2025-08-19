import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import ShipmentTracker, { ShipmentData } from '../../components/shipment/ShipmentTracker';

// Mock shipment data generator based on orderId
const generateMockShipmentData = (orderId: string): ShipmentData => {
  const orderNum = parseInt(orderId);
  const isEvenOrder = orderNum % 2 === 0;
  
  return {
    orderId: orderNum,
    trackingNumber: `ECO${orderNum}${Date.now().toString().slice(-6)}`,
    carrier: isEvenOrder ? 'Giao Hàng Nhanh (GHN)' : 'Viettel Post',
    currentStatus: {
      step: isEvenOrder ? 2 : 1,
      status: isEvenOrder ? 'in_progress' : 'completed',
      timestamp: new Date(Date.now() - (isEvenOrder ? 2 : 8) * 3600000).toISOString(),
      location: isEvenOrder ? 'Trung tâm phân loại TP.HCM' : 'Kho hàng Hà Nội',
      description: isEvenOrder ? 'Hàng đang được vận chuyển' : 'Đơn hàng đã được đóng gói',
      carrier: isEvenOrder ? 'Giao Hàng Nhanh (GHN)' : 'Viettel Post',
      estimatedDelivery: new Date(Date.now() + 24 * 3600000).toISOString()
    },
    statusHistory: [
      {
        step: 0,
        status: 'completed',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        location: 'Kho hàng EcoFashion',
        description: 'Đơn hàng đã được xác nhận và đóng gói',
        carrier: isEvenOrder ? 'Giao Hàng Nhanh (GHN)' : 'Viettel Post'
      },
      {
        step: 1,
        status: isEvenOrder ? 'completed' : 'in_progress',
        timestamp: isEvenOrder ? new Date(Date.now() - 12 * 3600000).toISOString() : new Date(Date.now() - 8 * 3600000).toISOString(),
        location: isEvenOrder ? 'Trung tâm phân loại TP.HCM' : 'Đang xử lý',
        description: isEvenOrder ? 'Hàng đã được giao cho đơn vị vận chuyển' : 'Đang chuẩn bị vận chuyển',
        carrier: isEvenOrder ? 'Giao Hàng Nhanh (GHN)' : 'Viettel Post'
      },
      {
        step: 2,
        status: isEvenOrder ? 'in_progress' : 'pending',
        timestamp: isEvenOrder ? new Date(Date.now() - 2 * 3600000).toISOString() : undefined,
        location: isEvenOrder ? 'Đang trên đường giao' : undefined,
        description: isEvenOrder ? 'Hàng đang được vận chuyển đến địa chỉ giao hàng' : 'Chờ vận chuyển'
      },
      {
        step: 3,
        status: 'pending',
        description: 'Giao hàng thành công'
      }
    ],
    shippingAddress: `${orderNum} Đường ABC, Quận ${orderNum % 12 + 1}, TP.HCM`,
    customerInfo: {
      name: `Khách hàng #${orderNum}`,
      phone: `090${orderNum.toString().padStart(7, '0')}`
    },
    packageInfo: {
      weight: `${(orderNum % 5 + 1).toFixed(1)} kg`,
      dimensions: '30x20x15 cm',
      items: orderNum % 3 + 1
    }
  };
};

export default function ShipmentTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShipmentData = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data
        const data = generateMockShipmentData(orderId);
        setShipmentData(data);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải thông tin vận chuyển');
      } finally {
        setLoading(false);
      }
    };

    loadShipmentData();
  }, [orderId]);

  const handleRefresh = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update with fresh data
      const data = generateMockShipmentData(orderId);
      // Simulate some progress
      if (data.currentStatus.step < 3) {
        data.currentStatus.timestamp = new Date().toISOString();
        data.statusHistory[data.currentStatus.step].timestamp = new Date().toISOString();
      }
      setShipmentData(data);
    } catch (err: any) {
      setError('Không thể làm mới thông tin vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shipmentData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ color: '#16a34a', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Đang tải thông tin vận chuyển...
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Vui lòng đợi trong giây lát
          </Typography>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Có lỗi xảy ra</Typography>
            <Typography>{error}</Typography>
          </Alert>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ bgcolor: '#6b7280', '&:hover': { bgcolor: '#4b5563' } }}
            >
              Quay lại
            </Button>
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{ color: '#16a34a', borderColor: '#16a34a' }}
            >
              Trang chủ
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, mb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Theo dõi Vận chuyển
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Thông tin chi tiết về tình trạng giao hàng
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ color: '#6b7280', borderColor: '#6b7280' }}
              >
                Quay lại
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ color: '#16a34a', borderColor: '#16a34a' }}
              >
                Trang chủ
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Tracking Content */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Demo Mode:</strong> Đây là giao diện demo với dữ liệu mẫu. 
            Trong môi trường thực tế, thông tin sẽ được lấy từ API của các đơn vị vận chuyển.
          </Typography>
        </Alert>

        {shipmentData && (
          <ShipmentTracker
            shipmentData={shipmentData}
            onRefresh={handleRefresh}
            loading={loading}
          />
        )}
      </Container>
    </Box>
  );
}