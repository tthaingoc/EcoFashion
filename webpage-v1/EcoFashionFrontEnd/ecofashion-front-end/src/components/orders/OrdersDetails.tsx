import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/api/ordersService';
import { shipmentService, ShipmentTrackingResponse } from '../../services/api/shipmentService';
import { formatViDateTime } from '../../utils/date';
import { paymentsService } from '../../services/api/paymentsService';
import { Button, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { LocalShipping, Visibility, AccessTime, CheckCircle, Store } from '@mui/icons-material';

export default function OrdersDetails() {
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  
  const handlePayWithWallet = async () => {
    setPayLoading(true);
    setPayError(null);
    try {
      // Với logic idempotency: chuyển thẳng về trang checkout tiêu chuẩn
      // Trang CheckoutTailwind sẽ dùng orderId để load đơn và thanh toán bằng ví
      navigate(`/checkout?orderId=${data.orderId}`);
    } catch (e: any) {
      setPayError(e?.message || 'Không thể chuyển đến trang thanh toán');
    } finally {
      setPayLoading(false);
    }
  };
  
  const { orderId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<ShipmentTrackingResponse | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!orderId) return;
        const res = await ordersService.getById(Number(orderId));
        setData((res as any)?.result || res);
        const lines = await ordersService.getDetailsByOrderId(Number(orderId));
        setDetails(lines);
      } catch (e: any) {
        setError(e?.message || 'Không tải được chi tiết đơn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  // Function to handle tracking click based on order status
  const handleTrackingClick = async () => {
    const isPaid = data.paymentStatus === 'Paid' || data.paymentStatus === 'paid';
    const isProcessing = data.status === 'processing';
    const fulfillmentStatus = data.fulfillmentStatus || 'None';
    
    // If order is paid but fulfillment is None/Processing, show waiting dialog
    if (isPaid && isProcessing && (fulfillmentStatus === 'None' || fulfillmentStatus === 'Processing')) {
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
        setTrackingError(e?.message || 'Không tải được thông tin vận chuyển');
      } finally {
        setShowTrackingDialog(true);
        setTrackingLoading(false);
      }
    }
  };

  const renderTrackingStatus = () => {
    const isPaid = data.paymentStatus === 'Paid' || data.paymentStatus === 'paid';
    const fulfillmentStatus = data.fulfillmentStatus || 'None';
    
    if (!isPaid) {
      return (
        <div className="font-medium text-gray-500">
          Chưa thanh toán
        </div>
      );
    }
    
    // Map fulfillment status to Vietnamese and colors
    const getStatusInfo = (status: string) => {
      switch (status.toLowerCase()) {
        case 'delivered':
          return { text: '✅ Đã giao hàng', color: '#16a34a', bgColor: '#dcfce7' };
        case 'shipped':
          return { text: '🚚 Đang vận chuyển', color: '#7c3aed', bgColor: '#ede9fe' };
        case 'processing':
          return { text: '📦 Đang xử lý', color: '#2563eb', bgColor: '#dbeafe' };
        case 'none':
        default:
          return { text: '⏳ Chờ xác nhận', color: '#d97706', bgColor: '#fef3c7' };
      }
    };
    
    const statusInfo = getStatusInfo(fulfillmentStatus);
    const showWaitingDialog = fulfillmentStatus === 'None' || fulfillmentStatus === 'Processing';
    
    return (
      <div className="font-medium flex items-center gap-2">
        <span style={{ color: statusInfo.color }}>
          {statusInfo.text}
        </span>
        <Chip
          label={showWaitingDialog ? "Xem tiến trình" : "Theo dõi vận chuyển"}
          size="small"
          icon={showWaitingDialog ? <AccessTime /> : <LocalShipping />}
          onClick={handleTrackingClick}
          sx={{ 
            bgcolor: statusInfo.bgColor, 
            color: statusInfo.color,
            cursor: 'pointer',
            '&:hover': { 
              bgcolor: statusInfo.bgColor,
              opacity: 0.8
            }
          }}
        />
      </div>
    );
  };

  if (loading) return <div className="max-w-[1120px] mx-auto p-6">Đang tải chi tiết đơn...</div>;
  if (error) return <div className="max-w-[1120px] mx-auto p-6 text-red-600">{error}</div>;
  if (!data) return null;
  // No more x1000 multiplier since backend has correct VND prices
  const subtotal = details.reduce((s, d) => s + Number(d.unitPrice || 0) * Number(d.quantity || 0), 0);
  const shipping = Number((data as any).shippingFee ?? 0);
  const discount = Number((data as any).discount ?? 0);
  const total = Number((data as any).totalPrice ?? (subtotal + shipping - discount));

  return (
    <div className="max-w-[1120px] mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn #{data.orderId}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (orderId && !loading) {
                const load = async () => {
                  try {
                    setLoading(true);
                    const res = await ordersService.getById(Number(orderId));
                    setData((res as any)?.result || res);
                    const lines = await ordersService.getDetailsByOrderId(Number(orderId));
                    setDetails(lines);
                  } catch (e: any) {
                    setError(e?.message || 'Không tải được chi tiết đơn');
                  } finally {
                    setLoading(false);
                  }
                };
                load();
              }
            }}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
          </button>
          <Link to="/orders" className="text-green-700 hover:underline">Danh sách đơn</Link>
        </div>
      </div>
      <div className="bg-white border rounded-md p-4 grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="font-medium">{String(data.status)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Thanh toán</div>
          <div className="font-medium">{String(data.paymentStatus || 'Pending')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tổng tiền</div>
          <div className="font-semibold text-green-700">{Number(data.totalPrice || 0).toLocaleString('vi-VN')} ₫</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trạng thái vận chuyển</div>
          {renderTrackingStatus()}
        </div>
        <div>
          <div className="text-sm text-gray-500">Ngày đặt</div>
          <div className="font-medium">{(data as any).orderDate ? formatViDateTime((data as any).orderDate) : '-'}</div>
        </div>
      </div>

      <div className="bg-white border rounded-md">
        <div className="px-4 py-3 border-b font-medium">Sản phẩm</div>
        <div className="divide-y">
          {details.map((d) => (
            <div key={d.orderDetailId} className="px-4 py-3 grid grid-cols-12 items-center gap-3">
              <div className="col-span-2">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.itemName} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                )}
              </div>
              <div className="col-span-4">
                <div className="font-medium">{d.itemName}</div>
                <div className="text-sm text-gray-500">{d.type} • NCC/NTK: {d.providerName}</div>
              </div>
              <div className="col-span-2 text-gray-700">{Number(d.unitPrice || 0).toLocaleString('vi-VN')} ₫</div>
              <div className="col-span-2 text-gray-700">x {d.quantity}</div>
              <div className="col-span-2 font-semibold text-green-700">{(Number(d.unitPrice || 0) * Number(d.quantity || 0)).toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          {details.length === 0 && (
            <div className="p-4 text-gray-500">Chưa có dòng hàng</div>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-md p-4 grid md:grid-cols-2 gap-4">
        <div className="text-sm text-gray-600">Tổng số dòng: <b>{details.length}</b></div>
        <div className="space-y-2 text-right">
          <div>Tạm tính: <b>{subtotal.toLocaleString('vi-VN')} ₫</b></div>
          <div>Phí vận chuyển: <b>{shipping.toLocaleString('vi-VN')} ₫</b></div>
          <div>Giảm giá: <b>-{discount.toLocaleString('vi-VN')} ₫</b></div>
          <div className="text-lg font-semibold text-green-700">Tổng cộng: {total.toLocaleString('vi-VN')} ₫</div>
          {(String(data.paymentStatus).toLowerCase() !== 'paid' && String(data.paymentStatus).toLowerCase() !== 'success') && (
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-60"
              onClick={handlePayWithWallet}
              disabled={payLoading}
            >
              {payLoading ? 'Đang chuyển...' : 'Thanh toán bằng ví'}
            </button>
          )}
          {payError && <div className="text-red-600 mt-2">{payError}</div>}
        </div>
      </div>

      {/* Tracking Status Dialog */}
      <Dialog 
        open={showTrackingDialog} 
        onClose={() => setShowTrackingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {(['shipped','delivered'].includes(String(data.fulfillmentStatus || '').toLowerCase()))
            ? <LocalShipping sx={{ color: '#7c3aed' }} />
            : <AccessTime sx={{ color: '#d97706' }} />}
          Trạng thái đơn hàng #{data.orderId}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 py-4">
            {/* Waiting/Processing content */}
            {(String(data.fulfillmentStatus || 'None').toLowerCase() === 'none' || String(data.fulfillmentStatus || 'None').toLowerCase() === 'processing') && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <AccessTime sx={{ color: 'white', fontSize: 16 }} />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-800">Chờ người bán xác nhận</div>
                      <div className="text-sm text-amber-600">Đơn hàng đã được thanh toán và đang chờ người bán xác nhận</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">Đã thanh toán</div>
                      <div className="text-sm text-gray-600">Thanh toán đã được xử lý thành công</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      data.fulfillmentStatus === 'Processing' 
                        ? 'bg-blue-500' 
                        : 'bg-amber-500'
                    }`}>
                      <AccessTime sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        data.fulfillmentStatus === 'Processing' 
                          ? 'text-blue-700' 
                          : 'text-amber-700'
                      }`}>
                        {data.fulfillmentStatus === 'Processing' 
                          ? 'Đang xử lý' 
                          : 'Chờ xác nhận từ người bán'
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.fulfillmentStatus === 'Processing' 
                          ? 'Người bán đang chuẩn bị và đóng gói đơn hàng của bạn'
                          : 'Người bán đang xem xét và chuẩn bị đơn hàng của bạn'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <LocalShipping sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">Vận chuyển</div>
                      <div className="text-sm text-gray-400">Đơn hàng sẽ được vận chuyển sau khi người bán xác nhận</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">Hoàn thành</div>
                      <div className="text-sm text-gray-400">Đơn hàng được giao thành công</div>
                    </div>
                  </div>
                </div>

                {details.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store sx={{ color: '#3b82f6' }} />
                      <span className="font-medium text-blue-800">Thông tin người bán</span>
                    </div>
                    <div className="space-y-1">
                      {[...new Set(details.map(d => d.providerName).filter(Boolean))].map((providerName, idx) => (
                        <div key={idx} className="text-sm text-blue-700">
                          • {providerName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-2">Thời gian dự kiến</div>
                  <div className="text-sm text-gray-600">
                    • Xác nhận từ người bán: 1-2 ngày làm việc<br/>
                    • Vận chuyển: 3-7 ngày làm việc<br/>
                    • Tổng thời gian: 4-9 ngày làm việc
                  </div>
                </div>
              </>
            )}

            {/* Tracking info for Shipped/Delivered */}
            {(String(data.fulfillmentStatus || '').toLowerCase() === 'shipped' || String(data.fulfillmentStatus || '').toLowerCase() === 'delivered') && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 
                        <CheckCircle sx={{ color: 'white', fontSize: 16 }} /> :
                        <LocalShipping sx={{ color: 'white', fontSize: 16 }} />
                      }
                    </div>
                    <div>
                      <div className="font-semibold text-purple-800">{String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 'Đã giao hàng' : 'Đang vận chuyển'}</div>
                      <div className="text-sm text-purple-600">
                        {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 
                          'Đơn hàng của bạn đã được giao thành công' :
                          'Đơn hàng đang được vận chuyển đến địa chỉ của bạn'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">Đã thanh toán</div>
                      <div className="text-sm text-gray-600">Thanh toán đã được xử lý thành công</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">Đang xử lý</div>
                      <div className="text-sm text-gray-600">Người bán đang chuẩn bị và đóng gói đơn hàng của bạn</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 ${String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? '' : ''}`}>
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <LocalShipping sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-purple-700">Đang vận chuyển</div>
                      <div className="text-sm text-gray-600">
                        {trackingInfo ? 
                          `Mã vận đơn: ${trackingInfo.trackingNumber || 'Đang cập nhật'} • ${trackingInfo.carrier || 'Vận chuyển tiêu chuẩn'}` :
                          'Đơn hàng đang được vận chuyển bởi đối tác vận chuyển'
                        }
                      </div>
                      {trackingInfo?.estimatedDelivery && (
                        <div className="text-xs text-purple-600">Dự kiến giao: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('vi-VN')}</div>
                      )}
                      {trackingInfo?.currentLocation && (
                        <div className="text-xs text-gray-500">Vị trí: {trackingInfo.currentLocation}</div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 ${String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? '' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <CheckCircle sx={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        Hoàn thành
                      </div>
                      <div className={`text-sm ${
                        String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 
                          'Đơn hàng đã được giao thành công và kích hoạt thanh toán cho người bán' :
                          'Đơn hàng sẽ được đánh dấu hoàn thành sau khi giao thành công'
                        }
                      </div>
                      {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' && (
                        <div className="text-xs text-green-600">Giao thành công lúc: {formatViDateTime(data.orderDate)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                {details.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store sx={{ color: '#3b82f6' }} />
                      <span className="font-medium text-blue-800">Thông tin người bán</span>
                    </div>
                    <div className="space-y-1">
                      {[...new Set(details.map(d => d.providerName).filter(Boolean))].map((providerName, idx) => (
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
                    {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? 'Thời gian hoàn thành' : 'Thời gian dự kiến'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {String(data.fulfillmentStatus || '').toLowerCase() === 'delivered' ? (
                      <>
                        • Đơn hàng đã được giao thành công<br/>
                        • Thanh toán đã được chuyển cho người bán<br/>
                        • Cảm ơn bạn đã mua sắm tại EcoFashion
                      </>
                    ) : (
                      <>
                        • Vận chuyển: 2-5 ngày làm việc<br/>
                        • Giao hàng trong khu vực nội thành<br/>
                        • Liên hệ hotline nếu cần hỗ trợ
                      </>
                    )}
                  </div>
                </div>

                {/* Loading and Error States */}
                {trackingLoading && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-600">Đang tải thông tin vận chuyển chi tiết...</div>
                  </div>
                )}

                {trackingError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm text-orange-800">
                      <strong>Lưu ý:</strong> Không thể tải thông tin vận chuyển chi tiết. Đơn hàng vẫn đang được xử lý bình thường.
                    </div>
                  </div>
                )}

                {/* Tracking History (if available) */}
                {trackingInfo && Array.isArray(trackingInfo.statusHistory) && trackingInfo.statusHistory.length > 0 && (
                  <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b font-medium">Lịch sử vận chuyển chi tiết</div>
                    <div className="divide-y">
                      {trackingInfo.statusHistory.map((h, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{h.status}</div>
                            <div className="text-sm text-gray-600">{h.description}</div>
                            <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString('vi-VN')} • {h.location}</div>
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

    </div>
  );
}


