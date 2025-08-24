import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/api/ordersService';
import { formatViDateTime } from '../../utils/date';
import { paymentsService } from '../../services/api/paymentsService';
import { Button, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { LocalShipping, Visibility, AccessTime, CheckCircle, Store } from '@mui/icons-material';
import OrderProgressModal from './OrderProgressModal';

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
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [hasMixedSellers, setHasMixedSellers] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!orderId) return;
        const res = await ordersService.getById(Number(orderId));
        setData((res as any)?.result || res);
        const lines = await ordersService.getDetailsByOrderId(Number(orderId));
        setDetails(lines);
        
        // Check if order has items from multiple sellers
        const uniqueProviders = new Set(lines.map(d => d.providerName).filter(Boolean));
        setHasMixedSellers(uniqueProviders.size > 1);
      } catch (e: any) {
        setError(e?.message || 'Không tải được chi tiết đơn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  // Function to handle tracking click based on order status
  const handleTrackingClick = () => {
    const isPaid = data.paymentStatus === 'Paid' || data.paymentStatus === 'paid';
    const isProcessing = data.status === 'processing';
    const fulfillmentStatus = data.fulfillmentStatus || 'None';
    
    // For mixed orders with partial fulfillment, show progress modal
    if (hasMixedSellers && isPaid && (['None', 'Processing', 'PartiallyConfirmed', 'PartiallyShipped'].includes(fulfillmentStatus))) {
      setShowProgressModal(true);
    }
    // If order is paid but fulfillment is None/Processing, show waiting dialog
    else if (isPaid && isProcessing && (fulfillmentStatus === 'None' || fulfillmentStatus === 'Processing')) {
      setShowTrackingDialog(true);
    } else {
      // For shipped/delivered orders, redirect to tracking page
      window.open(`/shipment/track/${data.orderId}`, '_blank');
    }
  };

  const renderTrackingStatus = () => {
    const isPaid = data.paymentStatus === 'Paid' || data.paymentStatus === 'paid';
    const isProcessing = data.status === 'processing';
    const fulfillmentStatus = data.fulfillmentStatus || 'None';
    
    if (!isPaid) {
      return (
        <div className="font-medium text-gray-500">
          Chưa thanh toán
        </div>
      );
    }
    
    // For mixed orders with partial fulfillment statuses
    if (hasMixedSellers && isPaid && (['None', 'Processing', 'PartiallyConfirmed', 'PartiallyShipped'].includes(fulfillmentStatus))) {
      const getStatusText = () => {
        switch (fulfillmentStatus) {
          case 'PartiallyConfirmed': return 'Một phần đã xác nhận';
          case 'PartiallyShipped': return 'Một phần đã gửi';
          default: return 'Chờ người bán xác nhận';
        }
      };
      
      return (
        <div className="font-medium flex items-center gap-2">
          <span className="text-amber-600">{getStatusText()}</span>
          {hasMixedSellers && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
              Mixed Order
            </span>
          )}
          <Chip
            label="Chi tiết tiến độ"
            size="small"
            icon={<Visibility />}
            onClick={handleTrackingClick}
            sx={{ 
              bgcolor: '#f3e8ff', 
              color: '#7c3aed',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#e9d5ff' }
            }}
          />
        </div>
      );
    }
    
    if (isPaid && isProcessing && (fulfillmentStatus === 'None' || fulfillmentStatus === 'Processing')) {
      return (
        <div className="font-medium flex items-center gap-2">
          <span className="text-amber-600">Chờ người bán xác nhận</span>
          <Chip
            label="Theo dõi vận chuyển"
            size="small"
            icon={<AccessTime />}
            onClick={handleTrackingClick}
            sx={{ 
              bgcolor: '#fef3c7', 
              color: '#d97706',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#fde68a' }
            }}
          />
        </div>
      );
    }
    
    // For other statuses (shipped, delivered, etc.)
    return (
      <div className="font-medium flex items-center gap-2">
        {fulfillmentStatus && fulfillmentStatus !== 'None' ? String(fulfillmentStatus) : 'Chưa cập nhật'}
        <Chip
          label="Theo dõi vận chuyển"
          size="small"
          icon={<LocalShipping />}
          onClick={handleTrackingClick}
          sx={{ 
            bgcolor: '#dcfce7', 
            color: '#16a34a',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#bbf7d0' }
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
        <Link to="/orders" className="text-green-700 hover:underline">Danh sách đơn</Link>
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
          <AccessTime sx={{ color: '#d97706' }} />
          Trạng thái đơn hàng #{data.orderId}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 py-4">
            {/* Current Status */}
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
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <AccessTime sx={{ color: 'white', fontSize: 14 }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-amber-700">Chờ xác nhận từ người bán</div>
                  <div className="text-sm text-gray-600">Người bán đang xem xét và chuẩn bị đơn hàng của bạn</div>
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

            {/* Seller Information */}
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

            {/* Expected Timeline */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="font-medium text-gray-800 mb-2">Thời gian dự kiến</div>
              <div className="text-sm text-gray-600">
                • Xác nhận từ người bán: 1-2 ngày làm việc<br/>
                • Vận chuyển: 3-7 ngày làm việc<br/>
                • Tổng thời gian: 4-9 ngày làm việc
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTrackingDialog(false)} color="primary">
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Progress Modal for Mixed Orders */}
      <OrderProgressModal
        orderId={Number(orderId)}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />
    </div>
  );
}


