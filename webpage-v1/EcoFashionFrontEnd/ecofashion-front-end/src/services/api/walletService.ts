import apiClient from './baseApi';

export interface Wallet {
  walletId: number;
  userId: number;
  balance: number;
  status: 'Active' | 'Locked' | 'Inactive';
  createdAt: string;
  lastUpdatedAt?: string;
}

export interface WalletTransaction {
  id: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  type: 'Deposit' | 'Withdrawal' | 'Payment' | 'PaymentReceived' | 'Refund' | 'Transfer';
  status: 'Pending' | 'Success' | 'Fail';
  orderId?: number;
  orderGroupId?: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export interface WalletSummary {
  wallet: Wallet;
  recentTransactions: WalletTransaction[];
  totalTransactions: number;
  monthlyStats: {
    deposited: number;
    spent: number;
    net: number;
  };
}

export const walletService = {
  // Get user's wallet information
  getWallet: async (): Promise<Wallet> => {
    const { data } = await apiClient.get('/wallet');
    return data?.result || data;
  },

  // Get wallet with transactions summary
  getWalletSummary: async (): Promise<WalletSummary> => {
    const { data } = await apiClient.get('/wallet/summary');
    return data?.result || data;
  },

  // Get wallet balance
  getBalance: async (): Promise<number> => {
    const { data } = await apiClient.get('/wallet/balance');
    return data?.balance || 0;
  },

  // Get wallet transactions with pagination
  getTransactions: async (page: number = 1, pageSize: number = 20): Promise<{
    transactions: WalletTransaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> => {
    const { data } = await apiClient.get(`/wallet/transactions?page=${page}&pageSize=${pageSize}`);
    return data?.result || data;
  },

  // Initiate deposit via VNPay
  initiateDeposit: async (request: DepositRequest): Promise<{ paymentUrl: string }> => {
    const { data } = await apiClient.post('/wallet/deposit', request);
    return data?.result || data; // backend returns { paymentUrl }
  },

  // Check deposit status
  checkDepositStatus: async (transactionId: number): Promise<WalletTransaction> => {
    const { data } = await apiClient.get(`/wallet/transaction/${transactionId}`);
    return data?.result || data;
  },

  // Request withdrawal
  requestWithdraw: async (request: WithdrawRequest): Promise<WalletTransaction> => {
    const { data } = await apiClient.post('/wallet/withdrawal/request', request);
    return data?.result || data;
  },

  // Transfer money to another user (if needed in the future)
  transfer: async (recipientUserId: number, amount: number, description?: string): Promise<WalletTransaction> => {
    const { data } = await apiClient.post('/wallet/transfer', {
      recipientUserId,
      amount,
      description
    });
    return data?.result || data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId: number): Promise<WalletTransaction> => {
    const { data } = await apiClient.get(`/wallet/transaction/${transactionId}`);
    return data?.result || data;
  },

  // Helper functions
  formatVND: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  getTransactionTypeLabel: (type: WalletTransaction['type']): string => {
    switch (type) {
      case 'Deposit': return 'Nạp tiền';
      case 'Withdrawal': return 'Rút tiền';
      case 'Payment': return 'Thanh toán đơn hàng';
      case 'PaymentReceived': return 'Nhận tiền từ đơn hàng';
      case 'Refund': return 'Hoàn tiền';
      case 'Transfer': return 'Chuyển tiền';
      default: return type;
    }
  },

  getTransactionStatusLabel: (status: WalletTransaction['status']): string => {
    switch (status) {
      case 'Pending': return 'Đang xử lý';
      case 'Success': return 'Thành công';
      case 'Fail': return 'Thất bại';
      default: return status;
    }
  },

  getTransactionStatusColor: (status: WalletTransaction['status']): string => {
    switch (status) {
      case 'Success': return '#16a34a';
      case 'Fail': return '#dc2626';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  },

  validateDepositAmount: (amount: number): string[] => {
    const errors: string[] = [];
    
    if (amount <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }
    
    if (amount < 10000) {
      errors.push('Số tiền nạp tối thiểu là 10,000 VNĐ');
    }
    
    if (amount > 50000000) {
      errors.push('Số tiền nạp tối đa là 50,000,000 VNĐ');
    }
    
    return errors;
  },

  validateWithdrawAmount: (amount: number, currentBalance: number): string[] => {
    const errors: string[] = [];
    
    if (amount <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }
    
    if (amount > currentBalance) {
      errors.push('Số dư không đủ');
    }
    
    if (amount < 50000) {
      errors.push('Số tiền rút tối thiểu là 50,000 VNĐ');
    }
    
    return errors;
  },

  // Transaction grouping helpers
  groupTransactionsByOrder: (transactions: WalletTransaction[]) => {
    const grouped = new Map<string, {
      orderGroupId?: string;
      orderId?: number;
      transactions: WalletTransaction[];
      totalAmount: number;
      isMultiOrder: boolean;
      orderCount: number;
      orderIds: number[];
    }>();

    transactions.forEach(transaction => {
      const key = transaction.orderGroupId || `order_${transaction.orderId}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          orderGroupId: transaction.orderGroupId,
          orderId: transaction.orderId,
          transactions: [],
          totalAmount: 0,
          isMultiOrder: !!transaction.orderGroupId,
          orderCount: 0,
          orderIds: []
        });
      }

      const group = grouped.get(key)!;
      group.transactions.push(transaction);
      group.totalAmount += transaction.amount;
      
      if (transaction.orderId && !group.orderIds.includes(transaction.orderId)) {
        group.orderIds.push(transaction.orderId);
        group.orderCount = group.orderIds.length;
      }
    });

    return Array.from(grouped.values());
  },

  getOrderTransactionDisplay: (transaction: WalletTransaction): {
    title: string;
    subtitle: string;
    icon: string;
    isOrderRelated: boolean;
  } => {
    const isOrderRelated = !!(transaction.orderId || transaction.orderGroupId);
    
    if (!isOrderRelated) {
      return {
        title: walletService.getTransactionTypeLabel(transaction.type),
        subtitle: new Date(transaction.createdAt).toLocaleDateString('vi-VN'),
        icon: transaction.amount >= 0 ? '📈' : '📉',
        isOrderRelated: false
      };
    }

    if (transaction.orderGroupId) {
      // Multi-order transaction
      const orderCount = transaction.description?.match(/(\d+)\s*đơn/)?.[1] || '?';
      return {
        title: `🛍️ Nhóm đơn hàng (${orderCount} đơn)`,
        subtitle: `${new Date(transaction.createdAt).toLocaleDateString('vi-VN')} • Click xem chi tiết`,
        icon: '🛍️',
        isOrderRelated: true
      };
    } else {
      // Single order transaction
      return {
        title: `📦 Đơn hàng #ĐH${transaction.orderId}`,
        subtitle: `${new Date(transaction.createdAt).toLocaleDateString('vi-VN')} • Click xem chi tiết`,
        icon: '📦',
        isOrderRelated: true
      };
    }
  }
};

export default walletService;