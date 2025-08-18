import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { checkoutService } from '../../services/api/checkoutService';
import { paymentsService } from '../../services/api/paymentsService';
import { useCheckoutWizard } from '../../store/checkoutWizardStore';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Error,
  Refresh,
  SkipNext,
  Store,
  AccessTime,
  ExpandMore,
  Security,
  LocalShipping,
  Receipt
} from '@mui/icons-material';
//---------
import { useCheckoutInfoStore } from '../../store/checkoutInfoStore';
import PaymentMethodModal from '../../components/checkout/PaymentMethodModal';
import bg from '../../assets/img/images/grid-image/fabric.png';

const formatVND = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
// Helper: x1000 nếu là vật liệu
const formatMaterialVND = (n: number, type?: string) => type === 'material' ? formatVND(n * 1000) : formatVND(n);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const wizard = useCheckoutWizard();
//-----------
  const shipping = useCheckoutInfoStore((s) => s.shipping);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [openPayment, setOpenPayment] = useState(false);
  const [preferredBank, setPreferredBank] = useState<string | undefined>(undefined);

  // Payload không còn cần trên FE nếu dùng create-session-from-cart

  useEffect(() => {
    const bootstrap = async () => {
      if (!items.length) {
        navigate('/cart');
        return;
      }
      try {
        setLoading(true);
        const resp = await checkoutService.createSessionFromCart();
        wizard.start(resp);
      } catch (e: any) {
        setError(e?.message || 'Không tạo được session');
      } finally {
        setLoading(false);
      }
    };
    if (!wizard.orderGroupId) {
      bootstrap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentOrder = wizard.orders[wizard.currentIndex];

  const handlePay = async () => {
    if (!currentOrder) return;
    if (preferredBank === undefined) {
      setOpenPayment(true);
      return;
    }
    try {
      setLoading(true);
      // Nếu là vật liệu thì x1000 khi gửi payment
      const isMaterial = items.find(i => i.type === 'material');
      const amount = isMaterial ? currentOrder.totalAmount * 1000 : currentOrder.totalAmount;
      const { redirectUrl } = await paymentsService.createVnpay({
        orderId: currentOrder.orderId,
        amount,
        createdDate: new Date().toISOString(),
        bankCode: preferredBank || undefined,
        fullName: shipping?.fullName || 'Khach hang',
        description: `Thanh toan don hang: ${currentOrder.orderId}`,
      });
      window.location.href = redirectUrl;
    } catch (e: any) {
      setError(e?.message || 'Không tạo được link thanh toán');
      setLoading(false);
    }
  };

  const handleRetry = async (orderId: number) => {
    try {
      setLoading(true);
      const order = wizard.orders.find(o => o.orderId === orderId);
      if (!order) return;
      // Nếu là vật liệu thì x1000 khi gửi payment
      const isMaterial = items.find(i => i.type === 'material');
      const amount = isMaterial ? order.totalAmount * 1000 : order.totalAmount;
      const { redirectUrl } = await paymentsService.createVnpay({
        orderId: order.orderId,
        amount,
        createdDate: new Date().toISOString(),
        bankCode: preferredBank || undefined,
        fullName: shipping?.fullName || 'Khach hang',
        description: `Thanh toan don hang: ${order.orderId}`,
      });
      window.location.href = redirectUrl;
    } catch (e: any) {
      setError(e?.message || 'Không tạo được link thanh toán');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!currentOrder) return;
    wizard.markStatus(currentOrder.orderId, 'Skipped');
    wizard.next();
    if (wizard.currentIndex >= wizard.orders.length - 1) {
      clearCart();
    }
  };

  if (loading && !wizard.orders.length) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
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
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              Thanh Toán
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3, boxShadow: 3 }}>
            <CircularProgress size={60} sx={{ mb: 3, color: '#16a34a' }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Đang tạo phiên thanh toán...
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Vui lòng đợi trong giây lát
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
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
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              Thanh Toán
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Có lỗi xảy ra</Typography>
            <Typography>{error}</Typography>
          </Alert>
          <Button
            variant="contained"
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
            onClick={() => navigate('/cart')}
          >
            Quay lại giỏ hàng
          </Button>
        </Container>
      </Box>
    );
  }

  const completedOrders = wizard.orders.filter(o => wizard.statusByOrderId[o.orderId] === 'Paid').length;
  const progressPercentage = (completedOrders / wizard.orders.length) * 100;

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
            Thanh Toán Đơn Hàng
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', opacity: 0.9 }}>
            Thanh toán theo từng nhà cung cấp để đảm bảo giao dịch an toàn
          </Typography>
        </Container>
      </Box>

      {/* Progress Steps */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={1} sx={{ mb: 4 }}>
          <Step completed>
            <StepLabel>Giỏ hàng</StepLabel>
          </Step>
          <Step>
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={4}>
          {/* Orders List */}
          <Grid >
            <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', bgcolor: '#f9fafb' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Danh sách đơn hàng ({wizard.orders.length})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      Tiến độ thanh toán:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {completedOrders}/{wizard.orders.length}
                    </Typography>
                  </Box>
                </Box>

                {/* Orders */}
                {wizard.orders.map((order, idx) => {
                  const isActive = idx === wizard.currentIndex;
                  const status = wizard.statusByOrderId[order.orderId];
                  const statusIcon = status === 'Paid' ? <CheckCircle color="success" /> : 
                                   status === 'Failed' ? <Error color="error" /> : 
                                   <AccessTime color="action" />;
                  const statusColor = status === 'Paid' ? '#16a34a' : 
                                     status === 'Failed' ? '#dc2626' : '#6b7280';

                  return (
                    <Accordion 
                      key={order.orderId} 
                      expanded={isActive}
                      sx={{ 
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                        border: isActive ? '2px solid #16a34a' : '1px solid #e5e7eb',
                        borderRadius: '12px !important',
                        mb: 2,
                        mx: 2
                      }}
                    >
                      <AccordionSummary
                        expandIcon={isActive ? <ExpandMore /> : null}
                        sx={{ 
                          bgcolor: isActive ? '#f0f9ff' : 'white',
                          borderRadius: '12px',
                          '& .MuiAccordionSummary-content': {
                            margin: '16px 0'
                          }
                        }}
                      >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Store sx={{ color: '#16a34a' }} />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  Đơn hàng #{order.orderId}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                  {order.sellerType}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {statusIcon}
                              <Chip 
                                label={status}
                                size="small"
                                sx={{ 
                                  bgcolor: statusColor === '#16a34a' ? '#dcfce7' : 
                                          statusColor === '#dc2626' ? '#fee2e2' : '#f3f4f6',
                                  color: statusColor,
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16a34a', textAlign: 'right' }}>
                              {formatMaterialVND(order.totalAmount, items.find(i => i.type === 'material') ? 'material' : undefined)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      
                      {isActive && (
                        <AccordionDetails sx={{ pt: 0 }}>
                          <Divider sx={{ mb: 3 }} />
                          <Grid container spacing={3}>
                            <Grid >
                              <Typography variant="subtitle2" sx={{ mb: 2, color: '#6b7280' }}>
                                Chi tiết đơn hàng
                              </Typography>
                              <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  Đây là đơn hàng hiện tại cần thanh toán. Vui lòng hoàn tất thanh toán để tiếp tục.
                                </Typography>
                              </Alert>
                            </Grid>
                            <Grid >
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {status === 'Failed' && (
                                  <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => handleRetry(order.orderId)}
                                    disabled={loading}
                                  >
                                    Thử lại
                                  </Button>
                                )}
                                {isActive && status !== 'Paid' && (
                                  <>
                                    <Button
                                      variant="outlined"
                                      startIcon={<SkipNext />}
                                      onClick={handleSkip}
                                      disabled={loading}
                                    >
                                      Bỏ qua
                                    </Button>
                                    <Button
                                      variant="contained"
                                      size="large"
                                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                                      onClick={handlePay}
                                      disabled={loading}
                                      sx={{
                                        bgcolor: '#16a34a',
                                        '&:hover': { bgcolor: '#15803d' },
                                        py: 1.5,
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Sidebar */}
          <Grid >
            <Card sx={{ borderRadius: 3, boxShadow: 2, position: 'sticky', top: 20, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Tóm tắt thanh toán
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Tổng số đơn hàng:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{wizard.orders.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Đã thanh toán:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#16a34a' }}>{completedOrders}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Còn lại:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                      {wizard.orders.length - completedOrders}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng giá trị:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {formatMaterialVND(wizard.orders.reduce((sum, o) => sum + o.totalAmount, 0), items.find(i => i.type === 'material') ? 'material' : undefined)}
                    </Typography>
                  </Box>
                </Box>

                {wizard.expiresAt && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Thời gian còn lại
                    </Typography>
                    <Typography variant="body2">
                      Hết hạn: {new Date(wizard.expiresAt).toLocaleString()}
                    </Typography>
                  </Alert>
                )}

                {/* Security Notice */}
                <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Security sx={{ fontSize: 20, color: '#0284c7' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                      Thanh toán an toàn
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#0369a1' }}>
                    Giao dịch được bảo mật bởi VNPay với mã hóa SSL 256-bit
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Cần hỗ trợ?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
                  Liên hệ với chúng tôi nếu bạn gặp khó khăn trong quá trình thanh toán
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ color: '#16a34a', borderColor: '#16a34a' }}
                >
                  Liên hệ hỗ trợ
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PaymentMethodModal
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        onConfirm={({ bankCode }) => {
          setPreferredBank(bankCode ?? '');
          setTimeout(() => handlePay(), 0);
        }}
      />
    </Box>
  );
}


