import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Remove,
  Refresh,
  TrendingUp,
  TrendingDown,
  History,
  AttachMoney,
  Close
} from '@mui/icons-material';
import { walletService, WalletSummary, DepositRequest } from '../../services/api/walletService';
import WalletTransactionList from './WalletTransactionList';

export default function WalletDashboard() {
  const [walletData, setWalletData] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Deposit modal states
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositErrors, setDepositErrors] = useState<string[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletService.getWalletSummary();
      setWalletData(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin ví');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const openDepositModal = () => {
    setDepositAmount('');
    setDepositDescription('Nạp tiền vào ví');
    setDepositErrors([]);
    setDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setDepositModalOpen(false);
    setDepositAmount('');
    setDepositDescription('');
    setDepositErrors([]);
  };

  const handleDepositAmountChange = (value: string) => {
    // Remove non-numeric characters except for decimal point
    const cleanValue = value.replace(/[^\d]/g, '');
    setDepositAmount(cleanValue);
    
    // Clear errors when user starts typing
    if (depositErrors.length > 0) {
      setDepositErrors([]);
    }
  };

  const formatInputAmount = (value: string) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('vi-VN');
  };

  const validateAndSubmitDeposit = async () => {
    const amount = parseInt(depositAmount.replace(/[^\d]/g, '')) || 0;
    const errors = walletService.validateDepositAmount(amount);
    
    if (errors.length > 0) {
      setDepositErrors(errors);
      return;
    }

    try {
      setDepositLoading(true);
      const request: DepositRequest = {
        amount,
        description: depositDescription || 'Nạp tiền vào ví'
      };

      const response = await walletService.initiateDeposit(request);
      // Backend returns { paymentUrl }
      const redirectUrl = (response as any).paymentUrl || (response as any).PaymentUrl;
      if (!redirectUrl) {
        throw new Error('Thiếu paymentUrl từ API nạp tiền');
      }
      window.location.href = redirectUrl;
    } catch (err: any) {
      setDepositErrors([err?.message || 'Có lỗi xảy ra khi nạp tiền']);
    } finally {
      setDepositLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} sx={{ color: '#16a34a' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={loadWalletData}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
        >
          Thử lại
        </Button>
      </Container>
    );
  }

  if (!walletData) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalanceWallet sx={{ fontSize: 40, color: '#16a34a' }} />
          Ví của tôi
        </Typography>
        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}
        >
          <Refresh sx={{ color: refreshing ? '#9ca3af' : '#16a34a' }} />
        </IconButton>
      </Box>

      {/* Wallet Balance Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Số dư hiện tại
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                {walletService.formatVND(walletData.wallet.balance)}
              </Typography>
              <Chip
                label={`Trạng thái: ${walletData.wallet.status}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 3, md: 0 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={openDepositModal}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    fontWeight: 'bold'
                  }}
                >
                  Nạp tiền
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Remove />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                  }}
                  disabled // We'll implement this later if needed
                >
                  Rút tiền
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: '#16a34a', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                {walletService.formatVND(walletData.monthlyStats.deposited)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Đã nạp trong tháng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingDown sx={{ fontSize: 48, color: '#dc2626', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                {walletService.formatVND(walletData.monthlyStats.spent)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Đã chi trong tháng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AttachMoney sx={{ fontSize: 48, color: '#2563eb', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                {walletService.formatVND(walletData.monthlyStats.net)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Thay đổi ròng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: '#16a34a' }} />
              Giao dịch gần đây
            </Typography>
          </Box>
          <WalletTransactionList 
            transactions={walletData.recentTransactions}
            showViewAll={walletData.totalTransactions > walletData.recentTransactions.length}
          />
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={depositModalOpen} onClose={closeDepositModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Nạp tiền vào ví
          </Typography>
          <IconButton onClick={closeDepositModal}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {depositErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {depositErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            Chọn số tiền cần nạp hoặc nhập số tiền tùy chỉnh
          </Typography>

          {/* Quick Amount Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Số tiền phổ biến:
            </Typography>
            <Grid container spacing={1}>
              {quickAmounts.map((amount) => (
                <Grid item xs={6} sm={4} key={amount}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDepositAmountChange(amount.toString())}
                    sx={{
                      color: '#16a34a',
                      borderColor: '#16a34a',
                      '&:hover': { bgcolor: '#f0f9ff', borderColor: '#15803d' }
                    }}
                  >
                    {walletService.formatVND(amount)}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Custom Amount Input */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Số tiền</InputLabel>
            <OutlinedInput
              label="Số tiền"
              value={formatInputAmount(depositAmount)}
              onChange={(e) => handleDepositAmountChange(e.target.value)}
              endAdornment={<InputAdornment position="end">VNĐ</InputAdornment>}
              placeholder="Nhập số tiền..."
            />
          </FormControl>

          <TextField
            fullWidth
            label="Mô tả (tùy chọn)"
            value={depositDescription}
            onChange={(e) => setDepositDescription(e.target.value)}
            placeholder="Nạp tiền vào ví"
            multiline
            rows={2}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch.
              Số tiền sẽ được cộng vào ví sau khi thanh toán thành công.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDepositModal} sx={{ color: '#6b7280' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={validateAndSubmitDeposit}
            disabled={!depositAmount || depositLoading}
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            {depositLoading ? <CircularProgress size={20} color="inherit" /> : 'Tiếp tục'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}