export const WALLET_CFG = {
  minDeposit: 10_000,
  maxDeposit: 50_000_000,
  minWithdraw: 50_000,
  maxWithdraw: 10_000_000,
  quickAmounts: [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000],
  commissionRate: 0.1, // 10%
};

export const QUERY_KEYS = {
  wallet: ["wallet"],
  walletSummary: ["wallet", "summary"],
  walletTransactions: (page: number, pageSize: number) => [
    "wallet",
    "transactions",
    page,
    pageSize,
  ],
  walletTransactionsInfinite: (pageSize: number) => [
    "wallet",
    "transactions",
    "infinite",
    pageSize,
  ],
  orders: ["orders"],
  settlements: ["settlements"],
  checkout: ["checkout"],
} as const;

export const SETTLEMENT_STATUS = {
  PENDING: "Pending",
  RELEASED: "Released",
  CANCELLED: "Cancelled",
} as const;

export const TRANSACTION_TYPES = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  PAYMENT: "Payment",
  REFUND: "Refund",
  TRANSFER: "Transfer",
} as const;
