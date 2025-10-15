import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ordersService } from "../../services/api/ordersService";
import {
  shipmentService,
  ShipmentTrackingResponse,
} from "../../services/api/shipmentService";
import { reviewService } from "../../services/api/reviewService";
import { formatViDateTime } from "../../utils/date";
//import { paymentsService } from '../../services/api/paymentsService';
import {
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Rating,
} from "@mui/material";
import {
  LocalShipping,
  Visibility,
  AccessTime,
  CheckCircle,
  Store,
  Person,
  Phone,
  LocationOn,
  RateReview,
} from "@mui/icons-material";
import { useAuthStore } from "../../store/authStore";

export default function OrdersDetails() {
  const navigate = useNavigate();
  const { user, supplierProfile, designerProfile, loadUserProfile } =
    useAuthStore(); // Get current user info and profiles
  const { orderId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [reloadTick, setReloadTick] = useState(0);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [trackingInfo, setTrackingInfo] =
    useState<ShipmentTrackingResponse | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Review dialog states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSellerOrder, setIsSellerOrder] = useState(false); // Track if this order belongs to seller

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!orderId) return;
        // Supplier: check if this order belongs to seller; else load as buyer
        if (user?.role === "supplier") {
          let currentSupplierProfile = supplierProfile;
          if (!currentSupplierProfile) {
            await loadUserProfile();
            const { supplierProfile: updatedSupplierProfile } =
              useAuthStore.getState();
            currentSupplierProfile = updatedSupplierProfile;
          }
          const supplierId = currentSupplierProfile?.supplierId;
          if (!supplierId) throw new Error("Supplier ID not found.");

          const supplierOrders = await ordersService.getOrdersBySeller(
            supplierId
          );
          const isSupplierSellerOrder = supplierOrders.some(
            (o) => o.orderId === Number(orderId)
          );
          setIsSellerOrder(isSupplierSellerOrder); // Track seller status
          if (isSupplierSellerOrder) {
            const specificOrder = supplierOrders.find(
              (o) => o.orderId === Number(orderId)
            );
            setData(specificOrder);
            const lines = await ordersService.getOrderDetailsBySupplier(
              Number(orderId),
              supplierId
            );
            setDetails(lines);
            return;
          } else {
            const res = await ordersService.getById(Number(orderId));
            const orderData = (res as any)?.result || res;
            setData(orderData);
            const lines = await ordersService.getDetailsByOrderId(
              Number(orderId)
            );
            setDetails(lines);
            return;
          }
        }

        // Designer: check if this order belongs to designer as seller; else load as buyer
        if (user?.role === "designer") {
          let currentDesignerProfile = designerProfile;
          if (!currentDesignerProfile) {
            await loadUserProfile();
            const { designerProfile: updatedDesignerProfile } =
              useAuthStore.getState();
            currentDesignerProfile = updatedDesignerProfile;
          }
          const designerId = currentDesignerProfile?.designerId;
          if (!designerId) throw new Error("Designer ID not found.");

          const designerOrders = await ordersService.getOrdersByDesigner(
            designerId
          );
          const isDesignerSellerOrder = designerOrders.some(
            (o) => o.orderId === Number(orderId)
          );
          setIsSellerOrder(isDesignerSellerOrder); // Track seller status
          if (isDesignerSellerOrder) {
            const specificOrder = designerOrders.find(
              (o) => o.orderId === Number(orderId)
            );
            setData(specificOrder);
            const lines = await ordersService.getOrderDetailsByDesigner(
              Number(orderId),
              designerId
            );
            setDetails(lines);
            return;
          } else {
            const res = await ordersService.getById(Number(orderId));
            const orderData = (res as any)?.result || res;
            setData(orderData);
            const lines = await ordersService.getDetailsByOrderId(
              Number(orderId)
            );
            setDetails(lines);
            return;
          }
        }

        // Default (customer/admin): load as owner
        {
          setIsSellerOrder(false); // Not a seller for this order
          const res = await ordersService.getById(Number(orderId));
          const orderData = (res as any)?.result || res;
          setData(orderData);
          const lines = await ordersService.getDetailsByOrderId(
            Number(orderId)
          );
          setDetails(lines);
          return;
        }
      } catch (e: any) {
        setError(e?.message || "Không tải được chi tiết đơn");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, user?.role, reloadTick]);

  // Function to handle tracking click based on order status
  const handleTrackingClick = async () => {
    const isPaid =
      data.paymentStatus === "Paid" || data.paymentStatus === "paid";
    const isProcessing = data.status === "processing";
    const fulfillmentStatus = data.fulfillmentStatus || "None";

    // If order is paid but fulfillment is None/Processing, show waiting dialog
    if (
      isPaid &&
      isProcessing &&
      (fulfillmentStatus === "None" || fulfillmentStatus === "Processing")
    ) {
      setShowTrackingDialog(true);
    } else {
      // For shipped/delivered orders, load tracking info and show dialog
      try {
        setTrackingLoading(true);
        setTrackingError(null);
        const info = await shipmentService.getTracking(Number(data.orderId));
        setTrackingInfo(info);
      } catch (e: any) {
        setTrackingInfo(null);
        setTrackingError(e?.message || "Không tải được thông tin vận chuyển");
      } finally {
        setShowTrackingDialog(true);
        setTrackingLoading(false);
      }
    }
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!user?.userId) {
      setReviewError("Bạn cần đăng nhập để đánh giá");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (reviewComment.length > 1000) {
      setReviewError("Nội dung đánh giá không được vượt quá 1000 ký tự");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      // For each product in order details, create a review
      for (const detail of details) {
        const itemType = String(detail.type || "").toLowerCase();

        if (itemType === "product" && detail.productId) {
          await reviewService.createReview({
            productId: detail.productId,
            comment: reviewComment,
            ratingScore: reviewRating,
          });
        } else if (itemType === "material" && detail.materialId) {
          await reviewService.createReview({
            materialId: detail.materialId,
            comment: reviewComment,
            ratingScore: reviewRating,
          });
        }
      }

      // Success - close dialog and reset form
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewRating(5);
      setHasReviewed(true); // Mark as reviewed to disable the button
      alert("Cảm ơn bạn đã đánh giá!");
    } catch (e: any) {
      console.error("Review error:", e);
      setReviewError(
        e?.response?.data?.errorMessage ||
        e?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const renderTrackingStatus = () => {
    const isPaid =
      data.paymentStatus === "Paid" || data.paymentStatus === "paid";
    const fulfillmentStatus = data.fulfillmentStatus || "None";

    if (!isPaid) {
      return <div className="font-medium text-gray-500">Chưa thanh toán</div>;
    }

    // Map fulfillment status to Vietnamese and colors
    const getStatusInfo = (status: string) => {
      switch (status.toLowerCase()) {
        case "delivered":
          return {
            text: "✅ Đã giao hàng",
            color: "#16a34a",
            bgColor: "#dcfce7",
          };
        case "shipped":
          return {
            text: "🚚 Đang vận chuyển",
            color: "#7c3aed",
            bgColor: "#ede9fe",
          };
        case "processing":
          return {
            text: "📦 Đang xử lý",
            color: "#2563eb",
            bgColor: "#dbeafe",
          };
        case "none":
        default:
          return {
            text: "⏳ Chờ xác nhận",
            color: "#d97706",
            bgColor: "#fef3c7",
          };
      }
    };

    const statusInfo = getStatusInfo(fulfillmentStatus);
    const showWaitingDialog =
      fulfillmentStatus === "None" || fulfillmentStatus === "Processing";

    return (
      <div className="font-medium flex items-center gap-2">
        <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
        <Chip
          label={showWaitingDialog ? "Xem tiến trình" : "Theo dõi vận chuyển"}
          size="small"
          icon={showWaitingDialog ? <AccessTime /> : <LocalShipping />}
          onClick={handleTrackingClick}
          sx={{
            bgcolor: statusInfo.bgColor,
            color: statusInfo.color,
            cursor: "pointer",
            "&:hover": {
              bgcolor: statusInfo.bgColor,
              opacity: 0.8,
            },
          }}
        />
      </div>
    );
  };

  if (loading)
    return (
      <div className="max-w-[1120px] mx-auto p-6">Đang tải chi tiết đơn...</div>
    );
  if (error)
    return (
      <div className="max-w-[1120px] mx-auto p-6 text-red-600">{error}</div>
    );
  if (!data) return null;
  // No  x1000 multiplier
  const subtotal = details.reduce(
    (s, d) => s + Number(d.unitPrice || 0) * Number(d.quantity || 0),
    0
  );
  const shipping = Number((data as any).shippingFee ?? 0);
  const discount = Number((data as any).discount ?? 0);
  const total = Number(
    (data as any).totalPrice ?? subtotal + shipping - discount
  );

  return (
    <div className="max-w-[1120px] mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn #{data.orderId}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!loading) setReloadTick((t) => t + 1);
            }}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? "🔄 Đang tải..." : "🔄 Làm mới"}
          </button>
          <Link to="/orders" className="text-green-700 hover:underline">
            Danh sách đơn
          </Link>
        </div>
      </div>

      {/* Thông tin người mua hàng */}
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <Person sx={{ color: "#3b82f6" }} />
          <h3 className="text-lg font-medium text-gray-900">
            Thông tin người mua
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin người dùng */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Person sx={{ color: "#3b82f6", fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tên khách hàng</div>
                <div className="font-medium text-gray-900">
                  {data.userName ||
                    user?.fullName ||
                    user?.email ||
                    "Khách hàng"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone sx={{ color: "#16a34a", fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Số điện thoại</div>
                <div className="font-medium text-gray-900">
                  {data.personalPhoneNumber || user?.phone || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            {/* Hiển thị User ID để admin/supplier/designer có thể tra cứu */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-mono text-xs font-bold">
                  #
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Mã khách hàng</div>
                <div className="font-medium text-gray-900 font-mono">
                  ID: {data.userId || user?.userId || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <LocationOn sx={{ color: "#ea580c", fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Địa chỉ giao hàng</div>
                <div className="font-medium text-gray-900 leading-relaxed">
                  {data.shippingAddress || "Chưa cập nhật địa chỉ"}
                </div>
              </div>
            </div>

            {/* Thời gian đặt hàng */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <AccessTime sx={{ color: "#4f46e5", fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Thời gian đặt hàng</div>
                <div className="font-medium text-gray-900">
                  {data.orderDate
                    ? formatViDateTime(data.orderDate)
                    : "Chưa xác định"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-md p-4 grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="font-medium">{String(data.status)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Thanh toán</div>
          <div className="font-medium">
            {String(data.paymentStatus || "Pending")}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tổng tiền</div>
          <div className="font-semibold text-green-700">
            {Number(data.totalPrice || 0).toLocaleString("vi-VN")} ₫
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trạng thái vận chuyển</div>
          {renderTrackingStatus()}
        </div>
        <div>
          <div className="text-sm text-gray-500">Ngày đặt</div>
          <div className="font-medium">
            {(data as any).orderDate
              ? formatViDateTime((data as any).orderDate)
              : "-"}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-md">
        <div className="px-4 py-3 border-b font-medium">Sản phẩm</div>
        <div className="divide-y">
          {details.map((d) => (
            <div
              key={d.orderDetailId}
              className="px-4 py-3 grid grid-cols-12 items-center gap-3"
            >
              <div className="col-span-2">
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={d.itemName}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                )}
              </div>
              <div className="col-span-4">
                <div className="font-medium">{d.itemName}</div>
                <div className="text-sm text-gray-500">
                  {d.type} • NCC/NTK: {d.providerName}
                </div>
              </div>
              <div className="col-span-2 text-gray-700">
                {Number(d.unitPrice || 0).toLocaleString("vi-VN")} ₫
              </div>
              <div className="col-span-2 text-gray-700">x {d.quantity}</div>
              <div className="col-span-2 font-semibold text-green-700">
                {(
                  Number(d.unitPrice || 0) * Number(d.quantity || 0)
                ).toLocaleString("vi-VN")}{" "}
                ₫
              </div>
            </div>
          ))}
          {details.length === 0 && (
            <div className="p-4 text-gray-500">Chưa có dòng hàng</div>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-md p-4 grid md:grid-cols-2 gap-4">
        <div className="text-sm text-gray-600">
          Tổng số dòng: <b>{details.length}</b>
        </div>
        <div className="space-y-2 text-right">
          <div>
            Tạm tính: <b>{subtotal.toLocaleString("vi-VN")} ₫</b>
          </div>
          <div>
            Phí vận chuyển: <b>{shipping.toLocaleString("vi-VN")} ₫</b>
          </div>
          <div>
            Giảm giá: <b>-{discount.toLocaleString("vi-VN")} ₫</b>
          </div>
          <div className="text-lg font-semibold text-green-700">
            Tổng cộng: {total.toLocaleString("vi-VN")} ₫
          </div>
          {/* Review button - only show when order is delivered and user is NOT the seller of this order */}
          {String(data.fulfillmentStatus || "").toLowerCase() === "delivered" &&
            !isSellerOrder && (
              <button
                onClick={() => setShowReviewDialog(true)}
                disabled={hasReviewed}
                className={`mt-4 px-4 py-2 rounded font-semibold flex items-center gap-2 ml-auto ${
                  hasReviewed
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <RateReview fontSize="small" />
                {hasReviewed ? "Đã đánh giá" : "Đánh Giá"}
              </button>
            )}
        </div>
      </div>

      {/* Tracking Status Dialog */}
      <Dialog
        open={showTrackingDialog}
        onClose={() => setShowTrackingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {["shipped", "delivered"].includes(
            String(data.fulfillmentStatus || "").toLowerCase()
          ) ? (
            <LocalShipping sx={{ color: "#7c3aed" }} />
          ) : (
            <AccessTime sx={{ color: "#d97706" }} />
          )}
          Trạng thái đơn hàng #{data.orderId}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 py-4">
            {/* Waiting/Processing content */}
            {(String(data.fulfillmentStatus || "None").toLowerCase() ===
              "none" ||
              String(data.fulfillmentStatus || "None").toLowerCase() ===
                "processing") && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <AccessTime sx={{ color: "white", fontSize: 16 }} />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-800">
                        Chờ người bán xác nhận
                      </div>
                      <div className="text-sm text-amber-600">
                        Đơn hàng đã được thanh toán và đang chờ người bán xác
                        nhận
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">
                        Đã thanh toán
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán đã được xử lý thành công
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        data.fulfillmentStatus === "Processing"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                    >
                      <AccessTime sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          data.fulfillmentStatus === "Processing"
                            ? "text-blue-700"
                            : "text-amber-700"
                        }`}
                      >
                        {data.fulfillmentStatus === "Processing"
                          ? "Đang xử lý"
                          : "Chờ xác nhận từ người bán"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.fulfillmentStatus === "Processing"
                          ? "Người bán đang chuẩn bị và đóng gói đơn hàng của bạn"
                          : "Người bán đang xem xét và chuẩn bị đơn hàng của bạn"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <LocalShipping sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">
                        Vận chuyển
                      </div>
                      <div className="text-sm text-gray-400">
                        Đơn hàng sẽ được vận chuyển sau khi người bán xác nhận
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">
                        Hoàn thành
                      </div>
                      <div className="text-sm text-gray-400">
                        Đơn hàng được giao thành công
                      </div>
                    </div>
                  </div>
                </div>

                {details.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store sx={{ color: "#3b82f6" }} />
                      <span className="font-medium text-blue-800">
                        Thông tin người bán
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[
                        ...new Set(
                          details.map((d) => d.providerName).filter(Boolean)
                        ),
                      ].map((providerName, idx) => (
                        <div key={idx} className="text-sm text-blue-700">
                          • {providerName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-2">
                    Thời gian dự kiến
                  </div>
                  <div className="text-sm text-gray-600">
                    • Xác nhận từ người bán: 1-2 ngày làm việc
                    <br />
                    • Vận chuyển: 3-7 ngày làm việc
                    <br />• Tổng thời gian: 4-9 ngày làm việc
                  </div>
                </div>
              </>
            )}

            {/* Tracking info for Shipped/Delivered */}
            {(String(data.fulfillmentStatus || "").toLowerCase() ===
              "shipped" ||
              String(data.fulfillmentStatus || "").toLowerCase() ===
                "delivered") && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      {String(data.fulfillmentStatus || "").toLowerCase() ===
                      "delivered" ? (
                        <CheckCircle sx={{ color: "white", fontSize: 16 }} />
                      ) : (
                        <LocalShipping sx={{ color: "white", fontSize: 16 }} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-purple-800">
                        {String(data.fulfillmentStatus || "").toLowerCase() ===
                        "delivered"
                          ? "Đã giao hàng"
                          : "Đang vận chuyển"}
                      </div>
                      <div className="text-sm text-purple-600">
                        {String(data.fulfillmentStatus || "").toLowerCase() ===
                        "delivered"
                          ? "Đơn hàng của bạn đã được giao thành công"
                          : "Đơn hàng đang được vận chuyển đến địa chỉ của bạn"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">
                        Đã thanh toán
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán đã được xử lý thành công
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">
                        Đang xử lý
                      </div>
                      <div className="text-sm text-gray-600">
                        Người bán đang chuẩn bị và đóng gói đơn hàng của bạn
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-4 ${
                      String(data.fulfillmentStatus || "").toLowerCase() ===
                      "delivered"
                        ? ""
                        : ""
                    }`}
                  >
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <LocalShipping sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-purple-700">
                        Đang vận chuyển
                      </div>
                      <div className="text-sm text-gray-600">
                        {trackingInfo
                          ? `Mã vận đơn: ${
                              trackingInfo.trackingNumber || "Đang cập nhật"
                            } • ${
                              trackingInfo.carrier || "Vận chuyển tiêu chuẩn"
                            }`
                          : "Đơn hàng đang được vận chuyển bởi đối tác vận chuyển"}
                      </div>
                      {trackingInfo?.estimatedDelivery && (
                        <div className="text-xs text-purple-600">
                          Dự kiến giao:{" "}
                          {new Date(
                            trackingInfo.estimatedDelivery
                          ).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                      {trackingInfo?.currentLocation && (
                        <div className="text-xs text-gray-500">
                          Vị trí: {trackingInfo.currentLocation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-4 ${
                      String(data.fulfillmentStatus || "").toLowerCase() ===
                      "delivered"
                        ? ""
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        String(data.fulfillmentStatus || "").toLowerCase() ===
                        "delivered"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <CheckCircle sx={{ color: "white", fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          String(data.fulfillmentStatus || "").toLowerCase() ===
                          "delivered"
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        Hoàn thành
                      </div>
                      <div
                        className={`text-sm ${
                          String(data.fulfillmentStatus || "").toLowerCase() ===
                          "delivered"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {String(data.fulfillmentStatus || "").toLowerCase() ===
                        "delivered"
                          ? "Đơn hàng đã được giao thành công và kích hoạt thanh toán cho người bán"
                          : "Đơn hàng sẽ được đánh dấu hoàn thành sau khi giao thành công"}
                      </div>
                      {String(data.fulfillmentStatus || "").toLowerCase() ===
                        "delivered" && (
                        <div className="text-xs text-green-600">
                          Giao thành công lúc:{" "}
                          {formatViDateTime(data.orderDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                {details.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store sx={{ color: "#3b82f6" }} />
                      <span className="font-medium text-blue-800">
                        Thông tin người bán
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[
                        ...new Set(
                          details.map((d) => d.providerName).filter(Boolean)
                        ),
                      ].map((providerName, idx) => (
                        <div key={idx} className="text-sm text-blue-700">
                          • {providerName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Time Info */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-2">
                    {String(data.fulfillmentStatus || "").toLowerCase() ===
                    "delivered"
                      ? "Thời gian hoàn thành"
                      : "Thời gian dự kiến"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {String(data.fulfillmentStatus || "").toLowerCase() ===
                    "delivered" ? (
                      <>
                        • Đơn hàng đã được giao thành công
                        <br />
                        • Thanh toán đã được chuyển cho người bán
                        <br />• Cảm ơn bạn đã mua sắm tại EcoFashion
                      </>
                    ) : (
                      <>
                        • Vận chuyển: 2-5 ngày làm việc
                        <br />
                        • Giao hàng trong khu vực nội thành
                        <br />• Liên hệ hotline nếu cần hỗ trợ
                      </>
                    )}
                  </div>
                </div>

                {/* Loading and Error States */}
                {trackingLoading && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-600">
                      Đang tải thông tin vận chuyển chi tiết...
                    </div>
                  </div>
                )}

                {trackingError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm text-orange-800">
                      <strong>Lưu ý:</strong> Không thể tải thông tin vận chuyển
                      chi tiết. Đơn hàng vẫn đang được xử lý bình thường.
                    </div>
                  </div>
                )}

                {/* Tracking History (if available) */}
                {trackingInfo &&
                  Array.isArray(trackingInfo.statusHistory) &&
                  trackingInfo.statusHistory.length > 0 && (
                    <div className="bg-white border rounded-lg">
                      <div className="px-4 py-3 border-b font-medium">
                        Lịch sử vận chuyển chi tiết
                      </div>
                      <div className="divide-y">
                        {trackingInfo.statusHistory.map((h, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 flex items-start gap-3"
                          >
                            <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {h.status}
                              </div>
                              <div className="text-sm text-gray-600">
                                {h.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(h.timestamp).toLocaleString("vi-VN")}{" "}
                                • {h.location}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTrackingDialog(false)} color="primary">
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RateReview sx={{ color: "#3b82f6" }} />
          Đánh giá đơn hàng #{data.orderId}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 py-4">
            <div>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chất lượng sản phẩm/dịch vụ
              </Typography>
              <Rating
                name="rating"
                value={reviewRating}
                onChange={(_, newValue) => {
                  setReviewRating(newValue || 1);
                }}
                size="large"
                sx={{ fontSize: "2.5rem" }}
              />
              <Typography variant="caption" color="text.secondary">
                {reviewRating === 5 && "Tuyệt vời"}
                {reviewRating === 4 && "Rất tốt"}
                {reviewRating === 3 && "Tốt"}
                {reviewRating === 2 && "Trung bình"}
                {reviewRating === 1 && "Kém"}
              </Typography>
            </div>

            <div>
              <TextField
                label="Nội dung đánh giá"
                multiline
                rows={4}
                fullWidth
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm/dịch vụ..."
                helperText={`${reviewComment.length}/1000 ký tự`}
                inputProps={{ maxLength: 1000 }}
              />
            </div>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Typography variant="body2" color="error">
                  {reviewError}
                </Typography>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Typography variant="caption" color="text.secondary">
                💡 Đánh giá của bạn sẽ được áp dụng cho tất cả sản phẩm trong đơn hàng này
              </Typography>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowReviewDialog(false)}
            color="inherit"
            disabled={reviewLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReviewSubmit}
            variant="contained"
            color="primary"
            disabled={reviewLoading}
            startIcon={<RateReview />}
          >
            {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
