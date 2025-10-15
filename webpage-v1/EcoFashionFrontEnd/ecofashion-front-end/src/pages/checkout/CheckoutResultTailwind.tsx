import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCheckoutWizard } from "../../store/checkoutWizardStore";
import { ordersService } from "../../services/api/ordersService";

const CheckoutResultTailwind: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wizard = useCheckoutWizard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "failed" | "pending" | null>(
    null
  );

  useEffect(() => {
    const confirm = async () => {
      const orderGroupIdFromQuery = searchParams.get("orderGroupId");
      const orderIdFromQuery = Number(searchParams.get("orderId"));

      try {
        setLoading(true);

        if (orderGroupIdFromQuery) {
          // Thanh toán nhóm đơn hàng - hiển thị kết quả thành công
          console.log(
            "Group payment result for orderGroupId:",
            orderGroupIdFromQuery
          );
          setStatus("success");

          // Nếu có wizard orders, mark tất cả là Paid
          if (wizard.orders.length > 0) {
            wizard.orders.forEach((order) => {
              wizard.markStatus(order.orderId, "Paid");
            });
          }
        } else if (orderIdFromQuery && !Number.isNaN(orderIdFromQuery)) {
          // Thanh toán đơn lẻ - kiểm tra trạng thái
          wizard.goToOrder(orderIdFromQuery);
          const current = wizard.orders[wizard.currentIndex];
          if (!current) {
            navigate("/orders");
            return;
          }

          const resp = await ordersService.getById(current.orderId);
          const s =
            (resp as any)?.result?.paymentStatus ||
            (resp as any)?.paymentStatus ||
            (resp as any)?.status;
          const normalized = String(s || "").toLowerCase();
          if (normalized === "paid" || normalized === "processing") {
            wizard.markStatus(current.orderId, "Paid");
            setStatus("success");
          } else if (normalized === "failed") {
            wizard.markStatus(current.orderId, "Failed");
            setStatus("failed");
          } else {
            wizard.markStatus(current.orderId, "Pending");
            setStatus("pending");
          }
        } else {
          // Không có orderGroupId hoặc orderId
          navigate("/orders");
          return;
        }
      } catch (e: any) {
        setError(e?.message || "Không xác nhận được trạng thái đơn");
      } finally {
        setLoading(false);
      }
    };
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderGroupIdFromQuery = searchParams.get("orderGroupId");
  const current = wizard.orders[wizard.currentIndex];
  const completed = wizard.orders.filter(
    (o) => wizard.statusByOrderId[o.orderId] === "Paid"
  ).length;
  const hasNext = wizard.currentIndex < wizard.orders.length - 1;

  const renderIcon = () => {
    if (loading)
      return (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
        </div>
      );
    if (error) return <span className="text-red-600 text-5xl">!</span>;
    if (status === "success")
      return <span className="text-green-600 text-5xl">✓</span>;
    if (status === "failed")
      return <span className="text-red-600 text-5xl">✕</span>;
    return <span className="text-yellow-500 text-5xl">…</span>;
  };

  const title = loading
    ? "Đang xác nhận thanh toán..."
    : error
    ? "Có lỗi xảy ra"
    : status === "success"
    ? "Thanh toán thành công!"
    : status === "failed"
    ? "Thanh toán thất bại"
    : "Đang xử lý thanh toán";

  const message = loading
    ? "Vui lòng đợi trong giây lát"
    : error ||
      (orderGroupIdFromQuery
        ? `Nhóm đơn hàng: ${orderGroupIdFromQuery.substring(0, 8)}...`
        : current
        ? `Đơn hàng #${current.orderId}`
        : "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow p-8 text-center border border-gray-100">
          <div className="mb-4 flex justify-center">{renderIcon()}</div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {!loading && (orderGroupIdFromQuery || current) && (
            <div
              className={`rounded-lg p-4 mb-6 ${
                status === "success"
                  ? "bg-green-50 border border-green-200"
                  : status === "failed"
                  ? "bg-red-50 border border-red-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              {orderGroupIdFromQuery ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Mã nhóm đơn hàng:</span>{" "}
                    {orderGroupIdFromQuery}
                  </p>
                  {wizard.orders.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Số đơn hàng:</span>{" "}
                      {wizard.orders.length} đơn từ {wizard.orders.length} người
                      bán khác nhau
                    </p>
                  )}
                </div>
              ) : (
                current && (
                  <p className="text-sm">
                    <span className="font-medium">Mã đơn hàng:</span> #
                    {current.orderId}
                  </p>
                )
              )}
            </div>
          )}

          {!loading && status && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/orders")}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Xem đơn hàng của tôi
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}

          {!loading && (
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                Đã hoàn thành {completed}/{wizard.orders.length} đơn hàng
              </div>
              <div className="font-medium text-blue-600">
                {hasNext
                  ? "Đang chuyển đến đơn hàng tiếp theo..."
                  : "Đang chuyển đến trang đơn hàng..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutResultTailwind;
