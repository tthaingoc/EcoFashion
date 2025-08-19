import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Payment,
  Refresh,
  SwapHoriz,
  Visibility,
  KeyboardArrowRight
} from '@mui/icons-material';
import { WalletTransaction, walletService } from '../../services/api/walletService';
import { formatViDateTime } from '../../utils/date';

interface Props {
  transactions: WalletTransaction[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const getTransactionIcon = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'Deposit':
      return <TrendingUp sx={{ color: '#16a34a' }} />;
    case 'Withdrawal':
      return <TrendingDown sx={{ color: '#dc2626' }} />;
    case 'Payment':
      return <Payment sx={{ color: '#2563eb' }} />;
    case 'Refund':
      return <Refresh sx={{ color: '#16a34a' }} />;
    case 'Transfer':
      return <SwapHoriz sx={{ color: '#f59e0b' }} />;
    default:
      return <Payment sx={{ color: '#6b7280' }} />;
  }
};

const getAmountColor = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'Deposit':
    case 'Refund':
      return '#16a34a'; // Green for money in
    case 'Withdrawal':
    case 'Payment':
      return '#dc2626'; // Red for money out
    case 'Transfer':
      return '#f59e0b'; // Yellow for transfers
    default:
      return '#6b7280';
  }
};

const formatAmount = (amount: number, type: WalletTransaction['type']) => {
  const formattedAmount = walletService.formatVND(amount);
  
  switch (type) {
    case 'Deposit':
    case 'Refund':
      return `+${formattedAmount}`;
    case 'Withdrawal':
    case 'Payment':
      return `-${formattedAmount}`;
    case 'Transfer':
      return formattedAmount;
    default:
      return formattedAmount;
  }
};

export default function WalletTransactionList({ transactions, showViewAll = false, onViewAll }: Props) {
  if (transactions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Payment sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
          Chưa có giao dịch nào
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Các giao dịch của bạn sẽ hiển thị ở đây
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List sx={{ p: 0 }}>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#f3f4f6', color: '#374151' }}>
                  {getTransactionIcon(transaction.type)}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {walletService.getTransactionTypeLabel(transaction.type)}
                      </Typography>
                      {transaction.description && (
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {transaction.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: getAmountColor(transaction.type),
                          mb: 0.5
                        }}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </Typography>
                      <Chip
                        label={walletService.getTransactionStatusLabel(transaction.status)}
                        size="small"
                        sx={{
                          bgcolor: `${walletService.getTransactionStatusColor(transaction.status)}20`,
                          color: walletService.getTransactionStatusColor(transaction.status),
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {formatViDateTime(transaction.createdAt)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Số dư: {walletService.formatVND(transaction.balanceAfter)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            
            {index < transactions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {showViewAll && (
        <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <Button
            variant="outlined"
            endIcon={<KeyboardArrowRight />}
            onClick={onViewAll}
            sx={{ color: '#16a34a', borderColor: '#16a34a' }}
          >
            Xem tất cả giao dịch
          </Button>
        </Box>
      )}
    </Box>
  );
}