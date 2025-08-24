import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Aos from "aos";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  IconButton,
  Divider,
  Avatar,
  Badge,
  TextField,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { 
  Add, 
  Remove, 
  Delete, 
  ShoppingCart, 
  LocalShipping, 
  Security,
  ArrowForward,
  Store
} from "@mui/icons-material";
//----------------
// Removed address popup; navigate straight to checkout to change/select address
import bg from '../../assets/img/images/grid-image/fabric.png'

const formatVND = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const grouped = useMemo(() => {
    const groups: Record<string, typeof items> = {} as any;
    items.forEach((item) => {
      if (!groups[item.sellerId]) groups[item.sellerId] = [] as any;
      (groups[item.sellerId] as any).push(item);
    });
    return groups;
  }, [items]);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(items.map(i => i.id));
    syncFromServer();
  }, [items.length]);

  const allSelected = selectedIds.length > 0 && selectedIds.length === items.length;
  const toggleAll = () => setSelectedIds(allSelected ? [] : items.map(i => i.id));
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectedSubtotal = useMemo(() => selectedIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean)
    .reduce((sum, i: any) => sum + i.price * i.quantity, 0), [selectedIds, items]);

  const total = selectedSubtotal;
  
  useEffect(() => {
    Aos.init();
  }, []);
  if (items.length === 0) {
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
              Giỏ Hàng
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'white' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link>
              <Typography>/</Typography>
              <Typography sx={{ color: '#4ade80' }}>Giỏ hàng</Typography>
            </Box>
          </Container>
        </Box>

        {/* Empty Cart */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3, boxShadow: 3 }}>
            <ShoppingCart sx={{ fontSize: 80, color: '#e5e7eb', mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#374151' }}>
              Giỏ hàng của bạn đang trống
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#6b7280' }}>
              Hãy khám phá các sản phẩm thời trang bền vững của chúng tôi
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
              onClick={() => navigate('/fashion')}
            >
              Tiếp tục mua sắm
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                Giỏ Hàng
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link>
                <Typography>/</Typography>
                <Typography sx={{ color: '#4ade80' }}>Giỏ hàng</Typography>
              </Box>
            </Box>
            <Badge badgeContent={items.length} color="primary">
              <ShoppingCart sx={{ fontSize: 50, color: 'white' }} />
            </Badge>
          </Box>
        </Container>
      </Box>

      {/* Progress Steps */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={0} sx={{ mb: 4 }}>
          <Step>
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

      {/* Cart Content */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={4}>
          <Grid >
            {/* Cart Items */}
            <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', bgcolor: '#f9fafb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input 
                        type="checkbox" 
                        checked={allSelected} 
                        onChange={toggleAll}
                        style={{ width: 18, height: 18 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Sản phẩm ({items.length})
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => clearCart()}
                    >
                      Xóa tất cả
                    </Button>
                  </Box>
                </Box>

                {/* Items by Seller */}
                {Object.entries(grouped).map(([sellerId, sellerItems]) => {
                  const sellerName = sellerItems[0]?.sellerName || `Nhà cung cấp ${sellerId.substring(0, 6)}`;
                  const sellerSubtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
                  
                  return (
                    <Box key={sellerId} sx={{ borderBottom: '1px solid #e5e7eb' }}>
                      {/* Seller Header */}
                      <Box sx={{ p: 3, bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Store sx={{ color: '#16a34a' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {sellerName}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`Tạm tính: ${formatVND(sellerSubtotal)}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      {/* Seller Items */}
                      {sellerItems.map((item, index) => (
                        <Box key={item.id} sx={{ p: 3, borderBottom: index < sellerItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <Grid container spacing={3} alignItems="center">
                            <Grid >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedIds.includes(item.id)} 
                                  onChange={() => toggleOne(item.id)}
                                  style={{ width: 18, height: 18 }}
                                />
                                <Avatar
                                  src={item.image}
                                  variant="rounded"
                                  sx={{ width: 80, height: 80 }}
                                />
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {item.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <Chip label={item.type} size="small" color="primary" variant="outlined" />
                                    <Chip label={`ĐVT: ${item.unit}`} size="small" />
                                  </Box>
                                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    {item.sellerName}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid >
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                                {formatVND(item.price)}
                              </Typography>
                            </Grid>
                            <Grid >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => decreaseQuantity(item.id)}
                                  sx={{ bgcolor: '#f3f4f6' }}
                                >
                                  <Remove />
                                </IconButton>
                                <TextField
                                  value={item.quantity}
                                  size="small"
                                  sx={{ width: 60, textAlign: 'center' }}
                                  inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <IconButton 
                                  size="small" 
                                  onClick={() => increaseQuantity(item.id)}
                                  sx={{ bgcolor: '#f3f4f6' }}
                                >
                                  <Add />
                                </IconButton>
                              </Box>
                            </Grid>
                            <Grid >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                                  {formatVND(item.price * item.quantity)}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}

                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid >
            <Card sx={{ borderRadius: 3, boxShadow: 2, position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Tóm tắt đơn hàng
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Tạm tính ({selectedIds.length} sản phẩm):</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{formatVND(selectedSubtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Phí vận chuyển:</Typography>
                    <Typography sx={{ color: '#16a34a', fontWeight: 'bold' }}>Miễn phí</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                      {formatVND(total)}
                    </Typography>
                  </Box>
                </Box>

                {/* Button Standard Checkout - Thanh toán chuẩn theo cách truyền thống */}
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled={selectedIds.length === 0}
                  sx={{
                    borderColor: '#16a34a',
                    color: '#16a34a',
                    '&:hover': { 
                      borderColor: '#15803d',
                      color: '#15803d',
                      bgcolor: 'rgba(22, 163, 74, 0.04)'
                    },
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'medium',
                  }}
                  onClick={() => {
                    // Lưu danh sách sản phẩm đã chọn vào localStorage
                    localStorage.setItem('selectedItemsForCheckout', JSON.stringify(selectedIds));
                    // Điều hướng đến trang xác nhận
                    navigate('/checkout/confirm');
                  }}
                  endIcon={<ArrowForward />}
                >
                  Tiếp Tục Thanh Toán
                </Button>

                {/* Security Notice */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Security sx={{ fontSize: 20, color: '#0284c7' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                      Giao dịch được bảo mật
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#0369a1' }}>
                    Thông tin thanh toán của bạn được mã hóa và bảo vệ 100%
                  </Typography>
                </Box>

                {/* Continue Shopping */}
                <Button
                  variant="text"
                  fullWidth
                  sx={{ mt: 2, color: '#16a34a', fontWeight: 'bold' }}
                  onClick={() => navigate('/fashion')}
                >
                  ← Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Removed ShippingModal - address selection handled on Checkout page */}
    </Box>
  )
}
