import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';
import WalletDashboardTailwind from '../../components/wallet/WalletDashboardTailwind';
import { useRefreshWallet } from '../../hooks/useWalletMutations';

// Result Modal Component
const PaymentResultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  result: {
    status: 'success' | 'failed' | 'cancelled';
    message: string;
    transactionId?: number;
  };
}> = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (result.status) {
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-16 h-16 text-red-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500" />;
      default:
        return <XCircleIcon className="w-16 h-16 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (result.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'cancelled':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitle = () => {
    switch (result.status) {
      case 'success':
        return 'Nạp tiền thành công!';
      case 'failed':
        return 'Nạp tiền thất bại';
      case 'cancelled':
        return 'Giao dịch đã hủy';
      default:
        return 'Kết quả giao dịch';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className={`text-center p-6 rounded-lg border ${getBgColor()}`}>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {getTitle()}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {result.message}
          </p>

          {result.transactionId && (
            <p className="text-sm text-gray-500 mb-4">
              Mã giao dịch: #{result.transactionId}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const WalletPageTailwind: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'failed' | 'cancelled';
    message: string;
    transactionId?: number;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  
  const refreshWallet = useRefreshWallet();

  useEffect(() => {
    // Kiểm tra nếu đây là redirect từ VNPay callback (format mới từ backend)
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const transactionId = searchParams.get('transactionId');
    const amount = searchParams.get('amount');

    // Xử lý format redirect mới từ backend
    if (success === 'deposit') {
      const result = {
        status: 'success' as const,
        message: `Nạp tiền thành công! Số tiền ${amount ? new Intl.NumberFormat('vi-VN').format(parseInt(amount)) + ' VND' : ''} đã được cộng vào ví của bạn.`,
        transactionId: transactionId ? parseInt(transactionId) : undefined,
      };
      
      setPaymentResult(result);
      setShowResultModal(true);
      refreshWallet();
      
      // Xóa query params sau khi hiển thị (delay để đảm bảo modal hiển thị)
      setTimeout(() => {
        navigate('/wallet', { replace: true });
      }, 100);
      
    } else if (success === 'withdrawal') {
      setPaymentResult({
        status: 'success', 
        message: `Rút tiền thành công! Số tiền ${amount ? new Intl.NumberFormat('vi-VN').format(parseInt(amount)) + ' VND' : ''} đã được chuyển về tài khoản ngân hàng.`,
        transactionId: transactionId ? parseInt(transactionId) : undefined,
      });
      setShowResultModal(true);
      refreshWallet();
      
      // Xóa query params sau khi hiển thị
      navigate('/wallet', { replace: true });
      
    } else if (error === 'deposit_failed' || error === 'withdrawal_failed') {
      const errorCode = searchParams.get('code');
      setPaymentResult({
        status: 'failed',
        message: error === 'deposit_failed' 
          ? `Nạp tiền thất bại${errorCode ? ` (Mã lỗi: ${errorCode})` : ''}. Vui lòng thử lại.`
          : `Rút tiền thất bại${errorCode ? ` (Mã lỗi: ${errorCode})` : ''}. Vui lòng thử lại.`,
      });
      setShowResultModal(true);
      
      // Xóa query params sau khi hiển thị
      navigate('/wallet', { replace: true });
    }

    // Kiểm tra format cũ từ VNPay callback (giữ để tương thích)
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    if (vnp_ResponseCode && vnp_TxnRef) {
      handlePaymentReturn(vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef);
    }
  }, [searchParams]);

  const handlePaymentReturn = async (
    responseCode: string, 
    transactionStatus: string | null, 
    txnRef: string
  ) => {
    setLoadingResult(true);
    
    try {
      let result: {
        status: 'success' | 'failed' | 'cancelled';
        message: string;
        transactionId?: number;
      } = {
        status: 'failed',
        message: 'Giao dịch thất bại',
        transactionId: undefined,
      };

      if (responseCode === '00') {
        result = {
          status: 'success',
          message: 'Nạp tiền thành công! Số dư ví của bạn đã được cập nhật.',
          transactionId: parseInt(txnRef.split('-')[0]) || undefined,
        };
        
        // Refresh wallet data after successful payment
        refreshWallet();
      } else if (responseCode === '24') {
        result = {
          status: 'cancelled',
          message: 'Bạn đã hủy giao dịch.',
        };
      } else {
        const errorMessages: Record<string, string> = {
          '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
          '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
          '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
          '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
          '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
          '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
          '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
        };
        
        result.message = errorMessages[responseCode] || 'Giao dịch thất bại. Vui lòng thử lại sau.';
      }

      setPaymentResult(result);
      setShowResultModal(true);
      
      // Clear URL parameters
      navigate('/wallet', { replace: true });
      
    } catch (error) {
      console.error('Error handling payment return:', error);
      setPaymentResult({
        status: 'failed',
        message: 'Có lỗi xảy ra khi xử lý kết quả giao dịch.',
      });
      setShowResultModal(true);
    } finally {
      setLoadingResult(false);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setPaymentResult(null);
  };

  if (loadingResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Đang xử lý kết quả...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Trang chủ
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Ví của tôi</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        <WalletDashboardTailwind />
      </main>

      {/* Payment Result Modal */}
      {paymentResult && (
        <PaymentResultModal
          isOpen={showResultModal}
          onClose={handleCloseResultModal}
          result={paymentResult}
        />
      )}
    </div>
  );
};

export default WalletPageTailwind;