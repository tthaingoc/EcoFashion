import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useWalletSummary } from '../../hooks/useWalletQueries';
import { useInitiateDeposit, useRequestWithdraw } from '../../hooks/useWalletMutations';
import { WALLET_CFG } from '../../config/wallet';
import { toast } from 'react-toastify';

// Modal Components
const DepositModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, description?: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onDeposit, isLoading }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < WALLET_CFG.minDeposit || amount > WALLET_CFG.maxDeposit) {
      toast.error(`Số tiền nạp phải từ ${WALLET_CFG.minDeposit.toLocaleString()} đến ${WALLET_CFG.maxDeposit.toLocaleString()} VND`);
      return;
    }
    onDeposit(amount, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Nạp tiền vào ví</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (VND)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số tiền"
              min={WALLET_CFG.minDeposit}
              max={WALLET_CFG.maxDeposit}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu: {WALLET_CFG.minDeposit.toLocaleString()} VND - Tối đa: {WALLET_CFG.maxDeposit.toLocaleString()} VND
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền nhanh
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_CFG.quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ghi chú..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang xử lý...' : 'Nạp tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function để extract orderId từ description
const extractOrderIdFromDescription = (description: string): string | null => {
  if (!description) return null;
  
  console.log('Trying to extract from description:', description);
  
  // Pattern đặc biệt cho format DH + số
  // "Thanh toán đơn hàng #DH16" hoặc "Nhận thanh toán từ đơn hàng #DH16"
  const dhPattern = /#?DH(\d+)/i;
  const dhMatch = description.match(dhPattern);
  
  if (dhMatch) {
    console.log('DH pattern matched, orderId:', dhMatch[1]);
    return dhMatch[1]; // Trả về "16" từ "DH16"
  }
  
  // Fallback: tìm số cuối cùng trong chuỗi
  const numberPattern = /(\d+)(?!.*\d)/;
  const numberMatch = description.match(numberPattern);
  
  if (numberMatch) {
    console.log('Number pattern matched, orderId:', numberMatch[1]);
    return numberMatch[1];
  }
  
  console.log('No pattern matched');
  return null;
};

const WalletDashboardTailwind: React.FC = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  
  const { data: walletData, isLoading, error, refetch } = useWalletSummary();
  const { mutateAsync: deposit, isPending: isDepositLoading } = useInitiateDeposit();

  const handleDeposit = async (amount: number, description?: string) => {
    try {
      const result = await deposit({ amount, description });
      const paymentUrl = (result as any)?.paymentUrl || (result as any)?.PaymentUrl;
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error('Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setShowDepositModal(false);
    }
  };

  const handleTransactionClick = (orderId: string) => {
    try {
      console.log('Navigating to order ID:', orderId);
      
      // orderId đã là số thuần từ extractOrderIdFromDescription
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Không thể xem chi tiết đơn hàng');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-3">Không thể tải thông tin ví</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const balance = (walletData as any)?.balance ?? (walletData as any)?.wallet?.balance ?? 0;
  const monthlyRaw = (walletData as any)?.monthlyStats ?? {};
  const income = (monthlyRaw as any)?.totalIncome ?? (monthlyRaw as any)?.deposited ?? 0;
  const expense = (monthlyRaw as any)?.totalExpense ?? (monthlyRaw as any)?.spent ?? 0;
  const recentTransactions = (walletData as any)?.recentTransactions ?? [];


  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Ví của tôi</h1>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {showBalance ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-white/80 mb-2">Số dư hiện tại</p>
          <p className="text-4xl font-bold">
            {showBalance ? `${balance.toLocaleString('vi-VN')} VND` : '••••••••'}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nạp tiền
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg opacity-50 cursor-not-allowed"
          >
            <MinusIcon className="w-5 h-5" />
            Rút tiền (Sắp có)
          </button>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ArrowUpIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Thu nhập tháng này</p>
              <p className="text-xl font-bold text-green-700">
                +{(income as number).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ArrowDownIcon className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600 font-medium">Chi tiêu tháng này</p>
              <p className="text-xl font-bold text-red-700">
                {(expense as number).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Chênh lệch</p>
              <p className="text-xl font-bold text-blue-700">
                {((income as number) + (expense as number)).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Giao dịch gần đây</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction: any, index: number) => {
              // Extract orderId từ description hoặc trực tiếp từ transaction
              const orderId = transaction.orderId || transaction.orderNumber || extractOrderIdFromDescription(transaction.description);
              const isOrderTransaction = !!orderId;
              
              // Debug: Log toàn bộ transaction để xem cấu trúc
              if (transaction.description?.includes('đơn hàng') || transaction.description?.includes('order') || transaction.description?.includes('Thanh toán') || transaction.description?.includes('Nhận thanh toán')) {
                console.log('Full transaction object:', transaction);
                console.log('Available keys:', Object.keys(transaction));
                console.log('Transaction description:', transaction.description);
                console.log('Transaction orderId field:', transaction.orderId);
                console.log('Transaction orderNumber field:', transaction.orderNumber);
                console.log('Extracted orderId:', orderId);
                console.log('Is order transaction:', isOrderTransaction);
              }
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isOrderTransaction 
                      ? 'hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={isOrderTransaction ? { cursor: 'pointer' } : {}}
                  onClick={() => {
                    console.log('Clicked transaction, orderId:', orderId, 'isOrderTransaction:', isOrderTransaction);
                    if (isOrderTransaction) {
                      handleTransactionClick(orderId);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.amount >= 0 ? 
                        <ArrowUpIcon className="w-5 h-5 text-green-600" /> : 
                        <ArrowDownIcon className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                        {isOrderTransaction && <span className="ml-2 text-blue-600">• Click để xem chi tiết</span>}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        isLoading={isDepositLoading}
      />
    </div>
  );
};

export default WalletDashboardTailwind;