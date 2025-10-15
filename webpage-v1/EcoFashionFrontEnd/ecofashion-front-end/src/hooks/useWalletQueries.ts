import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  walletService,
  WalletWithdrawRequest,
} from "../services/api/walletService";
import { QUERY_KEYS } from "../config/wallet";

// Hook lấy tổng quan thông tin ví điện tử
export const useWalletSummary = () => {
  return useQuery({
    queryKey: QUERY_KEYS.walletSummary,
    queryFn: walletService.getWalletSummary,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

// Hook lấy danh sách giao dịch ví theo trang
export const useWalletTransactions = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.walletTransactions(page, pageSize),
    queryFn: () => walletService.getTransactions(page, pageSize),
    placeholderData: (prev) => prev, // React Query v5 replacement for keepPreviousData
  });
};

// Hook lấy danh sách giao dịch ví với infinite scroll
export const useWalletTransactionsInfinite = (pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.walletTransactionsInfinite(pageSize),
    queryFn: ({ pageParam = 1 }) =>
      walletService.getTransactions(pageParam, pageSize),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage?.totalPages || !lastPage?.currentPage) return undefined;
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Hook lấy số dư ví điện tử - sử dụng trong Flexible Checkout
export const useWalletBalance = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.walletSummary, "balance"],
    queryFn: async () => {
      const summary: any = await walletService.getWalletSummary();
      return summary?.balance ?? summary?.wallet?.balance ?? 0;
    },
    staleTime: 10_000, // 10 seconds
  });
};
