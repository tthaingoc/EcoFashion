import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Home
} from '@mui/icons-material';
import WalletDashboard from '../../components/wallet/WalletDashboard';
import { walletService } from '../../services/api/walletService';

export default function WalletPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'failed' | 'cancelled';
    message: string;
    transactionId?: number;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);

  useEffect(() => {
    // Check if this is a return from VNPay payment
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    if (vnp_ResponseCode && vnp_TxnRef) {
      handlePaymentReturn(vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef);
    }
  }, [searchParams]);

  const handlePaymentReturn = async (responseCode: string, transactionStatus: string | null, txnRef: string) => {
    setLoadingResult(true);
    
    try {
      // Parse transaction ID from txnRef if it's encoded there
      const transactionId = parseInt(txnRef.replace(/\D/g, ''));
      
      if (responseCode === '00' && transactionStatus === '00') {
        // Payment successful
        setPaymentResult({
          status: 'success',
          message: 'Nạp tiền thành công! Số dư đã được cập nhật vào ví của bạn.',
          transactionId
        });
      } else if (responseCode === '24') {
        // Payment cancelled by user
        setPaymentResult({
          status: 'cancelled',
          message: 'Giao dịch đã bị hủy bởi người dùng.',
          transactionId
        });
      } else {
        // Payment failed
        setPaymentResult({
          status: 'failed',
          message: 'Nạp tiền thất bại. Vui lòng thử lại sau.',
          transactionId
        });
      }
      
      setShowResultModal(true);
      
      // Clear URL parameters after processing
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
      
    } catch (error) {
      console.error('Error processing payment return:', error);
      setPaymentResult({
        status: 'failed',
        message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán.',
      });
      setShowResultModal(true);
    } finally {
      setLoadingResult(false);
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setPaymentResult(null);
  };

  const getResultIcon = () => {
    if (!paymentResult) return null;
    
    switch (paymentResult.status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 64, color: '#16a34a', mb: 2 }} />;
      case 'failed':
        return <Error sx={{ fontSize: 64, color: '#dc2626', mb: 2 }} />;
      case 'cancelled':
        return <Warning sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />;
      default:
        return null;
    }
  };

  const getResultSeverity = () => {
    if (!paymentResult) return 'info';
    
    switch (paymentResult.status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (loadingResult) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, minWidth: 300 }}>
          <CircularProgress size={60} sx={{ color: '#16a34a', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Đang xử lý kết quả thanh toán...
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Vui lòng đợi trong giây lát
          </Typography>
        </Card>
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
                Ví EcoFashion
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Quản lý số dư và giao dịch của bạn
              </Typography>
            </Box>
            
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

      {/* Main Content */}
      <WalletDashboard />

      {/* Payment Result Modal */}
      <Dialog open={showResultModal} onClose={closeResultModal} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {getResultIcon()}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {paymentResult?.status === 'success' ? 'Thành công!' : 
             paymentResult?.status === 'failed' ? 'Thất bại!' : 'Đã hủy!'}
          </Typography>
          
          <Alert severity={getResultSeverity()} sx={{ mb: 3 }}>
            {paymentResult?.message}
          </Alert>
          
          {paymentResult?.transactionId && (
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Mã giao dịch: #{paymentResult.transactionId}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={closeResultModal}
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, px: 4 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}