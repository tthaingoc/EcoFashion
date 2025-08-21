import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Grid,
  Autocomplete
} from '@mui/material';
import {
  Add,
  Edit,
  LocalShipping,
  Visibility,
  Update,
  CheckCircle,
  Cancel,
  Warning,
  Flight,
  Home
} from '@mui/icons-material';
import { formatViDateTime } from '../../utils/date';

export interface OrderShipment {
  orderId: number;
  customerName: string;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  estimatedDelivery?: string;
  items: number;
  totalValue: number;
}

interface ShipmentUpdateData {
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string;
  notes: string;
  estimatedDelivery?: string;
}

interface Props {
  orders: OrderShipment[];
  onUpdateShipment: (update: ShipmentUpdateData) => void;
  onViewTracking: (orderId: number) => void;
  loading?: boolean;
}

const carriers = [
  'Giao Hàng Nhanh (GHN)',
  'Giao Hàng Tiết Kiệm (GHTK)', 
  'Viettel Post',
  'Vietnam Post',
  'J&T Express',
  'Shopee Express',
  'Ninja Van',
  'Kerry Express'
];

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý', color: '#6b7280' },
  { value: 'processing', label: 'Đang chuẩn bị', color: '#f59e0b' },
  { value: 'shipped', label: 'Đang vận chuyển', color: '#2563eb' },
  { value: 'delivered', label: 'Đã giao hàng', color: '#16a34a' },
  { value: 'cancelled', label: 'Đã hủy', color: '#dc2626' }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered': return <CheckCircle sx={{ color: '#16a34a' }} />;
    case 'shipped': return <LocalShipping sx={{ color: '#2563eb' }} />;
    case 'processing': return <Update sx={{ color: '#f59e0b' }} />;
    case 'cancelled': return <Cancel sx={{ color: '#dc2626' }} />;
    default: return <Warning sx={{ color: '#6b7280' }} />;
  }
};

const formatVND = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function ShipmentManagement({ orders, onUpdateShipment, onViewTracking, loading = false }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderShipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form data
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const handleOpenDialog = (order: OrderShipment) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || '');
    setStatus(order.status);
    setLocation('');
    setNotes('');
    setEstimatedDelivery(order.estimatedDelivery || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setTrackingNumber('');
    setCarrier('');
    setStatus('');
    setLocation('');
    setNotes('');
    setEstimatedDelivery('');
  };

  const handleSubmit = () => {
    if (!selectedOrder) return;

    const updateData: ShipmentUpdateData = {
      orderId: selectedOrder.orderId,
      trackingNumber,
      carrier,
      status,
      location,
      notes,
      estimatedDelivery: estimatedDelivery || undefined
    };

    onUpdateShipment(updateData);
    handleCloseDialog();
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.orderId.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Quản lý vận chuyển
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Theo dõi và cập nhật trạng thái vận chuyển các đơn hàng
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statusOptions.map(({ value, label, color }) => (
            <Grid item xs={12} sm={6} md={2.4} key={value}>
              <Card sx={{ textAlign: 'center', border: filterStatus === value ? `2px solid ${color}` : '1px solid #e5e7eb' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>
                    {statusCounts[value] || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                placeholder="Mã đơn, tên khách hàng, mã vận đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {statusOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Tổng: <strong>{filteredOrders.length}</strong> đơn hàng
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vận chuyển</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Giá trị</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.orderId} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      #{order.orderId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {order.items} sản phẩm
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {order.shippingAddress.length > 50 
                        ? `${order.shippingAddress.substring(0, 50)}...` 
                        : order.shippingAddress}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(order.status)}
                      <Chip
                        label={statusOptions.find(s => s.value === order.status)?.label}
                        size="small"
                        sx={{
                          bgcolor: `${statusOptions.find(s => s.value === order.status)?.color}20`,
                          color: statusOptions.find(s => s.value === order.status)?.color,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    {order.trackingNumber ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.trackingNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {order.carrier}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        Chưa cập nhật
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {formatVND(order.totalValue)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatViDateTime(order.createdAt)}
                    </Typography>
                    {order.estimatedDelivery && (
                      <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                        Dự kiến: {formatViDateTime(order.estimatedDelivery)}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Cập nhật vận chuyển">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(order)}
                          sx={{ color: '#2563eb' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {order.trackingNumber && (
                        <Tooltip title="Xem chi tiết vận chuyển">
                          <IconButton 
                            size="small" 
                            onClick={() => onViewTracking(order.orderId)}
                            sx={{ color: '#16a34a' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Cập nhật vận chuyển - Đơn hàng #{selectedOrder?.orderId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã vận đơn"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Nhập mã vận đơn..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={carriers}
                value={carrier}
                onChange={(_, newValue) => setCarrier(newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Đơn vị vận chuyển" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  label="Trạng thái"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vị trí hiện tại"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kho hàng, trung tâm phân loại..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày giao dự kiến"
                type="datetime-local"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ghi chú"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về tình trạng vận chuyển..."
                multiline
                rows={2}
              />
            </Grid>

            {selectedOrder && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Thông tin đơn hàng:</strong><br />
                    Khách hàng: {selectedOrder.customerName}<br />
                    Địa chỉ: {selectedOrder.shippingAddress}<br />
                    Giá trị: {formatVND(selectedOrder.totalValue)}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!trackingNumber || !carrier || !status}
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}