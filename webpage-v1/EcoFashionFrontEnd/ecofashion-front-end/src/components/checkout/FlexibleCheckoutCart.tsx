import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Checkbox, 
  Card, 
  CardContent, 
  Chip, 
  Avatar,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Store, 
  Person, 
  ShoppingCart, 
  Payment,
  SelectAll,
  DeselectOutlined,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { 
  flexibleCheckoutService, 
  CheckoutSessionDto, 
  ProviderGroupDto,
  CheckoutSessionItemDto 
} from '../../services/api/flexibleCheckoutService';
import { useWalletBalance } from '../../hooks/useWalletQueries';
import { toast } from 'react-toastify';

// Props cho component FlexibleCheckoutCart
interface FlexibleCheckoutCartProps {
  checkoutSessionId?: string; // ID của session checkout
  onPaymentSuccess?: (orderGroupId: string) => void; // Callback khi thanh toán thành công
}

const formatVND = (amount: number) => 
  amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Component giỏ hàng thanh toán linh hoạt - cho phép chọn tùy ý sản phẩm để thanh toán
const FlexibleCheckoutCart: React.FC<FlexibleCheckoutCartProps> = ({ 
  checkoutSessionId, 
  onPaymentSuccess 
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<CheckoutSessionDto | null>(null); // Thông tin session checkout
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [paymentLoading, setPaymentLoading] = useState(false); // Trạng thái đang xử lý thanh toán
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set()); // Danh sách sản phẩm được chọn
  const [error, setError] = useState<string | null>(null); // Thông báo lỗi

  const { data: walletBalance } = useWalletBalance(); // Lấy số dư ví điện tử

  useEffect(() => {
    if (!checkoutSessionId) {
      // Create session from cart
      createSessionFromCart();
    } else {
      loadSession();
    }
  }, [checkoutSessionId]);

  const createSessionFromCart = async () => {
    try {
      setLoading(true);
      const response = await flexibleCheckoutService.createSessionFromCart();
      if (response.success && response.data) {
        setSession(response.data);
        // Select all items by default
        const allItemIds = response.data.items.map((item: CheckoutSessionItemDto) => item.checkoutSessionItemId);
        setSelectedItems(new Set(allItemIds));
      } else {
        setError(response.message || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async () => {
    if (!checkoutSessionId) return;
    
    try {
      setLoading(true);
      const response = await flexibleCheckoutService.getSession(checkoutSessionId);
      if (response.success && response.data) {
        setSession(response.data);
        // Load current selection
        const selectedItemIds = response.data.items
          .filter((item: CheckoutSessionItemDto) => item.isSelected)
          .map((item: CheckoutSessionItemDto) => item.checkoutSessionItemId);
        setSelectedItems(new Set(selectedItemIds));
      } else {
        setError(response.message || 'Failed to load session');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading session');
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = async (itemIds: number[]) => {
    if (!session) return;

    try {
      const response = await flexibleCheckoutService.updateSelection(session.checkoutSessionId, {
        selectedItemIds: itemIds
      });
      if (response.success && response.data) {
        setSession(response.data);
        setSelectedItems(new Set(itemIds));
      }
    } catch (err: any) {
      toast.error(`Selection update failed: ${err.message}`);
    }
  };

  const handleItemSelection = (itemId: number, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    updateSelection(Array.from(newSelection));
  };

  const handleProviderSelection = (providerGroup: ProviderGroupDto, selected: boolean) => {
    const providerItemIds = providerGroup.items.map(item => item.checkoutSessionItemId);
    const newSelection = new Set(selectedItems);
    
    if (selected) {
      providerItemIds.forEach(id => newSelection.add(id));
    } else {
      providerItemIds.forEach(id => newSelection.delete(id));
    }
    
    updateSelection(Array.from(newSelection));
  };

  const handleSelectAll = () => {
    if (!session) return;
    const allItemIds = session.items.map(item => item.checkoutSessionItemId);
    updateSelection(allItemIds);
  };

  const handleDeselectAll = () => {
    updateSelection([]);
  };

  const handlePaySelected = async () => {
    if (!session || selectedItems.size === 0) {
      toast.error('No items selected for payment');
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await flexibleCheckoutService.payAllSelected(
        session.checkoutSessionId, 
        Array.from(selectedItems)
      );
      
      if (response.success) {
        toast.success('Payment successful!');
        if (onPaymentSuccess && response.data?.orderGroupId) {
          onPaymentSuccess(response.data.orderGroupId);
        } else {
          navigate('/orders');
        }
      } else {
        toast.error(response.message || 'Payment failed');
      }
    } catch (err: any) {
      toast.error(`Payment error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayByProvider = async (providerId: string) => {
    if (!session) return;

    try {
      setPaymentLoading(true);
      const response = await flexibleCheckoutService.payByProvider(
        session.checkoutSessionId, 
        providerId
      );
      
      if (response.success) {
        toast.success('Payment successful!');
        if (onPaymentSuccess && response.data?.orderGroupId) {
          onPaymentSuccess(response.data.orderGroupId);
        } else {
          navigate('/orders');
        }
      } else {
        toast.error(response.message || 'Payment failed');
      }
    } catch (err: any) {
      toast.error(`Payment error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getSelectedSubtotal = () => {
    if (!session) return 0;
    return session.items
      .filter(item => selectedItems.has(item.checkoutSessionItemId))
      .reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const isProviderFullySelected = (providerGroup: ProviderGroupDto) => {
    return providerGroup.items.every(item => selectedItems.has(item.checkoutSessionItemId));
  };

  const isProviderPartiallySelected = (providerGroup: ProviderGroupDto) => {
    return providerGroup.items.some(item => selectedItems.has(item.checkoutSessionItemId)) &&
           !isProviderFullySelected(providerGroup);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading checkout session...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/shop/cart')}>
          Back to Cart
        </Button>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No checkout session found</Typography>
        <Button variant="outlined" onClick={() => navigate('/shop/cart')}>
          Back to Cart
        </Button>
      </Box>
    );
  }

  const selectedSubtotal = getSelectedSubtotal();
  const walletSufficient = (walletBalance?.balance ?? 0) >= selectedSubtotal;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Flexible Checkout
      </Typography>

      {/* Summary and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {session.totalItems} items from {session.totalProviders} providers
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                startIcon={<SelectAll />}
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button 
                size="small" 
                startIcon={<DeselectOutlined />}
                onClick={handleDeselectAll}
              >
                Deselect All
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedItems.size} items • Total: {formatVND(selectedSubtotal)}
          </Typography>
          
          {!walletSufficient && selectedItems.size > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Insufficient wallet balance. Required: {formatVND(selectedSubtotal)}, 
              Available: {formatVND(walletBalance?.balance ?? 0)}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Provider Groups */}
      {session.providerGroups.map((providerGroup) => {
        const providerSelected = isProviderFullySelected(providerGroup);
        const providerPartial = isProviderPartiallySelected(providerGroup);
        const providerSubtotal = providerGroup.items
          .filter(item => selectedItems.has(item.checkoutSessionItemId))
          .reduce((sum, item) => sum + item.totalPrice, 0);

        return (
          <Card key={providerGroup.providerId} sx={{ mb: 2 }}>
            <CardContent>
              {/* Provider Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={providerSelected}
                    indeterminate={providerPartial}
                    onChange={(e) => handleProviderSelection(providerGroup, e.target.checked)}
                  />
                  <Avatar src={providerGroup.providerAvatarUrl} sx={{ width: 32, height: 32 }}>
                    {providerGroup.providerType === 'Supplier' ? <Store /> : <Person />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {providerGroup.providerName}
                    </Typography>
                    <Chip 
                      label={providerGroup.providerType === 'Supplier' ? 'Nhà cung cấp' : 'Nhà thiết kế'} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    {providerGroup.groupItemCount} items
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatVND(providerSubtotal)}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={providerSubtotal === 0 || paymentLoading || !walletSufficient}
                    onClick={() => handlePayByProvider(providerGroup.providerId!)}
                    sx={{ mt: 1 }}
                  >
                    Pay This Provider
                  </Button>
                </Box>
              </Box>

              {/* Provider Items */}
              <Box sx={{ pl: 5 }}>
                {providerGroup.items.map((item) => (
                  <Box key={item.checkoutSessionItemId} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Checkbox
                      checked={selectedItems.has(item.checkoutSessionItemId)}
                      onChange={(e) => handleItemSelection(item.checkoutSessionItemId, e.target.checked)}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.itemImageUrl ? (
                        <img 
                          src={item.itemImageUrl} 
                          alt={item.itemName}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: 'grey.200', 
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShoppingCart color="disabled" />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.itemName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.type} • Qty: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {formatVND(item.totalPrice)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* Payment Summary */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                Selected: {selectedItems.size} items
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wallet Balance: {formatVND(walletBalance?.balance ?? 0)}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                {formatVND(selectedSubtotal)}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={paymentLoading ? <Payment /> : <CheckCircle />}
                disabled={selectedItems.size === 0 || paymentLoading || !walletSufficient}
                onClick={handlePaySelected}
                sx={{ minWidth: 200 }}
              >
                {paymentLoading ? 'Processing...' : 'Pay Selected Items'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FlexibleCheckoutCart;