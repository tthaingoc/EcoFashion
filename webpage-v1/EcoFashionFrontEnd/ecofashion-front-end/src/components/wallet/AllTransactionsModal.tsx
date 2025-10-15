import React, { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { WalletTransaction } from "../../services/api/walletService";
import walletService from "../../services/api/walletService";

// Helper component để hiển thị transaction status
const TransactionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    Success: {
      color: "bg-green-100 text-green-800",
      icon: "✅",
      label: "Thành công",
    },
    Pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
      label: "Đang xử lý",
    },
    Fail: { color: "bg-red-100 text-red-800", icon: "❌", label: "Thất bại" },
  } as const;

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Transaction Group Component
const TransactionGroup: React.FC<{
  group: {
    orderGroupId?: string;
    orderId?: number;
    transactions: WalletTransaction[];
    totalAmount: number;
    isMultiOrder: boolean;
    orderCount: number;
    orderIds: number[];
  };
  onOrderClick: (orderId: number) => void;
}> = ({ group, onOrderClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainTransaction = group.transactions[0];
  const displayInfo = walletService.getOrderTransactionDisplay(mainTransaction);

  if (group.isMultiOrder) {
    return (
      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
              <span className="text-lg">{displayInfo.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{displayInfo.title}</p>
              <p className="text-sm text-gray-500">
                {displayInfo.subtitle} • {group.orderCount} đơn hàng
              </p>
              <div className="mt-1">
                <TransactionStatusBadge status={mainTransaction.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`font-semibold ${
                group.totalAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {group.totalAmount >= 0 ? "+" : ""}
              {group.totalAmount.toLocaleString("vi-VN")} VND
            </p>
            <span className="text-blue-600">{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pl-13 space-y-2 border-t border-blue-200 pt-3">
            {displayInfo.detailedDescription && (
              <div className="p-3 bg-blue-50 rounded text-sm text-gray-700 border-l-4 border-blue-200">
                <strong className="text-blue-800">Chi tiết giao dịch:</strong>
                <p className="mt-1 text-gray-600">
                  {displayInfo.detailedDescription}
                </p>
              </div>
            )}

            {group.orderIds.map((orderId) => (
              <div
                key={orderId}
                className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-blue-50"
                onClick={() => onOrderClick(orderId)}
              >
                <span className="text-sm text-gray-600">
                  📦 Đơn hàng #ĐH{orderId}
                </span>
                <span className="text-sm text-blue-600">Xem chi tiết →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single order
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        displayInfo.isOrderRelated
          ? "hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200"
          : "hover:bg-gray-50"
      }`}
      onClick={() => {
        if (displayInfo.isOrderRelated && group.orderId) {
          onOrderClick(group.orderId);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            group.totalAmount >= 0 ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {group.totalAmount >= 0 ? (
            <ArrowUpIcon className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowDownIcon className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{displayInfo.title}</p>
          <p className="text-sm text-gray-500">{displayInfo.subtitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <TransactionStatusBadge status={mainTransaction.status} />
            {displayInfo.detailedDescription && (
              <p className="text-xs text-gray-400 truncate flex-1">
                {displayInfo.detailedDescription}
              </p>
            )}
          </div>
        </div>
      </div>
      <p
        className={`font-semibold ${
          group.totalAmount >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {group.totalAmount >= 0 ? "+" : ""}
        {group.totalAmount.toLocaleString("vi-VN")} VND
      </p>
    </div>
  );
};

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  onOrderClick: (orderId: number) => void;
}

const AllTransactionsModal: React.FC<AllTransactionsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onOrderClick,
}) => {
  if (!isOpen) return null;

  // Tách transactions thành order-related và non-order
  const orderTransactions = transactions.filter(
    (t: any) =>
      t.orderId ||
      t.orderGroupId ||
      (["Payment", "PaymentReceived", "Transfer"].includes(t.type) &&
        (t.description?.includes("ĐH") || t.description?.includes("đơn")))
  );

  const nonOrderTransactions = transactions.filter(
    (t: any) => !orderTransactions.includes(t)
  );

  // Group order transactions
  const groupedOrders = walletService.groupTransactionsByOrder(
    orderTransactions as WalletTransaction[]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Tất cả giao dịch
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Order-related transactions (grouped) */}
              {groupedOrders.map((group, index) => (
                <TransactionGroup
                  key={`group-${index}`}
                  group={group}
                  onOrderClick={onOrderClick}
                />
              ))}

              {/* Non-order transactions (individual) */}
              {nonOrderTransactions.map((transaction: any, index: number) => {
                const displayInfo =
                  walletService.getOrderTransactionDisplay(transaction);
                return (
                  <div
                    key={`non-order-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.amount >= 0 &&
                          transaction.type !== "Withdrawal"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {transaction.amount >= 0 &&
                        transaction.type !== "Withdrawal" ? (
                          <ArrowUpIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {displayInfo.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {displayInfo.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <TransactionStatusBadge status={transaction.status} />
                          {displayInfo.detailedDescription && (
                            <p className="text-xs text-gray-400 truncate flex-1">
                              {displayInfo.detailedDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.amount >= 0 &&
                        transaction.type !== "Withdrawal"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount >= 0 &&
                      transaction.type !== "Withdrawal"
                        ? "+"
                        : "-"}
                      {transaction.amount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
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

export default AllTransactionsModal;
