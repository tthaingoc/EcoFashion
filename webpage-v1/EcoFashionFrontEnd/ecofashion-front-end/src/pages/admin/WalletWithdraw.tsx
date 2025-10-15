import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import materialService from "../../services/api/materialService";
import notificationService, {
  type NotificationItem,
} from "../../services/api/notificationService";
import { useAuthStore } from "../../store/authStore";
import type { MaterialDetailResponse } from "../../schemas/materialSchema";
import MaterialDetailModal from "../../components/admin/MaterialDetailModal";
import walletService, {
  WalletWithdrawRequest,
} from "../../services/api/walletService";
import { toast } from "react-toastify";
import { useRespondWithdraw } from "../../hooks/useWalletMutations";

const WalletWithdraw: React.FC = () => {
  //Loading
  const [loading, setLoading] = useState(true);
  //PageLoading
  const [pageLoading, setPageLoading] = useState(true);
  //Error
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore((s) => s.user?.userId);
  //Design Data
  const [walletWithdrawRequest, setWalletWithdrawRequest] = useState<
    WalletWithdrawRequest[]
  >([]);
  useEffect(() => {
    loadWalletWithdrawRequest();
  }, []);
  const loadWalletWithdrawRequest = async () => {
    try {
      setLoading(true);
      setPageLoading(true);
      setError(null);

      //Get Order
      const fetchedOrders = await walletService.getWalletWithdrawRequest();
      setWalletWithdrawRequest(fetchedOrders || []);
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể tải danh sách nhà thiết kế";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // Optional: focus a specific material card via query param focusId
  const focusId = new URLSearchParams(window.location.search).get("focusId");

  function formatDate(
    dateString: string,
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (!dateString) return "";

    // Trường hợp DB không có offset => parse "thô"
    const raw = new Date(dateString);

    // Coi chuỗi đó là UTC => ép thêm "Z"
    const utcDate = new Date(dateString + "Z");

    // Tính giờ Việt Nam của utcDate
    const vietnamFromUTC = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    // Nếu raw == vietnamFromUTC => nghĩa là DB lưu giờ VN -> giữ nguyên
    if (raw.getTime() === vietnamFromUTC.getTime()) {
      return raw.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        ...options,
      });
    }

    // Ngược lại, coi nó là UTC rồi convert sang VN
    return vietnamFromUTC.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      ...options,
    });
  }
  const { mutateAsync: respondWithdrawal, isPending: isWithdrawalLoading } =
    useRespondWithdraw();

  const handleWalletWithdrawRequest = async (transactionId: number) => {
    try {
      setLoading(true);
      const accept = await respondWithdrawal(transactionId);
      const paymentUrl =
        (accept as any)?.paymentUrl || (accept as any)?.PaymentUrl;
      if (accept) {
        localStorage.setItem("walletRedirect", window.location.href);
        window.location.href = paymentUrl;
        toast.success("Duyệt đơn thành công!");
      } else {
        toast.error("Duyệt đơn thất bại!");
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi gửi đơn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Đơn Rút Tiền - Chờ Phê Duyệt</h1>
              <p className="dashboard-subtitle">Duyệt đơn rút tiền gửi lên</p>
            </div>

            <div className="dashboard-card">
              <div className="card-body">
                {pageLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Đang tải dữ liệu...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn rút nào
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {walletWithdrawRequest.map((t) => (
                      <div
                        key={t.transactionId}
                        className={`p-5 border rounded-2xl bg-white shadow-md transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          String(t.transactionId) === focusId
                            ? "ring-2 ring-blue-500"
                            : ""
                        } min-h-[220px] flex flex-col justify-between`}
                      >
                        {/* Header: Icon + Name + Type */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {t.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {t.type.toLowerCase() === "withdrawal"
                                  ? "Rút Tiền"
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {/* Status Badge */}
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r shadow-sm ${
                                t.status === "Approved"
                                  ? "from-green-400 to-green-600 text-white"
                                  : t.status === "Pending"
                                  ? "from-yellow-400 to-yellow-600 text-white"
                                  : "from-red-400 to-red-600 text-white"
                              }`}
                            >
                              {(t.status === "Pending" && "Chờ Xử Lí") || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-4 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Số tiền:</span>{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(t.amount)}
                          </p>
                          <p>
                            <span className="font-medium">Mô tả:</span>{" "}
                            {t.description || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Thời gian:</span>{" "}
                            {new Date(t.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end mt-4">
                          <button
                            className={`flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
                              loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                            onClick={() =>
                              handleWalletWithdrawRequest(t.transactionId)
                            }
                            disabled={loading}
                          >
                            {loading ? (
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                ></path>
                              </svg>
                            ) : (
                              "Duyệt"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletWithdraw;
