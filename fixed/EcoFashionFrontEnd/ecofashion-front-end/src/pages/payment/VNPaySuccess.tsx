import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatVND } from '../../utils/formatVND';

interface VNPayResponse {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

const VNPaySuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<VNPayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract VNPay response data from URL parameters
    const data: VNPayResponse = {
      vnp_Amount: searchParams.get('vnp_Amount') || '',
      vnp_BankCode: searchParams.get('vnp_BankCode') || '',
      vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || '',
      vnp_CardType: searchParams.get('vnp_CardType') || '',
      vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
      vnp_PayDate: searchParams.get('vnp_PayDate') || '',
      vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || '',
      vnp_TmnCode: searchParams.get('vnp_TmnCode') || '',
      vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
      vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || '',
      vnp_TxnRef: searchParams.get('vnp_TxnRef') || '',
      vnp_SecureHash: searchParams.get('vnp_SecureHash') || '',
    };

    if (data.vnp_ResponseCode === '00' && data.vnp_TransactionStatus === '00') {
      setPaymentData(data);
    } else {
      setError('Payment failed or was cancelled');
    }
    
    setLoading(false);
  }, [searchParams]);

  const formatAmount = (amount: string) => {
    // VNPay amount is in VND * 100, so divide by 100
    const amountInVND = parseInt(amount) / 100;
    return formatVND(amountInVND);
  };

  const formatDate = (dateString: string) => {
    // VNPay date format: yyyyMMddHHmmss
    if (dateString.length === 14) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10);
      const minute = dateString.substring(10, 12);
      const second = dateString.substring(12, 14);
      
      return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    }
    return dateString;
  };

  const handleBackToWallet = () => {
    navigate('/wallet');
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          flexDirection="column"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang xử lý kết quả thanh toán...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Thanh toán không thành công
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Giao dịch đã bị hủy hoặc không thành công.
              </Typography>
              <Button
                variant="contained"
                onClick={handleBackToWallet}
                startIcon={<AccountBalanceWalletIcon />}
                size="large"
              >
                Quay lại ví
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Nạp tiền vào ví thành công!
        </Alert>
        
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                  mb: 2 
                }} 
              />
              <Typography variant="h4" gutterBottom>
                Thanh toán thành công!
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Số tiền đã được nạp vào ví của bạn
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Chi tiết giao dịch
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Số tiền:</Typography>
                <Typography fontWeight="bold" color="success.main">
                  {paymentData ? formatAmount(paymentData.vnp_Amount) : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Mã giao dịch:</Typography>
                <Typography fontWeight="bold">
                  {paymentData?.vnp_TransactionNo || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Ngân hàng:</Typography>
                <Typography fontWeight="bold">
                  {paymentData?.vnp_BankCode || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Thời gian:</Typography>
                <Typography fontWeight="bold">
                  {paymentData ? formatDate(paymentData.vnp_PayDate) : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Mã tham chiếu:</Typography>
                <Typography fontWeight="bold">
                  {paymentData?.vnp_TxnRef || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleBackToWallet}
                startIcon={<AccountBalanceWalletIcon />}
                size="large"
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Quay lại ví
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VNPaySuccess;