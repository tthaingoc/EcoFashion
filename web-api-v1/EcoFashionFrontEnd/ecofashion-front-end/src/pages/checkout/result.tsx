import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckoutWizard } from '../../store/checkoutWizardStore';
import { ordersService } from '../../services/api/ordersService';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle,
  Error,
  HourglassEmpty,
  ShoppingBag,
  Receipt,
  ArrowForward
} from '@mui/icons-material';
import bg from '../../assets/img/images/grid-image/fabric.png';

export default function CheckoutResultPage() {
  const navigate = useNavigate();
  const wizard = useCheckoutWizard();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | null>(null);

  useEffect(() => {
    const confirmAndAdvance = async () => {
      // Nếu BE redirect kèm orderId, điều hướng wizard đến đúng order
      const orderIdFromQuery = Number(searchParams.get('orderId'));
      if (orderIdFromQuery && !Number.isNaN(orderIdFromQuery)) {
        wizard.goToOrder(orderIdFromQuery);
      }
      const current = wizard.orders[wizard.currentIndex];
      if (!current) {
        navigate('/orders');
        return;
      }
      try {
        setLoading(true);
        const resp = await ordersService.getById(current.orderId);
        const status = (resp as any)?.result?.paymentStatus || (resp as any)?.paymentStatus || (resp as any)?.status;
        const normalized = String(status || '').toLowerCase();
        if (normalized === 'paid' || normalized === 'processing') {
          wizard.markStatus(current.orderId, 'Paid');
          setPaymentStatus('success');
        } else if (normalized === 'failed') {
          wizard.markStatus(current.orderId, 'Failed');
          setPaymentStatus('failed');
        } else {
          wizard.markStatus(current.orderId, 'Pending');
          setPaymentStatus('pending');
        }
      } catch (e: any) {
        setError(e?.message || 'Không xác nhận được trạng thái đơn');
      } finally {
        setLoading(false);
        // Add delay to show result before redirecting
        setTimeout(() => {
          wizard.next();
          const hasNext = wizard.currentIndex < wizard.orders.length - 1;
          navigate(hasNext ? '/checkout' : '/orders');
        }, 3000);
      }
    };
    confirmAndAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentOrder = wizard.orders[wizard.currentIndex];
  const completedOrders = wizard.orders.filter(o => wizard.statusByOrderId[o.orderId] === 'Paid').length;
  const hasNext = wizard.currentIndex < wizard.orders.length - 1;

  const getStatusConfig = () => {
    if (loading) return {
      icon: <CircularProgress size={60} sx={{ color: '#16a34a' }} />,
      title: 'Đang xác nhận thanh toán...',
      message: 'Vui lòng đợi trong giây lát',
      color: '#16a34a'
    };
    
    if (error) return {
      icon: <Error sx={{ fontSize: 60, color: '#dc2626' }} />,
      title: 'Có lỗi xảy ra',
      message: error,
      color: '#dc2626'
    };

    switch (paymentStatus) {
      case 'success':
        return {
          icon: <CheckCircle sx={{ fontSize: 60, color: '#16a34a' }} />,
          title: 'Thanh toán thành công!',
          message: `Đơn hàng #${currentOrder?.orderId} đã được thanh toán thành công`,
          color: '#16a34a'
        };
      case 'failed':
        return {
          icon: <Error sx={{ fontSize: 60, color: '#dc2626' }} />,
          title: 'Thanh toán thất bại',
          message: `Đơn hàng #${currentOrder?.orderId} không thể thanh toán. Vui lòng thử lại`,
          color: '#dc2626'
        };
      case 'pending':
        return {
          icon: <HourglassEmpty sx={{ fontSize: 60, color: '#f59e0b' }} />,
          title: 'Đang xử lý thanh toán',
          message: `Đơn hàng #${currentOrder?.orderId} đang được xử lý`,
          color: '#f59e0b'
        };
      default:
        return {
          icon: <CircularProgress size={60} sx={{ color: '#16a34a' }} />,
          title: 'Đang xử lý...',
          message: 'Vui lòng đợi',
          color: '#16a34a'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box
        sx={{
          height: 250,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            Kết Quả Thanh Toán
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', opacity: 0.9 }}>
            Xác nhận trạng thái giao dịch của bạn
          </Typography>
        </Container>
      </Box>

      {/* Progress Steps */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={2} sx={{ mb: 4 }}>
          <Step completed>
            <StepLabel>Giỏ hàng</StepLabel>
          </Step>
          <Step completed>
            <StepLabel>Thông tin</StepLabel>
          </Step>
          <Step>
            <StepLabel>Thanh toán</StepLabel>
          </Step>
          <Step>
            <StepLabel>Hoàn thành</StepLabel>
          </Step>
        </Stepper>
      </Container>

      {/* Result Content */}
      <Container maxWidth="md" sx={{ pb: 8 }}>
        <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            {statusConfig.icon}
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: statusConfig.color, mt: 2 }}>
              {statusConfig.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#6b7280' }}>
              {statusConfig.message}
            </Typography>

            {currentOrder && !loading && (
              <Box sx={{ mb: 4 }}>
                <Alert 
                  severity={paymentStatus === 'success' ? 'success' : paymentStatus === 'failed' ? 'error' : 'warning'}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body2">
                    <strong>Mã đơn hàng:</strong> #{currentOrder.orderId} | 
                    <strong> Tổng tiền:</strong> {currentOrder.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                </Alert>
              </Box>
            )}

            {!loading && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Tiến độ thanh toán tổng thể
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#6b7280' }}>
                  Đã hoàn thành {completedOrders}/{wizard.orders.length} đơn hàng
                </Typography>
                
                {hasNext ? (
                  <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                    Đang chuyển đến đơn hàng tiếp theo...
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                    Đang chuyển đến trang đơn hàng...
                  </Typography>
                )}
              </Box>
            )}

            {!loading && (
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/orders')}
                  startIcon={<Receipt />}
                >
                  Xem đơn hàng
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/fashion')}
                  sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                  endIcon={<ArrowForward />}
                >
                  Tiếp tục mua sắm
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        {!loading && paymentStatus === 'success' && (
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Bước tiếp theo
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#16a34a' }} />
                  </ListItemIcon>
                  <ListItemText primary="Bạn sẽ nhận được email xác nhận đơn hàng" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingBag sx={{ color: '#16a34a' }} />
                  </ListItemIcon>
                  <ListItemText primary="Nhà cung cấp sẽ xử lý và giao hàng đến bạn" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Receipt sx={{ color: '#16a34a' }} />
                  </ListItemIcon>
                  <ListItemText primary="Bạn có thể theo dõi trạng thái đơn hàng trong mục 'Đơn hàng của tôi'" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}


