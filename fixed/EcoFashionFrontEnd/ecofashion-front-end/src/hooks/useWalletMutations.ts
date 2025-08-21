import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/api/walletService';
import { QUERY_KEYS } from '../config/wallet';
import { toast } from 'react-toastify';

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export const useInitiateDeposit = () => {
  return useMutation({
    mutationFn: (payload: DepositRequest) => walletService.initiateDeposit(payload),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo yêu cầu nạp tiền');
    },
  });
};

export const useRequestWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: WithdrawRequest) => walletService.requestWithdraw(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
      toast.success('Yêu cầu rút tiền đã được gửi thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo yêu cầu rút tiền');
    },
  });
};

export const useRefreshWallet = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet });
  };
};