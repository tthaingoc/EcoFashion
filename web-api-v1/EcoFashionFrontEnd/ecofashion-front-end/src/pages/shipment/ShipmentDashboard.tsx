import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import ShipmentTracker, { ShipmentData } from '../../components/shipment/ShipmentTracker';
import ShipmentManagement, { OrderShipment } from '../../components/shipment/ShipmentManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Mock data for demo
const mockOrders: OrderShipment[] = [
  {
    orderId: 1001,
    customerName: 'Nguyễn Văn A',
    shippingAddress: '123 Lê Lợi, Quận 1, TP.HCM',
    status: 'processing',
    items: 3,
    totalValue: 1250000,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    orderId: 1002,
    customerName: 'Trần Thị B',
    shippingAddress: '456 Nguyễn Huệ, Quận 3, TP.HCM',
    status: 'shipped',
    trackingNumber: 'GHN123456789',
    carrier: 'Giao Hàng Nhanh (GHN)',
    items: 2,
    totalValue: 850000,
    createdAt: '2024-01-14T14:20:00Z',
    estimatedDelivery: '2024-01-16T16:00:00Z',
  },
  {
    orderId: 1003,
    customerName: 'Lê Văn C',
    shippingAddress: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    status: 'delivered',
    trackingNumber: 'VIETTEL987654321',
    carrier: 'Viettel Post',
    items: 1,
    totalValue: 450000,
    createdAt: '2024-01-13T09:15:00Z',
    estimatedDelivery: '2024-01-15T10:00:00Z',
  }
];

const mockShipmentData: ShipmentData = {
  orderId: 1002,
  trackingNumber: 'GHN123456789',
  carrier: 'Giao Hàng Nhanh (GHN)',
  currentStatus: {
    step: 2,
    status: 'in_progress',
    timestamp: '2024-01-15T14:30:00Z',
    location: 'Trung tâm phân loại TP.HCM',
    description: 'Hàng đang được vận chuyển',
    estimatedDelivery: '2024-01-16T16:00:00Z'
  },
  statusHistory: [
    {
      step: 0,
      status: 'completed',
      timestamp: '2024-01-14T14:20:00Z',
      location: 'Kho hàng TP.HCM',
      description: 'Đơn hàng đã được đóng gói',
      carrier: 'Giao Hàng Nhanh (GHN)'
    },
    {
      step: 1,
      status: 'completed',
      timestamp: '2024-01-15T08:00:00Z',
      location: 'Trung tâm phân loại TP.HCM', 
      description: 'Hàng đã được giao cho đơn vị vận chuyển',
      carrier: 'Giao Hàng Nhanh (GHN)'
    },
    {
      step: 2,
      status: 'in_progress',
      timestamp: '2024-01-15T14:30:00Z',
      location: 'Đang trên đường giao',
      description: 'Hàng đang được vận chuyển đến địa chỉ giao hàng'
    },
    {
      step: 3,
      status: 'pending',
      description: 'Giao hàng thành công'
    }
  ],
  shippingAddress: '456 Nguyễn Huệ, Quận 3, TP.HCM',
  customerInfo: {
    name: 'Trần Thị B',
    phone: '0901234567'
  },
  packageInfo: {
    weight: '2.5 kg',
    dimensions: '30x20x15 cm',
    items: 2
  }
};

export default function ShipmentDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<OrderShipment[]>(mockOrders);
  const [shipmentData, setShipmentData] = useState<ShipmentData>(mockShipmentData);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateShipment = async (updateData: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.orderId === updateData.orderId
          ? { ...order, trackingNumber: updateData.trackingNumber, carrier: updateData.carrier, status: updateData.status }
          : order
      ));

      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin vận chuyển thành công!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTracking = (orderId: number) => {
    // Switch to tracking tab and set selected order
    setTabValue(1);
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      // Update shipment data for the selected order
      setShipmentData({
        ...shipmentData,
        orderId: order.orderId,
        trackingNumber: order.trackingNumber || '',
        carrier: order.carrier || '',
        customerInfo: {
          name: order.customerName,
          phone: '0901234567' // Mock phone
        },
        shippingAddress: order.shippingAddress
      });
    }
  };

  const handleRefreshTracking = async () => {
    setLoading(true);
    try {
      // Simulate API call to refresh tracking data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock updated data
      const updatedData = {
        ...shipmentData,
        currentStatus: {
          ...shipmentData.currentStatus,
          timestamp: new Date().toISOString(),
          location: 'Bưu cục giao hàng Quận 3'
        }
      };
      setShipmentData(updatedData);
      
      setSnackbar({
        open: true,
        message: 'Đã cập nhật thông tin vận chuyển mới nhất!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật thông tin vận chuyển!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, mb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Quản lý Vận chuyển
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Theo dõi và quản lý tình trạng giao hàng của các đơn hàng
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
            >
              Làm mới dữ liệu
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Navigation Tabs */}
      <Container maxWidth="lg">
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab 
              label="Quản lý Đơn hàng" 
              sx={{ 
                fontWeight: 'bold',
                '&.Mui-selected': { color: '#16a34a' }
              }}
            />
            <Tab 
              label="Theo dõi Vận chuyển" 
              sx={{ 
                fontWeight: 'bold',
                '&.Mui-selected': { color: '#16a34a' }
              }}
            />
          </Tabs>
        </Card>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <ShipmentManagement
            orders={orders}
            onUpdateShipment={handleUpdateShipment}
            onViewTracking={handleViewTracking}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Đây là giao diện demo cho tính năng theo dõi vận chuyển. 
                  Dữ liệu hiển thị là dữ liệu mẫu để minh họa các tính năng.
                </Typography>
              </Alert>
              
              <ShipmentTracker
                shipmentData={shipmentData}
                onRefresh={handleRefreshTracking}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}