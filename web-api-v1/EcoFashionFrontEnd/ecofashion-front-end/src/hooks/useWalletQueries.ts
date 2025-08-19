import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { walletService } from '../services/api/walletService';
import { QUERY_KEYS } from '../config/wallet';

export const useWalletSummary = () => {
  return useQuery({
    queryKey: QUERY_KEYS.walletSummary,
    queryFn: walletService.getWalletSummary,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

export const useWalletTransactions = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.walletTransactions(page, pageSize),
    queryFn: () => walletService.getTransactions(page, pageSize),
    keepPreviousData: true,
  });
};

export const useWalletTransactionsInfinite = (pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.walletTransactionsInfinite(pageSize),
    queryFn: ({ pageParam = 1 }) => walletService.getTransactions(pageParam, pageSize),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage?.totalPages || !lastPage?.currentPage) return undefined;
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useWalletBalance = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.walletSummary, 'balance'],
    queryFn: async () => {
      const summary = await walletService.getWalletSummary();
      return summary?.balance || 0;
    },
    staleTime: 10_000, // 10 seconds
  });
};