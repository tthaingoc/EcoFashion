import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  AccessTime,
  LocalShipping,
  CheckCircle,
  Visibility,
  Warning,
  Person,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Inventory
} from '@mui/icons-material';
import { ordersService, OrderModel, UpdateFulfillmentStatusRequest, ShipOrderRequest } from '../../services/api/ordersService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

type Order = OrderModel;

interface DesignerOrdersProps {
  defaultFilter?: 'all' | 'processing' | 'shipped' | 'delivered';
}

const OrderStatusBadge: React.FC<{ 
  status: string; 
  type?: 'order' | 'payment' | 'fulfillment' 
}> = ({ status, type = 'fulfillment' }) => {
  const getStatusConfig = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid':
          return { color: 'success' as const, icon: CheckCircle, text: 'Đã thanh toán' };
        case 'Pending':
          return { color: 'warning' as const, icon: AccessTime, text: 'Chờ thanh toán' };
        case 'Failed':
          return { color: 'error' as const, icon: Warning, text: 'Thất bại' };
        default:
          return { color: 'default' as const, icon: Warning, text: status };
      }
    }
    
    // Fulfillment status
    switch (status) {
      case 'None':
        return { color: 'default' as const, icon: AccessTime, text: 'Chờ xử lý' };
      case 'Processing':
        return { color: 'info' as const, icon: AccessTime, text: 'Đang xử lý' };
      case 'Shipped':
        return { color: 'secondary' as const, icon: LocalShipping, text: 'Đang vận chuyển' };
      case 'Delivered':
        return { color: 'success' as const, icon: CheckCircle, text: 'Đã giao' };
      case 'Canceled':
        return { color: 'error' as const, icon: Warning, text: 'Đã hủy' };
      default:
        return { color: 'default' as const, icon: Warning, text: status };
    }
  };

  const config = getStatusConfig(status, type);
  const IconComponent = config.icon;

  return (
    <Chip
      icon={<IconComponent />}
      label={config.text}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

const OrderCard: React.FC<{
  order: Order;
  onViewDetails: (orderId: number) => void;
  onConfirmOrder: (orderId: number) => void;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  isUpdating?: boolean;
}> = ({ order, onViewDetails, onConfirmOrder, onUpdateStatus, isUpdating }) => {
  const canConfirm = order.paymentStatus === 'Paid' && (order.fulfillmentStatus === 'None' || !order.fulfillmentStatus);
  const canShip = order.paymentStatus === 'Paid' && order.fulfillmentStatus === 'Processing';
  const canComplete = order.paymentStatus === 'Paid' && order.fulfillmentStatus === 'Shipped';

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        '&:hover': { 
          boxShadow: 2,
          borderColor: 'primary.main'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Đơn hàng #{order.orderId}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
              </Typography>
            </Stack>
          </Box>
          <OrderStatusBadge status={order.fulfillmentStatus} />
        </Box>

        {/* Order Info */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Khách hàng:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.userName}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {order.totalPrice.toLocaleString('vi-VN')} VND
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Địa chỉ:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 400, maxWidth: 200 }}>
                    {order.shippingAddress}
                  </Typography>
                </Box>
              </Box>
              
              {order.personalPhoneNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">SĐT:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.personalPhoneNumber}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Thanh toán:</Typography>
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => onViewDetails(order.orderId)}
            size="small"
          >
            Chi tiết
          </Button>

          {canConfirm && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<CheckCircle />}
              onClick={() => onConfirmOrder(order.orderId)}
              disabled={isUpdating}
              size="small"
            >
              {isUpdating ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
            </Button>
          )}

          {canShip && (
            <Button
              variant="contained"
              color="info"
              startIcon={<LocalShipping />}
              onClick={() => onUpdateStatus(order.orderId, 'Shipped')}
              disabled={isUpdating}
              size="small"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Xác nhận vận chuyển'}
            </Button>
          )}

          {canComplete && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => onUpdateStatus(order.orderId, 'Delivered')}
              disabled={isUpdating}
              size="small"
            >
              {isUpdating ? 'Đang hoàn thành...' : 'Hoàn thành đơn hàng'}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const DesignerOrders: React.FC<DesignerOrdersProps> = ({ defaultFilter = 'all' }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>(defaultFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { designerProfile } = useAuthStore();

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!designerProfile?.designerId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedOrders = await ordersService.getOrdersBySeller(designerProfile.designerId);
        setOrders(fetchedOrders || []);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [designerProfile?.designerId]);

  const realOrders: Order[] = orders;

  // Filter orders based on selected filter
  const filteredOrders = realOrders.filter(order => {
    if (filter === 'all') return true;
    return order.fulfillmentStatus.toLowerCase() === filter;
  });

  const handleViewDetails = (orderId: number) => {
    const order = realOrders.find(o => o.orderId === orderId);
    setSelectedOrder(order || null);
  };

  const handleConfirmOrder = async (orderId: number) => {
    setIsUpdating(true);
    
    // Optimistic update
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, fulfillmentStatus: 'Processing', status: 'processing' }
          : order
      )
    );
    
    try {
      await ordersService.updateFulfillmentStatus(orderId, {
        fulfillmentStatus: 'Processing',
        notes: 'Đơn hàng đã được xác nhận bởi designer'
      });
      
      toast.success(`✅ Đơn hàng #${orderId} đã được xác nhận thành công!`);
    } catch (error: any) {
      console.error('❌ Error confirming order:', error);
      // Rollback optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, fulfillmentStatus: 'None', status: 'pending' }
            : order
        )
      );
      
      const errorMsg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác nhận đơn hàng';
      toast.error(`❌ Lỗi xác nhận: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    
    // Optimistic update
    const statusMapping: Record<string, string> = {
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Processing': 'processing'
    };
    
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, fulfillmentStatus: newStatus, status: statusMapping[newStatus] || 'processing' }
          : order
      )
    );
    
    try {
      if (newStatus === 'Shipped') {
        await ordersService.markOrderShipped(orderId, {
          carrier: 'Vận chuyển tiêu chuẩn',
          notes: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
        });
      } else if (newStatus === 'Delivered') {
        await ordersService.markOrderDelivered(orderId);
      } else {
        await ordersService.updateFulfillmentStatus(orderId, {
          fulfillmentStatus: newStatus,
          notes: `Cập nhật trạng thái: ${newStatus}`
        });
      }
      
      const statusMessages: Record<string, string> = {
        'Shipped': '🚚 Đơn hàng đã được chuyển cho đơn vị vận chuyển',
        'Delivered': '✅ Đơn hàng đã hoàn thành và kích hoạt thanh toán cho designer',
        'Processing': '⏳ Đơn hàng đang được xử lý',
      };
      
      const successMsg = statusMessages[newStatus] || `Đơn hàng #${orderId} đã được cập nhật: ${newStatus}`;
      toast.success(successMsg);
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      
      // Rollback optimistic update
      if (designerProfile?.designerId) {
        const updatedOrders = await ordersService.getOrdersBySeller(designerProfile.designerId);
        setOrders(updatedOrders || []);
      }
      
      const errorMsg = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng';
      toast.error(`❌ Lỗi cập nhật: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getOrderCounts = () => {
    return {
      all: realOrders.length,
      processing: realOrders.filter(o => o.fulfillmentStatus === 'Processing').length,
      shipped: realOrders.filter(o => o.fulfillmentStatus === 'Shipped').length,
      delivered: realOrders.filter(o => o.fulfillmentStatus === 'Delivered').length,
    };
  };

  const counts = getOrderCounts();

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Quản lý đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và xử lý các đơn hàng từ khách hàng
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tất cả đơn hàng
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {counts.all}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đang xử lý
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {counts.processing}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AccessTime />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đang vận chuyển
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    {counts.shipped}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <LocalShipping />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đã giao
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {counts.delivered}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(_, newValue) => setFilter(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Tất cả (${counts.all})`} value="all" />
          <Tab label={`Đang xử lý (${counts.processing})`} value="processing" />
          <Tab label={`Đang vận chuyển (${counts.shipped})`} value="shipped" />
          <Tab label={`Đã giao (${counts.delivered})`} value="delivered" />
        </Tabs>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Đang tải đơn hàng...
          </Typography>
        </Box>
      )}

      {/* Updating State */}
      {isUpdating && (
        <Alert severity="info" sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
          Đang cập nhật đơn hàng...
        </Alert>
      )}

      {/* Orders List */}
      {!isLoading && (
        <Box>
          {filteredOrders.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Không có đơn hàng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${filter === 'processing' ? 'đang xử lý' : filter === 'shipped' ? 'đang vận chuyển' : 'đã giao'}`}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredOrders.map(order => (
                <Grid item xs={12} lg={6} key={order.orderId}>
                  <OrderCard
                    order={order}
                    onViewDetails={handleViewDetails}
                    onConfirmOrder={handleConfirmOrder}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={isUpdating}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Order Details Modal */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h5" component="div">
                Chi tiết đơn hàng #{selectedOrder.orderId}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Order Status */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <OrderStatusBadge status={selectedOrder.fulfillmentStatus} />
                    <OrderStatusBadge status={selectedOrder.paymentStatus} type="payment" />
                  </Stack>
                </Grid>

                {/* Customer & Order Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Thông tin khách hàng
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Person sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tên khách hàng</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedOrder.userName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <LocationOn sx={{ color: 'text.secondary', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Địa chỉ giao hàng</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedOrder.shippingAddress}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedOrder.personalPhoneNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedOrder.personalPhoneNumber}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Thông tin đơn hàng
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarToday sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày đặt hàng</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AttachMoney sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tổng tiền</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {selectedOrder.totalPrice.toLocaleString('vi-VN')} VND
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Grid>

                {/* Order Items Placeholder */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Sản phẩm đã đặt
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">
                      Chi tiết sản phẩm sẽ được hiển thị khi tích hợp với API
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
              
              {selectedOrder.paymentStatus === 'Paid' && (selectedOrder.fulfillmentStatus === 'None' || !selectedOrder.fulfillmentStatus) && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    handleConfirmOrder(selectedOrder.orderId);
                    setSelectedOrder(null);
                  }}
                  disabled={isUpdating}
                >
                  Xác nhận đơn hàng
                </Button>
              )}

              {selectedOrder.paymentStatus === 'Paid' && selectedOrder.fulfillmentStatus === 'Processing' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.orderId, 'Shipped');
                    setSelectedOrder(null);
                  }}
                  disabled={isUpdating}
                >
                  Xác nhận vận chuyển
                </Button>
              )}

              {selectedOrder.paymentStatus === 'Paid' && selectedOrder.fulfillmentStatus === 'Shipped' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.orderId, 'Delivered');
                    setSelectedOrder(null);
                  }}
                  disabled={isUpdating}
                >
                  Hoàn thành đơn hàng
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DesignerOrders;